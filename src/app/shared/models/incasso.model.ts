import { Negozio } from '../utils/common-utils';
import { SpesaFissa } from './spesaFissa.model';

export interface Incasso {
  mese: string;
  incassoTotale: number;
  speseTotale: number;
  nettoTotale: number;
  negozi: Negozio[];
  spesaFissa?: SpesaFissa[];
}
