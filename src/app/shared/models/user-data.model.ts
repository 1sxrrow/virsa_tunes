import { SpecificDataModel } from './specific-data.model';

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
  
  public constructor(init?: Partial<UserModel>) {
    Object.assign(this, init);
  }
}
