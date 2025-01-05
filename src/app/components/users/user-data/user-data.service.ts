import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { IS_DEV_MODE } from 'src/app/app.module';
import {
  costoStorico,
  UserModelWithInterventi,
} from 'src/app/shared/models/custom-interfaces';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import { UserCacheService } from 'src/app/shared/services/user-cache.service';
import {
  calculateIncassoInterventov2,
  calculateMese,
  FileUpload,
} from 'src/app/shared/utils/common-utils';
import { prodottiAggiuntivi } from '../../../shared/models/prodotti-aggiuntivi.model';
import { SpecificDataModel } from '../../../shared/models/specific-data.model';
import { UserModel } from '../../../shared/models/user-data.model';
import { FirebaseStoreService } from '../../../shared/services/firebase/firebase-store.service';
import { AuthService } from '../../login/auth.service';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  locale = 'it-IT';
  // prettier-ignore
  specificDataSubject: BehaviorSubject<SpecificDataModel[]> = new BehaviorSubject<SpecificDataModel[]>([]);
  // prettier-ignore
  private usersSubject: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);
  // prettier-ignore
  public interventiCountsSubject: BehaviorSubject<{ [userId: number]: number; }> = new BehaviorSubject<{ [userId: number]: number }>({});
  // prettier-ignore
  public usersWithInterventiSubject: BehaviorSubject<UserModelWithInterventi[]> = new BehaviorSubject<UserModelWithInterventi[]>([]);

  // Combinazione degli Observables
  users: UserModel[] = [];
  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService,
    private userCacheService: UserCacheService,
    @Inject(IS_DEV_MODE) public isDevMode: boolean
  ) {}

  fetchUsersWithInterventi(): Observable<UserModelWithInterventi[]> {
    return this.firebaseStoreService
      .GetUserList()
      .snapshotChanges()
      .pipe(
        map((data) => {
          const userModel: UserModel[] = [];
          const usersWithInterventi: UserModelWithInterventi[] = [];
          const interventiCounts: { [userId: number]: number } = {};
          data.forEach((item) => {
            let a = item.payload.toJSON();
            a['$key'] = item.key;
            let b = a as UserModel;
            if (!b.specific_data) {
              b.specific_data = [];
            }
            delete b['$key'];
            userModel.push(b);
            let interventiCount = this.getTotalInterventi(b);
            interventiCounts[b.id] = interventiCount;
            let _userWithIntervento = {
              ...b,
              interventiCount: interventiCount,
            };
            usersWithInterventi.push(_userWithIntervento);
          });
          this.users = userModel;
          this.interventiCountsSubject.next(interventiCounts);
          this.usersWithInterventiSubject.next(usersWithInterventi);
          return usersWithInterventi;
        })
      );
  }

  setUsersWithInterventi(data: UserModelWithInterventi[]): void {
    this.usersWithInterventiSubject.next(data);
  }

  getUsersWithInterventiObservable(): Observable<UserModelWithInterventi[]> {
    return this.usersWithInterventiSubject.asObservable();
  }

  setStandardUsers() {
    this.usersSubject.next(this.users.slice());
  }

  getUserDatas() {
    return this.users.slice();
  }

  getUserData(id: number) {
    if (this.users.length === 0) {
      let user = this.firebaseStoreService.GetUser(id);

      user.snapshotChanges().pipe(
        map((data) => {
          let a = data.payload.toJSON();
          return a as UserModel;
        })
      );
    } else {
      let user: UserModel[] = this.users.filter(function (user) {
        return user.id === id;
      });
      return user[0];
    }
  }
  getTotalInterventi(user: UserModel): number {
    return Object.keys(user.specific_data).length || 0;
  }

  addUser(userModel: UserModel) {
    if (userModel['interventiCount']) {
      delete userModel['interventiCount'];
    }
    userModel.id = this.getLastId() + 1;
    userModel.utenteInserimento = this.authService.getUserState().displayName;
    userModel.dataInserimento = new Date().toLocaleDateString(this.locale);
    let u = new UserModel(userModel);
    this.users.push(u);
    let idReturned = this.firebaseStoreService.AddUser(u);
    this.usersSubject.next(this.users.slice());
    this.updateUsersWithInterventi();
    return idReturned;
  }

  deleteUser(id: number) {
    this.users = this.users.filter((user) => user.id !== id);
    this.firebaseStoreService.DeleteUser(id.toString());
    this.usersSubject.next(this.users.slice());
    this.updateUsersWithInterventi();
  }

  editUser(userModel: UserModel) {
    if (userModel['interventiCount']) {
      delete userModel['interventiCount'];
    }
    userModel.ultimoUtenteModifica =
      this.authService.getUserState().displayName;
    this.firebaseStoreService.UpdateUser(userModel);
    const index = this.users.findIndex((item) => item.id === userModel.id);
    if (index !== -1) {
      this.users[index] = userModel;
    }
    this.usersSubject.next(this.users.slice());
    this.updateUsersWithInterventi();
  }

  private updateUsersWithInterventi() {
    const usersWithInterventi = this.users.map((user) => ({
      ...user,
      interventiCount: this.getTotalInterventi(user),
    }));
    this.usersWithInterventiSubject.next(usersWithInterventi);
  }

  async addNewIntervento(
    specific_data: SpecificDataModel,
    user_input?: UserModel,
    prodottiAggiuntivi?: prodottiAggiuntivi[],
    uploadedFiles?: FileUpload[]
  ): Promise<boolean> {
    if (uploadedFiles.length) {
      specific_data.files = [...uploadedFiles];
    }
    // verifica se ho modello UserInput in input uso quello altrimenti recupero da users
    let user_work: UserModel = user_input;
    if (user_work.specific_data) {
      specific_data.id =
        this.getLastIdSpecificData(user_work.specific_data) + 1;
    } else {
      user_work.specific_data = [];
      specific_data.id = 1;
    }
    // Verifica imei intervento e rimozione di una quantità se vendita
    if (specific_data.imei && specific_data.tipo_intervento === 'Vendita') {
      let data: InventarioItemModel =
        await this.firebaseStoreService.imeiArticolo(specific_data.imei);
      if (!data) {
        return false;
      }
      let articolo: InventarioItemModel = Object.values(
        data
      )[0] as InventarioItemModel;
      // Verifica se articolo è disponibile
      if (articolo.quantita > 0) {
        articolo.quantita -= 1;
        this.firebaseStoreService.updateArticoloImei(
          specific_data.imei,
          articolo
        );
      } else {
        return false;
      }
    }
    // Aggiunta data intervento
    specific_data.data_intervento = new Date().toString();
    // Aggiunta prodotti aggiuntivi se passati in input
    prodottiAggiuntivi
      ? (specific_data.prodottiAggiuntivi = prodottiAggiuntivi)
      : null;
    // Aggiunta Incasso dato che ho aggiunto un intervento
    let incassoIntervento = await calculateIncassoInterventov2(
      specific_data,
      this.firebaseStoreService
    );

    // Generazione ID univoco se sono in Vendita o Riparazione con data restituz. valorizzata
    if (
      specific_data.tipo_intervento === 'Vendita' ||
      (specific_data.tipo_intervento === 'Riparazione' &&
        specific_data.data_rest_dispositivo_cliente)
    ) {
      specific_data.idDbIncasso = this.firebaseStoreService.generateId();
      specific_data.incassov2 = incassoIntervento;
      // Nuovo sistema incasso
      this.firebaseStoreService.AddIncassov2(
        specific_data.idDbIncasso,
        specific_data.incassov2
      );
    }
    let t: SpecificDataModel[] = Object.values(user_work.specific_data);
    t.push(specific_data);
    user_work.specific_data = t;
    user_work.ultimoUtenteModifica =
      this.authService.getUserState().displayName;
    user_work.utenteInserimento = this.authService.getUserState().displayName;
    this.updateInterventiCounts(user_work.id, user_work.specific_data);
    this.firebaseStoreService.UpdateUser(user_work);
    return true;
  }

  async modifyIntervento(
    id_intervento: number,
    specific_data_input: SpecificDataModel,
    prodotti_aggiuntivi_input: prodottiAggiuntivi[],
    user_input?: UserModel,
    uploadedFiles?: FileUpload[]
  ) {
    specific_data_input.id = id_intervento;
    specific_data_input.prodottiAggiuntivi = prodotti_aggiuntivi_input;
    let spec_retrieved: SpecificDataModel[] = Object.values(
      user_input.specific_data
    );
    for (let i = 0; i < spec_retrieved.length; i++) {
      let specific_data = spec_retrieved[i];
      if (specific_data.id === id_intervento) {
        // Aggiorno Incasso v2
        try {
          if (
            specific_data_input.tipo_intervento === 'Vendita' ||
            (specific_data_input.tipo_intervento === 'Riparazione' &&
              specific_data_input.data_rest_dispositivo_cliente)
          ) {
            const incassov2 = await calculateIncassoInterventov2(
              specific_data_input,
              this.firebaseStoreService
            );
            // Safeguard per Incasso v2 per interventi che non hanno idDbIncasso
            debugger;
            if (!specific_data.idDbIncasso) {
              specific_data_input.idDbIncasso =
                this.firebaseStoreService.generateId();
              specific_data_input.incassov2 = incassov2;
            } else {
              specific_data_input.idDbIncasso = specific_data.idDbIncasso;
            }

            this.firebaseStoreService.UpdateIncassov2(
              specific_data_input.idDbIncasso,
              incassov2
            );
          }

          specific_data_input.data_intervento = specific_data.data_intervento;
          if (specific_data_input.files === undefined) {
            specific_data_input.files = [];
          }
          specific_data_input.files = uploadedFiles;
          spec_retrieved[i] = new SpecificDataModel(specific_data_input);
        } catch (error) {
          console.error('Error updating incasso v2:', error);
        }
      }
    }
    user_input.specific_data = spec_retrieved;
    this.firebaseStoreService.UpdateUser(user_input);
  }

  deleteIntervento(id_intervento: number, user_input: UserModel) {
    let spec_retrieved: SpecificDataModel[] = Object.values(
      user_input.specific_data
    );
    let i = spec_retrieved.filter(function (data) {
      return data.id === id_intervento;
    });

    // Recupero dati per Incasso e lo cancello
    let single = spec_retrieved[spec_retrieved.indexOf(i[0])];
    // Rimuovo Incasso v2
    if (single.idDbIncasso) {
      this.firebaseStoreService.deleteIncassov2(single.idDbIncasso);
    } else {
      console.log('non è presente idDbIncasso, intervento non con IncassoV2');
    }
    // update User dato che ho cancellato un intervento
    spec_retrieved.splice(spec_retrieved.indexOf(i[0]), 1);
    user_input.specific_data = spec_retrieved;
    this.updateInterventiCounts(user_input.id, user_input.specific_data);
    this.firebaseStoreService.UpdateUser(user_input);
  }

  // Aggiornamento interventiCounts
  updateInterventiCounts(id: number, specific_data: SpecificDataModel[]) {
    let lastValueInterventiCounts = this.interventiCountsSubject.getValue();
    lastValueInterventiCounts[id] = specific_data.length;
    this.interventiCountsSubject.next(lastValueInterventiCounts);
  }

  getLastIdSpecificData(specific_data: SpecificDataModel[]): number {
    let spec = Object.values(specific_data);
    return spec[spec.length - 1].id;
  }

  getListOfSpecificData(id_user: number) {
    let user: UserModel[] = this.users.filter(function (user) {
      return user.id === id_user;
    });

    //check if specificData is empty
    if (Object.keys(user[0].specific_data).length === 0) {
      return null;
    } else {
      return this.users[id_user].specific_data;
    }
  }

  deleteSpecificData(id_user: number, id_intervento: number) {
    this.users[id_user].specific_data = this.users[
      id_user
    ].specific_data.filter(function (intervento) {
      return intervento.id !== id_intervento;
    });

    this.specificDataSubject.next(this.users[id_user].specific_data.slice());
  }

  getLastId() {
    if (this.users.length <= 0) {
      return 0;
    } else {
      return this.users[this.users.length - 1].id;
    }
  }
}
