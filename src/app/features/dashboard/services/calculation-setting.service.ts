
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface CalculationSetting {
  id: number;
  catalogId: number;
  name: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CalculationSettingService {
  private baseUrl = '/CalculationSetting';

  constructor(private apiService: ApiService) {}

  /**
   * Get calculation settings by catalog ID
   * Endpoint: /CalculationSetting?CatalogId={catalogId}
   */
  getByCatalogId(catalogId: number): Observable<CalculationSetting[]> {
    console.log('CalculationSettingService.getByCatalogId called with ID:', catalogId);
    const params = new HttpParams()
    return this.apiService.get<CalculationSetting[]>(`${this.baseUrl}/${catalogId}`, params);
  }

  /**
   * Get all calculation settings
   */
  getAll(): Observable<CalculationSetting[]> {
    return this.apiService.get<CalculationSetting[]>(this.baseUrl);
  }

  /**
   * Get calculation setting by ID
   */
  getById(id: number): Observable<CalculationSetting> {
    return this.apiService.get<CalculationSetting>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get calculation settings by category
   */
  getByCategory(catalogId: number, category: string): Observable<CalculationSetting[]> {
    const params = new HttpParams()
      .set('CatalogId', catalogId.toString())
      .set('Category', category);
    return this.apiService.get<CalculationSetting[]>(this.baseUrl, params);
  }

  /**
   * Update calculation setting
   */
  update(id: number, value: string): Observable<CalculationSetting> {
    const payload = { value };
    return this.apiService.put<CalculationSetting>(`${this.baseUrl}/${id}`, payload);
  }
}
