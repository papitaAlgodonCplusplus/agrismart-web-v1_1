// src/app/features/fertilizers/services/fertilizer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { CatalogService } from '../../catalogs/services/catalog.service';
import { Fertilizer } from '../../../core/models/models';
import { BackendResponse } from '../../nutrient-formulation/nutrient-formulation.component';


interface FertilizerChemistry {
  id: number;
  fertilizerId: number;
  purity: number;
  density: number;
  solubility0: number;
  solubility20: number;
  solubility40: number;
  formula: string;
  valence: number;
  isPhAdjuster: boolean;
  active: boolean;
}

interface EnhancedFertilizer extends Fertilizer {
  chemistry?: FertilizerChemistry;
  costPerUnit?: number; // pricePerUnit adjusted for purity
  isOrganic?: boolean;
  nutrientContent?: {
    nitrogenPpm: number;
    phosphorusPpm: number;
    potassiumPpm: number;
    calciumPpm?: number;
    magnesiumPpm?: number;
    sulfurPpm?: number;
    ironPpm?: number;
  };
}

interface NutrientTarget {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  calcium?: number;
  magnesium?: number;
  sulfur?: number;
  iron?: number;
}

interface FertilizerRecommendation {
  fertilizer: EnhancedFertilizer;
  concentration: number; // grams per liter
  contributedNutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium?: number;
    magnesium?: number;
    sulfur?: number;
  };
  cost: number;
  priority: number; // 1-10 scale
}


export interface FertilizerFilters {
  catalogId?: number;
  user?: any;
  onlyActive?: boolean;
  type?: string;
  npkCategory?: string;
  searchTerm?: string;
  applicationMethod?: string;
  lowStock?: boolean;
  expiringWithin?: number; // days
  supplier?: string;
  minStock?: number;
  maxStock?: number;
}

export interface FertilizerCreateRequest {
  catalogId?: number; // Now required
  name?: string;
  brand?: string;
  description?: string;
  type?: string;
  formulation?: string;
  concentration?: number;
  concentrationUnit?: string;
  applicationMethod?: string;
  nitrogenPercentage?: number;
  phosphorusPercentage?: number;
  potassiumPercentage?: number;
  micronutrients?: string;
  currentStock?: number;
  minimumStock?: number;
  stockUnit?: string;
  pricePerUnit?: number;
  supplier?: string;
  expirationDate?: Date | string;
  storageInstructions?: string;
  applicationInstructions?: string;
  isActive?: boolean;
}

export interface FertilizerUpdateRequest extends Partial<FertilizerCreateRequest> { }

export interface StockAdjustmentRequest {
  adjustmentType: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
  cost?: number;
  supplier?: string;
  batchNumber?: string;
  expirationDate?: Date | string;
}

export interface FertilizerStatistics {
  totalFertilizers: number;
  totalStockValue: number;
  lowStockCount: number;
  expiringCount: number;
  byType: {
    [type: string]: {
      count: number;
      totalStock: number;
      averagePrice: number;
    };
  };
  bySupplier: {
    [supplier: string]: {
      count: number;
      totalValue: number;
    };
  };
  npkDistribution: {
    highNitrogen: number;
    highPhosphorus: number;
    highPotassium: number;
    balanced: number;
    micronutrients: number;
  };
  stockMovements: {
    date: string;
    purchases: number;
    usage: number;
    adjustments: number;
  }[];
}

export interface FertilizerUsageReport {
  fertilizerId: number;
  fertilizerName: string;
  totalUsage: number;
  totalCost: number;
  applicationsCount: number;
  averageApplicationQuantity: number;
  cropProductionsUsed: {
    cropProductionId: number;
    cropProductionCode: string;
    cropName: string;
    quantity: number;
    applications: number;
  }[];
  monthlyUsage: {
    month: string;
    quantity: number;
    cost: number;
    applications: number;
  }[];
}

export interface StockMovement {
  id: number;
  fertilizerId: number;
  movementType: 'purchase' | 'usage' | 'adjustment' | 'expired' | 'loss';
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  notes?: string;
  cost?: number;
  supplier?: string;
  batchNumber?: string;
  userId: number;
  userName: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FertilizerService {
  user: any;

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient,
    private catalogService: CatalogService
  ) {
    // No need to store baseUrl - ApiService handles URL construction
  }

  /**
   * Get all fertilizers with catalogId (now required)
   * If no catalogId provided, it will try to get the current user's catalog
   */
  getAll(filters?: FertilizerFilters): Observable<Fertilizer[]> {
    console.log("Getting all Fertilizers with filters: ", filters)
    if (filters?.catalogId) {
      return this.getFertilizersWithCatalogId(filters.catalogId, filters);
    }

    if (filters?.user) {
      this.user = filters.user;
    }

    // If no catalogId provided, get from current user's catalog
    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(response => {
        console.log("retrieve catalogs ", response)
        // TODO Map for all catalogs
        if (response.catalogs && response.catalogs.length > 0) {
          const catalogId = response.catalogs[0].id; // Use first catalog
          return this.getFertilizersWithCatalogId(catalogId, filters);
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  // In your fertilizer.service.ts, update the getFertilizersWithCatalogId method:

  getFertilizersWithCatalogId(catalogId: number | undefined, filters?: FertilizerFilters): Observable<Fertilizer[]> {
    console.log("get ferts by catalog id: ", catalogId)
    let params = new HttpParams().set('CatalogId', catalogId?.toString() || '');

    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.npkCategory) {
        params = params.set('npkCategory', filters.npkCategory);
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.applicationMethod) {
        params = params.set('applicationMethod', filters.applicationMethod);
      }
      if (filters.lowStock !== undefined) {
        params = params.set('lowStock', filters.lowStock.toString());
      }
      if (filters.expiringWithin !== undefined) {
        params = params.set('expiringWithin', filters.expiringWithin.toString());
      }
      if (filters.supplier) {
        params = params.set('supplier', filters.supplier);
      }
      if (filters.minStock !== undefined) {
        params = params.set('minStock', filters.minStock.toString());
      }
      if (filters.maxStock !== undefined) {
        params = params.set('maxStock', filters.maxStock.toString());
      }
    }

    return this.apiService.get<any>('/Fertilizer', params).pipe(
      map(response => {
        console.log('Raw API response:', response);

        // Handle different response formats from the API
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Try different possible response structures
          if (Array.isArray(response.data)) {
            return response.data;
          } else if (Array.isArray(response.result)) {
            return response.result;
          } else if (Array.isArray(response.fertilizers)) {
            return response.fertilizers;
          } else if (Array.isArray(response.items)) {
            return response.items;
          }
        }

        console.warn('Unexpected API response format:', response);
        return []; // Return empty array as fallback
      }),
      catchError(error => {
        console.error('Error fetching fertilizers:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  /**
   * Get fertilizer by ID
   */
  getById(id: number): Observable<Fertilizer> {
    return this.apiService.get<Fertilizer>(`/Fertilizer/${id}`);
  }

  /**
   * Create new fertilizer (catalogId now required)
   */
  create(data: FertilizerCreateRequest): Observable<Fertilizer> {
    if (!data.catalogId) {
      throw new Error('catalogId is required for creating fertilizer');
    }

    const payload = {
      ...data,
      ...(data.expirationDate && {
        expirationDate: typeof data.expirationDate === 'string'
          ? data.expirationDate
          : data.expirationDate.toISOString()
      }),
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<Fertilizer>('/Fertilizer', payload);
  }

  /**
   * Create fertilizer with auto-detected catalogId
   */
  createWithCurrentCatalog(data: Omit<FertilizerCreateRequest, 'catalogId'>): Observable<Fertilizer> {
    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        console.log("retrieved catalogs ", catalogs)
        if (catalogs && catalogs.length > 0) {
          const catalogId = catalogs[0].id;
          return this.create({ ...data, catalogId });
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Update fertilizer
   */
  update(id: number, data: FertilizerUpdateRequest): Observable<Fertilizer> {
    const payload = {
      ...data,
      ...(data.expirationDate && {
        expirationDate: typeof data.expirationDate === 'string'
          ? data.expirationDate
          : data.expirationDate.toISOString()
      })
    };

    return this.apiService.put<Fertilizer>(`/Fertilizer/${id}`, payload);
  }

  /**
   * Delete fertilizer
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/Fertilizer/${id}`);
  }

  /**
   * Activate/deactivate fertilizer
   */
  toggleStatus(id: number, isActive: boolean): Observable<Fertilizer> {
    const payload = { isActive };
    return this.apiService.put<Fertilizer>(`/Fertilizer/${id}/status`, payload);
  }

  /**
   * Adjust fertilizer stock
   */
  adjustStock(id: number, adjustment: StockAdjustmentRequest): Observable<Fertilizer> {
    const payload = {
      ...adjustment,
      ...(adjustment.expirationDate && {
        expirationDate: typeof adjustment.expirationDate === 'string'
          ? adjustment.expirationDate
          : adjustment.expirationDate.toISOString()
      })
    };

    return this.apiService.post<Fertilizer>(`/Fertilizer/${id}/stock-adjustment`, payload);
  }

  /**
   * Get stock movements for a fertilizer
   */
  getStockMovements(id: number, limit?: number): Observable<StockMovement[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.apiService.get<StockMovement[]>(`/Fertilizer/${id}/stock-movements`, params);
  }

  /**
   * Get low stock fertilizers for specific catalog
   */
  getLowStock(catalogId?: number): Observable<Fertilizer[]> {
    if (catalogId) {
      return this.getFertilizersWithCatalogId(catalogId, { lowStock: true });
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          return this.getFertilizersWithCatalogId(catalogs[0].id, { lowStock: true });
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get expiring fertilizers for specific catalog
   */
  getExpiring(withinDays: number = 30, catalogId?: number): Observable<Fertilizer[]> {
    if (catalogId) {
      return this.getFertilizersWithCatalogId(catalogId, { expiringWithin: withinDays });
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          return this.getFertilizersWithCatalogId(catalogs[0].id, { expiringWithin: withinDays });
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get fertilizers by type for specific catalog
   */
  getByType(type: string, catalogId?: number): Observable<Fertilizer[]> {
    if (catalogId) {
      return this.getFertilizersWithCatalogId(catalogId, { type });
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          return this.getFertilizersWithCatalogId(catalogs[0].id, { type });
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get fertilizers by supplier for specific catalog
   */
  getBySupplier(supplier: string, catalogId?: number): Observable<Fertilizer[]> {
    if (catalogId) {
      return this.getFertilizersWithCatalogId(catalogId, { supplier });
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          return this.getFertilizersWithCatalogId(catalogs[0].id, { supplier });
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Search fertilizers by name or brand for specific catalog
   */
  search(searchTerm: string, catalogId?: number): Observable<Fertilizer[]> {
    if (catalogId) {
      return this.getFertilizersWithCatalogId(catalogId, { searchTerm });
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          return this.getFertilizersWithCatalogId(catalogs[0].id, { searchTerm });
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get fertilizer statistics for specific catalog
   */
  getStatistics(filters?: FertilizerFilters): Observable<FertilizerStatistics> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    // If no catalogId in filters, get from current user's catalog
    if (!filters?.catalogId) {
      return this.catalogService.getCurrentUserCatalog(this.user).pipe(
        switchMap(catalogs => {
          if (catalogs && catalogs.length > 0) {
            params = params.set('catalogId', catalogs[0].id.toString());
            return this.apiService.get<FertilizerStatistics>('/Fertilizer/statistics', params);
          }
          throw new Error('No catalog found for current user');
        })
      );
    }

    return this.apiService.get<FertilizerStatistics>('/Fertilizer/statistics', params);
  }

  /**
   * Get fertilizer usage report
   */
  getUsageReport(
    id: number,
    dateFrom?: string,
    dateTo?: string
  ): Observable<FertilizerUsageReport> {
    let params = new HttpParams();

    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.apiService.get<FertilizerUsageReport>(`/Fertilizer/${id}/usage-report`, params);
  }

  /**
   * Get all suppliers for specific catalog
   */
  getSuppliers(catalogId?: number): Observable<string[]> {
    let params = new HttpParams();

    if (catalogId) {
      params = params.set('catalogId', catalogId.toString());
      return this.apiService.get<string[]>('/Fertilizer/suppliers', params);
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          params = params.set('catalogId', catalogs[0].id.toString());
          return this.apiService.get<string[]>('/Fertilizer/suppliers', params);
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get fertilizer types for specific catalog
   */
  getTypes(catalogId?: number): Observable<string[]> {
    let params = new HttpParams();

    if (catalogId) {
      params = params.set('catalogId', catalogId.toString());
      return this.apiService.get<string[]>('/Fertilizer/types', params);
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          params = params.set('catalogId', catalogs[0].id.toString());
          return this.apiService.get<string[]>('/Fertilizer/types', params);
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get application methods for specific catalog
   */
  getApplicationMethods(catalogId?: number): Observable<string[]> {
    let params = new HttpParams();

    if (catalogId) {
      params = params.set('catalogId', catalogId.toString());
      return this.apiService.get<string[]>('/Fertilizer/application-methods', params);
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          params = params.set('catalogId', catalogs[0].id.toString());
          return this.apiService.get<string[]>('/Fertilizer/application-methods', params);
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Bulk update fertilizers
   */
  bulkUpdate(ids: number[], data: Partial<FertilizerUpdateRequest>): Observable<Fertilizer[]> {
    const payload = {
      ids,
      updateData: data
    };

    return this.apiService.put<Fertilizer[]>('/Fertilizer/bulk-update', payload);
  }

  /**
   * Bulk stock adjustment
   */
  bulkStockAdjustment(
    adjustments: { id: number; adjustment: StockAdjustmentRequest }[]
  ): Observable<Fertilizer[]> {
    const payload = { adjustments };
    return this.apiService.post<Fertilizer[]>('/Fertilizer/bulk-stock-adjustment', payload);
  }

  /**
   * Export fertilizers to Excel for specific catalog
   */
  exportToExcel(filters?: FertilizerFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    // If no catalogId in filters, get from current user's catalog
    if (!filters?.catalogId) {
      return this.catalogService.getCurrentUserCatalog(this.user).pipe(
        switchMap(catalogs => {
          if (catalogs && catalogs.length > 0) {
            params = params.set('catalogId', catalogs[0].id.toString());
            return this.performExcelExport(params);
          }
          throw new Error('No catalog found for current user');
        })
      );
    }

    return this.performExcelExport(params);
  }

  private performExcelExport(params: HttpParams): Observable<Blob> {
    return this.http.get(`${this.apiConfig.agronomicApiUrl}/Fertilizer/export/excel`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate stock reorder report for specific catalog
   */
  getReorderReport(catalogId?: number): Observable<Fertilizer[]> {
    let params = new HttpParams();

    if (catalogId) {
      params = params.set('catalogId', catalogId.toString());
      return this.apiService.get<Fertilizer[]>('/Fertilizer/reorder-report', params);
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          params = params.set('catalogId', catalogs[0].id.toString());
          return this.apiService.get<Fertilizer[]>('/Fertilizer/reorder-report', params);
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get inventory valuation for specific catalog
   */
  getInventoryValuation(catalogId?: number): Observable<{
    totalValue: number;
    byType: { [type: string]: number };
    bySupplier: { [supplier: string]: number };
    lowStockValue: number;
    expiringValue: number;
  }> {
    let params = new HttpParams();

    if (catalogId) {
      params = params.set('catalogId', catalogId.toString());
      return this.apiService.get<{
        totalValue: number;
        byType: { [type: string]: number };
        bySupplier: { [supplier: string]: number };
        lowStockValue: number;
        expiringValue: number;
      }>('/Fertilizer/inventory-valuation', params);
    }

    return this.catalogService.getCurrentUserCatalog(this.user).pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          params = params.set('catalogId', catalogs[0].id.toString());
          return this.apiService.get<{
            totalValue: number;
            byType: { [type: string]: number };
            bySupplier: { [supplier: string]: number };
            lowStockValue: number;
            expiringValue: number;
          }>('/Fertilizer/inventory-valuation', params);
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  // Utility methods remain the same
  formatType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Organico': 'Orgánico',
      'Inorganico': 'Inorgánico',
      'Liquido': 'Líquido',
      'Solido': 'Sólido',
      'Foliar': 'Foliar'
    };
    return typeMap[type] || type;
  }

  formatApplicationMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'Riego': 'Riego por Goteo',
      'Foliar': 'Aplicación Foliar',
      'Suelo': 'Aplicación al Suelo',
      'Fertirrigacion': 'Fertirrigación'
    };
    return methodMap[method] || method;
  }

  calculateNPKCategory(fertilizer: Fertilizer): string {
    const n = fertilizer.nitrogenPercentage || 0;
    const p = fertilizer.phosphorusPercentage || 0;
    const k = fertilizer.potassiumPercentage || 0;

    if (n === 0 && p === 0 && k === 0) {
      return 'Micronutrientes';
    }

    const max = Math.max(n, p, k);
    const diff = 5; // tolerance

    if (Math.abs(n - p) <= diff && Math.abs(p - k) <= diff && Math.abs(n - k) <= diff) {
      return 'Balanceado';
    }

    if (max === n) {
      return 'Alto N';
    } else if (max === p) {
      return 'Alto P';
    } else if (max === k) {
      return 'Alto K';
    }

    return 'Otro';
  }

  isLowStock(fertilizer: Fertilizer): boolean {
    if (!fertilizer.minimumStock || fertilizer.currentStock === undefined) {
      return false;
    }
    return fertilizer.currentStock <= fertilizer.minimumStock;
  }

  isExpiringSoon(fertilizer: Fertilizer, withinDays: number = 30): boolean {
    if (!fertilizer.expirationDate) {
      return false;
    }

    const expirationDate = new Date(fertilizer.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilExpiration <= withinDays && daysUntilExpiration >= 0;
  }

  calculateStockValue(fertilizer: Fertilizer): number {
    if (!fertilizer.currentStock || !fertilizer.pricePerUnit) {
      return 0;
    }
    return fertilizer.currentStock * fertilizer.pricePerUnit;
  }

  getStockStatus(fertilizer: Fertilizer): 'low' | 'normal' | 'high' {
    if (!fertilizer.minimumStock || fertilizer.currentStock === undefined) {
      return 'normal';
    }

    if (fertilizer.currentStock <= fertilizer.minimumStock) {
      return 'low';
    } else if (fertilizer.currentStock <= fertilizer.minimumStock * 1.2) {
      return 'normal';
    } else {
      return 'high';
    }
  }

  formatNPK(fertilizer: Fertilizer): string {
    const n = fertilizer.nitrogenPercentage || 0;
    const p = fertilizer.phosphorusPercentage || 0;
    const k = fertilizer.potassiumPercentage || 0;

    if (n === 0 && p === 0 && k === 0) {
      return 'N/A';
    }

    return `${n}-${p}-${k}`;
  }

  getDaysUntilExpiration(fertilizer: Fertilizer): number | null {
    if (!fertilizer.expirationDate) {
      return null;
    }

    const expirationDate = new Date(fertilizer.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilExpiration;
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
    console.error('Fertilizer Service Error:', error);
    throw error;
  }

  /**
   * Data transformation methods
   */
  groupByType(fertilizers: Fertilizer[]): { [type: string]: Fertilizer[] } {
    return fertilizers.reduce((groups, fertilizer) => {
      const type = fertilizer.type || 'Otros';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(fertilizer);
      return groups;
    }, {} as { [type: string]: Fertilizer[] });
  }

  groupBySupplier(fertilizers: Fertilizer[]): { [supplier: string]: Fertilizer[] } {
    return fertilizers.reduce((groups, fertilizer) => {
      const supplier = fertilizer.supplier || 'Sin proveedor';
      if (!groups[supplier]) {
        groups[supplier] = [];
      }
      groups[supplier].push(fertilizer);
      return groups;
    }, {} as { [supplier: string]: Fertilizer[] });
  }

  sortByStockLevel(fertilizers: Fertilizer[], ascending: boolean = true): Fertilizer[] {
    return [...fertilizers].sort((a, b) => {
      const stockA = a.currentStock || 0;
      const stockB = b.currentStock || 0;
      return ascending ? stockA - stockB : stockB - stockA;
    });
  }

  sortByExpirationDate(fertilizers: Fertilizer[], ascending: boolean = true): Fertilizer[] {
    return [...fertilizers].sort((a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;

      const dateA = new Date(a.expirationDate).getTime();
      const dateB = new Date(b.expirationDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  filterByNPKCategory(fertilizers: Fertilizer[], category: string): Fertilizer[] {
    return fertilizers.filter(fertilizer => this.calculateNPKCategory(fertilizer) === category);
  }


  /**
   * Get fertilizer chemistry data for all fertilizers
   */
  getFertilizerChemistries(): Observable<FertilizerChemistry[]> {
    return this.apiService.get<FertilizerChemistry[]>('/FertilizerChemistry').pipe(
      map(response => {

        return Array.isArray(response) ? response : [];
      }),
      catchError(error => {
        console.error('FertilizerService.getFertilizerChemistries error:', error);
        return of([]);
      })
    );
  }

  /**
   * Get fertilizer chemistry by fertilizer ID
   */
  getFertilizerChemistry(fertilizerId: number): Observable<FertilizerChemistry | null> {
    return this.apiService.get<FertilizerChemistry>(`/FertilizerChemistry/${fertilizerId}`).pipe(
      map(response => {

        return response || null;
      }),
      catchError(error => {
        console.warn('FertilizerChemistry not found for fertilizer:', fertilizerId, error);
        return of(null);
      })
    );
  }

  /**
   * Get enhanced fertilizers with chemistry data
   */
  getEnhancedFertilizers(catalogId?: number): Observable<EnhancedFertilizer[]> {
    return forkJoin({
      fertilizers: this.getAll(catalogId ? { catalogId } : undefined),
      chemistries: this.getFertilizerChemistries()
    }).pipe(
      map(({ fertilizers, chemistries }) => {
        return fertilizers.map(fertilizer => {
          const chemistry = chemistries.find(c => c.fertilizerId === fertilizer.id);
          const enhanced: EnhancedFertilizer = {
            ...fertilizer,
            chemistry,
            nutrientContent: this.calculateNutrientContent(fertilizer, chemistry)
          };
          return enhanced;
        });
      }),
      catchError(error => {
        console.error('FertilizerService.getEnhancedFertilizers error:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Calculate actual nutrient content based on fertilizer composition and chemistry
   */
  private calculateNutrientContent(fertilizer: Fertilizer, chemistry?: FertilizerChemistry): any {
    const purity = chemistry?.purity || 100; // Assume 100% if no chemistry data
    const purityFactor = purity / 100;

    type Composition = {
      nitrogen?: number;
      phosphorus?: number;
      potassium?: number;
      calcium?: number;
      magnesium?: number;
      sulfur?: number;
      iron?: number;
    };
    let composition: Composition = {};
    if (Array.isArray(fertilizer.composition) && fertilizer.composition.length > 0) {
      composition = fertilizer.composition[0];
    } else if (typeof fertilizer.composition === 'object' && fertilizer.composition !== null) {
      composition = fertilizer.composition as Composition;
    }
    return {
      nitrogenPpm: (composition.nitrogen || 0) * purityFactor * 10, // Convert % to ppm base
      phosphorusPpm: (composition.phosphorus || 0) * purityFactor * 10,
      potassiumPpm: (composition.potassium || 0) * purityFactor * 10,
      calciumPpm: (composition.calcium || 0) * purityFactor * 10,
      magnesiumPpm: (composition.magnesium || 0) * purityFactor * 10,
      sulfurPpm: (composition.sulfur || 0) * purityFactor * 10,
      ironPpm: (composition.iron || 0) * purityFactor * 10
    };
  }

  /**
   * Find optimal fertilizer combinations for nutrient targets
   */
  findOptimalFertilizerMix(
    targets: NutrientTarget,
    volumeLiters: number,
    availableFertilizers: EnhancedFertilizer[],
    constraints?: {
      maxBudget?: number;
      maxFertilizers?: number;
      preferOrganic?: boolean;
      excludeFertilizers?: number[];
    }
  ): FertilizerRecommendation[] {
    const maxFertilizers = constraints?.maxFertilizers || 4;
    const excludeIds = new Set(constraints?.excludeFertilizers || []);

    // Filter available fertilizers
    let candidates = availableFertilizers.filter(f =>
      f.isActive &&
      !excludeIds.has(f.id) &&
      (constraints?.preferOrganic ? f.isOrganic : true)
    );

    // Sort by nutrient efficiency and cost
    candidates = candidates.sort((a, b) => {
      const aScore = this.calculateFertilizerScore(a, targets);
      const bScore = this.calculateFertilizerScore(b, targets);
      return bScore - aScore;
    });

    const recommendations: FertilizerRecommendation[] = [];
    const remainingTargets = { ...targets };
    let totalCost = 0;

    // Greedy algorithm to select fertilizers
    for (let i = 0; i < Math.min(candidates.length, maxFertilizers); i++) {
      const fertilizer = candidates[i];

      // Calculate optimal concentration for this fertilizer
      const concentration = this.calculateOptimalConcentration(
        fertilizer,
        remainingTargets,
        volumeLiters
      );

      if (concentration > 0) {
        const contributedNutrients = this.calculateContributedNutrients(
          fertilizer,
          concentration,
          volumeLiters
        );

        const cost = concentration * volumeLiters * (fertilizer.costPerUnit || 0) / 1000; // Convert to kg

        if (!constraints?.maxBudget || totalCost + cost <= constraints.maxBudget) {
          recommendations.push({
            fertilizer,
            concentration,
            contributedNutrients,
            cost,
            priority: 10 - i // Higher priority for earlier selections
          });

          // Update remaining targets
          remainingTargets.nitrogen = Math.max(0, remainingTargets.nitrogen - contributedNutrients.nitrogen);
          remainingTargets.phosphorus = Math.max(0, remainingTargets.phosphorus - contributedNutrients.phosphorus);
          remainingTargets.potassium = Math.max(0, remainingTargets.potassium - contributedNutrients.potassium);

          totalCost += cost;

          // Stop if targets are mostly met
          if (this.areTargetsMet(remainingTargets, targets, 0.9)) {
            break;
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Calculate fertilizer score based on nutrient efficiency and cost
   */
  private calculateFertilizerScore(fertilizer: EnhancedFertilizer, targets: NutrientTarget): number {
    const content = fertilizer.nutrientContent || {
      nitrogenPpm: 0, phosphorusPpm: 0, potassiumPpm: 0
    };

    // Calculate nutrient value score
    const nValue = Math.min(content.nitrogenPpm / targets.nitrogen, 1) * 0.4;
    const pValue = Math.min(content.phosphorusPpm / targets.phosphorus, 1) * 0.3;
    const kValue = Math.min(content.potassiumPpm / targets.potassium, 1) * 0.3;

    const nutrientScore = nValue + pValue + kValue;

    // Calculate cost efficiency (lower cost = higher score)
    const costScore = fertilizer.costPerUnit ? Math.min(10 / fertilizer.costPerUnit, 1) : 0.5;

    // Organic bonus
    const organicBonus = fertilizer.isOrganic ? 0.1 : 0;

    return nutrientScore * 0.7 + costScore * 0.3 + organicBonus;
  }

  /**
   * Calculate optimal concentration for a fertilizer
   */
  private calculateOptimalConcentration(
    fertilizer: EnhancedFertilizer,
    targets: NutrientTarget,
    volumeLiters: number
  ): number {
    const content = fertilizer.nutrientContent;
    if (!content) return 0;

    // Find limiting nutrient (the one that requires highest concentration)
    const concentrations = [];

    if (targets.nitrogen > 0 && content.nitrogenPpm > 0) {
      concentrations.push((targets.nitrogen * volumeLiters) / content.nitrogenPpm);
    }

    if (targets.phosphorus > 0 && content.phosphorusPpm > 0) {
      concentrations.push((targets.phosphorus * volumeLiters) / content.phosphorusPpm);
    }

    if (targets.potassium > 0 && content.potassiumPpm > 0) {
      concentrations.push((targets.potassium * volumeLiters) / content.potassiumPpm);
    }

    if (concentrations.length === 0) return 0;

    // Use the minimum concentration that provides some benefit
    const minConcentration = Math.min(...concentrations);

    // Apply solubility constraints if chemistry data available
    const maxSolubility = fertilizer.chemistry?.solubility20 || 1000; // g/L at 20°C

    return Math.min(minConcentration, maxSolubility) * 0.8; // 80% of max for safety
  }

  /**
   * Calculate nutrients contributed by a fertilizer at given concentration
   */
  private calculateContributedNutrients(
    fertilizer: EnhancedFertilizer,
    concentration: number,
    volumeLiters: number
  ): any {
    const content = fertilizer.nutrientContent;
    if (!content) return { nitrogen: 0, phosphorus: 0, potassium: 0 };

    const factor = concentration / volumeLiters / 1000; // Convert to proper scale

    return {
      nitrogen: content.nitrogenPpm * factor,
      phosphorus: content.phosphorusPpm * factor,
      potassium: content.potassiumPpm * factor,
      calcium: (content.calciumPpm || 0) * factor,
      magnesium: (content.magnesiumPpm || 0) * factor,
      sulfur: (content.sulfurPpm || 0) * factor
    };
  }

  /**
   * Check if nutrient targets are sufficiently met
   */
  private areTargetsMet(remaining: NutrientTarget, original: NutrientTarget, threshold: number): boolean {
    const nMet = (original.nitrogen - remaining.nitrogen) / original.nitrogen >= threshold;
    const pMet = (original.phosphorus - remaining.phosphorus) / original.phosphorus >= threshold;
    const kMet = (original.potassium - remaining.potassium) / original.potassium >= threshold;

    return nMet && pMet && kMet;
  }

  /**
   * Get fertilizers suitable for pH adjustment
   */
  getPhAdjusters(): Observable<EnhancedFertilizer[]> {
    return this.getEnhancedFertilizers().pipe(
      map(fertilizers => fertilizers.filter(f =>
        f.chemistry?.isPhAdjuster ||
        (typeof f.name === 'string' && (
          f.name.toLowerCase().includes('ácido') ||
          f.name.toLowerCase().includes('acid') ||
          f.name.toLowerCase().includes('cal') ||
          f.name.toLowerCase().includes('lime')
        ))
      ))
    );
  }

  /**
   * Estimate pH effect of fertilizer mix
   */
  estimatePhEffect(recommendations: FertilizerRecommendation[], baseWaterPh: number): number {
    let phAdjustment = 0;

    recommendations.forEach(rec => {
      const chemistry = rec.fertilizer.chemistry;
      if (chemistry) {
        // Simplified pH calculation based on fertilizer chemistry
        if (chemistry.isPhAdjuster) {
          const acidic = chemistry.valence < 0;
          const strength = Math.abs(chemistry.valence) * rec.concentration / 1000;
          phAdjustment += acidic ? -strength : strength;
        }
      }
    });

    return Math.max(5.5, Math.min(8.0, baseWaterPh + phAdjustment));
  }

  /**
   * Calculate total EC contribution from fertilizer mix
   */
  calculateTotalEc(recommendations: FertilizerRecommendation[], baseWaterEc: number): number {
    let totalEc = baseWaterEc;

    recommendations.forEach(rec => {
      // Simplified EC calculation: higher concentration = higher EC
      const ecContribution = rec.concentration * 0.001; // Rough conversion factor
      totalEc += ecContribution;
    });

    return Math.round(totalEc * 100) / 100; // Round to 2 decimals
  }

  /**
     * Get crop phase solution requirement data
   */
  private getCropPhaseSolutionRequirement(phaseId: number): Observable<any> {

    const params = new HttpParams().set('PhaseId', phaseId.toString());
    const url = `${this.apiConfig.agronomicApiUrl}/CropPhaseSolutionRequirement/GetByPhaseId`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<any>>(url, { params, headers }).pipe(
      map(response => {
        if (response) {

          return response.result;
        }
        throw new Error(`Get crop phase solution requirement failed: ${response}`);
      }),
      catchError(error => {
        console.error('CropService.getCropPhaseSolutionRequirement error:', error);
        return of(null);
      })
    );
  }
  /**
   * Enhanced method that combines CropPhaseSolutionRequirement data with fertilizer selection
   */
  getFertilizersWithOptimalComposition(
    catalogId: number | undefined,
    cropPhaseId?: number,
    filters?: FertilizerFilters
  ): Observable<Fertilizer[]> {

    return forkJoin<{
      fertilizers: Fertilizer[] | { fertilizers?: Fertilizer[]; result?: Fertilizer[]; data?: Fertilizer[] } | any;
      solutionRequirements: any;
    }>({
      fertilizers: this.getFertilizersWithCatalogId(catalogId, filters),
      solutionRequirements: cropPhaseId ?
        this.getCropPhaseSolutionRequirement(cropPhaseId) :
        of(null)
    }).pipe(
      map(({ fertilizers, solutionRequirements }) => {



        // Extract fertilizers array from response - this is the critical fix
        let fertilizerArray: any[] = [];

        if (Array.isArray(fertilizers)) {
          fertilizerArray = fertilizers;
        } else if (fertilizers && typeof fertilizers === 'object') {
          // Handle object responses
          if (Array.isArray((fertilizers as any).fertilizers)) {
            fertilizerArray = (fertilizers as any).fertilizers;
          } else if (Array.isArray((fertilizers as any).result)) {
            fertilizerArray = (fertilizers as any).result;
          } else if (Array.isArray((fertilizers as any).data)) {
            fertilizerArray = (fertilizers as any).data;
          } else {
            console.warn('Unexpected fertilizers response format:', fertilizers);
            fertilizerArray = [];
          }
        } else {
          console.warn('Invalid fertilizers response:', fertilizers);
          fertilizerArray = [];
        }



        if (solutionRequirements) {
          // Enhance fertilizers with optimal composition score based on crop phase requirements
          return fertilizerArray.map(fertilizer => ({
            ...fertilizer,
            optimizationScore: this.calculateOptimizationScore(fertilizer, solutionRequirements)
          })).sort((a, b) => (b.optimizationScore || 0) - (a.optimizationScore || 0));
        }

        return fertilizerArray;
      }),
      catchError(error => {
        console.error('Error in getFertilizersWithOptimalComposition:', error);
        return of([]); // Return empty array on error
      })
    );
  }



  /**
   * Calculate how well a fertilizer matches crop phase requirements
   */
  private calculateOptimizationScore(fertilizer: Fertilizer, requirements: any): number {
    if (!fertilizer.composition || fertilizer.composition.length === 0 || !requirements) {
      return 0;
    }

    const composition = fertilizer.composition[0];
    let score = 0;
    let factors = 0;

    // Score based on N-P-K match
    if (requirements.nitrogen && composition.nitrogen) {
      score += Math.min(composition.nitrogen / requirements.nitrogen, 1) * 0.4;
      factors++;
    }

    if (requirements.phosphorus && composition.phosphorus) {
      score += Math.min(composition.phosphorus / requirements.phosphorus, 1) * 0.3;
      factors++;
    }

    if (requirements.potassium && composition.potassium) {
      score += Math.min(composition.potassium / requirements.potassium, 1) * 0.3;
      factors++;
    }

    return factors > 0 ? (score / factors) * 100 : 0;
  }
}