import { NgModule } from '@angular/core';
import { InventarioItemListComponent } from './inventario-list/inventario-item-list.component';
import { RouterModule } from '@angular/router';
const routes = [
  {
    path: '',
    component: InventarioItemListComponent,
    data: { animation: 'InventarioPage' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventarioRoutingModule {}
