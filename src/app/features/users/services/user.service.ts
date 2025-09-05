
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';

export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  profileId?: number;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  role?: string;
  profileId?: number;
  farmId?: number;
}

interface BackendResponse<T> {
  success: boolean;
  result: T;
  exception?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl: string;

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.apiConfig.getEndpoint('user');
  }

  /**
   * Get all users with optional filters
   */
  getAll(filters?: UserFilters): Observable<User[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    let params = new HttpParams();
    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.role) {
        params = params.set('role', filters.role);
      }
      if (filters.profileId) {
        params = params.set('profileId', filters.profileId.toString());
      }
      if (filters.farmId) {
        params = params.set('farmId', filters.farmId.toString());
      }
    }

    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<User[]>>(url, { headers, params })
      .pipe(
        map(response => {
          console.log('UserService.getAll response:', response);
          if (response.success) {
            return response.result || [];
          }
          throw new Error(`Get users failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('UserService.getAll error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get user by ID
   */
  getById(id: number): Observable<User> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<User>>(url, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get user failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create user
   */
  create(data: Partial<User>): Observable<User> {
    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.post<BackendResponse<User>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Create user failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update user
   */
  update(id: number, data: Partial<User>): Observable<User> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<User>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update user failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  updateProfile(id: number, data: Partial<User>): Observable<User> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/profile/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.put<BackendResponse<User>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update user profile failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  changePassword(id: number, passwordData: { currentPassword: string; newPassword: string }): Observable<void> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/change-password/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.post<BackendResponse<void>>(url, passwordData, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return;
          }
          throw new Error(`Change password failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  updatePreferences(id: number, preferences: any): Observable<User> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/preferences/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.put<BackendResponse<User>>(url, { preferences }, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update preferences failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  toggleTwoFactor(userId: number, newStatus: boolean): Observable<void> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/two-factor/${userId}`);
    const headers = this.getAuthHeaders();
    return this.http.post<BackendResponse<void>>(url, { enabled: newStatus }, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return;
          }
          throw new Error(`Toggle two-factor authentication failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete user
   */
  delete(id: number): Observable<void> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.delete<BackendResponse<void>>(url, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return;
          }
          throw new Error(`Delete user failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('UserService error:', error);
    throw error;
  }
}
