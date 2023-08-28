import { Injectable } from '@angular/core';
import { UserModel } from '../shared/user_data.model';
import { Observable, Subject } from 'rxjs';
import { SpecificDataModel } from '../shared/specific_data.model';
import { ModelloTelefono } from '../shared/modello_telefono.model';
import { AngularFireDatabase } from '@angular/fire/compat/database';

enum tipoIntervento {
  'Vendita',
  'Riparazione',
}

enum canaleComunicazione {
  'Instagram',
  'TikTok',
  'Facebook',
  'Twitter',
}

enum condizioniProdotto {
  'Nuovo',
  'Usato',
}

enum tipoPagamento {
  'Contanti',
  'Carta',
}

@Injectable({ providedIn: 'root' })
export class UserDataService {
  usersChanged = new Subject<UserModel[]>();
  specificDataChanged = new Subject<SpecificDataModel[]>();

  userObservable: Observable<any[]>;
  userDatabase = this.db.list('users');

  user: UserModel[] = [];
  constructor(private db: AngularFireDatabase) {
    // this.userObservable = this.fetchUserCloud();
  }
  public tipoIntervento = tipoIntervento;
  public canaleComunicazione = canaleComunicazione;
  public tipoPagamento = tipoPagamento;
  public condizioniProdotto = condizioniProdotto;

  setUsers(user: UserModel[]) {
    this.user = user;
    if (user.length > 0) {
      this.usersChanged.next(user);
    }
  }
  setUsersChanged() {
    this.usersChanged.next(this.getUserDatas());
  }

  setUserData(user: UserModel) {
    this.user.push(user);
    this.setUsersChanged();
  }

  getUserDatas() {
    return this.user.slice();
  }

  getUserData(index: number) {
    return this.user[index];
  }

  getTotalInterventi(id: number) {
    return this.user[id]?.specific_data?.length;
  }

  addUser(
    nome: string,
    cognome: string,
    indirizzo: string,
    numero_telefono: number
  ) {
    this.user.push(
      new UserModel(
        this.getLastId() + 1,
        nome,
        cognome,
        indirizzo,
        numero_telefono
      )
    );
    this.usersChanged.next(this.user.slice());
  }

  addNewUser(
    nome: string,
    cognome: string,
    indirizzo?: string,
    numero_telefono?: number,
    specific_data?: SpecificDataModel[]
  ) {
    this.user.push();
    this.user;
    this.usersChanged.next(this.user.slice());
    // this.StoreUserCloud(
    //   new UserModel(
    //     this.getLastId() + 1,
    //     nome,
    //     cognome,
    //     indirizzo,
    //     numero_telefono,
    //     specific_data ? specific_data : []
    //   )
    // );
  }

  deleteUser(id: number) {
    this.user = this.user.filter(function (user) {
      return user.id !== id;
    });

    this.usersChanged.next(this.user.slice());
  }

  editUser(
    id_input: number,
    nome: string,
    cognome: string,
    numero_telefono_i: number,
    indirizzo: string
  ) {
    this.user.map((userItem) => {
      if (userItem.id === id_input) {
        userItem.cognome = cognome;
        userItem.nome = nome;
        userItem.indirizzo = indirizzo;
        userItem.numero_telefono = numero_telefono_i;
      }
    });
    this.usersChanged.next(this.user.slice());
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
    costo: number
  ) {
    let user: UserModel[] = this.user.filter(function (user) {
      return user.id === id_user;
    });
    let id = this.getLastIdSpecificData(user[0].specific_data) + 1;
    user[0].specific_data.push(
      new SpecificDataModel(
        3,
        tipo_intervento,
        new ModelloTelefono(marca, modello),
        modalita_pagamento,
        tipo_prodotto,
        canale_com,
        data_intervento,
        costo
      )
    );
  }

  getLastIdSpecificData(specific_data: SpecificDataModel[]): number {
    return specific_data[specific_data.length - 1].id;
  }

  getListOfSpecificData(id_user: number) {
    return this.user[id_user].specific_data.slice();
  }

  deleteSpecificData(id_user: number, id_intervento: number) {
    this.user[id_user].specific_data = this.user[id_user].specific_data.filter(
      function (intervento) {
        return intervento.id !== id_intervento;
      }
    );

    this.specificDataChanged.next(this.user[id_user].specific_data.slice());
  }

  getLastId() {
    if (this.user.length - 1 <= 0) {
      return 0;
    } else {
      return this.user[this.user.length - 1].id;
    }
  }

  // StoreUserCloud(user: UserModel) {
  //   let name = user.id;
  //   let store = { [name]: user };
  //   const newObj = this.db.list('users');
  //   newObj.push(store);
  // }

  // fetchUserCloud() {
  //   return this.userDatabase.valueChanges();
  // }
}
