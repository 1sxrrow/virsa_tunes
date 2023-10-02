import { SpecificDataModel } from './specific_data.model';

export class UserModel {
  public id: number;
  public nome: string;
  public cognome: string;
  public indirizzo: string;
  public numero_telefono: number;
  public specific_data: SpecificDataModel[] = [];
  public utenteInserimento?: string;
  public ultimoUtenteModifica?: string;

  constructor(
    id: number,
    nome: string,
    cognome: string,
    indirizzo: string,
    numero_telefono: number,
    specific_data?: SpecificDataModel[],
    utenteInserimento?: string,
    ultimoUtenteModifica?: string
  ) {
    this.id = id;
    this.nome = nome;
    this.cognome = cognome;
    this.indirizzo = indirizzo;
    this.numero_telefono = numero_telefono;
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
            specific_data[i].canale_com,
            specific_data[i].data_intervento,
            specific_data[i].costo
          )
        );
      }
    }
  }
}
