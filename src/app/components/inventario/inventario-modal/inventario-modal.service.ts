import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FirebaseListService } from 'src/app/shared/services/firebase/firebase-list.service';
import { selectDataSet } from 'src/app/shared/types/custom-types';

@Injectable({ providedIn: 'root' })
export class InventarioModalService implements OnDestroy {
  private negozioDataSet: selectDataSet[];
  private marcaDataSet: selectDataSet[];
  private gradoDataSet: selectDataSet[];
  private garanziaDataSet: selectDataSet[];

  private destroy$ = new Subject<void>();
  constructor(private firebaseListService: FirebaseListService) {}

  valDataSet() {
    this.firebaseListService
      .getListValue('negozio')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.negozioDataSet = data;
      });
    this.firebaseListService
      .getListValue('marca')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.marcaDataSet = data;
      });
    this.firebaseListService
      .getListValue('grado')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.gradoDataSet = data;
      });
    this.firebaseListService
      .getListValue('garanzia')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.garanziaDataSet = data;
      });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete;
  }
}
