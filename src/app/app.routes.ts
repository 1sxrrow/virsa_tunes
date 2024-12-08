import { Routes } from '@angular/router';
import { AuthGuard } from './components/login/auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { usersWithInterventiResolver } from './components/users/user-list.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./components/users/users.module').then(
        (m) => m.UsersComponentsModule
      ),
    canActivate: [AuthGuard],
    // resolve: { usersWithInterventi: usersWithInterventiResolver },
    // runGuardsAndResolvers: 'always',
  },
  {
    path: 'inventario',
    loadChildren: () =>
      import('./components/inventario/inventario.module').then(
        (m) => m.InventarioModule
      ),
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
