import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserModel } from 'src/app/shared/user_data.model';
import { UserDataService } from '../user_data.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
    private router: Router,
    private messageService: MessageService
  ) {}

  showDialog() {
    this.visible = !this.visible;
  }

  ngOnInit(): void {
    console.log(this.users.length);
    if (this.users.length === 0) {
      this.users = this.userDataService.getUserDatas();
    }
    this.userDataService.usersChanged.subscribe(
      (users: UserModel[]) => {
        console.log('sottoscrivo');
        this.users = users;
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore in inserimento nuovo utente',
        });
        console.log(err);
      }
    );
    this.loading = false;
    this.initForm();
  }

  addUser() {
    this.initForm();
    this.showModalFunction('Aggiungi Cliente', false);
  }

  editUser() {
    this.userDataService.editUser(
      this.savedUserId,
      this.userInfoForm.value['nome'],
      this.userInfoForm.value['cognome'],
      this.userInfoForm.value['numero_telefono'],
      this.userInfoForm.value['indirizzo']
    );
  }

  updateUsers() {
    this.users = this.userDataService.getUserDatas();
  }

  clear(table: Table) {
    table.clear();
  }

  onRowSelect(event: any) {
    this.router.navigate(['users', event.data.id - 1]);
  }

  getInterventi(id: number) {
    return this.userDataService.getTotalInterventi(id - 1);
  }

  showModalFunction(modalTitle: string, isinfo: boolean, id?: number) {
    this.showModal = !this.showModal;
    this.modalTitle = modalTitle;
    this.isInfo = isinfo;
    if (this.isInfo) {
      this.savedUserId = id;
    }
  }

  addNewUser() {
    this.userDataService.addNewUser(
      this.userInfoForm.value['nome'],
      this.userInfoForm.value['cognome']
    );
    this.showModal = !this.showModal;
    this.callModalSuccess('Aggiunto', 'Nuovo utente aggiunto');
  }

  deleteUser(user_id: number) {
    this.userDataService.deleteUser(user_id);
    this.callModalSuccess('Rimosso', 'Utente rimosso con successo');
  }

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

  initForm() {
    this.userInfoForm = new FormGroup({
      nome: new FormControl('', Validators.required),
      cognome: new FormControl('', Validators.required),
      numero_telefono: new FormControl(''),
      indirizzo: new FormControl(''),
    });
  }

  callModalSuccess(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
    });
  }
}
