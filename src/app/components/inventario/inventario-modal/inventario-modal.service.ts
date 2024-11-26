import { Injectable } from '@angular/core';
import { selectDataSet } from 'src/app/shared/types/custom-types';
import {
  garanzia,
  gradoInventario,
  marcaInventario,
  negozioInventario,
} from 'src/app/shared/utils/common-enums';

@Injectable({ providedIn: 'root' })
export class InventarioModalService {
  private negozioDataSet: selectDataSet[];
  private marcaDataSet: selectDataSet[];
  private gradoDataSet: selectDataSet[];
  private garanziaDataSet: selectDataSet[];
  constructor() {}

  private createDataSet(data: any): selectDataSet[] {
    return Object.keys(data)
      .filter((key) => isNaN(+key))
      .map((key) => ({
        value: key,
        label: key,
      }));
  }

  valDataSet() {
    this.negozioDataSet = this.createDataSet(negozioInventario);
    this.marcaDataSet = this.createDataSet(marcaInventario);
    this.gradoDataSet = this.createDataSet(gradoInventario);
    this.garanziaDataSet = this.createDataSet(garanzia);
  }

  getGradoDataSet(): selectDataSet[] {
    return this.gradoDataSet;
  }

  getMarcaDataSet(): selectDataSet[] {
    return this.marcaDataSet;
  }

  getNegozioDataSet(): selectDataSet[] {
    return this.negozioDataSet;
  }

  getGaranziaDataSet(): selectDataSet[] {
    return this.garanziaDataSet;
  }
}
