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
    public costo: number,
    public imei: string,
    public costo_sconto: string,
    public garanzia: string,
    public problema: string
  ) {}
}
