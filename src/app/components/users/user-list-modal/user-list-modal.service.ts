import { Injectable } from '@angular/core';
import { selectDataSet } from 'src/app/shared/types/custom-types';
import { UserDataService } from '../user-data/user-data.service';
import { canaleComunicazione } from 'src/app/shared/utils/common-enums';

@Injectable({ providedIn: 'root' })
export class UserListModalService {
  canaleComunicazioniDataSet: selectDataSet[];

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
    this.canaleComunicazioniDataSet = this.createDataSet(canaleComunicazione);
  }

  getTipoInterventoDataSet(): selectDataSet[] {
    return this.canaleComunicazioniDataSet;
  }
}
