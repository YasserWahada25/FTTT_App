import { Routes } from '@angular/router';

export const PROFILES_ROUTES: Routes = [
    { path: 'me', loadComponent: () => import('./my-profile/my-profile.component').then(m => m.MyProfileComponent) },
    { path: '', loadComponent: () => import('./profiles-list/profiles-list.component').then(m => m.ProfilesListComponent) },
    { path: ':id', loadComponent: () => import('./profile-detail/profile-detail.component').then(m => m.ProfileDetailComponent) },
];
