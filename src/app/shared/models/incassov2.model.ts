import { Negozio } from '../utils/common-utils';
import { SpesaFissa } from './spesaFissa.model';

export interface Incassov2 {
  mese: string;
  incasso: number;
  spese: number;
  netto: number;
  negozio: string;
  tipo_intervento: string;
}
