import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const VENUES_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./venues-list/venues-list.component').then(m => m.VenuesListComponent) },
    { path: 'new', loadComponent: () => import('./venue-form/venue-form.component').then(m => m.VenueFormComponent), canActivate: [roleGuard], data: { roles: ['ADMIN_FEDERATION', 'CLUB_MANAGER'] } },
    { path: ':id', loadComponent: () => import('./venue-detail/venue-detail.component').then(m => m.VenueDetailComponent) },
    { path: ':id/reservations', loadComponent: () => import('./venue-reservations/venue-reservations.component').then(m => m.VenueReservationsComponent) },
];
