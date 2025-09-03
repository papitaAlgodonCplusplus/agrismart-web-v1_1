// src/app/features/crops/services/crop.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Crop } from '../../../core/models/models';

export interface CropFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  type?: string;
  variety?: string;
  harvestSeason?: string;
  waterRequirement?: string;
  minGrowthCycleDays?: number;
  maxGrowthCycleDays?: number;
  minTemperature?: number;
  maxTemperature?: number;
}

export interface CropCreateRequest {
  name: string;
  scientificName?: string;
  description?: string;
  type?: string;
  variety?: string;
  growthCycleDays?: number;
  harvestSeason?: string;
  waterRequirement?: string;
  optimalTemperatureMin?: number;
  optimalTemperatureMax?: number;
  nitrogenRequirement?: number;
  phosphorusRequirement?: number;
  potassiumRequirement?: number;
  isActive?: boolean;
}

export interface CropUpdateRequest extends Partial<CropCreateRequest> {}

export interface CropStatistics {
  totalCrops: number;
  activeCrops: number;
  inactiveCrops: number;
  byType: {
    [type: string]: number;
  };
  byHarvestSeason: {
    [season: string]: number;
  };
  byWaterRequirement: {
    [requirement: string]: number;
  };
  averageGrowthCycle: number;
  shortestGrowthCycle: {
    name: string;
    days: number;
  };
  longestGrowthCycle: {
    name: string;
    days: number;
  };
  mostPopularType: string;
  currentProductionsCount: number; // crops currently being produced
}

export interface CropRecommendation {
  cropId: number;
  cropName: string;
  suitabilityScore: number; // 0-100
  reasons: string[];
  warnings: string[];
  bestPlantingTime: string;
  expectedYield: number;
  profitabilityIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class CropService {
  private readonly baseUrl = '/api/crops';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all crops with optional filters
   */
  getAll(onlyActive?: boolean, filters?: CropFilters): Observable<Crop[]> {
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
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.variety) {
        params = params.set('variety', filters.variety);
      }
      if (filters.harvestSeason) {
        params = params.set('harvestSeason', filters.harvestSeason);
      }
      if (filters.waterRequirement) {
        params = params.set('waterRequirement', filters.waterRequirement);
      }
      if (filters.minGrowthCycleDays !== undefined) {
        params = params.set('minGrowthCycleDays', filters.minGrowthCycleDays.toString());
      }
      if (filters.maxGrowthCycleDays !== undefined) {
        params = params.set('maxGrowthCycleDays', filters.maxGrowthCycleDays.toString());
      }
      if (filters.minTemperature !== undefined) {
        params = params.set('minTemperature', filters.minTemperature.toString());
      }
      if (filters.maxTemperature !== undefined) {
        params = params.set('maxTemperature', filters.maxTemperature.toString());
      }
    }

    return this.apiService.get<Crop[]>(this.baseUrl, params);
  }

  /**
   * Get crop by ID
   */
  getById(id: number): Observable<Crop> {
    return this.apiService.get<Crop>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new crop
   */
  create(data: CropCreateRequest): Observable<Crop> {
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<Crop>(this.baseUrl, payload);
  }

  /**
   * Update crop
   */
  update(id: number, data: CropUpdateRequest): Observable<Crop> {
    return this.apiService.put<Crop>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete crop
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle crop status
   */
  toggleStatus(id: number, isActive: boolean): Observable<Crop> {
    const payload = { isActive };
    return this.apiService.put<Crop>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Get active crops only
   */
  getActive(): Observable<Crop[]> {
    return this.getAll(true);
  }

  /**
   * Search crops by name or scientific name
   */
  search(searchTerm: string): Observable<Crop[]> {
    const filters: CropFilters = { searchTerm };
    return this.getAll(undefined, filters);
  }

  /**
   * Get crops by type
   */
  getByType(type: string): Observable<Crop[]> {
    const filters: CropFilters = { type };
    return this.getAll(undefined, filters);
  }

  /**
   * Get crops by harvest season
   */
  getByHarvestSeason(harvestSeason: string): Observable<Crop[]> {
    const filters: CropFilters = { harvestSeason };
    return this.getAll(undefined, filters);
  }

  /**
   * Get crops by water requirement
   */
  getByWaterRequirement(waterRequirement: string): Observable<Crop[]> {
    const filters: CropFilters = { waterRequirement };
    return this.getAll(undefined, filters);
  }

  /**
   * Get crops by growth cycle range
   */
  getByGrowthCycleRange(minDays: number, maxDays: number): Observable<Crop[]> {
    const filters: CropFilters = { 
      minGrowthCycleDays: minDays, 
      maxGrowthCycleDays: maxDays 
    };
    return this.getAll(undefined, filters);
  }

  /**
   * Get crops suitable for temperature range
   */
  getBySuitableTemperature(minTemp: number, maxTemp: number): Observable<Crop[]> {
    const filters: CropFilters = { 
      minTemperature: minTemp, 
      maxTemperature: maxTemp 
    };
    return this.getAll(undefined, filters);
  }

  /**
   * Get crop statistics
   */
  getStatistics(): Observable<CropStatistics> {
    return this.apiService.get<CropStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * Get crop recommendations for specific conditions
   */
  getRecommendations(conditions: {
    climate?: string;
    soilType?: string;
    availableArea?: number;
    waterAvailability?: string;
    targetSeason?: string;
    experience?: string;
    budget?: number;
  }): Observable<CropRecommendation[]> {
    let params = new HttpParams();

    Object.keys(conditions).forEach(key => {
      const value = (conditions as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.apiService.get<CropRecommendation[]>(`${this.baseUrl}/recommendations`, params);
  }

  /**
   * Get available crop types
   */
  getAvailableTypes(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/types`);
  }

  /**
   * Get available varieties for a crop type
   */
  getVarietiesByType(type: string): Observable<string[]> {
    const params = new HttpParams().set('type', type);
    return this.apiService.get<string[]>(`${this.baseUrl}/varieties`, params);
  }

  /**
   * Get available harvest seasons
   */
  getAvailableHarvestSeasons(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/harvest-seasons`);
  }

  /**
   * Get companion crops (crops that grow well together)
   */
  getCompanionCrops(cropId: number): Observable<Crop[]> {
    return this.apiService.get<Crop[]>(`${this.baseUrl}/${cropId}/companions`);
  }

  /**
   * Get crop rotation suggestions
   */
  getRotationSuggestions(previousCropId: number): Observable<Crop[]> {
    return this.apiService.get<Crop[]>(`${this.baseUrl}/${previousCropId}/rotation-suggestions`);
  }

  /**
   * Get crops currently in production
   */
  getCropsInProduction(): Observable<Crop[]> {
    return this.apiService.get<Crop[]>(`${this.baseUrl}/in-production`);
  }

  /**
   * Get crop performance metrics
   */
  getPerformanceMetrics(cropId: number, months?: number): Observable<{
    averageYield: number;
    successRate: number;
    averageCycleDays: number;
    profitabilityScore: number;
    totalProductions: number;
    recentTrend: 'improving' | 'stable' | 'declining';
    monthlyData: {
      month: string;
      productions: number;
      averageYield: number;
    }[];
  }> {
    let params = new HttpParams();
    if (months) {
      params = params.set('months', months.toString());
    }

    return this.apiService.get(`${this.baseUrl}/${cropId}/performance`, params);
  }

  /**
   * Bulk update crops
   */
  bulkUpdate(ids: number[], data: Partial<CropUpdateRequest>): Observable<Crop[]> {
    const payload = { ids, updateData: data };
    return this.apiService.put<Crop[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  /**
   * Export to Excel
   */
  exportToExcel(filters?: CropFilters): Observable<Blob> {
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
  formatType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Vegetal': 'Vegetal',
      'Fruta': 'Fruta',
      'Cereal': 'Cereal',
      'Hierba': 'Hierba Aromática',
      'Legumbre': 'Legumbre',
      'Tubérculo': 'Tubérculo',
      'Otro': 'Otro'
    };
    return typeMap[type] || type;
  }

  formatWaterRequirement(requirement: string): string {
    const requirementMap: { [key: string]: string } = {
      'Bajo': 'Bajo (< 300mm)',
      'Medio': 'Medio (300-600mm)',
      'Alto': 'Alto (> 600mm)'
    };
    return requirementMap[requirement] || requirement;
  }

  formatHarvestSeason(season: string): string {
    const seasonMap: { [key: string]: string } = {
      'Primavera': 'Primavera (Sep-Nov)',
      'Verano': 'Verano (Dic-Feb)',
      'Otoño': 'Otoño (Mar-May)',
      'Invierno': 'Invierno (Jun-Ago)',
      'Todo el año': 'Todo el año'
    };
    return seasonMap[season] || season;
  }

  calculateOptimalTemperatureRange(crop: Crop): string {
    if (!crop.optimalTemperatureMin && !crop.optimalTemperatureMax) {
      return 'No especificado';
    }
    if (crop.optimalTemperatureMin && crop.optimalTemperatureMax) {
      return `${crop.optimalTemperatureMin}°C - ${crop.optimalTemperatureMax}°C`;
    }
    if (crop.optimalTemperatureMin) {
      return `> ${crop.optimalTemperatureMin}°C`;
    }
    return `< ${crop.optimalTemperatureMax}°C`;
  }

  isTemperatureSuitable(crop: Crop, currentTemp: number): boolean {
    if (!crop.optimalTemperatureMin && !crop.optimalTemperatureMax) {
      return true; // No temperature requirements specified
    }
    
    if (crop.optimalTemperatureMin && currentTemp < crop.optimalTemperatureMin) {
      return false;
    }
    
    if (crop.optimalTemperatureMax && currentTemp > crop.optimalTemperatureMax) {
      return false;
    }
    
    return true;
  }

  calculateGrowthCycleCategory(days: number): string {
    if (days <= 30) return 'Muy Corto';
    if (days <= 60) return 'Corto';
    if (days <= 120) return 'Medio';
    if (days <= 180) return 'Largo';
    return 'Muy Largo';
  }

  /**
   * Data transformation methods
   */
  sortByName(crops: Crop[], ascending: boolean = true): Crop[] {
    return [...crops].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return ascending ? comparison : -comparison;
    });
  }

  sortByGrowthCycle(crops: Crop[], ascending: boolean = true): Crop[] {
    return [...crops].sort((a, b) => {
      const cycleA = a.growthCycleDays || 0;
      const cycleB = b.growthCycleDays || 0;
      return ascending ? cycleA - cycleB : cycleB - cycleA;
    });
  }

  sortByType(crops: Crop[], ascending: boolean = true): Crop[] {
    return [...crops].sort((a, b) => {
      const typeA = a.type || '';
      const typeB = b.type || '';
      const comparison = typeA.localeCompare(typeB);
      return ascending ? comparison : -comparison;
    });
  }

  groupByType(crops: Crop[]): { [type: string]: Crop[] } {
    return crops.reduce((groups, crop) => {
      const type = crop.type || 'Sin tipo';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(crop);
      return groups;
    }, {} as { [type: string]: Crop[] });
  }

  groupByHarvestSeason(crops: Crop[]): { [season: string]: Crop[] } {
    return crops.reduce((groups, crop) => {
      const season = crop.harvestSeason || 'Sin temporada';
      if (!groups[season]) {
        groups[season] = [];
      }
      groups[season].push(crop);
      return groups;
    }, {} as { [season: string]: Crop[] });
  }

  groupByWaterRequirement(crops: Crop[]): { [requirement: string]: Crop[] } {
    return crops.reduce((groups, crop) => {
      const requirement = crop.waterRequirement || 'Sin especificar';
      if (!groups[requirement]) {
        groups[requirement] = [];
      }
      groups[requirement].push(crop);
      return groups;
    }, {} as { [requirement: string]: Crop[] });
  }

  filterByActiveStatus(crops: Crop[], activeOnly: boolean = true): Crop[] {
    return crops.filter(crop => activeOnly ? crop.isActive : !crop.isActive);
  }

  filterByGrowthCycleRange(crops: Crop[], minDays: number, maxDays: number): Crop[] {
    return crops.filter(crop => {
      const cycleDays = crop.growthCycleDays || 0;
      return cycleDays >= minDays && cycleDays <= maxDays;
    });
  }

  filterBySuitableTemperature(crops: Crop[], currentTemp: number): Crop[] {
    return crops.filter(crop => this.isTemperatureSuitable(crop, currentTemp));
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
    console.error('Crop Service Error:', error);
    throw error;
  }
}