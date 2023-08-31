import { ModelloTelefono } from './modello_telefono.model';

export class SpecificDataModel {
  constructor(
    public id: number,
    public tipo_intervento: string,
    public modello_telefono: ModelloTelefono,
    public modalita_pagamento: string,
    public tipo_prodotto: string,
    public canale_com: string,
    public data_intervento: Date,
    public costo: number
  ) {
    // this.id = id;
    // this.tipo_intervento = tipo_intervento;
    // this.modello_telefono = new ModelloTelefono(
    //   modello_telefono.marca,
    //   modello_telefono.modello
    // );
    // this.modalita_pagamento = modalita_pagamento;
    // this.tipo_prodotto = tipo_prodotto;
    // this.canale_com = canale_com;
    // this.data_intervento = data_intervento;
    // this.costo = costo;
  }
}
