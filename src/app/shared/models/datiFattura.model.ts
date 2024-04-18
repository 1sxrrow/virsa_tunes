export class DatiFattura {
  public partitaIva: string;
  public pec: string;
  public codiceUnivoco: string;
  public codiceFiscale: string;

  constructor(init?: Partial<DatiFattura>) {
    Object.assign(this, init);
  }
}
