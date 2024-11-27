import { Negozio } from '../utils/common-utils';
import { UserModel } from './user-data.model';

export interface UserModelWithInterventi extends UserModel {
  interventiCount: number;
}

export interface costoStorico {
  id: string;
  prezzo: number;
  data: string;
}

export interface SpesaFissa {
  id: string;
  mese: string;
  nota: string;
  costo: number;
}

export interface Incasso {
  mese: string;
  incassoTotale: number;
  speseTotale: number;
  nettoTotale: number;
  negozi: Negozio[];
  spesaFissa?: SpesaFissa[];
}

export interface Incassov2 {
  mese: string;
  incasso: number;
  spese: number;
  netto: number;
  negozio: string;
  tipo_intervento: string;
}
