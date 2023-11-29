import { ModelloTelefono } from './modello_telefono.model';
import { prodottiAggiuntivi } from './prodottiAggiuntivi.model';

export class SpecificDataModel {
  constructor(
    public id: number,
    public tipo_intervento: string,
    public modello_telefono: ModelloTelefono,
    public modalita_pagamento: string,
    public tipo_prodotto: string,
    public data_intervento: Date,
    public costo: number,
    public imei: string,
    public costo_sconto: string,
    public garanzia: string,
    public problema: string,
    public tipo_parte: string,
    public checkedProdottiAggiuntivi: boolean,
    public prodottiAggiuntivi: prodottiAggiuntivi[],
    public data_consegna_riparazione: Date,
    public codice_sblocco: string,
    public caparra: string
  ) {}
}
