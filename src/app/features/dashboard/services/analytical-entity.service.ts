// src/app/features/dashboard/services/measurement-unit.service.ts

// src/app/features/dashboard/services/calculation-setting.service.ts
// src/app/features/dashboard/services/analytical-entity.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface AnalyticalEntity {
  id: number;
  name: string;
  type: 'report' | 'dashboard' | 'chart' | 'kpi' | 'alert';
  description?: string;
  configuration?: any;
  catalogId?: number;
  isPublic: boolean;
  active: boolean;
  createdById?: number;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  category?: string;
}

export interface AnalyticalEntityCreateRequest {
  name: string;
  type: 'report' | 'dashboard' | 'chart' | 'kpi' | 'alert';
  description?: string;
  configuration?: any;
  catalogId?: number;
  isPublic?: boolean;
  tags?: string[];
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticalEntityService {
  private baseUrl = '/AnalyticalEntity'; // Note: keeping original spelling from requirement

  constructor(private apiService: ApiService) { }

  /**
   * Get analytical entities (reports/graphs)
   * Endpoint: /AnaliticalEntity
   */
  getAll(): Observable<AnalyticalEntity[]> {
    let params = new HttpParams();
    return this.apiService.get<AnalyticalEntity[]>(this.baseUrl, params);
  }

  /**
   * Get analytical entity by ID
   */
  getById(id: number): Observable<AnalyticalEntity> {
    return this.apiService.get<AnalyticalEntity>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get analytical entities by type
   */
  getByType(type: string): Observable<AnalyticalEntity[]> {
    const params = new HttpParams().set('Type', type);
    return this.apiService.get<AnalyticalEntity[]>(this.baseUrl, params);
  }

  /**
   * Get analytical entities by catalog
   */
  getByCatalogId(catalogId: number): Observable<AnalyticalEntity[]> {
    const params = new HttpParams().set('CatalogId', catalogId.toString());
    return this.apiService.get<AnalyticalEntity[]>(this.baseUrl, params);
  }

  /**
   * Create analytical entity
   */
  create(entityData: AnalyticalEntityCreateRequest): Observable<AnalyticalEntity> {
    return this.apiService.post<AnalyticalEntity>(this.baseUrl, entityData);
  }

  /**
   * Update analytical entity
   */
  update(id: number, entityData: Partial<AnalyticalEntityCreateRequest>): Observable<AnalyticalEntity> {
    return this.apiService.put<AnalyticalEntity>(`${this.baseUrl}/${id}`, entityData);
  }

  executeEntity(id: number, parameters?: any): Observable<any> {
    const payload = parameters || {};
    return this.apiService.post(`${this.baseUrl}/${id}/execute`, payload);
  }

  /**
   * Delete analytical entity
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get public analytical entities
   */
  getPublic(): Observable<AnalyticalEntity[]> {
    const params = new HttpParams().set('IsPublic', 'true');
    return this.apiService.get<AnalyticalEntity[]>(this.baseUrl, params);
  }

  /**
   * Execute analytical entity
   */
  execute(id: number, parameters?: any): Observable<any> {
    const payload = parameters || {};
    return this.apiService.post(`${this.baseUrl}/${id}/execute`, payload);
  }

  /**
   * Get analytical entity results
   */
  getResults(id: number, filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.apiService.get(`${this.baseUrl}/${id}/results`, params);
  }

  /**
   * Get analytical entity categories
   */
  getCategories(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/categories`);
  }

  /**
   * Search analytical entities
   */
  search(query: string, type?: string, catalogId?: number): Observable<AnalyticalEntity[]> {
    let params = new HttpParams().set('Query', query);
    if (type) {
      params = params.set('Type', type);
    }
    if (catalogId) {
      params = params.set('CatalogId', catalogId.toString());
    }
    return this.apiService.get<AnalyticalEntity[]>(`${this.baseUrl}/search`, params);
  }
}