export class DatiFattura {
  public partitaIva: string;
  public pec: string;
  public codiceUnivoco: string;
  public codiceFiscale: string;
  public denominazione: string;
  public indirizzoFatturazione: string;
  public cittaFatturazione: string;

  constructor(init?: Partial<DatiFattura>) {
    Object.assign(this, init);
  }
}
