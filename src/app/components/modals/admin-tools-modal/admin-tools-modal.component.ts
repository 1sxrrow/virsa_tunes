import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ConfirmationService,
  ConfirmEventType,
  MessageService,
} from 'primeng/api';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { callModalToast, UploadEvent } from 'src/app/shared/utils/common-utils';
import { UserDataService } from '../../users/user-data/user-data.service';
import { canaleComunicazione } from 'src/app/shared/utils/common-enums';
import { FirebaseApp } from '@angular/fire/app';
@Component({
  selector: 'admin-tools-modal',
  templateUrl: './admin-tools-modal.component.html',
  styleUrls: ['./admin-tools-modal.component.scss'],
})
export class AdminToolsModalComponent implements OnInit {
  @Input() showAdminModal: boolean;
  @Output() showAdminModalChange = new EventEmitter<boolean>();
  showIncassiModal: boolean;
  showUploadComponent: boolean;
  ambiente: string;
  FileJSON: File;

  canaleComResults: { name: string; value: number }[] = [];

  constructor(
    private firebaseApp: FirebaseApp,
    private messageService: MessageService,
    private userDataService: UserDataService,
    private firebaseStoreService: FirebaseStoreService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.ambiente = this.firebaseApp.name;
    this.canaleComResults = this.getCanaleComResults();
  }

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

  getCanaleComResults() {
    const canaleComunicazioniCount: { [key: string]: number } = {};
    this.userDataService.users.forEach((user) => {
      const canaleCom: canaleComunicazione =
        user.canale_com as unknown as canaleComunicazione;
      if (canaleComunicazioniCount[canaleCom]) {
        canaleComunicazioniCount[canaleCom]++;
      } else {
        canaleComunicazioniCount[canaleCom] = 1;
      }
    });
    canaleComunicazioniCount['Totale'] = this.userDataService.users.length;

    const canaleComunicazioniResult = Object.entries(
      canaleComunicazioniCount
    ).map(([key, value]) => ({
      name: key,
      value: value,
    }));

    return canaleComunicazioniResult;
  }
}
