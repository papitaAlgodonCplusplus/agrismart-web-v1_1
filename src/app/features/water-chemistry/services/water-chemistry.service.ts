// src/app/features/water-chemistry/services/water-chemistry.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface WaterChemistry {
  id?: number;
  name?: string;
  no3?: number;
  nO3?: number;
  analysisDate?: any;
  waterId?: any;
  pH?: any;
  active?: any;
  po4?: number;
  k?: number;
  ca?: number;
  mg?: number;
  na?: number;
  cl?: number;
  sul?: number;
  fe?: number;
  b?: number;
  cu?: number;
  zn?: number;
  mn?: number;
  mo?: number;
  h2po4?: number;
  ec?: number;
  ph?: number;
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
  private readonly baseUrl = '/WaterChemistry'; // Just the endpoint path

  constructor(private apiService: ApiService) {}

  /**
   * Get all water chemistry records with optional filters
   */
  getAll(filters?: WaterChemistryFilters): Observable<any> {
    let params = new HttpParams();
    
    // if (filters) {
    //   if (filters.onlyActive !== undefined) {
    //     params = params.set('onlyActive', filters.onlyActive.toString());
    //   }
    //   if (filters.searchTerm) {
    //     params = params.set('searchTerm', filters.searchTerm);
    //   }
    //   if (filters.minPh !== undefined) {
    //     params = params.set('minPh', filters.minPh.toString());
    //   }
    //   if (filters.maxPh !== undefined) {
    //     params = params.set('maxPh', filters.maxPh.toString());
    //   }
    //   if (filters.minEc !== undefined) {
    //     params = params.set('minEc', filters.minEc.toString());
    //   }
    //   if (filters.maxEc !== undefined) {
    //     params = params.set('maxEc', filters.maxEc.toString());
    //   }
    // }

    return this.apiService.get<WaterChemistry[]>(this.baseUrl, params);
  }

  /**
   * Get water chemistry by ID
   */
  getById(id: number): Observable<WaterChemistry> {
    return this.apiService.get<WaterChemistry>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create water chemistry record
   */
  create(data: Partial<WaterChemistry>): Observable<WaterChemistry> {
    return this.apiService.post<WaterChemistry>(this.baseUrl, data);
  }

  /**
   * Update water chemistry record
   */
  update(id: number, data: Partial<WaterChemistry>): Observable<WaterChemistry> {
    return this.apiService.put<WaterChemistry>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete water chemistry record
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get water chemistry records by client ID
   */
  getByClientId(clientId: number): Observable<WaterChemistry[]> {
    console.log("Get by Client Id Water Chemistry: ", clientId);
    const params = new HttpParams().set('ClientId', clientId.toString());
    return this.apiService.get<WaterChemistry[]>(this.baseUrl, params);
  }

  /**
   * Get current user's water chemistry records
   * This assumes you have a way to get the current user's clientId
   */
  getCurrentUserWaterChemistry(user: any): Observable<WaterChemistry[]> {
    if (user && user['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid']) {
      return this.getByClientId(user['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid']);
    }
    return this.getAll();
  }

  /**
   * Toggle water chemistry record active status
   */
  toggleStatus(id: number, isActive: boolean): Observable<WaterChemistry> {
    const payload = { isActive };
    return this.apiService.put<WaterChemistry>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Clone water chemistry record
   */
  clone(id: number, newName: string): Observable<WaterChemistry> {
    const payload = { name: newName };
    return this.apiService.post<WaterChemistry>(`${this.baseUrl}/${id}/clone`, payload);
  }

  /**
   * Bulk operations
   */
  bulkUpdate(ids: number[], data: Partial<WaterChemistry>): Observable<WaterChemistry[]> {
    const payload = {
      ids,
      updateData: data
    };
    return this.apiService.put<WaterChemistry[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  bulkDelete(ids: number[]): Observable<void> {
    const payload = { ids };
    return this.apiService.post<void>(`${this.baseUrl}/bulk/delete`, payload);
  }

  /**
   * Helper method to get current user - implement this based on your auth system
   */
  private getCurrentUser(): { clientId: number } | null {
    // This is a placeholder - implement based on your authentication system
    // You might get this from localStorage, a user service, or auth service
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return { clientId: user.clientId };
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  }

  /**
   * Export water chemistry data to Excel
   */
  exportToExcel(filters?: WaterChemistryFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.apiService.getBlob(`${this.baseUrl}/export/excel`, params);
  }

  /**
   * Get water chemistry statistics
   */
  getStatistics(filters?: WaterChemistryFilters): Observable<any> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.apiService.get<any>(`${this.baseUrl}/statistics`, params);
  }

  /**
   * Validate water chemistry parameters
   */
  validateParameters(data: Partial<WaterChemistry>): Observable<{ isValid: boolean; warnings: string[] }> {
    return this.apiService.post<{ isValid: boolean; warnings: string[] }>(`${this.baseUrl}/validate`, data);
  }
}