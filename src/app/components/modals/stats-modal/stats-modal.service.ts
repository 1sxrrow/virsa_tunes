import { Injectable, NgModule } from '@angular/core';
import { canaleComunicazione } from 'src/app/shared/utils/common-enums';
import { UserDataService } from '../../users/user-data/user-data.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatsModalService {
  private canaleComunicazioniResultSubject: BehaviorSubject<
    { name: string; value: number }[]
  > = new BehaviorSubject<{ name: string; value: number }[]>([]);

  constructor(private userDataService: UserDataService) {
    this.getCanaleComResults();
  }

  getcanaleComunicazioniResultObservable() {
    return this.canaleComunicazioniResultSubject.asObservable();
  }

  getCanaleComResults() {
    const canaleComunicazioniCount: { [key: string]: number } = {};
    this.userDataService.users.forEach((user) => {
      const canaleCom: canaleComunicazione =
        user.canale_com as unknown as canaleComunicazione;
      if (canaleComunicazioniCount[canaleCom]) {
        canaleComunicazioniCount[canaleCom]++;
      } else {
        canaleComunicazioniCount[canaleCom] = 1;
      }
    });
    canaleComunicazioniCount['Totale'] = this.userDataService.users.length;
    const result = Object.entries(canaleComunicazioniCount).map(
      ([key, value]) => ({
        name: key,
        value: value,
      })
    );
    this.canaleComunicazioniResultSubject.next(result);
  }
}
