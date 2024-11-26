import { Injectable } from '@angular/core';
import { selectDataSet } from 'src/app/shared/types/custom-types';
import {
  condizioniProdotto,
  garanzia,
  negozioInventario,
  tipoIntervento,
  tipoPagamento,
  tipoParte
} from 'src/app/shared/utils/common-enums';
import { UserDataService } from '../user-data/user-data.service';

@Injectable({ providedIn: 'root' })
export class UserDataModalService {
  private tipoInterventoDataSet: selectDataSet[];
  private condizioniProdottoDataSet: selectDataSet[];
  private tipoPagamentoDataSet: selectDataSet[];
  private tipoParteDataSet: selectDataSet[];
  private mesiGaranziaDataSet: selectDataSet[];
  private negozioDataSet: selectDataSet[];

  constructor(private userDataService: UserDataService) {
    this.valDataSet();
  }

  private createDataSet(data: any): selectDataSet[] {
    return Object.keys(data)
      .filter((key) => isNaN(+key))
      .map((key) => ({
        value: key,
        label: key,
      }));
  }

  valDataSet() {
    this.tipoInterventoDataSet = this.createDataSet(tipoIntervento);
    this.condizioniProdottoDataSet = this.createDataSet(condizioniProdotto);
    this.tipoPagamentoDataSet = this.createDataSet(tipoPagamento);
    this.mesiGaranziaDataSet = this.createDataSet(garanzia);
    this.tipoParteDataSet = this.createDataSet(tipoParte);
    this.negozioDataSet = this.createDataSet(negozioInventario);
  }

  getTipoInterventoDataSet(): selectDataSet[] {
    return this.tipoInterventoDataSet;
  }

  getCondizioniProdottoDataSet(): selectDataSet[] {
    return this.condizioniProdottoDataSet;
  }

  getTipoPagamentoDataSet(): selectDataSet[] {
    return this.tipoPagamentoDataSet;
  }

  getTipoParteDataSet(): selectDataSet[] {
    return this.tipoParteDataSet;
  }

  getMesiGaranziaDataSet(): selectDataSet[] {
    return this.mesiGaranziaDataSet;
  }

  getNegozioDataSet(): selectDataSet[] {
    return this.negozioDataSet;
  }

  getIntervento(formData) {
    return formData.value['tipo_intervento'];
  }
}
