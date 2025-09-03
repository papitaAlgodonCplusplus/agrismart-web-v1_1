// src/app/features/production-units/services/production-unit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { ProductionUnit, ProductionUnitType } from '../../../core/models/models';

export interface ProductionUnitFilters {
  onlyActive?: boolean;
  farmId?: number | null;
  productionUnitTypeId?: number | null;
  searchTerm?: string;
  minArea?: number;
  maxArea?: number;
  minCapacity?: number;
  maxCapacity?: number;
  hasActiveProductions?: boolean;
  availableForPlanting?: boolean;
  location?: string;
}

export interface ProductionUnitCreateRequest {
  name: string;
  description?: string;
  farmId: number;
  productionUnitTypeId: number;
  area?: number;
  capacity?: number;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  soilType?: string;
  drainage?: string;
  irrigation?: boolean;
  greenhouseType?: string;
  climateControl?: boolean;
  ventilation?: string;
  lightingSystem?: string;
  isActive?: boolean;
}

export interface ProductionUnitUpdateRequest extends Partial<ProductionUnitCreateRequest> {}

export interface ProductionUnitCapacityUpdate {
  capacity: number;
  reason: string;
  notes?: string;
  updatedById: number;
}

export interface ProductionUnitMaintenanceRecord {
  maintenanceType: 'preventive' | 'corrective' | 'emergency' | 'upgrade';
  description: string;
  scheduledDate?: Date | string;
  completedDate?: Date | string;
  cost?: number;
  performedById: number;
  notes?: string;
  nextMaintenanceDate?: Date | string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ProductionUnitStatistics {
  totalUnits: number;
  totalArea: number;
  totalCapacity: number;
  averageArea: number;
  averageCapacity: number;
  utilizationRate: number; // percentage of capacity being used
  byType: {
    [typeName: string]: {
      count: number;
      totalArea: number;
      totalCapacity: number;
      utilizationRate: number;
    };
  };
  byFarm: {
    [farmName: string]: {
      count: number;
      totalArea: number;
      totalCapacity: number;
      activeProductions: number;
    };
  };
  statusDistribution: {
    active: number;
    inactive: number;
    underMaintenance: number;
    available: number;
    occupied: number;
  };
  maintenanceSchedule: {
    overdue: number;
    thisWeek: number;
    thisMonth: number;
    nextMonth: number;
  };
  productivity: {
    highPerforming: number; // > 80% yield efficiency
    averagePerforming: number; // 60-80% yield efficiency  
    lowPerforming: number; // < 60% yield efficiency
  };
}

export interface ProductionUnitUtilization {
  productionUnitId: number;
  productionUnitName: string;
  totalArea: number;
  totalCapacity: number;
  currentProductions: {
    id: number;
    code: string;
    cropName: string;
    plantedArea: number;
    status: string;
    progress: number;
  }[];
  utilizationPercentage: number;
  availableArea: number;
  availableCapacity: number;
  isAvailableForPlanting: boolean;
  lastHarvestDate?: Date;
  nextPlantingDate?: Date;
  averageYieldEfficiency: number;
  maintenanceStatus: 'none' | 'scheduled' | 'overdue' | 'in_progress';
}

export interface EnvironmentalConditions {
  productionUnitId: number;
  temperature?: {
    current: number;
    min: number;
    max: number;
    optimal: number;
  };
  humidity?: {
    current: number;
    min: number;
    max: number;
    optimal: number;
  };
  soilMoisture?: {
    current: number;
    optimal: number;
  };
  lightLevel?: {
    current: number;
    duration: number; // hours
    optimal: number;
  };
  co2Level?: number;
  phLevel?: number;
  lastUpdated: Date;
  alertsActive: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductionUnitService {
  private readonly baseUrl = '/api/production-units';
  private readonly typesUrl = '/api/production-unit-types';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all production units with optional filters
   */
  getAll(filters?: ProductionUnitFilters): Observable<ProductionUnit[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.farmId) {
        params = params.set('farmId', filters.farmId.toString());
      }
      if (filters.productionUnitTypeId) {
        params = params.set('productionUnitTypeId', filters.productionUnitTypeId.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.minArea !== undefined) {
        params = params.set('minArea', filters.minArea.toString());
      }
      if (filters.maxArea !== undefined) {
        params = params.set('maxArea', filters.maxArea.toString());
      }
      if (filters.minCapacity !== undefined) {
        params = params.set('minCapacity', filters.minCapacity.toString());
      }
      if (filters.maxCapacity !== undefined) {
        params = params.set('maxCapacity', filters.maxCapacity.toString());
      }
      if (filters.hasActiveProductions !== undefined) {
        params = params.set('hasActiveProductions', filters.hasActiveProductions.toString());
      }
      if (filters.availableForPlanting !== undefined) {
        params = params.set('availableForPlanting', filters.availableForPlanting.toString());
      }
      if (filters.location) {
        params = params.set('location', filters.location);
      }
    }

    return this.apiService.get<ProductionUnit[]>(this.baseUrl, params);
  }

  /**
   * Get production unit by ID
   */
  getById(id: number): Observable<ProductionUnit> {
    return this.apiService.get<ProductionUnit>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new production unit
   */
  create(data: ProductionUnitCreateRequest): Observable<ProductionUnit> {
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<ProductionUnit>(this.baseUrl, payload);
  }

  /**
   * Update production unit
   */
  update(id: number, data: ProductionUnitUpdateRequest): Observable<ProductionUnit> {
    return this.apiService.put<ProductionUnit>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete production unit
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activate/deactivate production unit
   */
  toggleStatus(id: number, isActive: boolean): Observable<ProductionUnit> {
    const payload = { isActive };
    return this.apiService.put<ProductionUnit>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Update production unit capacity
   */
  updateCapacity(id: number, capacityUpdate: ProductionUnitCapacityUpdate): Observable<ProductionUnit> {
    return this.apiService.put<ProductionUnit>(`${this.baseUrl}/${id}/capacity`, capacityUpdate);
  }

  /**
   * Get production units by farm
   */
  getByFarm(farmId: number, onlyActive?: boolean): Observable<ProductionUnit[]> {
    let params = new HttpParams().set('farmId', farmId.toString());
    if (onlyActive !== undefined) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    return this.apiService.get<ProductionUnit[]>(this.baseUrl, params);
  }

  /**
   * Get production units by type
   */
  getByType(productionUnitTypeId: number): Observable<ProductionUnit[]> {
    const params = new HttpParams().set('productionUnitTypeId', productionUnitTypeId.toString());
    return this.apiService.get<ProductionUnit[]>(this.baseUrl, params);
  }

  /**
   * Get available production units for planting
   */
  getAvailableForPlanting(farmId?: number): Observable<ProductionUnit[]> {
    let params = new HttpParams().set('availableForPlanting', 'true');
    if (farmId) {
      params = params.set('farmId', farmId.toString());
    }

    return this.apiService.get<ProductionUnit[]>(this.baseUrl, params);
  }

  /**
   * Get production units with active productions
   */
  getWithActiveProductions(): Observable<ProductionUnit[]> {
    const params = new HttpParams().set('hasActiveProductions', 'true');
    return this.apiService.get<ProductionUnit[]>(this.baseUrl, params);
  }

  /**
   * Get production unit statistics
   */
  getStatistics(filters?: ProductionUnitFilters): Observable<ProductionUnitStatistics> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.apiService.get<ProductionUnitStatistics>(`${this.baseUrl}/statistics`, params);
  }

  /**
   * Get production unit utilization
   */
  getUtilization(id?: number): Observable<ProductionUnitUtilization | ProductionUnitUtilization[]> {
    if (id) {
      return this.apiService.get<ProductionUnitUtilization>(`${this.baseUrl}/${id}/utilization`);
    } else {
      return this.apiService.get<ProductionUnitUtilization[]>(`${this.baseUrl}/utilization`);
    }
  }

  /**
   * Get environmental conditions
   */
  getEnvironmentalConditions(id: number): Observable<EnvironmentalConditions> {
    return this.apiService.get<EnvironmentalConditions>(`${this.baseUrl}/${id}/environmental-conditions`);
  }

  /**
   * Update environmental conditions
   */
  updateEnvironmentalConditions(id: number, conditions: Partial<EnvironmentalConditions>): Observable<EnvironmentalConditions> {
    return this.apiService.put<EnvironmentalConditions>(`${this.baseUrl}/${id}/environmental-conditions`, conditions);
  }

  /**
   * Get maintenance records
   */
  getMaintenanceRecords(id: number): Observable<ProductionUnitMaintenanceRecord[]> {
    return this.apiService.get<ProductionUnitMaintenanceRecord[]>(`${this.baseUrl}/${id}/maintenance`);
  }

  /**
   * Schedule maintenance
   */
  scheduleMaintenance(id: number, maintenance: ProductionUnitMaintenanceRecord): Observable<ProductionUnitMaintenanceRecord> {
    const payload = {
      ...maintenance,
      ...(maintenance.scheduledDate && {
        scheduledDate: typeof maintenance.scheduledDate === 'string' 
          ? maintenance.scheduledDate 
          : maintenance.scheduledDate.toISOString()
      }),
      ...(maintenance.completedDate && {
        completedDate: typeof maintenance.completedDate === 'string' 
          ? maintenance.completedDate 
          : maintenance.completedDate.toISOString()
      }),
      ...(maintenance.nextMaintenanceDate && {
        nextMaintenanceDate: typeof maintenance.nextMaintenanceDate === 'string' 
          ? maintenance.nextMaintenanceDate 
          : maintenance.nextMaintenanceDate.toISOString()
      })
    };

    return this.apiService.post<ProductionUnitMaintenanceRecord>(`${this.baseUrl}/${id}/maintenance`, payload);
  }

  /**
   * Complete maintenance
   */
  completeMaintenance(id: number, maintenanceId: number, notes?: string): Observable<ProductionUnitMaintenanceRecord> {
    const payload = {
      status: 'completed',
      completedDate: new Date().toISOString(),
      ...(notes && { notes })
    };

    return this.apiService.put<ProductionUnitMaintenanceRecord>(`${this.baseUrl}/${id}/maintenance/${maintenanceId}`, payload);
  }

  /**
   * Get overdue maintenance
   */
  getOverdueMaintenance(): Observable<ProductionUnitMaintenanceRecord[]> {
    return this.apiService.get<ProductionUnitMaintenanceRecord[]>(`${this.baseUrl}/maintenance/overdue`);
  }

  /**
   * Get upcoming maintenance
   */
  getUpcomingMaintenance(days: number = 7): Observable<ProductionUnitMaintenanceRecord[]> {
    const params = new HttpParams().set('upcomingDays', days.toString());
    return this.apiService.get<ProductionUnitMaintenanceRecord[]>(`${this.baseUrl}/maintenance/upcoming`, params);
  }

  /**
   * Get production unit history
   */
  getProductionHistory(id: number, limit?: number): Observable<any[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.apiService.get<any[]>(`${this.baseUrl}/${id}/production-history`, params);
  }

  /**
   * Get yield performance
   */
  getYieldPerformance(id: number, months?: number): Observable<{
    averageYieldPerSquareMeter: number;
    yieldEfficiency: number;
    bestPerformingCrop: string;
    worstPerformingCrop: string;
    monthlyYield: {
      month: string;
      yield: number;
      efficiency: number;
    }[];
    recommendations: string[];
  }> {
    let params = new HttpParams();
    if (months) {
      params = params.set('months', months.toString());
    }

    return this.apiService.get(`${this.baseUrl}/${id}/yield-performance`, params);
  }

  /**
   * Clone production unit configuration
   */
  cloneConfiguration(id: number, newName: string, farmId?: number): Observable<ProductionUnit> {
    const payload = {
      name: newName,
      ...(farmId && { farmId })
    };

    return this.apiService.post<ProductionUnit>(`${this.baseUrl}/${id}/clone`, payload);
  }

  /**
   * Bulk operations
   */
  bulkUpdate(ids: number[], data: Partial<ProductionUnitUpdateRequest>): Observable<ProductionUnit[]> {
    const payload = {
      ids,
      updateData: data
    };

    return this.apiService.put<ProductionUnit[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  /**
   * Export to Excel
   */
  exportToExcel(filters?: ProductionUnitFilters): Observable<Blob> {
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

  // Production Unit Types Management
  /**
   * Get all production unit types
   */
  getAllTypes(): Observable<ProductionUnitType[]> {
    return this.apiService.get<ProductionUnitType[]>(this.typesUrl);
  }

  /**
   * Get production unit type by ID
   */
  getTypeById(id: number): Observable<ProductionUnitType> {
    return this.apiService.get<ProductionUnitType>(`${this.typesUrl}/${id}`);
  }

  /**
   * Create production unit type
   */
  createType(data: { name: string; description?: string }): Observable<ProductionUnitType> {
    return this.apiService.post<ProductionUnitType>(this.typesUrl, data);
  }

  /**
   * Update production unit type
   */
  updateType(id: number, data: { name?: string; description?: string }): Observable<ProductionUnitType> {
    return this.apiService.put<ProductionUnitType>(`${this.typesUrl}/${id}`, data);
  }

  /**
   * Delete production unit type
   */
  deleteType(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.typesUrl}/${id}`);
  }

  /**
   * Utility methods for components
   */
  formatType(productionUnitType?: ProductionUnitType): string {
    return productionUnitType?.name || 'Sin tipo';
  }

  calculateUtilizationPercentage(totalCapacity: number, usedCapacity: number): number {
    if (!totalCapacity) return 0;
    return Math.round((usedCapacity / totalCapacity) * 100);
  }

  calculateAreaUtilizationPercentage(totalArea: number, usedArea: number): number {
    if (!totalArea) return 0;
    return Math.round((usedArea / totalArea) * 100);
  }

  isAvailableForPlanting(unit: ProductionUnit, requiredArea?: number, requiredCapacity?: number): boolean {
    if (!unit.isActive) return false;

    // Check if there's enough available area
    if (requiredArea && unit.area) {
      // This would need to be calculated based on current productions
      // For now, we'll assume it's available if the unit is active
    }

    // Check if there's enough available capacity
    if (requiredCapacity && unit.capacity) {
      // This would need to be calculated based on current productions
      // For now, we'll assume it's available if the unit is active
    }

    return true;
  }

  getMaintenanceStatus(unit: ProductionUnit): 'none' | 'scheduled' | 'overdue' | 'in_progress' {
    // This would be calculated based on maintenance records
    // For now, return 'none' as default
    return 'none';
  }

  calculateProductivityScore(yieldEfficiency: number, utilizationRate: number): number {
    // Weighted score: 70% yield efficiency, 30% utilization rate
    return Math.round((yieldEfficiency * 0.7) + (utilizationRate * 0.3));
  }

  getProductivityCategory(score: number): 'high' | 'medium' | 'low' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  formatArea(area: number): string {
    if (area >= 10000) {
      return `${(area / 10000).toFixed(1)} ha`;
    }
    return `${area.toFixed(0)} m²`;
  }

  formatCapacity(capacity: number, unit?: string): string {
    const unitText = unit || 'unidades';
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}K ${unitText}`;
    }
    return `${capacity.toFixed(0)} ${unitText}`;
  }

  /**
   * Data transformation methods
   */
  groupByType(units: ProductionUnit[]): { [typeName: string]: ProductionUnit[] } {
    return units.reduce((groups, unit) => {
      const typeName = unit.productionUnitType?.name || 'Sin tipo';
      if (!groups[typeName]) {
        groups[typeName] = [];
      }
      groups[typeName].push(unit);
      return groups;
    }, {} as { [typeName: string]: ProductionUnit[] });
  }

  groupByFarm(units: ProductionUnit[]): { [farmName: string]: ProductionUnit[] } {
    return units.reduce((groups, unit) => {
      const farmName = unit.farm?.name || 'Sin finca';
      if (!groups[farmName]) {
        groups[farmName] = [];
      }
      groups[farmName].push(unit);
      return groups;
    }, {} as { [farmName: string]: ProductionUnit[] });
  }

  sortByArea(units: ProductionUnit[], ascending: boolean = false): ProductionUnit[] {
    return [...units].sort((a, b) => {
      const areaA = a.area || 0;
      const areaB = b.area || 0;
      return ascending ? areaA - areaB : areaB - areaA;
    });
  }

  sortByCapacity(units: ProductionUnit[], ascending: boolean = false): ProductionUnit[] {
    return [...units].sort((a, b) => {
      const capacityA = a.capacity || 0;
      const capacityB = b.capacity || 0;
      return ascending ? capacityA - capacityB : capacityB - capacityA;
    });
  }

  filterByAvailability(units: ProductionUnit[]): ProductionUnit[] {
    return units.filter(unit => this.isAvailableForPlanting(unit));
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
    console.error('Production Unit Service Error:', error);
    throw error;
  }
}