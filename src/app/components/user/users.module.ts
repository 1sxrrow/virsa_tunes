import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserDataComponent } from '../user-data/user-data.component';
import { UserListComponent } from '../user-data/user-list/user-list.component';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
  declarations: [UserListComponent, UserDataComponent],
  imports: [CommonModule, UsersRoutingModule, SharedModule],
})
export class UsersComponentsModule {}
