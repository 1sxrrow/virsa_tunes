import { FileUpload } from '../utils/common-utils';
import { costoStorico } from './costoStorico.model';
import { Incasso } from './incasso.model';
import { Incassov2 } from './incassov2.model';
import { prodottiAggiuntivi } from './prodotti-aggiuntivi.model';

export class SpecificDataModel {
  public id: number;
  public tipo_intervento: string;
  public marca_telefono: string;
  public modello_telefono: string;
  public modalita_pagamento: string;
  public tipo_prodotto: string;
  public data_intervento: Date | string;
  public costo: number;
  public imei: string;
  public costo_sconto: number;
  public garanzia: string;
  public problema: string;
  public tipo_parte: string;
  public checkedProdottiAggiuntivi: boolean;
  public prodottiAggiuntivi: prodottiAggiuntivi[];
  public data_consegna_riparazione: Date;
  public codice_sblocco: string;
  public caparra: string;
  public costoCambio: number;
  public data_rest_dispositivo_cliente: Date;
  public nome_fornitore_pezzo: string;
  public incasso: Incasso;
  public checkedPermuta: boolean;
  public costoPermuta: number;
  public negozio: string;
  public note: string;
  public files?: FileUpload[];
  public idDbIncasso?: string;
  public incassov2?: Incassov2;
  public listaStorico?: costoStorico[];

  public constructor(init?: Partial<SpecificDataModel>) {
    Object.assign(this, init);
  }
}
