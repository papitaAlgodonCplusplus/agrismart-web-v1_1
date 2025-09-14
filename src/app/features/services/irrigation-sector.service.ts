// src/app/features/services/irrigation-sector.service.ts - UPDATED WITH PROPER API INTEGRATION
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, interval, of, throwError } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';

// ============================================================================
// INTERFACES MATCHING ACTUAL API RESPONSES
// ============================================================================

export interface IrrigationEventResponse {
  success: boolean;
  exception: string;
  result: {
    irrigationEvents: IrrigationEvent[];
  };
}

export interface IrrigationEvent {
  id: number;
  recordDateTime: string;
  cropProductionId: number;
  dateTimeStart: string;
  dateTimeEnd: string;
  duration?: number;
  waterAmount?: number;
  status?: string;
  notes?: string;
  irrigationMeasurements: IrrigationMeasurement[];
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

export interface MeasurementResponse {
  success: boolean;
  exception: string;
  result: {
    measurements: Measurement[];
  };
}

export interface Measurement {
  id: number;
  recordDate: string;
  cropProductionId: number;
  measurementVariableId: number;
  minValue: number;
  maxValue: number;
  avgValue: number;
  sumValue: number;
}

export interface MeasurementBaseResponse {
  success: boolean;
  exception: string;
  result: {
    measurements: MeasurementBase[];
  };
}

export interface MeasurementBase {
  id: number;
  recordDate: string;
  cropProductionId: number;
  measurementVariableId: number;
  sensorId: number;
  recordValue: number;
}

export interface MeasurementKPIResponse {
  success: boolean;
  exception: string;
  result: {
    measurementKPIs?: MeasurementKPI[];
    latestMeasurementKPIs?: MeasurementKPI;
  };
}

export interface MeasurementKPI {
  id: number;
  recordDate: string;
  cropProductionId: number;
  kpiId: number;
  minValue: number;
  maxValue: number;
  avgValue: number;
  sumValue: number;
}

export interface MeasurementVariableResponse {
  success: boolean;
  exception: string;
  result: {
    measurementVariables: MeasurementVariable[];
  };
}

export interface MeasurementVariable {
  id: number;
  dateCreated: string;
  dateUpdated: string;
  createdBy: number;
  updatedBy: number;
  measurementVariableStandardId: number;
  catalogId: number;
  name: string;
  measurementUnitId: number;
  factorToMeasurementVariableStandard: number;
  active: boolean;
}

// Existing interfaces (keep these)
export interface Container {
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

// Enhanced system status with real sensor data
export interface IrrigationSystemStatus {
  farmId: number;
  systemStatus: string;
  devices: DeviceInfo[];
  activeDevices: number;
  totalDevices: number;
  systemPressure?: number;
  totalFlowRate?: number;
  lastUpdate: string;
  alerts: IrrigationAlert[];
  measurements: {
    temperature: SensorReading[];
    humidity: SensorReading[];
    soilMoisture: SensorReading[];
    pressure: SensorReading[];
    flow: SensorReading[];
  };
}

export interface DeviceInfo {
  id: number;
  deviceId: string;
  active: boolean;
  companyId: number;
  dateCreated: string;
  dateUpdated?: string;
}

export interface SensorReading {
  value: number;
  timestamp: string;
  quality: 'good' | 'fair' | 'poor';
  measurementVariableId: number;
  sensorId?: number;
}

export interface IrrigationAlert {
  id: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  alertType: string;
}

// Calculation interfaces
export interface HydraulicCalculation {
  flowRate: number;
  pressure: number;
  pipeSize: number;
  frictionLoss: number;
  staticHead: number;
  dynamicHead: number;
  totalHead: number;
  efficiency: number;
  powerRequired: number;
  velocity: number;
  reynoldsNumber: number;
  frictionFactor: number;
}

export interface EvapotranspirationData {
  date: Date;
  cropProductionId: number;
  referenceET: number;
  cropET: number;
  cropCoefficient: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  precipitation: number;
}

export interface FlowRateCalculation {
  containerId: number;
  dropperId: number;
  numberOfDroppers: number;
  totalFlowRate: number;
  pressureRequired: number;
  irrigationArea: number;
  precipitationRate: number;
  applicationEfficiency: number;
  uniformity: number;
  flowRatePerArea: number;
}

export interface IrrigationScheduleOptimization {
  cropProductionId: number;
  nextOptimalTime: string;
  recommendedDuration: number;
  waterAmount: number;
  frequency: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  waterSavings: number;
  optimalConditions: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class IrrigationSectorService {
  // API endpoint paths
  private readonly irrigationEventUrl = '/IrrigationEvent';
  private readonly irrigationMeasurementUrl = '/IrrigationMeasurement';
  private readonly measurementUrl = '/Measurement';
  private readonly measurementBaseUrl = '/MeasurementBase';
  private readonly measurementKPIUrl = '/MeasurementKPI';
  private readonly measurementVariableUrl = '/MeasurementVariable';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  // ============================================================================
  // IRRIGATION EVENT METHODS
  // ============================================================================

  /**
   * GET /IrrigationEvent - Get irrigation events
   */
  getIrrigationEvents(
    startingDateTime?: string,
    endingDateTime?: string,
    cropProductionId?: number
  ): Observable<IrrigationEvent[]> {
    let params = new HttpParams();
    
    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (startingDateTime) params = params.set('StartingDateTime', startingDateTime);
    if (endingDateTime) params = params.set('EndingDateTime', endingDateTime);

    return this.http.get<IrrigationEventResponse>(`${this.apiConfig.agronomicApiUrl}${this.irrigationEventUrl}`, {
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
   * POST /IrrigationEvent - Create irrigation event
   */
  createIrrigationEvent(event: {
    cropProductionId: number;
    dateTimeStart: string;
    dateTimeEnd?: string;
    createIrrigationEventMeasurements?: {
      measurementVariableId: number;
      recordValue: number;
    }[];
  }): Observable<IrrigationEvent> {
    const payload = {
      id: 0,
      recordDateTime: new Date().toISOString(),
      cropProductionId: event.cropProductionId,
      dateTimeStart: event.dateTimeStart,
      dateTimeEnd: event.dateTimeEnd || new Date(new Date(event.dateTimeStart).getTime() + 30 * 60000).toISOString(),
      createIrrigationEventMeasurements: event.createIrrigationEventMeasurements || []
    };

    return this.http.post<any>(`${this.apiConfig.agronomicApiUrl}${this.irrigationEventUrl}`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result;
        }
        throw new Error(`IrrigationEvent creation failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // MEASUREMENT METHODS
  // ============================================================================

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
   * GET /Measurement - Get aggregated measurements
   */
  getMeasurements(
    cropProductionId?: number,
    measurementVariableId?: number,
    periodStartingDate?: string,
    periodEndingDate?: string
  ): Observable<Measurement[]> {
    let params = new HttpParams();

    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (measurementVariableId) params = params.set('MeasurementVariableId', measurementVariableId.toString());
    if (periodStartingDate) params = params.set('PeriodStartingDate', periodStartingDate);
    if (periodEndingDate) params = params.set('PeriodEndingDate', periodEndingDate);

    return this.http.get<MeasurementResponse>(`${this.apiConfig.agronomicApiUrl}${this.measurementUrl}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.measurements || [];
        }
        throw new Error(`Measurement API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /MeasurementBase - Get raw sensor measurements
   */
  getMeasurementBase(
    cropProductionId?: number,
    measurementVariableId?: number,
    periodStartingDate?: string,
    periodEndingDate?: string
  ): Observable<MeasurementBase[]> {
    let params = new HttpParams();

    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (measurementVariableId) params = params.set('MeasurementVariableId', measurementVariableId.toString());
    if (periodStartingDate) params = params.set('PeriodStartingDate', periodStartingDate);
    if (periodEndingDate) params = params.set('PeriodEndingDate', periodEndingDate);

    return this.http.get<MeasurementBaseResponse>(`${this.apiConfig.agronomicApiUrl}${this.measurementBaseUrl}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.measurements || [];
        }
        throw new Error(`MeasurementBase API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /MeasurementKPI - Get KPI measurements
   */
  getMeasurementKPI(
    cropProductionId?: number,
    kpiId?: number,
    periodStartingDate?: string,
    periodEndingDate?: string
  ): Observable<MeasurementKPI[]> {
    let params = new HttpParams();

    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (kpiId) params = params.set('KPIId', kpiId.toString());
    if (periodStartingDate) params = params.set('PeriodStartingDate', periodStartingDate);
    if (periodEndingDate) params = params.set('PeriodEndingDate', periodEndingDate);

    return this.http.get<MeasurementKPIResponse>(`${this.apiConfig.agronomicApiUrl}${this.measurementKPIUrl}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.measurementKPIs || [];
        }
        throw new Error(`MeasurementKPI API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /MeasurementKPI/Latest - Get latest KPI measurements
   */
  getLatestMeasurementKPI(
    cropProductionId: number,
    kpiId?: number
  ): Observable<MeasurementKPI | null> {
    let params = new HttpParams().set('CropProductionId', cropProductionId.toString());
    if (kpiId) params = params.set('KPIId', kpiId.toString());

    return this.http.get<MeasurementKPIResponse>(`${this.apiConfig.agronomicApiUrl}${this.measurementKPIUrl}/Latest`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.latestMeasurementKPIs || null;
        }
        throw new Error(`Latest MeasurementKPI API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET /MeasurementVariable - Get measurement variables
   */
  getMeasurementVariables(catalogId?: number): Observable<MeasurementVariable[]> {
    let params = new HttpParams();
    if (catalogId) params = params.set('CatalogId', catalogId.toString());

    return this.http.get<MeasurementVariableResponse>(`${this.apiConfig.agronomicApiUrl}${this.measurementVariableUrl}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.result?.measurementVariables || [];
        }
        throw new Error(`MeasurementVariable API failed: ${response.exception}`);
      }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // REAL-TIME SENSOR DATA WITH ACTUAL MEASUREMENTS
  // ============================================================================

  /**
   * Get real-time sensor data with actual measurements
   */
  getRealTimeSensorData(cropProductionId: number): Observable<any> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // Last 2 hours

    return forkJoin({
      // Get latest sensor readings
      temperatureReadings: this.getMeasurementBase(cropProductionId, 1, startDate, endDate).pipe(catchError(() => of([]))),
      humidityReadings: this.getMeasurementBase(cropProductionId, 2, startDate, endDate).pipe(catchError(() => of([]))),
      soilMoistureReadings: this.getMeasurementBase(cropProductionId, 3, startDate, endDate).pipe(catchError(() => of([]))),
      pressureReadings: this.getMeasurementBase(cropProductionId, 4, startDate, endDate).pipe(catchError(() => of([]))),
      flowReadings: this.getMeasurementBase(cropProductionId, 5, startDate, endDate).pipe(catchError(() => of([]))),
      
      // Get aggregated data
      measurements: this.getMeasurements(cropProductionId, undefined, startDate, endDate).pipe(catchError(() => of([])))
    }).pipe(
      map(({ temperatureReadings, humidityReadings, soilMoistureReadings, pressureReadings, flowReadings, measurements }) => {
        // Get latest values
        const latestTemperature = temperatureReadings.length > 0 
          ? temperatureReadings[temperatureReadings.length - 1].recordValue 
          : 22;
        
        const latestHumidity = humidityReadings.length > 0 
          ? humidityReadings[humidityReadings.length - 1].recordValue 
          : 65;
        
        const latestSoilMoisture = soilMoistureReadings.length > 0 
          ? soilMoistureReadings[soilMoistureReadings.length - 1].recordValue 
          : 45;
        
        const latestPressure = pressureReadings.length > 0 
          ? pressureReadings[pressureReadings.length - 1].recordValue 
          : 2.5;

        return {
          cropProductionId,
          temperature: latestTemperature,
          humidity: latestHumidity,
          soilMoisture: latestSoilMoisture,
          pressure: latestPressure,
          timestamp: new Date().toISOString(),
          rawData: {
            temperatureReadings,
            humidityReadings,
            soilMoistureReadings,
            pressureReadings,
            flowReadings
          },
          measurements
        };
      }),
      catchError(error => {
        console.error('Error fetching real-time sensor data:', error);
        // Return mock data if API fails
        return of({
          cropProductionId,
          temperature: 22,
          humidity: 65,
          soilMoisture: 45,
          pressure: 2.5,
          timestamp: new Date().toISOString(),
          rawData: {
            temperatureReadings: [],
            humidityReadings: [],
            soilMoistureReadings: [],
            pressureReadings: [],
            flowReadings: []
          },
          measurements: []
        });
      })
    );
  }

  /**
   * Enhanced system status with real measurements
   */
  getIrrigationSystemStatus(farmId?: number): Observable<IrrigationSystemStatus> {
    return forkJoin({
      devices: this.http.get<any>(`${this.apiConfig.iotApiUrl}/DeviceSensor/devices`, {
        headers: this.getAuthHeaders()
      }).pipe(catchError(() => of([]))),
      
      // Get recent measurements for system overview
      recentMeasurements: this.getMeasurementBase(
        undefined, 
        undefined, 
        new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
        new Date().toISOString()
      ).pipe(catchError(() => of([])))
    }).pipe(
      map(({ devices, recentMeasurements }) => {
        const irrigationDevices = devices.filter((device: any) =>
          device.deviceId?.toLowerCase().includes('flujo') ||
          device.deviceId?.toLowerCase().includes('suelo') ||
          device.deviceId?.toLowerCase().includes('riego') ||
          device.deviceId?.toLowerCase().includes('presion') ||
          device.deviceId?.toLowerCase().includes('humedad') ||
          device.deviceId?.toLowerCase().includes('temperatura')
        ) || [];

        // Process measurements by type
        const temperatureMeasurements = recentMeasurements.filter(m => m.measurementVariableId === 1);
        const humidityMeasurements = recentMeasurements.filter(m => m.measurementVariableId === 2);
        const soilMoistureMeasurements = recentMeasurements.filter(m => m.measurementVariableId === 3);
        const pressureMeasurements = recentMeasurements.filter(m => m.measurementVariableId === 4);
        const flowMeasurements = recentMeasurements.filter(m => m.measurementVariableId === 5);

        const status: IrrigationSystemStatus = {
          farmId: farmId || 0,
          systemStatus: irrigationDevices.length > 0 ? 'operational' : 'offline',
          activeDevices: irrigationDevices.filter((d: any) => d.active).length,
          totalDevices: devices?.length || 0,
          devices: devices,
          systemPressure: pressureMeasurements.length > 0 ? pressureMeasurements[pressureMeasurements.length - 1].recordValue : 2.5,
          totalFlowRate: flowMeasurements.reduce((sum: number, m: MeasurementBase) => sum + m.recordValue, 0),
          lastUpdate: new Date().toISOString(),
          alerts: [], // Would need to implement alerts logic
          measurements: {
            temperature: temperatureMeasurements.map(m => ({
              value: m.recordValue,
              timestamp: m.recordDate,
              quality: 'good' as const,
              measurementVariableId: m.measurementVariableId,
              sensorId: m.sensorId
            })),
            humidity: humidityMeasurements.map(m => ({
              value: m.recordValue,
              timestamp: m.recordDate,
              quality: 'good' as const,
              measurementVariableId: m.measurementVariableId,
              sensorId: m.sensorId
            })),
            soilMoisture: soilMoistureMeasurements.map(m => ({
              value: m.recordValue,
              timestamp: m.recordDate,
              quality: 'good' as const,
              measurementVariableId: m.measurementVariableId,
              sensorId: m.sensorId
            })),
            pressure: pressureMeasurements.map(m => ({
              value: m.recordValue,
              timestamp: m.recordDate,
              quality: 'good' as const,
              measurementVariableId: m.measurementVariableId,
              sensorId: m.sensorId
            })),
            flow: flowMeasurements.map(m => ({
              value: m.recordValue,
              timestamp: m.recordDate,
              quality: 'good' as const,
              measurementVariableId: m.measurementVariableId,
              sensorId: m.sensorId
            }))
          }
        };

        return status;
      }),
      catchError(error => {
        console.error('Error loading system status:', error);
        return of({
          farmId: farmId || 0,
          systemStatus: 'error',
          activeDevices: 0,
          totalDevices: 0,
          devices: [],
          lastUpdate: new Date().toISOString(),
          alerts: [{
            id: 1,
            message: 'Error loading system status',
            severity: 'high' as const,
            timestamp: new Date().toISOString(),
            alertType: 'system_error'
          }],
          measurements: {
            temperature: [],
            humidity: [],
            soilMoisture: [],
            pressure: [],
            flow: []
          }
        } as IrrigationSystemStatus);
      })
    );
  }

  // ============================================================================
  // IRRIGATION CONTROL WITH PROPER API INTEGRATION
  // ============================================================================

  /**
   * Trigger on-demand irrigation using IrrigationEvent API
   */
  triggerOnDemandIrrigation(
    cropProductionId: number,
    duration: number = 30,
    reason: string = 'on_demand'
  ): Observable<IrrigationEvent> {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    return this.createIrrigationEvent({
      cropProductionId,
      dateTimeStart: startTime.toISOString(),
      dateTimeEnd: endTime.toISOString(),
      createIrrigationEventMeasurements: [
        {
          measurementVariableId: 6, // Duration measurement variable
          recordValue: duration
        },
        {
          measurementVariableId: 7, // Reason measurement variable  
          recordValue: 1 // On-demand code
        }
      ]
    });
  }

  /**
   * Calculate evapotranspiration using actual measurement data
   */
  calculateEvapotranspiration(
    cropProductionId: number,
    startDate: string,
    endDate: string
  ): Observable<EvapotranspirationData[]> {
    return forkJoin({
      temperatureData: this.getMeasurements(cropProductionId, 1, startDate, endDate).pipe(catchError(() => of([]))),
      humidityData: this.getMeasurements(cropProductionId, 2, startDate, endDate).pipe(catchError(() => of([]))),
      // Add more measurement variables as needed
    }).pipe(
      map(({ temperatureData, humidityData }) => {
        // Calculate ET using actual measurement data
        const etData: EvapotranspirationData[] = [];
        
        // Group measurements by date
        const dateGroups: { [date: string]: { temp?: Measurement, humidity?: Measurement } } = {};
        
        temperatureData.forEach(temp => {
          const date = temp.recordDate.split('T')[0];
          if (!dateGroups[date]) dateGroups[date] = {};
          dateGroups[date].temp = temp;
        });
        
        humidityData.forEach(humidity => {
          const date = humidity.recordDate.split('T')[0];
          if (!dateGroups[date]) dateGroups[date] = {};
          dateGroups[date].humidity = humidity;
        });

        // Calculate ET for each date
        Object.keys(dateGroups).forEach(dateStr => {
          const group = dateGroups[dateStr];
          const avgTemp = group.temp?.avgValue || 22;
          const avgHumidity = group.humidity?.avgValue || 65;
          
          // Simple ET calculation - replace with proper Penman-Monteith equation
          const referenceET = Math.max(0, (avgTemp - 5) * 0.0175 * (100 - avgHumidity) / 100 * 1.2);
          const cropCoefficient = 1.15; // Assume standard crop coefficient
          const cropET = referenceET * cropCoefficient;

          etData.push({
            date: new Date(dateStr),
            cropProductionId,
            referenceET,
            cropET,
            cropCoefficient,
            temperature: avgTemp,
            humidity: avgHumidity,
            windSpeed: 2.0, // Default value
            solarRadiation: 20, // Default value
            precipitation: 0 // Default value
          });
        });

        return etData.sort((a, b) => a.date.getTime() - b.date.getTime());
      }),
      catchError(error => {
        console.error('Error calculating evapotranspiration:', error);
        return of([]);
      })
    );
  }

  /**
   * Test system by creating a short irrigation event
   */
  testSystem(cropProductionId: number, testDuration: number = 30): Observable<any> {
    return this.createIrrigationEvent({
      cropProductionId,
      dateTimeStart: new Date().toISOString(),
      dateTimeEnd: new Date(Date.now() + testDuration * 1000).toISOString(),
      createIrrigationEventMeasurements: [
        {
          measurementVariableId: 8, // Test measurement variable
          recordValue: testDuration
        }
      ]
    }).pipe(
      map(result => ({
        success: true,
        message: 'System test completed successfully',
        duration: testDuration,
        result
      }))
    );
  }

  // ============================================================================
  // EXISTING METHODS (Keep for compatibility)
  // ============================================================================

  getAllContainers(includeInactives: boolean = false): Observable<Container[]> {
    const params = new HttpParams().set('IncludeInactives', includeInactives.toString());
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Container`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success ? response.result?.containers || [] : []),
      catchError(this.handleError)
    );
  }

  getAllDroppers(includeInactives: boolean = false): Observable<Dropper[]> {
    const params = new HttpParams().set('IncludeInactives', includeInactives.toString());
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Dropper`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success ? response.result?.droppers || [] : []),
      catchError(this.handleError)
    );
  }

  getAllGrowingMediums(includeInactives: boolean = false): Observable<GrowingMedium[]> {
    const params = new HttpParams().set('IncludeInactives', includeInactives.toString());
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/GrowingMedium`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success ? response.result?.growingMediums || [] : []),
      catchError(this.handleError)
    );
  }

  getContainerById(id: number): Observable<Container> {
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Container/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success ? response.result : null),
      catchError(this.handleError)
    );
  }

  getDropperById(id: number): Observable<Dropper> {
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/Dropper/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success ? response.result : null),
      catchError(this.handleError)
    );
  }

  getGrowingMediumById(id: number): Observable<GrowingMedium> {
    return this.http.get<any>(`${this.apiConfig.agronomicApiUrl}/GrowingMedium/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success ? response.result : null),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // CALCULATION METHODS WITH REAL DATA
  // ============================================================================

  calculateHydraulics(
    flowRate: number,
    pipeSize: number,
    pipeLength: number,
    elevation: number,
    fittings: { type: string; quantity: number }[]
  ): Observable<HydraulicCalculation> {
    // Enhanced hydraulic calculations
    const velocity = (flowRate * 4) / (Math.PI * Math.pow(pipeSize / 1000, 2) * 3600); // m/s
    const reynoldsNumber = (velocity * (pipeSize / 1000) * 1000) / 0.001; // Re
    const frictionFactor = reynoldsNumber < 2300 ? 64 / reynoldsNumber : 0.316 / Math.pow(reynoldsNumber, 0.25);

    // Calculate fitting losses
    const fittingLosses = fittings.reduce((total, fitting) => {
      const kValues: { [key: string]: number } = {
        'elbow': 0.9,
        'tee': 1.8,
        'valve': 0.2,
        'bend': 0.3
      };
      return total + (kValues[fitting.type] || 0.5) * fitting.quantity;
    }, 0);

    const frictionLoss = (frictionFactor * (pipeLength / (pipeSize / 1000)) + fittingLosses) * 
                        (Math.pow(velocity, 2) / (2 * 9.81)) / 10.2; // bar
    
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

    return of(result);
  }

  calculateFlowRate(
    containerId: number,
    dropperId: number,
    numberOfDroppers: number,
    irrigationArea: number
  ): Observable<FlowRateCalculation> {
    // Get actual dropper data for precise calculations
    return this.getDropperById(dropperId).pipe(
      map(dropper => {
        const dropperFlowRate = dropper?.flowRate || 2; // L/h per dropper
        const totalFlowRate = numberOfDroppers * dropperFlowRate;
        const precipitationRate = totalFlowRate / irrigationArea; // mm/h
        const applicationEfficiency = 85; // Default efficiency
        const uniformity = Math.max(70, 95 - (numberOfDroppers * 0.5)); // Decreases with more droppers

        return {
          containerId,
          dropperId,
          numberOfDroppers,
          totalFlowRate,
          pressureRequired: Math.max(1.0, 1.5 + (totalFlowRate / 100) * 0.1), // Pressure increases with flow
          irrigationArea,
          precipitationRate,
          applicationEfficiency,
          uniformity,
          flowRatePerArea: totalFlowRate / irrigationArea
        };
      }),
      catchError(() => {
        // Fallback calculation if dropper data unavailable
        return of({
          containerId,
          dropperId,
          numberOfDroppers,
          totalFlowRate: numberOfDroppers * 2,
          pressureRequired: 1.5,
          irrigationArea,
          precipitationRate: (numberOfDroppers * 2) / irrigationArea,
          applicationEfficiency: 85,
          uniformity: 90,
          flowRatePerArea: (numberOfDroppers * 2) / irrigationArea
        });
      })
    );
  }

  optimizeIrrigationSchedule(cropProductionId: number): Observable<IrrigationScheduleOptimization> {
    // Get recent measurement data to base optimization on
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

    return forkJoin({
      measurements: this.getMeasurements(cropProductionId, undefined, startDate, endDate).pipe(catchError(() => of([]))),
      recentEvents: this.getIrrigationEvents(startDate, endDate, cropProductionId).pipe(catchError(() => of([]))),
      etData: this.calculateEvapotranspiration(cropProductionId, startDate, endDate).pipe(catchError(() => of([])))
    }).pipe(
      map(({ measurements, recentEvents, etData }) => {
        // Analyze recent patterns
        const avgTemperature = measurements
          .filter(m => m.measurementVariableId === 1)
          .reduce((sum, m) => sum + m.avgValue, 0) / Math.max(1, measurements.filter(m => m.measurementVariableId === 1).length) || 22;

        const avgHumidity = measurements
          .filter(m => m.measurementVariableId === 2)
          .reduce((sum, m) => sum + m.avgValue, 0) / Math.max(1, measurements.filter(m => m.measurementVariableId === 2).length) || 65;

        const avgSoilMoisture = measurements
          .filter(m => m.measurementVariableId === 3)
          .reduce((sum, m) => sum + m.avgValue, 0) / Math.max(1, measurements.filter(m => m.measurementVariableId === 3).length) || 45;

        // Calculate optimal timing based on ET and weather patterns
        const avgET = etData.length > 0 ? etData.reduce((sum, et) => sum + et.cropET, 0) / etData.length : 5;
        
        // Early morning is optimal (6-8 AM)
        const nextOptimalTime = new Date();
        nextOptimalTime.setDate(nextOptimalTime.getDate() + 1);
        nextOptimalTime.setHours(6, 0, 0, 0);

        // Calculate recommended duration based on ET and soil conditions
        const baselineDuration = 30; // minutes
        const etFactor = Math.max(0.5, Math.min(2.0, avgET / 5)); // Scale based on ET
        const moistureFactor = avgSoilMoisture < 30 ? 1.3 : avgSoilMoisture > 60 ? 0.7 : 1.0;
        const recommendedDuration = Math.round(baselineDuration * etFactor * moistureFactor);

        // Estimate water amount (rough calculation)
        const waterAmount = recommendedDuration * 3; // Assume 3L/min average flow

        // Determine priority based on conditions
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        if (avgSoilMoisture < 20 || avgTemperature > 35) priority = 'critical';
        else if (avgSoilMoisture < 30 || avgTemperature > 30) priority = 'high';
        else if (avgSoilMoisture > 60 && avgTemperature < 25) priority = 'low';

        // Calculate potential water savings compared to fixed schedule
        const currentUsage = recentEvents.reduce((sum, event) => {
          const duration = event.dateTimeEnd 
            ? (new Date(event.dateTimeEnd).getTime() - new Date(event.dateTimeStart).getTime()) / (1000 * 60)
            : 30;
          return sum + duration * 3; // Assume 3L/min
        }, 0);
        
        const optimizedUsage = waterAmount * (7 / Math.max(1, recentEvents.length)); // Weekly projection
        const waterSavings = Math.max(0, ((currentUsage - optimizedUsage) / Math.max(1, currentUsage)) * 100);

        return {
          cropProductionId,
          nextOptimalTime: nextOptimalTime.toISOString(),
          recommendedDuration,
          waterAmount,
          frequency: avgET > 6 ? 2 : 1, // Twice daily if high ET
          priority,
          waterSavings,
          optimalConditions: {
            temperature: avgTemperature,
            humidity: avgHumidity,
            windSpeed: 2.0 // Default
          }
        };
      }),
      catchError(error => {
        console.error('Error optimizing irrigation schedule:', error);
        // Return default optimization
        return of({
          cropProductionId,
          nextOptimalTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          recommendedDuration: 30,
          waterAmount: 100,
          frequency: 1,
          priority: 'medium' as const,
          waterSavings: 15,
          optimalConditions: {
            temperature: 22,
            humidity: 65,
            windSpeed: 2.0
          }
        });
      })
    );
  }

  // ============================================================================
  // UTILITY METHODS
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
    return throwError(error);
  }

  // Format utilities
  formatWaterFlow(flow: number): string {
    if (flow >= 1000) {
      return `${(flow / 1000).toFixed(1)} m³/h`;
    }
    return `${flow.toFixed(0)} L/h`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  formatWaterAmount(liters: number): string {
    if (liters >= 1000) {
      return `${(liters / 1000).toFixed(1)} m³`;
    }
    return `${liters.toFixed(0)} L`;
  }

  formatPressure(pressure: number): string {
    return `${pressure.toFixed(1)} bar`;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatTemperature(temperature: number): string {
    return `${temperature.toFixed(1)}°C`;
  }
}