// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiConfigService } from '../services/api-config.service';
import { Router } from '@angular/router';

export interface LoginRequest {
  UserEmail: string;    // Backend expects 'UserEmail'
  Password: string;     // Backend expects 'Password'
}

// Backend response structure (matches your C# LoginResponse wrapped in Response<T>)
export interface BackendLoginResponse {
  success: boolean;
  exception: any;
  result: {
    Id: number;
    ClientId: number;
    UserName: string;
    ProfileId: number;
    Token: string;
    ValidTo: string;
    Active: boolean;
  };
}

// Normalized frontend interface
export interface LoginResponse {
  token: string;
  refreshToken?: string; // Optional since backend doesn't provide it
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private router: Router
  ) {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      // Decode token and set user
      this.setCurrentUser(this.decodeToken(token));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>( // Changed to 'any' to see raw response
      `${this.apiConfig.agronomicApiUrl}${this.apiConfig.endpoints.auth.login}`,
      credentials
    ).pipe(
      tap(rawResponse => {
        // CRITICAL: Log the raw response FIRST
        console.log('RAW BACKEND RESPONSE:', rawResponse);
        console.log('Response type:', typeof rawResponse);
        console.log('Response keys:', Object.keys(rawResponse || {}));
      }),
      map(backendResponse => {
        // Try multiple possible response structures
        let token = undefined;
        let userInfo = {};

        // Structure 1: Wrapped in Response<T> (success/result)
        if (backendResponse?.success && backendResponse?.result) {
          console.log('Found success/result structure');
          const result = backendResponse.result;
          token = result.Token || result.token;
          userInfo = {
            id: result.Id || result.id,
            clientId: result.ClientId || result.clientId,
            userName: result.UserName || result.userName,
            profileId: result.ProfileId || result.profileId,
            active: result.Active || result.active
          };
        }
        // Structure 2: Direct LoginResponse object
        else if (backendResponse?.Token || backendResponse?.token) {
          console.log('Found direct token structure');
          token = backendResponse.Token || backendResponse.token;
          userInfo = {
            id: backendResponse.Id || backendResponse.id,
            clientId: backendResponse.ClientId || backendResponse.clientId,
            userName: backendResponse.UserName || backendResponse.userName,
            profileId: backendResponse.ProfileId || backendResponse.profileId,
            active: backendResponse.Active || backendResponse.active
          };
        }
        // Structure 3: Other possible structures
        else {
          console.error('Unknown response structure:', backendResponse);
          throw new Error('Unknown response format');
        }

        console.log('Extracted token:', token);
        console.log('Extracted user info:', userInfo);

        const finalResponse = {
          token: token,
          refreshToken: '',
          user: userInfo
        };

        console.log('Final transformed response:', finalResponse);
        return finalResponse;
      }),
      tap(response => {
        console.log('Storing token:', response.token);
        if (response.token && response.token !== 'undefined') {
          localStorage.setItem('access_token', response.token);
        } else {
          console.error('Cannot store undefined/null token');
        }
        this.setCurrentUser(response.user);
        console.log('Token in localStorage:', localStorage.getItem('access_token'));
      })
    );
  }

  // Helper method to create login request with proper property names
  createLoginRequest(email: string, password: string): LoginRequest {
    return {
      UserEmail: email,
      Password: password
    };
  }


  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    console.log('Token from localStorage:', token);
    console.log('Token exists:', !!token);

    if (!token || token === 'undefined' || token === 'null') {
      return false;
    }

    const isExpired = this.isTokenExpired(token);
    console.log('Token expired:', isExpired);
    console.log('Final authentication result:', !!token && !isExpired);

    return !!token && !isExpired;
  }

  private setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

  private decodeToken(token: string): any {
    try {
      if (!token || token === 'undefined' || token === 'null') {
        return null;
      }
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  public getUserRoles(): string[] {
    const user = this.currentUserSubject.value;
    return user?.roles || [];
  }

  public refreshToken(refreshToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiConfig.agronomicApiUrl}${this.apiConfig.endpoints.auth.refreshToken}`,
      { refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken);
        }
        this.setCurrentUser(response.user);
      })
    );
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      console.log('Decoded token:', decoded);

      if (!decoded || !decoded.exp) {
        console.log('No exp claim, considering expired');
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = currentTime >= decoded.exp;
      console.log('Current time:', currentTime, 'Token exp:', decoded.exp, 'Expired:', isExpired);

      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  public getRedirectUrl(): string {
    const user = this.currentUserSubject.value;
    if (!user) {
      return '/login';
    }
    // Example logic: redirect admins to /admin, others to /dashboard
    if (user.email === 'ebrecha@iapsoft.com' || user.role === 'Admin') {
      return '/admin';
    }
    return '/dashboard';
  }

  public shouldRedirectToAdmin(): boolean {
    const user = this.currentUserSubject.value;
    console.log('Current user for admin check:', user);
    return user?.email === 'ebrecha@iapsoft.com' || user?.userName === 'ebrecha@iapsoft.com' || user?.role === 'Admin';
  }

  public getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  public isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'Admin' || user?.roleId === 1; // Assuming roleId 1 is Admin
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}