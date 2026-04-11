import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-list/users-list.component').then((m) => m.UsersListComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN_FEDERATION'] },
  },
  {
    path: 'new',
    loadComponent: () => import('./user-form/user-form.component').then((m) => m.UserFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN_FEDERATION'] },
  },
  {
    path: ':id',
    loadComponent: () => import('./user-detail/user-detail.component').then((m) => m.UserDetailComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN_FEDERATION'] },
  },
];
