import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const CLUBS_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./clubs-list/clubs-list.component').then(m => m.ClubsListComponent) },
    { path: 'new', loadComponent: () => import('./club-form/club-form.component').then(m => m.ClubFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN_FEDERATION'] } },
    { path: ':id', loadComponent: () => import('./club-detail/club-detail.component').then(m => m.ClubDetailComponent) },
    { path: ':id/edit', loadComponent: () => import('./club-form/club-form.component').then(m => m.ClubFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN_FEDERATION', 'CLUB_MANAGER'] } },
];
