import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CircleSpinnerComponent } from 'src/app/shared/components/circle-spinner/circle-spinner.component';

@NgModule({
  declarations: [LoginComponent, CircleSpinnerComponent],
  imports: [
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
