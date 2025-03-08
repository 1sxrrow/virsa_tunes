import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  ConfirmationService,
  ConfirmEventType,
  MessageService,
} from 'primeng/api';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { callModalToast, UploadEvent } from 'src/app/shared/utils/common-utils';
@Component({
  selector: 'admin-tools-modal',
  templateUrl: './admin-tools-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AdminToolsModalComponent implements OnInit {
  @Input() showAdminModal: boolean;
  @Output() showAdminModalChange = new EventEmitter<boolean>();

  showIncassiModal: boolean;
  showAcquistiModal: boolean;
  showTelefoniModal: boolean;
  showUploadComponent: boolean;
  showStatsModal: boolean;
  ambiente: string;
  FileJSON: File;

  constructor(
    private messageService: MessageService,
    private firebaseStoreService: FirebaseStoreService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
  }

  handleClose() {
    this.showAdminModal = false;
    this.showAdminModalChange.emit(this.showAdminModal);
  }

  handleShowIncassiModalChange(show: boolean) {
    this.showIncassiModal = show;
  }

  handleShowAcquistiModalChange(show: boolean) {
    this.showAcquistiModal = show;
  }

  handleShowTelefoniModalChange(show: boolean) {
    this.showTelefoniModal = show;
  }

  handleShowStatsModalChange(show: boolean) {
    this.showStatsModal = show;
  }

  showIncassiModalMethod() {
    this.showIncassiModal = !this.showIncassiModal;
  }

  showUploadComponentMethod() {
    this.showUploadComponent = !this.showUploadComponent;
  }

  showStatsModalMethod() {
    this.showStatsModal = !this.showStatsModal;
  }

  showAcquistiModalMethod() {
    this.showAcquistiModal = !this.showAcquistiModal;
  }

  showTelefoniModalMethod() {
    this.showTelefoniModal = !this.showTelefoniModal;
  }

  async exportFirebaseDatabaseToJSON() {
    this.firebaseStoreService.exportDatabaseToJSON();
  }

  passaggioAmbiente() {}

  confirmImportFirebaseDatabaseFromJSON() {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler procedere?
    Questa operazione sovrascriverà il database attuale`,
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.importFirebaseDatabaseFromJSON();
      },
      reject: (type: ConfirmEventType) => {
        callModalToast(
          this.messageService,
          'Interrotto',
          'Importazione database interrotta',
          'warn'
        );
      },
    });
  }
  async importFirebaseDatabaseFromJSON() {
    this.firebaseStoreService.importDatabaseFromJSON(this.FileJSON).then(
      () => {
        callModalToast(
          this.messageService,
          'Importato',
          'Database importato con successo'
        );
        this.showUploadComponentMethod();
      },
      (error) => {
        console.log(error);
        callModalToast(
          this.messageService,
          'Errore',
          'Errore import database',
          'error'
        );
      }
    );
  }

  onUploadFileJSON(event: UploadEvent) {
    this.FileJSON = event.files[0];
  }
}
