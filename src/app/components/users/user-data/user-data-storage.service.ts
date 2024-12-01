import { Injectable } from '@angular/core';
import { UserModel } from 'src/app/shared/models/user-data.model';
interface Input {
  id: number;
  interventiTotali: number;
  selectedItem: UserModel;
}

@Injectable({ providedIn: 'root' })
export class UserDataStorage {
  input: Input;

  constructor() {
    this.input = this.createEmptyInput();
    this.reset();
  }

  private createEmptyInput(): Input {
    return {
      id: undefined,
      interventiTotali: undefined,
      selectedItem: undefined,
    };
  }

  reset() {
    this.input = this.createEmptyInput();
  }
}
