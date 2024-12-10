import { DatiFattura } from './datiFattura.model';
import { SpecificDataModel } from './specific-data.model';

export class UserModel {
  public id: number;
  public nome: string;
  public cognome: string;
  public indirizzo: string;
  public numero_telefono: string;
  public citta: string;
  public cap: number;
  public canale_com: string;
  public specific_data: SpecificDataModel[] = [];
  public utenteInserimento?: string;
  public ultimoUtenteModifica?: string;
  public datiFattura: boolean;
  public dataInserimento: string;
  public partitaIva?: string;
  public pec?: string;
  public codiceUnivoco?: string;
  public codiceFiscale?: string;
  public denominazione?: string;
  public indirizzoFatturazione?: string;
  public cittaFatturazione?: string;

  public constructor(init?: Partial<UserModel>) {
    Object.assign(this, init);
  }
}
