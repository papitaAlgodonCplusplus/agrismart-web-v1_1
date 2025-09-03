// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from localStorage
    const authToken = this.getAuthToken();

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (authToken) {
      authReq = this.addTokenHeader(req, authToken);
    }

    // Add common headers
    authReq = authReq.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return next.handle(authReq).pipe(
      catchError(error => {
        // Handle 401 Unauthorized errors
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }

        // Handle other errors
        return this.handleOtherErrors(error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((tokenResponse: any) => {
            this.isRefreshing = false;
            
            // Store new tokens
            localStorage.setItem('access_token', tokenResponse.token);
            if (tokenResponse.refreshToken) {
              localStorage.setItem('refresh_token', tokenResponse.refreshToken);
            }

            this.refreshTokenSubject.next(tokenResponse.token);

            // Retry the original request with new token
            return next.handle(this.addTokenHeader(request, tokenResponse.token));
          }),
          catchError((refreshError) => {
            this.isRefreshing = false;
            
            // If refresh token is also invalid, logout user
            this.authService.logout();
            this.router.navigate(['/login']);
            
            return throwError(() => refreshError);
          })
        );
      } else {
        // No refresh token available, logout user
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token available'));
      }
    }

    // If we're already refreshing, wait for the new token
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private handleOtherErrors(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: ' + (error.error?.message || 'Invalid request parameters');
          break;
        case 403:
          errorMessage = 'Forbidden: You don\'t have permission to access this resource';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource was not found';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        case 503:
          errorMessage = 'Service Unavailable: The server is temporarily unavailable';
          break;
        default:
          errorMessage = `Server Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('HTTP Error:', {
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
      url: error.url,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }
}

// Alternative simpler version if you don't need token refresh functionality
@Injectable()
export class SimpleAuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token
    const authToken = localStorage.getItem('access_token');

    // Clone the request and add headers
    let authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401, logout and redirect to login
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        console.error('HTTP Error:', error);
        return throwError(() => error);
      })
    );
  }
}