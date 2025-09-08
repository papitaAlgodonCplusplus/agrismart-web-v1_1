// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

export interface ApiResponse<T> {
  success: boolean;
  result: T;
  message?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  getBlob(url: string, params?: HttpParams): Observable<Blob> {
    return this.http.get(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      {
        headers: this.getHeaders(),
        params,
        responseType: 'blob'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private getFormHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  /**
   * GET request to Agronomic API
   */
  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      { headers: this.getHeaders(), params }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * POST request to Agronomic API
   */
  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * PUT request to Agronomic API
   */
  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request to Agronomic API
   */
  delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * GET request to IoT API
   */
  getIot<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(
      `${this.apiConfig.iotApiUrl}${url}`,
      { headers: this.getHeaders(), params }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * POST request to IoT API
   */
  postIot<T>(url: string, body: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(
      `${this.apiConfig.iotApiUrl}${url}`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * PUT request to IoT API
   */
  putIot<T>(url: string, body: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(
      `${this.apiConfig.iotApiUrl}${url}`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request to IoT API
   */
  deleteIot<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(
      `${this.apiConfig.iotApiUrl}${url}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * Upload file to Agronomic API
   */
  uploadFile<T>(url: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      formData,
      { headers: this.getFormHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * Download file from Agronomic API
   */
  downloadFile(url: string): Observable<Blob> {
    return this.http.get(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get full API response (including success, message, errors)
   */
  getFullResponse<T>(url: string, params?: HttpParams): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      { headers: this.getHeaders(), params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Post with full API response
   */
  postFullResponse<T>(url: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Authentication specific methods
   */
  login(credentials: { userEmail: string; password: string }): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.agronomicApiUrl}${this.apiConfig.endpoints.auth.login}`,
      credentials,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * IoT Device Authentication
   */
  authenticateDevice(deviceCredentials: { deviceId: string; clientId: string }): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.iotApiUrl}${this.apiConfig.endpoints.iot.authenticateDevice}`,
      deviceCredentials,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * Submit IoT Raw Data
   */
  submitIotData(deviceData: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.iotApiUrl}${this.apiConfig.endpoints.iot.deviceRawData}`,
      deviceData,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * Submit MQTT IoT Data
   */
  submitMqttData(mqttData: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.iotApiUrl}${this.apiConfig.endpoints.iot.deviceRawDataMqtt}`,
      mqttData,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    // Extract error message from API response
    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors && error.error.errors.length > 0) {
      errorMessage = error.error.errors.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({ 
      message: errorMessage, 
      status: error.status,
      originalError: error 
    }));
  }
}