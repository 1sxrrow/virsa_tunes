import { NgModule } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { confirmDialogComponent } from './confirm.dialog.component';

@NgModule({
  declarations: [confirmDialogComponent],
  imports: [ConfirmDialogModule],
  exports: [confirmDialogComponent],
})
export class PersonalConfirmDialogModule {}
