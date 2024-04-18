import { Injectable } from '@angular/core';
import { Subject, map } from 'rxjs';
import { Incasso } from 'src/app/shared/models/incasso.model';
import {
  calculateIncassoIntervento,
  calculateMese,
} from 'src/app/shared/utils/common-utils';
import { prodottiAggiuntivi } from '../../shared/models/prodotti-aggiuntivi.model';
import { SpecificDataModel } from '../../shared/models/specific-data.model';
import { UserModel } from '../../shared/models/user-data.model';
import { FirebaseStoreService } from '../../shared/services/firebase/firebase-store.service';
import {
  canaleComunicazione,
  condizioniProdotto,
  garanzia,
  tipoIntervento,
  tipoPagamento,
  tipoParte,
} from '../../shared/utils/common-enums';
import { AuthService } from '../login/auth.service';
@Injectable({ providedIn: 'root' })
export class UserDataService {
  usersChanged = new Subject<UserModel[]>();
  specificDataChanged = new Subject<SpecificDataModel[]>();
  thisUser;
  users: UserModel[] = [];
  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService
  ) {}

  public tipoIntervento = tipoIntervento;
  public canaleComunicazione = canaleComunicazione;
  public tipoPagamento = tipoPagamento;
  public condizioniProdotto = condizioniProdotto;
  public mesiGaranzia = garanzia;
  public tipoParte = tipoParte;

  setStandardUsers() {
    this.usersChanged.next(this.users.slice());
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

  getTotalInterventi(id: number) {
    let user: UserModel[] = this.users.filter(function (user) {
      return user.id === id;
    });
    let s = user[0].specific_data;
    if (typeof s === null || s === undefined) {
      return 0;
    } else {
      return Object.keys(s).length;
    }
  }

  addUser(userModel: UserModel) {
    console.log(userModel);
    debugger;
    userModel.id = this.getLastId() + 1;
    userModel.utenteInserimento = this.authService.getUserState().displayName;
    let u = new UserModel(userModel);
    this.users.push(u);
    this.firebaseStoreService.AddUser(u);
    this.usersChanged.next(this.users.slice());
  }

  deleteUser(id: number) {
    this.users = this.users.filter(function (user) {
      return user.id !== id;
    });
    this.firebaseStoreService.DeleteUser(id.toString());
    this.usersChanged.next(this.users.slice());
  }

  editUser(
    id_input: number,
    userModel: UserModel,
    specific_data_i?: SpecificDataModel[]
  ) {
    let specific_data_tmp = specific_data_i;
    this.users.map((userItem) => {
      if (userItem.id === id_input) {
        userItem.cognome = userModel.cognome;
        userItem.nome = userModel.nome;
        userItem.indirizzo = userModel.indirizzo;
        userItem.numero_telefono = userModel.numero_telefono;
        userItem.citta = userModel.citta;
        userItem.cap = userModel.cap;
        userItem.canale_com = userModel.canale_com;
        // userItem.specific_data = specific_data;
        if (!specific_data_i) {
          specific_data_tmp = userItem.specific_data;
        }
        userItem.ultimoUtenteModifica =
          this.authService.getUserState().displayName;
      }
    });
    let u: UserModel = {
      ...userModel,
      ['id']: id_input,
      ['specific_data']: specific_data_tmp,
      ['ultimoUtenteModifica']: this.authService.getUserState().displayName,
    };
    this.firebaseStoreService.UpdateUser(u);
    this.usersChanged.next(this.users.slice());
  }

  addNewIntervento(
    specific_data: SpecificDataModel,
    user_input?: UserModel,
    prodottiAggiuntivi?: prodottiAggiuntivi[]
  ) {
    let id = 0;
    // verifica se ho modello UserInput in input uso quello altrimenti recupero da users
    let user_work: UserModel = user_input;
    if (user_work.specific_data) {
      specific_data.id =
        this.getLastIdSpecificData(user_work.specific_data) + 1;
    } else {
      user_work.specific_data = [];
      specific_data.id = 1;
    }
    specific_data.data_intervento = new Date();
    // Aggiunta Incasso dato che ho aggiunto un intervento
    specific_data.incasso = calculateIncassoIntervento(specific_data);
    // Aggiunta prodotti aggiuntivi se passati in input
    prodottiAggiuntivi
      ? (specific_data.prodottiAggiuntivi = prodottiAggiuntivi)
      : null;
    this.firebaseStoreService.AddIncasso(
      specific_data.incasso,
      calculateMese(new Date(specific_data.data_intervento))
    );
    let t: SpecificDataModel[] = Object.values(user_work.specific_data);
    t.push(specific_data);
    user_work.specific_data = t;
    user_work.ultimoUtenteModifica =
      this.authService.getUserState().displayName;
    user_work.utenteInserimento = this.authService.getUserState().displayName;

    this.firebaseStoreService.UpdateUser(user_work);
  }

  modifyIntervento(
    id_intervento: number,
    specific_data_input: SpecificDataModel,
    prodotti_aggiuntivi_input: prodottiAggiuntivi[],
    user_input?: UserModel
  ) {
    specific_data_input.id = id_intervento;
    specific_data_input.prodottiAggiuntivi = prodotti_aggiuntivi_input;
    let spec_retrieved: SpecificDataModel[] = Object.values(
      user_input.specific_data
    );
    spec_retrieved.forEach((specific_data, i) => {
      if (specific_data.id === id_intervento) {
        // update Incasso dato che ho modificato un intervento
        if (specific_data.costo !== specific_data_input.costo) {
          let differenza: number =
            Number(specific_data_input.costo) - Number(specific_data.costo);
          if (differenza !== 0) {
            this.firebaseStoreService
              .GetIncassi()
              .query.orderByChild('mese')
              .equalTo(calculateMese(new Date(specific_data.data_intervento)))
              .once('value', (snapshot) => {
                if (snapshot.exists()) {
                  let incassoObject = snapshot.val();
                  let incasso: Incasso = Object.values(
                    incassoObject
                  )[0] as Incasso;
                  incasso.incassoTotale += differenza;
                  this.firebaseStoreService.UpdateIncasso(incasso);
                }
              });
          }
        }
        specific_data_input.data_intervento = specific_data.data_intervento;
        spec_retrieved[i] = new SpecificDataModel(specific_data_input);
      }
    });
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

    // Update Incasso dato che ho cancellato un intervento

    let incassoIntervento: number =
      spec_retrieved[spec_retrieved.indexOf(i[0])].incasso;

    this.firebaseStoreService
      .GetIncassi()
      .query.orderByChild('mese')
      .equalTo(
        calculateMese(
          new Date(spec_retrieved[spec_retrieved.indexOf(i[0])].data_intervento)
        )
      )
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          let incassoObject = snapshot.val();
          let incasso: Incasso = Object.values(incassoObject)[0] as Incasso;
          incasso.incassoTotale = incasso.incassoTotale - incassoIntervento;
          this.firebaseStoreService.UpdateIncasso(incasso);
        }
      });
    // update User dato che ho cancellato un intervento
    spec_retrieved.splice(spec_retrieved.indexOf(i[0]), 1);
    user_input.specific_data = spec_retrieved;
    this.firebaseStoreService.UpdateUser(user_input);
  }

  getLastIdSpecificData(specific_data: SpecificDataModel[]): number {
    let spec = Object.values(specific_data);
    console.log(spec[spec.length - 1].id);
    return spec[spec.length - 1].id;
  }

  getListOfSpecificData(id_user: number) {
    let user: UserModel[] = this.users.filter(function (user) {
      return user.id === id_user;
    });

    //check if specificData is empty
    console.log(user[0]);
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

    this.specificDataChanged.next(this.users[id_user].specific_data.slice());
  }

  getLastId() {
    if (this.users.length <= 0) {
      return 0;
    } else {
      return this.users[this.users.length - 1].id;
    }
  }
}
