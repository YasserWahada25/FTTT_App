import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PrivateLayoutComponent } from './core/layouts/private-layout/private-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'app',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-redirect.component').then(
            (m) => m.DashboardRedirectComponent
          ),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_FEDERATION'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'player',
        canActivate: [roleGuard],
        data: { roles: ['PLAYER'], area: 'player' },
        loadComponent: () =>
          import('./features/dashboard/role-area.component').then((m) => m.RoleAreaComponent),
      },
      {
        path: 'manager',
        canActivate: [roleGuard],
        data: { roles: ['CLUB_MANAGER'], area: 'manager' },
        loadComponent: () =>
          import('./features/dashboard/role-area.component').then((m) => m.RoleAreaComponent),
      },
      {
        path: 'coach',
        canActivate: [roleGuard],
        data: { roles: ['COACH'], area: 'coach' },
        loadComponent: () =>
          import('./features/dashboard/role-area.component').then((m) => m.RoleAreaComponent),
      },
      {
        path: 'referee',
        canActivate: [roleGuard],
        data: { roles: ['REFEREE'], area: 'referee' },
        loadComponent: () =>
          import('./features/dashboard/role-area.component').then((m) => m.RoleAreaComponent),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'clubs',
        loadChildren: () => import('./features/clubs/clubs.routes').then((m) => m.CLUBS_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profiles/profiles.routes').then((m) => m.PROFILES_ROUTES),
      },
      {
        path: 'profiles',
        loadChildren: () => import('./features/profiles/profiles.routes').then((m) => m.PROFILES_ROUTES),
      },
      {
        path: 'licenses',
        loadChildren: () => import('./features/licenses/licenses.routes').then((m) => m.LICENSES_ROUTES),
      },
      {
        path: 'competitions',
        loadChildren: () =>
          import('./features/competitions/competitions.routes').then((m) => m.COMPETITIONS_ROUTES),
      },
      {
        path: 'matches',
        loadChildren: () => import('./features/matches/matches.routes').then((m) => m.MATCHES_ROUTES),
      },
      {
        path: 'rankings',
        loadChildren: () => import('./features/rankings/rankings.routes').then((m) => m.RANKINGS_ROUTES),
      },
      {
        path: 'venues',
        loadChildren: () => import('./features/venues/venues.routes').then((m) => m.VENUES_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
