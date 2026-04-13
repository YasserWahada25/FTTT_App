import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const COMPETITIONS_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./competitions-list/competitions-list.component').then(m => m.CompetitionsListComponent) },
    { path: 'new', loadComponent: () => import('./competition-form/competition-form.component').then(m => m.CompetitionFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN_FEDERATION'] } },
    { path: ':id', loadComponent: () => import('./competition-detail/competition-detail.component').then(m => m.CompetitionDetailComponent) },
    { path: ':id/register', loadComponent: () => import('./competition-register/competition-register.component').then(m => m.CompetitionRegisterComponent) },
    { path: ':id/registrations', loadComponent: () => import('./competition-registrations/competition-registrations.component').then(m => m.CompetitionRegistrationsComponent), canActivate: [roleGuard], data: { roles: ['ADMIN_FEDERATION'] } },
];
