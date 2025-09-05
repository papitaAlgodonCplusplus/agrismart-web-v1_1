// src/app/features/crops/services/crop.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Crop } from '../../../core/models/models';

// Backend response structure (matches your AgriSmart API)
interface BackendResponse<T> {
  success: boolean;
  exception: any;
  result: T;
}

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
  name?: string | undefined;
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
  constructor(
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all crops with optional filters - Backend: GET /Crop
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

    const url = `${this.apiConfig.agronomicApiUrl}/Crop`;
    
    return this.http.get<BackendResponse<{crops: Crop[]}>>(url, { params })
      .pipe(
        map(response => {
          console.log('CropService.getAll response:', response);
          if (response.success) {
            return response.result?.crops || [];
          }
          throw new Error(`Crop API failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getAll error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get crop by ID - Backend: GET /Crop/{Id:int}
   */
  getById(id: number): Observable<Crop> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/${id}`;
    
    return this.http.get<BackendResponse<Crop>>(url)
      .pipe(
        map(response => {
          console.log('CropService.getById response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get Crop by ID failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getById error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Create new crop - Backend: POST /Crop (if implemented)
   * Note: Your current backend may not have this endpoint
   */
  create(data: CropCreateRequest): Observable<Crop> {
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    const url = `${this.apiConfig.agronomicApiUrl}/Crop`;
    const headers = this.getAuthHeaders();

    return this.http.post<BackendResponse<Crop>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('CropService.create response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Create Crop failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.create error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update crop - Backend: PUT /Crop (if implemented)
   * Note: Your current backend may not have this endpoint
   */
  update(id: number, data: CropUpdateRequest): Observable<Crop> {
    const payload = { ...data, id };
    const url = `${this.apiConfig.agronomicApiUrl}/Crop`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Crop>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('CropService.update response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update Crop failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.update error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Delete crop - Backend: DELETE /Crop (if implemented)
   * Note: Your current backend may not have this endpoint
   */
  delete(id: number): Observable<void> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/${id}`;
    const headers = this.getAuthHeaders();

    return this.http.delete<BackendResponse<void>>(url, { headers })
      .pipe(
        map(response => {
          console.log('CropService.delete response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Delete Crop failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.delete error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Toggle crop status - Custom endpoint (may not exist in backend)
   */
  toggleStatus(id: number, isActive: boolean): Observable<Crop> {
    const payload = { id, isActive };
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/status`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Crop>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('CropService.toggleStatus response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Toggle Crop status failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.toggleStatus error:', error);
          return this.handleError(error);
        })
      );
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
   * Get crop statistics - Custom endpoint (may not exist in backend)
   */
  getStatistics(): Observable<CropStatistics> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/statistics`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<CropStatistics>>(url, { headers })
      .pipe(
        map(response => {
          console.log('CropService.getStatistics response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get Crop statistics failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getStatistics error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get crop recommendations for specific conditions - Custom endpoint
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

    const url = `${this.apiConfig.agronomicApiUrl}/Crop/recommendations`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<CropRecommendation[]>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('CropService.getRecommendations response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get Crop recommendations failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getRecommendations error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get available crop types - Custom endpoint
   */
  getAvailableTypes(): Observable<string[]> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/types`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<string[]>>(url, { headers })
      .pipe(
        map(response => {
          console.log('CropService.getAvailableTypes response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get available types failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getAvailableTypes error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get available varieties for a crop type - Custom endpoint
   */
  getVarietiesByType(type: string): Observable<string[]> {
    const params = new HttpParams().set('type', type);
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/varieties`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<string[]>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('CropService.getVarietiesByType response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get varieties by type failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getVarietiesByType error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get available harvest seasons - Custom endpoint
   */
  getAvailableHarvestSeasons(): Observable<string[]> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/harvest-seasons`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<string[]>>(url, { headers })
      .pipe(
        map(response => {
          console.log('CropService.getAvailableHarvestSeasons response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get harvest seasons failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getAvailableHarvestSeasons error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get companion crops (crops that grow well together) - Custom endpoint
   */
  getCompanionCrops(cropId: number): Observable<Crop[]> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/${cropId}/companions`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<Crop[]>>(url, { headers })
      .pipe(
        map(response => {
          console.log('CropService.getCompanionCrops response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get companion crops failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getCompanionCrops error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get crop rotation suggestions - Custom endpoint
   */
  getRotationSuggestions(previousCropId: number): Observable<Crop[]> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/${previousCropId}/rotation-suggestions`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<Crop[]>>(url, { headers })
      .pipe(
        map(response => {
          console.log('CropService.getRotationSuggestions response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get rotation suggestions failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getRotationSuggestions error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get crops currently in production - Custom endpoint
   */
  getCropsInProduction(): Observable<Crop[]> {
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/in-production`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<Crop[]>>(url, { headers })
      .pipe(
        map(response => {
          console.log('CropService.getCropsInProduction response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get crops in production failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getCropsInProduction error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get crop performance metrics - Custom endpoint
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

    const url = `${this.apiConfig.agronomicApiUrl}/Crop/${cropId}/performance`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<any>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('CropService.getPerformanceMetrics response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get performance metrics failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.getPerformanceMetrics error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Bulk update crops - Custom endpoint
   */
  bulkUpdate(ids: number[], data: Partial<CropUpdateRequest>): Observable<Crop[]> {
    const payload = { ids, updateData: data };
    const url = `${this.apiConfig.agronomicApiUrl}/Crop/bulk-update`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Crop[]>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('CropService.bulkUpdate response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Bulk update crops failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('CropService.bulkUpdate error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Export to Excel - Custom endpoint
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

    const url = `${this.apiConfig.agronomicApiUrl}/Crop/export/excel`;
    const headers = this.getAuthHeaders();
    
    return this.http.get(url, {
      params,
      responseType: 'blob',
      headers
    }).pipe(
      catchError(error => {
        console.error('CropService.exportToExcel error:', error);
        return this.handleError(error);
      })
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
    
    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      errorMessage = `HTTP ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}