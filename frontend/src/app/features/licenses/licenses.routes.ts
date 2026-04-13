import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const LICENSES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./licenses-list/licenses-list.component').then((m) => m.LicensesListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_FEDERATION', 'CLUB_MANAGER', 'COACH'] },
    },
    {
        path: 'my',
        loadComponent: () => import('./my-licenses/my-licenses.component').then((m) => m.MyLicensesComponent),
        canActivate: [roleGuard],
    },
    {
        path: 'new',
        loadComponent: () => import('./license-form/license-form.component').then((m) => m.LicenseFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_FEDERATION', 'CLUB_MANAGER', 'PLAYER'] },
    },
    {
        path: ':id',
        loadComponent: () => import('./license-detail/license-detail.component').then((m) => m.LicenseDetailComponent),
        canActivate: [roleGuard],
    },
];
