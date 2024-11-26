import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserDataComponent } from './user-data/user-data.component';
import { UserDataModalComponent } from './user-data-modal/user-data-modal.component';
import { ModalComponentsModule } from '../modals/modals.module';
import { UserListModalComponent } from './user-list-modal/user-list-modal.component';
import { CircleSpinnerComponent } from 'src/app/shared/components/circle-spinner/circle-spinner.component';

@NgModule({
  declarations: [
    UserListComponent,
    UserDataComponent,
    UserDataModalComponent,
    UserListModalComponent,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    ModalComponentsModule,
  ],
})
export class UsersComponentsModule {}
