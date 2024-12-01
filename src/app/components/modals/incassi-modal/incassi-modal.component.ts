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
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Incassov2, SpesaFissa } from 'src/app/shared/models/custom-interfaces';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { selectDataSet } from 'src/app/shared/types/custom-types';
import {
  negozioInventario,
  tipoIntervento,
} from 'src/app/shared/utils/common-enums';

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
  showSpesaFissaModal: boolean = false;
  showSpeseFisseModal: boolean = false;
  selectedTipoIntervento: string = '';
  filterNegozio: { value: string; label: string }[];
  filterTipoIntervento: { value: string; label: string }[];
  loadingTable: boolean = true;
  incassiShow: Incassov2[] = [];
  mesiSpesaFissa: string[] = [];
  mesiSpeseFisseList: string[] = [];
  listaSpeseFisseArray: SpesaFissa[] = [];

  private subscriptions: Subscription = new Subscription();
  private incassiShowSubject = new BehaviorSubject<Incassov2[]>([]);
  incassiShow$: Observable<Incassov2[]> =
    this.incassiShowSubject.asObservable();

  constructor(private firebaseStoreService: FirebaseStoreService) {}

  ngOnInit(): void {
    this.evalSelectDataSet();
    this.getListaMesiSpesaFissa();
    this.filterIncassi();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    this.filterNegozio = Object.keys(negozioInventario)
      .filter((key) => key !== 'Magazzino' && isNaN(+key))
      .map((key) => ({
        value: key,
        label: key,
      }));

    this.filterTipoIntervento = Object.keys(tipoIntervento)
      .filter((key) => isNaN(+key))
      .map((key) => ({
        value: key,
        label: key,
      }));
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
}
