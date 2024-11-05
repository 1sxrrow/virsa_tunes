import { NgModule } from '@angular/core';
import { InventarioItemListComponent } from './inventario-list/inventario-item-list.component';
import { InventarioModalComponent } from './inventario-modal/inventario-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { InventarioModalStorage } from './inventario-modal/inventario-modal.service';
import { InventarioRoutingModule } from './inventario.routing.module';

@NgModule({
  declarations: [InventarioItemListComponent, InventarioModalComponent],
  providers: [InventarioModalStorage],
  imports: [CommonModule, SharedModule, InventarioRoutingModule],
})
export class InventarioModule {}
