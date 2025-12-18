import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GrowingMedium {
  id: number;
  catalogId: number;
  name: string;
  containerCapacityPercentage: number;
  permanentWiltingPoint: number;
  fiveKpaHumidity: number;
  easelyAvailableWaterPercentage: number;
  reserveWaterPercentage: number;
  totalAvailableWaterPercentage: number;
  active: boolean;
  dateCreated?: Date;
  dateUpdated?: Date;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateGrowingMediumCommand {
  catalogId: number;
  name: string;
  containerCapacityPercentage: number;
  permanentWiltingPoint: number;
  fiveKpaHumidity: number;
  easelyAvailableWaterPercentage: number;
  reserveWaterPercentage: number;
  totalAvailableWaterPercentage: number;
  createdBy: number;
}

export interface UpdateGrowingMediumCommand {
  id: number;
  catalogId: number;
  name: string;
  containerCapacityPercentage: number;
  permanentWiltingPoint: number;
  fiveKpaHumidity: number;
  easelyAvailableWaterPercentage: number;
  reserveWaterPercentage: number;
  totalAvailableWaterPercentage: number;
  active: boolean;
  updatedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class GrowingMediumService {
  private apiUrl = `/GrowingMedium`;

  constructor(private apiService: ApiService) { }

  /**
   * Get all growing media
   * @param includeInactives - Include inactive records
   */
  getAll(includeInactives: boolean = false): Observable<any> {
    let params = new HttpParams();
    if (includeInactives) {
      params = params.set('IncludeInactives', includeInactives.toString());
    }
    return this.apiService.get<any>(this.apiUrl,   params  );
  }

  /**
   * Get growing medium by ID
   */
  getById(id: number): Observable<any> {
    return this.apiService.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get growing media by catalog ID
   */
  getByCatalogId(catalogId: number): Observable<any> {
    const params = new HttpParams().set('catalogId', catalogId.toString());
    return this.apiService.get<any>(this.apiUrl, params );
  }

  /**
   * Create new growing medium
   */
  create(command: CreateGrowingMediumCommand): Observable<any> {
    return this.apiService.post<any>(this.apiUrl, command);
  }

  /**
   * Update existing growing medium
   */
  update(command: UpdateGrowingMediumCommand): Observable<any> {
    return this.apiService.put<any>(this.apiUrl, command);
  }

  /**
   * Delete growing medium
   */
  delete(id: number, deletedBy: number): Observable<any> {
    let params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.apiService.delete<any>(`${this.apiUrl}/${id}`);
  }
}
