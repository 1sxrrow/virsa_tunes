import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { UserDataComponent } from './user_data/user_data.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { UserListComponent } from './user_data/user-list/user-list.component';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { UserEditComponent } from './user_data/user-edit/user-edit.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { KeyFilterModule } from 'primeng/keyfilter';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { firebaseConfig } from 'src/environments/environment';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { CircleSpinnerComponent } from './shared/circle-spinner/circle-spinner.component';
import { CurrencyPipe } from '@angular/common';
import { AuthGuard } from './login/auth.guard';
import { PersonalConfirmDialogModule } from './shared/confirm-dialog/confirm.dialog.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    children: [
      { path: '', component: UserListComponent },
      { path: ':id', component: UserDataComponent },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginModule),
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  declarations: [
    AppComponent,
    UserDataComponent,
    HeaderComponent,
    UserListComponent,
    UserEditComponent,
    CircleSpinnerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgbModule,
    ButtonModule,
    TableModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    KeyFilterModule,
    DialogModule,
    PersonalConfirmDialogModule,
    ToastModule,
    TooltipModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideDatabase(() => getDatabase()),
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: firebaseConfig },
    CurrencyPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
