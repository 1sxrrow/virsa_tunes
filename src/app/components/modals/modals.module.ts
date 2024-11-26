import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminToolsModalComponent } from './admin-tools-modal/admin-tools-modal.component';
import { IncassiModalComponent } from './incassi-modal/incassi-modal.component';
import { SpesaFissaModalComponent } from './spesa-fissa-modal/spesa-fissa-modal.component';
import { SpeseFisseModalComponent } from './spese-fisse-modal/spese-fisse-modal.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    SpesaFissaModalComponent,
    SpeseFisseModalComponent,
    IncassiModalComponent,
    AdminToolsModalComponent,
  ],
  imports: [CommonModule, SharedModule],
  exports: [
    SpesaFissaModalComponent,
    SpeseFisseModalComponent,
    IncassiModalComponent,
    AdminToolsModalComponent,
  ],
})
export class ModalComponentsModule {}
