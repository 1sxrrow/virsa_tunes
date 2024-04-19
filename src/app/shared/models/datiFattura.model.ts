export class DatiFattura {
  public partitaIva: string;
  public pec: string;
  public codiceUnivoco: string;
  public codiceFiscale: string;
  public denominazione: string;

  constructor(init?: Partial<DatiFattura>) {
    Object.assign(this, init);
  }
}
