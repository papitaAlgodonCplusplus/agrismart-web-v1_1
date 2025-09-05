// src/app/features/fertilizers/services/fertilizer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { CatalogService } from '../../catalogs/services/catalog.service';
import { Fertilizer } from '../../../core/models/models';

export interface FertilizerFilters {
  catalogId?: number;
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

export interface FertilizerUpdateRequest extends Partial<FertilizerCreateRequest> {}

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
    if (filters?.catalogId) {
      return this.getFertilizersWithCatalogId(filters.catalogId, filters);
    }

    // If no catalogId provided, get from current user's catalog
    return this.catalogService.getCurrentUserCatalog().pipe(
      switchMap(catalogs => {
        if (catalogs && catalogs.length > 0) {
          const catalogId = catalogs[0].id; // Use first catalog
          return this.getFertilizersWithCatalogId(catalogId, filters);
        }
        throw new Error('No catalog found for current user');
      })
    );
  }

  /**
   * Get fertilizers with specific catalogId
   */
  getFertilizersWithCatalogId(catalogId: number | undefined, filters?: FertilizerFilters): Observable<Fertilizer[]> {
    let params = new HttpParams().set('catalogId', catalogId?.toString() || '');

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

    return this.apiService.get<Fertilizer[]>('/Fertilizer', params);
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
    return this.catalogService.getCurrentUserCatalog().pipe(
      switchMap(catalogs => {
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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
      return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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
      return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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

    return this.catalogService.getCurrentUserCatalog().pipe(
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
}