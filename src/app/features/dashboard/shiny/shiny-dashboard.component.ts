// src/app/features/dashboard/shiny/shiny-dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, interval, BehaviorSubject, combineLatest, forkJoin, throwError, of } from 'rxjs';
import { takeUntil, switchMap, catchError, startWith, map, debounceTime, tap } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Models
import { Farm, ProductionUnit, CropProduction, Company } from '../../../core/models/models';

// Services
import { FarmService } from '../../farms/services/farm.service';
import { CompanyService } from '../../companies/services/company.service';
import { ProductionUnitService } from '../../production-units/services/production-unit.service';
import { CropProductionService } from '../../crop-production/services/crop-production.service';
import { IrrigationSectorService, MeasurementBase } from '../../services/irrigation-sector.service'; // Import real IoT service
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
    CLIMATE: 3,
    NUTRIENTS: 4,
    WATER_CHEMISTRY: 5
  };

  // Show modals
  showGraphModal = false;
  showSeriesModal = false;
  editingGraphIndex: number = -1;
  editingSeries: GraphSeries | null = null;

  // Analytical Entities Execution
  executionResults: { [key: number]: any } = {};
  executingEntities: Set<number> = new Set();

  constructor(
    private farmService: FarmService,
    private companyService: CompanyService,
    private productionUnitService: ProductionUnitService,
    private cropProductionService: CropProductionService,
    private irrigationService: IrrigationSectorService, // Use real IoT service
    private measurementService: MeasurementService,
    private calculationSettingService: CalculationSettingService,
    private measurementUnitService: MeasurementUnitService,
    private analyticalEntityService: AnalyticalEntityService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeDashboard();
    this.setupRealTimeUpdates();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateAllCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyAllCharts();
  }

  private initializeDashboard(): void {
    this.isLoading = true;

    // Load initial data
    forkJoin({
      farms: this.farmService.getAll().pipe(catchError(() => of([]))),
      measurementVariables: this.measurementService.getMeasurementVariables(1).pipe(catchError(() => of([]))),
      measurementUnits: this.measurementUnitService.getAll().pipe(catchError(() => of([]))),
      calculationSettings: this.calculationSettingService.getAll().pipe(catchError(() => of([]))),
      analyticalEntities: this.analyticalEntityService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any) => {
        console.log('Initial dashboard data loaded', data);
        this.farms = data.farms;
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

  private setupRealTimeUpdates(): void {
    // Update climate data every 30 seconds using REAL IoT data
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.loadRealClimateData())
      )
      .subscribe();

    // Initial climate data load
    this.loadRealClimateData();
  }

  // === REAL CLIMATE DATA INTEGRATION ===
  private loadRealClimateData(): Observable<any> {
    if (!this.selectedCropProduction) {
      console.error('No crop production selected, cannot load real climate data');
      return of({
        temperature: 0,
        windSpeed: 0,
        windDirection: 0,
        humidity: 0,
        pressure: 0,
        lastUpdate: new Date()
      });
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startDate = yesterday.toISOString();
    const endDate = now.toISOString();

    console.log('Loading real climate data for crop production', this.selectedCropProduction);

    return forkJoin({
      allData: this.irrigationService.getIrrigationSystemStatus(
        this.selectedFarm ?? 1 //, startDate, endDate
      ).pipe(catchError(() => of([]))),

      // humidityData: this.irrigationService.getMeasurementBase(
      //   this.selectedCropProduction //, startDate, endDate
      // ).pipe(catchError(() => of([]))),

      // // Get system status for additional sensor readings
      // systemStatus: this.irrigationService.getSystemStatus(this.selectedFarm || 0).pipe(
      //   catchError(() => of(null))
      // )
    }).pipe(
      map(({ allData }) => {
        console.log('Real climate data fetched', { allData });
        // const climateData = this.processRealClimateData(allData);
        // this.climateData$.next(climateData);
        // this.climateBaseData = [...temperatureData, ...humidityData];

        // Update climate chart with real data
        setTimeout(() => {
          this.updateClimateChart();
        }, 100);

        return allData;
      }),
      tap(() => {
        this.cdr.detectChanges();
      }),
      catchError(error => {
        console.error('Error loading real climate data:', error);
        // Return a default ClimateData object instead of null
        return of({
          temperature: 0,
          windSpeed: 0,
          windDirection: 0,
          humidity: 0,
          pressure: 0,
          lastUpdate: new Date()
        } as ClimateData);
      })
    );
  }

  private processRealClimateData(
    temperatureData: any[],
    humidityData: any[],
    systemStatus: any
  ): ClimateData {
    const now = new Date();

    // Get latest temperature reading
    const latestTemp = temperatureData && temperatureData.length > 0
      ? temperatureData.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0]
      : null;

    // Get latest humidity reading  
    const latestHumidity = humidityData && humidityData.length > 0
      ? humidityData.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0]
      : null;

    // Extract additional climate data from system status
    let pressure = 1013 + Math.random() * 20; // Default atmospheric pressure
    let windSpeed = Math.random() * 25;

    if (systemStatus?.measurements) {
      // Try to get pressure from system measurements
      const pressureMeasurements = systemStatus.measurements.pressure || [];
      if (pressureMeasurements.length > 0) {
        pressure = pressureMeasurements[pressureMeasurements.length - 1].value;
      }
    }

    return {
      temperature: latestTemp?.recordValue || latestTemp?.value || (22 + Math.random() * 8),
      humidity: latestHumidity?.recordValue || latestHumidity?.value || (40 + Math.random() * 40),
      windSpeed: windSpeed,
      windDirection: Math.random() * 360,
      pressure: pressure,
      lastUpdate: now
    };
  }

  // === CHART RENDERING FIXES ===
  updateMainChart(): void {
    if (!this.mainChartRef?.nativeElement || this.measurementData.length === 0) {
      console.log('Cannot update main chart: missing element or data');
      return;
    }

    this.destroyChart('main');

    const ctx = this.mainChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const datasets = this.createDatasets();

    if (datasets.length === 0) {
      console.log('No datasets to display');
      return;
    }

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
          mode: 'index' as const,
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
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
              display: true,
              text: 'Valores'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom' as const
          },
          title: {
            display: true,
            text: 'Tendencia de Mediciones'
          }
        }
      }
    });

    console.log('Main chart updated successfully');
  }

  private createDatasets(): any[] {
    const datasets: any[] = [];
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
    let colorIndex = 0;

    // Group measurement data by variable ID
    const dataByVariable = this.measurementData.reduce((acc, item) => {
      if (!acc[item.measurementVariableId]) {
        acc[item.measurementVariableId] = [];
      }
      acc[item.measurementVariableId].push(item);
      return acc;
    }, {} as { [key: number]: MeasurementData[] });

    // Create datasets for selected plot elements
    Object.keys(dataByVariable).forEach(variableId => {
      const data = dataByVariable[parseInt(variableId)];
      const variable = this.measurementVariables.find(v => v.id === parseInt(variableId));
      const variableName = variable?.name || `Variable ${variableId}`;

      this.selectedPlotElements.forEach(element => {
        let values: number[] = [];
        let label = '';

        switch (element) {
          case 'AvgValue':
            values = data.map(d => d.avgValue);
            label = `${variableName} (Media)`;
            break;
          case 'MinValue':
            values = data.map(d => d.minValue);
            label = `${variableName} (Mínimo)`;
            break;
          case 'MaxValue':
            values = data.map(d => d.maxValue);
            label = `${variableName} (Máximo)`;
            break;
          case 'SumValue':
            values = data.map(d => d.sumValue);
            label = `${variableName} (Suma)`;
            break;
        }

        if (values.length > 0) {
          datasets.push({
            label: label,
            data: values,
            borderColor: colors[colorIndex % colors.length],
            backgroundColor: colors[colorIndex % colors.length] + '20',
            tension: 0.1,
            fill: false
          });
          colorIndex++;
        }
      });
    });

    return datasets;
  }

  private getDateLabels(): string[] {
    if (this.measurementData.length === 0) return [];

    // Get unique dates and sort them
    const uniqueDates = [...new Set(this.measurementData.map(d => d.recordDate))]
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return uniqueDates.map(date => new Date(date).toLocaleDateString());
  }

  updateClimateChart(): void {
    if (!this.climateChartRef?.nativeElement) return;

    this.destroyChart('climate');

    const ctx = this.climateChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Prepare climate time series data
    const temperatureData = this.climateBaseData
      .filter(d => this.isTemperatureVariable(d.measurementVariableId ? this.measurementVariables.find(v => v.id === d.measurementVariableId) : undefined))
      .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
      .slice(-24); // Last 24 data points

    const humidityData = this.climateBaseData
      .filter(d => this.isHumidityVariable(d.measurementVariableId ? this.measurementVariables.find(v => v.id === d.measurementVariableId) : undefined))
      .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
      .slice(-24);

    const labels = temperatureData.map(d => new Date(d.recordDate).toLocaleTimeString());

    this.climateTimeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: temperatureData.map(d => d.recordValue),
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            yAxisID: 'y',
            tension: 0.1
          },
          {
            label: 'Humedad (%)',
            data: humidityData.map(d => d.recordValue),
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
          mode: 'index' as const,
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
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
              display: true,
              text: 'Temperatura (°C)'
            },
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
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
            position: 'bottom' as const
          }
        }
      }
    });
  }

  private isTemperatureVariable(variable?: MeasurementVariable): boolean {
    if (!variable) return false;
    return variable.measurementVariableStandardId === 5 ||
      variable.name.toLowerCase().includes('temp');
  }

  private isHumidityVariable(variable?: MeasurementVariable): boolean {
    if (!variable) return false;
    return variable.measurementVariableStandardId === 6 ||
      variable.name.toLowerCase().includes('humidity') ||
      variable.name.toLowerCase().includes('humedad');
  }

  // === ANALYTICAL ENTITIES EXECUTION FIX ===
  executeAnalyticalEntity(entity: AnalyticalEntity): void {
    if (this.executingEntities.has(entity.id)) {
      console.log(`Entity ${entity.id} is already executing`);
      return;
    }

    this.executingEntities.add(entity.id);
    console.log(`Executing analytical entity: ${entity.name}`);

    const parameters = {
      cropProductionId: this.selectedCropProduction,
      farmId: this.selectedFarm,
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
      measurementVariableIds: this.selectedSeries
    };

    this.analyticalEntityService.execute(entity.id, parameters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error(`Error executing entity ${entity.id}:`, error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (result) => {
          console.log(`Entity ${entity.id} executed successfully:`, result);
          this.executionResults[entity.id] = {
            ...result,
            executedAt: new Date().toISOString(),
            entityName: entity.name
          };
          this.executingEntities.delete(entity.id);
          this.cdr.detectChanges();

          // Show result in UI (could be enhanced with a modal or toast)
          this.showExecutionResult(entity, result);
        },
        error: (error) => {
          console.error(`Final error executing entity ${entity.id}:`, error);
          this.executionResults[entity.id] = {
            success: false,
            error: error.message || 'Unknown execution error',
            executedAt: new Date().toISOString(),
            entityName: entity.name
          };
          this.executingEntities.delete(entity.id);
          this.cdr.detectChanges();
        }
      });
  }

  private showExecutionResult(entity: AnalyticalEntity, result: any): void {
    // Simple alert for now - could be enhanced with a proper modal or toast
    const message = result.success !== false
      ? `Entidad "${entity.name}" ejecutada exitosamente`
      : `Error ejecutando "${entity.name}": ${result.error}`;

    alert(message);
  }

  isEntityExecuting(entityId: number): boolean {
    return this.executingEntities.has(entityId);
  }

  getEntityResult(entityId: number): any {
    return this.executionResults[entityId];
  }

  // === DATA LOADING METHODS ===
  loadProductionUnits(): void {
    if (!this.selectedFarm) return;

    this.productionUnitService.getByFarm(this.selectedFarm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (units: any) => {
          console.log('Loaded production units:', units);
          this.productionUnits = units.productionUnits;
          if (units.productionUnits.length > 0) {
            this.selectedProductionUnit = units.productionUnits[0].id;
            this.loadCropProductions();
          }
        },
        error: (error) => {
          console.error('Error loading production units:', error);
        }
      });
  }

  loadCropProductions(): void {
    if (!this.selectedProductionUnit) {
      this.cropProductions = []; // Reset to empty array
      return;
    }
    this.cropProductionService.getByProductionUnit(this.selectedProductionUnit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (crops: any) => {
          console.log('Loaded crop productions:', crops);
          this.cropProductions = crops.cropProductions;
          if (crops.cropProductions.length > 0) {
            this.selectedCropProduction = crops.cropProductions[0].id;
            this.loadMeasurementData();
          }
        },
        error: (error) => {
          console.error('Error loading crop productions:', error);
        }
      });
  }

  loadMeasurementData(): void {
    if (!this.selectedCropProduction || this.selectedSeries.length === 0) {
      console.log('Cannot load measurement data: missing crop production or series selection');
      return;
    }

    this.isLoadingData = true;

    const requests = this.selectedSeries.map(variableId =>
      this.measurementService.getMeasurements(
        this.selectedCropProduction!,
        variableId,
        this.dateRange.start,
        this.dateRange.end
      ).pipe(catchError(() => of([])))
    );

    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.measurementData = results.flat();
          console.log(`Loaded ${this.measurementData.length} measurement records`);
          this.isLoadingData = false;

          // Update charts after data load
          setTimeout(() => {
            this.updateMainChart();
          }, 100);

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading measurement data:', error);
          this.isLoadingData = false;
          this.cdr.detectChanges();
        }
      });
  }

  // === UI EVENT HANDLERS ===
  setActiveTab(tab: string): void {
    this.activeTab = tab;

    // Load tab-specific data
    setTimeout(() => {
      switch (tab) {
        case 'climate_dashboard':
          this.loadRealClimateData();
          break;
        case 'hourly_dashboard':
          this.updateMainChart();
          break;
        case 'analytics_dashboard':
          // Analytics entities are already loaded
          break;
      }
    }, 100);
  }

  onFarmChange(): void {
    this.selectedProductionUnit = null;
    this.selectedCropProduction = null;
    this.productionUnits = [];
    this.cropProductions = [];
    this.measurementData = [];

    if (this.selectedFarm) {
      this.loadProductionUnits();
    }
  }

  onProductionUnitChange(): void {
    this.selectedCropProduction = null;
    this.cropProductions = [];
    this.measurementData = [];

    if (this.selectedProductionUnit) {
      this.loadCropProductions();
    }
  }

  onCropProductionChange(): void {
    this.measurementData = [];

    if (this.selectedCropProduction) {
      this.loadMeasurementData();
      // Also refresh climate data for new crop production
      this.loadRealClimateData().subscribe();
    }
  }

  onSeriesChange(): void {
    if (this.selectedSeries.length > 0 && this.selectedCropProduction) {
      this.loadMeasurementData();
    }
  }

  onDateRangeChange(): void {
    if (this.selectedCropProduction) {
      this.loadMeasurementData();
      this.loadRealClimateData().subscribe();
    }
  }

  onPlotElementChange(): void {
    if (this.measurementData.length > 0) {
      this.updateMainChart();
    }
  }

  // === GRAPH CONFIGURATION MODAL ===
  openGraphModal(): void {
    this.showGraphModal = true;
    this.editingGraphIndex = -1;
  }

  editGraph(index: number): void {
    this.editingGraphIndex = index;
    this.showGraphModal = true;
  }

  closeGraphModal(): void {
    this.showGraphModal = false;
    this.editingGraphIndex = -1;
  }

  saveGraph(): void {
    // Implementation for saving graph configuration
    console.log('Saving graph configuration...');
    this.closeGraphModal();
  }

  deleteGraph(index: number): void {
    if (confirm('¿Está seguro de que desea eliminar este gráfico?')) {
      this.dynamicGraphs.splice(index, 1);
    }
  }

  // === SERIES CONFIGURATION MODAL ===
  openSeriesModal(): void {
    this.showSeriesModal = true;
    this.editingSeries = null;
  }

  editSeries(series: GraphSeries): void {
    this.editingSeries = { ...series };
    this.showSeriesModal = true;
  }

  closeSeriesModal(): void {
    this.showSeriesModal = false;
    this.editingSeries = null;
  }

  saveSeries(): void {
    // Implementation for saving series configuration
    console.log('Saving series configuration...');
    this.closeSeriesModal();
  }

  // === UTILITY METHODS ===
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  private isClimateVariable(variable: MeasurementVariable): boolean {
    const climateStandardIds = [4, 5, 6, 7]; // radiation, temperature, humidity, PAR
    return climateStandardIds.includes(variable.measurementVariableStandardId || 0) ||
      variable.name.toLowerCase().includes('temp') ||
      variable.name.toLowerCase().includes('humidity') ||
      variable.name.toLowerCase().includes('wind') ||
      variable.name.toLowerCase().includes('pressure');
  }

  // === CHART MANAGEMENT ===
  private updateAllCharts(): void {
    this.createTemperatureGauge();
    this.createWindSpeedGauge();
    this.updateMainChart();
    this.updateClimateChart();
  }

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
                currentTemp < 30 ? '#fdcb6e' : '#e17055',
            '#f1f2f6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
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

  createWindSpeedGauge(): void {
    if (!this.windSpeedGaugeRef?.nativeElement) return;

    this.destroyChart('windSpeed');

    const ctx = this.windSpeedGaugeRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const currentWindSpeed = this.climateData$.value.windSpeed || 0;

    this.windSpeedChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [currentWindSpeed, 50 - currentWindSpeed],
          backgroundColor: [
            currentWindSpeed < 5 ? '#00b894' :
              currentWindSpeed < 15 ? '#fdcb6e' :
                currentWindSpeed < 25 ? '#e17055' : '#d63031',
            '#f1f2f6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
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

  private destroyChart(type: string): void {
    switch (type) {
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

  // === GETTER METHODS FOR TEMPLATE ===
  get selectedMeasurementVariables(): MeasurementVariable[] {
    return Array.isArray(this.measurementVariables)
      ? this.measurementVariables.filter(v => this.selectedSeries.includes(v.id))
      : [];
  }

  get climateVariables(): MeasurementVariable[] {
    return Array.isArray(this.measurementVariables)
      ? this.measurementVariables.filter(v => this.isClimateVariable(v))
      : [];
  }

  get nutrientVariables(): MeasurementVariable[] {
    return Array.isArray(this.measurementVariables)
      ? this.measurementVariables.filter(v => v.measurementVariableStandardId === 2)
      : [];
  }

  get environmentalVariables(): MeasurementVariable[] {
    return Array.isArray(this.measurementVariables)
      ? this.measurementVariables.filter(v =>
        !this.isClimateVariable(v) && v.measurementVariableStandardId !== 2
      )
      : [];
  }

  // === MISSING METHODS FOR TEMPLATE FUNCTIONALITY ===

  /**
   * Toggle series selection for variables
   */
  toggleSeriesSelection(variableId: number): void {
    const index = this.selectedSeries.indexOf(variableId);
    if (index > -1) {
      this.selectedSeries.splice(index, 1);
    } else {
      this.selectedSeries.push(variableId);
    }

    console.log('Selected series updated:', this.selectedSeries);
    this.onSeriesChange();
  }

  /**
   * Toggle plot element selection
   */
  togglePlotElement(elementId: string): void {
    const index = this.selectedPlotElements.indexOf(elementId);
    if (index > -1) {
      this.selectedPlotElements.splice(index, 1);
    } else {
      this.selectedPlotElements.push(elementId);
    }

    console.log('Selected plot elements updated:', this.selectedPlotElements);
    this.onPlotElementChange();
  }

  /**
   * Track by function for analytical entities ngFor
   */
  trackByEntityId(index: number, entity: AnalyticalEntity): number {
    return entity.id;
  }

  // === ENHANCED ERROR HANDLING AND LOGGING ===

  private logError(context: string, error: any): void {
    console.error(`[ShinyDashboard] Error in ${context}:`, error);

    // Could be enhanced to send to logging service
    // this.loggingService.logError(context, error);
  }

  private logInfo(context: string, message: string, data?: any): void {
    console.log(`[ShinyDashboard] ${context}: ${message}`, data || '');
  }

  // === PERFORMANCE OPTIMIZATIONS ===

  /**
   * Debounced data loading to prevent excessive API calls
   */
  private debouncedLoadMeasurementData = this.debounce(() => {
    this.loadMeasurementData();
  }, 300);

  private debounce(func: Function, wait: number) {
    let timeout: any;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Optimized series change handler
   */
  onSeriesChangeOptimized(): void {
    if (this.selectedSeries.length > 0 && this.selectedCropProduction) {
      this.debouncedLoadMeasurementData();
    }
  }

  // === ENHANCED CLIMATE DATA PROCESSING ===

  /**
   * Process and validate climate sensor data
   */
  private validateAndProcessSensorData(data: any[]): any[] {
    return data.filter(item => {
      // Validate data quality
      if (!item.recordDate || !item.value || item.value === null || item.value === undefined) {
        return false;
      }

      // Check if timestamp is reasonable (not too old or in future)
      const recordTime = new Date(item.recordDate).getTime();
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const oneDayFuture = now + (24 * 60 * 60 * 1000);

      if (recordTime < oneWeekAgo || recordTime > oneDayFuture) {
        return false;
      }

      // Validate sensor value ranges based on variable type
      if (this.isTemperatureVariable(item.measurementVariable)) {
        return item.value >= -50 && item.value <= 60; // Reasonable temperature range
      }

      if (this.isHumidityVariable(item.measurementVariable)) {
        return item.value >= 0 && item.value <= 100; // Humidity percentage
      }

      return true; // Default: accept the data
    }).sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
  }

  // === REAL-TIME DATA REFRESH CONTROLS ===

  /**
   * Manual refresh trigger for climate data
   */
  refreshClimateData(): void {
    console.log('Manual climate data refresh triggered');
    this.loadRealClimateData().subscribe({
      next: (data) => {
        console.log('Climate data refreshed successfully', data);
      },
      error: (error) => {
        console.error('Error refreshing climate data:', error);
      }
    });
  }

  /**
   * Manual refresh trigger for measurement data
   */
  refreshMeasurementData(): void {
    if (this.selectedCropProduction && this.selectedSeries.length > 0) {
      console.log('Manual measurement data refresh triggered');
      this.loadMeasurementData();
    }
  }

  // === EXPORT AND SHARING FUNCTIONALITY ===

  /**
   * Export chart data to CSV
   */
  exportChartData(): void {
    if (this.measurementData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const csvContent = this.convertToCSV(this.measurementData);
    this.downloadCSV(csvContent, 'measurement_data.csv');
  }

  private convertToCSV(data: MeasurementData[]): string {
    const headers = ['ID', 'Cultivo', 'Variable', 'Fecha', 'Promedio', 'Mínimo', 'Máximo', 'Suma'];
    const csvRows = [headers.join(',')];

    data.forEach(item => {
      const row = [
        item.id,
        item.cropProductionId,
        item.measurementVariableId,
        item.recordDate,
        item.avgValue,
        item.minValue,
        item.maxValue,
        item.sumValue
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // === DASHBOARD STATE PERSISTENCE ===

  /**
   * Save dashboard configuration to localStorage
   */
  saveDashboardState(): void {
    const state = {
      selectedFarm: this.selectedFarm,
      selectedProductionUnit: this.selectedProductionUnit,
      selectedCropProduction: this.selectedCropProduction,
      selectedSeries: this.selectedSeries,
      selectedPlotElements: this.selectedPlotElements,
      dateRange: this.dateRange,
      activeTab: this.activeTab
    };

    try {
      localStorage.setItem('shinyDashboardState', JSON.stringify(state));
      console.log('Dashboard state saved successfully');
    } catch (error) {
      console.error('Error saving dashboard state:', error);
    }
  }

  /**
   * Load dashboard configuration from localStorage
   */
  loadDashboardState(): void {
    try {
      const savedState = localStorage.getItem('shinyDashboardState');
      if (savedState) {
        const state = JSON.parse(savedState);

        // Only restore if the saved selections still exist
        if (state.selectedFarm && this.farms.find(f => f.id === state.selectedFarm)) {
          this.selectedFarm = state.selectedFarm;
        }

        if (state.selectedSeries && Array.isArray(state.selectedSeries)) {
          this.selectedSeries = state.selectedSeries.filter((id: number) =>
            this.measurementVariables.find(v => v.id === id)
          );
        }

        if (state.selectedPlotElements && Array.isArray(state.selectedPlotElements)) {
          this.selectedPlotElements = state.selectedPlotElements;
        }

        if (state.dateRange) {
          this.dateRange = state.dateRange;
        }

        if (state.activeTab) {
          this.activeTab = state.activeTab;
        }

        console.log('Dashboard state loaded successfully');
      }
    } catch (error) {
      console.error('Error loading dashboard state:', error);
    }
  }


  // Add this getter to your component class
  get activeAnalyticalEntitiesCount(): number {
    return Array.isArray(this.analyticalEntities)
      ? this.analyticalEntities.filter(e => e && e.active).length
      : 0;
  }

  // Add this getter to provide the count of executed results
  get executionResultsCount(): number {
    return Object.keys(this.executionResults).length;
  }

  // Add this getter to your component class
  get successfulExecutionResultsCount(): number {
    return Object.values(this.executionResults).filter((r: any) => r.success !== false).length;
  }
}