// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, BehaviorSubject, filter, take, switchMap, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get the auth token
  const authToken = getAuthToken();

  // Clone the request and add headers
  let authReq = req;
  if (authToken) {
    authReq = addTokenHeader(req, authToken);
  }

  // Add common headers
  authReq = authReq.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  return next(authReq).pipe(
    catchError((error): Observable<HttpEvent<unknown>> => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, authService, router);
      }

      // Handle other errors
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 403:
            console.error('Access forbidden:', error.message);
            break;
          case 404:
            console.error('Resource not found:', error.message);
            break;
          case 500:
            console.error('Server error:', error.message);
            break;
          default:
            console.error('HTTP error:', error.message);
        }
      }

      return throwError(() => error);
    })
  );
};

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthService, 
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      return authService.refreshToken(refreshToken).pipe(
        switchMap((token: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(token);

          // Store new token
          localStorage.setItem('auth_token', token.access_token);

          // Retry the original request with new token
          return next(addTokenHeader(request, token.access_token));
        }),
        catchError((error) => {
          isRefreshing = false;

          // Refresh failed, logout user
          authService.logout();
          router.navigate(['/login']);

          return throwError(() => error);
        })
      );
    } else {
      // No refresh token, logout immediately
      isRefreshing = false;
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    // If we're already refreshing, wait for it to complete
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next(addTokenHeader(request, token)))
    );
  }
}