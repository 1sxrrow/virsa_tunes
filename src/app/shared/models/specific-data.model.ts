import { prodottiAggiuntivi } from './prodotti-aggiuntivi.model';

export class SpecificDataModel {
  public id: number;
  public tipo_intervento: string;
  public marca_telefono: string;
  public modello_telefono: string;
  public modalita_pagamento: string;
  public tipo_prodotto: string;
  public data_intervento: Date;
  public costo: number;
  public imei: string;
  public costo_sconto: number;
  public garanzia: string;
  public problema: string;
  public tipo_parte: string;
  public checkedProdottiAggiuntivi: boolean;
  public prodottiAggiuntivi: prodottiAggiuntivi[];
  public data_consegna_riparazione: Date;
  public codice_sblocco: string;
  public caparra: string;
  public data_rest_dispositivo_cliente: Date;
  public nome_fornitore_pezzo: string;
  public incasso: number;
  public checkedPermuta: boolean;
  public costoPermuta: number;

  public constructor(init?: Partial<SpecificDataModel>) {
    Object.assign(this, init);
  }
}
