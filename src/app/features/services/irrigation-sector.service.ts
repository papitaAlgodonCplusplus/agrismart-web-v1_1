// src/app/features/services/irrigation-sector.service.ts - FIXED FOR CORRECT API ENDPOINTS
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, interval } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';
import { IrrigationSector } from '../../core/models/models';

// ============================================================================
// INTERFACES MATCHING ACTUAL API RESPONSES
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

// API Response structures matching the documented endpoints
export interface CropProductionIrrigationSectorResponse {
  success: boolean;
  exception: string;
  result: {
    cropProductionIrrigationSectors: CropProductionIrrigationSector[];
  };
}

export interface CropProductionIrrigationSector {
  id: number;
  dateCreated: string;
  dateUpdated: string;
  createdBy: number;
  updatedBy: number;
  cropProductionId: number;
  name: string;
  polygon: string;
  active: boolean;
}

export interface IrrigationMeasurementResponse {
  success: boolean;
  exception: string;
  result: {
    irrigationMeasurements: IrrigationMeasurement[];
  };
}

export interface IrrigationMeasurement {
  id: number;
  eventId: number;
  measurementVariableId: number;
  recordValue: number;
}

export interface IrrigationRequestResponse {
  success: boolean;
  exception: string;
  result: {
    irrigationRequests: IrrigationRequest[];
  };
}

export interface IrrigationRequest {
  id: number;
  dateCreated: string;
  dateUpdated: string;
  createdBy: number;
  updatedBy: number;
  cropProductionId: number;
  irrigate: boolean;
  irrigationTime: number;
  dateStarted: string;
  dateEnded: string;
}

export interface RelayModuleCropProductionIrrigationSectorResponse {
  success: boolean;
  exception: string;
  result: {
    relayModuleCropProductionIrrigationSectors: RelayModuleCropProductionIrrigationSector[];
  };
}

export interface RelayModuleCropProductionIrrigationSector {
  id: number;
  relayModuleId: number;
  cropProductionIrrigationSectorId: number;
  active: boolean;
  dateCreated: string;
  dateUpdated: string;
  createdBy: number;
  updatedBy: number;
}

// Extended interfaces for frontend functionality
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
}

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
  // Additional filters matching API parameters
  companyId?: number;
  productionUnitId?: number;
  includeInactives?: boolean;
}

export interface IrrigationSectorCreateRequest {
  name: string;
  description?: string;
  cropProductionId: number;
  polygon?: string;
  active?: boolean;
}

export interface IrrigationSectorUpdateRequest extends Partial<IrrigationSectorCreateRequest> {
  id: number;
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
  // API endpoint paths matching the documented endpoints
  private readonly cropProductionIrrigationSectorUrl = '/CropProductionIrrigationSector';
  private readonly irrigationMeasurementUrl = '/IrrigationMeasurement';
  private readonly irrigationRequestUrl = '/IrrigationRequest';
  private readonly relayModuleUrl = '/RelayModuleCropProductionIrrigationSector';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) { }

  // ============================================================================
  // ACTUAL API METHODS USING DOCUMENTED ENDPOINTS
  // ============================================================================

  /**
   * GET /CropProductionIrrigationSector - Get irrigation sectors
   */
  getAllIrrigationSectors(filters?: IrrigationSectorFilters): Observable<CropProductionIrrigationSector[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.companyId) params = params.set('CompanyId', filters.companyId.toString());
      if (filters.farmId) params = params.set('FarmId', filters.farmId.toString());
      if (filters.productionUnitId) params = params.set('ProductionUnitId', filters.productionUnitId.toString());
      if (filters.cropProductionId) params = params.set('CropProductionId', filters.cropProductionId.toString());
      if (filters.includeInactives !== undefined) params = params.set('IncludeInactives', filters.includeInactives.toString());
    }

    return this.http.get<CropProductionIrrigationSectorResponse>(`${this.apiConfig.agronomicApiUrl}${this.cropProductionIrrigationSectorUrl}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.cropProductionIrrigationSectors || [];
        }
        throw new Error(`CropProductionIrrigationSector API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /IrrigationMeasurement - Get irrigation measurements
   */
  getIrrigationMeasurements(
    cropProductionId?: number,
    startingDateTime?: string,
    endingDateTime?: string
  ): Observable<IrrigationMeasurement[]> {
    let params = new HttpParams();

    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (startingDateTime) params = params.set('StartingDateTime', startingDateTime);
    if (endingDateTime) params = params.set('EndingDateTime', endingDateTime);

    return this.http.get<IrrigationMeasurementResponse>(`${this.apiConfig.agronomicApiUrl}${this.irrigationMeasurementUrl}`, {
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
   * GET /IrrigationRequest - Get irrigation requests
   */
  getIrrigationRequests(filters?: {
    clientId?: number;
    companyId?: number;
    farmId?: number;
    productionUnitId?: number;
    cropProductionId?: number;
  }): Observable<IrrigationRequest[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.clientId) params = params.set('ClientId', filters.clientId.toString());
      if (filters.companyId) params = params.set('CompanyId', filters.companyId.toString());
      if (filters.farmId) params = params.set('FarmId', filters.farmId.toString());
      if (filters.productionUnitId) params = params.set('ProductionUnitId', filters.productionUnitId.toString());
      if (filters.cropProductionId) params = params.set('CropProductionId', filters.cropProductionId.toString());
    }

    return this.http.get<IrrigationRequestResponse>(`${this.apiConfig.agronomicApiUrl}${this.irrigationRequestUrl}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.irrigationRequests || [];
        }
        throw new Error(`IrrigationRequest API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST /IrrigationRequest - Create irrigation request
   */
  createIrrigationRequest(request: Partial<IrrigationRequest>): Observable<IrrigationRequest> {
    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}${this.irrigationRequestUrl}`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`IrrigationRequest creation failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /RelayModuleCropProductionIrrigationSector - Get relay module connections
   */
  getRelayModuleConnections(relayModuleId?: number): Observable<RelayModuleCropProductionIrrigationSector[]> {
    let params = new HttpParams();
    if (relayModuleId) params = params.set('RelayModuleId', relayModuleId.toString());

    return this.http.get<RelayModuleCropProductionIrrigationSectorResponse>(`${this.apiConfig.agronomicApiUrl}${this.relayModuleUrl}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.relayModuleCropProductionIrrigationSectors || [];
        }
        throw new Error(`RelayModuleCropProductionIrrigationSector API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // CATALOG AND CONFIGURATION DATA (IF ENDPOINTS EXIST)
  // ============================================================================

  /**
   * GET /Container endpoint (if available)
   */
  getAllContainers(includeInactives: boolean = false): Observable<Container[]> {
    const params = new HttpParams().set('IncludeInactives', includeInactives.toString());

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

  /**
   * GET /Dropper endpoint (if available)
   */
  getAllDroppers(includeInactives: boolean = false): Observable<Dropper[]> {
    const params = new HttpParams().set('IncludeInactives', includeInactives.toString());

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

  /**
   * GET /GrowingMedium endpoint (if available)
   */
  getAllGrowingMediums(includeInactives: boolean = false): Observable<GrowingMedium[]> {
    const params = new HttpParams().set('IncludeInactives', includeInactives.toString());

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

  // ============================================================================
  // IoT SENSOR DATA (Using available IoT endpoints)
  // ============================================================================

  /**
   * Get real-time sensor data from IoT API
   */
  getRealTimeSensorData(cropProductionId: number): Observable<any> {
    return forkJoin({
      devices: this.http.get<any>(`${this.apiConfig.iotApiUrl}/DeviceSensor/devices`, {
        headers: this.getAuthHeaders()
      }).pipe(catchError(() => [])),
      sensors: this.http.get<any>(`${this.apiConfig.iotApiUrl}/DeviceSensor/sensors`, {
        headers: this.getAuthHeaders()
      }).pipe(catchError(() => []))
    }).pipe(
      map(({ devices, sensors }) => {
        const mappedData = {
          cropProductionId: cropProductionId,
          devices: devices || [],
          sensors: sensors || [],
          lastUpdated: new Date().toISOString(),
          sensorReadings: sensors?.map((sensor: any) => ({
            sensorId: sensor.id,
            sensorLabel: sensor.sensorLabel,
            measurementVariableId: sensor.measurementVariableId,
            value: null,
            timestamp: new Date().toISOString(),
            status: 'online'
          })) || []
        };
        return mappedData;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get irrigation system status
   */
  getIrrigationSystemStatus(farmId?: number): Observable<IrrigationSystemStatus> {
    return this.http.get<any>(`${this.apiConfig.iotApiUrl}/DeviceSensor/devices`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(devices => {
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
            sensors: device.sensors || []
          })),
          alerts: []
        };

        return status;
      }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // CALCULATION METHODS (CLIENT-SIDE CALCULATIONS)
  // ============================================================================

  /**
   * Client-side hydraulic calculations (since Calculator endpoint may not exist)
   */
  calculateHydraulics(
    flowRate: number,
    pipeSize: number,
    pipeLength: number,
    elevation: number,
    fittings: { type: string; quantity: number }[]
  ): Observable<HydraulicCalculation> {
    // Client-side calculation implementation
    const velocity = (flowRate * 4) / (Math.PI * Math.pow(pipeSize / 1000, 2)); // m/s
    const reynoldsNumber = (velocity * (pipeSize / 1000) * 1000) / 0.001; // Re
    const frictionFactor = 0.316 / Math.pow(reynoldsNumber, 0.25); // Blasius equation

    const frictionLoss = frictionFactor * (pipeLength / (pipeSize / 1000)) * (Math.pow(velocity, 2) / (2 * 9.81)) * 10; // bar
    const staticHead = elevation; // m
    const dynamicHead = staticHead + (frictionLoss * 10.2); // m
    const totalHead = dynamicHead; // m
    const efficiency = 0.75; // 75% default efficiency
    const powerRequired = (flowRate / 3600 * 1000 * 9.81 * totalHead) / (1000 * efficiency); // kW

    const result: HydraulicCalculation = {
      flowRate,
      pressure: frictionLoss + (staticHead / 10.2),
      pipeSize,
      frictionLoss,
      staticHead,
      dynamicHead,
      totalHead,
      efficiency: efficiency * 100,
      powerRequired,
      velocity,
      reynoldsNumber,
      frictionFactor
    };

    return new Observable(observer => {
      observer.next(result);
      observer.complete();
    });
  }

  /**
   * Client-side flow rate calculation
   */
  calculateFlowRate(
    containerId: number,
    dropperId: number,
    numberOfDroppers: number,
    irrigationArea: number
  ): Observable<FlowRateCalculation> {
    // Mock calculation - replace with actual business logic
    const totalFlowRate = numberOfDroppers * 2; // 2 L/h per dropper assumption
    const precipitationRate = totalFlowRate / irrigationArea; // mm/h
    const applicationEfficiency = 85; // 85% efficiency assumption

    const result: FlowRateCalculation = {
      containerId,
      dropperId,
      numberOfDroppers,
      totalFlowRate,
      pressureRequired: 1.5, // bar assumption
      irrigationArea,
      precipitationRate,
      applicationEfficiency,
      uniformity: 90, // 90% uniformity assumption
      flowRatePerArea: totalFlowRate / irrigationArea
    };

    return new Observable(observer => {
      observer.next(result);
      observer.complete();
    });
  }

  // ============================================================================
  // UTILITY AND TRANSFORMATION METHODS
  // ============================================================================

  /**
   * Convert CropProductionIrrigationSector to IrrigationSector for compatibility
   */
  mapToIrrigationSector(sector: CropProductionIrrigationSector): IrrigationSector {
    return {
      id: sector.id,
      name: sector.name,
      cropProductionId: sector.cropProductionId,
      isActive: sector.active,
      irrigationStatus: 'stopped', // Default status
      hasError: false,
      isIrrigating: false,
      currentTemperature: null,
      currentHumidity: null,
      currentWaterFlow: null,
      createdAt: new Date(sector.dateCreated),
      updatedAt: new Date(sector.dateUpdated)
    } as unknown as IrrigationSector;
  }

  /**
   * Get all irrigation sectors (backward compatibility)
   */
  getAll(filters?: IrrigationSectorFilters): Observable<IrrigationSector[]> {
    return this.getAllIrrigationSectors(filters).pipe(
      map(sectors => sectors.map(sector => this.mapToIrrigationSector(sector)))
    );
  }

  /**
   * Get irrigation sector by ID
   */
  getById(id: number): Observable<IrrigationSector> {
    return this.getAllIrrigationSectors().pipe(
      map(sectors => {
        const sector = sectors.find(s => s.id === id);
        if (!sector) {
          throw new Error(`Irrigation sector with ID ${id} not found`);
        }
        return this.mapToIrrigationSector(sector);
      })
    );
  }

  /**
   * Trigger on-demand irrigation
   */
  triggerOnDemandIrrigation(
    cropProductionId: number,
    duration?: number,
    reason: string = 'manual'
  ): Observable<any> {
    const irrigationRequest: Partial<IrrigationRequest> = {
      cropProductionId,
      irrigate: true,
      irrigationTime: duration || 30,
      dateStarted: new Date().toISOString(),
      createdBy: 1 // Should be current user ID
    };

    return this.createIrrigationRequest(irrigationRequest);
  }

  /**
   * Formatting utility methods
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

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

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

  // ============================================================================
  // DATA TRANSFORMATION METHODS
  // ============================================================================

  /**
   * Group irrigation sectors by crop
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

  /**
   * Group irrigation sectors by status
   */
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

  /**
   * Sort sectors by severity
   */
  sortBySeverity(sectors: IrrigationSector[]): IrrigationSector[] {
    return [...sectors].sort((a, b) => {
      const priorityA = this.getStatusPriority(a.irrigationStatus || '');
      const priorityB = this.getStatusPriority(b.irrigationStatus || '');
      return priorityB - priorityA; // Descending order (highest priority first)
    });
  }

  /**
   * Filter active sectors
   */
  filterActive(sectors: IrrigationSector[]): IrrigationSector[] {
    return sectors.filter(sector => sector.isActive);
  }

  /**
   * Filter currently irrigating sectors
   */
  filterIrrigating(sectors: IrrigationSector[]): IrrigationSector[] {
    return sectors.filter(sector => sector.isIrrigating);
  }

  /**
   * Filter sectors with errors
   */
  filterWithErrors(sectors: IrrigationSector[]): IrrigationSector[] {
    return sectors.filter(sector => sector.hasError);
  }

  // ============================================================================
  // STATISTICS AND ANALYTICS
  // ============================================================================

  /**
   * Get irrigation statistics
   */
  getStatistics(farmId?: number, dateFrom?: string, dateTo?: string): Observable<IrrigationStatistics> {
    // Since there's no direct statistics endpoint, we'll build it from available data
    return this.getAll({ farmId }).pipe(
      map(sectors => {
        const activeSectors = sectors.filter(s => s.isActive);
        const currentlyIrrigating = sectors.filter(s => s.isIrrigating);
        const sectorsWithErrors = sectors.filter(s => s.hasError);

        const statistics: IrrigationStatistics = {
          totalSectors: sectors.length,
          activeSectors: activeSectors.length,
          currentlyIrrigating: currentlyIrrigating.length,
          scheduledToday: 0, // Would need schedule data
          sectorsWithErrors: sectorsWithErrors.length,
          totalWaterUsageToday: 0, // Would need measurement data
          totalWaterUsageWeek: 0,
          totalWaterUsageMonth: 0,
          averageTemperature: 0,
          averageHumidity: 0,
          energyConsumption: 0,
          byStatus: this.getStatusCounts(sectors),
          byCrop: this.getCropUsage(sectors),
          dailyUsage: [] // Would need historical data
        };

        return statistics;
      })
    );
  }

  private getStatusCounts(sectors: IrrigationSector[]): { [status: string]: number } {
    return sectors.reduce((counts, sector) => {
      const status = sector.irrigationStatus || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as { [status: string]: number });
  }

  private getCropUsage(sectors: IrrigationSector[]): { cropName: string; sectors: number; waterUsage: number; }[] {
    const cropGroups = this.groupByCrop(sectors);
    return Object.keys(cropGroups).map(cropName => ({
      cropName,
      sectors: cropGroups[cropName].length,
      waterUsage: 0 // Would need actual usage data
    }));
  }

  // ============================================================================
  // REAL-TIME DATA STREAMING
  // ============================================================================

  /**
   * Get real-time data stream for a specific irrigation sector
   */
  getRealTimeData(id: number): Observable<IrrigationSector> {
    return interval(5000).pipe(
      startWith(0),
      switchMap(() => this.getById(id))
    );
  }

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  /**
   * Get alerts (mock implementation)
   */
  getAlerts(id?: number): Observable<IrrigationAlert[]> {
    // Mock alerts since there's no dedicated endpoint
    const mockAlerts: IrrigationAlert[] = [];
    return new Observable(observer => {
      observer.next(mockAlerts);
      observer.complete();
    });
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: number): Observable<IrrigationAlert> {
    return new Observable(observer => {
      observer.next({} as IrrigationAlert);
      observer.complete();
    });
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: number, notes?: string): Observable<IrrigationAlert> {
    return new Observable(observer => {
      observer.next({} as IrrigationAlert);
      observer.complete();
    });
  }

  // ============================================================================
  // IRRIGATION CONTROL OPERATIONS
  // ============================================================================

  /**
   * Start irrigation
   */
  startIrrigation(cropProductionId: number, duration?: number): Observable<any> {
    return this.triggerOnDemandIrrigation(cropProductionId, duration, 'manual_start');
  }

  /**
   * Stop irrigation
   */
  stopIrrigation(cropProductionId: number, reason?: string): Observable<any> {
    const irrigationRequest: Partial<IrrigationRequest> = {
      cropProductionId,
      irrigate: false,
      dateEnded: new Date().toISOString(),
      createdBy: 1 // Should be current user ID
    };

    return this.createIrrigationRequest(irrigationRequest);
  }

  /**
   * Bulk operations
   */
  bulkStart(sectorIds: number[], duration?: number): Observable<any> {
    const requests = sectorIds.map(id => this.startIrrigation(id, duration));
    return forkJoin(requests);
  }

  bulkStop(sectorIds: number[], reason?: string): Observable<any> {
    const requests = sectorIds.map(id => this.stopIrrigation(id, reason));
    return forkJoin(requests);
  }

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  /**
   * Export irrigation data
   */
  exportData(filters?: any, format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    // Since there's no export endpoint, we'll create client-side export
    return this.getAll(filters).pipe(
      map(sectors => {
        const csvData = this.convertToCSV(sectors);
        return new Blob([csvData], { type: 'text/csv' });
      })
    );
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    return csvContent;
  }

  // ============================================================================
  // DEVICE AND SENSOR MANAGEMENT
  // ============================================================================

  /**
   * Authenticate device for IoT operations
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
   * Submit device raw data
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
   * Submit MQTT device data
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

  // ============================================================================
  // WEATHER AND ENVIRONMENTAL DATA
  // ============================================================================

  /**
   * Get weather conditions (mock implementation)
   */
  getWeatherConditions(latitude: number, longitude: number): Observable<WeatherConditions> {
    // Mock weather data since no weather endpoint is available
    const mockWeather: WeatherConditions = {
      temperature: 22,
      humidity: 65,
      windSpeed: 2.5,
      precipitation: 0,
      forecast: [
        { date: new Date().toISOString().split('T')[0], temperature: 23, humidity: 60, precipitation: 0 },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], temperature: 24, humidity: 55, precipitation: 0 }
      ]
    };

    return new Observable(observer => {
      observer.next(mockWeather);
      observer.complete();
    });
  }

  // ============================================================================
  // OPTIMIZATION AND RECOMMENDATIONS
  // ============================================================================

  /**
   * Get irrigation recommendations
   */
  getIrrigationRecommendations(id: number): Observable<any> {
    // Mock recommendations since no recommendation endpoint is available
    const mockRecommendations = {
      shouldIrrigate: true,
      recommendedDuration: 30,
      waterAmount: 100,
      reason: 'Soil moisture below optimal level',
      priority: 'medium' as const,
      nextOptimalTime: new Date(Date.now() + 3600000).toISOString()
    };

    return new Observable(observer => {
      observer.next(mockRecommendations);
      observer.complete();
    });
  }

  /**
   * Optimize irrigation schedule
   */
  optimizeIrrigationSchedule(cropProductionId: number): Observable<IrrigationScheduleOptimization> {
    // Mock optimization since no optimization endpoint is available
    const mockOptimization: IrrigationScheduleOptimization = {
      cropProductionId,
      optimalStartTime: '06:00',
      recommendedDuration: 45,
      waterAmount: 150,
      frequency: 2,
      priority: 'medium',
      conditions: {
        soilMoisture: 35,
        temperature: 22,
        humidity: 65,
        weather: 'clear'
      },
      efficiency: 85,
      costPerIrrigation: 2.5,
      waterSavings: 15,
      nextOptimalTime: new Date(Date.now() + 21600000).toISOString(),
      optimalConditions: {
        temperature: { min: 18, max: 28 },
        humidity: { min: 40, max: 80 }
      }
    };

    return new Observable(observer => {
      observer.next(mockOptimization);
      observer.complete();
    });
  }


  private readonly baseUrl = '/api/irrigation-sectors';

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
 * Test irrigation system
 */
  testSystem(id: number, testDuration: number = 30): Observable<any> {
    const payload = {
      testDuration, // seconds
      testType: 'system_check'
    };

    return this.apiService.post<any>(`${this.baseUrl}/${id}/test`, payload);
  }
}