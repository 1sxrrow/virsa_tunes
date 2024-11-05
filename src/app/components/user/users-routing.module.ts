import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserDataComponent } from '../user-data/user-data.component';
import { UserListComponent } from '../user-data/user-list/user-list.component';

const routes = [
  {
    path: '',
    component: UserListComponent,
    data: { animation: 'UserListPage' },
  },
  {
    path: ':id',
    component: UserDataComponent,
    data: { animation: 'UserDataPage' },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
