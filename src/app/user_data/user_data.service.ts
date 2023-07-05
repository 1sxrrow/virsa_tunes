import { Injectable, OnInit } from '@angular/core';
import { UserModel } from '../shared/user_data.model';

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
  private user: UserModel[] = [
    new UserModel(1, 'Marco', 'Rossi', 'Via dei Fiori 32', 3295630232, [
      {
        tipo_intervento: 'Riparazione',
        modello_telefono: { marca: 'apple', modello: 'iphone 12' },
        modalita_pagamento: 'Contanti',
        tipo_prodotto: 'Nuovo',
        canale_com: 'TikTok',
        data_intervento: new Date(),
      },
      {
        tipo_intervento: 'Vendita',
        modello_telefono: { marca: 'Samsung', modello: 'A20' },
        modalita_pagamento: 'Carta',
        tipo_prodotto: 'Usato',
        canale_com: 'Twitter',
        data_intervento: new Date(),
      },
    ]),
    new UserModel(2, 'Mario', 'Verdi', 'Via dei Pazzi 32', 1234567890, [
      {
        tipo_intervento: 'Vendita',
        modello_telefono: { marca: 'Samsung', modello: 'A20' },
        modalita_pagamento: 'Carta',
        tipo_prodotto: 'Usato',
        canale_com: 'Twitter',
        data_intervento: new Date(),
      },
    ]),
  ];
  constructor() {}
  ENUMS;
  public tipoIntervento = tipoIntervento;
  public canaleComunicazione = canaleComunicazione;
  public tipoPagamento = tipoPagamento;
  public condizioniProdotto = condizioniProdotto;

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
  }

  getLastId() {
    return this.user[this.user.length - 1].id;
  }
}
