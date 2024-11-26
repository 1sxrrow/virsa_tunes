import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, Subject } from 'rxjs';
import { costoStorico } from 'src/app/shared/models/costoStorico.model';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import {
  calculateIncassoInterventov2,
  calculateMese,
  FileUpload,
} from 'src/app/shared/utils/common-utils';
import { prodottiAggiuntivi } from '../../../shared/models/prodotti-aggiuntivi.model';
import { SpecificDataModel } from '../../../shared/models/specific-data.model';
import { UserModel } from '../../../shared/models/user-data.model';
import { FirebaseStoreService } from '../../../shared/services/firebase/firebase-store.service';
import {
  canaleComunicazione,
  condizioniProdotto,
  garanzia,
  negozioInventario,
  tipoIntervento,
  tipoPagamento,
  tipoParte,
} from '../../../shared/utils/common-enums';
import { AuthService } from '../../login/auth.service';

interface UserModelWithInterventi extends UserModel {
  interventiCount: number;
}

@Injectable({ providedIn: 'root' })
export class UserDataService {
  locale = 'it-IT';
  // prettier-ignore
  specificDataSubject: BehaviorSubject<SpecificDataModel[]> = new BehaviorSubject<SpecificDataModel[]>([]);
  // prettier-ignore
  private usersSubject: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);
  // prettier-ignore
  private interventiCountsSubject: BehaviorSubject<{ [userId: number]: number; }> = new BehaviorSubject<{ [userId: number]: number }>({});

  // Combinazione degli Observables
  usersWithInterventi$ = combineLatest([
    this.usersSubject.asObservable(),
    this.interventiCountsSubject.asObservable(),
  ]).pipe(
    map(([users, interventiCounts]) =>
      users.map((user) => ({
        ...user,
        interventiCount: interventiCounts[user.id] || 0,
      }))
    )
  );
  users: UserModel[] = [];

  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService
  ) {
    this.firebaseStoreService
      .GetUserList()
      .snapshotChanges()
      .pipe(
        map((data) => {
          const users: UserModel[] = [];
          const interventiCounts: { [userId: number]: number } = {};
          data.forEach((item) => {
            let a = item.payload.toJSON();
            a['$key'] = item.key;
            let b = a as UserModel;
            if (!b.specific_data) {
              b.specific_data = [];
            }
            users.push(b);

            // 3. Calcola il numero di interventi per ogni utente
            interventiCounts[b.id] = this.getTotalInterventi(b);
          });
          return { users, interventiCounts };
        })
      )
      .subscribe(({ users, interventiCounts }) => {
        this.usersSubject.next(users);
        this.interventiCountsSubject.next(interventiCounts);
      });
  }

  getUsersWithInterventiObservable(): Observable<UserModelWithInterventi[]> {
    return this.usersWithInterventi$;
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
    userModel.id = this.getLastId() + 1;
    userModel.utenteInserimento = this.authService.getUserState().displayName;
    userModel.dataInserimento = new Date().toLocaleDateString(this.locale);
    let u = new UserModel(userModel);
    this.users.push(u);
    let idReturned = this.firebaseStoreService.AddUser(u);
    this.usersSubject.next(this.users.slice());
    return idReturned;
  }

  deleteUser(id: number) {
    this.users = this.users.filter(function (user) {
      return user.id !== id;
    });
    this.firebaseStoreService.DeleteUser(id.toString());
    this.usersSubject.next(this.users.slice());
  }

  editUser(userModel: UserModel) {
    if (userModel['interventiCount']) {
      delete userModel['interventiCount'];
    }
    userModel.ultimoUtenteModifica =
      this.authService.getUserState().displayName;
    this.firebaseStoreService.UpdateUser(userModel);
    this.usersSubject.next(this.users.slice());
  }

  async addNewIntervento(
    specific_data: SpecificDataModel,
    user_input?: UserModel,
    prodottiAggiuntivi?: prodottiAggiuntivi[],
    uploadedFiles?: FileUpload[],
    listaStorico?: costoStorico[]
  ): Promise<boolean> {
    if (uploadedFiles.length) {
      specific_data.files = [...uploadedFiles];
    }
    if (listaStorico.length) {
      specific_data.listaStorico = [...listaStorico];
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

    // Generazione ID univoco
    specific_data.idDbIncasso = this.firebaseStoreService.generateId();
    specific_data.incassov2 = incassoIntervento;
    // Nuovo sistema incasso
    this.firebaseStoreService.AddIncassov2(
      specific_data.idDbIncasso,
      specific_data.incassov2
    );
    let t: SpecificDataModel[] = Object.values(user_work.specific_data);
    t.push(specific_data);
    user_work.specific_data = t;
    user_work.ultimoUtenteModifica =
      this.authService.getUserState().displayName;
    user_work.utenteInserimento = this.authService.getUserState().displayName;
    this.firebaseStoreService.UpdateUser(user_work);
    return true;
  }

  async modifyIntervento(
    id_intervento: number,
    specific_data_input: SpecificDataModel,
    prodotti_aggiuntivi_input: prodottiAggiuntivi[],
    user_input?: UserModel,
    uploadedFiles?: FileUpload[],
    listaStorico?: costoStorico[]
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
          const incassov2 = await calculateIncassoInterventov2(
            specific_data_input,
            this.firebaseStoreService
          );

          specific_data_input.idDbIncasso = specific_data.idDbIncasso;

          await this.firebaseStoreService.UpdateIncassov2(
            specific_data.idDbIncasso,
            incassov2
          );

          specific_data_input.data_intervento = specific_data.data_intervento;
          if (specific_data_input.files === undefined) {
            specific_data_input.files = [];
          }
          specific_data_input.files = uploadedFiles;
          specific_data_input.listaStorico = listaStorico;
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

    // Recupero dait per Incasso e lo cancello
    let single = spec_retrieved[spec_retrieved.indexOf(i[0])];
    let calculatedMese = calculateMese(
      new Date(spec_retrieved[spec_retrieved.indexOf(i[0])].data_intervento)
    );
    // Rimuovo Incasso v2
    this.firebaseStoreService.deleteIncassov2(single.idDbIncasso);
    // update User dato che ho cancellato un intervento
    spec_retrieved.splice(spec_retrieved.indexOf(i[0]), 1);
    user_input.specific_data = spec_retrieved;
    this.firebaseStoreService.UpdateUser(user_input);
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
