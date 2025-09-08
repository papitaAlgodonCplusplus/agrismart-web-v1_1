import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface MeasurementUnit {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  type?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MeasurementUnitService {
  private baseUrl = '/MeasurementUnit';

  constructor(private apiService: ApiService) {}

  /**
   * Get all measurement units
   * Endpoint: /MeasurementUnit
   */
  getAll(): Observable<MeasurementUnit[]> {
    return this.apiService.get<MeasurementUnit[]>(this.baseUrl);
  }

  /**
   * Get measurement unit by ID
   */
  getById(id: number): Observable<MeasurementUnit> {
    return this.apiService.get<MeasurementUnit>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get active measurement units only
   */
  getActive(): Observable<MeasurementUnit[]> {
    return this.apiService.get<MeasurementUnit[]>(`${this.baseUrl}?active=true`);
  }
}
