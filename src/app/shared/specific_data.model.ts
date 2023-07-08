import { ModelloTelefono } from './modello_telefono.model';

export class SpecificDataModel {
  id: number;
  tipo_intervento: string;
  modello_telefono: ModelloTelefono;
  modalita_pagamento: string;
  tipo_prodotto: string;
  canale_com: string;
  data_intervento: Date;

  constructor(
    id: number,
    tipo_intervento: string,
    modello_telefono: ModelloTelefono,
    modalita_pagamento: string,
    tipo_prodotto: string,
    canale_com: string,
    data_intervento: Date
  ) {
    this.id = id;
    this.tipo_intervento = tipo_intervento;
    this.modello_telefono = new ModelloTelefono(
      modello_telefono.marca,
      modello_telefono.modello
    );
    this.modalita_pagamento = modalita_pagamento;
    this.tipo_prodotto = tipo_prodotto;
    this.canale_com = canale_com;
    this.data_intervento = data_intervento;
  }
}
