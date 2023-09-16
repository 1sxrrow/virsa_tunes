import { Injectable } from '@angular/core';
import { UserModel } from '../shared/user_data.model';
import { Subject, map } from 'rxjs';
import { SpecificDataModel } from '../shared/specific_data.model';
import { ModelloTelefono } from '../shared/modello_telefono.model';
import { FirebaseStoreService } from '../shared/firebase.store.service';
import {
  tipoIntervento,
  canaleComunicazione,
  tipoPagamento,
  condizioniProdotto,
} from '../shared/enums';
@Injectable({ providedIn: 'root' })
export class UserDataService {
  usersChanged = new Subject<UserModel[]>();
  specificDataChanged = new Subject<SpecificDataModel[]>();

  users: UserModel[] = [];
  constructor(private firebaseStoreService: FirebaseStoreService) {}

  public tipoIntervento = tipoIntervento;
  public canaleComunicazione = canaleComunicazione;
  public tipoPagamento = tipoPagamento;
  public condizioniProdotto = condizioniProdotto;

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

  addUser(
    nome: string,
    cognome: string,
    indirizzo: string,
    numero_telefono: number,
    specific_data?: SpecificDataModel[]
  ) {
    let u = new UserModel(
      this.getLastId() + 1,
      nome,
      cognome,
      indirizzo,
      numero_telefono,
      specific_data
    );
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
    nome: string,
    cognome: string,
    numero_telefono_i: number,
    indirizzo: string,
    specific_data?: SpecificDataModel[]
  ) {
    this.users.map((userItem) => {
      if (userItem.id === id_input) {
        userItem.cognome = cognome;
        userItem.nome = nome;
        userItem.indirizzo = indirizzo;
        userItem.numero_telefono = numero_telefono_i;
        userItem.specific_data = specific_data;
      }
    });
    this.firebaseStoreService.UpdateUser(
      new UserModel(
        id_input,
        nome,
        cognome,
        indirizzo,
        numero_telefono_i,
        specific_data
      )
    );
    this.usersChanged.next(this.users.slice());
  }

  addNewIntervento(
    id_user: number,
    tipo_intervento: string,
    marca: string,
    modello: string,
    modalita_pagamento: string,
    tipo_prodotto: string,
    canale_com: string,
    data_intervento: Date,
    costo: number,
    user_input?: UserModel
  ) {
    let id = 0;
    let user_work: UserModel;
    // verifica se ho modello UserInput in input uso quello altrimenti recupero da users
    if (user_input) {
      user_work = user_input;
    } else {
      let user: UserModel[] = this.users.filter(function (user) {
        return user.id === id_user;
      });
      user_work = user[0];
    }
    if (user_work.specific_data) {
      id = this.getLastIdSpecificData(user_work.specific_data) + 1;
    } else {
      user_work.specific_data = [];
      id = 1;
    }
    let intervento = new SpecificDataModel(
      id,
      tipo_intervento,
      new ModelloTelefono(marca, modello),
      modalita_pagamento,
      tipo_prodotto,
      canale_com,
      data_intervento,
      costo
    );

    let t: SpecificDataModel[] = Object.values(user_work.specific_data);
    t.push(intervento);
    user_work.specific_data = t;

    this.firebaseStoreService.UpdateUser(user_work);
  }

  modifyIntervento(
    id_user: number,
    id_intervento: number,
    tipo_intervento: string,
    marca: string,
    modello: string,
    modalita_pagamento: string,
    tipo_prodotto: string,
    canale_com: string,
    data_intervento: Date,
    costo: number,
    user_input?: UserModel
  ) {
    let spec_retrieved: SpecificDataModel[] = Object.values(
      user_input.specific_data
    );
    spec_retrieved.forEach((specific_data, i) => {
      if (specific_data.id === id_intervento) {
        spec_retrieved[i] = new SpecificDataModel(
          id_intervento,
          tipo_intervento,
          new ModelloTelefono(marca, modello),
          modalita_pagamento,
          tipo_prodotto,
          canale_com,
          data_intervento,
          costo
        );
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
