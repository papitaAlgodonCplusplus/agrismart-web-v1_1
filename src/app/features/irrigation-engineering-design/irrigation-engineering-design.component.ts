// src/app/features/irrigation-engineering-design/irrigation-engineering-design.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest, BehaviorSubject, forkJoin, interval, of } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// Services
import { IrrigationEngineeringService } from '../services/irrigation-engineering.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { FarmService } from '../farms/services/farm.service';
import { AlertService } from '../../core/services/alert.service';

// Models and Interfaces
import {
  IrrigationDesign,
  HydraulicParameters,
  SystemValidation,
  DesignOptimization,
  PipelineDesign,
  EmitterConfiguration,
  WaterQualityParameters,
  EconomicAnalysis
} from '../../core/models/models';
import { Container, Dropper, GrowingMedium } from '../services/irrigation-sector.service';
import { CropProduction, Farm } from '../../core/models/models';

// Real-time data interfaces
interface RealTimeData {
  climate: {
    deviceId: string;
    timestamp: Date;
    temperature?: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    solarRadiation?: number;
  };
  soil: Array<{
    deviceId: string;
    ph?: number;
    temperature?: number;
    timestamp: Date;
  }>;
  flow: Array<{
    deviceId: string;
    timestamp: Date;
    totalPulse: number;
    waterFlowValue: number;
  }>;
  systemPressure?: number;
  totalFlowRate?: number;
  lastUpdate: Date;
}

interface IrrigationSystemStatus {
  systemPressure: undefined;
  farmId: number;
  systemStatus: string;
  devices: any[];
  activeDevices: number;
  totalDevices: number;
  alerts: any[];
  climateReadings: any[];
  soilReadings: any[];
  flowReadings: any[];
  totalFlowRate: number;
  lastUpdate: string;
  measurements: any;
}

@Component({
  selector: 'app-irrigation-engineering-design',
  templateUrl: './irrigation-engineering-design.component.html',
  styleUrls: ['./irrigation-engineering-design.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class IrrigationEngineeringDesignComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Forms
  designForm!: FormGroup;
  hydraulicForm!: FormGroup;
  optimizationForm!: FormGroup;

  // State Management
  isLoading = false;
  isSaving = false;
  isCalculating = false;
  isOptimizing = false;
  calculationProgress = 0;

  // Current Design
  currentDesign: IrrigationDesign | null = null;
  activeTab = 'design';

  // Data Collections
  farms: Farm[] = [];
  cropProductions: CropProduction[] = [];
  containers: Container[] = [];
  droppers: Dropper[] = [];
  growingMediums: GrowingMedium[] = [];

  // Real-time data properties
  realTimeData: any | null = null;
  systemStatus: IrrigationSystemStatus | null = null;
  selectedFarm: number | null = null;
  selectedCropProduction: number | null = null;
  isLoadingRealTimeData = false;

  // Calculation Results
  hydraulicResults: HydraulicParameters | null = null;
  validationResults: SystemValidation | null = null;
  optimizationResults: DesignOptimization | null = null;

  // UI State
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private irrigationEngineeringService: IrrigationEngineeringService,
    private irrigationSectorService: IrrigationSectorService,
    private cropProductionService: CropProductionService,
    private farmService: FarmService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadInitialData();
    this.setupRealTimeUpdates();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.initializeDesignForm();
    this.initializeHydraulicForm();
    this.initializeOptimizationForm();
  }

  private initializeDesignForm(): void {
    this.designForm = this.fb.group({
      // Basic Information
      name: ['', Validators.required],
      description: [''],
      farmId: [null, Validators.required],
      cropProductionId: [null, Validators.required],

      // Crop Area Configuration
      totalArea: [0, [Validators.required, Validators.min(1)]], // m²
      plantSpacing: [0.3, [Validators.required, Validators.min(0.1)]], // meters
      rowSpacing: [1.2, [Validators.required, Validators.min(0.5)]], // meters
      numberOfPlants: [0, [Validators.required, Validators.min(1)]],

      // Container Configuration
      containerId: [null],
      dropperId: [null],
      growingMediumId: [null],
      containerLength: [1.2, [Validators.required, Validators.min(0.5)]], // meters
      containerWidth: [0.2, [Validators.required, Validators.min(0.1)]], // meters
      numberOfContainers: [0, [Validators.required, Validators.min(1)]],

      // Emitter Configuration
      emitterType: ['dripper', Validators.required], // dripper, sprinkler, mist
      emitterFlowRate: [2, [Validators.required, Validators.min(0.5)]], // L/h
      emittersPerPlant: [1, [Validators.required, Validators.min(1)]],
      operatingPressure: [1.5, [Validators.required, Validators.min(0.5)]], // bar
      pressureCompensation: [false],

      // Water Requirements
      dailyWaterRequirement: [0, [Validators.required, Validators.min(0.1)]], // L/day/plant
      irrigationFrequency: [1, [Validators.required, Validators.min(0.1)]], // times per day

      // Environmental Parameters - NOW USING REAL DATA
      climate: this.fb.group({
        averageTemperature: [22, Validators.required], // Will be updated with real data
        averageHumidity: [65, Validators.required], // Will be updated with real data
        windSpeed: [2, Validators.required], // Will be updated with real data
        solarRadiation: [20, Validators.required], // MJ/m²/day
        elevation: [1200, Validators.required] // meters above sea level
      }),

      // Water Source
      waterSource: this.fb.group({
        sourceType: ['well', Validators.required], // well, reservoir, municipal
        waterPressure: [1.5, Validators.required], // bar - Will be updated with real data
        waterFlow: [0, Validators.required], // L/min - Will be updated with real data
        waterQuality: this.fb.group({
          ph: [7, [Validators.min(4), Validators.max(9)]], // Will be updated with real data
          electricalConductivity: [0.8, Validators.min(0)], // dS/m
          totalDissolvedSolids: [500, Validators.min(0)], // ppm
          nitrates: [10, Validators.min(0)], // ppm
          phosphorus: [2, Validators.min(0)], // ppm
          potassium: [5, Validators.min(0)] // ppm
        })
      }),

      // Pipeline Configuration
      mainPipeDiameter: [63, Validators.required], // mm
      secondaryPipeDiameter: [32, Validators.required], // mm
      lateralPipeDiameter: [16, Validators.required], // mm
      pipelineMaterial: ['PE', Validators.required], // PE, PVC, HDPE

      // System Components
      components: this.fb.group({
        hasFiltration: [true],
        hasAutomation: [false],
        hasFertigation: [false],
        hasBackflowPrevention: [true],
        hasPressureRegulation: [true],
        hasFlowMeter: [false]
      })
    });
  }

  private initializeHydraulicForm(): void {
    this.hydraulicForm = this.fb.group({
      // Operating Parameters - NOW USING REAL DATA
      operatingPressure: [1.5, [Validators.required, Validators.min(0.5)]], // Will be updated with real data
      maxFlowRate: [0, [Validators.required, Validators.min(0.1)]], // Will be updated with real data
      designVelocity: [1.5, [Validators.required, Validators.min(0.5), Validators.max(3)]],

      // Pressure Loss Calculations
      frictionLossCoefficient: [0.2, Validators.required],
      minorLossCoefficient: [0.1, Validators.required],
      elevationDifference: [0, Validators.required],

      // Performance Requirements
      targetUniformity: [90, [Validators.required, Validators.min(80)]],
      targetEfficiency: [85, [Validators.required, Validators.min(70)]],
      maximumPressureVariation: [10, [Validators.required, Validators.min(5)]]
    });
  }

  private initializeOptimizationForm(): void {
    this.optimizationForm = this.fb.group({
      // Optimization Objectives
      optimizationGoals: this.fb.group({
        minimizeCost: [true],
        maximizeUniformity: [true],
        maximizeEfficiency: [true],
        minimizeEnergyConsumption: [false],
        minimizeWaterUsage: [true]
      }),

      // Constraints
      budgetConstraint: [0, Validators.min(0)],
      areaConstraint: [0, Validators.min(0)],
      pressureConstraint: [3, [Validators.required, Validators.min(1)]],

      // Economic Parameters
      waterCostPerM3: [0.5, Validators.min(0)],
      energyCostPerKWh: [0.15, Validators.min(0)],
      laborCostPerHour: [15, Validators.min(0)],
      maintenanceCostPercentage: [5, [Validators.min(0), Validators.max(20)]]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin({
      farms: this.farmService.getAll().pipe(catchError(() => of([]))),
      cropProductions: this.cropProductionService.getAll().pipe(catchError(() => of([]))),
      containers: this.irrigationSectorService.getAllContainers().pipe(catchError(() => of([]))),
      droppers: this.irrigationSectorService.getAllDroppers().pipe(catchError(() => of([]))),
      growingMediums: this.irrigationSectorService.getAllGrowingMediums().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any) => {
        this.farms = data.farms?.farms || data.farms || [];
        this.cropProductions = data.cropProductions?.cropProductions || data.cropProductions || [];
        this.containers = data.containers?.containers || data.containers || [];
        this.droppers = data.droppers?.droppers || data.droppers || [];
        this.growingMediums = data.growingMediums?.growingMediums || data.growingMediums || [];

        // Auto-select first farm if available
        if (this.farms.length > 0) {
          this.selectedFarm = this.farms[0].id;
          this.designForm.patchValue({ farmId: this.selectedFarm });
        }

        // Auto-select first crop production if available
        if (this.cropProductions.length > 0) {
          this.selectedCropProduction = this.cropProductions[0].id;
          this.designForm.patchValue({ cropProductionId: this.selectedCropProduction });
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.errorMessage = 'Error cargando datos iniciales';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // === REAL-TIME DATA INTEGRATION (SAME AS SHINY DASHBOARD) ===
  private setupRealTimeUpdates(): void {
    interval(10000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.loadRealTimeData())
      )
      .subscribe();

    // Initial real-time data load
    this.loadRealTimeData();
  }


  private setupFormSubscriptions(): void {
    // Farm selection subscription
    this.designForm.get('farmId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(farmId => {
        if (farmId) {
          this.selectedFarm = farmId;
          this.loadRealTimeData();
        }
      });

    // Crop production selection subscription
    this.designForm.get('cropProductionId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(cropProductionId => {
        if (cropProductionId) {
          this.selectedCropProduction = cropProductionId;
          this.loadRealTimeData();
        }
      });

    // Auto-calculate number of plants based on area and spacing
    combineLatest([
      this.designForm.get('totalArea')?.valueChanges || of(0),
      this.designForm.get('plantSpacing')?.valueChanges || of(0.3),
      this.designForm.get('rowSpacing')?.valueChanges || of(1.2)
    ]).pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(([area, plantSpacing, rowSpacing]) => {
      if (area > 0 && plantSpacing > 0 && rowSpacing > 0) {
        const plantsPerRow = Math.floor(Math.sqrt(area) / plantSpacing);
        const numberOfRows = Math.floor(Math.sqrt(area) / rowSpacing);
        const totalPlants = plantsPerRow * numberOfRows;

        this.designForm.patchValue({
          numberOfPlants: totalPlants
        }, { emitEvent: false });
      }
    });

    // Auto-calculate water requirements
    this.designForm.get('numberOfPlants')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(numberOfPlants => {
        if (numberOfPlants > 0) {
          // Basic calculation: 2L per plant per day
          const dailyRequirement = numberOfPlants * 2;
          this.designForm.patchValue({
            dailyWaterRequirement: dailyRequirement
          }, { emitEvent: false });
        }
      });
  }

  // === UI EVENT HANDLERS ===
  setActiveTab(tab: string): void {
    this.activeTab = tab;

    // Load tab-specific data
    setTimeout(() => {
      switch (tab) {
        case 'design':
          this.loadRealTimeData();
          break;
        case 'hydraulic':
          if (this.currentDesign) {
            this.performHydraulicCalculations();
          }
          break;
        case 'optimization':
          if (this.hydraulicResults) {
            this.performOptimization();
          }
          break;
      }
    }, 100);
  }

  saveDesign(): void {
    if (this.designForm.valid) {
      this.isSaving = true;

      const designData = {
        ...this.designForm.value,
        hydraulicParameters: this.hydraulicForm.value,
        optimizationParameters: this.optimizationForm.value
      };

      this.irrigationEngineeringService.saveDesign(designData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedDesign: any) => {
            this.currentDesign = savedDesign;
            this.successMessage = 'Diseño guardado exitosamente';
            this.isSaving = false;
            this.alertService.showSuccess(this.successMessage);
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.errorMessage = 'Error guardando el diseño';
            this.isSaving = false;
            this.alertService.showError(this.errorMessage);
            console.error('Error saving design:', error);
            this.cdr.detectChanges();
          }
        });
    } else {
      this.alertService.showWarning('Por favor complete todos los campos requeridos');
    }
  }

  performHydraulicCalculations(): void {
    if (!this.designForm.valid || !this.hydraulicForm.valid) {
      this.alertService.showWarning('Por favor complete los parámetros de diseño e hidráulicos');
      return;
    }

    this.isCalculating = true;
    this.calculationProgress = 0;

    // Simulate calculation progress
    const progressInterval = setInterval(() => {
      this.calculationProgress += 20;
      this.cdr.detectChanges();
    }, 200);

    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;

    this.irrigationEngineeringService.performHydraulicCalculations(designData, hydraulicData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any) => {
          clearInterval(progressInterval);
          this.calculationProgress = 100;
          this.hydraulicResults = results;
          this.isCalculating = false;
          this.successMessage = 'Cálculos hidráulicos completados';
          this.cdr.detectChanges();

          // Auto-validate system
          setTimeout(() => this.validateSystem(), 500);
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.isCalculating = false;
          this.errorMessage = 'Error en cálculos hidráulicos';
          console.error('Hydraulic calculation error:', error);
          this.cdr.detectChanges();
        }
      });
  }

  validateSystem(): void {
    if (!this.hydraulicResults) return;

    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;

    // this.irrigationEngineeringService.validateSystem(designData, hydraulicData, this.hydraulicResults)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (validation) => {
    //       this.validationResults = validation;
    //       this.cdr.detectChanges();
    //     },
    //     error: (error) => {
    //       console.error('System validation error:', error);
    //     }
    //   });
  }

  performOptimization(): void {
    if (!this.hydraulicResults) {
      this.alertService.showWarning('Primero debe completar los cálculos hidráulicos');
      return;
    }

    this.isOptimizing = true;
    this.calculationProgress = 0;

    const progressInterval = setInterval(() => {
      this.calculationProgress += 15;
      this.cdr.detectChanges();
    }, 300);

    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;
    const optimizationData = this.optimizationForm.value;

    this.irrigationEngineeringService.performDesignOptimization(
      designData,
      hydraulicData,
      optimizationData,
      this.hydraulicResults
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (optimization: any) => {
          clearInterval(progressInterval);
          this.calculationProgress = 100;
          this.optimizationResults = optimization;
          this.isOptimizing = false;
          this.successMessage = 'Optimización completada';
          this.cdr.detectChanges();
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.isOptimizing = false;
          this.errorMessage = 'Error en optimización';
          console.error('Optimization error:', error);
          this.cdr.detectChanges();
        }
      });
  }

  exportDesign(): void {
    if (!this.currentDesign) {
      this.alertService.showWarning('No hay diseño para exportar');
      return;
    }

    // Create export data
    const exportData = {
      design: this.currentDesign,
      hydraulicResults: this.hydraulicResults,
      validationResults: this.validationResults,
      optimizationResults: this.optimizationResults,
      realTimeData: this.realTimeData,
      exportDate: new Date()
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `irrigation-design-${this.currentDesign.name}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.alertService.showSuccess('Diseño exportado exitosamente');
  }

  resetDesign(): void {
    if (confirm('¿Está seguro de que desea restablecer el diseño? Se perderán todos los cambios no guardados.')) {
      this.initializeForms();
      this.currentDesign = null;
      this.hydraulicResults = null;
      this.validationResults = null;
      this.optimizationResults = null;
      this.activeTab = 'design';
      this.successMessage = 'Diseño restablecido';
      this.cdr.detectChanges();
    }
  }

  // === UTILITY METHODS ===
  formatPressure(pressure: number): string {
    return pressure ? `${pressure.toFixed(2)} bar` : 'N/A';
  }

  formatFlowRate(flowRate: number): string {
    return flowRate ? `${flowRate.toFixed(1)} L/min` : 'N/A';
  }

  formatTemperature(temperature: number): string {
    return temperature ? `${temperature.toFixed(1)}°C` : 'N/A';
  }

  formatPercentage(value: number): string {
    return value ? `${value.toFixed(1)}%` : 'N/A';
  }

  formatArea(area: number): string {
    return area ? `${area.toFixed(2)} m²` : 'N/A';
  }

  formatCurrency(amount: number): string {
    return amount ? `$${amount.toLocaleString('es-CR')}` : 'N/A';
  }

  // === GETTERS FOR TEMPLATE ===
  get isDesignValid(): boolean {
    return this.designForm.valid;
  }

  get isHydraulicValid(): boolean {
    return this.hydraulicForm.valid;
  }

  get canPerformCalculations(): boolean {
    return this.isDesignValid && this.isHydraulicValid && !this.isCalculating;
  }

  get canPerformOptimization(): boolean {
    return this.hydraulicResults !== null && !this.isOptimizing;
  }

  get hasRealTimeData(): boolean {
    return this.realTimeData !== null;
  }

  get realTimeTemperature(): number {
    if (!this.realTimeData || !this.realTimeData.soilReadings || this.realTimeData.soilReadings.length === 0) {
      return 0;
    }
    const latest = this.realTimeData.soilReadings[this.realTimeData.soilReadings.length - 1];
    return latest.temperature || 0;
  }

  get realTimePressure(): number {
    if (!this.realTimeData || !this.realTimeData.climateReadings || this.realTimeData.climateReadings.length === 0) {
      return 0;
    }
    const latest = this.realTimeData.climateReadings[this.realTimeData.climateReadings.length - 1];
    return latest.pressure || 0;
  }

  get realTimeFlowRate(): number {
    if (!this.realTimeData || this.realTimeData.totalFlowRate === undefined) {
      return 0;
    }
    return this.realTimeData.totalFlowRate;
  }

  get realTimeHumidity(): number {
    if (!this.realTimeData || !this.realTimeData.climateReadings || this.realTimeData.climateReadings.length === 0) {
      return 0;
    }
    const latest = this.realTimeData.climateReadings[this.realTimeData.climateReadings.length - 1];
    return latest.humidity || 0;
  }

  get realTimeSoilPH(): number {
    if (!this.realTimeData || !this.realTimeData.soilReadings || this.realTimeData.soilReadings.length === 0) {
      return 0;
    }
    const latest = this.realTimeData.soilReadings[this.realTimeData.soilReadings.length - 1];
    return latest.ph || 0;
  }

  get systemStatusText(): string {
    if (!this.systemStatus) return 'Sin conexión';
    return this.systemStatus.systemStatus || 'Desconocido';
  }

  get lastUpdateTime(): string {
    if (!this.systemStatus || !this.systemStatus.lastUpdate) return 'Nunca';
    return new Date(this.systemStatus.lastUpdate).toLocaleString('es-CR');
  }

  get activeDevicesCount(): number {
    return this.realTimeData?.devices.filter((device: { active: any; }) => device.active).length || 0;
  }

  get totalDevicesCount(): number {
    return this.realTimeData?.devices.length || 0;
  }

  get calculationStatusText(): string {
    if (this.isCalculating) return 'Calculando parámetros hidráulicos...';
    if (this.isOptimizing) return 'Optimizando diseño...';
    if (this.isSaving) return 'Guardando diseño...';
    return '';
  }

  get validationStatusClass(): string {
    if (!this.validationResults) return '';
    return this.validationResults.isValid ? 'text-success' : 'text-danger';
  }

  get validationStatusIcon(): string {
    if (!this.validationResults) return 'bi-question-circle';
    return this.validationResults.isValid ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
  }

  get optimizationScoreClass(): string {
    if (!this.optimizationResults) return '';
    const score = this.optimizationResults.finalScore || 0;
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  }

  get estimatedCost(): number {
    if (!this.optimizationResults) return 0;
    return this.optimizationResults.estimatedCost || 0;
  }

  get waterSavings(): number {
    if (!this.optimizationResults) return 0;
    return this.optimizationResults.waterSavings || 0;
  }

  get energySavings(): number {
    if (!this.optimizationResults) return 0;
    return this.optimizationResults.energySavings || 0;
  }

  get uniformityAchieved(): number {
    if (!this.hydraulicResults) return 0;
    return this.hydraulicResults.distributionUniformity || 0;
  }

  get efficiencyAchieved(): number {
    if (!this.hydraulicResults) return 0;
    return this.hydraulicResults.applicationEfficiency || 0;
  }

  get totalPressureLoss(): number {
    if (!this.hydraulicResults) return 0;
    return this.hydraulicResults.totalPressureLoss || 0;
  }

  get systemReliabilityScore(): number {
    if (!this.hydraulicResults || !this.hydraulicResults.systemReliability) return 0;
    const reliability = this.hydraulicResults.systemReliability;
    return (
      (reliability.pressureStability || 0) +
      (reliability.flowStability || 0) +
      (100 - (reliability.cloggingRisk || 0)) +
      (100 - (reliability.maintenanceRequirement || 0))
    ) / 4;
  }

  // 3. Update the loadRealTimeData method to better extract climate data
  private loadRealTimeData(): Observable<any> {
    if (!this.selectedCropProduction) {
      console.error('No crop production selected for real-time data');
      return of(null);
    }

    return combineLatest([
      this.irrigationSectorService.getDeviceDataSummary(this.selectedCropProduction),
      this.irrigationSectorService.getIrrigationSystemStatus(
        this.selectedFarm || 0,
        this.selectedCropProduction
      )
    ]).pipe(
      map(([dataSummary, systemStatus]: [any, any]) => {
        // Extract climate data - prioritize systemStatus.climateReadings
        const climateReadings = systemStatus?.climateReadings || dataSummary?.climateReadings || [];
        if (climateReadings.length > 0) {
          const latestClimate = climateReadings[0]; // Most recent reading

          const climateData = {
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

        console.log('Real-time data summary:', summary);
        this.realTimeData = summary;
        this.cdr.detectChanges();
 
        return {
          dataSummary,
          systemStatus,
          combinedSummary: summary
        };
      })
    );
  }
}