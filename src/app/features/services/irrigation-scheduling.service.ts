// src/app/features/services/irrigation-scheduling.service.ts
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface IrrigationPlan {
  id: number;
  name: string;
  dayMask: number;
  active: boolean;
  dateCreated: string;
  dateUpdated?: string;
  createdBy: number;
  updatedBy?: number;
}

export interface IrrigationMode {
  id: number;
  name: string;
  active: boolean;
  dateCreated: string;
  dateUpdated?: string;
  createdBy: number;
  updatedBy?: number;
}

export interface IrrigationPlanEntry {
  id: number;
  irrigationPlanId: number;
  irrigationPlanName: string;
  irrigationModeId: number;
  irrigationModeName: string;
  startTime: string; // TimeSpan as string "HH:mm:ss"
  duration: number; // minutes
  wStart?: number; // Week start (1-52)
  wEnd?: number; // Week end (1-52)
  frequency?: number; // days
  sequence: number;
  active: boolean;
  dateCreated: string;
  dateUpdated?: string;
  createdBy: number;
  updatedBy?: number;
}

export interface CreateIrrigationPlanCommand {
  name: string;
  dayMask: number;
  active: boolean;
  createdBy: number;
}

export interface UpdateIrrigationPlanCommand {
  id: number;
  name: string;
  dayMask: number;
  active: boolean;
  updatedBy: number;
}

export interface CreateIrrigationPlanEntryCommand {
  irrigationPlanId: number;
  irrigationModeId: number;
  startTime: string;
  duration: number;
  wStart?: number;
  wEnd?: number;
  frequency?: number;
  sequence: number;
  active: boolean;
  createdBy: number;
}

export interface UpdateIrrigationPlanEntryCommand {
  id: number;
  irrigationPlanId: number;
  irrigationModeId: number;
  startTime: string;
  duration: number;
  wStart?: number;
  wEnd?: number;
  frequency?: number;
  sequence: number;
  active: boolean;
  updatedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class IrrigationSchedulingService {

  constructor(@Inject(ApiService) private apiService: ApiService) { }

  // ==================== Irrigation Plan ====================
  
  getAllIrrigationPlans(): Observable<IrrigationPlan[]> {
    return this.apiService.get<IrrigationPlan[]>('/IrrigationPlan');
  }

  getIrrigationPlanById(id: number): Observable<IrrigationPlan> {
    return this.apiService.get<IrrigationPlan>(`/IrrigationPlan/${id}`);
  }

  createIrrigationPlan(command: CreateIrrigationPlanCommand): Observable<any> {
    return this.apiService.post('/IrrigationPlan', command);
  }

  updateIrrigationPlan(command: UpdateIrrigationPlanCommand): Observable<any> {
    return this.apiService.put('/IrrigationPlan', command);
  }

  deleteIrrigationPlan(id: number): Observable<any> {
    return this.apiService.delete(`/IrrigationPlan/${id}`);
  }

  // ==================== Irrigation Mode ====================
  
  getAllIrrigationModes(): Observable<IrrigationMode[]> {
    return this.apiService.get<IrrigationMode[]>('/IrrigationMode');
  }

  getIrrigationModeById(id: number): Observable<IrrigationMode> {
    return this.apiService.get<IrrigationMode>(`/IrrigationMode/${id}`);
  }

  getPlannedMode(): Observable<IrrigationMode | undefined> {
    return new Observable(observer => {
      this.getAllIrrigationModes().subscribe({
        next: (modes) => {
          const planned = modes.find(m => m.name === 'Planned');
          observer.next(planned);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getOnDemandMode(): Observable<IrrigationMode | undefined> {
    return new Observable(observer => {
      this.getAllIrrigationModes().subscribe({
        next: (modes) => {
          const onDemand = modes.find(m => m.name === 'OnDemand');
          observer.next(onDemand);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // ==================== Irrigation Plan Entry ====================
  
  getAllIrrigationPlanEntries(irrigationPlanId?: number, irrigationModeId?: number): Observable<IrrigationPlanEntry[]> {
    let url = '/IrrigationPlanEntry';
    const params: string[] = [];
    
    if (irrigationPlanId) {
      params.push(`irrigationPlanId=${irrigationPlanId}`);
    }
    if (irrigationModeId) {
      params.push(`irrigationModeId=${irrigationModeId}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.apiService.get<IrrigationPlanEntry[]>(url);
  }

  getIrrigationPlanEntryById(id: number): Observable<IrrigationPlanEntry> {
    return this.apiService.get<IrrigationPlanEntry>(`/IrrigationPlanEntry/${id}`);
  }

  createIrrigationPlanEntry(command: CreateIrrigationPlanEntryCommand): Observable<any> {
    return this.apiService.post('/IrrigationPlanEntry', command);
  }

  updateIrrigationPlanEntry(command: UpdateIrrigationPlanEntryCommand): Observable<any> {
    return this.apiService.put('/IrrigationPlanEntry', command);
  }

  deleteIrrigationPlanEntry(id: number): Observable<any> {
    return this.apiService.delete(`/IrrigationPlanEntry/${id}`);
  }

  // ==================== Helper Methods ====================

  /**
   * Convert day mask to array of day names
   */
  dayMaskToDays(dayMask: number): string[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const result: string[] = [];
    
    for (let i = 0; i < 7; i++) {
      if (dayMask & (1 << i)) {
        result.push(days[i]);
      }
    }
    
    return result;
  }

  /**
   * Convert array of day names to day mask
   */
  daysToDayMask(days: string[]): number {
    const dayMap: { [key: string]: number } = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 4,
      'Thursday': 8,
      'Friday': 16,
      'Saturday': 32,
      'Sunday': 64
    };
    
    return days.reduce((mask, day) => mask | (dayMap[day] || 0), 0);
  }

  /**
   * Format TimeSpan string for display
   */
  formatTime(timeSpan: string): string {
    const parts = timeSpan.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    return timeSpan;
  }

  /**
   * Convert time to TimeSpan string
   */
  toTimeSpan(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }
}