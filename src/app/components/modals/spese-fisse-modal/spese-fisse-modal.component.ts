import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SpesaFissa } from 'src/app/shared/models/custom-interfaces';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { callModalToast } from 'src/app/shared/utils/common-utils';

@Component({
  selector: 'spese-fisse-modal',
  templateUrl: './spese-fisse-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class SpeseFisseModalComponent implements OnInit, OnDestroy {
  @Input() showListaSpeseFisseModal: boolean;
  @Input() listaSpeseFisse: SpesaFissa[];
  @Output() showSpeseFisseModalChange = new EventEmitter<boolean>();

  spesaFissaMode: string;
  spesaFissaForm: FormGroup;
  selectedSpesaFissaId: string;
  showSpesaFissaModal: boolean = false;
  selectedSpesaFissa: SpesaFissa;
  mesiSpeseFisseList: string[] = [];
  private subscriptions: Subscription = new Subscription();
  
  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getListaMesiSpesaFissa();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleClose() {
    this.showListaSpeseFisseModal = false;
    this.showSpeseFisseModalChange.emit(this.showListaSpeseFisseModal);
  }

  handleShowSpesaFissaModalChange(show: boolean) {
    this.showSpesaFissaModal = show;
    this.selectedSpesaFissa = null;
  }

  modaleSpesaFissa() {
    this.showSpesaFissaModal = !this.showSpesaFissaModal;
  }

  async onRowSelectSpesaFissa(event) {
    this.spesaFissaMode = 'Modifica';
    this.showSpesaFissaModal = true;
    this.selectedSpesaFissaId = event.data.id;
    this.spesaFissaForm = new FormGroup({
      meseSpesaFissa: new FormControl(
        event.data.meseSpesaFissa,
        Validators.required
      ),
      notaSpesaFissa: new FormControl(
        event.data.notaSpesaFissa,
        Validators.required
      ),
      costoSpesaFissa: new FormControl(
        event.data.costoSpesaFissa,
        Validators.required
      ),
    });
  }

  confirmDeleteSpesaFissa(id: string, mese: string) {
    this.listaSpeseFisse = this.listaSpeseFisse.filter(
      (item) => item.id !== id
    );
    this.firebaseStoreService.DeleteSpesaFissa(id, mese);
    callModalToast(
      this.messageService,
      'Rimosso',
      'Incasso fisso rimosso',
      'warn'
    );
  }

  getListaMesiSpesaFissa() {
    this.subscriptions.add(
      this.firebaseStoreService
        .getSpeseFisse()
        .snapshotChanges()
        .subscribe((data) => {
          this.mesiSpeseFisseList = [];
          if (data.length > 0) {
            data.forEach((item) => {
              this.mesiSpeseFisseList.push(item.key);
            });
          }
        })
    );
  }
}
