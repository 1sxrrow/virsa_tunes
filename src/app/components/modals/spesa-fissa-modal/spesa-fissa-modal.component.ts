import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SpesaFissa } from 'src/app/shared/models/spesaFissa.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { callModalToast } from 'src/app/shared/utils/common-utils';

@Component({
  selector: 'spesa-fissa-modal',
  templateUrl: './spesa-fissa-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class SpesaFissaModalComponent implements OnInit {
  @Input() mesiSpesaFissa: string[];
  @Input() spesaFissaForm: FormGroup;
  @Input() selectedSpesaFissaId: string;
  @Input() spesaFissaMode: string;
  @Input() showSpesaFissaModal: boolean;
  @Output() showSpesaFissaModalChange = new EventEmitter<boolean>();

  selectedSpesaFissa: SpesaFissa;
  showModalSpesaFissa = false;
  showModalListaSpeseFisse = false;

  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.spesaFissaMode !== 'Modifica') {
      this.modaleSpesaFissa();
    }
  }

  handleClose() {
    this.showSpesaFissaModal = false;
    this.showSpesaFissaModalChange.emit(this.showSpesaFissaModal);
  }

  toggleSpesaFissa() {
    let meseSpesaFissa = this.spesaFissaForm.value['meseSpesaFissa'];
    if (this.spesaFissaMode === 'Aggiungi') {
      this.firebaseStoreService.AddSpesaFissa(
        meseSpesaFissa,
        this.spesaFissaForm.value as SpesaFissa
      );
    } else if (this.spesaFissaMode === 'Modifica') {
      this.firebaseStoreService.UpdateSpesaFissa(
        this.selectedSpesaFissaId,
        meseSpesaFissa,
        this.spesaFissaForm.value as SpesaFissa
      );
    }
    callModalToast(
      this.messageService,
      this.spesaFissaMode === 'Aggiungi' ? 'Aggiunto' : 'Modificato',
      'Incasso fisso aggiunto',
      this.spesaFissaMode === 'Aggiungi' ? 'success' : 'info'
    );

    this.modaleSpesaFissa();
    this.handleClose();
  }

  modaleSpesaFissa() {
    this.spesaFissaMode = 'Aggiungi';
    this.showModalSpesaFissa = !this.showModalSpesaFissa;
    this.selectedSpesaFissaId = '';
    this.spesaFissaForm = new FormGroup({
      meseSpesaFissa: new FormControl('', Validators.required),
      notaSpesaFissa: new FormControl('', Validators.required),
      costoSpesaFissa: new FormControl('', Validators.required),
    });
  }
}
