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


export interface Sensor {
  id?: number;
  name?: string;
  description?: string;
  sensorType?: string;
  measurementVariable?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  accuracy?: number;
  isActive?: boolean;
  deviceId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SensorFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  sensorType?: string;
  deviceId?: number;
  measurementVariable?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private readonly baseUrl: string;

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.apiConfig.getEndpoint('sensor');
  }

  /**
   * Get all sensors with optional filters
   */
  getAll(filters?: SensorFilters): Observable<Sensor[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    let params = new HttpParams();
    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('IncludeInactives', filters.onlyActive.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.sensorType) {
        params = params.set('sensorType', filters.sensorType);
      }
      if (filters.deviceId) {
        params = params.set('deviceId', filters.deviceId.toString());
      }
      if (filters.measurementVariable) {
        params = params.set('measurementVariable', filters.measurementVariable);
      }
    }

    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<Sensor[]>>(url, { headers, params })
      .pipe(
        map(response => {
          console.log('SensorService.getAll response:', response);
          if (response.success) {
            return response.result || [];
          }
          throw new Error(`Get sensors failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('SensorService.getAll error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get sensor by ID
   */
  getById(id: number): Observable<Sensor> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<Sensor>>(url, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get sensor failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Create sensor
   */
  create(data: Partial<Sensor>): Observable<Sensor> {
    const url = this.apiConfig.getAgronomicUrl(this.baseUrl);
    const headers = this.getAuthHeaders();

    return this.http.post<BackendResponse<Sensor>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Create sensor failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Update sensor
   */
  update(id: number, data: Partial<Sensor>): Observable<Sensor> {
    const url = this.apiConfig.getAgronomicUrl(`${this.baseUrl}/${id}`);
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Sensor>>(url, data, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update sensor failed: ${response.exception}`);
        }),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Delete sensor
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
          throw new Error(`Delete sensor failed: ${response.exception}`);
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
    console.error('SensorService error:', error);
    throw error;
  }
}