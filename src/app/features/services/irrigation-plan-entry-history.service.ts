// src/app/features/services/irrigation-plan-entry-history.service.ts
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface IrrigationPlanEntryHistory {
  id: number;
  irrigationPlanEntryId: number;
  irrigationPlanId: number;
  irrigationModeId: number;
  executionStartTime: Date | string;
  executionEndTime?: Date | string;
  plannedDuration: number;
  actualDuration?: number;
  executionStatus: 'Scheduled' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';
  sequence?: number;
  notes?: string;
  errorMessage?: string;
  isManualExecution: boolean;
  waterVolumeDelivered?: number;
  flowRate?: number;
  pressure?: number;
  temperature?: number;
  deviceId?: string;
  dateCreated: Date | string;
  dateUpdated?: Date | string;
  createdBy: number;
  updatedBy?: number;
  
  // Navigation properties
  irrigationPlanEntry?: any;
  irrigationPlan?: any;
  irrigationMode?: any;
  creator?: any;
}

export interface CreateIrrigationPlanEntryHistoryCommand {
  irrigationPlanEntryId: number;
  irrigationPlanId: number;
  irrigationModeId: number;
  executionStartTime: Date | string;
  executionEndTime?: Date | string;
  plannedDuration: number;
  actualDuration?: number;
  executionStatus: string;
  sequence?: number;
  notes?: string;
  errorMessage?: string;
  isManualExecution: boolean;
  waterVolumeDelivered?: number;
  flowRate?: number;
  pressure?: number;
  temperature?: number;
  deviceId?: string;
  createdBy: number;
}

export interface UpdateIrrigationPlanEntryHistoryCommand {
  id: number;
  irrigationPlanEntryId: number;
  irrigationPlanId: number;
  irrigationModeId: number;
  executionStartTime: Date | string;
  executionEndTime?: Date | string;
  plannedDuration: number;
  actualDuration?: number;
  executionStatus: string;
  sequence?: number;
  notes?: string;
  errorMessage?: string;
  isManualExecution: boolean;
  waterVolumeDelivered?: number;
  flowRate?: number;
  pressure?: number;
  temperature?: number;
  deviceId?: string;
  updatedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class IrrigationPlanEntryHistoryService {

  constructor(@Inject(ApiService) private apiService: ApiService) { }

  // Get all irrigation plan entry histories
  getAll(): Observable<IrrigationPlanEntryHistory[]> {
    return this.apiService.get<IrrigationPlanEntryHistory[]>('/api/IrrigationPlanEntryHistory');
  }

  // Get irrigation plan entry history by ID
  getById(id: number): Observable<IrrigationPlanEntryHistory> {
    return this.apiService.get<IrrigationPlanEntryHistory>(`/api/IrrigationPlanEntryHistory/${id}`);
  }

  // Get irrigation plan entry histories by irrigation plan ID
  getByPlanId(irrigationPlanId: number): Observable<IrrigationPlanEntryHistory[]> {
    return this.apiService.get<IrrigationPlanEntryHistory[]>(`/api/IrrigationPlanEntryHistory/by-plan/${irrigationPlanId}`);
  }

  // Get irrigation plan entry histories by irrigation mode ID
  getByModeId(irrigationModeId: number): Observable<IrrigationPlanEntryHistory[]> {
    return this.apiService.get<IrrigationPlanEntryHistory[]>(`/api/IrrigationPlanEntryHistory/by-mode/${irrigationModeId}`);
  }

  // Get irrigation plan entry histories by irrigation plan entry ID
  getByEntryId(irrigationPlanEntryId: number): Observable<IrrigationPlanEntryHistory[]> {
    return this.apiService.get<IrrigationPlanEntryHistory[]>(`/api/IrrigationPlanEntryHistory/by-entry/${irrigationPlanEntryId}`);
  }

  // Get irrigation plan entry histories by date range
  getByDateRange(startDate: Date, endDate: Date): Observable<IrrigationPlanEntryHistory[]> {
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    return this.apiService.get<IrrigationPlanEntryHistory[]>(`/api/IrrigationPlanEntryHistory/by-date-range?startDate=${startDateStr}&endDate=${endDateStr}`);
  }

  // Get irrigation plan entry histories by execution status
  getByStatus(executionStatus: string): Observable<IrrigationPlanEntryHistory[]> {
    return this.apiService.get<IrrigationPlanEntryHistory[]>(`/api/IrrigationPlanEntryHistory/by-status/${executionStatus}`);
  }

  // Get active irrigation executions (InProgress or Scheduled)
  getActive(): Observable<IrrigationPlanEntryHistory[]> {
    return this.apiService.get<IrrigationPlanEntryHistory[]>('/api/IrrigationPlanEntryHistory/active');
  }

  // Get today's irrigation executions
  getToday(): Observable<IrrigationPlanEntryHistory[]> {
    return this.apiService.get<IrrigationPlanEntryHistory[]>('/api/IrrigationPlanEntryHistory/today');
  }

  // Create a new irrigation plan entry history
  create(command: CreateIrrigationPlanEntryHistoryCommand): Observable<any> {
    return this.apiService.post('/api/IrrigationPlanEntryHistory', command);
  }

  // Update an existing irrigation plan entry history
  update(command: UpdateIrrigationPlanEntryHistoryCommand): Observable<any> {
    return this.apiService.put('/api/IrrigationPlanEntryHistory', command);
  }

  // Delete an irrigation plan entry history
  delete(id: number): Observable<any> {
    return this.apiService.delete(`/api/IrrigationPlanEntryHistory/${id}`);
  }

  // Complete an irrigation execution
  completeExecution(id: number, actualDuration?: number, waterVolumeDelivered?: number): Observable<any> {
    const history = {
      id: id,
      executionEndTime: new Date(),
      executionStatus: 'Completed',
      actualDuration: actualDuration,
      waterVolumeDelivered: waterVolumeDelivered
    };

    return this.apiService.put(`/api/IrrigationPlanEntryHistory/${id}/complete`, history);
  }

  // Fail an irrigation execution
  failExecution(id: number, errorMessage: string): Observable<any> {
    const history = {
      id: id,
      executionEndTime: new Date(),
      executionStatus: 'Failed',
      errorMessage: errorMessage
    };

    return this.apiService.put(`/api/IrrigationPlanEntryHistory/${id}/fail`, history);
  }

  // Cancel an irrigation execution
  cancelExecution(id: number, notes?: string): Observable<any> {
    const history = {
      id: id,
      executionEndTime: new Date(),
      executionStatus: 'Cancelled',
      notes: notes
    };

    return this.apiService.put(`/api/IrrigationPlanEntryHistory/${id}/cancel`, history);
  }
}