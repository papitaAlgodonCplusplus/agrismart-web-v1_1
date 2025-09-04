// src/app/features/crop-production/services/crop-production.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { CropProduction } from '../../../core/models/models';

export interface CropProductionFilters {
  onlyActive?: boolean;
  status?: string;
  cropId?: number | null;
  productionUnitId?: number | null;
  farmId?: number | null;
  searchTerm?: string;
  plantingDateFrom?: string;
  plantingDateTo?: string;
  harvestDateFrom?: string;
  harvestDateTo?: string;
  minProgress?: number;
  maxProgress?: number;
  plantedAreaMin?: number;
  plantedAreaMax?: number;
  expectedYieldMin?: number;
  expectedYieldMax?: number;
  hasIrrigationSectors?: boolean;
  hasFertilizerInputs?: boolean;
}

export interface CropProductionCreateRequest {
  code?: string;
  cropId: number;
  productionUnitId: number;
  plantingDate: Date | string;
  estimatedHarvestDate?: Date | string;
  status?: string;
  plantedArea?: number;
  expectedYield?: number;
  description?: string;
  plantingSettings?: {
    seedDensity?: number;
    rowSpacing?: number;
    plantSpacing?: number;
    depth?: number;
    seedTreatment?: string;
  };
  irrigationSettings?: {
    irrigationMethod?: string;
    waterRequirementPerWeek?: number;
    irrigationFrequency?: string;
  };
  fertilizationPlan?: {
    baseFertilizer?: string;
    growthFertilizer?: string;
    floweringFertilizer?: string;
    fruitingFertilizer?: string;
  };
  pestManagementPlan?: {
    preventiveTreatments?: string[];
    monitoringSchedule?: string;
    organicApproach?: boolean;
  };
  harvestPlan?: {
    expectedHarvestWeeks?: number;
    harvestMethod?: string;
    postHarvestTreatment?: string;
    targetMarket?: string;
  };
  isActive?: boolean;
}

export interface CropProductionUpdateRequest extends Partial<CropProductionCreateRequest> {
  actualHarvestDate?: Date | string;
  actualYield?: number;
  progress?: number;
}

export interface CropProductionStatusUpdate {
  status: string;
  progress?: number;
  notes?: string;
  updatedById: number;
  images?: string[];
}

export interface HarvestRecord {
  harvestDate: Date | string;
  quantity: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  marketPrice?: number;
  totalValue?: number;
  harvestedById: number;
  packagingType?: string;
  destination?: string;
  batchNumber?: string;
}

export interface CropProductionStatistics {
  totalProductions: number;
  activeProductions: number;
  completedProductions: number;
  totalPlantedArea: number;
  totalExpectedYield: number;
  totalActualYield: number;
  yieldEfficiency: number; // actual vs expected percentage
  averageGrowthCycle: number;
  byStatus: {
    [status: string]: {
      count: number;
      totalArea: number;
      averageProgress: number;
    };
  };
  byCrop: {
    cropId: number;
    cropName: string;
    productions: number;
    totalArea: number;
    totalYield: number;
    averageYield: number;
    successRate: number;
  }[];
  byFarm: {
    farmId: number;
    farmName: string;
    productions: number;
    totalArea: number;
    utilizationRate: number;
  }[];
  monthlyProductions: {
    month: string;
    plantings: number;
    harvests: number;
    totalYield: number;
    averagePrice: number;
  }[];
  profitability: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
    roi: number; // return on investment
  };
  currentSeasonSummary: {
    totalProductions: number;
    readyToHarvest: number;
    inProgress: number;
    recentlyPlanted: number;
    projectedRevenue: number;
  };
}

export interface CropProductionAnalytics {
  id: number;
  code: string;
  cropName: string;
  performance: {
    cycleDays: number;
    actualVsExpectedDays: number;
    yieldPerSquareMeter: number;
    yieldEfficiency: number;
    waterUsageEfficiency: number;
    fertilizerEfficiency: number;
  };
  financials: {
    totalCosts: number;
    revenue: number;
    profit: number;
    profitPerSquareMeter: number;
    breakEvenPoint: number;
    roi: number;
  };
  environmental: {
    waterUsage: number;
    fertilizerUsage: number;
    pesticideUsage: number;
    carbonFootprint: number;
    sustainabilityScore: number;
  };
  issues: {
    diseaseIncidents: number;
    pestProblems: number;
    weatherIssues: number;
    yieldLosses: number;
    qualityIssues: number;
  };
}

export interface CropProductionForecast {
  productionId: number;
  currentStatus: string;
  currentProgress: number;
  predictions: {
    estimatedHarvestDate: Date;
    confidenceLevel: number;
    expectedYield: number;
    yieldRange: {
      min: number;
      max: number;
    };
    qualityForecast: string;
    marketPrice: number;
    potentialRevenue: number;
  };
  recommendations: {
    nextActions: string[];
    optimizations: string[];
    riskMitigation: string[];
    marketingAdvice: string[];
  };
  risks: {
    weatherRisks: string[];
    diseaseRisks: string[];
    marketRisks: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface CropProductionAlert {
  id: number;
  cropProductionId: number;
  alertType: 'status_change' | 'delay' | 'disease' | 'pest' | 'harvest_ready' | 'irrigation_needed' | 'fertilizer_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  isActive: boolean;
  actionRequired: boolean;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CropProductionService {
  private readonly baseUrl = '/api/crop-productions';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all crop productions with optional filters
   */
  getAll(filters?: CropProductionFilters): Observable<CropProduction[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.cropId) {
        params = params.set('cropId', filters.cropId.toString());
      }
      if (filters.productionUnitId) {
        params = params.set('productionUnitId', filters.productionUnitId.toString());
      }
      if (filters.farmId) {
        params = params.set('farmId', filters.farmId.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.plantingDateFrom) {
        params = params.set('plantingDateFrom', filters.plantingDateFrom);
      }
      if (filters.plantingDateTo) {
        params = params.set('plantingDateTo', filters.plantingDateTo);
      }
      if (filters.harvestDateFrom) {
        params = params.set('harvestDateFrom', filters.harvestDateFrom);
      }
      if (filters.harvestDateTo) {
        params = params.set('harvestDateTo', filters.harvestDateTo);
      }
      if (filters.minProgress !== undefined) {
        params = params.set('minProgress', filters.minProgress.toString());
      }
      if (filters.maxProgress !== undefined) {
        params = params.set('maxProgress', filters.maxProgress.toString());
      }
      if (filters.plantedAreaMin !== undefined) {
        params = params.set('plantedAreaMin', filters.plantedAreaMin.toString());
      }
      if (filters.plantedAreaMax !== undefined) {
        params = params.set('plantedAreaMax', filters.plantedAreaMax.toString());
      }
      if (filters.expectedYieldMin !== undefined) {
        params = params.set('expectedYieldMin', filters.expectedYieldMin.toString());
      }
      if (filters.expectedYieldMax !== undefined) {
        params = params.set('expectedYieldMax', filters.expectedYieldMax.toString());
      }
      if (filters.hasIrrigationSectors !== undefined) {
        params = params.set('hasIrrigationSectors', filters.hasIrrigationSectors.toString());
      }
      if (filters.hasFertilizerInputs !== undefined) {
        params = params.set('hasFertilizerInputs', filters.hasFertilizerInputs.toString());
      }
    }

    return this.apiService.get<CropProduction[]>(this.baseUrl, params);
  }

  /**
   * Get crop production by ID
   */
  getById(id: number): Observable<CropProduction> {
    return this.apiService.get<CropProduction>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new crop production
   */
  create(data: CropProductionCreateRequest): Observable<CropProduction> {
    const payload = {
      ...data,
      plantingDate: typeof data.plantingDate === 'string' 
        ? data.plantingDate 
        : data.plantingDate.toISOString(),
      ...(data.estimatedHarvestDate && {
        estimatedHarvestDate: typeof data.estimatedHarvestDate === 'string' 
          ? data.estimatedHarvestDate 
          : data.estimatedHarvestDate.toISOString()
      }),
      status: data.status || 'Preparacion',
      progress: 0,
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<CropProduction>(this.baseUrl, payload);
  }

  /**
   * Update crop production
   */
  update(id: number, data: CropProductionUpdateRequest): Observable<CropProduction> {
    const payload = {
      ...data,
      ...(data.plantingDate && {
        plantingDate: typeof data.plantingDate === 'string' 
          ? data.plantingDate 
          : data.plantingDate.toISOString()
      }),
      ...(data.estimatedHarvestDate && {
        estimatedHarvestDate: typeof data.estimatedHarvestDate === 'string' 
          ? data.estimatedHarvestDate 
          : data.estimatedHarvestDate.toISOString()
      }),
      ...(data.actualHarvestDate && {
        actualHarvestDate: typeof data.actualHarvestDate === 'string' 
          ? data.actualHarvestDate 
          : data.actualHarvestDate.toISOString()
      })
    };

    return this.apiService.put<CropProduction>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Delete crop production
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Update crop production status
   */
  updateStatus(id: number, statusUpdate: CropProductionStatusUpdate): Observable<CropProduction> {
    return this.apiService.put<CropProduction>(`${this.baseUrl}/${id}/status`, statusUpdate);
  }

  /**
   * Move to next growth stage
   */
  moveToNextStage(id: number, notes?: string, images?: string[]): Observable<CropProduction> {
    const payload = { notes, images };
    return this.apiService.post<CropProduction>(`${this.baseUrl}/${id}/next-stage`, payload);
  }

  /**
   * Record harvest
   */
  recordHarvest(id: number, harvestData: HarvestRecord): Observable<CropProduction> {
    const payload = {
      ...harvestData,
      harvestDate: typeof harvestData.harvestDate === 'string' 
        ? harvestData.harvestDate 
        : harvestData.harvestDate.toISOString()
    };

    return this.apiService.post<CropProduction>(`${this.baseUrl}/${id}/harvest`, payload);
  }

  /**
   * Get harvest history
   */
  getHarvestHistory(id: number): Observable<HarvestRecord[]> {
    return this.apiService.get<HarvestRecord[]>(`${this.baseUrl}/${id}/harvest-history`);
  }

  /**
   * Clone crop production
   */
  clone(id: number, newPlantingDate: Date | string, productionUnitId?: number): Observable<CropProduction> {
    const payload = {
      plantingDate: typeof newPlantingDate === 'string' 
        ? newPlantingDate 
        : newPlantingDate.toISOString(),
      ...(productionUnitId && { productionUnitId })
    };

    return this.apiService.post<CropProduction>(`${this.baseUrl}/${id}/clone`, payload);
  }

  /**
   * Get crop production statistics
   */
  getStatistics(farmId?: number, dateFrom?: string, dateTo?: string): Observable<CropProductionStatistics> {
    let params = new HttpParams();
    
    if (farmId) {
      params = params.set('farmId', farmId.toString());
    }
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.apiService.get<CropProductionStatistics>(`${this.baseUrl}/statistics`, params);
  }

  /**
   * Get crop production analytics
   */
  getAnalytics(id: number): Observable<CropProductionAnalytics> {
    return this.apiService.get<CropProductionAnalytics>(`${this.baseUrl}/${id}/analytics`);
  }

  /**
   * Get crop production forecast
   */
  getForecast(id: number): Observable<CropProductionForecast> {
    return this.apiService.get<CropProductionForecast>(`${this.baseUrl}/${id}/forecast`);
  }

  /**
   * Get active crop productions
   */
  getActive(): Observable<CropProduction[]> {
    return this.getAll({ onlyActive: true });
  }

  /**
   * Get crop productions by status
   */
  getByStatus(status: string): Observable<CropProduction[]> {
    return this.getAll({ status });
  }

  /**
   * Get crop productions by crop
   */
  getByCrop(cropId: number): Observable<CropProduction[]> {
    return this.getAll({ cropId });
  }

  /**
   * Get crop productions by farm
   */
  getByFarm(farmId: number): Observable<CropProduction[]> {
    return this.getAll({ farmId });
  }

  /**
   * Get crop productions ready for harvest
   */
  getReadyForHarvest(): Observable<CropProduction[]> {
    return this.getAll({ status: 'Cosecha' });
  }

  /**
   * Get recently planted crop productions
   */
  getRecentlyPlanted(days: number = 30): Observable<CropProduction[]> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    return this.getAll({ 
      plantingDateFrom: dateFrom.toISOString().split('T')[0] 
    });
  }

  /**
   * Get production calendar
   */
  getProductionCalendar(year?: number, month?: number): Observable<any[]> {
    let params = new HttpParams();
    
    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }

    return this.apiService.get<any[]>(`${this.baseUrl}/calendar`, params);
  }

  /**
   * Get alerts for crop productions
   */
  getAlerts(id?: number): Observable<CropProductionAlert[]> {
    const url = id ? `${this.baseUrl}/${id}/alerts` : `${this.baseUrl}/alerts`;
    return this.apiService.get<CropProductionAlert[]>(url);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: number): Observable<CropProductionAlert> {
    return this.apiService.put<CropProductionAlert>(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {});
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: number, resolution?: string): Observable<CropProductionAlert> {
    const payload = { resolution: resolution || '' };
    return this.apiService.put<CropProductionAlert>(`${this.baseUrl}/alerts/${alertId}/resolve`, payload);
  }

  /**
   * Get irrigation sectors for crop production
   */
  getIrrigationSectors(id: number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.baseUrl}/${id}/irrigation-sectors`);
  }

  /**
   * Get fertilizer inputs for crop production
   */
  getFertilizerInputs(id: number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.baseUrl}/${id}/fertilizer-inputs`);
  }

  /**
   * Get growth progress images
   */
  getProgressImages(id: number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.baseUrl}/${id}/images`);
  }

  /**
   * Upload progress image
   */
  uploadProgressImage(id: number, imageFile: File, description?: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (description) {
      formData.append('description', description);
    }

    return this.http.post(`${this.apiConfig.agronomicApiUrl}${this.baseUrl}/${id}/images`, formData, {
      headers: this.getAuthHeaders(false) // Don't set Content-Type for FormData
    });
  }

  /**
   * Get weather impact analysis
   */
  getWeatherImpact(id: number, days?: number): Observable<any> {
    let params = new HttpParams();
    if (days) {
      params = params.set('days', days.toString());
    }

    return this.apiService.get<any>(`${this.baseUrl}/${id}/weather-impact`, params);
  }

  /**
   * Get recommended actions
   */
  getRecommendedActions(id: number): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/${id}/recommendations`);
  }

  /**
   * Bulk operations
   */
  bulkUpdateStatus(ids: number[], status: string, notes?: string): Observable<CropProduction[]> {
    const payload = { ids, status, notes };
    return this.apiService.put<CropProduction[]>(`${this.baseUrl}/bulk/status`, payload);
  }

  bulkHarvest(ids: number[], harvestData: Partial<HarvestRecord>): Observable<CropProduction[]> {
    const payload = { 
      ids, 
      ...harvestData,
      ...(harvestData.harvestDate && {
        harvestDate: typeof harvestData.harvestDate === 'string' 
          ? harvestData.harvestDate 
          : harvestData.harvestDate.toISOString()
      })
    };
    return this.apiService.put<CropProduction[]>(`${this.baseUrl}/bulk/harvest`, payload);
  }

  bulkDelete(ids: number[]): Observable<void> {
    const payload = { ids };
    return this.apiService.post<void>(`${this.baseUrl}/bulk/delete`, payload);
  }

  /**
   * Export crop production data
   */
  exportData(filters?: any, format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get(`${this.apiConfig.agronomicApiUrl}${this.baseUrl}/export`, {
      params,
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Generate production report
   */
  generateReport(id: number, reportType: 'summary' | 'detailed' | 'financial' = 'summary'): Observable<Blob> {
    const params = new HttpParams().set('type', reportType);

    return this.http.get(`${this.apiConfig.agronomicApiUrl}${this.baseUrl}/${id}/report`, {
      params,
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Real-time monitoring
   */
  getRealtimeData(id: number): Observable<CropProduction> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getById(id))
    );
  }

  /**
   * Utility methods for components
   */
  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Preparacion': 'Preparación',
      'Siembra': 'Siembra',
      'Crecimiento': 'Crecimiento',
      'Floracion': 'Floración',
      'Fructificacion': 'Fructificación',
      'Cosecha': 'Cosecha',
      'Finalizada': 'Finalizada'
    };
    return statusMap[status] || status;
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'Preparacion': 'bi-gear',
      'Siembra': 'bi-seeds',
      'Crecimiento': 'bi-graph-up-arrow',
      'Floracion': 'bi-flower1',
      'Fructificacion': 'bi-apple',
      'Cosecha': 'bi-scissors',
      'Finalizada': 'bi-check-circle'
    };
    return statusIcons[status] || 'bi-circle';
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'Preparacion': 'secondary',
      'Siembra': 'info',
      'Crecimiento': 'primary',
      'Floracion': 'warning',
      'Fructificacion': 'success',
      'Cosecha': 'danger',
      'Finalizada': 'dark'
    };
    return statusColors[status] || 'light';
  }

  calculateDaysInProduction(plantingDate: Date): number {
    const today = new Date();
    const planting = new Date(plantingDate);
    const diffTime = Math.abs(today.getTime() - planting.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateDaysToHarvest(estimatedHarvestDate?: Date): number | null {
    if (!estimatedHarvestDate) return null;
    const today = new Date();
    const harvest = new Date(estimatedHarvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateYieldEfficiency(actualYield?: number, expectedYield?: number): number {
    if (!actualYield || !expectedYield) return 0;
    return Math.round((actualYield / expectedYield) * 100);
  }

  isOverdue(estimatedHarvestDate?: Date, status?: string): boolean {
    if (!estimatedHarvestDate || status === 'Finalizada') return false;
    const today = new Date();
    const harvest = new Date(estimatedHarvestDate);
    return today > harvest;
  }

  isReadyForNextStage(status: string, progress: number): boolean {
    const stageThresholds: { [key: string]: number } = {
      'Preparacion': 100,
      'Siembra': 100,
      'Crecimiento': 80,
      'Floracion': 90,
      'Fructificacion': 95,
      'Cosecha': 100
    };
    
    const threshold = stageThresholds[status] || 100;
    return progress >= threshold;
  }

  getNextStatus(currentStatus: string): string | null {
    const statusFlow = [
      'Preparacion',
      'Siembra',
      'Crecimiento',
      'Floracion',
      'Fructificacion',
      'Cosecha',
      'Finalizada'
    ];
    
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return null;
    }
    
    return statusFlow[currentIndex + 1];
  }

  /**
   * Data transformation methods
   */
  groupByStatus(productions: CropProduction[]): { [status: string]: CropProduction[] } {
    return productions.reduce((groups, production) => {
      const status = production.status || 'Sin estado';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(production);
      return groups;
    }, {} as { [status: string]: CropProduction[] });
  }

  groupByCrop(productions: CropProduction[]): { [cropName: string]: CropProduction[] } {
    return productions.reduce((groups, production) => {
      const cropName = production.crop?.name || 'Sin cultivo';
      if (!groups[cropName]) {
        groups[cropName] = [];
      }
      groups[cropName].push(production);
      return groups;
    }, {} as { [cropName: string]: CropProduction[] });
  }

  sortByProgress(productions: CropProduction[], ascending: boolean = false): CropProduction[] {
    return [...productions].sort((a, b) => {
      const progressA = a.progress || 0;
      const progressB = b.progress || 0;
      return ascending ? progressA - progressB : progressB - progressA;
    });
  }

  sortByPlantingDate(productions: CropProduction[], ascending: boolean = false): CropProduction[] {
    return [...productions].sort((a, b) => {
      const dateA = new Date(a.plantingDate).getTime();
      const dateB = new Date(b.plantingDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  filterByDateRange(productions: CropProduction[], startDate: Date, endDate: Date): CropProduction[] {
    return productions.filter(production => {
      const plantingDate = new Date(production.plantingDate);
      return plantingDate >= startDate && plantingDate <= endDate;
    });
  }

  /**
   * Private helper methods
   */
  private getAuthHeaders(includeContentType: boolean = true): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    const headers: { [header: string]: string } = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private handleError(error: any): Observable<never> {
    console.error('Crop Production Service Error:', error);
    throw error;
  }
}