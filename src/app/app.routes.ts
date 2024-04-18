import { Routes } from '@angular/router';
import { AuthGuard } from './components/login/auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { UserDataComponent } from './components/user-data/user-data.component';
import { UserListComponent } from './components/user-data/user-list/user-list.component';
import { InventarioItemListComponent } from './components/inventario/inventario-list/inventario-item-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    children: [
      {
        path: '',
        component: UserListComponent,
        data: { animation: 'UserListPage' },
      },
      {
        path: ':id',
        component: UserDataComponent,
        data: { animation: 'UserDataPage' },
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'inventario',
    children: [
      {
        path: '',
        component: InventarioItemListComponent,
        data: { animation: 'InventarioPage' },
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./components/login/login.module').then((m) => m.LoginModule),
    data: { animation: 'LoginPage' },
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: '/not-found' },
];
