import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoginComponent } from './login.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    RouterModule.forChild([
      {
        path: '',
        component: LoginComponent,
        data: { animation: 'LoginPage' },
      },
    ]),
  ],
})
export class LoginModule {}
