import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ConfirmationService,
  ConfirmEventType,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { Incasso } from 'src/app/shared/models/incasso.model';
import { SpesaFissa } from 'src/app/shared/models/spesaFissa.model';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
import { canaleComunicazione } from 'src/app/shared/utils/common-enums';
import {
  callModalToast,
  getBreadcrumbHome,
  UploadEvent,
} from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [ConfirmationService],
})
export class UserListComponent implements OnInit {
  ambiente: string = '';
  items: MenuItem[] | undefined = [{ label: 'Database', routerLink: '/users' }];
  home: MenuItem | undefined = getBreadcrumbHome();
  selectedUser!: UserModel;
  selectedSpesaFissa: SpesaFissa;
  selectedSpesaFissaId: string;
  selectedNegozio: string = '';
  filterNegozio: string[] = [];
  filteredIncassi: any = [];
  canaleComResults: { name: string; value: number }[] = [];

  userInfoForm: FormGroup;
  spesaFissaForm: FormGroup;
  modalTitle: string;
  loading = true;
  showModal = false;
  showModalIncassi = false;
  showModalSpesaFissa = false;
  showModalListaSpeseFisse = false;
  showAdminDialog = false;
  showUploadComponent = false;
  spesaFissaMode: string;
  listaSpeseFisse: SpesaFissa[] = [];
  FileJSON: File;

  isInfo = false;
  visible = false;
  savedUserId: number;
  checkedFattura: boolean = false;

  incassi: Incasso[] = [];
  canaleComunicazioni: string[];
  mesiSpesaFissa: string[] = [];
  users: UserModel[] = [];

  utenteUltimaModifica: string;
  utenteInserimento: string;
  constructor(
    private userDataService: UserDataService,
    private firebaseStoreService: FirebaseStoreService,
    private confirmationService: ConfirmationService,
    private printService: PrintService,
    private authService: AuthService,
    private firebaseApp: FirebaseApp,
    private router: Router,
    private messageService: MessageService
  ) {
    this.ambiente = this.firebaseApp.name;
  }

  showDialog() {
    this.visible = !this.visible;
  }

  ngOnInit(): void {
    let s = this.firebaseStoreService.GetUserList();
    if (this.authService.getIsAdmin()) {
      this.firebaseStoreService
        .GetIncassi()
        .snapshotChanges()
        .subscribe((data) => {
          this.incassi = [];
          data.map((item) => {
            let spesaFissa = item.payload
              .child('spesaFissa')
              .val() as SpesaFissa[];
            let incasso = item.payload.val() as Incasso;
            incasso.spesaFissa = spesaFissa;
            this.incassi.push(incasso);
          });

          this.incassi.map((incasso) => {
            this.mesiSpesaFissa.push(incasso.mese);
          });
        });
    }
    s.snapshotChanges().subscribe((data) => {
      this.users = [];
      data.forEach((item) => {
        let a = item.payload.toJSON();
        a['$key'] = item.key;
        let b = a as UserModel;
        if (!b.specific_data) {
          b.specific_data = [];
        } else {
        }
        this.users.push(b);
      });
      this.userDataService.users = this.users;
      this.canaleComResults = this.getCanaleComResults();
      this.loading = false;
    });

    // Valorizzazione elementi x DropDown Canale_com
    this.canaleComunicazioni = Object.keys(
      this.userDataService.canaleComunicazione
    ).filter((key) => isNaN(+key));

    this.filterNegozio = Object.keys(this.userDataService.negozio).filter(
      (key) => key !== 'Magazzino' && isNaN(+key)
    );

    // Seleziona la stampante
    if (!this.printService.getDevice()) {
      if (!this.printService.isDeviceChosen()) {
        this.printService.chooseDevice();
        this.printService.setDeviceChosen(true);
      }
    }

    this.initForm();
  }

  modaleIncassi() {
    this.showModalIncassi = !this.showModalIncassi;
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

  modaleListaSpeseFisse(mese: string) {
    this.firebaseStoreService
      .GetIncassi()
      .snapshotChanges()
      .subscribe((data) => {
        data.map((item) => {
          if (item.payload.child('mese').val() === mese) {
            let spesaFissa = item.payload
              .child('spesaFissa')
              .val() as SpesaFissa[];
            this.listaSpeseFisse = spesaFissa;
          }
        });
      });
    this.showModalListaSpeseFisse = !this.showModalListaSpeseFisse;
  }

  addUser() {
    this.initForm();
    this.showModalFunction('Aggiungi Cliente', false);
  }

  updateUsers() {
    this.users = this.userDataService.getUserDatas();
  }

  clear(table: Table) {
    table.clear();
  }

  onRowSelect(event: any) {
    this.router.navigate(['users', event.data.id]);
  }

  getInterventi(id: number) {
    return this.userDataService.getTotalInterventi(id);
  }

  /**
   * Metodo per far vedere il modale per Aggiunta/modifica utente
   * @returns {any}
   **/
  showModalFunction(modalTitle: string, isinfo: boolean, id?: number) {
    this.showModal = !this.showModal;
    this.modalTitle = modalTitle;
    this.isInfo = isinfo;
    if (this.isInfo) {
      this.savedUserId = id;
    }
  }

  /**
   * Metodo per aggiunta di un utente
   * @returns {any}
   **/
  addNewUser() {
    let datiFattura;
    this.checkedFattura
      ? (datiFattura = {
          partitaIva: this.userInfoForm.value['partitaIva'],
          pec: this.userInfoForm.value['pec'],
          codiceUnivoco: this.userInfoForm.value['codiceUnivoco'],
          codiceFiscale: this.userInfoForm.value['codiceFiscale'],
          datiFattura: this.userInfoForm.value['datiFattura'],
          denominazione: this.userInfoForm.value['denominazione'],
          indirizzoFatturazione:
            this.userInfoForm.value['indirizzoFatturazione'],
          cittaFatturazione: this.userInfoForm.value['cittaFatturazione'],
        })
      : (datiFattura = {});
    let user = new UserModel({
      ...this.userInfoForm.value,
      datiFattura: datiFattura,
    });
    let idReturned = this.userDataService.addUser(user);
    this.showModal = !this.showModal;

    this.router.navigate(['users', idReturned], { state: { newUser: true } });
  }

  /**
   * Modifica i dati base dell'utente
   * @returns {any}
   **/
  editUser() {
    let datiFattura;
    this.checkedFattura
      ? (datiFattura = {
          partitaIva: this.userInfoForm.value['partitaIva'],
          pec: this.userInfoForm.value['pec'],
          codiceUnivoco: this.userInfoForm.value['codiceUnivoco'],
          codiceFiscale: this.userInfoForm.value['codiceFiscale'],
          datiFattura: this.userInfoForm.value['datiFattura'],
          denominazione: this.userInfoForm.value['denominazione'],
          indirizzoFatturazione:
            this.userInfoForm.value['indirizzoFatturazione'],
          cittaFatturazione: this.userInfoForm.value['cittaFatturazione'],
        })
      : (datiFattura = {});
    let user = new UserModel({
      ...this.userInfoForm.value,
      datiFattura: datiFattura,
    });
    //TODO: verificare che i dati siano effettivamente da modificare
    this.userDataService.editUser(this.savedUserId, user);
    callModalToast(
      this.messageService,
      'Modificato',
      'Dati utente modificati',
      'warn'
    );
    this.showModal = !this.showModal;
  }

  /**
   * Elimina utente, lancia modale per rimozione
   * @param {number} user_id
   * @returns {any}
   **/
  deleteUser(user_id: number) {
    this.userDataService.deleteUser(user_id);
  }

  /**
   * Metodo lanciato per aprire modale con dati cliente per modificarli
   */
  showInfoUser(user: any) {
    this.checkedFattura = user.datiFattura?.datiFattura;
    this.userInfoForm = new FormGroup({
      nome: new FormControl(user.nome, Validators.required),
      cognome: new FormControl(user.cognome, Validators.required),
      numero_telefono: new FormControl(user.numero_telefono, [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
      ]),
      indirizzo: new FormControl(user.indirizzo, Validators.required),
      citta: new FormControl(user.citta, Validators.required),
      cap: new FormControl(user.cap, [
        Validators.minLength(5),
        Validators.maxLength(5),
        Validators.required,
      ]),
      canale_com: new FormControl(user.canale_com, Validators.required),
      datiFattura: new FormControl(user.datiFattura?.datiFattura),
      partitaIva: new FormControl(user.datiFattura?.partitaIva),
      codiceUnivoco: new FormControl(user.datiFattura?.codiceUnivoco),
      pec: new FormControl(user.datiFattura?.pec),
      codiceFiscale: new FormControl(user.datiFattura?.codiceFiscale),
      denominazione: new FormControl(user.datiFattura?.denominazione),
      indirizzoFatturazione: new FormControl(
        user.datiFattura?.indirizzoFatturazione
      ),
      cittaFatturazione: new FormControl(user.datiFattura?.cittaFatturazione),
    });
    this.utenteInserimento = user.utente_inserimento;
    this.utenteUltimaModifica = user.ultimo_utente_modifica;
    this.showModalFunction('Info Cliente', true, user.id);
  }

  /**
   * Metodo lanciato per inizializzare dati del form del modale
   * @returns {any}
   **/
  initForm() {
    this.userInfoForm = new FormGroup({
      nome: new FormControl('', Validators.required),
      cognome: new FormControl('', Validators.required),
      numero_telefono: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      indirizzo: new FormControl(''),
      citta: new FormControl(''),
      cap: new FormControl('', [
        Validators.minLength(5),
        Validators.maxLength(5),
      ]),
      canale_com: new FormControl('', Validators.required),
      utente_inserimento: new FormControl(''),
      utente_ultima_modifica: new FormControl(''),
      partitaIva: new FormControl(''),
      pec: new FormControl(''),
      codiceUnivoco: new FormControl(''),
      codiceFiscale: new FormControl(''),
      datiFattura: new FormControl(false),
      denominazione: new FormControl(''),
      indirizzoFatturazione: new FormControl(''),
      cittaFatturazione: new FormControl(''),
    });
    this.utenteInserimento = undefined;
    this.utenteUltimaModifica = undefined;

    this.spesaFissaForm = new FormGroup({
      meseSpesaFissa: new FormControl('', Validators.required),
      notaSpesaFissa: new FormControl('', Validators.required),
      costoSpesaFissa: new FormControl('', Validators.required),
    });
  }
  confirmDeleteUser(user_id: number) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler procedere?',
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user_id);
        callModalToast(
          this.messageService,
          'Eliminato',
          'Utente rimosso',
          'info'
        );
      },
      reject: (type: ConfirmEventType) => {
        callModalToast(
          this.messageService,
          'Interrotto',
          'Rimozione utente interrotta',
          'warn'
        );
      },
    });
  }

  enterCheck() {
    if (this.isInfo && this.userInfoForm.valid && this.userInfoForm.dirty) {
      this.editUser();
    }
    if (!this.isInfo && this.userInfoForm.valid) {
      this.addNewUser();
    }
  }

  getCanaleComResults() {
    const canaleComunicazioniCount: { [key: string]: number } = {};
    this.users.forEach((user) => {
      const canaleCom: canaleComunicazione =
        user.canale_com as unknown as canaleComunicazione;
      if (canaleComunicazioniCount[canaleCom]) {
        canaleComunicazioniCount[canaleCom]++;
      } else {
        canaleComunicazioniCount[canaleCom] = 1;
      }
    });
    canaleComunicazioniCount['Totale'] = this.users.length;

    const canaleComunicazioniResult = Object.entries(
      canaleComunicazioniCount
    ).map(([key, value]) => ({
      name: key,
      value: value,
    }));

    return canaleComunicazioniResult;
  }

  myModelChanged(event) {}

  editSpesaFissa() {
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
  }

  onRowSelectSpesaFissa(event) {
    this.spesaFissaMode = 'Modifica';
    this.showModalSpesaFissa = true;
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
    this.firebaseStoreService.DeleteSpesaFissa(id, mese);
  }

  retrieveValueNegozioForTableView() {
    this.filteredIncassi = [];
    this.incassi.forEach((incasso) => {
      return incasso.negozi.forEach((negozio) => {
        if (negozio.negozio === this.selectedNegozio) {
          this.filteredIncassi.push({
            mese: incasso.mese,
            negozio: negozio,
            spesaFissa: incasso.spesaFissa,
          });
        }
      });
    });
    console.log(this.filteredIncassi);
  }

  clearSelectedNegozio() {
    this.selectedNegozio = '';
    console.log(this.selectedNegozio);
  }

  showAdminDialogModal() {
    this.showAdminDialog = !this.showAdminDialog;
  }
  showUploadComponentMethod() {
    this.showUploadComponent = !this.showUploadComponent;
  }

  async exportFirebaseDatabaseToJSON() {
    this.firebaseStoreService.exportDatabaseToJSON();
  }

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

  passaggioAmbiente() {}
}
