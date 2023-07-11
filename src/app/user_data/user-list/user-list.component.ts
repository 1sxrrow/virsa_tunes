import {
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UserModel } from 'src/app/shared/user_data.model';
import { UserDataService } from '../user_data.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [MessageService],
})
export class UserListComponent implements OnInit {
  selectedUser!: UserModel;

  @ViewChild('iNome') iNome: ElementRef;
  @ViewChild('iCognome') iCognome: ElementRef;

  loading = true;
  newUser = false;
  visible = false;

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
      console.log('length = 0');
      this.users = this.userDataService.getUserDatas();
    }
    this.userDataService.usersChanged.subscribe(
      (users: UserModel[]) => {
        console.log('sottoscrivo');
        this.users = users;
        this.messageService.add({
          severity: 'success',
          summary: 'Aggiunto',
          detail: 'Nuovo utente aggiunto',
        });
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
  }

  updateUsers() {
    this.users = this.userDataService.getUserDatas();
  }

  clear(table: Table) {
    table.clear();
  }

  onRowSelect(event: any) {
    console.log(event.data.id);
    this.router.navigate(['users', event.data.id - 1]);
  }

  getInterventi(id: number) {
    return this.userDataService.getTotalInterventi(id - 1);
  }

  AddClient() {
    this.newUser = true;
    console.log(this.newUser);
  }

  addNewUser() {
    console.log(
      this.iCognome.nativeElement.value,
      this.iNome.nativeElement.value
    );
    this.userDataService.addNewUser(
      this.iCognome.nativeElement.value,
      this.iNome.nativeElement.value
    );
    this.newUser = !this.newUser;
  }
}
