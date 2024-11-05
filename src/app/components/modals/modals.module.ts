import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { UppercaseFirstLetterPipe } from 'src/app/shared/pipes/uppercase.pipe';
import { AdminToolsModalComponent } from './admin-tools-modal/admin-tools-modal.component';
import { IncassiModalComponent } from './incassi-modal/incassi-modal.component';
import { SpesaFissaModalComponent } from './spesa-fissa-modal/spesa-fissa-modal.component';
import { SpeseFisseModalComponent } from './spese-fisse-modal/spese-fisse-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SpesaFissaModalComponent,
    SpeseFisseModalComponent,
    IncassiModalComponent,
    AdminToolsModalComponent,
    UppercaseFirstLetterPipe,
  ],
  imports: [SharedModule],
  exports: [UppercaseFirstLetterPipe],
})
export class ModalComponentsModule {}
