// src/app/features/dashboard/shiny/shiny-dashboard.component.ts - UPDATED WITH NEW IoT API INTEGRATION
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, interval, BehaviorSubject, combineLatest, forkJoin, throwError, of } from 'rxjs';
import { takeUntil, switchMap, catchError, startWith, map, debounceTime, tap } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Models
import { Farm, ProductionUnit, CropProduction, Company } from '../../../core/models/models';

// Services
import { FarmService } from '../../farms/services/farm.service';
import { CompanyService } from '../../companies/services/company.service';
import { ProductionUnitService } from '../../production-units/services/production-unit.service';
import { CropProductionService } from '../../crop-production/services/crop-production.service';
import {
  IrrigationSectorService,
  ClimateReading,
  SoilReading,
  FlowReading,
  ProcessedDeviceData,
  IrrigationSystemStatus
} from '../../services/irrigation-sector.service';
import { MeasurementService } from '../services/measurement.service';
import { CalculationSettingService } from '../services/calculation-setting.service';
import { MeasurementUnitService } from '../services/measurement-unit.service';
import { AnalyticalEntityService } from '../services/analytical-entity.service';

// Register Chart.js components
Chart.register(...registerables);

// Interfaces for API responses
interface MeasurementUnit {
  id: number;
  name: string;
  symbol: string;
  active: boolean;
}

interface MeasurementVariable {
  id: number;
  name: string;
  unit?: string;
  catalogId: number;
  measurementUnitId: number;
  measurementVariableStandardId?: number;
  active: boolean;
  measurementUnit?: MeasurementUnit;
}

interface MeasurementData {
  id: number;
  cropProductionId: number;
  measurementVariableId: number;
  recordDate: string;
  avgValue: number;
  minValue: number;
  maxValue: number;
  sumValue: number;
}

interface CalculationSetting {
  id: number;
  catalogId: number;
  name: string;
  value: string;
  description?: string;
  active: boolean;
}

interface GraphSeries {
  geomtype: 'Line' | 'Point' | 'Bar' | 'PointRange' | 'RefLine';
  measurementVariableId: number;
  axis: 'Primary' | 'Secondary';
  color: string;
  visible: boolean;
  createStats?: boolean;
  line_width?: number;
  line_type?: string;
  line_Transparency?: number;
  shape_type?: number;
  shape_size?: number;
  point_transparency?: number;
  bar_position?: string;
  bar_thickness?: number;
  bar_Transparency?: number;
  name?: string;
  yintercept?: number;
  [key: string]: any;
}

interface DynamicGraphConfig {
  id: string;
  name: string;
  summaryTimeScale: 'hour' | 'day' | 'week' | 'month' | 'daysOfGrowth' | 'weekOfGrowth' | 'monthOfGrowth';
  yAxisScaleType: 'auto' | 'cero';
  series: GraphSeries[];
  category: 'climate' | 'nutrients' | 'environment' | 'custom';
}

interface AnalyticalEntity {
  id: number;
  name: string;
  type: string;
  description?: string;
  configuration?: any;
  active: boolean;
}

interface ClimateData {
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  humidity?: number;
  pressure?: number;
  solarRadiation?: number;
  precipitation?: number;
  lastUpdate: Date;
}

interface CropPhase {
  id: number;
  cropId: number;
  catalogId: number;
  name: string;
  description?: string;
  sequence?: number;
  startingWeek?: number;
  endingWeek?: number;
  active: boolean;
  dateCreated?: Date;
  dateUpdated?: Date;
  createdBy?: number;
  updatedBy?: number;
}

interface DashboardSummary {
  climate: ClimateReading | null;
  soil: SoilReading[];
  flow: FlowReading[];
  systemStatus: IrrigationSystemStatus | null;
  lastUpdate: Date;
}

@Component({
  selector: 'app-shiny-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './shiny-dashboard.component.html',
  styleUrls: ['./shiny-dashboard.component.css']
})
export class ShinyDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('temperatureGauge', { static: false }) temperatureGaugeRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('windSpeedGauge', { static: false }) windSpeedGaugeRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mainChart', { static: false }) mainChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('climateChart', { static: false }) climateChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();

  // Data sources
  farms: Farm[] = [];
  companies: Company[] = [];
  productionUnits: ProductionUnit[] = [];
  cropProductions: CropProduction[] = [];
  measurementVariables: MeasurementVariable[] = [];
  measurementUnits: MeasurementUnit[] = [];
  calculationSettings: CalculationSetting[] = [];
  analyticalEntities: AnalyticalEntity[] = [];

  // Selected values
  selectedFarm: number | null = null;
  selectedCompany: number | null = null;
  selectedProductionUnit: number | null = null;
  selectedCropProduction: number | null = null;

  // Loading states
  isLoading = true;
  loadingMessage = 'Cargando datos del dashboard...';
  errorMessage: string | null = null;

  // Real-time data streams
  private climateData$ = new BehaviorSubject<ClimateData>({
    temperature: 0,
    windSpeed: 0,
    windDirection: 0,
    humidity: 0,
    pressure: 0,
    solarRadiation: 0,
    precipitation: 0,
    lastUpdate: new Date()
  });

  private dashboardSummary$ = new BehaviorSubject<any>({
    climate: null,
    soil: [],
    flow: [],
    systemStatus: null,
    lastUpdate: new Date()
  });

  // Chart instances
  private temperatureChart: Chart | null = null;
  private windSpeedChart: Chart | null = null;
  private mainChart: Chart | null = null;
  private climateChart: Chart | null = null;

  // Chart data
  private chartData: any[] = [];
  private climateBaseData: any[] = [];

  // Dynamic graphs configuration
  availableGraphs: DynamicGraphConfig[] = [];
  selectedGraphConfig: DynamicGraphConfig | null = null;

  // Current climate data for display
  currentClimate: ClimateData = {
    temperature: 0,
    windSpeed: 0,
    windDirection: 0,
    humidity: 0,
    pressure: 0,
    solarRadiation: 0,
    precipitation: 0,
    lastUpdate: new Date()
  };

  // System status
  systemStatus: IrrigationSystemStatus | null = null;
  deviceCount = 0;
  activeDeviceCount = 0;

  constructor(
    private farmService: FarmService,
    private companyService: CompanyService,
    private productionUnitService: ProductionUnitService,
    private cropProductionService: CropProductionService,
    private irrigationService: IrrigationSectorService,
    private measurementService: MeasurementService,
    private calculationSettingService: CalculationSettingService,
    private measurementUnitService: MeasurementUnitService,
    private analyticalEntityService: AnalyticalEntityService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupReactiveUpdates();
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  // ============================================================================
  // DATA LOADING METHODS
  // ============================================================================

  private loadInitialData(): void {
    this.isLoading = true;
    this.loadingMessage = 'Cargando datos iniciales...';

    forkJoin({
      farms: this.farmService.getAll(),
      companies: this.companyService.getAll(),
      measurementVariables: this.measurementService.getMeasurementVariables(),
      measurementUnits: this.measurementUnitService.getAll(),
      calculationSettings: this.calculationSettingService.getAll(),
      analyticalEntities: this.analyticalEntityService.getAll()
    }).subscribe({
      next: (data: any) => {
        this.farms = data.farms;
        this.companies = data.companies;
        this.measurementVariables = data.measurementVariables.measurementVariables;
        this.measurementUnits = data.measurementUnits.measurementUnits;
        this.calculationSettings = data.calculationSettings.calculationSettings;
        this.analyticalEntities = data.analyticalEntities.analiticalEntities;

        // Auto-select first farm if available
        if (this.farms.length > 0) {
          this.selectedFarm = this.farms[0].id;
          this.loadProductionUnits();
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage = 'Error cargando datos del dashboard';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================================
  // CHART METHODS
  // ============================================================================

  private initializeCharts(): void {
    setTimeout(() => {
      this.createTemperatureGauge();
      this.createWindSpeedGauge();
      this.createMainChart();
      this.createClimateChart();
    }, 100);
  }

  private createTemperatureGauge(): void {
    if (!this.temperatureGaugeRef?.nativeElement) return;

    const ctx = this.temperatureGaugeRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.temperatureChart = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Temperatura', 'Restante'],
        datasets: [{
          data: [this.currentClimate.temperature || 0, 50 - (this.currentClimate.temperature || 0)],
          backgroundColor: ['#ff6384', '#f0f0f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          arc: {
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });
  }

  private createWindSpeedGauge(): void {
    if (!this.windSpeedGaugeRef?.nativeElement) return;

    const ctx = this.windSpeedGaugeRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.windSpeedChart = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Viento', 'Restante'],
        datasets: [{
          data: [this.currentClimate.windSpeed || 0, 20 - (this.currentClimate.windSpeed || 0)],
          backgroundColor: ['#36a2eb', '#f0f0f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });
  }

  private createMainChart(): void {
    if (!this.mainChartRef?.nativeElement) return;

    const ctx = this.mainChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.mainChart = new Chart(ctx, {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour'
            }
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  private createClimateChart(): void {
    if (!this.climateChartRef?.nativeElement) {
      console.error('Creating climate chart with ref:', this.climateChartRef);
      return;
    }

    const ctx = this.climateChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for climate chart');
      return;
    }

    this.climateChart = new Chart(ctx, {
      type: 'line' as ChartType,
      data: {
        labels: [],
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: [],
            borderColor: '#ff6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.4
          },
          {
            label: 'Humedad (%)',
            data: [],
            borderColor: '#36a2eb',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Temperatura (°C)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Humedad (%)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  private updateTemperatureGauge(): void {
    if (!this.temperatureChart) return;

    const temp = this.currentClimate.temperature || 0;
    const maxTemp = 50;

    this.temperatureChart.data.datasets[0].data = [temp, Math.max(0, maxTemp - temp)];
    this.temperatureChart.update();
  }

  private updateWindSpeedGauge(): void {
    if (!this.windSpeedChart) return;

    const windSpeed = this.currentClimate.windSpeed || 0;
    const maxWindSpeed = 20;

    this.windSpeedChart.data.datasets[0].data = [windSpeed, Math.max(0, maxWindSpeed - windSpeed)];
    this.windSpeedChart.update();
  }



  private destroyCharts(): void {
    if (this.temperatureChart) {
      this.temperatureChart.destroy();
      this.temperatureChart = null;
    }
    if (this.windSpeedChart) {
      this.windSpeedChart.destroy();
      this.windSpeedChart = null;
    }
    if (this.mainChart) {
      this.mainChart.destroy();
      this.mainChart = null;
    }
    if (this.climateChart) {
      this.climateChart.destroy();
      this.climateChart = null;
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  onFarmChange(): void {
    this.selectedProductionUnit = null;
    this.selectedCropProduction = null;
    this.productionUnits = [];
    this.cropProductions = [];

    if (this.selectedFarm) {
      this.loadProductionUnits();
    }
  }

  onProductionUnitChange(): void {
    this.selectedCropProduction = null;
    this.cropProductions = [];

    if (this.selectedProductionUnit) {
      this.loadCropProductions();
    }
  }

  // ============================================================================
  // DATA LOADING HELPERS
  // ============================================================================

  private loadProductionUnits(): void {
    if (!this.selectedFarm) return;
    console.log('Loading production units for farm:', this.selectedFarm);

    this.productionUnitService.getByFarm(this.selectedFarm).subscribe({
      next: (units: any) => {
        // If API returns { productionUnits: [...] }, extract the array
        let productionUnitsArray: any[] = [];
        if (Array.isArray(units)) {
          productionUnitsArray = units;
        } else if (units && Array.isArray(units.productionUnits)) {
          productionUnitsArray = units.productionUnits;
        } else if (units && typeof units === 'object') {
          // If it's a single object, wrap it in an array
          productionUnitsArray = [units];
        }
        console.log('Production units loaded:', productionUnitsArray);
        this.productionUnits = productionUnitsArray;
        if (productionUnitsArray.length > 0) {
          this.selectedProductionUnit = productionUnitsArray[0].id;
          this.loadCropProductions();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading production units:', error);
        this.productionUnits = [];
        this.cdr.detectChanges();
      }
    });
  }

  private loadCropProductions(): void {
    if (!this.selectedProductionUnit) return;

    this.cropProductionService.getByProductionUnit(this.selectedProductionUnit).subscribe({
      next: (crops: any) => {
        // If API returns { cropProductions: [...] }, extract the array
        let cropsArray: any[] = [];
        if (Array.isArray(crops)) {
          cropsArray = crops;
        } else if (crops && Array.isArray(crops.cropProductions)) {
          cropsArray = crops.cropProductions;
        } else if (crops && typeof crops === 'object') {
          // If it's a single object, wrap it in an array
          cropsArray = [crops];
        }
        this.cropProductions = cropsArray;
        if (cropsArray.length > 0) {
          this.selectedCropProduction = cropsArray[0].id;
          this.onCropProductionChange();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading crop productions:', error);
        this.cropProductions = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  refreshData(): void {
    this.loadRealTimeData().subscribe();
  }

  formatTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  // ============================================================================
  // GETTERS FOR TEMPLATE
  // ============================================================================

  get selectedFarmName(): string {
    const farm = this.farms.find(f => f.id === this.selectedFarm);
    return farm ? farm.name : 'Seleccione una finca';
  }

  get selectedProductionUnitName(): string {
    const unit = this.productionUnits.find(u => u.id === this.selectedProductionUnit);
    return unit ? (unit.name ?? 'Seleccione una unidad') : 'Seleccione una unidad';
  }

  get selectedCropProductionName(): string {
    const crop = this.cropProductions.find(c => c.id === this.selectedCropProduction);
    return crop ? crop.name || 'Producción sin nombre' : 'Seleccione un cultivo';
  }

  get lastUpdateFormatted(): string {
    return (this.currentClimate.lastUpdate).toString();
  }

  // ============================================================================
  // DEVICE STATUS METHODS
  // ============================================================================


  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  handleChartError(error: any, chartName: string): void {
    console.error(`Error in ${chartName}:`, error);
    this.errorMessage = `Error actualizando ${chartName}`;
    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.detectChanges();
    }, 5000);
  }

  retry(): void {
    this.errorMessage = null;
    this.isLoading = true;
    this.loadInitialData();
  }


  // Getter for dashboardSummary to access the latest value from dashboardSummary$
  get dashboardSummary(): any {
    return this.dashboardSummary$.value;
  }

  // Helper method to safely get climate values
  getClimateValue(property: string): number | null {
    if (property === 'temperature') {
      return this.currentClimate.temperature || null;
    } else if (property === 'windSpeed') {
      return this.currentClimate.windSpeed || null;
    }

    if (!this.dashboardSummary?.climate) {
      return null;
    }
    return this.dashboardSummary.climate[property] || null;
  }

  // Get device progress percentage
  getDeviceProgressPercentage(): number {
    if (!this.dashboardSummary?.totalDevices || this.dashboardSummary.totalDevices === 0) {
      return 0;
    }
    return (this.dashboardSummary.activeDevices / this.dashboardSummary.totalDevices) * 100;
  }

  // Get recent alerts (limit to 3)
  getRecentAlerts(): any[] {
    if (!this.dashboardSummary?.alerts) {
      return [];
    }
    return this.dashboardSummary.alerts.slice(0, 3);
  }

  // Get alert CSS class based on severity
  getAlertClass(severity: string): string {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'alert-danger';
      case 'medium':
        return 'alert-warning';
      case 'low':
        return 'alert-info';
      default:
        return 'alert-secondary';
    }
  }

  // Get soil device display name
  getSoilDeviceName(deviceId: string): string {
    if (deviceId.includes('ph-suelo')) {
      return 'Sensor pH Suelo';
    } else if (deviceId.includes('suelo')) {
      return 'Sensor Suelo';
    }
    return deviceId;
  }

  // Get flow device display name
  getFlowDeviceName(deviceId: string): string {
    if (deviceId.includes('flujo')) {
      return 'Sensor Flujo';
    }
    return deviceId;
  }

  // Get device icon based on device type
  getDeviceIcon(deviceId: string): string {
    if (deviceId.includes('estacion-metereologica')) {
      return 'bi-cloud-sun';
    } else if (deviceId.includes('flujo')) {
      return 'bi-droplet';
    } else if (deviceId.includes('ph-suelo') || deviceId.includes('suelo')) {
      return 'bi-moisture';
    } else if (deviceId.includes('presion')) {
      return 'bi-speedometer';
    }
    return 'bi-cpu';
  }

  // Get device display name
  getDeviceDisplayName(deviceId: string): string {
    if (deviceId.includes('estacion-metereologica')) {
      return 'Estación Meteorológica';
    } else if (deviceId.includes('flujo')) {
      return 'Sensor de Flujo';
    } else if (deviceId.includes('ph-suelo')) {
      return 'Sensor pH Suelo';
    } else if (deviceId.includes('suelo')) {
      return 'Sensor de Suelo';
    } else if (deviceId.includes('presion')) {
      return 'Sensor de Presión';
    }
    return deviceId;
  }

  // Update existing getter properties to work with new data structure
  get hasActiveAlerts(): boolean {
    return this.dashboardSummary?.alerts && this.dashboardSummary.alerts.length > 0 || false;
  }

  get criticalAlertsCount(): number {
    if (!this.dashboardSummary?.alerts) return 0;
    return this.dashboardSummary.alerts.filter((alert: { severity: string; }) =>
      alert.severity === 'critical' || alert.severity === 'high'
    ).length;
  }

  get highAlertsCount(): number {
    if (!this.dashboardSummary?.alerts) return 0;
    return this.dashboardSummary.alerts.filter((alert: { severity: string; }) =>
      alert.severity === 'high'
    ).length;
  }

  // Update existing methods to work with new data structure
  getDeviceStatusSummary(): string {
    if (!this.dashboardSummary) {
      return 'Sin datos';
    }

    const active = this.dashboardSummary.activeDevices || 0;
    const total = this.dashboardSummary.totalDevices || 0;

    if (total === 0) {
      return 'Sin dispositivos';
    }

    const percentage = Math.round((active / total) * 100);
    return `${active}/${total} (${percentage}%)`;
  }

  getFlowSummary(): string {
    if (!this.dashboardSummary?.totalFlowRate) {
      return 'Sin datos de flujo';
    }

    return `${this.dashboardSummary.totalFlowRate.toLocaleString()} L`;
  }

  getSoilSummary(): string {
    if (!this.dashboardSummary?.soil || this.dashboardSummary.soil.length === 0) {
      return 'Sin datos de suelo';
    }

    const soilSensors = this.dashboardSummary.soil.length;
    const avgPh = this.dashboardSummary.soil
      .filter((s: { ph: undefined; }) => s.ph !== undefined)
      .reduce((sum: number, s: { ph: number; }, _: any, arr: string | any[]) => sum + s.ph / arr.length, 0);

    if (avgPh > 0) {
      return `${soilSensors} sensores - pH: ${avgPh.toFixed(1)}`;
    }

    return `${soilSensors} sensores activos`;
  }

  getSystemStatusClass(): string {
    const status = this.dashboardSummary?.systemStatus?.toLowerCase() || '';

    if (status.includes('operational') || status.includes('normal')) {
      return 'bg-success';
    } else if (status.includes('warning') || status.includes('alerta')) {
      return 'bg-warning';
    } else if (status.includes('error') || status.includes('critical')) {
      return 'bg-danger';
    }

    return 'bg-secondary';
  }

  // Update temperature and humidity status methods to use new data structure
  getTemperatureStatus(): string {
    const temp = this.getClimateValue('temperature');
    if (temp === null) return 'normal';

    if (temp > 35) return 'high';
    if (temp < 10) return 'low';
    return 'normal';
  }

  getHumidityStatus(): string {
    const humidity = this.getClimateValue('humidity');
    if (humidity === null) return 'normal';

    if (humidity > 80) return 'high';
    if (humidity < 30) return 'low';
    return 'normal';
  }

  // Updated methods to fix the climate chart data issue

  // 1. Update the setupReactiveUpdates method to include climate chart updates
  private setupReactiveUpdates(): void {
    // Set up real-time data updates every 30 seconds
    interval(10000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.loadRealTimeData())
      )
      .subscribe();

    // Initial real-time data load
    this.loadRealTimeData();

    // Subscribe to climate data changes
    this.climateData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(climate => {
        this.currentClimate = climate;
        this.updateTemperatureGauge();
        this.updateWindSpeedGauge();
        this.cdr.detectChanges();
      });

    // Subscribe to dashboard summary changes
    this.dashboardSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.systemStatus = summary.systemStatus;
        if (summary.systemStatus) {
          this.deviceCount = summary.systemStatus.totalDevices;
          this.activeDeviceCount = summary.systemStatus.activeDevices;
        }
        this.updateMainChart(summary);

        // ADD THIS LINE: Update climate chart when dashboard summary changes
        this.updateClimateChart(summary);

        this.cdr.detectChanges();
      });
  }

  // 2. Update the updateClimateChart method to use real-time data
  private updateClimateChart(summary?: any): void {
    if (!this.climateChart) return;

    // Use real-time data from summary if available
    if (summary && summary.climateReadings && summary.climateReadings.length > 0) {
      // Use the real-time climate readings
      const climateReadings = summary.climateReadings;

      // Create labels from timestamps (last 10 readings)
      const labels = climateReadings.slice(-10).map((reading: any) => reading.timestamp);

      // Extract temperature data (from soil readings if climate doesn't have temp)
      const tempData = climateReadings.slice(-10).map((reading: any) => {
        // Try climate reading first, then soil reading
        return reading.temperature ||
          (summary.soilReadings && summary.soilReadings[0]?.temperature) ||
          null;
      });

      // Extract humidity data
      const humidityData = climateReadings.slice(-10).map((reading: any) => reading.humidity || null);

      // Update chart with real-time data
      this.climateChart.data.labels = labels;
      this.climateChart.data.datasets[0].data = tempData;
      this.climateChart.data.datasets[1].data = humidityData;
      this.climateChart.update();

      console.log('Climate chart updated with real-time data:', { labels, tempData, humidityData });
      return;
    }

    // Fallback: Load historical data if no real-time data available
    if (!this.selectedCropProduction) return;

    // Load last 7 days of climate data
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.irrigationService.getHistoricalData(
      this.selectedCropProduction,
      startDate,
      endDate,
      ['TEMP', 'HUM', 'temperature', 'humidity']
    ).subscribe(data => {
      if (data.timeSeries.length === 0) return;

      const labels = data.timeSeries.map(item => item.timestamp);

      const tempData = data.timeSeries.map(item => {
        const tempKey = Object.keys(item).find(key =>
          key.includes('TEMP') || key.includes('temperature')
        );
        return tempKey ? item[tempKey] : null;
      });

      const humidityData = data.timeSeries.map(item => {
        const humKey = Object.keys(item).find(key =>
          key.includes('HUM') || key.includes('humidity')
        );
        return humKey ? item[humKey] : null;
      });

      this.climateChart!.data.labels = labels;
      this.climateChart!.data.datasets[0].data = tempData;
      this.climateChart!.data.datasets[1].data = humidityData;
      this.climateChart!.update();

      console.log('Climate chart updated with historical data:', { labels, tempData, humidityData });
    });
  }

  // 3. Update the loadRealTimeData method to better extract climate data
  private loadRealTimeData(): Observable<any> {
    if (!this.selectedCropProduction) {
      this.selectedCropProduction = this.cropProductions.length > 0 ? this.cropProductions[0].id : 1;
    }

    this.loadingMessage = 'Actualizando datos en tiempo real...';

    return combineLatest([
      this.irrigationService.getDeviceDataSummary(this.selectedCropProduction),
      this.irrigationService.getIrrigationSystemStatus(
        this.selectedFarm || 0,
        this.selectedCropProduction
      )
    ]).pipe(
      map(([dataSummary, systemStatus]: [any, any]) => {
        console.log('Real-time data loaded:', dataSummary, systemStatus);

        // Extract climate data - prioritize systemStatus.climateReadings
        const climateReadings = systemStatus?.climateReadings || dataSummary?.climateReadings || [];
        if (climateReadings.length > 0) {
          const latestClimate = climateReadings[0]; // Most recent reading

          const climateData: ClimateData = {
            temperature: latestClimate.temperature ||
              (systemStatus?.soilReadings && systemStatus.soilReadings[0]?.temperature) ||
              (dataSummary?.soil && dataSummary.soil[0]?.temperature) ||
              null,
            humidity: latestClimate.humidity || null,
            pressure: latestClimate.pressure || null,
            windSpeed: latestClimate.windSpeed || null,
            windDirection: latestClimate.windDirection || null,
            solarRadiation: latestClimate.solarRadiation || null,
            precipitation: latestClimate.precipitation || null,
            lastUpdate: new Date(latestClimate.timestamp || systemStatus?.lastUpdate || dataSummary?.lastUpdate || new Date())
          };

          this.climateData$.next(climateData);
        }

        // Create comprehensive dashboard summary
        const summary = {
          // Climate data from systemStatus (more complete)
          climate: systemStatus?.climateReadings?.[0] || dataSummary?.climate || null,
          climateReadings: systemStatus?.climateReadings || [], // ADD THIS for chart updates

          // Soil data - combine from both sources
          soil: systemStatus?.soilReadings || dataSummary?.soil || [],
          soilReadings: systemStatus?.soilReadings || [], // ADD THIS for chart updates

          // Flow data
          flow: systemStatus?.flowReadings || dataSummary?.flow || [],

          // System information
          systemStatus: systemStatus?.systemStatus || 'Unknown',
          farmId: systemStatus?.farmId || dataSummary?.farmId,

          // Device information
          devices: systemStatus?.devices || [],
          activeDevices: systemStatus?.activeDevices || 0,
          totalDevices: systemStatus?.totalDevices || 0,

          // Alerts and monitoring
          alerts: systemStatus?.alerts || [],

          // Flow metrics
          totalFlowRate: systemStatus?.totalFlowRate || 0,
          systemPressure: systemStatus?.systemPressure,

          // Timestamps
          lastUpdate: systemStatus?.lastUpdate || dataSummary?.lastUpdate || new Date().toISOString(),

          // Additional measurements structure
          measurements: systemStatus?.measurements || {
            flow: [],
            humidity: [],
            pressure: [],
            soilMoisture: [],
            temperature: []
          },

          // Raw data for debugging/advanced use
          _raw: {
            dataSummary,
            systemStatus
          }
        };

        console.log('Combined dashboard summary with climate readings:', summary);

        this.dashboardSummary$.next(summary);

        return {
          dataSummary,
          systemStatus,
          combinedSummary: summary
        };
      }),
      catchError(error => {
        console.error('Error loading real-time data:', error);

        // Provide empty structure on error
        const errorSummary = {
          climate: null,
          climateReadings: [],
          soil: [],
          soilReadings: [],
          flow: [],
          systemStatus: 'Error loading data',
          farmId: null,
          devices: [],
          activeDevices: 0,
          totalDevices: 0,
          alerts: [],
          totalFlowRate: 0,
          systemPressure: null,
          lastUpdate: new Date().toISOString(),
          measurements: {
            flow: [],
            humidity: [],
            pressure: [],
            soilMoisture: [],
            temperature: []
          }
        };

        this.dashboardSummary$.next(errorSummary);
        return of(null);
      })
    );
  }

  // 4. Add a method to manually refresh climate chart
  refreshClimateChart(): void {
    const currentSummary = this.dashboardSummary$.value;
    if (currentSummary) {
      this.updateClimateChart(currentSummary);
    }
  }

  // 5. Update the onCropProductionChange method to refresh climate chart
  onCropProductionChange(): void {
    if (this.selectedCropProduction) {
      // Reset charts and load new data
      this.destroyCharts();
      setTimeout(() => {
        this.initializeCharts();
        this.loadRealTimeData().subscribe(() => {
          // Ensure climate chart gets updated after data loads
          setTimeout(() => this.refreshClimateChart(), 500);
        });
      }, 100);
    }
  }

  private updateMainChart(summary: DashboardSummary): void {
  if (!this.mainChart || !this.selectedCropProduction) return;

  // Load historical data for the chart
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

  this.irrigationService.getHistoricalData(
    this.selectedCropProduction,
    startDate,
    endDate,
    ['temperature', 'humidity', 'Water_flow_value', 'PH1_SOIL']
  ).subscribe(data => {
    if (data.timeSeries.length === 0) return;

    // Prepare chart data
    const labels = data.timeSeries.map(item => item.timestamp);
    const datasets: any[] = [];

    // Temperature dataset
    const tempData = data.timeSeries.map(item => {
      const tempKey = Object.keys(item).find(key => key.includes('temperature') || key.includes('TEMP'));
      return tempKey ? item[tempKey] : null;
    });

    // Humidity dataset
    const humidityData = data.timeSeries.map(item => {
      const humKey = Object.keys(item).find(key => key.includes('HUM') || key.includes('humidity'));
      return humKey ? item[humKey] : null;
    });

    // Flow dataset
    const flowData = data.timeSeries.map(item => {
      const flowKey = Object.keys(item).find(key => key.includes('Water_flow_value') || key.includes('flow'));
      return flowKey ? item[flowKey] : null;
    });

    // pH dataset
    const phData = data.timeSeries.map(item => {
      const phKey = Object.keys(item).find(key => key.includes('PH1_SOIL') || key.includes('ph'));
      return phKey ? item[phKey] : null;
    });

    // Determine primary axis based on available data priority
    let primaryAxis = { label: '', unit: '' };
    let primaryDataExists = false;

    // Priority order: Temperature > Flow > pH > Humidity
    if (tempData.some(val => val !== null)) {
      primaryAxis = { label: 'Temperatura', unit: '°C' };
      primaryDataExists = true;
      datasets.push({
        label: 'Temperatura (°C)',
        data: tempData,
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        spanGaps: true
      });
    } else if (flowData.some(val => val !== null)) {
      primaryAxis = { label: 'Flujo de Agua', unit: 'L/h' };
      primaryDataExists = true;
      datasets.push({
        label: 'Flujo de Agua (L/h)',
        data: flowData,
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        spanGaps: true
      });
    } else if (phData.some(val => val !== null)) {
      primaryAxis = { label: 'pH del Suelo', unit: 'pH' };
      primaryDataExists = true;
      datasets.push({
        label: 'pH del Suelo',
        data: phData,
        borderColor: '#9966ff',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        tension: 0.4,
        spanGaps: true
      });
    } else if (humidityData.some(val => val !== null)) {
      primaryAxis = { label: 'Humedad', unit: '%' };
      primaryDataExists = true;
      datasets.push({
        label: 'Humedad (%)',
        data: humidityData,
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        spanGaps: true
      });
    }

    // Add secondary datasets if they exist and are different from primary
    if (primaryAxis.label !== 'Temperatura' && tempData.some(val => val !== null)) {
      datasets.push({
        label: 'Temperatura (°C)',
        data: tempData,
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        spanGaps: true,
        yAxisID: 'y1'
      });
    }

    if (primaryAxis.label !== 'Humedad' && humidityData.some(val => val !== null)) {
      datasets.push({
        label: 'Humedad (%)',
        data: humidityData,
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        spanGaps: true,
        yAxisID: primaryAxis.label === 'Temperatura' ? 'y1' : 'y2'
      });
    }

    if (primaryAxis.label !== 'Flujo de Agua' && flowData.some(val => val !== null)) {
      datasets.push({
        label: 'Flujo de Agua (L/h)',
        data: flowData,
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        spanGaps: true,
        yAxisID: datasets.length === 1 ? 'y1' : datasets.length === 2 ? 'y2' : 'y3'
      });
    }

    if (primaryAxis.label !== 'pH del Suelo' && phData.some(val => val !== null)) {
      datasets.push({
        label: 'pH del Suelo',
        data: phData,
        borderColor: '#9966ff',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        tension: 0.4,
        spanGaps: true,
        yAxisID: datasets.length === 1 ? 'y1' : datasets.length === 2 ? 'y2' : 'y3'
      });
    }

    // Update chart
    this.mainChart!.data.labels = labels;
    this.mainChart!.data.datasets = datasets;

    // Update scales dynamically based on actual data
    const options = this.mainChart!.options as any;
    options.scales = {
      x: {
        type: 'time',
        time: {
          unit: 'hour'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: `${primaryAxis.label} (${primaryAxis.unit})`
        }
      }
    };

    // Add secondary axes if needed
    let axisCount = 1;
    const usedAxes = new Set(['y']);

    datasets.forEach(dataset => {
      if (dataset.yAxisID && !usedAxes.has(dataset.yAxisID)) {
        axisCount++;
        usedAxes.add(dataset.yAxisID);

        let axisLabel = '';
        let axisUnit = '';
        
        if (dataset.label.includes('Temperatura')) {
          axisLabel = 'Temperatura';
          axisUnit = '°C';
        } else if (dataset.label.includes('Humedad')) {
          axisLabel = 'Humedad';
          axisUnit = '%';
        } else if (dataset.label.includes('Flujo')) {
          axisLabel = 'Flujo';
          axisUnit = 'L/h';
        } else if (dataset.label.includes('pH')) {
          axisLabel = 'pH';
          axisUnit = 'pH';
        }

        options.scales[dataset.yAxisID] = {
          type: 'linear',
          display: axisCount <= 2, // Only show first two axes
          position: axisCount === 2 ? 'right' : 'right',
          title: {
            display: true,
            text: `${axisLabel} (${axisUnit})`
          },
          grid: {
            drawOnChartArea: axisCount !== 1, // Don't draw grid for secondary axes
          }
        };
      }
    });

    this.mainChart!.update();
  });
}
}