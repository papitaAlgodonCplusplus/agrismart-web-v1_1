// src/app/features/fertilizers/services/fertilizer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Fertilizer } from '../../../core/models/models';

export interface FertilizerFilters {
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
  name: string;
  brand?: string;
  description?: string;
  type: string;
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
  private readonly baseUrl = '/api/fertilizers';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all fertilizers with optional filters
   */
  getAll(filters?: FertilizerFilters): Observable<Fertilizer[]> {
    let params = new HttpParams();

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

    return this.apiService.get<Fertilizer[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizer by ID
   */
  getById(id: number): Observable<Fertilizer> {
    return this.apiService.get<Fertilizer>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new fertilizer
   */
  create(data: FertilizerCreateRequest): Observable<Fertilizer> {
    const payload = {
      ...data,
      ...(data.expirationDate && {
        expirationDate: typeof data.expirationDate === 'string' 
          ? data.expirationDate 
          : data.expirationDate.toISOString()
      }),
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<Fertilizer>(this.baseUrl, payload);
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

    return this.apiService.put<Fertilizer>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Delete fertilizer
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activate/deactivate fertilizer
   */
  toggleStatus(id: number, isActive: boolean): Observable<Fertilizer> {
    const payload = { isActive };
    return this.apiService.put<Fertilizer>(`${this.baseUrl}/${id}/status`, payload);
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

    return this.apiService.post<Fertilizer>(`${this.baseUrl}/${id}/stock-adjustment`, payload);
  }

  /**
   * Get stock movements for a fertilizer
   */
  getStockMovements(id: number, limit?: number): Observable<StockMovement[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.apiService.get<StockMovement[]>(`${this.baseUrl}/${id}/stock-movements`, params);
  }

  /**
   * Get low stock fertilizers
   */
  getLowStock(): Observable<Fertilizer[]> {
    const params = new HttpParams().set('lowStock', 'true');
    return this.apiService.get<Fertilizer[]>(this.baseUrl, params);
  }

  /**
   * Get expiring fertilizers
   */
  getExpiring(withinDays: number = 30): Observable<Fertilizer[]> {
    const params = new HttpParams().set('expiringWithin', withinDays.toString());
    return this.apiService.get<Fertilizer[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizers by type
   */
  getByType(type: string): Observable<Fertilizer[]> {
    const params = new HttpParams().set('type', type);
    return this.apiService.get<Fertilizer[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizers by supplier
   */
  getBySupplier(supplier: string): Observable<Fertilizer[]> {
    const params = new HttpParams().set('supplier', supplier);
    return this.apiService.get<Fertilizer[]>(this.baseUrl, params);
  }

  /**
   * Search fertilizers by name or brand
   */
  search(searchTerm: string): Observable<Fertilizer[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.apiService.get<Fertilizer[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizer statistics
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

    return this.apiService.get<FertilizerStatistics>(`${this.baseUrl}/statistics`, params);
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

    return this.apiService.get<FertilizerUsageReport>(`${this.baseUrl}/${id}/usage-report`, params);
  }

  /**
   * Get all suppliers
   */
  getSuppliers(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/suppliers`);
  }

  /**
   * Get fertilizer types
   */
  getTypes(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/types`);
  }

  /**
   * Get application methods
   */
  getApplicationMethods(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/application-methods`);
  }

  /**
   * Bulk update fertilizers
   */
  bulkUpdate(ids: number[], data: Partial<FertilizerUpdateRequest>): Observable<Fertilizer[]> {
    const payload = {
      ids,
      updateData: data
    };

    return this.apiService.put<Fertilizer[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  /**
   * Bulk stock adjustment
   */
  bulkStockAdjustment(
    adjustments: { id: number; adjustment: StockAdjustmentRequest }[]
  ): Observable<Fertilizer[]> {
    const payload = { adjustments };
    return this.apiService.post<Fertilizer[]>(`${this.baseUrl}/bulk-stock-adjustment`, payload);
  }

  /**
   * Export fertilizers to Excel
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
   * Generate stock reorder report
   */
  getReorderReport(): Observable<Fertilizer[]> {
    return this.apiService.get<Fertilizer[]>(`${this.baseUrl}/reorder-report`);
  }

  /**
   * Get inventory valuation
   */
  getInventoryValuation(): Observable<{
    totalValue: number;
    byType: { [type: string]: number };
    bySupplier: { [supplier: string]: number };
    lowStockValue: number;
    expiringValue: number;
  }> {
    return this.apiService.get(`${this.baseUrl}/inventory-valuation`);
  }

  /**
   * Utility methods for components
   */
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