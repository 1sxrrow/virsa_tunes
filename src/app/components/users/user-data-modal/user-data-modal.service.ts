import { Injectable } from '@angular/core';
import { selectDataSet } from 'src/app/shared/types/custom-types';
import {
  condizioniProdotto,
  garanzia,
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
    // prettier-ignore
    return new FormGroup({
      tipo_intervento: new FormControl(tipoIntervento, Validators.required),
      costo: new FormControl(formData?.get('costo')?.value || 0, Validators.required),
      costo_sconto: new FormControl(formData?.get('costo_sconto')?.value || 0, tipoIntervento === 'Vendita' ? Validators.required : null),
      data_intervento: new FormControl(formData?.get('data_intervento')?.value || ''),
      modalita_pagamento: new FormControl(formData?.get('modalita_pagamento')?.value || '', tipoIntervento === 'Vendita' ? Validators.required : null),
      marca_telefono: new FormControl(formData?.get('marca_telefono')?.value || '', Validators.required),
      modello_telefono: new FormControl(formData?.get('modello_telefono')?.value || '', Validators.required),
      tipo_prodotto: new FormControl(formData?.get('tipo_prodotto')?.value || '', tipoIntervento === 'Vendita' ? Validators.required : null),
      imei: new FormControl(formData?.get('imei')?.value || ''),
      garanzia: new FormControl(formData?.get('garanzia')?.value || '', tipoIntervento === 'Vendita' ? Validators.required : null),
      checkedProdottiAggiuntivi: new FormControl(formData?.get('checkedProdottiAggiuntivi')?.value || ''),
      checkedPermuta: new FormControl(formData?.get('checkedPermuta')?.value || ''),
      costoPermuta: new FormControl(formData?.get('costoPermuta')?.value || 0),
      negozio: new FormControl(formData?.get('negozio')?.value || '', Validators.required),
      problema: new FormControl(formData?.get('problema')?.value || '', tipoIntervento === 'Riparazione' ? Validators.required : null),
      tipo_parte: new FormControl(formData?.get('tipo_parte')?.value || '', tipoIntervento === 'Riparazione' ? Validators.required : null),
      data_consegna_riparazione: new FormControl(formData?.get('data_consegna_riparazione')?.value || '', tipoIntervento === 'Riparazione' ? Validators.required : null),
      codice_sblocco: new FormControl(formData?.get('codice_sblocco')?.value || ''),
      caparra: new FormControl(formData?.get('caparra')?.value || 0),
      nome_fornitore_pezzo: new FormControl(formData?.get('nome_fornitore_pezzo')?.value || ''),
      data_rest_dispositivo_cliente: new FormControl(formData?.get('data_rest_dispositivo_cliente')?.value || ''),
      costoCambio: new FormControl(formData?.get('costoCambio')?.value || 0),
      note: new FormControl(formData?.get('note')?.value || ''),
    });
  }

  getFilteredFormData(formData: FormGroup) {
    const formDataValue = formData.value;
    const filteredData = {};

    Object.keys(formDataValue).forEach((key) => {
      if (formDataValue[key] !== null && formDataValue[key] !== '') {
        filteredData[key] = formDataValue[key];
      }
    });

    return filteredData;
  }
}
