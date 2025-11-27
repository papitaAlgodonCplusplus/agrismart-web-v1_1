// src/app/features/services/irrigation-sector.service.ts - UPDATED WITH PROPER API INTEGRATION
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, combineLatest, forkJoin, interval, of, throwError } from 'rxjs';
import { map, catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';
import { environment } from '../../../environments/environment';

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


export interface AggregatedDeviceData {
  timestamp: Date;
  deviceId: string;
  sensor: string;
  value: number;
  minValue?: number;
  maxValue?: number;
  dataPointCount: number;
}

export interface AggregatedDataResponse {
  aggregatedData: AggregatedDeviceData[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  aggregationInterval: string;
  aggregationType: string;
}

export interface DeviceRawDataParams {
  deviceId?: string;
  startDate?: Date;
  endDate?: Date;
  sensor?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AggregatedDataParams extends DeviceRawDataParams {
  aggregationInterval?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  aggregationType?: 'avg' | 'min' | 'max' | 'sum' | 'count';
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
  devices: ProcessedDeviceData[];
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


// ============================================================================
// INTERFACES FOR NEW IoT API INTEGRATION
// ============================================================================

export interface DeviceRawDataResponse {
  success: boolean;
  exception: string | null;
  deviceRawData: DeviceRawDataItem[];
  result: {
    deviceRawData: DeviceRawDataItem[];
  };
}

export interface DeviceRawDataItem {
  id: number;
  recordDate: string;
  clientId: string;
  userId: string;
  deviceId: string;
  sensor: string;
  payload: string;
}

export interface IoTDeviceResponse {
  id: number;
  companyId: number;
  deviceId: string;
  active: boolean;
  sensors: any[];
  dateCreated: string;
  dateUpdated?: string;
  createdBy: number;
  updatedBy?: number;
}

export interface AgronomicDeviceResponse {
  success: boolean;
  devices: IoTDeviceResponse[];
  exception: string | null;
  result: {
    devices: IoTDeviceResponse[];
  };
}

export interface CropProductionDeviceResponse {
  success: boolean;
  exception: string | null;
  cropProductionDevices: CropProductionDevice[];
  result: {
    cropProductionDevices: CropProductionDevice[];
  };
}

export interface CropProductionDevice {
  cropProductionId: number;
  deviceId: number;
  startDate: string;
  active: boolean;
  dateCreated: string;
  dateUpdated?: string;
  createdBy: number;
  updatedBy?: number;
}

// ============================================================================
// ENHANCED INTERFACES FOR REAL-TIME DATA PROCESSING
// ============================================================================

export interface ProcessedDeviceData {
  deviceId: string;
  companyId: number;
  active: boolean;
  lastReading: Date;
  sensorReadings: {
    [sensorName: string]: {
      value: number | string;
      timestamp: Date;
      quality: 'good' | 'fair' | 'poor';
    };
  };
  cropProductionIds: number[];
}

export interface ClimateReading {
  deviceId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  windDirection?: number;
  solarRadiation?: number;
  precipitation?: number;
  timestamp: Date;
}

export interface SoilReading {
  deviceId: string;
  ph?: number;
  moisture?: number;
  temperature?: number;
  conductivity?: number;
  timestamp: Date;
}

export interface FlowReading {
  deviceId: string;
  totalPulse?: number;
  waterFlowValue?: number;
  waterAmount?: number;
  timestamp: Date;
}

// ============================================================================
// EXISTING INTERFACES (MAINTAINED FOR COMPATIBILITY)
// ============================================================================

export interface IrrigationEventResponse {
  success: boolean;
  irrigationEvents: IrrigationEvent[];
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
  irrigationMeasurements: IrrigationMeasurement[];
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
  measurements: Measurement[];
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
  measurements: MeasurementBase[];
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

export interface IrrigationSystemStatus {
  farmId: number;
  systemStatus: string;
  devices: ProcessedDeviceData[];
  activeDevices: number;
  totalDevices: number;
  systemPressure?: number;
  totalFlowRate?: number;
  lastUpdate: string;
  alerts: IrrigationAlert[];
  climateReadings: ClimateReading[];
  soilReadings: SoilReading[];
  flowReadings: FlowReading[];
}

export interface IrrigationAlert {
  id: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  alertType: string;
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
  private apiUrl = `${environment.iotApiUrl}/DeviceRawData`;

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) { }

  // ============================================================================
  // IRRIGATION EVENT METHODS
  // ============================================================================


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
      measurements: this.getMeasurements(cropProductionId.toString(), undefined, startDate, endDate).pipe(catchError(() => of([])))
    }).pipe(
      map(({ temperatureReadings, humidityReadings, soilMoistureReadings, pressureReadings, flowReadings, measurements }) => {
        // Get latest values
        const latestTemperature = temperatureReadings.length > 0
          ? temperatureReadings[temperatureReadings.length - 1].recordValue
          : 0;

        const latestHumidity = humidityReadings.length > 0
          ? humidityReadings[humidityReadings.length - 1].recordValue
          : 0;

        const latestSoilMoisture = soilMoistureReadings.length > 0
          ? soilMoistureReadings[soilMoistureReadings.length - 1].recordValue
          : 0;

        const latestPressure = pressureReadings.length > 0
          ? pressureReadings[pressureReadings.length - 1].recordValue
          : 0;

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
      })
    );
  }

  getSystemStatus(farmId?: number): Observable<IrrigationSystemStatus> {
    return this.getIrrigationSystemStatus(farmId);
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
        const dateGroups: { [date: string]: { temp?: Measurement, humidity?: Measurement, windSpeed?: Measurement, solarRadiation?: Measurement, precipitation?: Measurement } } = {};

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
          const avgWindSpeed = group.windSpeed?.avgValue || 2.0;
          const avgSolarRadiation = group.solarRadiation?.avgValue || 20;
          const avgPrecipitation = group.precipitation?.avgValue || 0;

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
            windSpeed: avgWindSpeed,
            solarRadiation: avgSolarRadiation,
            precipitation: avgPrecipitation
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
        return throwError(error);
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


  // ============================================================================
  // NEW IoT API METHODS FOR REAL-TIME DEVICE DATA
  // ============================================================================

  getDeviceRawDataHour(
    deviceId?: string,
    startDate?: string,
    endDate?: string,
    sensor?: string,
    pageNumber?: number,
    pageSize?: number
  ): Observable<any[]> {
    let params = new HttpParams();

    if (deviceId) params = params.set('DeviceId', deviceId);
    if (startDate) params = params.set('StartDate', startDate);
    if (endDate) params = params.set('EndDate', endDate);
    if (sensor) params = params.set('Sensor', sensor);
    if (pageNumber) params = params.set('PageNumber', pageNumber);
    if (pageSize) params = params.set('PageSize', pageSize);
    console.log('Fetching device raw data hour with params:', params.toString());
    return this.apiService.getIot<any>('/DeviceRawData/hour', params).pipe(
      map(response => {
        const items: any[] = response.deviceRawDataHour || [];
        return items.map(item => {
          if (item && item.payload_Avg !== undefined) {
            item.payload = item.payload_Avg;
            delete item.payload_Avg;
          }
          return item;
        });
      }),
      catchError(error => {
        console.error('Error fetching device raw data hour:', error);
        return of([]);
      })
    );
  }

  /**
   * Get raw device data from IoT API
   * This is the PRIMARY method for fetching real sensor data
   */
  getDeviceRawData(
    deviceId?: string,
    startDate?: string,
    endDate?: string,
    sensor?: string,
    pageNumber?: number,
    pageSize?: number
  ): Observable<any[]> {
    let params = new HttpParams();

    if (deviceId) params = params.set('DeviceId', deviceId);
    if (startDate) params = params.set('StartDate', startDate);
    if (endDate) params = params.set('EndDate', endDate);
    if (sensor) params = params.set('Sensor', sensor);
    if (pageNumber) params = params.set('PageNumber', pageNumber.toString());
    if (pageSize) params = params.set('PageSize', pageSize.toString());

    return this.apiService.getIot<DeviceRawDataResponse>('/DeviceRawData', params).pipe(
      map(response => response.deviceRawData || []),
      catchError(error => {
        console.error('Error fetching device raw data:', error);
        return of([]);
      })
    );
  }

  /**
   * Get devices from IoT DeviceSensor API 
   */
  getIoTDevices(): Observable<IoTDeviceResponse[]> {
    return this.apiService.getIot<IoTDeviceResponse[]>('/DeviceSensor/devices').pipe(
      catchError(error => {
        console.error('Error fetching IoT devices:', error);
        return of([]);
      })
    );
  }

  /**
   * Get devices from Agronomic API (for device metadata and configuration)
   */
  getAgronomicDevices(
    clientId?: number,
    companyId?: number,
    cropProductionId?: number,
    includeInactives?: boolean
  ): Observable<IoTDeviceResponse[]> {
    let params = new HttpParams();

    if (clientId) params = params.set('ClientId', clientId.toString());
    if (companyId) params = params.set('CompanyId', companyId.toString());
    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (includeInactives !== undefined) params = params.set('IncludeInactives', includeInactives.toString());

    return this.apiService.get<AgronomicDeviceResponse>('/Device', params).pipe(
      map(response => response.devices || []),
      catchError(error => {
        console.error('Error fetching agronomic devices:', error);
        return of([]);
      })
    );
  }

  /**
   * Get crop production device mappings
   */
  getCropProductionDevices(cropProductionId?: number): Observable<CropProductionDevice[]> {
    let params = new HttpParams();
    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());

    return this.apiService.get<CropProductionDeviceResponse>('/CropProductionDevice', params).pipe(
      map(response => response.cropProductionDevices || []),
      catchError(error => {
        console.error('Error fetching crop production devices:', error);
        return of([]);
      })
    );
  }

  // ============================================================================
  // ENHANCED SYSTEM STATUS WITH REAL IoT DATA
  // ============================================================================

  /**
   * Get comprehensive irrigation system status with real IoT data
   */
  getIrrigationSystemStatus(
    farmId: number | undefined,
    cropProductionId?: number
  ): Observable<any> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return combineLatest([
      this.getAgronomicDevices(undefined, undefined, cropProductionId),
      this.getCropProductionDevices(cropProductionId),
      this.getDeviceRawData(
        undefined,
        undefined,
        undefined,
        undefined,
        1,
        1000
      )
    ]).pipe(
      map(([devices, cropDevices, rawData]) => {
        const processedDevices = this.processDeviceData(devices, cropDevices, rawData);
        const readings = this.categorizeReadings(rawData);

        return {
          farmId,
          systemStatus: this.calculateSystemStatus(processedDevices),
          devices: processedDevices,
          activeDevices: processedDevices.filter(d => d.active).length,
          totalDevices: processedDevices.length,
          systemPressure: this.calculateAveragePressure(readings.soilReadings),
          totalFlowRate: this.calculateTotalFlow(readings.flowReadings),
          lastUpdate: now.toISOString(),
          alerts: this.generateAlerts(processedDevices, readings),
          climateReadings: readings.climateReadings,
          soilReadings: readings.soilReadings,
          flowReadings: readings.flowReadings,
          measurements: {
            temperature: [],
            humidity: [],
            soilMoisture: [],
            pressure: [],
            flow: []
          },
          rawData: rawData
        };
      }),
      catchError(error => {
        console.error('Error getting irrigation system status:', error);
        const defaultStatus = this.getDefaultSystemStatus(farmId);
        // Add empty measurements property to match IrrigationSystemStatus interface
        return of({
          ...defaultStatus,
          measurements: {
            temperature: [],
            humidity: [],
            soilMoisture: [],
            pressure: [],
            flow: []
          }
        });
      })
    );
  }

  /**
   * Get latest climate data for a specific crop production
   */
  getLatestClimateData(cropProductionId: number): Observable<ClimateReading | null> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return combineLatest([
      this.getCropProductionDevices(cropProductionId),
      this.getAgronomicDevices(undefined, undefined, cropProductionId)
    ]).pipe(
      switchMap(([cropDevices, devices]) => {
        const activeDeviceIds = cropDevices
          .filter(cd => cd.active)
          .map(cd => {
            const device = devices.find(d => d.id === cd.deviceId);
            return device?.deviceId;
          })

        if (activeDeviceIds.length === 0) {
          console.error('No active climate devices found for crop production ID:', cropProductionId);
          return of(null);
        }

        // Get latest data for climate devices
        const promises = activeDeviceIds.map(deviceId =>
          this.getDeviceRawData(
            deviceId,
            oneHourAgo.toISOString(),
            now.toISOString(),
            undefined,
            1,
            100
          )
        );

        return combineLatest(promises).pipe(
          map(deviceDataArrays => {
            const allData = deviceDataArrays.flat();
            return this.extractLatestClimateReading(allData);
          })
        );
      }),
      catchError(error => {
        console.error('Error getting latest climate data:', error);
        return of(null);
      })
    );
  }

  /**
   * Get latest soil data for a specific crop production
   */
  getLatestSoilData(cropProductionId: number): Observable<SoilReading[]> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return combineLatest([
      this.getCropProductionDevices(cropProductionId),
      this.getAgronomicDevices(undefined, undefined, cropProductionId)
    ]).pipe(
      switchMap(([cropDevices, devices]) => {
        const activeDeviceIds = cropDevices
          .filter(cd => cd.active)
          .map(cd => {
            const device = devices.find(d => d.id === cd.deviceId);
            return device?.deviceId;
          })
          .filter(id => id && (id.includes('ph-suelo') || id.includes('suelo'))); // Soil devices

        if (activeDeviceIds.length === 0) {
          return of([]);
        }

        // Filter out undefined device IDs to ensure type safety
        const filteredDeviceIds = activeDeviceIds.filter((id): id is string => typeof id === 'string');

        const promises = filteredDeviceIds.map(deviceId =>
          this.getDeviceRawData(
            deviceId,
            oneHourAgo.toISOString(),
            now.toISOString(),
            undefined,
            1,
            100
          )
        );

        return combineLatest(promises).pipe(
          map(deviceDataArrays => {
            return deviceDataArrays.map((data, index) =>
              this.extractLatestSoilReading(data, filteredDeviceIds[index])
            ).filter(reading => reading !== null) as SoilReading[];
          })
        );
      }),
      catchError(error => {
        console.error('Error getting latest soil data:', error);
        return of([]);
      })
    );
  }

  /**
   * Get latest flow data for a specific crop production
   */
  getLatestFlowData(cropProductionId: number): Observable<FlowReading[]> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return combineLatest([
      this.getCropProductionDevices(cropProductionId),
      this.getAgronomicDevices(undefined, undefined, cropProductionId)
    ]).pipe(
      switchMap(([cropDevices, devices]) => {
        const activeDeviceIds = cropDevices
          .filter(cd => cd.active)
          .map(cd => {
            const device = devices.find(d => d.id === cd.deviceId);
            return device?.deviceId;
          })
          .filter(id => id && id.includes('flujo')); // Flow devices

        if (activeDeviceIds.length === 0) {
          return of([]);
        }

        // Filter out undefined device IDs to ensure type safety
        const filteredDeviceIds = activeDeviceIds.filter((id): id is string => typeof id === 'string');

        const promises = filteredDeviceIds.map(deviceId =>
          this.getDeviceRawData(
            deviceId,
            oneHourAgo.toISOString(),
            now.toISOString(),
            undefined,
            1,
            100
          )
        );

        return combineLatest(promises).pipe(
          map(deviceDataArrays => {
            return deviceDataArrays.map((data, index) =>
              this.extractLatestFlowReading(data, filteredDeviceIds[index])
            ).filter(reading => reading !== null) as FlowReading[];
          })
        );
      }),
      catchError(error => {
        console.error('Error getting latest flow data:', error);
        return of([]);
      })
    );
  }

  // ============================================================================
  // DATA PROCESSING METHODS
  // ============================================================================

  private processDeviceData(
    devices: IoTDeviceResponse[],
    cropDevices: CropProductionDevice[],
    rawData: DeviceRawDataItem[]
  ): any[] {
    return devices.map(device => {
      const deviceRawData = rawData.filter(rd => rd.deviceId === device.deviceId);
      const latestReading = deviceRawData.length > 0
        ? new Date(Math.max(...deviceRawData.map(rd => new Date(rd.recordDate).getTime())))
        : new Date();

      const sensorReadings: { [key: string]: any } = {};

      // Group by sensor and get latest reading
      const sensorGroups = deviceRawData.reduce((acc, curr) => {
        if (!acc[curr.sensor]) {
          acc[curr.sensor] = [];
        }
        acc[curr.sensor].push(curr);
        return acc;
      }, {} as { [key: string]: DeviceRawDataItem[] });

      Object.keys(sensorGroups).forEach(sensorName => {
        const readings = sensorGroups[sensorName];
        const latest = readings.sort((a, b) =>
          new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
        )[0];

        if (latest) {
          const numericValue = parseFloat(latest.payload);
          sensorReadings[sensorName] = {
            value: isNaN(numericValue) ? latest.payload : numericValue,
            timestamp: new Date(latest.recordDate),
            quality: this.assessDataQuality(latest, latestReading)
          };
        }
      });

      const cropProductionIds = cropDevices
        .filter(cd => cd.deviceId === device.id && cd.active)
        .map(cd => cd.cropProductionId);

      return {
        deviceId: device.deviceId,
        companyId: device.companyId,
        active: device.active,
        latestReading,
        sensorReadings,
        cropProductionIds
      };
    });
  }

  private categorizeReadings(rawData: DeviceRawDataItem[]): {
    climateReadings: ClimateReading[];
    soilReadings: SoilReading[];
    flowReadings: FlowReading[];
  } {
    const climateReadings: ClimateReading[] = [];
    const soilReadings: SoilReading[] = [];
    const flowReadings: FlowReading[] = [];

    // Group by device and timestamp
    const deviceGroups = rawData.reduce((acc, curr) => {
      const key = `${curr.deviceId}-${curr.recordDate}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    }, {} as { [key: string]: DeviceRawDataItem[] });

    Object.values(deviceGroups).forEach(group => {
      if (group.length === 0) return;

      const deviceId = group[0].deviceId;
      const timestamp = new Date(group[0].recordDate);

      if (deviceId.includes('metereologica')) {
        climateReadings.push(this.extractClimateReading(group, deviceId, timestamp));
      } else if (deviceId.includes('ph-suelo') || deviceId.includes('suelo')) {
        const soilReading = this.extractSoilReading(group, deviceId, timestamp);
        if (soilReading) soilReadings.push(soilReading);
      } else if (deviceId.includes('flujo')) {
        const flowReading = this.extractFlowReading(group, deviceId, timestamp);
        if (flowReading) flowReadings.push(flowReading);
      }
    });

    return { climateReadings, soilReadings, flowReadings };
  }

  private extractClimateReading(
    group: DeviceRawDataItem[],
    deviceId: string,
    timestamp: Date
  ): ClimateReading {
    const reading: ClimateReading = { deviceId, timestamp };

    group.forEach(item => {
      const value = parseFloat(item.payload);
      if (isNaN(value)) return;

      switch (item.sensor.toLowerCase()) {
        case 'temp':
        case 'temperature':
          reading.temperature = value;
          break;
        case 'hum':
        case 'humidity':
          reading.humidity = value;
          break;
        case 'pressure':
        case 'presion':
          reading.pressure = value;
          break;
        case 'wind_speed':
        case 'windspeed':
          reading.windSpeed = value;
          break;
        case 'wind_direction':
        case 'winddirection':
          reading.windDirection = value;
          break;
        case 'par':
        case 'solar_radiation':
          reading.solarRadiation = value;
          break;
        case 'precipitation':
        case 'lluvia':
          reading.precipitation = value;
          break;
      }
    });

    return reading;
  }

  private extractSoilReading(
    group: DeviceRawDataItem[],
    deviceId: string,
    timestamp: Date
  ): SoilReading | null {
    const reading: SoilReading = { deviceId, timestamp };
    let hasValidData = false;

    group.forEach(item => {
      const value = parseFloat(item.payload);
      if (isNaN(value)) return;

      switch (item.sensor.toLowerCase()) {
        case 'ph1_soil':
        case 'ph_soil':
        case 'ph':
          reading.ph = value;
          hasValidData = true;
          break;
        case 'temp_soil':
        case 'soil_temperature':
          reading.temperature = value;
          hasValidData = true;
          break;
        case 'moisture':
        case 'soil_moisture':
          reading.moisture = value;
          hasValidData = true;
          break;
        case 'conductivity':
        case 'ec':
          reading.conductivity = value;
          hasValidData = true;
          break;
      }
    });

    return hasValidData ? reading : null;
  }

  private extractFlowReading(
    group: DeviceRawDataItem[],
    deviceId: string,
    timestamp: Date
  ): FlowReading | null {
    const reading: FlowReading = { deviceId, timestamp };
    let hasValidData = false;

    group.forEach(item => {
      const value = parseFloat(item.payload);
      if (isNaN(value)) return;

      switch (item.sensor.toLowerCase()) {
        case 'total_pulse':
          reading.totalPulse = value;
          hasValidData = true;
          break;
        case 'water_flow_value':
          reading.waterFlowValue = value;
          hasValidData = true;
          break;
        case 'water_amount':
          reading.waterAmount = value;
          hasValidData = true;
          break;
      }
    });

    return hasValidData ? reading : null;
  }

  private extractLatestClimateReading(rawData: DeviceRawDataItem[]): ClimateReading | null {
    if (rawData.length === 0) return null;

    // Sort by timestamp and get the latest group
    const sorted = rawData.sort((a, b) =>
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    );

    const latest = sorted[0];
    const latestGroup = rawData.filter(item =>
      item.recordDate === latest.recordDate && item.deviceId === latest.deviceId
    );

    return this.extractClimateReading(latestGroup, latest.deviceId, new Date(latest.recordDate));
  }

  private extractLatestSoilReading(rawData: DeviceRawDataItem[], deviceId: string): SoilReading | null {
    if (rawData.length === 0) return null;

    const sorted = rawData.sort((a, b) =>
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    );

    const latest = sorted[0];
    const latestGroup = rawData.filter(item =>
      item.recordDate === latest.recordDate
    );

    return this.extractSoilReading(latestGroup, deviceId, new Date(latest.recordDate));
  }

  private extractLatestFlowReading(rawData: DeviceRawDataItem[], deviceId: string): FlowReading | null {
    if (rawData.length === 0) return null;

    const sorted = rawData.sort((a, b) =>
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    );

    const latest = sorted[0];
    const latestGroup = rawData.filter(item =>
      item.recordDate === latest.recordDate
    );

    return this.extractFlowReading(latestGroup, deviceId, new Date(latest.recordDate));
  }

  private assessDataQuality(
    reading: DeviceRawDataItem,
    latestReading: Date
  ): 'good' | 'fair' | 'poor' {
    const readingTime = new Date(reading.recordDate);
    const timeDiff = latestReading.getTime() - readingTime.getTime();
    const hoursOld = timeDiff / (1000 * 60 * 60);

    if (hoursOld <= 1) return 'good';
    if (hoursOld <= 6) return 'fair';
    return 'poor';
  }

  private calculateSystemStatus(devices: ProcessedDeviceData[]): string {
    const activeDevices = devices.filter(d => d.active).length;
    const totalDevices = devices.length;

    if (totalDevices === 0) return 'No devices';
    if (activeDevices === totalDevices) return 'All systems operational';
    if (activeDevices > totalDevices * 0.8) return 'Mostly operational';
    if (activeDevices > totalDevices * 0.5) return 'Partial operation';
    return 'System issues detected';
  }

  private calculateAveragePressure(soilReadings: SoilReading[]): number | undefined {
    const pressureReadings = soilReadings
      .map(r => r.conductivity)
      .filter(p => p !== undefined) as number[];

    if (pressureReadings.length === 0) return undefined;

    return pressureReadings.reduce((sum, p) => sum + p, 0) / pressureReadings.length;
  }

  private calculateTotalFlow(flowReadings: FlowReading[]): number | undefined {
    const flowValues = flowReadings
      .map(r => r.waterFlowValue)
      .filter(f => f !== undefined) as number[];

    if (flowValues.length === 0) return undefined;

    return flowValues.reduce((sum, f) => sum + f, 0);
  }

  private generateAlerts(
    devices: ProcessedDeviceData[],
    readings: { climateReadings: ClimateReading[]; soilReadings: SoilReading[]; flowReadings: FlowReading[] }
  ): IrrigationAlert[] {
    const alerts: IrrigationAlert[] = [];
    const now = new Date();

    // Check for offline devices
    devices.forEach(device => {
      const hoursOffline = device.lastReading ? (now.getTime() - device.lastReading.getTime()) / (1000 * 60 * 60) : Number.POSITIVE_INFINITY;
      if (hoursOffline > 2 && device.active) {
        alerts.push({
          id: Math.random(),
          message: `Device ${device.deviceId} has been offline for ${hoursOffline.toFixed(1)} hours`,
          severity: hoursOffline > 12 ? 'high' : 'medium',
          timestamp: now.toISOString(),
          alertType: 'device_offline'
        });
      }
    });

    // Check climate conditions
    readings.climateReadings.forEach(reading => {
      if (reading.temperature && (reading.temperature > 35 || reading.temperature < 5)) {
        alerts.push({
          id: Math.random(),
          message: `Extreme temperature detected: ${reading.temperature}°C on device ${reading.deviceId}`,
          severity: 'high',
          timestamp: now.toISOString(),
          alertType: 'temperature_extreme'
        });
      }

      if (reading.humidity && reading.humidity > 90) {
        alerts.push({
          id: Math.random(),
          message: `High humidity detected: ${reading.humidity}% on device ${reading.deviceId}`,
          severity: 'medium',
          timestamp: now.toISOString(),
          alertType: 'humidity_high'
        });
      }
    });

    // Check soil conditions
    readings.soilReadings.forEach(reading => {
      if (reading.ph && (reading.ph < 5.5 || reading.ph > 8.5)) {
        alerts.push({
          id: Math.random(),
          message: `Soil pH out of range: ${reading.ph} on device ${reading.deviceId}`,
          severity: 'medium',
          timestamp: now.toISOString(),
          alertType: 'soil_ph_abnormal'
        });
      }
    });

    return alerts;
  }

  private getDefaultSystemStatus(farmId: number | undefined): any {
    return {
      farmId: farmId ?? 0,
      systemStatus: 'Unknown',
      devices: [],
      activeDevices: 0,
      totalDevices: 0,
      lastUpdate: new Date().toISOString(),
      alerts: [],
      climateReadings: [],
      soilReadings: [],
      flowReadings: []
    };
  }

  // ============================================================================
  // BACKWARD COMPATIBILITY METHODS (EXISTING API CALLS)
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
    if (startingDateTime) params = params.set('StartingDateTime', startingDateTime);
    if (endingDateTime) params = params.set('EndingDateTime', endingDateTime);
    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());

    return this.apiService.get<IrrigationEventResponse>(this.irrigationEventUrl, params).pipe(
      map(response => response.irrigationEvents || []),
      catchError(error => {
        console.error('Error fetching irrigation events:', error);
        return of([]);
      })
    );
  }

  /**
   * GET /IrrigationMeasurement - Get irrigation measurements
   */
  getIrrigationMeasurements(
    eventId?: number,
    measurementVariableId?: number
  ): Observable<IrrigationMeasurement[]> {
    let params = new HttpParams();
    if (eventId) params = params.set('EventId', eventId.toString());
    if (measurementVariableId) params = params.set('MeasurementVariableId', measurementVariableId.toString());

    return this.apiService.get<IrrigationMeasurementResponse>(this.irrigationMeasurementUrl, params).pipe(
      map(response => response.irrigationMeasurements || []),
      catchError(error => {
        console.error('Error fetching irrigation measurements:', error);
        return of([]);
      })
    );
  }

  /**
   * GET /Measurement - Get measurements
   */
  getMeasurements(
    cropProductionId: number | string,
    measurementVariableId?: number | string,
    startDate?: string | number,
    endDate?: string | number,
  ): Observable<Measurement[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('StartDate', startDate);
    if (endDate) params = params.set('EndDate', endDate);
    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (measurementVariableId) params = params.set('MeasurementVariableId', measurementVariableId.toString());

    return this.apiService.get<MeasurementResponse>(this.measurementUrl, params).pipe(
      map(response => response.measurements || []),
      catchError(error => {
        console.error('Error fetching measurements:', error);
        return of([]);
      })
    );
  }

  /**
   * GET /MeasurementBase - Get base measurements
   */
  getMeasurementBase(
    cropProductionId?: number,
    startDate?: string | number,
    endDate?: string | number,
    measurementVariableId?: number | string,
    sensorId?: number | string
  ): Observable<MeasurementBase[]> {
    let params = new HttpParams();
    if (cropProductionId) params = params.set('CropProductionId', cropProductionId.toString());
    if (startDate) params = params.set('StartDate', startDate);
    if (endDate) params = params.set('EndDate', endDate);
    if (measurementVariableId) params = params.set('MeasurementVariableId', measurementVariableId.toString());
    if (sensorId) params = params.set('SensorId', sensorId.toString());

    return this.apiService.get<MeasurementBaseResponse>(this.measurementBaseUrl, params).pipe(
      map(response => response.measurements || []),
      catchError(error => {
        console.error('Error fetching measurement base:', error);
        return of([]);
      })
    );
  }

  // ============================================================================
  // CONTAINER AND EQUIPMENT METHODS (UNCHANGED)
  // ============================================================================

  getContainers(): Observable<Container[]> {
    return this.apiService.get<{ containers: Container[] }>('/Container').pipe(
      map(response => response.containers || []),
      catchError(error => {
        console.error('Error fetching containers:', error);
        return of([]);
      })
    );
  }

  getDroppers(): Observable<Dropper[]> {
    return this.apiService.get<{ droppers: Dropper[] }>('/Dropper').pipe(
      map(response => response.droppers || []),
      catchError(error => {
        console.error('Error fetching droppers:', error);
        return of([]);
      })
    );
  }

  getGrowingMediums(): Observable<GrowingMedium[]> {
    return this.apiService.get<{ growingMediums: GrowingMedium[] }>('/GrowingMedium').pipe(
      map(response => response.growingMediums || []),
      catchError(error => {
        console.error('Error fetching growing mediums:', error);
        return of([]);
      })
    );
  }

  // ============================================================================
  // UTILITY METHODS FOR DATA TRANSFORMATION
  // ============================================================================

  /**
   * Transform raw device data into structured sensor readings
   */
  transformRawDataToReadings(rawData: DeviceRawDataItem[]): { [deviceId: string]: { [sensor: string]: any } } {
    const result: { [deviceId: string]: { [sensor: string]: any } } = {};

    rawData.forEach(item => {
      if (!result[item.deviceId]) {
        result[item.deviceId] = {};
      }

      const value = parseFloat(item.payload);
      result[item.deviceId][item.sensor] = {
        value: isNaN(value) ? item.payload : value,
        timestamp: new Date(item.recordDate),
        raw: item
      };
    });

    return result;
  }

  /**
   * Get device data summary for dashboard display
   */
  getDeviceDataSummary(cropProductionId: number): Observable<{
    climate: any | null;
    soil: any;
    flow: any;
    lastUpdate: Date;
  }> {
    return combineLatest([
      this.getLatestClimateData(cropProductionId),
      this.getLatestSoilData(cropProductionId),
      this.getLatestFlowData(cropProductionId)
    ]).pipe(
      map(([climate, soil, flow]) => ({
        climate,
        soil,
        flow,
        lastUpdate: new Date()
      })),
      catchError(error => {
        console.error('Error getting device data summary:', error);
        return of({
          climate: null,
          soil: [],
          flow: [],
          lastUpdate: new Date()
        });
      })
    );
  }

  /**
   * Get historical data for charting
   */
  getHistoricalData(
    cropProductionId: number,
    startDate: Date,
    endDate: Date,
    sensorTypes?: string[]
  ): Observable<{
    timeSeries: { timestamp: Date;[sensor: string]: any }[];
    devices: string[];
  }> {
    return combineLatest([
      this.getCropProductionDevices(cropProductionId),
      this.getAgronomicDevices(undefined, undefined, cropProductionId)
    ]).pipe(
      switchMap(([cropDevices, devices]) => {
        const activeDeviceIds = cropDevices
          .filter(cd => cd.active)
          .map(cd => {
            const device = devices.find(d => d.id === cd.deviceId);
            return device?.deviceId;
          })
          .filter(id => id) as string[];

        if (activeDeviceIds.length === 0) {
          return of({ timeSeries: [], devices: [] });
        }

        const promises = activeDeviceIds.map(deviceId =>
          this.getDeviceRawData(
            deviceId,
            startDate.toISOString(),
            endDate.toISOString(),
            undefined,
            1,
            10000
          )
        );

        return combineLatest(promises).pipe(
          map(deviceDataArrays => {
            const allData = deviceDataArrays.flat();

            // Filter by sensor types if specified
            const filteredData = sensorTypes
              ? allData.filter(item => sensorTypes.includes(item.sensor))
              : allData;

            // Group by timestamp
            const timeGroups: { [timestamp: string]: DeviceRawDataItem[] } = {};
            filteredData.forEach(item => {
              const timeKey = item.recordDate;
              if (!timeGroups[timeKey]) {
                timeGroups[timeKey] = [];
              }
              timeGroups[timeKey].push(item);
            });

            // Convert to time series format
            const timeSeries = Object.keys(timeGroups)
              .sort()
              .map(timeKey => {
                const timestamp = new Date(timeKey);
                const dataPoint: any = { timestamp };

                timeGroups[timeKey].forEach(item => {
                  const key = `${item.deviceId}_${item.sensor}`;
                  const value = parseFloat(item.payload);
                  dataPoint[key] = isNaN(value) ? item.payload : value;
                });

                return dataPoint;
              });

            return {
              timeSeries,
              devices: activeDeviceIds
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error getting historical data:', error);
        return of({ timeSeries: [], devices: [] });
      })
    );
  }


  /**
   * Get raw device data - USE SPARINGLY
   * Only use this for very recent data (last few hours) or specific debugging
   */
  getRawDeviceData(params: DeviceRawDataParams): Observable<any> {
    let httpParams = new HttpParams();

    if (params.deviceId) httpParams = httpParams.set('DeviceId', params.deviceId);
    if (params.startDate) httpParams = httpParams.set('StartDate', params.startDate.toISOString());
    if (params.endDate) httpParams = httpParams.set('EndDate', params.endDate.toISOString());
    if (params.sensor) httpParams = httpParams.set('Sensor', params.sensor);
    if (params.pageNumber) httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    if (params.pageSize) httpParams = httpParams.set('PageSize', params.pageSize.toString());

    return this.http.get(`${this.apiUrl}`, { params: httpParams });
  }

  /**
   * Get aggregated device data - RECOMMENDED
   * Use this for all time-series visualizations and historical data
   */
  getAggregatedDeviceData(params: AggregatedDataParams): Observable<any> {
    let httpParams = new HttpParams();

    if (params.deviceId) httpParams = httpParams.set('DeviceId', params.deviceId);
    if (params.startDate) httpParams = httpParams.set('StartDate', params.startDate.toISOString());
    if (params.endDate) httpParams = httpParams.set('EndDate', params.endDate.toISOString());
    if (params.sensor) httpParams = httpParams.set('Sensor', params.sensor);
    if (params.aggregationInterval) httpParams = httpParams.set('AggregationInterval', params.aggregationInterval);
    if (params.aggregationType) httpParams = httpParams.set('AggregationType', params.aggregationType);
    if (params.pageNumber) httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    if (params.pageSize) httpParams = httpParams.set('PageSize', params.pageSize.toString());

    return this.http.get<any>(`${this.apiUrl}/aggregated`, { params: httpParams }).pipe(
      map(response => response.result)
    );
  }

  /**
   * Helper method: Get hourly data (for last 24-48 hours view)
   */
  getHourlyData(deviceId: string, sensor: string, hours: number = 24): Observable<AggregatedDataResponse> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return this.getAggregatedDeviceData({
      deviceId,
      sensor,
      startDate,
      endDate,
      aggregationInterval: 'hour',
      aggregationType: 'avg',
      pageSize: hours + 1
    });
  }

  /**
   * Helper method: Get daily data (for week/month view)
   */
  getDailyData(deviceId: string, sensor: string, days: number = 30): Observable<AggregatedDataResponse> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getAggregatedDeviceData({
      deviceId,
      sensor,
      startDate,
      endDate,
      aggregationInterval: 'day',
      aggregationType: 'avg',
      pageSize: days + 1
    });
  }

  /**
   * Helper method: Get weekly data (for 3-6 month view)
   */
  getWeeklyData(deviceId: string, sensor: string, weeks: number = 12): Observable<AggregatedDataResponse> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    return this.getAggregatedDeviceData({
      deviceId,
      sensor,
      startDate,
      endDate,
      aggregationInterval: 'week',
      aggregationType: 'avg',
      pageSize: weeks + 1
    });
  }

  /**
   * Helper method: Get monthly data (for yearly view)
   */
  getMonthlyData(deviceId: string, sensor: string, months: number = 12): Observable<AggregatedDataResponse> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return this.getAggregatedDeviceData({
      deviceId,
      sensor,
      startDate,
      endDate,
      aggregationInterval: 'month',
      aggregationType: 'avg',
      pageSize: months + 1
    });
  }

  /**
   * Helper method: Get data for multiple sensors at once
   */
  getMultipleSensorsData(
    deviceId: string,
    sensors: string[],
    startDate: Date,
    endDate: Date,
    aggregationInterval: 'hour' | 'day' | 'week' | 'month' = 'hour'
  ): Observable<Map<string, any>> {
    const requests = sensors.map(sensor =>
      this.getAggregatedDeviceData({
        deviceId,
        sensor,
        startDate,
        endDate,
        aggregationInterval,
        aggregationType: 'avg',
        pageSize: 1000
      })
    );

    // Use forkJoin to combine Observables and map the array of responses into a Map
    return forkJoin(requests).pipe(
      map((responses: any[]) => {
        const dataMap = new Map<string, any>();
        sensors.forEach((sensor, index) => {
          // responses[index] is the AggregatedDataResponse; prefer aggregatedData but fall back to whole response
          dataMap.set(sensor, responses[index]?.aggregatedData ?? responses[index]);
        });
        return dataMap;
      }),
      catchError(error => {
        console.error('Error fetching multiple sensors data:', error);
        return of(new Map<string, any>());
      })
    );
  }

  /**
   * Smart fetching: Automatically choose the right aggregation based on time range
   */
  getSmartAggregatedData(
    deviceId: string,
    sensor: string,
    startDate: Date,
    endDate: Date
  ): Observable<AggregatedDataResponse> {
    const hoursDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    let aggregationInterval: 'minute' | 'hour' | 'day' | 'week' | 'month';

    if (hoursDiff <= 6) {
      // Last 6 hours: use minute aggregation
      aggregationInterval = 'minute';
    } else if (hoursDiff <= 72) {
      // Last 3 days: use hour aggregation
      aggregationInterval = 'hour';
    } else if (hoursDiff <= 720) {
      // Last 30 days: use day aggregation
      aggregationInterval = 'day';
    } else if (hoursDiff <= 4320) {
      // Last 6 months: use week aggregation
      aggregationInterval = 'week';
    } else {
      // More than 6 months: use month aggregation
      aggregationInterval = 'month';
    }

    return this.getAggregatedDeviceData({
      deviceId,
      sensor,
      startDate,
      endDate,
      aggregationInterval,
      aggregationType: 'avg',
      pageSize: 1000
    });
  }
}