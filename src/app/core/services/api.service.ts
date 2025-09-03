// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

export interface ApiResponse<T> {
  success: boolean;
  result: T;
  message?: string;
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

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      { headers: this.getHeaders(), params }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

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

  delete<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(
      `${this.apiConfig.agronomicApiUrl}${url}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    throw error;
  }
}