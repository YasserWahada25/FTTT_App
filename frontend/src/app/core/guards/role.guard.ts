import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[] | undefined;

  return authService.getValidAccessToken().pipe(
    take(1),
    map((token) => {
      if (!token) {
        return router.createUrlTree(['/auth/login']);
      }

      if (!requiredRoles?.length || authService.hasRole(requiredRoles)) {
        return true;
      }

      return router.createUrlTree(['/auth/unauthorized']);
    })
  );
};
