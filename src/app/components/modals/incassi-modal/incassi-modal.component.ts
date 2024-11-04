import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { Incassov2 } from 'src/app/shared/models/incassov2.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { UserDataService } from '../../user-data/user-data.service';
import { SpesaFissa } from 'src/app/shared/models/spesaFissa.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'incassi-modal',
  templateUrl: './incassi-modal.component.html',
  styleUrls: ['./incassi-modal.component.scss'],
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

  constructor(
    private userDataService: UserDataService,
    private firebaseStoreService: FirebaseStoreService
  ) {}

  ngOnInit(): void {
    this.filterNegozio = Object.keys(this.userDataService.negozio)
      .filter((key) => key !== 'Magazzino' && isNaN(+key))
      .map((key) => ({
        value: key,
        label: key,
      }));

    this.filterTipoIntervento = Object.keys(this.userDataService.tipoIntervento)
      .filter((key) => isNaN(+key))
      .map((key) => ({
        value: key,
        label: key,
      }));
    this.filterIncassi();
    this.getListaMesiSpesaFissa();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleClose() {
    this.showIncassiModal = false;
    this.showIncassiModalChange.emit(this.showIncassiModal);
  }

  handleShowSpesaFissaModalChange(show: boolean) {
    this.showSpesaFissaModal = show;
  }

  handleShowSpeseFisseModalChange(show: boolean) {
    this.listaSpeseFisseArray = [];
    this.showSpeseFisseModal = show;
  }

  onNegozioOptionSelected(selectedNegozioValue: string) {
    this.selectedNegozio = selectedNegozioValue;
    this.filterIncassi(this.selectedNegozio, this.selectedTipoIntervento);
  }

  onTipoInterventoOptionSelected(selectedTipoInterventoValue: string) {
    this.selectedTipoIntervento = selectedTipoInterventoValue;
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
        const incassiMap: { [key: string]: Incassov2 } = {};

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
              incassiMap[mese] = { ...incasso };
            } else {
              // Unisci i valori degli incassi dello stesso mese
              incassiMap[mese].incasso += incasso.incasso;
              incassiMap[mese].netto += incasso.netto;
              incassiMap[mese].spese += incasso.spese;
              // Aggiungi qui altre proprietà da unire se necessario
            }
          }
        });
        this.incassiShow = Object.values(incassiMap);
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
