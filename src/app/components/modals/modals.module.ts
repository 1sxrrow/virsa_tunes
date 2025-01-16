import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminToolsModalComponent } from './admin-tools-modal/admin-tools-modal.component';
import { IncassiModalComponent } from './incassi-modal/incassi-modal.component';
import { SpesaFissaModalComponent } from './spesa-fissa-modal/spesa-fissa-modal.component';
import { SpeseFisseModalComponent } from './spese-fisse-modal/spese-fisse-modal.component';
import { CommonModule } from '@angular/common';
import { ListIncassiModalComponent } from './list-incassi-modal/list-incassi-modal.component';
import { StatsModalComponent } from './stats-modal/stats-modal.component';

@NgModule({
  declarations: [
    SpesaFissaModalComponent,
    SpeseFisseModalComponent,
    IncassiModalComponent,
    ListIncassiModalComponent,
    AdminToolsModalComponent,
    StatsModalComponent,
  ],
  imports: [CommonModule, SharedModule],
  exports: [
    SpesaFissaModalComponent,
    SpeseFisseModalComponent,
    IncassiModalComponent,
    ListIncassiModalComponent,
    AdminToolsModalComponent,
    StatsModalComponent,
  ],
})
export class ModalComponentsModule {}
