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
  public datiFattura: DatiFattura;
  public dataInserimento: string;

  public constructor(init?: Partial<UserModel>) {
    Object.assign(this, init);
  }
}
