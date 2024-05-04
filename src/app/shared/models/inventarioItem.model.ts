export class InventarioItemModel {
  public id: number;
  public quantita: number;
  public nome: string;
  public marca: string;
  public colore: string;
  public memoria: string;
  public grado: string;
  public prezzo_acquisto: number;
  public fornitore: string;
  public perc_batteria: string;
  public garanzia_mesi: string;
  public prezzo_online: number;
  public prezzo_negozio: number;
  public negozio: string;
  public IMEI: string;
  public data: Date;
  constructor(init?: Partial<InventarioItemModel>) {
    Object.assign(this, init);
  }
}
