import { Injectable } from '@angular/core';
import { UserModel } from '../shared/user_data.model';
import { Subject } from 'rxjs';
import { SpecificDataModel } from '../shared/specific_data.model';
import { ModelloTelefono } from '../shared/modello_telefono.model';

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

  user: UserModel[] = [
    new UserModel(1, 'Marco', 'Rossi', 'Via dei Fiori 32', 3295630232, [
      {
        id: 1,
        tipo_intervento: 'Riparazione',
        modello_telefono: { marca: 'apple', modello: 'iphone 12' },
        modalita_pagamento: 'Contanti',
        tipo_prodotto: 'Nuovo',
        canale_com: 'TikTok',
        data_intervento: new Date(),
        costo: 200,
      },
      {
        id: 2,
        tipo_intervento: 'Vendita',
        modello_telefono: { marca: 'Samsung', modello: 'A20' },
        modalita_pagamento: 'Carta',
        tipo_prodotto: 'Usato',
        canale_com: 'Twitter',
        data_intervento: new Date(),
        costo: 380,
      },
    ]),
    new UserModel(2, 'Mario', 'Verdi', 'Via dei Pazzi 32', 1234567890, [
      {
        id: 1,
        tipo_intervento: 'Vendita',
        modello_telefono: { marca: 'Samsung', modello: 'A20' },
        modalita_pagamento: 'Carta',
        tipo_prodotto: 'Usato',
        canale_com: 'Twitter',
        data_intervento: new Date(),
        costo: 180,
      },
    ]),
  ];
  constructor() {
    this.setStandardUsers();
  }

  public tipoIntervento = tipoIntervento;
  public canaleComunicazione = canaleComunicazione;
  public tipoPagamento = tipoPagamento;
  public condizioniProdotto = condizioniProdotto;

  setStandardUsers() {
    this.usersChanged.next(this.user.slice());
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
    numero_telefono?: number
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
    this.user;
    this.usersChanged.next(this.user.slice());
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
}
