import { SpecificDataModel } from './specific_data.model';

export class UserModel {
  public id: number;
  public nome: string;
  public cognome: string;
  public indirizzo: string;
  public numero_telefono: number;
  public citta: string;
  public cap: number;
  public canale_com: string;
  public specific_data: SpecificDataModel[] = [];
  public utenteInserimento?: string;
  public ultimoUtenteModifica?: string;

  constructor(
    id: number,
    nome: string,
    cognome: string,
    indirizzo: string,
    numero_telefono: number,
    citta: string,
    cap: number,
    canale_com: string,
    specific_data?: SpecificDataModel[],
    utenteInserimento?: string,
    ultimoUtenteModifica?: string
  ) {
    this.id = id;
    this.nome = nome;
    this.cognome = cognome;
    this.indirizzo = indirizzo;
    this.numero_telefono = numero_telefono;
    this.citta = citta;
    this.cap = cap;
    this.canale_com = canale_com;
    if (ultimoUtenteModifica || utenteInserimento) {
      if (!ultimoUtenteModifica) {
        this.ultimoUtenteModifica = utenteInserimento;
      } else {
        this.ultimoUtenteModifica = ultimoUtenteModifica;
      }
      this.utenteInserimento = utenteInserimento;
    }
    if (specific_data) {
      for (let i = 0; i < specific_data.length; i++) {
        this.specific_data.push(
          new SpecificDataModel(
            specific_data[i].id,
            specific_data[i].tipo_intervento,
            specific_data[i].modello_telefono,
            specific_data[i].modalita_pagamento,
            specific_data[i].tipo_prodotto,
            specific_data[i].data_intervento,
            specific_data[i].costo,
            specific_data[i].imei,
            specific_data[i].costo_sconto,
            specific_data[i].garanzia,
            specific_data[i].problema,
            specific_data[i].tipo_parte,
            specific_data[i].checkedProdottiAggiuntivi,
            specific_data[i].prodottiAggiuntivi
          )
        );
      }
    }
  }
}
