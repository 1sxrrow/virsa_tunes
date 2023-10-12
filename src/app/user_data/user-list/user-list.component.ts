import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/shared/user_data.model';
import { UserDataService } from '../user_data.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import {
  ConfirmEventType,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseStoreService } from 'src/app/shared/firebase.store.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class UserListComponent implements OnInit {
  selectedUser!: UserModel;

  userInfoForm: FormGroup;
  modalTitle: string;
  loading = true;
  showModal = false;
  isInfo = false;
  visible = false;
  savedUserId: number;

  utenteUltimaModifica: string;
  utenteInserimento: string;
  users: UserModel[] = [];
  constructor(
    private userDataService: UserDataService,
    private firebaseStoreService: FirebaseStoreService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private messageService: MessageService
  ) {}

  showDialog() {
    this.visible = !this.visible;
  }

  ngOnInit(): void {
    let s = this.firebaseStoreService.GetUserList();
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

    this.initForm();
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
    this.userDataService.addUser(
      this.userInfoForm.value['nome'],
      this.userInfoForm.value['cognome'],
      this.userInfoForm.value['indirizzo'] === undefined
        ? undefined
        : this.userInfoForm.value['indirizzo'],
      this.userInfoForm.value['numero_telefono'] === undefined
        ? undefined
        : this.userInfoForm.value['numero_telefono'],
      this.userInfoForm.value['citta'] === undefined
        ? undefined
        : this.userInfoForm.value['citta'],
      this.userInfoForm.value['cap'] === undefined
        ? undefined
        : this.userInfoForm.value['cap']
    );
    this.showModal = !this.showModal;
    this.callModalToast('Aggiunto', 'Nuovo utente aggiunto');
  }

  /**
   * Modifica i dati base dell'utente
   * @returns {any}
   **/
  editUser() {
    //TODO: verificare che i dati siano effettivamente da modificare
    this.userDataService.editUser(
      this.savedUserId,
      this.userInfoForm.value['nome'],
      this.userInfoForm.value['cognome'],
      this.userInfoForm.value['numero_telefono'],
      this.userInfoForm.value['indirizzo'],
      this.userInfoForm.value['citta'],
      this.userInfoForm.value['cap']
    );
    this.callModalToast('Modificato', 'Dati utente modificati', 'warn');
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
      ]),
      indirizzo: new FormControl(user.indirizzo),
      citta: new FormControl(user.citta),
      cap: new FormControl(user.cap, [
        Validators.minLength(5),
        Validators.maxLength(5),
      ]),
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
      utente_inserimento: new FormControl(''),
      utente_ultima_modifica: new FormControl(''),
    });
    this.utenteInserimento = undefined;
    this.utenteUltimaModifica = undefined;
  }

  /**
   * Mostra toast dialog a destra
   * @param {string} summary -> titolo
   * @param {string} detail -> descrizion
   * @param {string} serverity? -> success , info , warn , error
   * @returns {any}
   **/
  callModalToast(summary: string, detail: string, severity?: string) {
    this.messageService.add({
      severity: severity === undefined ? 'success' : severity,
      summary: summary,
      detail: detail,
    });
  }

  confirmDeleteUser(user_id: number) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler procedere?',
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user_id);
        this.callModalToast('Eliminato', 'Utente rimosso', 'info');
      },
      reject: (type: ConfirmEventType) => {
        this.callModalToast(
          'Interrotto',
          'Rimozione utente interrotta',
          'warn'
        );
      },
    });
  }
}
