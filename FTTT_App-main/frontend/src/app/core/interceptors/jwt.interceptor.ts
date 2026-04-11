import { inject } from '@angular/core';
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

const AUTH_RETRY_CONTEXT = new HttpContextToken<boolean>(() => false);

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  if (!authService.shouldAttachToken(req.url)) {
    return next(req);
  }

  return authService.getValidAccessToken().pipe(
    switchMap((token) => {
      const requestWithToken = token ? attachBearerToken(req, token) : req;

      return next(requestWithToken).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && !req.context.get(AUTH_RETRY_CONTEXT)) {
            return authService.getValidAccessToken(true).pipe(
              switchMap((refreshedToken) => {
                if (!refreshedToken) {
                  authService.handleUnauthorized();
                  return throwError(() => error);
                }

                const retryRequest = attachBearerToken(req, refreshedToken).clone({
                  context: req.context.set(AUTH_RETRY_CONTEXT, true),
                });

                return next(retryRequest).pipe(
                  catchError((retryError: HttpErrorResponse) => {
                    authService.handleUnauthorized();
                    return throwError(() => retryError);
                  })
                );
              })
            );
          }

          if (error.status === 403) {
            authService.navigateToUnauthorized();
          }

          return throwError(() => error);
        })
      );
    })
  );
};

function attachBearerToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
