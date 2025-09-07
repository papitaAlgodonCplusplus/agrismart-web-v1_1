// src/app/features/services/irrigation-sector.service.ts - ENHANCED FOR IRRIGATION ENGINEERING MODULE
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, interval } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';
import { IrrigationSector } from '../../core/models/models';

// ============================================================================
// ENHANCED INTERFACES FOR IRRIGATION ENGINEERING MODULE
// ============================================================================

export interface Container {
  type: any;
  capacity: any;
  currentVolume: any;
  id: number;
  catalogId: number;
  name: string;
  containerTypeId: number;
  height: number;
  width: number;
  length: number;
  lowerDiameter: number;
  upperDiameter: number;
  volume?: number;
  active: boolean;
  dateCreated: Date;
  createdBy: number;
}

export interface Dropper {
  id: number;
  catalogId: number;
  name: string;
  flowRate: number;
  active: boolean;
  dateCreated: Date;
  createdBy: number;
}

export interface GrowingMedium {
  drainage: number;
  waterRetention: number;
  type: any;
  id: number;
  catalogId: number;
  name: string;
  containerCapacityPercentage?: number;
  permanentWiltingPoint?: number;
  easelyAvailableWaterPercentage?: number;
  reserveWaterPercentage?: number;
  totalAvailableWaterPercentage?: number;
  active: boolean;
  dateCreated: Date;
  createdBy: number;
}

export interface IrrigationEvent {
  duration: number;
  id: number;
  cropProductionId: number;
  dateTimeStart: Date;
  dateTimeEnd?: Date;
  plannedDuration: number;
  actualDuration?: number;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled' | 'failed';
  triggeredBy: 'manual' | 'scheduled' | 'sensor' | 'automatic';
  waterAmount?: number;
  notes?: string;
  createdAt: Date;
}

export interface IrrigationMeasurement {
  pressure: number;
  timestamp: string | Date;
  temperature: number;
  humidity: number;
  id: number;
  recordDateTime: Date;
  cropProductionId: number;
  eventId?: number;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  irrigationVolume: number;
  drainVolume: number;
  measurementVariableId?: number;
  recordValue?: number;
  dateCreated: Date;
}

export interface HydraulicCalculation {
  frictionFactor: any;
  reynoldsNumber: any;
  velocity: any;
  flowRate: number; // L/h
  pressure: number; // bar
  pipeSize: number; // mm
  frictionLoss: number; // bar
  staticHead: number; // m
  dynamicHead: number; // m
  totalHead: number; // m
  efficiency: number; // %
  powerRequired: number; // kW
}

export interface EvapotranspirationData {
  date: Date;
  cropProductionId: number;
  referenceET: number; // mm/day
  cropET: number; // mm/day
  cropCoefficient: number;
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // m/s
  solarRadiation: number; // MJ/m²/day
  precipitation: number; // mm
}

export interface IrrigationScheduleOptimization {
  optimalConditions: any;
  waterSavings: number;
  nextOptimalTime: string | Date;
  cropProductionId: number;
  optimalStartTime: string;
  recommendedDuration: number; // minutes
  waterAmount: number; // liters
  frequency: number; // times per day
  priority: 'low' | 'medium' | 'high' | 'critical';
  conditions: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
    weather: string;
  };
  efficiency: number; // %
  costPerIrrigation: number;
}

export interface FlowRateCalculation {
  uniformity: number;
  flowRatePerArea: any;
  containerId: number;
  dropperId: number;
  numberOfDroppers: number;
  totalFlowRate: number; // L/h
  pressureRequired: number; // bar
  irrigationArea: number; // m²
  precipitationRate: number; // mm/h
  applicationEfficiency: number; // %
}

export interface IrrigationSystemStatus {
  lastUpdate: string | Date;
  // Enhanced properties for system status monitoring
  farmId: number;
  systemStatus: string;
  devices: any;
  activeDevices: number;
  totalDevices: number;
  zones: {
    deviceId: number;
    deviceIdentifier: string;
    status: string;
    sensors: {
      id: number;
      label: string;
      type: string;
      active: boolean;
    }[];
  }[];
  alerts: IrrigationAlert[];
  // Legacy/optional properties for backward compatibility
  activeSectors?: any;
  systemPressure?: number; // bar
  totalFlowRate?: number; // L/h
  activeZones?: number;
  pumpStatus?: 'running' | 'stopped' | 'maintenance';
  filterStatus?: 'clean' | 'needs_cleaning' | 'clogged';
  valveStatuses?: { [zoneId: number]: 'open' | 'closed' | 'partial' };
}

// Existing interfaces...
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
  timestamp: string | Date;
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
  ) { }

  // ============================================================================
  // ENHANCED API METHODS FOR IRRIGATION ENGINEERING MODULE
  // ============================================================================

  /**
   * CONTAINERS API - /Container endpoint
   */
  getAllContainers(onlyActive: boolean = true): Observable<Container[]> {
    const params = new HttpParams().set('IncludeInactives', !onlyActive.toString());

    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Container`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.containers || [];
        }
        throw new Error(`Container API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  getContainerById(id: number): Observable<Container> {
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Container/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Container API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  createContainer(container: Partial<Container>): Observable<Container> {
    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}/Container`, container, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Container API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  updateContainer(container: Container): Observable<Container> {
    return this.http.put<any>(`${this.apiConfig.agronomicApiUrl}/Container`, container, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Container API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DROPPERS API - /Dropper endpoint
   */
  getAllDroppers(onlyActive: boolean = true): Observable<Dropper[]> {
    const params = new HttpParams().set('IncludeInactives', !onlyActive.toString());

    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Dropper`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.droppers || [];
        }
        throw new Error(`Dropper API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  getDropperById(id: number): Observable<Dropper> {
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Dropper/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Dropper API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  createDropper(dropper: Partial<Dropper>): Observable<Dropper> {
    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}/Dropper`, dropper, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Dropper API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  updateDropper(dropper: Dropper): Observable<Dropper> {
    return this.http.put<any>(`${this.apiConfig.agronomicApiUrl}/Dropper`, dropper, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Dropper API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GROWING MEDIUMS API - /GrowingMedium endpoint
   */
  getAllGrowingMediums(onlyActive: boolean = true): Observable<GrowingMedium[]> {
    const params = new HttpParams().set('IncludeInactives', !onlyActive.toString());

    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/GrowingMedium`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.growingMediums || [];
        }
        throw new Error(`GrowingMedium API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  getGrowingMediumById(id: number): Observable<GrowingMedium> {
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/GrowingMedium/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`GrowingMedium API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * IRRIGATION EVENTS API - Based on backend configuration
   */
  getIrrigationEvents(startDate: string, endDate: string, cropProductionId?: number): Observable<IrrigationEvent[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    if (cropProductionId) {
      params = params.set('cropProductionId', cropProductionId.toString());
    }

    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/IrrigationEvent`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.irrigationEvents || [];
        }
        throw new Error(`IrrigationEvent API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  createIrrigationEvent(event: Partial<IrrigationEvent>): Observable<IrrigationEvent> {
    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}/IrrigationEvent`, event, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`IrrigationEvent API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * IRRIGATION MEASUREMENTS API
   */
  getIrrigationMeasurements(startDate: string, endDate: string, cropProductionId?: number): Observable<IrrigationMeasurement[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    if (cropProductionId) {
      params = params.set('cropProductionId', cropProductionId.toString());
    }

    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/IrrigationMeasurement`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.irrigationMeasurements || [];
        }
        throw new Error(`IrrigationMeasurement API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * HYDRAULIC CALCULATIONS - using Calculator API
   */
  calculateHydraulics(
    flowRate: number,
    pipeSize: number,
    pipeLength: number,
    elevation: number,
    fittings: { type: string; quantity: number }[]
  ): Observable<HydraulicCalculation> {
    const payload = {
      flowRate,
      pipeSize,
      pipeLength,
      elevation,
      fittings
    };

    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}/Calculator/hydraulics`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Hydraulic calculation failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * EVAPOTRANSPIRATION CALCULATIONS
   */
  calculateEvapotranspiration(
    cropProductionId: number,
    startDate: string,
    endDate: string
  ): Observable<EvapotranspirationData[]> {
    const params = new HttpParams()
      .set('cropProductionId', cropProductionId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Calculator/evapotranspiration`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.evapotranspirationData || [];
        }
        throw new Error(`Evapotranspiration calculation failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * IRRIGATION SCHEDULE OPTIMIZATION
   */
  optimizeIrrigationSchedule(cropProductionId: number): Observable<IrrigationScheduleOptimization> {
    const payload = { cropProductionId };

    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}/Calculator/irrigation-optimization`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Irrigation optimization failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * FLOW RATE AND PRESSURE CALCULATIONS
   */
  calculateFlowRate(
    containerId: number,
    dropperId: number,
    numberOfDroppers: number,
    irrigationArea: number
  ): Observable<FlowRateCalculation> {
    const payload = {
      containerId,
      dropperId,
      numberOfDroppers,
      irrigationArea
    };

    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}/Calculator/flow-rate`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Flow rate calculation failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }


  /**
   * ON-DEMAND IRRIGATION TRIGGER
   */
  triggerOnDemandIrrigation(
    cropProductionId: number,
    duration?: number,
    reason: string = 'manual'
  ): Observable<any> {
    const payload = {
      cropProductionId,
      duration,
      reason,
      triggeredBy: 'manual'
    };

    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}/OnDemandIrrigation/trigger`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`On-demand irrigation failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }


  // ============================================================================
  // EXISTING IRRIGATION SECTOR METHODS (Enhanced)
  // ============================================================================

  /**
   * Get all irrigation sectors with optional filters
   */
  getAll(filters?: IrrigationSectorFilters): Observable<IrrigationSector[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const id = filters?.cropProductionId ? `/${filters.cropProductionId}` : '';

    return this.apiService.get<IrrigationSector[]>(`${this.baseUrl}${id}`, params);
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
   * Get alerts for irrigation sectors
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

  getById(id: number): Observable<IrrigationSector> {
    return this.apiService.get<IrrigationSector>(`${this.baseUrl}/${id}`);
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

  /**
 * IoT REAL-TIME SENSOR DATA
 * Workaround: Get all devices and sensors, then filter/map for specific crop production
 */
  getRealTimeSensorData(cropProductionId: number): Observable<any> {
    // Since there's no direct endpoint for latest sensor data by cropProductionId,
    // we'll get all devices and sensors, then create a mapped response
    return forkJoin({
      devices: this.http.get<any>(`${this.apiConfig.iotApiUrl}/DeviceSensor/devices`, {
        headers: this.getAuthHeaders()
      }),
      sensors: this.http.get<any>(`${this.apiConfig.iotApiUrl}/DeviceSensor/sensors`, {
        headers: this.getAuthHeaders()
      })
    }).pipe(
      map(({ devices, sensors }) => {
        // Create a mapped response structure for real-time data
        // You'll need to filter by cropProductionId based on your business logic
        const mappedData = {
          cropProductionId: cropProductionId,
          devices: devices || [],
          sensors: sensors || [],
          lastUpdated: new Date().toISOString(),
          // Add mock real-time data structure until actual endpoint is available
          sensorReadings: sensors?.map((sensor: any) => ({
            sensorId: sensor.id,
            sensorLabel: sensor.sensorLabel,
            measurementVariableId: sensor.measurementVariableId,
            value: null, // Would come from actual sensor data endpoint
            timestamp: new Date().toISOString(),
            status: 'online' // Mock status
          })) || []
        };

        return mappedData;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * SYSTEM STATUS MONITORING
   * Workaround: Get devices and create irrigation system status from available data
   */
  getIrrigationSystemStatus(farmId?: number): Observable<IrrigationSystemStatus> {
    return this.http.get<any>(`${this.apiConfig.iotApiUrl}/DeviceSensor/devices`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(devices => {
        // Create irrigation system status from available device data
        const irrigationDevices = devices.filter((device: any) =>
          device.deviceId?.toLowerCase().includes('flujo') ||
          device.deviceId?.toLowerCase().includes('suelo') ||
          device.deviceId?.toLowerCase().includes('riego') ||
          device.deviceId?.toLowerCase().includes('presion') ||
          device.deviceId?.toLowerCase().includes('humedad') ||
          device.deviceId?.toLowerCase().includes('temperatura')
        ) || [];

        const status: IrrigationSystemStatus = {
          farmId: farmId || 0,
          systemStatus: irrigationDevices.length > 0 ? 'operational' : 'offline',
          activeDevices: irrigationDevices.length,
          totalDevices: devices?.length || 0,
          devices: devices,
          lastUpdate: new Date().toISOString(),
          zones: irrigationDevices.map((device: any) => ({
            deviceId: device.id,
            deviceIdentifier: device.deviceId,
            status: device.active ? 'active' : 'inactive',
            sensors: device.sensors
          })),
          alerts: [] // Would be populated from actual monitoring data
        };

        return status;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * HELPER METHOD: Get Device Authentication (if needed for sensor access)
   */
  authenticateDevice(deviceId: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiConfig.iotApiUrl}/Security/AuthenticateDevice`, {
      deviceId: deviceId,
      password: password
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Device authentication failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * HELPER METHOD: Submit new sensor data (if needed for testing)
   */
  submitDeviceRawData(deviceData: any): Observable<any> {
    return this.http.post<any>(`${this.apiConfig.iotApiUrl}/DeviceRawData`, deviceData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`Device data submission failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * HELPER METHOD: Submit MQTT sensor data
   */
  submitMqttDeviceData(mqttData: {
    recordDate: string;
    clientId: string;
    userId: string;
    deviceId: string;
    sensor: string;
    payload: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiConfig.iotApiUrl}/DeviceRawData/Mqtt`, mqttData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`MQTT data submission failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }
}