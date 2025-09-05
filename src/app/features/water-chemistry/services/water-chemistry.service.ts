
// src/app/features/water-chemistry/services/water-chemistry.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';

export interface WaterChemistry {
  id?: number;
  name?: string;
  description?: string;
  phLevel?: number;
  ecLevel?: number;
  tdsLevel?: number;
  temperature?: number;
  oxygenLevel?: number;
  nitrateLevel?: number;
  phosphateLevel?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


interface BackendResponse<T> {
  success: boolean;
  result: T;
  exception?: string;
  message?: string;
}


export interface WaterChemistryFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  minPh?: number;
  maxPh?: number;
  minEc?: number;
  maxEc?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WaterChemistryService {
  private readonly baseUrl: string;

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.apiConfig.getEndpoint('waterChemistry');
  }

  /**
   * Get all water chemistry records with optional filters
   */
  getAll(filters?: WaterChemistryFilters): Observable<WaterChemistry[]> {
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
      if (filters.minPh !== undefined) {
        params = params.set('minPh', filters.minPh.toString());
      }
      if (filters.maxPh !== undefined) {
        params = params.set('maxPh', filters.maxPh.toString());
      }
      if (filters.minEc !== undefined) {
        params = params.set('minEc', filters.minEc.toString());
      }
      if (filters.maxEc !== undefined) {
        params = params.set('maxEc', filters.maxEc.toString());
      }
    }

    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<WaterChemistry[]>>(url, { headers, params })
      .pipe(
        map(response => {
          console.log('WaterChemistryService.getAll response:', response);
          if (response.success) {
            return response.result || [];
          }
          throw new Error(`Get water chemistry failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('WaterChemistryService.getAll error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get water chemistry by ID
   */
  getById(id: number): Observable<WaterChemistry> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<WaterChemistry>>(url, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get water chemistry failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create water chemistry record
   */
  create(data: Partial<WaterChemistry>): Observable<WaterChemistry> {
    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.post<BackendResponse<WaterChemistry>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Create water chemistry failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update water chemistry record
   */
  update(id: number, data: Partial<WaterChemistry>): Observable<WaterChemistry> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<WaterChemistry>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update water chemistry failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete water chemistry record
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
          throw new Error(`Delete water chemistry failed: ${response.exception}`);
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
    console.error('WaterChemistryService error:', error);
    throw error;
  }
}
