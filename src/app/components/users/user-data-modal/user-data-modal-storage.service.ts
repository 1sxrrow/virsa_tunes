import { Injectable, NgModule } from '@angular/core';
import { SpecificDataModel } from 'src/app/shared/models/specific-data.model';
import { UserModel } from 'src/app/shared/models/user-data.model';

interface Input {
  id: number;
  selectedItem: SpecificDataModel;
  userData: UserModel;
}

@Injectable({ providedIn: 'root' })
export class userDataModalStorage {
  input: Input;

  constructor() {
    this.input = this.createEmptyInput();
    this.reset();
  }

  private createEmptyInput(): Input {
    return {
      id: undefined,
      selectedItem: undefined,
      userData: undefined,
    };
  }

  reset() {
    this.input = this.createEmptyInput();
  }
}
