// src/app/features/dashboard/shiny-dashboard/shiny-dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, interval, BehaviorSubject, combineLatest, forkJoin, throwError } from 'rxjs';
import { takeUntil, switchMap, catchError, startWith, map, debounceTime } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Models
import { Farm, ProductionUnit, CropProduction, Company } from '../../../core/models/models';

// Services
import { FarmService } from '../../farms/services/farm.service';
import { CompanyService } from '../../companies/services/company.service';
import { ProductionUnitService } from '../../production-units/services/production-unit.service';
import { CropProductionService } from '../../crop-production/services/crop-production.service';
import { DeviceService } from '../../devices/services/device.service';
import { SensorService } from '../../sensors/services/sensor.service';
import { CropService } from '../../crops/services/crop.service';
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

interface MeasurementBase {
  id: number;
  cropProductionId: number;
  measurementVariableId: number;
  recordDate: string;
  value: number;
  measurementVariable?: MeasurementVariable;
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

  // Dashboard State
  activeTab = 'climate_dashboard';
  isLoading = false;
  isLoadingData = false;
  errorMessage = '';

  // Selections
  selectedFarm: number | null = null;
  selectedProductionUnit: number | null = null;
  selectedCropProduction: number | null = null;
  selectedGraph: string = '';
  selectedSeries: number[] = [];
  selectedPlotElements: string[] = ['AvgValue'];

  // Data
  farms: Farm[] = [];
  productionUnits: ProductionUnit[] = [];
  cropProductions: CropProduction[] = [];
  measurementVariables: MeasurementVariable[] = [];
  measurementUnits: MeasurementUnit[] = [];
  calculationSettings: CalculationSetting[] = [];
  dynamicGraphs: DynamicGraphConfig[] = [];
  analyticalEntities: AnalyticalEntity[] = [];
  measurementData: MeasurementData[] = [];
  climateBaseData: MeasurementBase[] = [];
  cropPhases: CropPhase[] = [];
  companyData: Company | null = null;

  climateData$ = new BehaviorSubject<ClimateData>({
    temperature: 0,
    windSpeed: 0,
    windDirection: 0,
    humidity: 0,
    pressure: 0,
    lastUpdate: new Date()
  });

  // Configuration
  currentCompanyId = 0;
  dateRange = {
    start: this.formatDateForInput(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), // 60 days ago
    end: this.formatDateForInput(new Date())
  };

  // Charts
  temperatureChart: Chart | null = null;
  windSpeedChart: Chart | null = null;
  mainChart: Chart | null = null;
  climateTimeChart: Chart | null = null;

  // Plot options
  plotElementOptions = [
    { id: 'AvgValue', label: 'Media' },
    { id: 'MinValue', label: 'Mínimo' },
    { id: 'MaxValue', label: 'Máximo' },
    { id: 'SumValue', label: 'Suma' }
  ];

  // Standard measurement variable IDs for different categories
  private readonly MEASUREMENT_STANDARDS = {
    GROWING_MEDIUM: 1,
    SOIL_NUTRIENTS: 2,
    SOLUTION_NUTRIENTS: 3,
    RADIATION: 4,
    TEMPERATURE: 5,
    HUMIDITY: 6,
    PAR: 7
  };

  constructor(
    private farmService: FarmService,
    private companyService: CompanyService,
    private productionUnitService: ProductionUnitService,
    private cropProductionService: CropProductionService,
    private deviceService: DeviceService,
    private sensorService: SensorService,
    private cropService: CropService,
    private measurementService: MeasurementService,
    private calculationSettingService: CalculationSettingService,
    private measurementUnitService: MeasurementUnitService,
    private analyticalEntityService: AnalyticalEntityService,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedPlotElements = ['AvgValue'];
  }

  ngOnInit(): void {
    this.waitForInitialData().then(() => {
      console.log('Initial data loading triggered... farms: ', this.farms, ' measurementUnits: ', this.measurementUnits, ' analyticalEntities: ', this.analyticalEntities);
      this.startClimateDataPolling();
    });
  }

  private async waitForInitialData(): Promise<void> {
    await this.loadInitialData();
  }

  ngAfterViewInit(): void {
    // Charts will be created when each tab is activated
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyAllCharts();
  }

  // === INITIAL DATA LOADING ===

  private loadInitialData(): Promise<void> {
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      // Load reference data first
      forkJoin({
        farms: this.farmService.getAll(true),
        measurementUnits: this.measurementUnitService.getAll(),
        analyticalEntities: this.analyticalEntityService.getAll()
      }).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading initial data:', error);
          this.errorMessage = 'Error loading initial data';
          this.isLoading = false;
          reject(error);
          return throwError(error);
        })
      ).subscribe({
        next: (data: any) => {
          console.log('Initial data loaded:', data);

          // Extract arrays from response objects
          this.farms = data.farms;
          this.measurementUnits = data.measurementUnits.measurementUnits || data.measurementUnits;
          this.analyticalEntities = data.analyticalEntities.analiticalEntities || data.analyticalEntities;

          this.isLoading = false;
          resolve();
        },
        error: (error) => {
          console.error('Error in initial data loading:', error);
          this.isLoading = false;
          reject(error);
        }
      });
    });
  }

  // === HIERARCHICAL DATA LOADING ===

  onFarmChange(): void {
    console.log('onFarmChange triggered with selectedFarm:', this.selectedFarm);
    if (this.selectedFarm) {
      this.resetSelections('farm');
      this.loadCompanyData();
      this.loadProductionUnits();
    }
  }


  private loadProductionUnits(): void {
    if (!this.selectedFarm) return;

    this.productionUnitService.getByFarm(this.selectedFarm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.productionUnits = response.productionUnits || response;
        },
        error: (error) => {
          console.error('Error loading production units:', error);
        }
      });
  }

  onProductionUnitChange(): void {
    if (this.selectedProductionUnit) {
      this.resetSelections('productionUnit');
      this.loadCropProductions();
    }
  }

  private loadCropProductions(): void {
    if (!this.selectedProductionUnit) return;

    this.cropProductionService.getByProductionUnit(this.selectedProductionUnit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.cropProductions = response.cropProductions.cropProductions || response.cropProductions || response;
        },
        error: (error) => {
          console.error('Error loading crop productions:', error);
        }
      });
  }


  private loadCropPhases(): void {
    const cropProduction = this.cropProductions.find(cp => cp.id === this.selectedCropProduction);
    if (cropProduction && cropProduction.cropId) {
      this.cropService.getCropPhases(cropProduction.cropId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (phases) => {
            this.cropPhases = phases;
          },
          error: (error) => {
            console.error('Error loading crop phases:', error);
          }
        });
    }
  }

  // === DYNAMIC GRAPH CREATION ===

  private createDynamicGraphs(): void {
    this.dynamicGraphs = [];

    // Climate Graph
    const climateVariables = this.measurementVariables.filter(v =>
      [this.MEASUREMENT_STANDARDS.TEMPERATURE, this.MEASUREMENT_STANDARDS.HUMIDITY,
      this.MEASUREMENT_STANDARDS.RADIATION, this.MEASUREMENT_STANDARDS.PAR].includes(v.measurementVariableStandardId || 0)
    );

    console.log('Climate variables identified for graph:', climateVariables);

    if (climateVariables.length > 0) {
      this.dynamicGraphs.push({
        id: 'climate-graph',
        name: 'Variables Climáticas',
        summaryTimeScale: 'hour',
        yAxisScaleType: 'auto',
        category: 'climate',
        series: climateVariables.map((variable, index) => ({
          geomtype: 'Line',
          measurementVariableId: variable.id,
          axis: 'Primary',
          color: this.getVariableColor(variable, index),
          visible: true,
          createStats: true,
          line_width: 2,
          line_Transparency: 0.8,
          name: variable.name
        }))
      });
    }

    // Nutrients Graph
    const nutrientVariables = this.measurementVariables.filter(v =>
      [this.MEASUREMENT_STANDARDS.SOIL_NUTRIENTS, this.MEASUREMENT_STANDARDS.SOLUTION_NUTRIENTS].includes(v.measurementVariableStandardId || 0)
    );

    if (nutrientVariables.length > 0) {
      this.dynamicGraphs.push({
        id: 'nutrients-graph',
        name: 'Nutrientes',
        summaryTimeScale: 'day',
        yAxisScaleType: 'auto',
        category: 'nutrients',
        series: nutrientVariables.map((variable, index) => ({
          geomtype: 'Line',
          measurementVariableId: variable.id,
          axis: 'Primary',
          color: this.getNutrientColor(variable, index),
          visible: true,
          createStats: true,
          line_width: 2,
          line_Transparency: 0.8,
          name: variable.name
        }))
      });
    }

    // Growing Medium Graph
    const growingMediumVariables = this.measurementVariables.filter(v =>
      v.measurementVariableStandardId === this.MEASUREMENT_STANDARDS.GROWING_MEDIUM
    );

    if (growingMediumVariables.length > 0) {
      this.dynamicGraphs.push({
        id: 'growing-medium-graph',
        name: 'Medio de Cultivo',
        summaryTimeScale: 'hour',
        yAxisScaleType: 'auto',
        category: 'environment',
        series: growingMediumVariables.map((variable, index) => ({
          geomtype: 'Line',
          measurementVariableId: variable.id,
          axis: 'Primary',
          color: this.getEnvironmentColor(variable, index),
          visible: true,
          createStats: true,
          line_width: 2,
          line_Transparency: 0.8,
          name: variable.name
        }))
      });
    }

    // General Variables Graph
    const otherVariables = this.measurementVariables.filter(v =>
      !v.measurementVariableStandardId ||
      ![this.MEASUREMENT_STANDARDS.TEMPERATURE, this.MEASUREMENT_STANDARDS.HUMIDITY,
      this.MEASUREMENT_STANDARDS.RADIATION, this.MEASUREMENT_STANDARDS.PAR,
      this.MEASUREMENT_STANDARDS.SOIL_NUTRIENTS, this.MEASUREMENT_STANDARDS.SOLUTION_NUTRIENTS,
      this.MEASUREMENT_STANDARDS.GROWING_MEDIUM].includes(v.measurementVariableStandardId)
    );

    if (otherVariables.length > 0) {
      this.dynamicGraphs.push({
        id: 'general-graph',
        name: 'Variables Generales',
        summaryTimeScale: 'day',
        yAxisScaleType: 'auto',
        category: 'custom',
        series: otherVariables.map((variable, index) => ({
          geomtype: 'Line',
          measurementVariableId: variable.id,
          axis: 'Primary',
          color: this.getGeneralColor(index),
          visible: true,
          createStats: true,
          line_width: 2,
          line_Transparency: 0.8,
          name: variable.name
        }))
      });
    }

    console.log('Dynamic graphs created:', this.dynamicGraphs);
  }

  private getVariableColor(variable: MeasurementVariable, index: number): string {
    const climateColors = ['#e17055', '#74b9ff', '#fdcb6e', '#00b894'];

    if (variable.measurementVariableStandardId === this.MEASUREMENT_STANDARDS.TEMPERATURE) {
      return '#e17055'; // Red for temperature
    } else if (variable.measurementVariableStandardId === this.MEASUREMENT_STANDARDS.HUMIDITY) {
      return '#74b9ff'; // Blue for humidity
    } else if (variable.measurementVariableStandardId === this.MEASUREMENT_STANDARDS.RADIATION) {
      return '#fdcb6e'; // Yellow for radiation
    } else if (variable.measurementVariableStandardId === this.MEASUREMENT_STANDARDS.PAR) {
      return '#00b894'; // Green for PAR
    }

    return climateColors[index % climateColors.length];
  }

  private getNutrientColor(variable: MeasurementVariable, index: number): string {
    const nutrientColors = ['#a29bfe', '#fd79a8', '#fdcb6e', '#e84393', '#00b894', '#6c5ce7'];
    return nutrientColors[index % nutrientColors.length];
  }

  private getEnvironmentColor(variable: MeasurementVariable, index: number): string {
    const environmentColors = ['#00b894', '#55a3ff', '#fd79a8', '#fdcb6e'];
    return environmentColors[index % environmentColors.length];
  }

  private getGeneralColor(index: number): string {
    const generalColors = ['#636e72', '#74b9ff', '#fd79a8', '#fdcb6e', '#00b894', '#e17055'];
    return generalColors[index % generalColors.length];
  }

  // === MEASUREMENT DATA LOADING ===

  private startMeasurementDataLoading(): void {
    // Load initial data
    this.loadMeasurementData();

    // Set up periodic updates
    interval(60000) // every minute
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMeasurementData();
      });
  }



  // === CLIMATE DATA POLLING ===

  private startClimateDataPolling(): void {
    interval(30000) // every 30 seconds
      .pipe(
        startWith(0),
        takeUntil(this.destroy$),
        switchMap(() => this.loadLatestClimateData())
      )
      .subscribe();
  }

  private loadLatestClimateData(): Observable<ClimateData> {
    if (!this.selectedCropProduction) {
      // Return mock data if no crop production selected
      return new Observable(observer => {
        const mockData: ClimateData = this.generateMockClimateData();
        this.climateData$.next(mockData);
        observer.next(mockData);
        observer.complete();
      });
    }

    // Get climate variables (temperature, humidity, wind speed, etc.)
    const climateVariableIds = this.measurementVariables
      .filter(v => this.isClimateVariable(v))
      .map(v => v.id);

    if (climateVariableIds.length === 0) {
      return new Observable(observer => {
        const mockData: ClimateData = this.generateMockClimateData();
        this.climateData$.next(mockData);
        observer.next(mockData);
        observer.complete();
      });
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // last 24 hours

    const climateRequests = climateVariableIds.map(variableId =>
      this.measurementService.getMeasurementBase(
        this.selectedCropProduction!,
        variableId,
        this.formatDateTimeForAPI(startDate),
        this.formatDateTimeForAPI(endDate)
      )
    );

    return forkJoin(climateRequests)
      .pipe(
        map(results => {
          const allData = results.flat();
          const climateData = this.processClimateData(allData);
          this.climateData$.next(climateData);
          this.climateBaseData = allData;
          this.updateClimateTimeChart();
          return climateData;
        }),
        catchError(error => {
          console.error('Error loading climate data:', error);
          const mockData: ClimateData = this.generateMockClimateData();
          this.climateData$.next(mockData);
          return new Observable<ClimateData>(observer => {
            observer.next(mockData);
            observer.complete();
          });
        })
      ) as Observable<ClimateData>;
  }

  private isClimateVariable(variable: MeasurementVariable): boolean {
    const climateStandardIds = [4, 5, 6, 7]; // radiation, temperature, humidity, PAR
    return climateStandardIds.includes(variable.measurementVariableStandardId || 0) ||
      variable.name.toLowerCase().includes('temp') ||
      variable.name.toLowerCase().includes('humidity') ||
      variable.name.toLowerCase().includes('wind') ||
      variable.name.toLowerCase().includes('pressure');
  }

  private processClimateData(data: MeasurementBase[]): ClimateData {
    const now = new Date();

    // Get latest values for each climate variable
    const temperatureData = data.filter(d =>
      d.measurementVariable?.name.toLowerCase().includes('temp') ||
      d.measurementVariable?.measurementVariableStandardId === 5
    ).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0];

    const humidityData = data.filter(d =>
      d.measurementVariable?.name.toLowerCase().includes('humidity') ||
      d.measurementVariable?.measurementVariableStandardId === 6
    ).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0];

    const windSpeedData = data.filter(d =>
      d.measurementVariable?.name.toLowerCase().includes('wind')
    ).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0];

    const pressureData = data.filter(d =>
      d.measurementVariable?.name.toLowerCase().includes('pressure')
    ).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0];

    return {
      temperature: temperatureData?.value || 22 + Math.random() * 8,
      humidity: humidityData?.value || 40 + Math.random() * 40,
      windSpeed: windSpeedData?.value || Math.random() * 25,
      windDirection: Math.random() * 360, // This might need separate variable
      pressure: pressureData?.value || 1013 + Math.random() * 20,
      lastUpdate: now
    };
  }

  private generateMockClimateData(): ClimateData {
    return {
      temperature: 22 + Math.random() * 8,
      windSpeed: Math.random() * 25,
      windDirection: Math.random() * 360,
      humidity: 40 + Math.random() * 40,
      pressure: 1013 + Math.random() * 20,
      lastUpdate: new Date()
    };
  }

  // === CHART MANAGEMENT ===

  createTemperatureGauge(): void {
    if (!this.temperatureGaugeRef?.nativeElement) return;

    this.destroyChart('temperature');

    const ctx = this.temperatureGaugeRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const currentTemp = this.climateData$.value.temperature || 0;

    this.temperatureChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [currentTemp, 50 - currentTemp],
          backgroundColor: [
            currentTemp < 15 ? '#74b9ff' :
              currentTemp < 25 ? '#00b894' :
                currentTemp < 35 ? '#fdcb6e' : '#e17055',
            '#e9ecef'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }

  getDaysDifference() {
    const start = new Date(this.dateRange.start);
    const end = new Date(this.dateRange.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }

  updateClimateTimeChart(): void {
    if (!this.climateChartRef?.nativeElement || this.climateBaseData.length === 0) return;

    this.destroyChart('climate');

    const ctx = this.climateChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const temperatureData = this.climateBaseData
      .filter(d => d.measurementVariable?.measurementVariableStandardId === 5)
      .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());

    const humidityData = this.climateBaseData
      .filter(d => d.measurementVariable?.measurementVariableStandardId === 6)
      .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());

    const labels = temperatureData.map(d => new Date(d.recordDate).toLocaleTimeString());

    this.climateTimeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: temperatureData.map(d => d.value),
            borderColor: '#e17055',
            backgroundColor: 'rgba(225, 112, 85, 0.1)',
            yAxisID: 'y',
            tension: 0.1
          },
          {
            label: 'Humedad (%)',
            data: humidityData.map(d => d.value),
            borderColor: '#74b9ff',
            backgroundColor: 'rgba(116, 185, 255, 0.1)',
            yAxisID: 'y1',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Hora'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Temperatura (°C)'
            },
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
          },
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  updateMainChart(): void {
    if (!this.mainChartRef?.nativeElement || this.measurementData.length === 0) return;

    this.destroyChart('main');

    const ctx = this.mainChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const datasets = this.createDatasets();

    this.mainChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getDateLabels(),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Valores'
            },
            beginAtZero: this.getCurrentGraph()?.yAxisScaleType === 'cero'
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private createDatasets(): any[] {
    const datasets: any[] = [];
    const graph = this.getCurrentGraph();
    if (!graph) return datasets;

    this.selectedSeries.forEach(variableId => {
      const series = graph.series.find(s => s.measurementVariableId === variableId);
      if (!series) return;

      const variable = this.measurementVariables.find(v => v.id === variableId);
      if (!variable) return;

      const variableData = this.measurementData.filter(d => d.measurementVariableId === variableId);

      this.selectedPlotElements.forEach(element => {
        const values = variableData.map(d => {
          switch (element) {
            case 'AvgValue': return d.avgValue;
            case 'MinValue': return d.minValue;
            case 'MaxValue': return d.maxValue;
            case 'SumValue': return d.sumValue;
            default: return d.avgValue;
          }
        });

        const color = this.getSeriesColor(series.color, element);
        const chartType = this.getChartType(series.geomtype);

        const dataset: any = {
          label: `${variable.name} (${this.getElementLabel(element)})`,
          data: values,
          borderColor: color,
          backgroundColor: color + '20',
          tension: series.geomtype === 'Line' ? 0.1 : 0,
          pointRadius: series.geomtype === 'Point' ? (series.shape_size || 3) : 2,
          borderWidth: series.line_width || 2,
          fill: false
        };

        if (series.geomtype === 'Bar') {
          dataset.type = 'bar';
          dataset.backgroundColor = color;
        } else if (series.geomtype === 'RefLine') {
          // For reference lines, create a horizontal line
          dataset.data = Array(variableData.length).fill(series.yintercept || 0);
          dataset.borderDash = [5, 5];
          dataset.pointRadius = 0;
        }

        datasets.push(dataset);
      });
    });

    return datasets;
  }

  private getChartType(geomtype: string): string {
    switch (geomtype) {
      case 'Bar': return 'bar';
      case 'Point': return 'scatter';
      default: return 'line';
    }
  }

  private getDateLabels(): string[] {
    if (this.measurementData.length === 0) return [];

    const uniqueDates = [
      ...new Set(
        this.measurementData
          .map(d => d.recordDate ? d.recordDate.split('T')[0] : undefined)
          .filter((date): date is string => !!date)
      )
    ];
    return uniqueDates.sort();
  }

  private getSeriesColor(baseColor: string, element: string): string {
    switch (element) {
      case 'MinValue': return this.lightenColor(baseColor, 0.3);
      case 'MaxValue': return this.darkenColor(baseColor, 0.3);
      case 'SumValue': return this.darkenColor(baseColor, 0.5);
      default: return baseColor;
    }
  }

  private getElementLabel(element: string): string {
    const labels: { [key: string]: string } = {
      'AvgValue': 'Media',
      'MinValue': 'Mín',
      'MaxValue': 'Máx',
      'SumValue': 'Suma'
    };
    return labels[element] || element;
  }

  // === DYNAMIC GRAPH MANAGEMENT ===
  getMeasurementVariableName(variableId: number): string {
    const variable = this.measurementVariables.find(v => v.id === variableId);
    return variable ? variable.name : `Variable ${variableId}`;
  }

  getMeasurementVariableUnit(variableId: number): string {
    const variable = this.measurementVariables.find(v => v.id === variableId);
    return variable ? variable.unit ?? `Unidad ${variableId}` : `Unidad ${variableId}`;
  }



  // Getter for the graphs property used in the template
  get graphs(): DynamicGraphConfig[] {
    return this.dynamicGraphs;
  }

  // === UTILITY METHODS ===


  createWindSpeedGauge(): void {
    if (!this.windSpeedGaugeRef?.nativeElement) return;

    this.destroyChart('windSpeed');

    const ctx = this.windSpeedGaugeRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const currentSpeed = this.climateData$.value.windSpeed || 0;

    this.windSpeedChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [currentSpeed, 100 - currentSpeed],
          backgroundColor: [
            currentSpeed < 10 ? '#00b894' :
              currentSpeed < 25 ? '#fdcb6e' :
                currentSpeed < 50 ? '#e17055' : '#d63031',
            '#e9ecef'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;

    // Wait for DOM to update
    setTimeout(() => {
      if (tab === 'climate_dashboard') {
        this.createTemperatureGauge();
        this.createWindSpeedGauge();
        this.updateClimateTimeChart();
      } else if (tab === 'hourly_dashboard') {
        this.updateMainChart();
      }
    }, 100);
  }

  setQuickDateRange(days: number): void {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    this.dateRange.start = this.formatDateForInput(startDate);
    this.dateRange.end = this.formatDateForInput(endDate);
    this.loadMeasurementData();
  }

  private destroyChart(chartType: 'temperature' | 'windSpeed' | 'main' | 'climate'): void {
    switch (chartType) {
      case 'temperature':
        if (this.temperatureChart) {
          this.temperatureChart.destroy();
          this.temperatureChart = null;
        }
        break;
      case 'windSpeed':
        if (this.windSpeedChart) {
          this.windSpeedChart.destroy();
          this.windSpeedChart = null;
        }
        break;
      case 'main':
        if (this.mainChart) {
          this.mainChart.destroy();
          this.mainChart = null;
        }
        break;
      case 'climate':
        if (this.climateTimeChart) {
          this.climateTimeChart.destroy();
          this.climateTimeChart = null;
        }
        break;
    }
  }

  private destroyAllCharts(): void {
    this.destroyChart('temperature');
    this.destroyChart('windSpeed');
    this.destroyChart('main');
    this.destroyChart('climate');
  }

  getWindDirectionText(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((degrees % 360) / 22.5) % 16;
    return directions[index];
  }

  private lightenColor(color: string, amount: number): string {
    // Simple color lightening implementation
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  private darkenColor(color: string, amount: number): string {
    // Simple color darkening implementation
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateTimeForAPI(date: Date): string {
    return date.toISOString();
  }

  // === UI EVENT HANDLERS ===

  onPlotElementChange(element: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedPlotElements.includes(element)) {
        this.selectedPlotElements.push(element);
      }
    } else {
      this.selectedPlotElements = this.selectedPlotElements.filter(e => e !== element);
    }

    if (this.selectedPlotElements.length > 0) {
      this.updateMainChart();
    }
  }

  onSeriesChange(variableId: number, event: any): void {
    if (event.target.checked) {
      if (!this.selectedSeries.includes(variableId)) {
        this.selectedSeries.push(variableId);
      }
    } else {
      this.selectedSeries = this.selectedSeries.filter(id => id !== variableId);
    }

    this.loadMeasurementData();
  }

  isSeriesSelected(variableId: number): boolean {
    return this.selectedSeries.includes(variableId);
  }

  isPlotElementSelected(element: string): boolean {
    return this.selectedPlotElements.includes(element);
  }

  executeAnalyticalEntity(entity: AnalyticalEntity): void {
    if (!this.selectedCropProduction) return;
    this.isLoadingData = true;
    this.analyticalEntityService.executeEntity(entity.id, this.selectedCropProduction)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Analytical entity executed:', response);
          this.isLoadingData = false;
          this.loadMeasurementData();
        },
        error: (error) => {
          console.error('Error executing analytical entity:', error);
          this.isLoadingData = false;
        }
      });
  }

  // === MODAL MANAGEMENT ===
  showGraphModal = false;
  showSeriesModal = false;

  openGraphModal(): void {
    this.showGraphModal = true;
  }

  closeGraphModal(): void {
    this.showGraphModal = false;
  }

  openSeriesModal(): void {
    this.showSeriesModal = true;
  }

  closeSeriesModal(): void {
    this.showSeriesModal = false;
  }

  saveGraph(): void {
    // Create a new dynamic graph based on user input
    // For now, this is a placeholder - you would collect form data here
    this.closeGraphModal();
  }

  saveSeries(): void {
    // Add or modify series in the current graph
    // For now, this is a placeholder - you would collect form data here
    this.closeSeriesModal();
  }

  // === NEW DYNAMIC GRAPH CREATION METHODS ===

  createCustomGraph(name: string, variables: number[], timeScale: string = 'day'): void {
    const customGraph: DynamicGraphConfig = {
      id: `custom-${Date.now()}`,
      name: name,
      summaryTimeScale: timeScale as any,
      yAxisScaleType: 'auto',
      category: 'custom',
      series: variables.map((variableId, index) => {
        const variable = this.measurementVariables.find(v => v.id === variableId);
        return {
          geomtype: 'Line',
          measurementVariableId: variableId,
          axis: 'Primary',
          color: this.getGeneralColor(index),
          visible: true,
          createStats: true,
          line_width: 2,
          line_Transparency: 0.8,
          name: variable?.name || `Variable ${variableId}`
        };
      })
    };

    this.dynamicGraphs.push(customGraph);
    this.selectedGraph = customGraph.name;
    this.onGraphChange();
  }

  removeGraph(graphId: string): void {
    this.dynamicGraphs = this.dynamicGraphs.filter(g => g.id !== graphId);
    if (this.selectedGraph === this.dynamicGraphs.find(g => g.id === graphId)?.name) {
      this.selectedGraph = '';
      this.selectedSeries = [];
    }
  }

  duplicateGraph(graphId: string): void {
    const originalGraph = this.dynamicGraphs.find(g => g.id === graphId);
    if (originalGraph) {
      const duplicatedGraph: DynamicGraphConfig = {
        ...originalGraph,
        id: `${originalGraph.id}-copy-${Date.now()}`,
        name: `${originalGraph.name} (Copia)`,
        series: [...originalGraph.series]
      };
      this.dynamicGraphs.push(duplicatedGraph);
    }
  }

  updateGraphConfiguration(graphId: string, config: Partial<DynamicGraphConfig>): void {
    const graph = this.dynamicGraphs.find(g => g.id === graphId);
    if (graph) {
      Object.assign(graph, config);
      if (this.selectedGraph === graph.name) {
        this.updateMainChart();
      }
    }
  }

  // Add this method to help with debugging
  getAvailableVariablesForGraph(graph: DynamicGraphConfig): MeasurementVariable[] {
    return graph.series
      .map(s => this.measurementVariables.find(v => v.id === s.measurementVariableId))
      .filter(v => v !== undefined) as MeasurementVariable[];
  }

  // Update the loadMeasurementData method to add more logging
  loadMeasurementData(): void {
    console.log('Loading measurement data...');
    console.log('Selected crop production:', this.selectedCropProduction);
    console.log('Selected series:', this.selectedSeries);
    console.log('Date range:', this.dateRange);

    if (!this.selectedCropProduction || this.selectedSeries.length === 0) {
      console.log('Cannot load data: missing crop production or series');
      return;
    }

    this.isLoadingData = true;

    // Create parallel requests for all selected measurement variables
    const measurementRequests = this.selectedSeries.map(variableId => {
      console.log('Creating request for variable:', variableId);
      return this.measurementService.getMeasurements(
        this.selectedCropProduction!,
        variableId,
        this.dateRange.start,
        this.dateRange.end
      );
    });

    console.log('Created', measurementRequests.length, 'measurement requests');

    forkJoin(measurementRequests)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading measurement data:', error);
          this.isLoadingData = false;
          throw error;
        })
      )
      .subscribe({
        next: (results) => {
          console.log('Measurement data results:', results);
          // Flatten all results into single array
          this.measurementData = results.flat();
          console.log('Flattened measurement data:', this.measurementData);

          if (this.measurementData.length === 0) {
            console.log('No measurement data found for the selected criteria');
          }

          this.updateMainChart();
          this.isLoadingData = false;
        },
        error: (error) => {
          console.error('Error in measurement data loading:', error);
          this.isLoadingData = false;
        }
      });
  }

  // Add this helper method to check data availability
  checkDataAvailability(): void {
    console.log('=== Data Availability Check ===');
    console.log('Selected Farm:', this.selectedFarm);
    console.log('Selected Production Unit:', this.selectedProductionUnit);
    console.log('Selected Crop Production:', this.selectedCropProduction);
    console.log('Available Graphs:', this.dynamicGraphs.length);
    console.log('Selected Graph:', this.selectedGraph);
    console.log('Selected Series:', this.selectedSeries);
    console.log('Measurement Variables Count:', this.measurementVariables.length);
    console.log('Date Range:', this.dateRange);
    console.log('Current Measurement Data Count:', this.measurementData.length);
  }

 
  // Key fixes for your ShinyDashboardComponent

  // 1. Fix the resetSelections method to preserve graphs when appropriate
  private resetSelections(level: 'farm' | 'productionUnit' | 'cropProduction'): void {
    if (level === 'farm') {
      this.selectedProductionUnit = null;
      this.selectedCropProduction = null;
      this.productionUnits = [];
      this.cropProductions = [];
      // Only reset graphs when changing farms (company changes)
      this.dynamicGraphs = [];
      this.measurementVariables = [];
    } else if (level === 'productionUnit') {
      this.selectedCropProduction = null;
      this.cropProductions = [];
      // Don't reset graphs here - keep them available
    } else if (level === 'cropProduction') {
      // Don't reset graphs here either
    }

    // Always reset data and selections
    this.measurementData = [];
    this.climateBaseData = [];
    this.selectedGraph = '';
    this.selectedSeries = [];
  }

  // 2. Fix getCurrentGraph to handle both ID and name
  public getCurrentGraph(): DynamicGraphConfig | undefined {
    if (!this.selectedGraph) return undefined;

    return this.dynamicGraphs.find(g =>
      g.id === this.selectedGraph || g.name === this.selectedGraph
    );
  }

  // 3. Fix onCropProductionChange to not reset graphs
  onCropProductionChange(): void {
    if (this.selectedCropProduction) {
      console.log('Crop production changed to:', this.selectedCropProduction);

      // Don't call resetSelections here as it clears the graphs
      // Just reset the data
      this.measurementData = [];
      this.climateBaseData = [];
      this.selectedSeries = [];

      // Load crop phases
      this.loadCropPhases();

      // Start loading measurement data
      this.startMeasurementDataLoading();

      // If a graph was selected, reload its data
      if (this.selectedGraph) {
        this.onGraphChange();
      }
    }
  }

  // 4. Fix onGraphChange to be more robust
  onGraphChange(): void {
    console.log('Graph changed to:', this.selectedGraph);
    console.log('Available graphs:', this.dynamicGraphs);

    if (!this.selectedGraph) {
      this.selectedSeries = [];
      this.measurementData = [];
      this.updateMainChart();
      return;
    }

    // Find graph by either ID or name
    const graph = this.getCurrentGraph();

    if (graph && graph.series) {
      console.log('Found graph:', graph);
      console.log('Graph series:', graph.series);

      // Set selected series to all visible series in the graph
      this.selectedSeries = graph.series
        .filter(s => s.visible)
        .map(s => s.measurementVariableId);

      console.log('Selected series:', this.selectedSeries);

      // Only load data if we have selections and a crop production
      if (this.selectedSeries.length > 0 && this.selectedCropProduction) {
        this.loadMeasurementData();
      } else {
        console.log('Cannot load data - missing requirements');
        console.log('Has series:', this.selectedSeries.length > 0);
        console.log('Has crop production:', !!this.selectedCropProduction);
      }
    } else {
      console.log('No graph found for selection:', this.selectedGraph);
      this.selectedSeries = [];
      this.measurementData = [];
    }
  }

  // 5. Ensure graphs are created after variables are loaded
  private loadCompanyData(): void {
    const farm = this.farms.find(f => f.id.toString() === this.selectedFarm?.toString());
    if (farm) {
      this.currentCompanyId = farm.companyId;

      // Load company-specific data
      forkJoin({
        company: this.companyService.getById(this.currentCompanyId),
        calculationSettings: this.calculationSettingService.getByCatalogId(this.currentCompanyId),
        measurementVariables: this.measurementService.getMeasurementVariables(this.currentCompanyId)
      }).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading company data:', error);
          this.errorMessage = 'Error loading company data';
          return throwError(error);
        })
      ).subscribe({
        next: (data: any) => {
          console.log('Company data loaded:', data);
          this.companyData = data.company;
          this.calculationSettings = data.calculationSettings.calculationSettings || data.calculationSettings;

          // Ensure measurement variables are properly extracted
          const variables = data.measurementVariables.measurementVariables || data.measurementVariables;
          this.measurementVariables = Array.isArray(variables) ? variables : [];

          console.log('Measurement variables loaded:', this.measurementVariables.length);

          // Only create graphs if we have variables
          if (this.measurementVariables.length > 0) {
            this.createDynamicGraphs();
            console.log('Graphs created:', this.dynamicGraphs.length);
          } else {
            console.warn('No measurement variables available to create graphs');
          }
        },
        error: (error) => {
          console.error('Error in company data loading:', error);
        }
      });
    }
  }

  // 6. Add helper method to validate graph availability
  private validateGraphAvailability(): boolean {
    if (this.dynamicGraphs.length === 0) {
      console.warn('No graphs available. Checking requirements...');
      console.log('Measurement variables:', this.measurementVariables.length);
      console.log('Current company ID:', this.currentCompanyId);

      if (this.measurementVariables.length > 0) {
        console.log('Variables available, recreating graphs...');
        this.createDynamicGraphs();
        return this.dynamicGraphs.length > 0;
      }
      return false;
    }
    return true;
  }
}