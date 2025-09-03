// src/app/features/fertilizer-inputs/services/fertilizer-input.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { FertilizerInput } from '../../../core/models/models';

export interface FertilizerInputFilters {
  dateFrom?: string;
  dateTo?: string;
  cropProductionId?: number | null;
  fertilizerId?: number | null;
  status?: string;
  appliedById?: number | null;
  verifiedById?: number | null;
  applicationMethod?: string;
}

export interface FertilizerInputCreateRequest {
  cropProductionId: number;
  fertilizerId: number;
  applicationDate: Date | string;
  quantity: number;
  quantityUnit?: string;
  concentration?: number;
  concentrationUnit?: string;
  applicationMethod: string;
  appliedById: number;
  notes?: string;
  weatherConditions?: string;
  soilConditions?: string;
  cost?: number;
}

export interface FertilizerInputUpdateRequest extends Partial<FertilizerInputCreateRequest> {
  status?: string;
  verifiedById?: number;
}

export interface FertilizerInputVerificationRequest {
  verifiedById: number;
  verificationNotes?: string;
}

export interface FertilizerInputStatistics {
  totalApplications: number;
  totalQuantity: number;
  averageQuantityPerApplication: number;
  mostUsedFertilizer: {
    id: number;
    name: string;
    applications: number;
    totalQuantity: number;
  };
  applicationsByStatus: {
    planned: number;
    applied: number;
    verified: number;
    cancelled: number;
  };
  applicationsByMethod: {
    [method: string]: number;
  };
  monthlyApplications: {
    month: string;
    applications: number;
    quantity: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class FertilizerInputService {
  private readonly baseUrl = '/api/fertilizer-inputs';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all fertilizer inputs with optional filters
   */
  getAll(filters?: FertilizerInputFilters): Observable<FertilizerInput[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.dateFrom) {
        params = params.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params = params.set('dateTo', filters.dateTo);
      }
      if (filters.cropProductionId) {
        params = params.set('cropProductionId', filters.cropProductionId.toString());
      }
      if (filters.fertilizerId) {
        params = params.set('fertilizerId', filters.fertilizerId.toString());
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.appliedById) {
        params = params.set('appliedById', filters.appliedById.toString());
      }
      if (filters.verifiedById) {
        params = params.set('verifiedById', filters.verifiedById.toString());
      }
      if (filters.applicationMethod) {
        params = params.set('applicationMethod', filters.applicationMethod);
      }
    }

    return this.apiService.get<FertilizerInput[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizer input by ID
   */
  getById(id: number): Observable<FertilizerInput> {
    return this.apiService.get<FertilizerInput>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new fertilizer input
   */
  create(data: FertilizerInputCreateRequest): Observable<FertilizerInput> {
    const payload = {
      ...data,
      applicationDate: typeof data.applicationDate === 'string' 
        ? data.applicationDate 
        : data.applicationDate.toISOString(),
      status: 'planned' // Default status
    };

    return this.apiService.post<FertilizerInput>(this.baseUrl, payload);
  }

  /**
   * Update fertilizer input
   */
  update(id: number, data: FertilizerInputUpdateRequest): Observable<FertilizerInput> {
    const payload = {
      ...data,
      ...(data.applicationDate && {
        applicationDate: typeof data.applicationDate === 'string' 
          ? data.applicationDate 
          : data.applicationDate.toISOString()
      })
    };

    return this.apiService.put<FertilizerInput>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Delete fertilizer input
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Verify fertilizer input application
   */
  verify(id: number, data?: FertilizerInputVerificationRequest): Observable<FertilizerInput> {
    const payload = {
      status: 'verified',
      ...data
    };

    return this.apiService.put<FertilizerInput>(`${this.baseUrl}/${id}/verify`, payload);
  }

  /**
   * Mark fertilizer input as applied
   */
  markAsApplied(id: number, appliedById: number, notes?: string): Observable<FertilizerInput> {
    const payload = {
      status: 'applied',
      appliedById,
      appliedDate: new Date().toISOString(),
      ...(notes && { notes })
    };

    return this.apiService.put<FertilizerInput>(`${this.baseUrl}/${id}/apply`, payload);
  }

  /**
   * Cancel fertilizer input
   */
  cancel(id: number, reason?: string): Observable<FertilizerInput> {
    const payload = {
      status: 'cancelled',
      ...(reason && { cancellationReason: reason })
    };

    return this.apiService.put<FertilizerInput>(`${this.baseUrl}/${id}/cancel`, payload);
  }

  /**
   * Duplicate fertilizer input (create copy with new date)
   */
  duplicate(id: number, newApplicationDate: Date | string): Observable<FertilizerInput> {
    const payload = {
      applicationDate: typeof newApplicationDate === 'string' 
        ? newApplicationDate 
        : newApplicationDate.toISOString()
    };

    return this.apiService.post<FertilizerInput>(`${this.baseUrl}/${id}/duplicate`, payload);
  }

  /**
   * Get fertilizer inputs by crop production
   */
  getByCropProduction(cropProductionId: number): Observable<FertilizerInput[]> {
    const params = new HttpParams().set('cropProductionId', cropProductionId.toString());
    return this.apiService.get<FertilizerInput[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizer inputs by fertilizer
   */
  getByFertilizer(fertilizerId: number, dateFrom?: string, dateTo?: string): Observable<FertilizerInput[]> {
    let params = new HttpParams().set('fertilizerId', fertilizerId.toString());
    
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.apiService.get<FertilizerInput[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizer inputs by user (applied by)
   */
  getByUser(userId: number, dateFrom?: string, dateTo?: string): Observable<FertilizerInput[]> {
    let params = new HttpParams().set('appliedById', userId.toString());
    
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.apiService.get<FertilizerInput[]>(this.baseUrl, params);
  }

  /**
   * Get pending verifications
   */
  getPendingVerifications(): Observable<FertilizerInput[]> {
    const params = new HttpParams().set('status', 'applied');
    return this.apiService.get<FertilizerInput[]>(this.baseUrl, params);
  }

  /**
   * Get fertilizer input statistics
   */
  getStatistics(filters?: FertilizerInputFilters): Observable<FertilizerInputStatistics> {
    let params = new HttpParams();

    if (filters) {
      if (filters.dateFrom) {
        params = params.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params = params.set('dateTo', filters.dateTo);
      }
      if (filters.cropProductionId) {
        params = params.set('cropProductionId', filters.cropProductionId.toString());
      }
      if (filters.fertilizerId) {
        params = params.set('fertilizerId', filters.fertilizerId.toString());
      }
    }

    return this.apiService.get<FertilizerInputStatistics>(`${this.baseUrl}/statistics`, params);
  }

  /**
   * Export fertilizer inputs to Excel
   */
  exportToExcel(filters?: FertilizerInputFilters): Observable<Blob> {
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
   * Get fertilizer consumption report
   */
  getFertilizerConsumptionReport(
    cropProductionId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Observable<any> {
    let params = new HttpParams();

    if (cropProductionId) {
      params = params.set('cropProductionId', cropProductionId.toString());
    }
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.apiService.get<any>(`${this.baseUrl}/reports/consumption`, params);
  }

  /**
   * Get application schedule for next days
   */
  getUpcomingApplications(days: number = 7): Observable<FertilizerInput[]> {
    const params = new HttpParams()
      .set('status', 'planned')
      .set('upcomingDays', days.toString());

    return this.apiService.get<FertilizerInput[]>(`${this.baseUrl}/upcoming`, params);
  }

  /**
   * Bulk update fertilizer inputs
   */
  bulkUpdate(ids: number[], data: Partial<FertilizerInputUpdateRequest>): Observable<FertilizerInput[]> {
    const payload = {
      ids,
      updateData: data
    };

    return this.apiService.put<FertilizerInput[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  /**
   * Bulk verify fertilizer inputs
   */
  bulkVerify(ids: number[], verifiedById: number): Observable<FertilizerInput[]> {
    const payload = {
      ids,
      verifiedById,
      status: 'verified'
    };

    return this.apiService.put<FertilizerInput[]>(`${this.baseUrl}/bulk-verify`, payload);
  }

  /**
   * Get fertilizer input history for a crop production
   */
  getCropProductionHistory(cropProductionId: number): Observable<FertilizerInput[]> {
    return this.apiService.get<FertilizerInput[]>(`${this.baseUrl}/crop-production/${cropProductionId}/history`);
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
    console.error('Fertilizer Input Service Error:', error);
    throw error;
  }

  /**
   * Utility methods for components
   */
  formatApplicationMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'Riego': 'Riego por Goteo',
      'Foliar': 'Aplicación Foliar',
      'Suelo': 'Aplicación al Suelo',
      'Fertirrigacion': 'Fertirrigación'
    };
    return methodMap[method] || method;
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'planned': 'Planificado',
      'applied': 'Aplicado',
      'verified': 'Verificado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusPriority(status: string): number {
    const priorityMap: { [key: string]: number } = {
      'planned': 1,
      'applied': 2,
      'verified': 3,
      'cancelled': 0
    };
    return priorityMap[status] || 0;
  }

  calculateTotalCost(inputs: FertilizerInput[]): number {
    return inputs.reduce((total, input) => total + (input.cost || 0), 0);
  }

  calculateTotalQuantity(inputs: FertilizerInput[]): number {
    return inputs.reduce((total, input) => total + (input.quantity || 0), 0);
  }

  groupByDate(inputs: FertilizerInput[]): { [date: string]: FertilizerInput[] } {
    return inputs.reduce((groups, input) => {
      const date = new Date(input.applicationDate).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(input);
      return groups;
    }, {} as { [date: string]: FertilizerInput[] });
  }

  groupByFertilizer(inputs: FertilizerInput[]): { [fertilizerId: number]: FertilizerInput[] } {
    return inputs.reduce((groups, input) => {
      const fertilizerId = input.fertilizerId;
      if (!groups[fertilizerId]) {
        groups[fertilizerId] = [];
      }
      groups[fertilizerId].push(input);
      return groups;
    }, {} as { [fertilizerId: number]: FertilizerInput[] });
  }
}