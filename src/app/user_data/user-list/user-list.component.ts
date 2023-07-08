import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/shared/user_data.model';
import { UserDataService } from '../user_data.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  selectedUser!: UserModel;
  loading: boolean = true;

  users: UserModel[];
  constructor(
    private userDataService: UserDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.users = this.userDataService.getUserDatas();
    this.loading = false;
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
    // this.userDataService.addUser();
  }
}
