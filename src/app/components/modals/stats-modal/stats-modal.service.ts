import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FirebaseListService } from 'src/app/shared/services/firebase/firebase-list.service';
import { UserDataService } from '../../users/user-data/user-data.service';

@Injectable({
  providedIn: 'root',
})
export class StatsModalService implements OnDestroy {
  private canaleComunicazioniResultSubject: BehaviorSubject<
    { name: string; value: number }[]
  > = new BehaviorSubject<{ name: string; value: number }[]>([]);

  private destroy$ = new Subject<void>();

  canaleComunicazione: any[];
  constructor(
    private userDataService: UserDataService,
    private firebaseListService: FirebaseListService
  ) {
    this.firebaseListService
      .getListValue('tipoIntervento')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.canaleComunicazione = data;
      });
    this.getCanaleComResults();
  }

  getcanaleComunicazioniResultObservable() {
    return this.canaleComunicazioniResultSubject.asObservable();
  }

  getCanaleComResults() {
    const canaleComunicazioniCount: { [key: string]: number } = {};
    this.userDataService.users.forEach((user) => {
      const canaleCom = user.canale_com as string;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
