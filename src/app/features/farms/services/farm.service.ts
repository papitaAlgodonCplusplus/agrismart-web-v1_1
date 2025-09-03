// src/app/features/farms/services/farm.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Farm } from '../../../core/models/models';

export interface FarmFilters {
  onlyActive?: boolean;
  companyId?: number | null;
  searchTerm?: string;
  location?: string;
  minArea?: number;
  maxArea?: number;
  hasActiveProductions?: boolean;
  soilType?: string;
  climate?: string;
}

export interface FarmCreateRequest {
  name: string;
  description?: string;
  companyId: number;
  location?: string;
  address?: string;
  area?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  climate?: string;
  soilType?: string;
  isActive?: boolean;
}

export interface FarmUpdateRequest extends Partial<FarmCreateRequest> {}

export interface FarmStatistics {
  totalFarms: number;
  activeFarms: number;
  inactiveFarms: number;
  totalArea: number;
  averageArea: number;
  largestFarm: {
    id: number;
    name: string;
    area: number;
  };
  smallestFarm: {
    id: number;
    name: string;
    area: number;
  };
  byCompany: {
    [companyName: string]: {
      count: number;
      totalArea: number;
    };
  };
  bySoilType: {
    [soilType: string]: number;
  };
  byClimate: {
    [climate: string]: number;
  };
  utilizationRate: number; // percentage of farms with active productions
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private readonly baseUrl = '/api/farms';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all farms with optional filters
   */
  getAll(onlyActive?: boolean, filters?: FarmFilters): Observable<Farm[]> {
    let params = new HttpParams();

    // Handle legacy boolean parameter for backward compatibility
    if (onlyActive !== undefined) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    // Handle new filters object
    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.companyId) {
        params = params.set('companyId', filters.companyId.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.location) {
        params = params.set('location', filters.location);
      }
      if (filters.minArea !== undefined) {
        params = params.set('minArea', filters.minArea.toString());
      }
      if (filters.maxArea !== undefined) {
        params = params.set('maxArea', filters.maxArea.toString());
      }
      if (filters.hasActiveProductions !== undefined) {
        params = params.set('hasActiveProductions', filters.hasActiveProductions.toString());
      }
      if (filters.soilType) {
        params = params.set('soilType', filters.soilType);
      }
      if (filters.climate) {
        params = params.set('climate', filters.climate);
      }
    }

    return this.apiService.get<Farm[]>(this.baseUrl, params);
  }

  /**
   * Get farm by ID
   */
  getById(id: number): Observable<Farm> {
    return this.apiService.get<Farm>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new farm
   */
  create(data: FarmCreateRequest): Observable<Farm> {
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<Farm>(this.baseUrl, payload);
  }

  /**
   * Update farm
   */
  update(id: number, data: FarmUpdateRequest): Observable<Farm> {
    return this.apiService.put<Farm>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete farm
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle farm status
   */
  toggleStatus(id: number, isActive: boolean): Observable<Farm> {
    const payload = { isActive };
    return this.apiService.put<Farm>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Get active farms only
   */
  getActive(): Observable<Farm[]> {
    return this.getAll(true);
  }

  /**
   * Get farms by company
   */
  getByCompany(companyId: number, onlyActive?: boolean): Observable<Farm[]> {
    const filters: FarmFilters = { 
      companyId, 
      ...(onlyActive !== undefined && { onlyActive })
    };
    return this.getAll(undefined, filters);
  }

  /**
   * Search farms by name or location
   */
  search(searchTerm: string): Observable<Farm[]> {
    const filters: FarmFilters = { searchTerm };
    return this.getAll(undefined, filters);
  }

  /**
   * Get farms with active productions
   */
  getWithActiveProductions(): Observable<Farm[]> {
    const filters: FarmFilters = { hasActiveProductions: true };
    return this.getAll(undefined, filters);
  }

  /**
   * Get farms by area range
   */
  getByAreaRange(minArea: number, maxArea: number): Observable<Farm[]> {
    const filters: FarmFilters = { minArea, maxArea };
    return this.getAll(undefined, filters);
  }

  /**
   * Get farms by soil type
   */
  getBySoilType(soilType: string): Observable<Farm[]> {
    const filters: FarmFilters = { soilType };
    return this.getAll(undefined, filters);
  }

  /**
   * Get farms by climate
   */
  getByClimate(climate: string): Observable<Farm[]> {
    const filters: FarmFilters = { climate };
    return this.getAll(undefined, filters);
  }

  /**
   * Get farm statistics
   */
  getStatistics(): Observable<FarmStatistics> {
    return this.apiService.get<FarmStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * Get farms near coordinates
   */
  getNearby(latitude: number, longitude: number, radiusKm: number = 10): Observable<Farm[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radiusKm', radiusKm.toString());

    return this.apiService.get<Farm[]>(`${this.baseUrl}/nearby`, params);
  }

  /**
   * Get available soil types
   */
  getAvailableSoilTypes(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/soil-types`);
  }

  /**
   * Get available climates
   */
  getAvailableClimates(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/climates`);
  }

  /**
   * Bulk update farms
   */
  bulkUpdate(ids: number[], data: Partial<FarmUpdateRequest>): Observable<Farm[]> {
    const payload = { ids, updateData: data };
    return this.apiService.put<Farm[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  /**
   * Export to Excel
   */
  exportToExcel(filters?: FarmFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/export/excel`;
    
    return this.http.get(url, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Utility methods
   */
  formatArea(area: number): string {
    if (area >= 10000) {
      return `${(area / 10000).toFixed(1)} ha`;
    }
    return `${area.toFixed(1)} m²`;
  }

  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Data transformation methods
   */
  sortByName(farms: Farm[], ascending: boolean = true): Farm[] {
    return [...farms].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return ascending ? comparison : -comparison;
    });
  }

  sortByArea(farms: Farm[], ascending: boolean = false): Farm[] {
    return [...farms].sort((a, b) => {
      const areaA = a.area || 0;
      const areaB = b.area || 0;
      return ascending ? areaA - areaB : areaB - areaA;
    });
  }

  sortByCompany(farms: Farm[], ascending: boolean = true): Farm[] {
    return [...farms].sort((a, b) => {
      const companyA = a.company?.name || '';
      const companyB = b.company?.name || '';
      const comparison = companyA.localeCompare(companyB);
      return ascending ? comparison : -comparison;
    });
  }

  groupByCompany(farms: Farm[]): { [companyName: string]: Farm[] } {
    return farms.reduce((groups, farm) => {
      const companyName = farm.company?.name || 'Sin empresa';
      if (!groups[companyName]) {
        groups[companyName] = [];
      }
      groups[companyName].push(farm);
      return groups;
    }, {} as { [companyName: string]: Farm[] });
  }

  groupBySoilType(farms: Farm[]): { [soilType: string]: Farm[] } {
    return farms.reduce((groups, farm) => {
      const soilType = farm.soilType || 'Sin especificar';
      if (!groups[soilType]) {
        groups[soilType] = [];
      }
      groups[soilType].push(farm);
      return groups;
    }, {} as { [soilType: string]: Farm[] });
  }

  groupByClimate(farms: Farm[]): { [climate: string]: Farm[] } {
    return farms.reduce((groups, farm) => {
      const climate = farm.climate || 'Sin especificar';
      if (!groups[climate]) {
        groups[climate] = [];
      }
      groups[climate].push(farm);
      return groups;
    }, {} as { [climate: string]: Farm[] });
  }

  filterByActiveStatus(farms: Farm[], activeOnly: boolean = true): Farm[] {
    return farms.filter(farm => activeOnly ? farm.isActive : !farm.isActive);
  }

  filterByAreaRange(farms: Farm[], minArea: number, maxArea: number): Farm[] {
    return farms.filter(farm => {
      const area = farm.area || 0;
      return area >= minArea && area <= maxArea;
    });
  }

  /**
   * Private helper methods
   */
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Farm Service Error:', error);
    throw error;
  }
}