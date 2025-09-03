// src/app/features/irrigation/services/irrigation-sector.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';
import { IrrigationSector } from '../../core/models/models';

export interface IrrigationSectorFilters {
  onlyActive?: boolean;
  irrigationStatus?: string;
  cropProductionId?: number | null;
  searchTerm?: string;
  hasErrors?: boolean;
  isIrrigating?: boolean;
  farmId?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  waterFlowMin?: number;
  waterFlowMax?: number;
  scheduleEnabled?: boolean;
}

export interface IrrigationSectorCreateRequest {
  name: string;
  description?: string;
  cropProductionId: number;
  irrigationSettings?: {
    waterFlowRate: number;
    duration: number;
    intervalHours: number;
    optimalTemperature?: number;
    optimalHumidity?: number;
  };
  scheduleSettings?: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: string[];
    waterAmount?: number;
  };
  sensorSettings?: {
    temperatureSensorId?: number;
    humiditySensorId?: number;
    flowSensorId?: number;
    pressureSensorId?: number;
  };
  alertSettings?: {
    lowWaterPressure?: boolean;
    highTemperature?: number;
    lowHumidity?: number;
    systemFailure?: boolean;
  };
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive?: boolean;
}

export interface IrrigationSectorUpdateRequest extends Partial<IrrigationSectorCreateRequest> {
  irrigationStatus?: string;
  hasError?: boolean;
  errorMessage?: string;
}

export interface IrrigationScheduleRequest {
  startDate: Date | string;
  endDate?: Date | string;
  startTime: string;
  duration: number; // minutes
  waterAmount?: number; // liters
  repeatInterval?: number; // hours
  daysOfWeek?: string[];
  notes?: string;
}

export interface IrrigationControlRequest {
  action: 'start' | 'stop' | 'pause' | 'resume';
  duration?: number; // minutes
  waterAmount?: number; // liters
  overrideSchedule?: boolean;
  reason?: string;
  notes?: string;
}

export interface IrrigationHistory {
  id: number;
  irrigationSectorId: number;
  startTime: Date;
  endTime?: Date;
  plannedDuration: number;
  actualDuration?: number;
  plannedWaterAmount?: number;
  actualWaterAmount?: number;
  triggeredBy: 'manual' | 'scheduled' | 'sensor' | 'automatic';
  status: 'completed' | 'interrupted' | 'failed' | 'cancelled';
  averageTemperature?: number;
  averageHumidity?: number;
  averageWaterFlow?: number;
  notes?: string;
  createdAt: Date;
}

export interface SensorReading {
  id: number;
  irrigationSectorId: number;
  sensorType: 'temperature' | 'humidity' | 'soil_moisture' | 'water_flow' | 'pressure';
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'good' | 'fair' | 'poor' | 'invalid';
}

export interface IrrigationStatistics {
  totalSectors: number;
  activeSectors: number;
  currentlyIrrigating: number;
  scheduledToday: number;
  sectorsWithErrors: number;
  totalWaterUsageToday: number;
  totalWaterUsageWeek: number;
  totalWaterUsageMonth: number;
  averageTemperature: number;
  averageHumidity: number;
  energyConsumption: number;
  byStatus: {
    [status: string]: number;
  };
  byCrop: {
    cropName: string;
    sectors: number;
    waterUsage: number;
  }[];
  dailyUsage: {
    date: string;
    waterUsage: number;
    sectors: number;
    duration: number;
  }[];
}

export interface IrrigationAlert {
  id: number;
  irrigationSectorId: number;
  alertType: 'low_pressure' | 'high_temperature' | 'low_humidity' | 'sensor_failure' | 'pump_failure' | 'water_shortage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  isActive: boolean;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: {
    date: string;
    temperature: number;
    humidity: number;
    precipitation: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})

export class IrrigationSectorService {
  private readonly baseUrl = '/api/irrigation-sectors';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all irrigation sectors with optional filters
   */
  getAll(filters?: IrrigationSectorFilters): Observable<IrrigationSector[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.irrigationStatus) {
        params = params.set('irrigationStatus', filters.irrigationStatus);
      }
      if (filters.cropProductionId) {
        params = params.set('cropProductionId', filters.cropProductionId.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.hasErrors !== undefined) {
        params = params.set('hasErrors', filters.hasErrors.toString());
      }
      if (filters.isIrrigating !== undefined) {
        params = params.set('isIrrigating', filters.isIrrigating.toString());
      }
      if (filters.farmId) {
        params = params.set('farmId', filters.farmId.toString());
      }
      if (filters.temperatureMin !== undefined) {
        params = params.set('temperatureMin', filters.temperatureMin.toString());
      }
      if (filters.temperatureMax !== undefined) {
        params = params.set('temperatureMax', filters.temperatureMax.toString());
      }
      if (filters.humidityMin !== undefined) {
        params = params.set('humidityMin', filters.humidityMin.toString());
      }
      if (filters.humidityMax !== undefined) {
        params = params.set('humidityMax', filters.humidityMax.toString());
      }
      if (filters.waterFlowMin !== undefined) {
        params = params.set('waterFlowMin', filters.waterFlowMin.toString());
      }
      if (filters.waterFlowMax !== undefined) {
        params = params.set('waterFlowMax', filters.waterFlowMax.toString());
      }
      if (filters.scheduleEnabled !== undefined) {
        params = params.set('scheduleEnabled', filters.scheduleEnabled.toString());
      }
    }

    return this.apiService.get<IrrigationSector[]>(this.baseUrl, params);
  }

  /**
   * Get irrigation sector by ID
   */
  getById(id: number): Observable<IrrigationSector> {
    return this.apiService.get<IrrigationSector>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new irrigation sector
   */
  create(data: IrrigationSectorCreateRequest): Observable<IrrigationSector> {
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      irrigationStatus: 'stopped',
      isIrrigating: false,
      hasError: false,
      scheduleEnabled: data.scheduleSettings?.enabled || false
    };

    return this.apiService.post<IrrigationSector>(this.baseUrl, payload);
  }

  /**
   * Update irrigation sector
   */
  update(id: number, data: IrrigationSectorUpdateRequest): Observable<IrrigationSector> {
    return this.apiService.put<IrrigationSector>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete irrigation sector
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle irrigation on/off
   */
  toggleIrrigation(id: number, isIrrigating: boolean): Observable<IrrigationSector> {
    const payload = {
      action: isIrrigating ? 'start' : 'stop',
      overrideSchedule: true,
      reason: 'manual_control'
    };

    return this.apiService.post<IrrigationSector>(`${this.baseUrl}/${id}/toggle`, payload);
  }

  /**
   * Start irrigation manually
   */
  startIrrigation(id: number, controlRequest?: IrrigationControlRequest): Observable<IrrigationSector> {
    const payload = {
      action: 'start',
      ...controlRequest
    };

    return this.apiService.post<IrrigationSector>(`${this.baseUrl}/${id}/control`, payload);
  }

  /**
   * Stop irrigation
   */
  stopIrrigation(id: number, reason?: string): Observable<IrrigationSector> {
    const payload = {
      action: 'stop',
      reason: reason || 'manual_stop'
    };

    return this.apiService.post<IrrigationSector>(`${this.baseUrl}/${id}/control`, payload);
  }

  /**
   * Pause irrigation
   */
  pauseIrrigation(id: number, reason?: string): Observable<IrrigationSector> {
    const payload = {
      action: 'pause',
      reason: reason || 'manual_pause'
    };

    return this.apiService.post<IrrigationSector>(`${this.baseUrl}/${id}/control`, payload);
  }

  /**
   * Resume paused irrigation
   */
  resumeIrrigation(id: number): Observable<IrrigationSector> {
    const payload = {
      action: 'resume',
      reason: 'manual_resume'
    };

    return this.apiService.post<IrrigationSector>(`${this.baseUrl}/${id}/control`, payload);
  }

  /**
   * Schedule irrigation
   */
  scheduleIrrigation(id: number, scheduleData: IrrigationScheduleRequest): Observable<any> {
    const payload = {
      ...scheduleData,
      startDate: typeof scheduleData.startDate === 'string' 
        ? scheduleData.startDate 
        : scheduleData.startDate.toISOString(),
      ...(scheduleData.endDate && {
        endDate: typeof scheduleData.endDate === 'string' 
          ? scheduleData.endDate 
          : scheduleData.endDate.toISOString()
      })
    };

    return this.apiService.post<any>(`${this.baseUrl}/${id}/schedule`, payload);
  }

  /**
   * Get irrigation schedule for sector
   */
  getSchedule(id: number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.baseUrl}/${id}/schedule`);
  }

  /**
   * Update irrigation schedule
   */
  updateSchedule(id: number, scheduleId: number, scheduleData: Partial<IrrigationScheduleRequest>): Observable<any> {
    const payload = {
      ...scheduleData,
      ...(scheduleData.startDate && {
        startDate: typeof scheduleData.startDate === 'string' 
          ? scheduleData.startDate 
          : scheduleData.startDate.toISOString()
      }),
      ...(scheduleData.endDate && {
        endDate: typeof scheduleData.endDate === 'string' 
          ? scheduleData.endDate 
          : scheduleData.endDate.toISOString()
      })
    };

    return this.apiService.put<any>(`${this.baseUrl}/${id}/schedule/${scheduleId}`, payload);
  }

  /**
   * Delete irrigation schedule
   */
  deleteSchedule(id: number, scheduleId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}/schedule/${scheduleId}`);
  }

  /**
   * Get irrigation history
   */
  getHistory(id: number, dateFrom?: string, dateTo?: string): Observable<IrrigationHistory[]> {
    let params = new HttpParams();
    
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.apiService.get<IrrigationHistory[]>(`${this.baseUrl}/${id}/history`, params);
  }

  /**
   * Get current sensor readings
   */
  getSensorReadings(id: number): Observable<SensorReading[]> {
    return this.apiService.get<SensorReading[]>(`${this.baseUrl}/${id}/sensors`);
  }

  /**
   * Get historical sensor data
   */
  getSensorHistory(id: number, sensorType?: string, hoursBack?: number): Observable<SensorReading[]> {
    let params = new HttpParams();
    
    if (sensorType) {
      params = params.set('sensorType', sensorType);
    }
    if (hoursBack) {
      params = params.set('hoursBack', hoursBack.toString());
    }

    return this.apiService.get<SensorReading[]>(`${this.baseUrl}/${id}/sensors/history`, params);
  }

  /**
   * Get irrigation statistics
   */
  getStatistics(farmId?: number, dateFrom?: string, dateTo?: string): Observable<IrrigationStatistics> {
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

    return this.apiService.get<IrrigationStatistics>(`${this.baseUrl}/statistics`, params);
  }

  /**
   * Get active alerts
   */
  getAlerts(id?: number): Observable<IrrigationAlert[]> {
    const url = id ? `${this.baseUrl}/${id}/alerts` : `${this.baseUrl}/alerts`;
    return this.apiService.get<IrrigationAlert[]>(url);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: number): Observable<IrrigationAlert> {
    return this.apiService.put<IrrigationAlert>(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {});
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: number, notes?: string): Observable<IrrigationAlert> {
    const payload = { notes: notes || '' };
    return this.apiService.put<IrrigationAlert>(`${this.baseUrl}/alerts/${alertId}/resolve`, payload);
  }

  /**
   * Get weather conditions for irrigation planning
   */
  getWeatherConditions(latitude: number, longitude: number): Observable<WeatherConditions> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());

    return this.apiService.get<WeatherConditions>(`${this.baseUrl}/weather`, params);
  }

  /**
   * Get irrigation recommendations based on weather and crop conditions
   */
  getIrrigationRecommendations(id: number): Observable<any> {
    return this.apiService.get<any>(`${this.baseUrl}/${id}/recommendations`);
  }

  /**
   * Calibrate sensors
   */
  calibrateSensors(id: number, sensorType: string, calibrationData: any): Observable<any> {
    const payload = {
      sensorType,
      ...calibrationData
    };

    return this.apiService.post<any>(`${this.baseUrl}/${id}/sensors/calibrate`, payload);
  }

  /**
   * Test irrigation system
   */
  testSystem(id: number, testDuration: number = 30): Observable<any> {
    const payload = {
      testDuration, // seconds
      testType: 'system_check'
    };

    return this.apiService.post<any>(`${this.baseUrl}/${id}/test`, payload);
  }

  /**
   * Get real-time data stream
   */
  getRealTimeData(id: number): Observable<IrrigationSector> {
    return interval(5000).pipe(
      startWith(0),
      switchMap(() => this.getById(id))
    );
  }

  /**
   * Bulk operations
   */
  bulkStart(sectorIds: number[], duration?: number): Observable<any> {
    const payload = {
      sectorIds,
      action: 'start',
      duration
    };

    return this.apiService.post<any>(`${this.baseUrl}/bulk/control`, payload);
  }

  bulkStop(sectorIds: number[], reason?: string): Observable<any> {
    const payload = {
      sectorIds,
      action: 'stop',
      reason
    };

    return this.apiService.post<any>(`${this.baseUrl}/bulk/control`, payload);
  }

  bulkUpdateSchedule(sectorIds: number[], scheduleData: IrrigationScheduleRequest): Observable<any> {
    const payload = {
      sectorIds,
      ...scheduleData,
      startDate: typeof scheduleData.startDate === 'string' 
        ? scheduleData.startDate 
        : scheduleData.startDate.toISOString()
    };

    return this.apiService.post<any>(`${this.baseUrl}/bulk/schedule`, payload);
  }

  /**
   * Export irrigation data
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
   * Utility methods for components
   */
  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'running': 'En Ejecución',
      'scheduled': 'Programado',
      'stopped': 'Detenido',
      'maintenance': 'Mantenimiento',
      'error': 'Error',
      'paused': 'Pausado'
    };
    return statusMap[status] || status;
  }

  formatWaterFlow(flow: number): string {
    if (flow >= 1000) {
      return `${(flow / 1000).toFixed(1)} m³/h`;
    }
    return `${flow.toFixed(0)} L/h`;
  }

  calculateWaterUsage(flow: number, durationMinutes: number): number {
    return (flow * durationMinutes) / 60; // Convert to liters
  }

  isOptimalConditions(temperature?: number, humidity?: number): boolean {
    if (!temperature || !humidity) return false;
    return temperature >= 18 && temperature <= 28 && humidity >= 40 && humidity <= 80;
  }

  getStatusPriority(status: string): number {
    const priorityMap: { [key: string]: number } = {
      'error': 5,
      'maintenance': 4,
      'running': 3,
      'scheduled': 2,
      'paused': 2,
      'stopped': 1
    };
    return priorityMap[status] || 0;
  }

  /**
   * Data transformation methods
   */
  groupByCrop(sectors: IrrigationSector[]): { [cropName: string]: IrrigationSector[] } {
    return sectors.reduce((groups, sector) => {
      const cropName = sector.cropProduction?.crop?.name || 'Sin cultivo';
      if (!groups[cropName]) {
        groups[cropName] = [];
      }
      groups[cropName].push(sector);
      return groups;
    }, {} as { [cropName: string]: IrrigationSector[] });
  }

  groupByStatus(sectors: IrrigationSector[]): { [status: string]: IrrigationSector[] } {
    return sectors.reduce((groups, sector) => {
      const status = sector.irrigationStatus || 'unknown';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(sector);
      return groups;
    }, {} as { [status: string]: IrrigationSector[] });
  }

  sortBySeverity(sectors: IrrigationSector[]): IrrigationSector[] {
    return [...sectors].sort((a, b) => {
      const priorityA = this.getStatusPriority(a.irrigationStatus || '');
      const priorityB = this.getStatusPriority(b.irrigationStatus || '');
      return priorityB - priorityA; // Descending order (highest priority first)
    });
  }

  filterActive(sectors: IrrigationSector[]): IrrigationSector[] {
    return sectors.filter(sector => sector.isActive);
  }

  filterIrrigating(sectors: IrrigationSector[]): IrrigationSector[] {
    return sectors.filter(sector => sector.isIrrigating);
  }

  filterWithErrors(sectors: IrrigationSector[]): IrrigationSector[] {
    return sectors.filter(sector => sector.hasError);
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
    console.error('Irrigation Sector Service Error:', error);
    throw error;
  }
}