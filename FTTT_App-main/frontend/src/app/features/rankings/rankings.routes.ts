import { Routes } from '@angular/router';

export const RANKINGS_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./rankings-list/rankings-list.component').then(m => m.RankingsListComponent) },
    { path: ':category', loadComponent: () => import('./rankings-list/rankings-list.component').then(m => m.RankingsListComponent) },
];
