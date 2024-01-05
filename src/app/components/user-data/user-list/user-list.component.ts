import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ConfirmEventType,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { Incasso } from 'src/app/shared/models/incasso.model';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
import { callModalToast } from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [ConfirmationService],
})
export class UserListComponent implements OnInit {
  selectedUser!: UserModel;

  userInfoForm: FormGroup;
  modalTitle: string;
  loading = true;
  showModal = false;
  showModalIncassi = false;
  isInfo = false;
  visible = false;
  isAdmin = false;
  incassi: Incasso[] = [];
  savedUserId: number;

  canaleComunicazioni: string[];

  utenteUltimaModifica: string;
  utenteInserimento: string;
  users: UserModel[] = [];
  constructor(
    private userDataService: UserDataService,
    private firebaseStoreService: FirebaseStoreService,
    private confirmationService: ConfirmationService,
    private printService: PrintService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

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
            this.incassi.push(item.payload.toJSON() as Incasso);
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
      this.loading = false;
    });

    // Valorizzazione elementi x DropDown Canale_com
    this.canaleComunicazioni = Object.keys(
      this.userDataService.canaleComunicazione
    ).filter((key) => isNaN(+key));
    if (!this.printService.getDevice()) {
      this.printService.chooseDevice();
    }
    this.initForm();
  }

  modaleIncassi() {
    this.showModalIncassi = !this.showModalIncassi;
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
    this.userDataService.addUser(new UserModel(this.userInfoForm.value));
    this.showModal = !this.showModal;
    callModalToast(this.messageService, 'Aggiunto', 'Nuovo utente aggiunto');
  }

  /**
   * Modifica i dati base dell'utente
   * @returns {any}
   **/
  editUser() {
    //TODO: verificare che i dati siano effettivamente da modificare
    this.userDataService.editUser(
      this.savedUserId,
      new UserModel(this.userInfoForm.value)
    );
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
    });
    this.utenteInserimento = undefined;
    this.utenteUltimaModifica = undefined;
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
}
