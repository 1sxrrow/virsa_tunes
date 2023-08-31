import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserModel } from 'src/app/shared/user_data.model';
import { UserDataService } from '../user_data.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseStoreService } from 'src/app/shared/firebase.store.service';
import { SpecificDataModel } from 'src/app/shared/specific_data.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [MessageService],
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

  users: UserModel[] = [];
  constructor(
    private userDataService: UserDataService,
    private firebaseStoreService: FirebaseStoreService,
    private router: Router,
    private messageService: MessageService
  ) {}

  showDialog() {
    this.visible = !this.visible;
  }

  ngOnInit(): void {
    let s = this.firebaseStoreService.GetUserList();
    console.log(s);
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
        : this.userInfoForm.value['numero_telefono']
    );
    this.showModal = !this.showModal;
    this.callModalSuccess('Aggiunto', 'Nuovo utente aggiunto');
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
      this.userInfoForm.value['indirizzo']
    );
    this.callModalSuccess('Modificato', 'Dati utente modificati', 'warn');
    this.showModal = !this.showModal;
  }

  /**
   * Elimina utente, lancia modale per rimozione
   * @param {number} user_id
   * @returns {any}
   **/
  deleteUser(user_id: number) {
    this.userDataService.deleteUser(user_id);
    this.callModalSuccess('Rimosso', 'Utente rimosso con successo', 'error');
  }

  /**
   * Metodo lanciato per aprire modale con dati cliente per modificarli
   */
  showInfoUser(user: any) {
    console.log(user);
    this.userInfoForm = new FormGroup({
      nome: new FormControl(user.nome),
      cognome: new FormControl(user.cognome),
      numero_telefono: new FormControl(user.numero_telefono),
      indirizzo: new FormControl(user.indirizzo),
    });
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
      numero_telefono: new FormControl(''),
      indirizzo: new FormControl(''),
    });
  }

  /**
   * Mostra toast dialog a destra
   * @param {string} summary -> titolo
   * @param {string} detail -> descrizion
   * @param {string} serverity? -> success , info , warn , error
   * @returns {any}
   **/
  callModalSuccess(summary: string, detail: string, severity?: string) {
    console.log(severity);
    this.messageService.add({
      severity: severity === undefined ? 'success' : severity,
      summary: summary,
      detail: detail,
    });
  }
}
