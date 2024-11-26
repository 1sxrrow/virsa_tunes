import { Injectable } from '@angular/core';
import { UserModel } from 'src/app/shared/models/user-data.model';
interface Input {
  id: number;
  selectedItem: UserModel;
}

@Injectable({ providedIn: 'root' })
export class UserListModalStorage {
  input: Input;

  constructor() {
    this.input = this.createEmptyInput();
    this.reset();
  }

  private createEmptyInput(): Input {
    return {
      id: undefined,
      selectedItem: undefined,
    };
  }

  reset() {
    this.input = this.createEmptyInput();
  }
}
