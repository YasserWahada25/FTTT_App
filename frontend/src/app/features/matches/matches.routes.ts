import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const MATCHES_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./matches-list/matches-list.component').then(m => m.MatchesListComponent) },
    { path: ':id', loadComponent: () => import('./match-detail/match-detail.component').then(m => m.MatchDetailComponent) },
    { path: ':id/result', loadComponent: () => import('./match-result/match-result.component').then(m => m.MatchResultComponent), canActivate: [roleGuard], data: { roles: ['ADMIN_FEDERATION', 'REFEREE', 'CLUB_MANAGER'] } },
];
