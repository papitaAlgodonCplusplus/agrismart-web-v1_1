// dashboard.component.ts - Enhanced with Real API-Based Alerts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, forkJoin, of, catchError } from 'rxjs';

// Services
import { FarmService } from '../farms/services/farm.service';
import { FertilizerService } from '../fertilizers/services/fertilizer.service';
import { CatalogService } from '../catalogs/services/catalog.service';
import { IrrigationCalculationsService } from '../services/irrigation-calculations.service';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/services/api.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';


export interface ClimateKPIs {
  date: Date;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  relativeHumidityMin: number;
  relativeHumidityMax: number;
  relativeHumidityAvg: number;
  windSpeed: number;
  saturationVaporPressure: number;
  actualVaporPressure: number;
  vaporPressureDeficit: number;
  solarRadiation: number;
  netRadiation: number;
  referenceET: number;
  cropET: number;
  lightIntegral: number;
}

export interface IrrigationDashboardMetric {
  date: Date;
  intervalHours: number | null;
  lengthMinutes: number;
  volumePerM2: number;
  volumePerPlant: number;
  totalVolume: number;
  drainPercentage: number;
  flowRate: number;
  precipitationRate: number;
}

export interface FertilizerDosage {
  fertilizer: string;
  dosageGramsPerLiter: number;
  cost: number;
  phaseId: number;
  phaseName: string;
  nutrientContribution: any;
}

export interface CropProductionLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

// ============================================================================
// ADD TO DashboardStats INTERFACE
// ============================================================================

interface DashboardStats {
  totalFarms: number;
  totalDevices: number;
  activeDevices: number;
  totalCrops: number;
  activeCropProductions: number;
  totalUsers: number;
  alertsCount: number;
  totalIrrigationEvents: number;
  // ADD THESE NEW PROPERTIES:
  currentET?: number;
  totalWaterUsed?: number;
  avgDrainPercentage: number;
  waterEfficiency?: number;
  systemHealth?: number;
  fertilizerCost?: number;
}

interface RecentActivity {
  icon: string;
  id: number;
  type: 'success' | 'warning' | 'info' | 'danger' | 'primary';
  message: string;
  timestamp: Date;
  user?: string;
  deviceId?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalFarms: 0,
    totalDevices: 0,
    activeDevices: 0,
    totalCrops: 0,
    avgDrainPercentage: 0,
    totalIrrigationEvents: 0,
    activeCropProductions: 0,
    totalUsers: 0,
    alertsCount: 0
  };

  recentActivities: RecentActivity[] = [];
  rawData: any = {
    farms: [],
    devices: [],
    crops: [],
    cropProductions: [],
    users: [],
    deviceRawData: []
  };

  // Calculation services and data
  private farmService!: FarmService;
  private fertilizerService!: FertilizerService;
  private catalogService!: CatalogService;
  private irrigationCalcService!: IrrigationCalculationsService;

  // Calculation results
  climateKPIs: ClimateKPIs[] = [];
  irrigationMetrics: IrrigationDashboardMetric[] = [];
  fertilizerDosages: FertilizerDosage[] = [];

  // Location and production data
  cropProductionLocations: CropProductionLocation[] = [];
  availableFertilizers: any[] = [];
  availableCatalogs: any[] = [];
  cropPhaseRequirements: any[] = [];

  // Selected filters
  selectedCropProductionId: number | null = null;
  dateRange = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  };
  isLoading = true;
  errorMessage = '';
  currentPage = 1;
  pageSize = 10000;
  isLoadingMore = false;
  hasMoreData = true;
  totalRecordsLoaded = 0;
  pageSizeBulk = 500;
  // Add to the component class properties (around line 130)
  climateKPIsPage = 1;
  climateKPIsPageSize = 20;
  irrigationMetricsPage = 1;
  irrigationMetricsPageSize = 20;

  // Add aggregate statistics properties
  aggregateClimateKPIs: {
    tempAvg: number;
    tempMin: number;
    tempMax: number;
    windSpeedAvg: number;
    solarRadiationAvg: number;
    referenceETAvg: number;
    cropETAvg: number;
    cropETMin: number;
    cropETMax: number;
  } | null = null;

  // Modal properties for fertilizer details
  showFertilizerDetailsModal = false;
  selectedFertilizerDosage: FertilizerDosage | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private irrigationService: IrrigationSectorService,
    private router: Router,
    private farmServiceInjected: FarmService,
    private fertilizerServiceInjected: FertilizerService,
    private catalogServiceInjected: CatalogService,
    private irrigationCalcServiceInjected: IrrigationCalculationsService,
    private cdr: ChangeDetectorRef
  ) {
    // Assign injected services
    this.farmService = farmServiceInjected;
    this.fertilizerService = fertilizerServiceInjected;
    this.catalogService = catalogServiceInjected;
    this.irrigationCalcService = irrigationCalcServiceInjected;
  }

  // Add after calculateClimateKPIs() method (around line 450)
  private calculateAggregateClimateKPIs(): void {
    if (this.climateKPIs.length === 0) {
      this.aggregateClimateKPIs = null;
      return;
    }

    this.aggregateClimateKPIs = {
      tempAvg: this.climateKPIs.reduce((sum, k) => sum + k.tempAvg, 0) / this.climateKPIs.length,
      tempMin: Math.min(...this.climateKPIs.map(k => k.tempMin)),
      tempMax: Math.max(...this.climateKPIs.map(k => k.tempMax)),
      windSpeedAvg: this.climateKPIs.reduce((sum, k) => sum + k.windSpeed, 0) / this.climateKPIs.length,
      solarRadiationAvg: this.climateKPIs.reduce((sum, k) => sum + k.solarRadiation, 0) / this.climateKPIs.length,
      referenceETAvg: this.climateKPIs.reduce((sum, k) => sum + k.referenceET, 0) / this.climateKPIs.length,
      cropETAvg: this.climateKPIs.reduce((sum, k) => sum + k.cropET, 0) / this.climateKPIs.length,
      cropETMin: Math.min(...this.climateKPIs.map(k => k.cropET)),
      cropETMax: Math.max(...this.climateKPIs.map(k => k.cropET))
    };
  }

  ngOnInit(): void {
    this.loadDashboardStats();
    // ADD THESE:
    this.loadCropProductionLocations();
    this.loadAvailableCatalogs();
    this.loadCropPhaseRequirements();
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = 1; // Reset pagination
    this.hasMoreData = true;
    this.totalRecordsLoaded = 0;

    // Load data from multiple endpoints including device raw data
    forkJoin({
      farms: this.apiService.get('/Farm').pipe(catchError(() => of([]))),
      devices: this.apiService.get('/Device').pipe(catchError(() => of([]))),
      crops: this.apiService.get('/Crop').pipe(catchError(() => of([]))),
      cropProductions: this.apiService.get('/CropProduction').pipe(catchError(() => of([]))),
      users: this.apiService.get('/User').pipe(catchError(() => of([]))),
      deviceRawData: this.irrigationService.getDeviceRawDataHour(
        undefined,
        undefined,
        undefined,
        undefined,
        this.currentPage,
        this.pageSize
      ).pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        // console.log('Dashboard data loaded:', data);
        this.rawData = data;
        this.totalRecordsLoaded = Array.isArray(data.deviceRawData) ? data.deviceRawData.length : 0;

        // Check if we got less than pageSize, meaning no more data
        if (this.totalRecordsLoaded < this.pageSize) {
          this.hasMoreData = false;
        }

        this.calculateIrrigationMetrics();
        this.calculateStats();
        this.generateRecentActivitiesFromRealData();
        this.calculateClimateKPIs();
        this.calculateFertilizerDosages();
        this.calculateIrrigationMetrics();

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage = 'Error al cargar los datos del dashboard';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private calculateStats(): void {
    // Extract arrays from nested structure
    const farms = this.rawData.farms?.farms || [];
    const devices = this.rawData.devices?.devices || [];
    const crops = this.rawData.crops?.crops || [];
    const cropProductions = this.rawData.cropProductions?.cropProductions || [];
    const users = this.rawData.users?.users || [];
    const userId = this.authService.getCurrentUserId();

    // Calculate active devices from raw data
    const activeDeviceNames = new Set(
      (this.rawData.deviceRawData || []).map((d: any) => d.sensor)
    );

    this.stats = {
      totalFarms: farms.length,
      totalDevices: devices.length,
      activeDevices: activeDeviceNames.size,
      totalIrrigationEvents: this.irrigationMetrics.length,
      totalCrops: crops.filter((c: any) => c.createdBy?.toString() === userId?.toString()).length,
      activeCropProductions: cropProductions.filter((cp: any) => cp.isActive || cp.active).length,
      totalUsers: users.length,
      avgDrainPercentage: this.irrigationMetrics.reduce(
        (sum, m) => sum + m.drainPercentage, 0
      ) / this.irrigationMetrics.length,
      alertsCount: this.calculateRealAlerts(devices, this.rawData.deviceRawData || [])
    };
  }

  private calculateRealAlerts(devices: any[], rawDeviceData: any[]): number {
    let alerts = 0;

    // Get set of active device names from raw data
    const activeDeviceNames = new Set(rawDeviceData.map((d: any) => d.sensor));
    // console.log('Active devices from raw data:', activeDeviceNames);

    // Count offline/inactive registered devices
    alerts += devices.filter((d: any) => !activeDeviceNames.has(d.name)).length;
    // console.log('Offline/inactive devices:', devices.filter((d: any) => !activeDeviceNames.has(d.name)).map((d: any) => d.name));

    // Analyze raw device data for alerts
    const deviceDataMap = new Map<string, any[]>();

    rawDeviceData.forEach((data: any) => {
      const deviceName = data.sensor;
      if (!deviceDataMap.has(deviceName)) {
        deviceDataMap.set(deviceName, []);
      }
      deviceDataMap.get(deviceName)!.push(data);
    });
    // console.log('Device data map:', deviceDataMap);

    // Check each active device for alert conditions
    deviceDataMap.forEach((dataPoints, deviceName) => {
      const latestData = dataPoints[dataPoints.length - 1];

      // Battery alerts (low battery)
      const batteryKeys = ['Bat', 'BAT', 'Bat_V', 'BatV'];
      for (const key of batteryKeys) {
        if (latestData.sensor === key && latestData !== null) {
          const batValue = parseFloat(latestData.payload);
          if (batValue < 3.5) alerts++; // Low battery threshold
        }
      }

      // Temperature alerts (anomalous readings)
      const tempKeys = ['TEMP_SOIL', 'temp_SOIL', 'temp_DS18B20', 'TempC_DS18B20'];
      for (const key of tempKeys) {
        if (latestData.sensor === key && latestData !== null) {
          const tempValue = parseFloat(latestData.payload);
          if (tempValue > 100 || tempValue < 0) alerts++; // Anomalous temperature
        }
      }

      // pH alerts (out of optimal range)
      const phKeys = ['PH1_SOIL', 'PH_SOIL'];
      for (const key of phKeys) {
        if (latestData.sensor === key && latestData !== null) {
          const phValue = parseFloat(latestData.payload);
          if (phValue < 1 || phValue > 14) alerts++; // Invalid pH
          else if (phValue < 5.5 || phValue > 7.5) alerts++; // Out of optimal range
        }
      }

      // Alarm alerts
      if (latestData['Alarm'] === 'TRUE' || latestData['Alarm'] === true) {
        alerts++;
      }

      // Pressure alerts
      if (latestData['Water_pressure_MPa'] !== undefined) {
        const pressure = parseFloat(latestData['Water_pressure_MPa'].payload);
        if (pressure > 1.0) alerts++; // High pressure
      }

      // Check last update time
      const lastUpdate = new Date(latestData.recordDate);
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > 24) alerts++; // Device not reporting for 24+ hours
    });

    return alerts;
  }

  private generateRecentActivitiesFromRealData(): void {
    this.recentActivities = [];
    let activityId = 1;

    const rawDeviceData = this.rawData.deviceRawData || [];
    const rawDeviceDataMap = new Map<string, any>();
    rawDeviceData.forEach((data: any) => {
      rawDeviceDataMap.set(data.sensor, data);
    });

    // Generate activities from device data analysis
    rawDeviceDataMap.forEach((latestData, deviceName) => {
      // Check for nulls in any sensor data
      if (latestData === null) {
        this.recentActivities.push({
          icon: 'bi-exclamation-triangle',
          id: activityId++,
          type: 'warning',
          message: `${deviceName}: Datos nulos detectados`,
          timestamp: new Date(),
          deviceId: deviceName
        });
      }

      // Check for 0s in any sensor data
      if (latestData.payload === '0' || latestData.payload === 0) {
        this.recentActivities.push({
          icon: 'bi-exclamation-circle',
          id: activityId++,
          type: 'info',
          message: `${deviceName}: Valor cero detectado en sensor ${latestData.sensor}`,
          timestamp: new Date(),
          deviceId: deviceName
        });
      }

      // Battery alerts
      const batteryKeys = ['Bat', 'BAT', 'Bat_V', 'BatV'];
      for (const key of batteryKeys) {
        if (latestData.sensor === key && latestData !== null) {
          // console.log(`Analyzing battery data for device: ${deviceName}`, latestData);
          const batValue = parseFloat(latestData.payload);
          const timestamp = new Date(latestData.recordDate);
          if (batValue < 3.5) {
            this.recentActivities.push({
              icon: 'bi-battery',
              id: activityId++,
              type: 'danger',
              message: `${deviceName}: Batería crítica (${batValue.toFixed(2)}V)`,
              timestamp,
              deviceId: deviceName
            });
          } else if (batValue < 3.3) {
            this.recentActivities.push({
              icon: 'bi-battery-half',
              id: activityId++,
              type: 'warning',
              message: `${deviceName}: Batería baja (${batValue.toFixed(2)}V)`,
              timestamp,
              deviceId: deviceName
            });
          }
        }
      }

      // Temperature alerts
      const tempKeys = ['TEMP_SOIL', 'temp_SOIL', 'temp_DS18B20', 'TempC_DS18B20'];
      for (const key of tempKeys) {
        if (latestData.sensor === key && latestData !== null) {
          const tempValue = parseFloat(latestData.payload);
          const timestamp = new Date(latestData.recordDate);
          if (tempValue > 100) {
            this.recentActivities.push({
              icon: 'bi-thermometer-high',
              id: activityId++,
              type: 'warning',
              message: `${deviceName}: Temperatura anómala (${tempValue.toFixed(1)}°C)`,
              timestamp,
              deviceId: deviceName
            });
          } else if (tempValue > 50) {
            this.recentActivities.push({
              icon: 'bi-thermometer-sun',
              id: activityId++,
              type: 'warning',
              message: `${deviceName}: Temperatura alta (${tempValue.toFixed(1)}°C)`,
              timestamp,
              deviceId: deviceName
            });
          }
        }
      }

      // PAR / Solar Radiation alerts
      const parKeys = ['TSR', 'Solar_Radiation', 'illumination'];
      for (const key of parKeys) {
        if (latestData.sensor === key && latestData !== null) {
          const parValue = parseFloat(latestData.payload);
          const timestamp = new Date(latestData.recordDate);
          if (parValue > 1000) {
            this.recentActivities.push({
              icon: 'bi-sun',
              id: activityId++,
              type: 'warning',
              message: `${deviceName}: Radiación solar alta (${parValue.toFixed(1)} W/m²)`,
              timestamp,
              deviceId: deviceName
            });
          } else if (parValue == 0) {
            this.recentActivities.push({
              icon: 'bi-sun',
              id: activityId++,
              type: 'info',
              message: `${deviceName}: Radiación solar no detectada`,
              timestamp,
              deviceId: deviceName
            });
          }
        }
      }


      // wind alerts
      const windKeys = ['wind_speed_level', 'wind_speed', 'wind_direction'];
      for (const key of windKeys) {
        if (latestData.sensor === key && latestData !== null) {
          const windValue = parseFloat(latestData.payload);
          const timestamp = new Date(latestData.recordDate);
          if (windValue > 80) {
            this.recentActivities.push({
              icon: 'bi-wind',
              id: activityId++,
              type: 'danger',
              message: `${deviceName}: Velocidad de viento peligrosa (${windValue.toFixed(1)} km/h)`,
              timestamp,
              deviceId: deviceName
            });
          } else if (windValue > 50) {
            this.recentActivities.push({
              icon: 'bi-wind',
              id: activityId++,
              type: 'warning',
              message: `${deviceName}: Velocidad de viento alta (${windValue.toFixed(1)} km/h)`,
              timestamp,
              deviceId: deviceName
            });
          } else if (windValue == 0) {
            this.recentActivities.push({
              icon: 'bi-wind',
              id: activityId++,
              type: 'info',
              message: `${deviceName}: Sin viento detectado`,
              timestamp,
              deviceId: deviceName
            });
          }
        }
      }

      // pH alerts
      const phKeys = ['PH1_SOIL', 'PH_SOIL'];
      for (const key of phKeys) {
        if (latestData.sensor === key && latestData !== null) {
          const phValue = parseFloat(latestData.payload);
          const timestamp = new Date(latestData.recordDate);
          if (phValue < 1 || phValue > 14) {
            this.recentActivities.push({
              icon: 'bi-droplet',
              id: activityId++,
              type: 'warning',
              message: `${deviceName}: pH fuera de rango (${phValue.toFixed(2)})`,
              timestamp,
              deviceId: deviceName
            });
          } else if (phValue < 5.5 || phValue > 7.5) {
            this.recentActivities.push({
              icon: 'bi-droplet-half',
              id: activityId++,
              type: 'info',
              message: `${deviceName}: pH no óptimo (${phValue.toFixed(2)})`,
              timestamp,
              deviceId: deviceName
            });
          }
        }
      }

      // Alarm alerts
      if (latestData['Alarm'] === 'TRUE' || latestData['Alarm'] === true) {
        this.recentActivities.push({
          icon: 'bi-bell-fill',
          id: activityId++,
          type: 'danger',
          message: `${deviceName}: Alarma activada`,
          timestamp: new Date(latestData['Alarm'].recordDate),
          deviceId: deviceName
        });
      }

      // Pressure alerts
      if (latestData['Water_pressure_MPa'] !== undefined) {
        const pressure = parseFloat(latestData['Water_pressure_MPa'].payload);
        if (pressure > 1.0) {
          this.recentActivities.push({
            icon: 'bi-arrows-angle-expand',
            id: activityId++,
            type: 'warning',
            message: `${deviceName}: Presión alta (${pressure.toFixed(3)} MPa)`,
            timestamp: new Date(latestData['Water_pressure_MPa'].recordDate),
            deviceId: deviceName
          });
        }
      }

      // Positive activities - recent data received
      const timestamp = new Date(latestData[Object.keys(latestData)[0]].recordDate);
      const hoursSinceUpdate = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 1) {
        this.recentActivities.push({
          icon: 'bi-check-circle',
          id: activityId++,
          type: 'success',
          message: `${deviceName}: Datos recibidos correctamente`,
          timestamp,
          deviceId: deviceName
        });
      }
    });

    // Add activities for inactive devices
    // devices.forEach((device: any) => {
    //   if (!activeDeviceNames.has(device.name)) {
    //     this.recentActivities.push({
    //       icon: 'bi-wifi-off',
    //       id: activityId++,
    //       type: 'warning',
    //       message: `${device.name}: Sin enviar datos`,
    //       timestamp: new Date(),
    //       deviceId: device.name
    //     });
    //   }
    // });

    // Sort by timestamp (most recent first) and limit to top 10
    this.recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.recentActivities = this.recentActivities.slice(0, 10);

    // If no real activities, add a default informative message
    if (this.recentActivities.length === 0) {
      this.recentActivities.push({
        icon: 'bi-info-circle',
        id: 1,
        type: 'info',
        message: 'Sistema operando normalmente',
        timestamp: new Date(),
        user: 'Sistema'
      });
    }
  }

  // Getter methods for dashboard cards
  getTotalFarms(): number {
    return this.stats.totalFarms;
  }

  getActiveFarms(): number {
    return this.rawData.farms?.farms?.filter((f: any) => f.isActive || f.active)?.length || 0;
  }

  getTotalDevices(): number {
    return this.stats.totalDevices;
  }

  getTotalCrops(): number {
    return this.stats.totalCrops;
  }

  getActiveCropProductions(): number {
    return this.stats.activeCropProductions;
  }

  getAlertsCount(): number {
    return this.stats.alertsCount;
  }

  getTopFarm(): string {
    return this.rawData.farms?.farms?.[0]?.name || 'N/A';
  }

  getOnlineDevicesCount(): number {
    return this.stats.activeDevices;
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }

  getActivityTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'success': 'bg-success',
      'warning': 'bg-warning',
      'info': 'bg-info',
      'danger': 'bg-danger',
      'primary': 'bg-primary'
    };
    return classes[type] || 'bg-secondary';
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Navigation methods
  navigateToIrrigationRequirements(): void {
    this.router.navigate(['/irrigation-on-demand']);
  }

  navigateToShinyDashboard(): void {
    this.router.navigate(['/shiny-dashboard']);
  }

  navigateToNutrientFormulation(): void {
    this.router.navigate(['/nutrient-formulation']);
  }

  navigateToWaterAnalysis(): void {
    this.router.navigate(['/water-chemistry']);
  }

  navigateToSoilAnalysis(): void {
    this.router.navigate(['/soil-analysis']);
  }

  navigateToFertilizers(): void {
    this.router.navigate(['/fertilizers']);
  }

  navigateToIrrigationDesignRequirements(): void {
    this.router.navigate(['/irrigation-engineering-design']);
  }

  navigateToCrops(): void {
    this.router.navigate(['/crops']);
  }

  navigateToCropPhases(): void {
    this.router.navigate(['/crop-phases']);
  }

  navigateToPhaseRequirements(): void {
    this.router.navigate(['/phase-requirements']);
  }

  navigateToCropProduction(): void {
    this.router.navigate(['/crop-production']);
  }

  navigateToFarms(): void {
    this.router.navigate(['/farms']);
  }

  navigateToDevices(): void {
    this.router.navigate(['/devices']);
  }

  navigateToProductionUnits(): void {
    this.router.navigate(['/production-units']);
  }


  /**
   * Load crop production locations with lat/lon/altitude
   */
  private loadCropProductionLocations(): void {
    this.farmService.getAll(true).subscribe({
      next: (response: any) => {
        // console.log('Farms loaded for locations:', response);

        // Extract farms array from response
        const farms = response.farms || response.result?.farms || [];

        this.cropProductionLocations = farms.map((farm: any) => ({
          id: farm.id,
          name: farm.name,
          latitude: farm.latitude || 0,
          longitude: farm.longitude || 0,
          altitude: farm.altitude || 100 // Default altitude if not provided
        }));

        // console.log(`Loaded ${this.cropProductionLocations.length} crop production locations`);
      },
      error: (error) => {
        console.error('Error loading crop production locations:', error);
        this.cropProductionLocations = [];
      }
    });
  }

  /**
   * Load available catalogs for fertilizers
   */
  private loadAvailableCatalogs(): void {
    this.catalogService.getAll().subscribe({
      next: (response: any) => {
        // console.log('Catalogs loaded:', response);

        // Extract catalogs array from response
        this.availableCatalogs = response.catalogs || response.result?.catalogs || [];

        // Load fertilizers from first catalog if available
        if (this.availableCatalogs.length > 0) {
          this.loadAvailableFertilizers(this.availableCatalogs[0].id);
        }

        // console.log(`Loaded ${this.availableCatalogs.length} catalogs`);
      },
      error: (error) => {
        console.error('Error loading catalogs:', error);
        this.availableCatalogs = [];
      }
    });
  }

  navigateToProcessKPIs(): void {
    this.router.navigate(['/process-kpis']);
  }

  /**
   * Load available fertilizers from catalog
   */
  private loadAvailableFertilizers(catalogId: number): void {
    this.fertilizerService.getAll().subscribe({
      next: (response: any) => {
        // console.log('Fertilizers loaded:', response);

        // Handle different response structures
        let fertilizers = [];
        if (Array.isArray(response)) {
          fertilizers = response;
        } else if (response && response.result && Array.isArray(response.result.fertilizers)) {
          fertilizers = response.result.fertilizers;
        } else if (response && Array.isArray(response.fertilizers)) {
          fertilizers = response.fertilizers;
        }

        this.availableFertilizers = fertilizers.map((f: any) => ({
          id: f.id,
          name: f.name,
          N: f.nitrogenPercentage || 0,
          P2O5: f.phosphorusPercentage || 0,
          K2O: f.potassiumPercentage || 0,
          CaO: f.calciumPercentage || 0,
          MgO: f.magnesiumPercentage || 0,
          S: f.sulfurPercentage || 0,
          solubility: f.solubility || 1000,
          cost: f.pricePerUnit || 1.0
        }));

        // console.log(`Loaded ${this.availableFertilizers.length} fertilizers`);
      },
      error: (error) => {
        console.error('Error loading fertilizers:', error);
        this.availableFertilizers = [];
      }
    });
  }

  /**
   * Load crop phase requirements for fertilizer calculations
   */
  private loadCropPhaseRequirements(): void {
    this.apiService.get<any>('/CropPhaseSolutionRequirement').subscribe({
      next: (response) => {
        // console.log('CropPhaseSolutionRequirement loaded:', response);

        // Handle different response structures
        if (Array.isArray(response)) {
          this.cropPhaseRequirements = response;
        } else if (response && Array.isArray(response.cropPhaseRequirements)) {
          this.cropPhaseRequirements = response.cropPhaseRequirements;
        } else {
          this.cropPhaseRequirements = [];
        }

        // console.log(`Loaded ${this.cropPhaseRequirements.length} crop phase requirements`);
      },
      error: (error) => {
        console.error('Error loading crop phase requirements:', error);
        this.cropPhaseRequirements = [];
      }
    });
  }

  /**
   * Calculate climate KPIs from raw device data
   */
  private calculateClimateKPIs(): void {
    // Group raw data by hour
    const hourlyData = this.groupRawDataByHour();

    this.climateKPIs = Array.from(hourlyData.entries()).map(([hour, sensors]) => {
      // console.log(`Calculating KPIs for hour: ${hour}`, sensors);

      // Extract temperature from DS18B20 sensor
      const temps = this.extractSensorValues(sensors, 'temp')
        .map(v => v / 10); // Convert from sensor reading

      // Extract wind speed
      const windSpeeds = this.extractSensorValues(sensors, 'wind_speed_level');

      // Extract PAR (solar radiation)
      const solarRadiation = this.extractSensorValues(sensors, 'TSR');

      //// console.log(`Hour: ${hour} - Temps:`, temps, 'WindSpeeds:', windSpeeds, 'SolarRadiation:', solarRadiation);

      // Get location for calculations TODO VERIFY MOCKED LOCATION
      const location = this.cropProductionLocations[0] || {
        latitude: 10,
        longitude: -84,
        altitude: 100
      };

      // Calculate statistics
      const tempStats = this.calculateStatsValues(temps);
      const windStats = this.calculateStatsValues(windSpeeds);
      const solarStats = this.calculateStatsValues(solarRadiation);
      // // console.log(`Hour: ${hour} - TempStats:`, tempStats, 'WindStats:', windStats, 'SolarStats:', solarStats);

      // Calculate reference ET (simplified FAO-56)
      const referenceET = this.calculateReferenceET(
        tempStats.avg,
        windStats.avg,
        solarStats.avg,
        location.latitude,
        location.altitude
      );

      return {
        date: new Date(hour),
        tempMin: tempStats.min,
        tempMax: tempStats.max,
        tempAvg: tempStats.avg,
        relativeHumidityMin: 40, // TODO: Add RH sensor
        relativeHumidityMax: 80,
        relativeHumidityAvg: 60,
        windSpeed: windStats.avg,
        saturationVaporPressure: this.getSaturationVaporPressure(tempStats.avg),
        actualVaporPressure: 0, // TODO: Calculate from RH
        vaporPressureDeficit: 0,
        solarRadiation: solarStats.avg,
        netRadiation: solarStats.avg * 0.6, // Approximation
        referenceET: referenceET,
        cropET: referenceET * 1.1, // Crop coefficient
        lightIntegral: solarStats.avg * 3.6 // Convert to MJ/m²/day
      };
    });

    // Update dashboard stats
    if (this.climateKPIs.length > 0) {
      this.stats.currentET = this.climateKPIs[this.climateKPIs.length - 1].cropET;
    }
    this.calculateAggregateClimateKPIs();
  }

  /**
   * Calculate irrigation metrics from pressure and flow data
   */
  private calculateIrrigationMetrics(): void {
    // Get pressure and flow data
    const pressureData = this.rawData.deviceRawData.filter((d: any) =>
      d.sensor === 'IDC_intput_mA'
    );

    const flowData = this.rawData.deviceRawData.filter((d: any) =>
      d.sensor === 'Total_pulse'
    );

    const drainData = this.rawData.deviceRawData.filter((d: any) =>
      d.sensor === 'rain_gauge_ml'
    );

    // Mock crop production specs
    const cropProduction = {
      id: 1,
      betweenRowDistance: 1.5,
      betweenContainerDistance: 0.3,
      betweenPlantDistance: 0.2,
      area: 1000
    };

    // Detect irrigation events
    const events = this.irrigationCalcService.getCropProductionIrrigationEvents(
      cropProduction,
      pressureData,
      0.002
    );

    // Calculate volumes for each event
    const eventsWithVolumes = this.irrigationCalcService.getIrrigationEventsVolumes(
      events,
      flowData,
      drainData,
      [
        { id: 1, measurementVariableStandardId: 19, name: 'Irrigation Volume' },
        { id: 2, measurementVariableStandardId: 20, name: 'Drain Volume' }
      ]
    );

    // Calculate metrics
    this.irrigationMetrics = [];
    for (let i = 0; i < eventsWithVolumes.length; i++) {
      const currentEvent = eventsWithVolumes[i];
      const previousEvent = i > 0 ? eventsWithVolumes[i - 1] : undefined;

      const inputs = previousEvent
        ? [currentEvent, previousEvent]
        : [currentEvent];

      const metric = this.irrigationCalcService.calculateIrrigationMetrics(
        inputs,
        cropProduction,
        [
          { id: 1, measurementVariableStandardId: 19, name: 'Irrigation Volume' },
          { id: 2, measurementVariableStandardId: 20, name: 'Drain Volume' }
        ]
      );

      // Convert to display format
      this.irrigationMetrics.push({
        date: metric.date,
        intervalHours: metric.irrigationInterval
          ? metric.irrigationInterval / (1000 * 60 * 60)
          : null,
        lengthMinutes: metric.irrigationLength / (1000 * 60),
        volumePerM2: metric.irrigationVolumenM2.value,
        volumePerPlant: metric.irrigationVolumenPerPlant.value,
        totalVolume: metric.irrigationVolumenTotal.value,
        drainPercentage: metric.drainPercentage,
        flowRate: metric.irrigationFlow.value,
        precipitationRate: metric.irrigationPrecipitation.value
      });
    }

    // Update dashboard stats
    if (this.irrigationMetrics.length > 0) {
      this.stats.totalWaterUsed = this.irrigationMetrics.reduce(
        (sum, m) => sum + m.totalVolume, 0
      );

      this.stats.avgDrainPercentage = this.irrigationMetrics.reduce(
        (sum, m) => sum + m.drainPercentage, 0
      ) / this.irrigationMetrics.length;

      this.stats.waterEfficiency = 100 - this.stats.avgDrainPercentage;
    }
  }

  /**
 * Calculate fertilizer dosages based on ET and requirements
 * Fixed to iterate through ALL crop phase requirements
 */
  private calculateFertilizerDosages(): void {
    if (this.availableFertilizers.length === 0 || this.cropPhaseRequirements.length === 0) {
      console.warn('Cannot calculate fertilizer dosages - missing data');
      return;
    }

    console.log('Calculating fertilizer dosages with available fertilizers:', this.availableFertilizers);
    console.log('Crop phase requirements:', this.cropPhaseRequirements);

    // Get latest ET value (non-zero)
    const latestET = this.climateKPIs.length > 0
      ? this.climateKPIs.slice().reverse().find(kpi => kpi.cropET > 0)?.cropET || 0
      : 0;

    console.log('Latest ET value:', latestET);

    // Reset fertilizer dosages array
    this.fertilizerDosages = [];

    // Get average water volume for cost calculations
    const avgWaterVolume = this.irrigationMetrics.length > 0
      ? this.irrigationMetrics.reduce((sum, m) => sum + m.totalVolume, 0) / this.irrigationMetrics.length
      : 10000;

    // ITERATE THROUGH ALL CROP PHASE REQUIREMENTS
    for (const requirement of this.cropPhaseRequirements) {
      console.log('Processing requirement:', requirement);

      // Calculate requirements in ppm
      const requirements = {
        nitrogen: (requirement.nO3 || 0) + (requirement.nH4 || 0),
        phosphorus: requirement.h2PO4 || 0,
        potassium: requirement.k || 0,
        calcium: requirement.ca || 0,
        magnesium: requirement.mg || 0,
        sulfur: requirement.sO4 || 0
      };

      // Track remaining nutrients for this phase
      let remainingN = requirements.nitrogen;
      let remainingP = requirements.phosphorus;
      let remainingK = requirements.potassium;

      // Calculate dosages for this phase requirement
      for (const fert of this.availableFertilizers) {
        console.log('Evaluating fertilizer:', fert.name, fert);
        console.log(`Remaining - N: ${remainingN}, P: ${remainingP}, K: ${remainingK}`);
        if (remainingN <= 0 && remainingK <= 0 && remainingP <= 0) break;

        let dosageNeeded = 0;

        // Calculate dosage based on nutrient with highest deficit
        if (remainingN > 0 && fert.N > 0) {
          dosageNeeded = Math.max(dosageNeeded, (remainingN / 1000) / (fert.N / 100));
        }
        if (remainingK > 0 && fert.K2O > 0) {
          dosageNeeded = Math.max(dosageNeeded, (remainingK / 1000) / (fert.K2O * 0.83 / 100));
        }
        if (remainingP > 0 && fert.P2O5 > 0) {
          dosageNeeded = Math.max(dosageNeeded, (remainingP / 1000) / (fert.P2O5 * 0.44 / 100));
        }

        console.log(`Calculated dosage needed for fertilizer ${fert.name}: ${dosageNeeded} g/L`);
        // Only add if dosage is valid and within solubility limits
        if (dosageNeeded > 0) { // TODO check this condition  && dosageNeeded <= fert.solubility
          // Subtract nutrients provided by this fertilizer
          remainingN -= (dosageNeeded * (fert.N / 100) * 1000);
          remainingK -= (dosageNeeded * (fert.K2O / 100) * 0.83 * 1000);
          remainingP -= (dosageNeeded * (fert.P2O5 / 100) * 0.44 * 1000);

          // Check if this fertilizer/phase combination already exists
          const existingIndex = this.fertilizerDosages.findIndex(
            d => d.fertilizer === fert.name && d.phaseId === requirement.id
          );

          if (existingIndex >= 0) {
            // Update existing dosage
            this.fertilizerDosages[existingIndex].dosageGramsPerLiter += dosageNeeded;
            this.fertilizerDosages[existingIndex].cost += dosageNeeded * fert.cost / 1000 * avgWaterVolume;
          } else {
            // Add new dosage entry with phase information
            this.fertilizerDosages.push({
              fertilizer: fert.name,
              dosageGramsPerLiter: dosageNeeded,
              cost: dosageNeeded * fert.cost / 1000 * avgWaterVolume,
              phaseId: requirement.id,
              phaseName: requirement.cropPhaseName || `Fase ${requirement.id}`,
              // Add nutrient contribution details
              nutrientContribution: {
                N: dosageNeeded * (fert.N / 100) * 1000,
                P: dosageNeeded * (fert.P2O5 / 100) * 0.44 * 1000,
                K: dosageNeeded * (fert.K2O / 100) * 0.83 * 1000
              }
            });
          }
        }
      }
    }

    console.log(`Calculated ${this.fertilizerDosages.length} fertilizer dosages for ${this.cropPhaseRequirements.length} phases`);

    // Update dashboard stats with total cost
    this.stats.fertilizerCost = this.fertilizerDosages.reduce(
      (sum, f) => sum + f.cost, 0
    );
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private groupRawDataByHour(): Map<number, any> {
    const grouped = new Map<number, any[]>();

    this.rawData.deviceRawData.forEach((point: any) => {
      const date = new Date(point.recordDate);
      const hourKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();

      if (!grouped.has(hourKey)) {
        grouped.set(hourKey, []);
      }
      grouped.get(hourKey)!.push(point);
    });

    return grouped;
  }

  private extractSensorValues(sensors: any[], sensorName: string): number[] {
    return sensors
      .filter(s => s.sensor.includes(sensorName))
      .map(s => typeof s.payload === 'number' ? s.payload : parseFloat(s.payload))
      .filter(v => !isNaN(v));
  }

  private calculateStatsValues(values: number[]): { min: number; max: number; avg: number } {
    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, v) => sum + v, 0) / values.length
    };
  }

  private getSaturationVaporPressure(temp: number): number {
    return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  }

  private calculateReferenceET(
    temp: number,
    windSpeed: number,
    solarRadiation: number,
    latitude: number,
    altitude: number
  ): number {
    // Simplified FAO-56 Penman-Monteith
    const delta = this.getSlopeVaporPressureCurve(temp);
    const gamma = this.getPsychrometricConstant(altitude);
    const Rn = solarRadiation * 0.0864; // Convert to MJ/m²/day

    const numerator = 0.408 * delta * Rn + gamma * (900 / (temp + 273)) * windSpeed * 0.5;
    const denominator = delta + gamma * (1 + 0.34 * windSpeed);


    return numerator / denominator;
  }

  private getSlopeVaporPressureCurve(temp: number): number {
    return (4098 * this.getSaturationVaporPressure(temp)) / Math.pow(temp + 237.3, 2);
  }

  private getPsychrometricConstant(altitude: number): number {
    const P = 101.3 * Math.pow((293 - 0.0065 * altitude) / 293, 5.26);
    return 0.000665 * P;
  }


  /**
   * Load next page of device raw data and append to existing data
   */
  loadMoreDeviceData(): void {
    if (this.isLoadingMore || !this.hasMoreData) {
      return;
    }

    this.isLoadingMore = true;
    this.currentPage++;

    this.irrigationService.getDeviceRawDataHour(
      undefined,
      undefined,
      undefined,
      undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (newData) => {
        // console.log(`Loaded page ${this.currentPage}:`, newData);

        // Append new data to existing deviceRawData
        if (Array.isArray(newData) && newData.length > 0) {
          this.rawData.deviceRawData = [
            ...(this.rawData.deviceRawData || []),
            ...newData
          ];

          this.totalRecordsLoaded += newData.length;

          // Check if we got less than pageSize, meaning no more data
          if (newData.length < this.pageSize) {
            this.hasMoreData = false;
          }

          // Recalculate everything with new data
          this.calculateStats();
          this.generateRecentActivitiesFromRealData();
          this.calculateClimateKPIs();
          this.calculateIrrigationMetrics();
          this.calculateFertilizerDosages();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        } else {
          // No more data available
          this.hasMoreData = false;
        }

        this.isLoadingMore = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading more device data:', error);
        this.errorMessage = 'Error al cargar más datos';
        this.isLoadingMore = false;
        this.currentPage--; // Revert page increment on error
        this.cdr.markForCheck();
      }
    });
  }

  /**
  * Load next page of device raw data and append to existing data
  */
  loadMoreDeviceDataBulk(): void {
    if (this.isLoadingMore || !this.hasMoreData) {
      return;
    }

    this.isLoadingMore = true;
    this.currentPage++;

    this.irrigationService.getDeviceRawDataHour(
      undefined,
      undefined,
      undefined,
      undefined,
      this.currentPage,
      this.pageSizeBulk
    ).subscribe({
      next: (newData) => {
        // console.log(`Loaded page ${this.currentPage}:`, newData);

        // Append new data to existing deviceRawData
        if (Array.isArray(newData) && newData.length > 0) {
          this.rawData.deviceRawData = [
            ...(this.rawData.deviceRawData || []),
            ...newData
          ];

          this.totalRecordsLoaded += newData.length;

          // Check if we got less than pageSize, meaning no more data
          if (newData.length < this.pageSize) {
            this.hasMoreData = false;
          }

          // Recalculate everything with new data
          this.calculateStats();
          this.generateRecentActivitiesFromRealData();
          this.calculateClimateKPIs();
          this.calculateIrrigationMetrics();
          this.calculateFertilizerDosages();
          this.cdr.markForCheck();
          this.cdr.detectChanges();

          // console.log(`Total records loaded: ${this.totalRecordsLoaded}`);
          // console log all available sensor in this.rawData
          const availableSensors = new Set(
            (this.rawData.deviceRawData || []).map((d: any) => d.sensor)
          );
          // console.log('Available sensors after bulk load:', Array.from(availableSensors).sort());
        } else {
          // No more data available
          this.hasMoreData = false;
        }

        this.isLoadingMore = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading more device data:', error);
        this.errorMessage = 'Error al cargar más datos';
        this.isLoadingMore = false;
        this.currentPage--; // Revert page increment on error
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Get formatted pagination info
   */
  getPaginationInfo(): string {
    return `Mostrando ${this.totalRecordsLoaded.toLocaleString()} registros (Página ${this.currentPage})`;
  }

  /**
   * Reset pagination and reload from beginning
   */
  resetPagination(): void {
    this.currentPage = 1;
    this.hasMoreData = true;
    this.totalRecordsLoaded = 0;
    this.loadDashboardStats();
  }


  // Add pagination helper methods at the end of the class
  getClimateKPIsPaginated(): ClimateKPIs[] {
    const startIndex = (this.climateKPIsPage - 1) * this.climateKPIsPageSize;
    const endIndex = startIndex + this.climateKPIsPageSize;
    return this.climateKPIs.slice(startIndex, endIndex);
  }

  getClimateKPIsTotalPages(): number {
    return Math.ceil(this.climateKPIs.length / this.climateKPIsPageSize);
  }

  goToClimateKPIsPage(page: any): void {
    if (page >= 1 && page <= this.getClimateKPIsTotalPages()) {
      this.climateKPIsPage = page;
    }
  }

  getIrrigationMetricsPaginated(): IrrigationDashboardMetric[] {
    const startIndex = (this.irrigationMetricsPage - 1) * this.irrigationMetricsPageSize;
    const endIndex = startIndex + this.irrigationMetricsPageSize;
    return this.irrigationMetrics.slice(startIndex, endIndex);
  }

  getIrrigationMetricsTotalPages(): number {
    return Math.ceil(this.irrigationMetrics.length / this.irrigationMetricsPageSize);
  }

  goToIrrigationMetricsPage(page: any): void {
    if (page >= 1 && page <= this.getIrrigationMetricsTotalPages()) {
      this.irrigationMetricsPage = page;
    }
  }

  getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  }

  // Modal methods for fertilizer details
  openFertilizerDetailsModal(dosage: FertilizerDosage): void {
    this.selectedFertilizerDosage = { ...dosage };
    this.showFertilizerDetailsModal = true;
  }

  closeFertilizerDetailsModal(): void {
    this.showFertilizerDetailsModal = false;
    this.selectedFertilizerDosage = null;
  }

}