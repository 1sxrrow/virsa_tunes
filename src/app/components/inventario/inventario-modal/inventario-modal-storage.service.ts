import { Injectable } from '@angular/core';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';

interface Input {
  mode: string;
  key: string;
  selectedItem: InventarioItemModel;
}
@Injectable({ providedIn: 'root' })
export class InventarioModalStorage {
  input: Input;

  constructor() {
    this.input = this.createEmptyInput();
    this.reset();
  }

  private createEmptyInput(): Input {
    return {
      mode: undefined,
      key: undefined,
      selectedItem: undefined,
    };
  }

  reset() {
    this.input = this.createEmptyInput();
  }
}
