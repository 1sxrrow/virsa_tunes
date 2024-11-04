import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  styleUrls: ['./admin-tools-modal.component.scss'],
})
export class AdminToolsModalComponent {
  @Input() showAdminModal: boolean;
  @Output() showAdminModalChange = new EventEmitter<boolean>();
  showIncassiModal: boolean;
  showUploadComponent: boolean;
  ambiente: string;
  FileJSON: File;

  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  handleClose() {
    this.showAdminModal = false;
    this.showAdminModalChange.emit(this.showAdminModal);
  }

  handleShowIncassiModalChange(show: boolean) {
    this.showIncassiModal = show;
  }

  showIncassiModalMethod() {
    this.showIncassiModal = !this.showIncassiModal;
  }
  
  showUploadComponentMethod() {
    this.showUploadComponent = !this.showUploadComponent;
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
