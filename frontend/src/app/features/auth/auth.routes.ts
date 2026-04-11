import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '../../core/layouts/public-layout/public-layout.component';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
            { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
            { path: 'unauthorized', loadComponent: () => import('./unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    }
];
