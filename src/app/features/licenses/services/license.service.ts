
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';


interface BackendResponse<T> {
  success: boolean;
  result: T;
  exception?: string;
  message?: string;
}
export interface License {
  id?: number;
  name?: string;
  description?: string;
  licenseKey?: string;
  validFrom?: Date;
  validTo?: Date;
  maxUsers?: number;
  maxDevices?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LicenseFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private readonly baseUrl: string;

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.apiConfig.getEndpoint('license');
  }

  /**
   * Get all licenses with optional filters
   */
  getAll(filters?: LicenseFilters): Observable<License[]> {
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
      if (filters.isExpired !== undefined) {
        params = params.set('isExpired', filters.isExpired.toString());
      }
      if (filters.isExpiringSoon !== undefined) {
        params = params.set('isExpiringSoon', filters.isExpiringSoon.toString());
      }
    }

    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<License[]>>(url, { headers, params })
      .pipe(
        map(response => {
          console.log('LicenseService.getAll response:', response);
          if (response.success) {
            return response.result || [];
          }
          throw new Error(`Get licenses failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('LicenseService.getAll error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get license by ID
   */
  getById(id: number): Observable<License> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<License>>(url, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get license failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create license
   */
  create(data: Partial<License>): Observable<License> {
    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.post<BackendResponse<License>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Create license failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update license
   */
  update(id: number, data: Partial<License>): Observable<License> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<License>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update license failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete license
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
          throw new Error(`Delete license failed: ${response.exception}`);
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
    console.error('LicenseService error:', error);
    throw error;
  }
}