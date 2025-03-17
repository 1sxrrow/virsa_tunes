import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FirebaseListService } from 'src/app/shared/services/firebase/firebase-list.service';
import { selectDataSet } from 'src/app/shared/types/custom-types';

@Injectable({ providedIn: 'root' })
export class UserListModalService implements OnDestroy {
  canaleComunicazioniDataSet: selectDataSet[];

  private destroy$ = new Subject<void>();

  constructor(private firebaseListService: FirebaseListService) {
    this.valDataSet();
  }

  valDataSet() {
    this.firebaseListService
      .getListValue('canaleComunicazione')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.canaleComunicazioniDataSet = data;
      });
  }

  getTipoInterventoDataSet(): selectDataSet[] {
    return this.canaleComunicazioniDataSet;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
