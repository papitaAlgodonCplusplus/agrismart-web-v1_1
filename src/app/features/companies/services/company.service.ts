import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Company } from '../../../core/models/models';

// Backend response structure (matches your AgriSmart API)
interface BackendResponse<T> {
  success: boolean;
  exception: any;
  result: T;
}

export interface CompanyFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  hasActiveFarms?: boolean;
  location?: string;
  taxId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) { }

  /**
   * Get all companies - matches backend GET /Company endpoint
   */
  getAll(onlyActive?: boolean, filters?: CompanyFilters): Observable<any[]> {
    // Build query parameters if needed
    let params = new HttpParams();

    if (onlyActive !== undefined) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    // Call the actual backend endpoint: GET /Company
    const url = `${this.apiConfig.agronomicApiUrl}/Company`;

    return this.http.get<BackendResponse<{ companies: any[] }>>(url, { params })
      .pipe(
        map(response => {
          console.log('CompanyService raw response:', response);
          if (response.success) {
            // Backend returns: { success: true, result: { companies: [...] } }
            return response.result?.companies || [];
          }
          throw new Error(`Company API failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CompanyService.getAll error:', error);
          console.error('URL attempted:', url);
          console.error('Params:', params.toString());
          throw error;
        })
      );
  }

  /**
   * Get company by ID - matches backend GET /Company/GetById
   */
  getById(id: number): Observable<any> {
    const url = `${this.apiConfig.agronomicApiUrl}/Company/GetById`;
    const params = new HttpParams().set('Id', id.toString());

    return this.http.get<BackendResponse<any>>(url, { params })
      .pipe(
        map(response => {
          console.log('CompanyService.getById raw response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get Company by ID failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CompanyService.getById error:', error);
          throw error;
        })
      );
  }

  /**
   * Create new company - matches backend POST /Company
   */
  create(data: any): Observable<any> {
    const url = `${this.apiConfig.agronomicApiUrl}/Company`;
    const token = localStorage.getItem('access_token');

    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.post<BackendResponse<any>>(url, data, { headers })
      .pipe(
        map(response => {
          console.log('CompanyService.create raw response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Create Company failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CompanyService.create error:', error);
          throw error;
        })
      );
  }

  /**
   * Update company - matches backend PUT /Company
   */
  update(id: number, data: any): Observable<any> {
    const url = `${this.apiConfig.agronomicApiUrl}/Company`;
    const token = localStorage.getItem('access_token');

    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Include ID in the data payload
    const payload = { ...data, id };

    return this.http.put<BackendResponse<any>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('CompanyService.update raw response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update Company failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CompanyService.update error:', error);
          throw error;
        })
      );
  }

  /**
   * Get active companies only
   */
  getActive(): Observable<any[]> {
    return this.getAll(true);
  }

  /**
   * Search companies by name
   */
  search(searchTerm: string): Observable<any[]> {
    const filters: CompanyFilters = { searchTerm };
    return this.getAll(undefined, filters);
  }

  /**
   * Debugging method to test the endpoint
   */
  testEndpoint(): void {
    const url = `${this.apiConfig.agronomicApiUrl}/Company`;
    console.log('Testing Company endpoint:', url);

    this.http.get(url).subscribe({
      next: (response) => {
        console.log('✅ Company endpoint test SUCCESS:', response);
      },
      error: (error) => {
        console.error('❌ Company endpoint test FAILED:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
      }
    });
  }


  /**
   * Delete company
   */
  delete(id: number): Observable<void> {
    return new Observable<void>;
    //return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}