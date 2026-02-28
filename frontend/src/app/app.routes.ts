import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { PrivateLayoutComponent } from './core/layouts/private-layout/private-layout.component';

export const routes: Routes = [
    // Redirect root to login
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

    // Auth routes (public)
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    },

    // Private routes (authenticated)
    {
        path: 'app',
        component: PrivateLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            // Dashboard
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },
            // Users
            {
                path: 'users',
                loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
            },
            // Clubs
            {
                path: 'clubs',
                loadChildren: () => import('./features/clubs/clubs.routes').then(m => m.CLUBS_ROUTES),
            },
            // Profiles
            {
                path: 'profile',
                loadChildren: () => import('./features/profiles/profiles.routes').then(m => m.PROFILES_ROUTES),
            },
            {
                path: 'profiles',
                loadChildren: () => import('./features/profiles/profiles.routes').then(m => m.PROFILES_ROUTES),
            },
            // Licenses
            {
                path: 'licenses',
                loadChildren: () => import('./features/licenses/licenses.routes').then(m => m.LICENSES_ROUTES),
            },
            // Competitions
            {
                path: 'competitions',
                loadChildren: () => import('./features/competitions/competitions.routes').then(m => m.COMPETITIONS_ROUTES),
            },
            // Matches
            {
                path: 'matches',
                loadChildren: () => import('./features/matches/matches.routes').then(m => m.MATCHES_ROUTES),
            },
            // Rankings
            {
                path: 'rankings',
                loadChildren: () => import('./features/rankings/rankings.routes').then(m => m.RANKINGS_ROUTES),
            },
            // Venues
            {
                path: 'venues',
                loadChildren: () => import('./features/venues/venues.routes').then(m => m.VENUES_ROUTES),
            },
        ],
    },

    // Catch-all
    { path: '**', redirectTo: '/auth/login' },
];
