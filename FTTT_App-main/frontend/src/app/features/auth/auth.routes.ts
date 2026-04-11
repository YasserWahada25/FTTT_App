import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../../core/layouts/public-layout/public-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register/player',
        loadComponent: () =>
          import('./register-player/register-player.component').then((m) => m.RegisterPlayerComponent),
      },
      {
        path: 'register/staff',
        loadComponent: () =>
          import('./register-staff/register-staff.component').then((m) => m.RegisterStaffComponent),
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./login-callback/login-callback.component').then((m) => m.LoginCallbackComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
      },
      { path: 'register', redirectTo: 'register/player', pathMatch: 'full' },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
