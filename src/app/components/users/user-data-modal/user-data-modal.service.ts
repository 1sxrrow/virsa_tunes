import { Injectable } from '@angular/core';
import { selectDataSet } from 'src/app/shared/types/custom-types';
import {
  condizioniProdotto,
  garanzia,
  gradoInventario,
  marcaInventario,
  negozioInventario,
  tipoIntervento,
  tipoPagamento,
  tipoParte,
} from 'src/app/shared/utils/common-enums';
import { UserDataService } from '../user-data/user-data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SpecificDataModel } from 'src/app/shared/models/specific-data.model';

@Injectable({ providedIn: 'root' })
export class UserDataModalService {
  private tipoInterventoDataSet: selectDataSet[];
  private condizioniProdottoDataSet: selectDataSet[];
  private tipoPagamentoDataSet: selectDataSet[];
  private tipoParteDataSet: selectDataSet[];
  private mesiGaranziaDataSet: selectDataSet[];
  private negozioDataSet: selectDataSet[];
  private gradoDataSet: selectDataSet[];
  private marcaDataSet: selectDataSet[];

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
    this.gradoDataSet = this.createDataSet(gradoInventario);
    this.marcaDataSet = this.createDataSet(marcaInventario);
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

  getGradoDataSet(): selectDataSet[] {
    return this.gradoDataSet;
  }

  getMarcaDataSet(): selectDataSet[] {
    return this.marcaDataSet;
  }

  getIntervento(formData: FormGroup) {
    return formData.value['tipo_intervento'];
  }

  getTipoProdotto(grado: string): string {
    return grado === 'Nuovo' ? 'Nuovo' : 'Usato';
  }

  setInterventiAggiuntivi(selectedItem: SpecificDataModel) {
    if (selectedItem.prodottiAggiuntivi) {
      let array = Object.values(selectedItem.prodottiAggiuntivi);
      array.forEach((item) => {
        if (!item.id) {
          item.id = Math.random().toString(36).substr(2, 9);
        }
      });
      return array;
    } else {
      return [];
    }
  }

  initFormGroup(formData: FormGroup) {
    const tipoIntervento = this.getIntervento(formData);

    const formGroupConfig: any = {
      tipo_intervento: new FormControl(tipoIntervento, Validators.required),
      costo: new FormControl(
        formData?.get('costo')?.value || 0,
        Validators.required
      ),
      data_intervento: new FormControl(
        formData?.get('data_intervento')?.value || ''
      ),
      marca_telefono: new FormControl(
        formData?.get('marca_telefono')?.value || ''
      ),
      modello_telefono: new FormControl(
        formData?.get('modello_telefono')?.value || ''
      ),
      imei: new FormControl(formData?.get('imei')?.value || ''),
      checkedProdottiAggiuntivi: new FormControl(
        formData?.get('checkedProdottiAggiuntivi')?.value || ''
      ),
      checkedPermuta: new FormControl(
        formData?.get('checkedPermuta')?.value || ''
      ),
      costoPermuta: new FormControl(formData?.get('costoPermuta')?.value || 0),
      negozio: new FormControl(
        formData?.get('negozio')?.value || '',
        Validators.required
      ),
      codice_sblocco: new FormControl(
        formData?.get('codice_sblocco')?.value || ''
      ),
      caparra: new FormControl(formData?.get('caparra')?.value || 0),
      nome_fornitore_pezzo: new FormControl(
        formData?.get('nome_fornitore_pezzo')?.value || ''
      ),
      data_rest_dispositivo_cliente: new FormControl(
        formData?.get('data_rest_dispositivo_cliente')?.value || ''
      ),
      costoCambio: new FormControl(formData?.get('costoCambio')?.value || 0),
      note: new FormControl(formData?.get('note')?.value || ''),
    };

    if (tipoIntervento === 'Vendita') {
      formGroupConfig.costo_sconto = new FormControl(
        formData?.get('costo_sconto')?.value || 0,
        Validators.required
      );
      formGroupConfig.modalita_pagamento = new FormControl(
        formData?.get('modalita_pagamento')?.value || '',
        Validators.required
      );
      formGroupConfig.tipo_prodotto = new FormControl(
        formData?.get('tipo_prodotto')?.value || '',
        Validators.required
      );
      formGroupConfig.garanzia = new FormControl(
        formData?.get('garanzia')?.value || '',
        Validators.required
      );
    }

    if (tipoIntervento === 'Riparazione') {
      formGroupConfig.problema = new FormControl(
        formData?.get('problema')?.value || '',
        Validators.required
      );
      formGroupConfig.tipo_parte = new FormControl(
        formData?.get('tipo_parte')?.value || '',
        Validators.required
      );
      formGroupConfig.data_consegna_riparazione = new FormControl(
        formData?.get('data_consegna_riparazione')?.value || '',
        Validators.required
      );
    }

    if (tipoIntervento === 'Acquisto') {
      formGroupConfig.quantita = new FormControl(
        formData?.get('quantita')?.value || 0,
        Validators.required
      );
      formGroupConfig.nome = new FormControl(
        formData?.get('nome')?.value || '',
        Validators.required
      );
      formGroupConfig.marca = new FormControl(
        formData?.get('marca')?.value || '',
        Validators.required
      );
      formGroupConfig.colore = new FormControl(
        formData?.get('colore')?.value || '',
        Validators.required
      );
      formGroupConfig.memoria = new FormControl(
        formData?.get('memoria')?.value || 0,
        Validators.required
      );
      formGroupConfig.grado = new FormControl(
        formData?.get('grado')?.value || '',
        Validators.required
      );
      formGroupConfig.garanzia_mesi = new FormControl(
        formData?.get('garanzia_mesi')?.value || '',
        Validators.required
      );
      formGroupConfig.fornitore = new FormControl(
        formData?.get('fornitore')?.value || '',
        Validators.required
      );
      formGroupConfig.perc_batteria = new FormControl(
        formData?.get('perc_batteria')?.value || 0,
        Validators.required
      );
      formGroupConfig.prezzo_acquisto = new FormControl(
        formData?.get('prezzo_acquisto')?.value || '',
        Validators.required
      );
      formGroupConfig.prezzo_negozio = new FormControl(
        formData?.get('prezzo_negozio')?.value || '',
        Validators.required
      );
      formGroupConfig.prezzo_online = new FormControl(
        formData?.get('prezzo_online')?.value || '',
        Validators.required
      );
      formGroupConfig.dataAcquistoInventario = new FormControl(
        formData?.get('dataAcquistoInventario')?.value || '',
        Validators.required
      );
      formGroupConfig.data = new FormControl(
        formData?.get('data')?.value || '',
      );
    }

    return new FormGroup(formGroupConfig);
  }

  getFilteredFormData(formData: FormGroup) {
    const formDataValue = formData.value;
    const filteredData = {};
    Object.keys(formDataValue).forEach((key) => {
      if (
        formDataValue[key] !== null &&
        formDataValue[key] !== '' &&
        formDataValue[key] !== 0
      ) {
        filteredData[key] = formDataValue[key];
      }
    });

    return filteredData;
  }
}
