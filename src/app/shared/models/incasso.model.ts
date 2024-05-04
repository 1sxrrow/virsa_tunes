import { SpesaFissa } from './spesaFissa.model';

export interface Incasso {
  mese: string;
  incassoTotale: number;
  spese: number;
  netto: number;
  spesaFissa?: SpesaFissa[];
}
