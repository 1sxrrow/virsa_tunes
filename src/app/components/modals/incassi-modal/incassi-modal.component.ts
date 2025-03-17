import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { Incassov2, SpesaFissa } from 'src/app/shared/models/custom-interfaces';
import { FirebaseListService } from 'src/app/shared/services/firebase/firebase-list.service';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { selectDataSet } from 'src/app/shared/types/custom-types';

@Component({
  selector: 'incassi-modal',
  templateUrl: './incassi-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class IncassiModalComponent implements OnInit, OnDestroy {
  @Input() showIncassiModal: boolean = false;
  @Output() showIncassiModalChange = new EventEmitter<boolean>();

  selectedNegozio: string = '';
  selectedIncasso: Incassov2;

  showSpesaFissaModal: boolean = false;
  showSpeseFisseModal: boolean = false;
  showListIncassiModal: boolean = false;

  selectedTipoIntervento: string = '';
  filterNegozio: selectDataSet[];
  filterTipoIntervento: selectDataSet[];
  loadingTable: boolean = true;
  mesiSpesaFissa: string[] = [];
  mesiSpeseFisseList: string[] = [];
  listaSpeseFisseArray: SpesaFissa[] = [];

  meseInputListIncassiModal: string;

  private subscriptions: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  private incassiShowSubject = new BehaviorSubject<Incassov2[]>([]);
  incassiShow$: Observable<Incassov2[]> =
    this.incassiShowSubject.asObservable();

  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private firebaseListService: FirebaseListService
  ) {}

  ngOnInit(): void {
    this.evalSelectDataSet();
    this.getListaMesiSpesaFissa();
    this.filterIncassi();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleClose() {
    this.showIncassiModal = false;
    this.showIncassiModalChange.emit(this.showIncassiModal);
  }

  handleShowSpesaFissaModalChange(show: boolean) {
    this.filterIncassi(this.selectedNegozio, this.selectedTipoIntervento);
    this.showSpesaFissaModal = show;
  }

  handleShowSpeseFisseModalChange(show: boolean) {
    this.listaSpeseFisseArray = [];
    this.filterIncassi(this.selectedNegozio, this.selectedTipoIntervento);
    this.showSpeseFisseModal = show;
  }

  handleShowListIncassiModalChange(show: boolean) {
    if (this.selectedIncasso) {
      this.selectedIncasso = null;
    }
    this.showListIncassiModal = show;
  }

  onNegozioOptionSelected(selectedNegozioValue: selectDataSet) {
    if (selectedNegozioValue.value) {
      this.selectedNegozio = String(selectedNegozioValue.value);
    } else {
      this.selectedNegozio = undefined;
    }
    this.filterIncassi(this.selectedNegozio, this.selectedTipoIntervento);
  }

  onTipoInterventoOptionSelected(selectedTipoInterventoValue: selectDataSet) {
    if (selectedTipoInterventoValue.value) {
      this.selectedTipoIntervento = String(selectedTipoInterventoValue.value);
    } else {
      this.selectedTipoIntervento = undefined;
    }
    this.filterIncassi(this.selectedNegozio, this.selectedTipoIntervento);
  }

  filterIncassi(
    selectedNegozioValue?: string,
    selectedTipoInterventoValue?: string
  ) {
    this.loadingTable = true;
    const incassiSubscription = this.firebaseStoreService
      .GetIncassiv2()
      .snapshotChanges()
      .subscribe((data) => {
        const incassiMap: {
          [key: string]: Incassov2 & { hasSpeseFisse?: boolean };
        } = {};

        data.forEach((item) => {
          let incasso = item.payload.val() as Incassov2;
          const mese = incasso.mese;

          const negozioMatch =
            !selectedNegozioValue || incasso.negozio === selectedNegozioValue;
          const tipoInterventoMatch =
            !selectedTipoInterventoValue ||
            incasso.tipo_intervento === selectedTipoInterventoValue;

          if (negozioMatch && tipoInterventoMatch) {
            if (!incassiMap[mese]) {
              incassiMap[mese] = {
                ...incasso,
                hasSpeseFisse: this.mesiSpeseFisseList.includes(mese),
              };
            } else {
              // Unisci i valori degli incassi dello stesso mese
              incassiMap[mese].incasso += incasso.incasso;
              incassiMap[mese].netto += incasso.netto;
              incassiMap[mese].spese += incasso.spese;
              // Aggiungi qui altre proprietà da unire se necessario
            }
          }
        });
        this.incassiShowSubject.next(Object.values(incassiMap));
        this.loadingTable = false;
        this.mesiSpesaFissa = Object.keys(incassiMap);
      });
    this.subscriptions.add(incassiSubscription);
  }

  modaleSpesaFissa() {
    this.showSpesaFissaModal = !this.showSpesaFissaModal;
  }

  modaleListaSpeseFisse(mese: string) {
    this.getListSpeseFisse(mese);
    this.showSpeseFisseModal = !this.showSpeseFisseModal;
  }

  evalSelectDataSet() {
    this.firebaseListService
      .getListValue('negozio')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.filterNegozio = data;
      });
    this.firebaseListService
      .getListValue('tipoIntervento')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.filterTipoIntervento = data;
      });
  }

  getListSpeseFisse(mese: string) {
    const speseFisseSubscription = this.firebaseStoreService
      .getSpeseFisseMese(mese)
      .snapshotChanges()
      .subscribe((data) => {
        this.listaSpeseFisseArray = [];
        data.forEach((item) => {
          this.listaSpeseFisseArray.push(item.payload.val() as SpesaFissa);
        });
      });
    this.subscriptions.add(speseFisseSubscription);
  }

  getListaMesiSpesaFissa() {
    const mesiSpeseFisseSubscription = this.firebaseStoreService
      .getSpeseFisse()
      .snapshotChanges()
      .subscribe((data) => {
        this.mesiSpeseFisseList = [];
        if (data.length > 0) {
          data.forEach((item) => {
            this.mesiSpeseFisseList.push(item.key);
          });
        }
      });
    this.subscriptions.add(mesiSpeseFisseSubscription);
  }

  /**
   * Mostra modale in modalità di modifica / visualizzazione
   **/
  onRowSelectIncassi(event: any) {
    this.meseInputListIncassiModal = this.selectedIncasso.mese;
    this.showListIncassiModal = true;
  }
}
