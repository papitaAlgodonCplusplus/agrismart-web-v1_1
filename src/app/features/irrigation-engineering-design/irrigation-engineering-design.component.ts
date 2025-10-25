// src/app/features/irrigation-engineering-design/irrigation-engineering-design.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest, BehaviorSubject, forkJoin, interval, of } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// Services
import { IrrigationEngineeringService } from '../services/irrigation-engineering.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { FarmService } from '../farms/services/farm.service'; 
import { 
  IrrigationSchedulingService, 
  IrrigationMode, 
  IrrigationPlanEntry,
  CreateIrrigationPlanEntryCommand,
  UpdateIrrigationPlanEntryCommand 
} from '../services/irrigation-scheduling.service';
import { AlertService } from '../../core/services/alert.service';

// Add these properties to the existing OnDemandIrrigationComponent class:

import { Injectable } from '@angular/core';

@Injectable()
export class OnDemandSchedulingEnhancement {
  // On-demand scheduling properties
  onDemandMode: IrrigationMode | null = null;
  onDemandEntries: IrrigationPlanEntry[] = [];
  selectedOnDemandEntry: IrrigationPlanEntry | null = null;
  
  // Forms
  onDemandEntryForm!: FormGroup;
  
  // UI State
  showOnDemandForm = false;
  isEditingOnDemand = false;
  
  constructor(
    private fb: FormBuilder,
    private schedulingService: IrrigationSchedulingService,
    private alertService: AlertService
  ) {
    this.initializeOnDemandForm();
  }

  // ==================== Initialization ====================

  initializeOnDemandForm(): void {
    this.onDemandEntryForm = this.fb.group({
      id: [0],
      irrigationPlanId: [null], // Optional for on-demand
      irrigationModeId: [null, Validators.required],
      startHours: [new Date().getHours(), [Validators.required, Validators.min(0), Validators.max(23)]],
      startMinutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      duration: [30, [Validators.required, Validators.min(1), Validators.max(240)]],
      wStart: [null],
      wEnd: [null],
      frequency: [null],
      sequence: [1],
      active: [true],
      notes: ['']
    });
  }

  loadOnDemandData(): void {
    // Load OnDemand mode
    this.schedulingService.getOnDemandMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mode) => {
          if (mode) {
            this.onDemandMode = mode;
            this.loadOnDemandEntries();
          } else {
            console.warn('OnDemand mode not found');
          }
        },
        error: (error) => {
          
          console.error('Error:', error);
        }
      });
  }

  loadOnDemandEntries(): void {
    if (!this.onDemandMode) {
      return;
    }

    this.schedulingService.getAllIrrigationPlanEntries(
      undefined, // No specific plan for on-demand
      this.onDemandMode.id
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entries) => {
          this.onDemandEntries = entries.sort((a, b) => {
            // Sort by creation date, most recent first
            return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
          });
        },
        error: (error) => {
          
          console.error('Error loading entries:', error);
        }
      });
  }

  // ==================== On-Demand Entry Management ====================

  scheduleOnDemandIrrigation(): void {
    if (!this.onDemandMode) {
      
      return;
    }

    // Open form for immediate irrigation
    this.isEditingOnDemand = false;
    const now = new Date();
    
    this.onDemandEntryForm.reset({
      id: 0,
      irrigationPlanId: null,
      irrigationModeId: this.onDemandMode.id,
      startHours: now.getHours(),
      startMinutes: now.getMinutes(),
      duration: 30,
      wStart: null,
      wEnd: null,
      frequency: null,
      sequence: 1,
      active: true,
      notes: ''
    });
    
    this.showOnDemandForm = true;
  }

  editOnDemandEntry(entry: IrrigationPlanEntry): void {
    this.isEditingOnDemand = true;
    this.selectedOnDemandEntry = entry;
    
    // Parse time
    const timeParts = entry.startTime.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    this.onDemandEntryForm.patchValue({
      id: entry.id,
      irrigationPlanId: entry.irrigationPlanId,
      irrigationModeId: entry.irrigationModeId,
      startHours: hours,
      startMinutes: minutes,
      duration: entry.duration,
      wStart: entry.wStart,
      wEnd: entry.wEnd,
      frequency: entry.frequency,
      sequence: entry.sequence,
      active: entry.active
    });
    
    this.showOnDemandForm = true;
  }

  saveOnDemandEntry(): void {
    if (!this.onDemandEntryForm.valid) {
      
      return;
    }

    const formValue = this.onDemandEntryForm.value;
    const userId = 1; // Get from auth service
    
    const startTime = this.schedulingService.toTimeSpan(
      formValue.startHours,
      formValue.startMinutes
    );

    if (this.isEditingOnDemand) {
      const command: UpdateIrrigationPlanEntryCommand = {
        id: formValue.id,
        irrigationPlanId: formValue.irrigationPlanId || 0,
        irrigationModeId: formValue.irrigationModeId,
        startTime: startTime,
        duration: formValue.duration,
        wStart: formValue.wStart,
        wEnd: formValue.wEnd,
        frequency: formValue.frequency,
        sequence: formValue.sequence,
        active: formValue.active,
        updatedBy: userId
      };
      
      this.schedulingService.updateIrrigationPlanEntry(command)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            
            this.showOnDemandForm = false;
            this.loadOnDemandEntries();
          },
          error: (error) => {
            
            console.error('Error:', error);
          }
        });
    } else {
      // Create a temporary plan entry for immediate irrigation
      const command: CreateIrrigationPlanEntryCommand = {
        irrigationPlanId: 0, // Special value for on-demand without plan
        irrigationModeId: formValue.irrigationModeId,
        startTime: startTime,
        duration: formValue.duration,
        wStart: formValue.wStart,
        wEnd: formValue.wEnd,
        frequency: formValue.frequency,
        sequence: formValue.sequence,
        active: formValue.active,
        createdBy: userId
      };
      
      this.schedulingService.createIrrigationPlanEntry(command)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            
            this.showOnDemandForm = false;
            this.loadOnDemandEntries();
            
            // Trigger immediate irrigation if scheduled for now
            const scheduledTime = new Date();
            scheduledTime.setHours(formValue.startHours, formValue.startMinutes, 0, 0);
            const now = new Date();
            
            if (Math.abs(scheduledTime.getTime() - now.getTime()) < 60000) {
              // Within 1 minute, trigger immediately
              this.triggerImmediateIrrigation(formValue.duration);
            }
          },
          error: (error) => {
            
            console.error('Error:', error);
          }
        });
    }
  }

  deleteOnDemandEntry(entry: IrrigationPlanEntry): void {
    if (!confirm('Are you sure you want to delete this on-demand schedule?')) {
      return;
    }

    this.schedulingService.deleteIrrigationPlanEntry(entry.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          
          this.loadOnDemandEntries();
        },
        error: (error) => {
          
          console.error('Error:', error);
        }
      });
  }

  // ==================== Immediate Irrigation ====================

  triggerImmediateIrrigation(durationMinutes: number): void {
    // This method would interface with the existing irrigation control logic
    // from the original on-demand-irrigation component
    
    console.log(`Triggering immediate irrigation for ${durationMinutes} minutes`);
    
    // Call existing irrigation trigger method
    // this.startIrrigation(durationMinutes);
    
    
  }

  quickIrrigate(minutes: number): void {
    if (!this.onDemandMode) {
      
      return;
    }

    const now = new Date();
    const startTime = this.schedulingService.toTimeSpan(now.getHours(), now.getMinutes());
    const userId = 1;

    const command: CreateIrrigationPlanEntryCommand = {
      irrigationPlanId: 0,
      irrigationModeId: this.onDemandMode.id,
      startTime: startTime,
      duration: minutes,
      sequence: 1,
      active: true,
      createdBy: userId
    };

    this.schedulingService.createIrrigationPlanEntry(command)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.triggerImmediateIrrigation(minutes);
          this.loadOnDemandEntries();
        },
        error: (error) => {
          
          console.error('Error:', error);
        }
      });
  }

  // ==================== Helper Methods ====================

  formatOnDemandTime(entry: IrrigationPlanEntry): string {
    return this.schedulingService.formatTime(entry.startTime);
  }

  getOnDemandStatus(entry: IrrigationPlanEntry): string {
    const entryDate = new Date(entry.dateCreated);
    const now = new Date();
    const diffMs = now.getTime() - entryDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < entry.duration) {
      const remaining = entry.duration - diffMinutes;
      return `Active (${remaining} min remaining)`;
    } else {
      return 'Completed';
    }
  }

  isOnDemandActive(entry: IrrigationPlanEntry): boolean {
    const entryDate = new Date(entry.dateCreated);
    const now = new Date();
    const diffMs = now.getTime() - entryDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    return diffMinutes < entry.duration;
  }

  getRecentOnDemandEntries(limit: number = 10): IrrigationPlanEntry[] {
    return this.onDemandEntries.slice(0, limit);
  }

  getTotalOnDemandMinutesToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.onDemandEntries
      .filter(entry => {
        const entryDate = new Date(entry.dateCreated);
        return entryDate >= today;
      })
      .reduce((total, entry) => total + entry.duration, 0);
  }

  cancelOnDemandForm(): void {
    this.showOnDemandForm = false;
    this.selectedOnDemandEntry = null;
  }

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Models and Interfaces
import {
  IrrigationDesign,
  HydraulicParameters,
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
    ReactiveFormsModule,
    FormsModule
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
  validationResults: any | null = null;
  optimizationResults: any | null = null;

  // UI State
  errorMessage = '';
  successMessage = '';
  designs: any;

  // Scheduling filter properties
  selectedProject: string = '';
  selectedStatus: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  onlyActive: boolean = false;
  projects: any[] = [];

  // Schedules data
  schedules$: Observable<any[]> = of([]);
  private schedulesSubject = new BehaviorSubject<any[]>([]);

  // Sorting
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

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

  // ==================== Scheduling Methods ====================

  onFilterChange(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.isLoading = true;
    // TODO: Implement actual API call
    // For now, use empty array
    this.schedulesSubject.next([]);
    this.schedules$ = this.schedulesSubject.asObservable();
    this.isLoading = false;
  }

  createNew(): void {
    // TODO: Navigate to create new schedule page
    console.log('Create new schedule');
  }

  exportToExcel(): void {
    // TODO: Implement Excel export
    console.log('Export to Excel');
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadSchedules();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-warning',
      'in-progress': 'bg-primary',
      'completed': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in-progress': 'En Progreso',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  getProgressBarClass(progress: number): string {
    if (progress < 25) return 'bg-danger';
    if (progress < 50) return 'bg-warning';
    if (progress < 75) return 'bg-info';
    return 'bg-success';
  }

  viewDetails(schedule: any): void {
    // TODO: Navigate to details view
    console.log('View details for:', schedule);
  }

  edit(schedule: any): void {
    // TODO: Navigate to edit view
    console.log('Edit schedule:', schedule);
  }

  updateProgress(schedule: any): void {
    // TODO: Open progress update dialog
    console.log('Update progress for:', schedule);
  }

  delete(schedule: any): void {
    if (confirm('¿Está seguro de que desea eliminar esta programación?')) {
      // TODO: Implement delete
      console.log('Delete schedule:', schedule);
      this.loadSchedules();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSchedules();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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

  // === DESIGN SELECTION METHODS ===

  loadExistingDesign(design: any): void {
    try {
      console.log('Loading existing design:', design);

      // Set current design
      this.currentDesign = design;

      // Populate the design form with existing data
      this.designForm.patchValue({
        name: design.name || '',
        description: design.description || '',
        farmId: design.farmId || null,
        cropProductionId: design.cropProductionId || null,
        totalArea: design.totalArea || 0,
        plantSpacing: 0.3, // Default value as not stored in design
        rowSpacing: 1.2, // Default value as not stored in design
        numberOfPlants: Math.round(design.totalArea * design.plantDensity) || 0,

        // Container Configuration (if available)
        containerId: design.containerId || null,
        dropperId: design.dropperId || null,
        growingMediumId: design.growingMediumId || null,
        containerLength: 1.2, // Default
        containerWidth: 0.2, // Default
        numberOfContainers: 0, // Default

        // Emitter Configuration
        emitterType: 'dripper', // Default
        emitterFlowRate: 2, // Default
        emittersPerPlant: 1, // Default
        operatingPressure: design.waterPressure || 1.5,
        pressureCompensation: false,

        // Water Requirements
        dailyWaterRequirement: design.dailyWaterRequirement || 0,
        irrigationFrequency: design.irrigationFrequency || 1,

        // Climate data
        climate: {
          averageTemperature: design.averageTemperature || 22,
          averageHumidity: design.averageHumidity || 65,
          windSpeed: design.windSpeed || 2,
          solarRadiation: design.solarRadiation || 20,
          elevation: design.elevation || 1200
        },

        // Water Source
        waterSource: {
          sourceType: design.waterSourceType || 'well',
          waterPressure: design.waterPressure || 1.5,
          waterFlow: design.waterFlowRate || 0,
          waterQuality: {
            ph: design.waterPh || 7,
            electricalConductivity: design.electricalConductivity || 0.8,
            totalDissolvedSolids: design.totalDissolvedSolids || 500,
            nitrates: 10, // Default
            phosphorus: 2, // Default  
            potassium: 5 // Default
          }
        },

        // Pipeline Configuration
        mainPipeDiameter: design.mainPipeDiameter || 63,
        secondaryPipeDiameter: design.secondaryPipeDiameter || 32,
        lateralPipeDiameter: design.lateralPipeDiameter || 16,
        pipelineMaterial: design.mainPipeMaterial || 'PE',

        // System Components
        components: {
          hasFiltration: design.hasFiltration || false,
          hasAutomation: design.hasAutomation || false,
          hasFertigation: design.hasFertigation || false,
          hasBackflowPrevention: true, // Default
          hasPressureRegulation: true, // Default
          hasFlowMeter: false // Default
        }
      });

      // Update hydraulic form if hydraulic data is available
      if (design.totalSystemFlowRate || design.requiredPumpPower) {
        this.hydraulicForm.patchValue({
          operatingPressure: design.waterPressure || 1.5,
          maxFlowRate: design.totalSystemFlowRate || 0,
          designVelocity: 1.5, // Default
          frictionLossCoefficient: 0.2, // Default
          minorLossCoefficient: 0.1, // Default
          elevationDifference: 0, // Default
          targetUniformity: design.uniformityCoefficient ? design.uniformityCoefficient * 100 : 90,
          targetEfficiency: design.applicationEfficiency ? design.applicationEfficiency * 100 : 85,
          maximumPressureVariation: 10 // Default
        });
      }

      // Set selected farm and crop production for real-time data
      if (design.farmId) {
        this.selectedFarm = design.farmId;
      }
      if (design.cropProductionId) {
        this.selectedCropProduction = design.cropProductionId;
      }

      // Load real-time data for the selected design
      this.loadRealTimeData();

      this.successMessage = `Diseño "${design.name}" cargado exitosamente`;
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error loading existing design:', error);
      this.errorMessage = 'Error al cargar el diseño seleccionado';
      this.cdr.detectChanges();
    }
  }

  duplicateDesign(design: any): void {
    try {
      // Create a copy of the design with a new name
      const duplicatedDesign = { ...design };
      duplicatedDesign.name = `${design.name} (Copia)`;
      duplicatedDesign.id = null; // Remove ID to create new design
      duplicatedDesign.createdAt = new Date().toISOString();
      duplicatedDesign.status = 'draft';
      duplicatedDesign.version = '1.0';

      // Load the duplicated design
      this.loadExistingDesign(duplicatedDesign);

      this.successMessage = `Diseño duplicado como "${duplicatedDesign.name}"`;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error duplicating design:', error);
      this.errorMessage = 'Error al duplicar el diseño';
      this.cdr.detectChanges();
    }
  }

  exportSingleDesign(design: any): void {
    try {
      // Create export data for single design
      const exportData = {
        design: design,
        exportDate: new Date(),
        exportType: 'single-design',
        version: design.version || '1.0'
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `design-${design.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      this.successMessage = `Diseño "${design.name}" exportado exitosamente`;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error exporting design:', error);
      this.errorMessage = 'Error al exportar el diseño';
      this.cdr.detectChanges();
    }
  }

  clearSelection(): void {
    this.currentDesign = null;
    this.selectedFarm = null;
    this.selectedCropProduction = null;

    // Reset forms to default values
    this.initializeDesignForm();
    this.initializeHydraulicForm();

    // Clear results
    this.hydraulicResults = null;
    this.validationResults = null;
    this.optimizationResults = null;

    this.successMessage = 'Selección eliminada. Formulario reiniciado.';
    this.cdr.detectChanges();
  }

  createNewDesign(): void {
    this.clearSelection();
    this.successMessage = 'Listo para crear un nuevo diseño';
    this.cdr.detectChanges();
  }

  // === UTILITY METHODS FOR TEMPLATE ===

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Borrador',
      'in-progress': 'En Progreso',
      'completed': 'Completado',
      'validated': 'Validado',
      'archived': 'Archivado'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  // === UTILITY METHODS ===

  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin({
      designs: this.irrigationEngineeringService.getAll().pipe(catchError(() => of([]))),
      farms: this.farmService.getAll().pipe(catchError(() => of([]))),
      cropProductions: this.cropProductionService.getAll().pipe(catchError(() => of([]))),
      containers: this.irrigationSectorService.getAllContainers().pipe(catchError(() => of([]))),
      droppers: this.irrigationSectorService.getAllDroppers().pipe(catchError(() => of([]))),
      growingMediums: this.irrigationSectorService.getAllGrowingMediums().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any) => {
        console.log("allInitialDataGotted", data)
        this.designs = data.designs?.result || [];
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
          this.currentDesign = this.designForm.value;
          this.performHydraulicCalculations();
          break;
        case 'validation':
          if (this.hydraulicResults) {
            this.validationResults = this.validateSystem();
          } else {
            console.error('Please perform hydraulic calculations first');
            this.alertService.showWarning('Por favor realice los cálculos hidráulicos primero');
          }
          break;
        case 'optimization':
          if (this.hydraulicResults) {
            this.performOptimization();
          }
          break;
        case 'results':
          this.saveDesignToDB();
      }
    }, 100);
  }

  // =============================================================================
  // FINAL FIX - FLAT DTO STRUCTURE FOR API
  // =============================================================================

  // The API expects flat properties, not nested objects!
  // Based on IrrigationDesignParameters class, these should be at root level:
  // - TotalArea, MainPipeDiameter, SecondaryPipeDiameter, LateralPipeDiameter, Name

  private saveDesignToDB(): void {
    // Validation helpers (keep these)
    const ensureValidPipeDiameter = (value: any, defaultValue: number = 25): number => {
      const num = Number(value);
      if (isNaN(num) || num < 10 || num > 1000) {
        return defaultValue;
      }
      return num;
    };

    const ensureValidTotalArea = (value: any): number => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return 100;
      }
      return num;
    };

    const ensureValidName = (value: any): string => {
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        return `Design_${Date.now()}`;
      }
      return value.trim();
    };

    // Get validated values
    const totalArea = ensureValidTotalArea(this.designForm.get('totalArea')?.value);
    const designName = ensureValidName(this.designForm.get('name')?.value);
    const mainPipeDiameter = ensureValidPipeDiameter(this.designForm.get('mainPipeDiameter')?.value, 32);
    const secondaryPipeDiameter = ensureValidPipeDiameter(this.designForm.get('secondaryPipeDiameter')?.value, 25);
    const lateralPipeDiameter = ensureValidPipeDiameter(this.designForm.get('lateralPipeDiameter')?.value, 16);

    // FIXED: Create flat structure that matches IrrigationDesignParameters
    const apiPayload = {
      createDto: {
        // CRITICAL: These must be at root level for validation to work
        name: designName,
        description: this.designForm.get('description')?.value || 'Irrigation system design',
        designType: 'irrigation',
        status: 'draft',
        version: '1.0',

        // FLAT PROPERTIES - These are validated by the API at root level
        totalArea: totalArea,
        mainPipeDiameter: mainPipeDiameter,
        secondaryPipeDiameter: secondaryPipeDiameter,
        lateralPipeDiameter: lateralPipeDiameter,

        // Other flat properties from the form
        numberOfSectors: 1,
        containerDensity: 0,
        plantDensity: this.designForm.get('numberOfPlants')?.value / totalArea || 0,
        dailyWaterRequirement: this.designForm.get('dailyWaterRequirement')?.value || 0,
        irrigationFrequency: Math.min(this.designForm.get('irrigationFrequency')?.value || 1, 24),

        // Component IDs
        containerId: this.designForm.get('containerId')?.value || null,
        dropperId: this.designForm.get('dropperId')?.value || null,
        growingMediumId: this.designForm.get('growingMediumId')?.value || null,

        // Climate data as flat properties
        averageTemperature: Math.min(this.designForm.get('climate.averageTemperature')?.value || 25, 60),
        averageHumidity: this.designForm.get('climate.averageHumidity')?.value || 70,
        windSpeed: Math.min(this.designForm.get('climate.windSpeed')?.value || 5, 50),
        solarRadiation: Math.min(this.designForm.get('climate.solarRadiation')?.value || 6, 50),
        elevation: this.designForm.get('climate.elevation')?.value || 0,

        // Water source data as flat properties
        waterSourceType: this.designForm.get('waterSource.sourceType')?.value || 'municipal',
        waterPressure: Math.min(this.designForm.get('waterSource.waterPressure')?.value || 2.0, 20),
        waterFlowRate: this.designForm.get('waterSource.waterFlow')?.value || 100,

        // Water quality as flat properties
        waterPh: this.ensureValidPH(this.designForm.get('waterSource.waterQuality.ph')?.value),
        electricalConductivity: Math.min(this.designForm.get('waterSource.waterQuality.electricalConductivity')?.value || 1.0, 10),
        totalDissolvedSolids: this.designForm.get('waterSource.waterQuality.totalDissolvedSolids')?.value || 500,
        nitrates: this.designForm.get('waterSource.waterQuality.nitrates')?.value || 0,
        phosphorus: this.designForm.get('waterSource.waterQuality.phosphorus')?.value || 0,
        potassium: this.designForm.get('waterSource.waterQuality.potassium')?.value || 0,
        calcium: 0,
        magnesium: 0,
        sulfur: 0,
        iron: 0,
        manganese: 0,
        zinc: 0,
        copper: 0,
        boron: 0,

        // Pipeline materials
        mainPipeMaterial: this.designForm.get('pipelineMaterial')?.value || 'PE',
        secondaryPipeMaterial: this.designForm.get('pipelineMaterial')?.value || 'PE',
        lateralPipeMaterial: this.designForm.get('pipelineMaterial')?.value || 'PE',

        // Pipeline lengths (calculated)
        mainPipeLength: Math.sqrt(totalArea),
        secondaryPipeLength: Math.sqrt(totalArea),
        lateralPipeLength: Math.sqrt(totalArea) / 2,

        // System components as flat boolean properties
        hasFiltration: this.designForm.get('components.hasFiltration')?.value || false,
        hasAutomation: this.designForm.get('components.hasAutomation')?.value || false,
        hasFertigation: this.designForm.get('components.hasFertigation')?.value || false,
        hasFlowMeter: this.designForm.get('components.hasFlowMeter')?.value || false,
        hasPressureRegulator: this.designForm.get('components.hasPressureRegulation')?.value || false,
        hasBackflowPrevention: this.designForm.get('components.hasBackflowPrevention')?.value || false,

        // System type properties
        filtrationSystemType: this.designForm.get('components.hasFiltration')?.value ? 'standard' : undefined,
        automationSystemType: this.designForm.get('components.hasAutomation')?.value ? 'basic' : undefined,
        fertigationSystemType: this.designForm.get('components.hasFertigation')?.value ? 'standard' : undefined,

        // Foreign key relationships
        cropProductionId: this.designForm.get('cropProductionId')?.value || null,
        farmId: this.designForm.get('farmId')?.value || null,
        clientId: 1,

        // Soil parameters as flat properties
        soilType: '',
        soilInfiltrationRate: 0,
        soilWaterHoldingCapacity: 0,
        slopePercentage: 0,
        drainageClass: '',

        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 1,
        updatedBy: 1,

        // String properties
        tags: JSON.stringify([]), // Keep as JSON string
        isTemplate: false,
        isPublic: false,
        isActive: true,
        requiresRecalculation: true,

        designStandards: ['ISO 9261', 'ASAE EP405'],

        // JSON string properties
        componentSpecificationsJson: '{}',
        installationInstructionsJson: '{}',
        maintenanceScheduleJson: '{}',
        operationScheduleJson: '{}',
        materialListJson: '{}'
      }
    };

    // Enhanced logging to verify the flat structure
    console.log('🔧 FLAT Structure Validation Check:', {
      name: apiPayload.createDto.name,
      totalArea: apiPayload.createDto.totalArea,
      mainPipeDiameter: apiPayload.createDto.mainPipeDiameter,
      secondaryPipeDiameter: apiPayload.createDto.secondaryPipeDiameter,
      lateralPipeDiameter: apiPayload.createDto.lateralPipeDiameter,
      structureType: 'FLAT (not nested)',
      validationReady: true
    });

    console.log('🚀 Sending FLAT structure API payload:', apiPayload);

    // Call the API
    this.irrigationEngineeringService.createDesign(apiPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.successMessage = 'Diseño guardado exitosamente';
          console.log('✅ Design saved successfully:', result);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error saving design:', error);
          this.errorMessage = 'Error guardando el diseño';

          // Enhanced error logging
          if (error.error?.errors) {
            console.error('🔍 Validation errors (should be resolved now):', error.error.errors);
            Object.keys(error.error.errors).forEach(field => {
              console.error(`  - ${field}: ${error.error.errors[field].join(', ')}`);
            });
          }

          this.cdr.detectChanges();
        }
      });
  }


  private ensureValidPH(value: any): number {
    const ph = parseFloat(value);
    return !isNaN(ph) && ph >= 0 && ph <= 14 ? ph : 7; // Default to neutral pH
  }

  calculateHydraulicSolution(designData: any, hydraulicData: any): any {
    // Extract design parameters
    const {
      totalArea = 0,
      numberOfPlants = 0,
      emitterFlowRate = 0,
      emittersPerPlant = 0,
      irrigationFrequency = 0,
      dailyWaterRequirement = 0,
      operatingPressure = 0,
      mainPipeDiameter = 0,
      secondaryPipeDiameter = 0,
      lateralPipeDiameter = 0,
      pipelineMaterial = '',
      pressureCompensation = false
    } = {
      ...designData,
      ...designData.components,
      ...designData.waterSource,
      ...designData.climate
    };

    // Extract hydraulic parameters
    const {
      designVelocity,
      frictionLossCoefficient,
      minorLossCoefficient,
      elevationDifference,
      targetUniformity,
      targetEfficiency,
      maximumPressureVariation,
      maxFlowRate
    } = hydraulicData;

    // 1. Calculate total emitter flow (L/h)
    const totalEmitters = numberOfPlants * emittersPerPlant;
    const totalEmitterFlowLph = totalEmitters * emitterFlowRate;

    // 2. Calculate system flow rate (L/min)
    const systemFlowRate = totalEmitterFlowLph / 60;

    // 3. Calculate irrigation time per event (minutes)
    const irrigationEvents = irrigationFrequency > 0 ? irrigationFrequency : 1;
    const irrigationTimePerEvent = (dailyWaterRequirement * numberOfPlants) / (systemFlowRate * irrigationEvents);

    // 4. Calculate pipe velocities (m/s)
    function pipeVelocity(diameterMM: number, flowLmin: number): number {
      const diameterM = diameterMM / 1000;
      const area = Math.PI * Math.pow(diameterM / 2, 2);
      const flowM3s = (flowLmin / 1000) / 60;
      return area > 0 ? flowM3s / area : 0;
    }
    const mainPipeVelocity = pipeVelocity(mainPipeDiameter, systemFlowRate);
    const secondaryPipeVelocity = pipeVelocity(secondaryPipeDiameter, systemFlowRate);
    const lateralPipeVelocity = pipeVelocity(lateralPipeDiameter, systemFlowRate);

    // 5. Calculate friction losses (Hazen-Williams for plastic pipes)
    function hazenWilliamsLoss(flowLmin: number, diameterMM: number, lengthM: number, c = 150): number {
      // Q in L/min, D in mm, L in m, c = Hazen-Williams coefficient
      const Q = flowLmin / 60; // L/min to L/s
      const D = diameterMM / 1000; // mm to m
      if (Q <= 0 || D <= 0 || lengthM <= 0) return 0;
      // Convert Q to m3/s
      const Qm3s = Q / 1000;
      // Hazen-Williams formula (SI units): h_f = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)
      return 10.67 * lengthM * Math.pow(Qm3s, 1.852) / (Math.pow(c, 1.852) * Math.pow(D, 4.87));
    }
    // Assume lengths (could be improved with real design data)
    const mainPipeLength = Math.sqrt(totalArea); // main line ~ field length
    const secondaryPipeLength = Math.sqrt(totalArea); // secondary ~ field width
    const lateralPipeLength = Math.sqrt(totalArea) / 2; // lateral ~ half field width

    const mainPipeLoss = hazenWilliamsLoss(systemFlowRate, mainPipeDiameter, mainPipeLength);
    const secondaryPipeLoss = hazenWilliamsLoss(systemFlowRate, secondaryPipeDiameter, secondaryPipeLength);
    const lateralPipeLoss = hazenWilliamsLoss(systemFlowRate, lateralPipeDiameter, lateralPipeLength);

    // 6. Minor losses (fittings, valves, etc.)
    const totalMinorLoss = minorLossCoefficient * (mainPipeLoss + secondaryPipeLoss + lateralPipeLoss);

    // 7. Elevation loss/gain (m)
    const elevationLoss = elevationDifference || 0;

    // 8. Total pressure loss (m)
    const totalPressureLossM = mainPipeLoss + secondaryPipeLoss + lateralPipeLoss + totalMinorLoss + elevationLoss;

    // 9. Convert pressure loss to bar (1 bar = 10.1972 m H2O)
    const totalPressureLossBar = totalPressureLossM / 10.1972;

    // 10. Calculate distribution uniformity (simple model)
    let distributionUniformity = 100;
    if (!pressureCompensation) {
      // Uniformity drops with pressure variation
      const pressureVariation = maximumPressureVariation || 10;
      distributionUniformity = Math.max(80, 100 - pressureVariation * 0.8);
    }

    // 11. Application efficiency (assume 85-95% for drip, lower for sprinkler)
    let applicationEfficiency = 90;
    if (designData.emitterType === 'sprinkler') applicationEfficiency = 80;
    if (designData.emitterType === 'mist') applicationEfficiency = 75;

    // 12. Reynolds number (for main pipe)
    function reynoldsNumber(velocity: number, diameterMM: number): number {
      // Water at 20°C: kinematic viscosity ~1e-6 m2/s
      const diameterM = diameterMM / 1000;
      return velocity * diameterM / 1e-6;
    }
    const mainPipeReynolds = reynoldsNumber(mainPipeVelocity, mainPipeDiameter);

    // 13. Emitter performance
    const emissionUniformity = pressureCompensation ? 95 : distributionUniformity - 5;
    const coefficientOfVariation = pressureCompensation ? 5 : 10;

    // 14. System reliability (simple estimation)
    const systemReliability = {
      pressureStability: 100 - (maximumPressureVariation || 10),
      flowStability: 100 - Math.abs(systemFlowRate - (maxFlowRate || systemFlowRate)),
      cloggingRisk: designData.components?.hasFiltration ? 5 : 20,
      maintenanceRequirement: designData.components?.hasAutomation ? 10 : 20
    };

    // 15. Build HydraulicParameters result
    return {
      systemFlowRate,
      designFlowRate: systemFlowRate,
      irrigationTimePerEvent,
      mainPipeVelocity,
      secondaryPipeVelocity,
      lateralPipeVelocity,
      mainPipeLoss,
      secondaryPipeLoss,
      lateralPipeLoss,
      totalMinorLoss,
      elevationLoss,
      totalPressureLoss: totalPressureLossBar,
      operatingPressure: operatingPressure,
      pressureVariation: maximumPressureVariation,
      distributionUniformity,
      applicationEfficiency,
      reynoldsNumber: mainPipeReynolds,
      emitterPerformance: {
        emissionUniformity,
        coefficientOfVariation
      },
      systemReliability
    };
  }

  performHydraulicCalculations(): void {
    this.isCalculating = true;
    this.calculationProgress = 0;

    // Simulate calculation progress
    const progressInterval = setInterval(() => {
      this.calculationProgress += 20;
      this.cdr.detectChanges();
    }, 200);

    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;

    const result = this.calculateHydraulicSolution(designData, hydraulicData)
    console.log('Hydraulic calculation results:', result);
    clearInterval(progressInterval);
    this.calculationProgress = 100;
    this.hydraulicResults = result;
    this.isCalculating = false;
    this.successMessage = 'Cálculos hidráulicos completados';
    this.cdr.detectChanges();

    // Auto-validate system
    setTimeout(() => this.validateSystem(), 500);
  }

  // Private system validation function based on project documentation
  // Add this to your irrigation-engineering-design.component.ts

  public validateSystem(): any {
    if (!this.hydraulicResults) {
      this.alertService.showWarning('Please perform hydraulic calculations first');
      return this.createEmptyValidationResult(false);
    }

    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;
    const hydraulicResults = this.hydraulicResults;

    // Initialize validation result
    const validationResult = {
      isValid: true,
      overallScore: 100,
      issues: [],
      recommendations: [],
      pressureValidation: {
        isValid: true,
        minPressure: 0,
        maxPressure: 0,
        pressureVariation: 0
      },
      flowValidation: {
        isValid: true,
        flowBalance: 0,
        flowVariation: 0,
        adequateFlow: true
      },
      uniformityValidation: {
        isValid: true,
        achievedUniformity: 0,
        targetUniformity: hydraulicData.targetUniformity || 90,
        uniformityGrade: 'Good'
      },
      technicalCompliance: {
        velocityCompliance: true,
        pressureCompliance: true,
        materialCompatibility: true,
        standardsCompliance: true
      },
      performancePrediction: {
        expectedLifespan: 15,
        maintenanceFrequency: 12,
        energyEfficiency: 85,
        waterUseEfficiency: 88
      }
    };

    // 1. VALIDATE DESIGN PARAMETERS
    this.validateDesignParameters(designData, validationResult);

    // 2. VALIDATE PRESSURE PARAMETERS
    this.validatePressureParameters(hydraulicData, hydraulicResults, validationResult);

    // 3. VALIDATE FLOW PARAMETERS
    this.validateFlowParameters(hydraulicData, hydraulicResults, validationResult);

    // 4. VALIDATE UNIFORMITY PARAMETERS
    this.validateUniformityParameters(hydraulicData, hydraulicResults, validationResult);

    // 5. VALIDATE TECHNICAL COMPLIANCE
    this.validateTechnicalCompliance(hydraulicData, hydraulicResults, validationResult);

    // 6. CALCULATE OVERALL SCORE AND FINAL VALIDATION
    validationResult.overallScore = this.calculateOverallScore(validationResult);
    validationResult.isValid = !this.hasCriticalIssues(validationResult) && validationResult.overallScore >= 70;

    // 7. GENERATE RECOMMENDATIONS
    this.generateRecommendations(validationResult);

    return validationResult;
  }

  private validateDesignParameters(designData: any, result: any): void {
    // Validar área total
    if (!designData.totalArea || designData.totalArea <= 0) {
      result.issues.push({
        id: this.generateId(),
        category: 'Área',
        severity: 'critical',
        message: 'El área total debe ser mayor que 0',
        affectedParameter: 'TotalArea',
        currentValue: designData.totalArea,
        recommendedValue: 100
      });
    }

    // Validar requerimiento diario de agua
    if (!designData.dailyWaterRequirement || designData.dailyWaterRequirement <= 0) {
      result.issues.push({
        id: this.generateId(),
        category: 'Requerimiento de Agua',
        severity: 'critical',
        message: 'El requerimiento diario de agua debe ser mayor que 0',
        affectedParameter: 'DailyWaterRequirement',
        currentValue: designData.dailyWaterRequirement,
        recommendedValue: 2.0
      });
    }

    // // Validar densidad de plantas
    // if (!designData.plantDensity || designData.plantDensity <= 0) {
    //   result.issues.push({
    //     id: this.generateId(),
    //     category: 'Densidad de Plantas',
    //     severity: 'critical',
    //     message: 'La densidad de plantas debe ser mayor que 0',
    //     affectedParameter: 'PlantDensity',
    //     currentValue: designData.plantDensity,
    //     recommendedValue: 1.0
    //   });
    // }

    // Validar presión de la fuente de agua
    if (designData.waterSource?.waterPressure <= 0) {
      result.issues.push({
        id: this.generateId(),
        category: 'Fuente de Agua',
        severity: 'critical',
        message: 'Debe especificar la presión de la fuente de agua',
        affectedParameter: 'WaterPressure',
        currentValue: designData.waterSource.waterPressure,
        recommendedValue: 2.0
      });
    }

    // Validar parámetros de calidad de agua
    const waterQuality = designData.waterSource?.waterQuality;
    if (waterQuality) {
      if (waterQuality.ph < 5.5 || waterQuality.ph > 8.5) {
        result.issues.push({
          id: this.generateId(),
          category: 'Calidad de Agua',
          severity: 'warning',
          message: 'El nivel de pH está fuera del rango óptimo (5.5-8.5)',
          affectedParameter: 'pH',
          currentValue: waterQuality.ph,
          recommendedValue: 7.0
        });
      }

      if (waterQuality.electricalConductivity > 2.0) {
        result.issues.push({
          id: this.generateId(),
          category: 'Calidad de Agua',
          severity: 'warning',
          message: 'La conductividad eléctrica es demasiado alta, puede causar estrés salino',
          affectedParameter: 'ElectricalConductivity',
          currentValue: waterQuality.electricalConductivity,
          recommendedValue: 1.5
        });
      }
    }
  }

  private validatePressureParameters(hydraulicData: any, hydraulicResults: any, result: any): void {
    const operatingPressure = hydraulicData.operatingPressure || 0;
    const totalPressureLoss = hydraulicResults.totalPressureLoss || 0;
    const minRequiredPressure = 1.0; // bar
    const maxRecommendedPressure = 4.0; // bar

    // Calculate pressure variation
    const pressureVariation = hydraulicData.pressureVariation || 10;
    const minSystemPressure = operatingPressure - (operatingPressure * pressureVariation / 100);
    const maxSystemPressure = operatingPressure + (operatingPressure * pressureVariation / 100);

    result.pressureValidation = {
      isValid: true,
      minPressure: minSystemPressure,
      maxPressure: maxSystemPressure,
      pressureVariation: pressureVariation
    };

    // Validar presión mínima
    if (minSystemPressure < minRequiredPressure) {
      result.pressureValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Presión',
        severity: 'critical',
        message: 'La presión mínima del sistema está por debajo del umbral aceptable',
        affectedParameter: 'MinPressure',
        currentValue: minSystemPressure,
        recommendedValue: minRequiredPressure
      });
    }

    // Validar presión máxima
    if (maxSystemPressure > maxRecommendedPressure) {
      result.pressureValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Presión',
        severity: 'warning',
        message: 'La presión máxima del sistema supera los límites recomendados',
        affectedParameter: 'MaxPressure',
        currentValue: maxSystemPressure,
        recommendedValue: maxRecommendedPressure
      });
    }

    // Validar pérdida de presión vs presión de operación
    if (totalPressureLoss > operatingPressure * 0.8) {
      result.pressureValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Presión',
        severity: 'critical',
        message: 'La pérdida total de presión excede el 80% de la presión de operación',
        affectedParameter: 'PressureLoss',
        currentValue: totalPressureLoss,
        recommendedValue: operatingPressure * 0.6
      });
    }

    // Validar variación de presión
    if (pressureVariation > 20) {
      result.pressureValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Presión',
        severity: 'warning',
        message: 'La variación de presión excede el 20% recomendado',
        affectedParameter: 'PressureVariation',
        currentValue: pressureVariation,
        recommendedValue: 15
      });
    }
  }

  private validateFlowParameters(hydraulicData: any, hydraulicResults: any, result: any): void {
    const systemFlowRate = hydraulicResults.systemFlowRate || 0;
    const designFlowRate = hydraulicResults.designFlowRate || 0;
    const maxFlowRate = hydraulicData.maxFlowRate || 0;

    // Calculate flow balance deviation
    const flowBalance = designFlowRate > 0 ?
      Math.abs(systemFlowRate - designFlowRate) / designFlowRate * 100 : 100;

    // Calculate flow variation
    const flowVariation = systemFlowRate > 0 ?
      Math.abs(maxFlowRate - systemFlowRate) / systemFlowRate * 100 : 0;

    const adequateFlow = systemFlowRate >= designFlowRate * 0.9;

    result.flowValidation = {
      isValid: true,
      flowBalance: flowBalance,
      flowVariation: flowVariation,
      adequateFlow: adequateFlow
    };

    // Validate flow balance
    if (flowBalance > 10) {
      result.flowValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Flow',
        severity: 'warning',
        message: 'La desviación del equilibrio del flujo excede los límites aceptables',
        affectedParameter: 'FlowBalance',
        currentValue: flowBalance,
        recommendedValue: 5
      });
    }

    // Validate adequate flow
    if (!adequateFlow) {
      result.flowValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Flow',
        severity: 'critical',
        message: 'El caudal del sistema es insuficiente para los requisitos de diseño',
        affectedParameter: 'SystemFlowRate',
        currentValue: systemFlowRate,
        recommendedValue: designFlowRate
      });
    }

    // Validate flow variation
    if (flowVariation > 15) {
      result.flowValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Flow',
        severity: 'warning',
        message: 'La variación del flujo excede los límites recomendados',
        affectedParameter: 'FlowVariation',
        currentValue: flowVariation,
        recommendedValue: 10
      });
    }
  }

  private validateUniformityParameters(hydraulicData: any, hydraulicResults: any, result: any): void {
    const targetUniformity = hydraulicData.targetUniformity || 90;
    const achievedUniformity = hydraulicResults.distributionUniformity || 0;

    result.uniformityValidation = {
      isValid: achievedUniformity >= targetUniformity,
      achievedUniformity: achievedUniformity,
      targetUniformity: targetUniformity,
      uniformityGrade: this.getUniformityGrade(achievedUniformity)
    };

    // Validate distribution uniformity
    if (achievedUniformity < targetUniformity) {
      result.uniformityValidation.isValid = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Uniformity',
        severity: 'warning',
        message: 'Distribution uniformity below target',
        affectedParameter: 'DistributionUniformity',
        currentValue: achievedUniformity,
        recommendedValue: targetUniformity
      });
    }

    // Check for extremely poor uniformity
    if (achievedUniformity < 80) {
      result.issues.push({
        id: this.generateId(),
        category: 'Uniformity',
        severity: 'critical',
        message: 'Distribution uniformity critically low',
        affectedParameter: 'DistributionUniformity',
        currentValue: achievedUniformity,
        recommendedValue: 85
      });
    }

    // Validate emission uniformity if available
    if (hydraulicResults.emitterPerformance?.emissionUniformity) {
      const emissionUniformity = hydraulicResults.emitterPerformance.emissionUniformity;
      if (emissionUniformity < 85) {
        result.issues.push({
          id: this.generateId(),
          category: 'Uniformity',
          severity: 'warning',
          message: 'Emission uniformity below recommended threshold',
          affectedParameter: 'EmissionUniformity',
          currentValue: emissionUniformity,
          recommendedValue: 90
        });
      }
    }

    // Validate coefficient of variation
    if (hydraulicResults.emitterPerformance?.coefficientOfVariation) {
      const cv = hydraulicResults.emitterPerformance.coefficientOfVariation;
      if (cv > 10) {
        result.issues.push({
          id: this.generateId(),
          category: 'Uniformity',
          severity: 'warning',
          message: 'Coefficient of variation exceeds recommended limits',
          affectedParameter: 'CoefficientOfVariation',
          currentValue: cv,
          recommendedValue: 7
        });
      }
    }
  }

  private validateTechnicalCompliance(hydraulicData: any, hydraulicResults: any, result: any): void {
    const averageVelocity = hydraulicResults.averageVelocity || 0;
    const totalPressureLoss = hydraulicResults.totalPressureLoss || 0;
    const operatingPressure = hydraulicData.operatingPressure || 0;

    result.technicalCompliance = {
      velocityCompliance: averageVelocity >= 0.3 && averageVelocity <= 3.0,
      pressureCompliance: totalPressureLoss <= operatingPressure,
      materialCompatibility: true, // Assume compatible unless specific checks needed
      standardsCompliance: true    // Assume compliant unless specific standards validation needed
    };

    // Validate velocity compliance
    if (averageVelocity < 0.3) {
      result.technicalCompliance.velocityCompliance = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Technical',
        severity: 'warning',
        message: 'Average velocity too low, may cause sedimentation',
        affectedParameter: 'AverageVelocity',
        currentValue: averageVelocity,
        recommendedValue: 0.5
      });
    }

    if (averageVelocity > 3.0) {
      result.technicalCompliance.velocityCompliance = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Technical',
        severity: 'critical',
        message: 'Average velocity too high, excessive pressure loss',
        affectedParameter: 'AverageVelocity',
        currentValue: averageVelocity,
        recommendedValue: 2.0
      });
    }

    // Validate pressure compliance
    if (totalPressureLoss > operatingPressure) {
      result.technicalCompliance.pressureCompliance = false;
      result.issues.push({
        id: this.generateId(),
        category: 'Technical',
        severity: 'critical',
        message: 'Total pressure loss exceeds operating pressure',
        affectedParameter: 'TotalPressureLoss',
        currentValue: totalPressureLoss,
        recommendedValue: operatingPressure * 0.8
      });
    }

    // Validate Reynolds number if available
    if (hydraulicResults.reynoldsNumber) {
      const reynolds = hydraulicResults.reynoldsNumber;
      if (reynolds < 2300) {
        result.issues.push({
          id: this.generateId(),
          category: 'Technical',
          severity: 'info',
          message: 'Laminar flow detected, consider increasing velocity',
          affectedParameter: 'ReynoldsNumber',
          currentValue: reynolds,
          recommendedValue: 4000
        });
      }
    }
  }
  private generateRecommendations(result: any): void {
    result.recommendations = [];

    // Pressure-related recommendations
    if (result.issues.some((i: { category: string; }) => i.category === 'Pressure')) {
      result.recommendations.push('Considere ajustar los diámetros de las tuberías para optimizar la distribución de presión');
      result.recommendations.push('Instale reguladores de presión para mantener una presión constante');
    }

    // Flow-related recommendations
    if (result.issues.some((i: { category: string; }) => i.category === 'Flow')) {
      result.recommendations.push('Revise el dimensionamiento de la bomba para asegurar caudales adecuados');
      result.recommendations.push('Considere sectorizar el sistema para gestionar mejor la distribución del caudal');
    }

    // Uniformity-related recommendations
    if (result.issues.some((i: { category: string; }) => i.category === 'Uniformity')) {
      result.recommendations.push('Utilice emisores autocompensantes para mejorar la uniformidad');
      result.recommendations.push('Implemente líneas laterales más cortas para reducir la variación de presión');
      result.recommendations.push('Considere el uso de emisores con menor coeficiente de variación');
    }

    // Technical compliance recommendations
    if (result.issues.some((i: { category: string; }) => i.category === 'Technical')) {
      result.recommendations.push('Ajuste el tamaño de las tuberías para lograr velocidades de flujo óptimas');
      result.recommendations.push('Incluya filtración adecuada para prevenir obstrucciones');
    }

    // Water quality recommendations
    if (result.issues.some((i: { category: string; }) => i.category === 'Calidad de Agua')) {
      result.recommendations.push('Considere el tratamiento del agua para mejorar los parámetros de calidad');
      result.recommendations.push('Monitoree regularmente los niveles de CE para evitar acumulación de sales');
    }

    // General recommendations based on overall score
    if (result.overallScore < 85) {
      result.recommendations.push('El sistema requiere mejoras significativas antes de su implementación');
      result.recommendations.push('Considere la asesoría profesional para la optimización del sistema');
    } else if (result.overallScore < 95) {
      result.recommendations.push('El sistema es aceptable pero podría beneficiarse de optimizaciones menores');
    }
  }

  // Helper methods
  private getUniformityGrade(uniformity: number): string {
    if (uniformity >= 95) return 'Excellent';
    if (uniformity >= 90) return 'Good';
    if (uniformity >= 85) return 'Fair';
    if (uniformity >= 80) return 'Poor';
    return 'Unacceptable';
  }

  private calculateOverallScore(result: any): number {
    let baseScore = 100;

    for (const issue of result.issues) {
      switch (issue.severity) {
        case 'critical':
          baseScore -= 25;
          break;
        case 'warning':
          baseScore -= 10;
          break;
        case 'info':
          baseScore -= 2;
          break;
      }
    }

    return Math.max(0, baseScore);
  }

  private hasCriticalIssues(result: any): boolean {
    return result.issues.some((issue: { severity: string; }) => issue.severity === 'critical');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private createEmptyValidationResult(isValid: boolean): any {
    return {
      isValid: isValid,
      overallScore: isValid ? 100 : 0,
      issues: [],
      recommendations: [],
      pressureValidation: {
        isValid: isValid,
        minPressure: 0,
        maxPressure: 0,
        pressureVariation: 0
      },
      flowValidation: {
        isValid: isValid,
        flowBalance: 0,
        flowVariation: 0,
        adequateFlow: isValid
      },
      uniformityValidation: {
        isValid: isValid,
        achievedUniformity: 0,
        targetUniformity: 90,
        uniformityGrade: 'Unknown'
      },
      technicalCompliance: {
        velocityCompliance: isValid,
        pressureCompliance: isValid,
        materialCompatibility: isValid,
        standardsCompliance: isValid
      },
      performancePrediction: {
        expectedLifespan: 15,
        maintenanceFrequency: 12,
        energyEfficiency: 85,
        waterUseEfficiency: 88
      }
    };
  }

  performany(): void {
    if (!this.hydraulicResults) {
      this.alertService.showWarning('Please perform hydraulic calculations first');
      return;
    }

    // Call the private validation function instead of the service
    this.validationResults = this.validateSystem();

    if (this.validationResults.isValid) {
      this.alertService.showSuccess('System validation passed');
    } else {
      this.alertService.showWarning('System validation found issues. Please review recommendations.');
    }
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

    this.performDesignOptimization(
      designData,
      hydraulicData,
      optimizationData,
      this.hydraulicResults
    )
  }

  performDesignOptimization(
    designData: any,
    hydraulicData: any,
    optimizationData: any,
    hydraulicResults: any
  ): void {
    // Extract optimization goals
    const goals = optimizationData.optimizationGoals || {};
    const minimizeCost = !!goals.minimizeCost;
    const maximizeUniformity = !!goals.maximizeUniformity;
    const maximizeEfficiency = !!goals.maximizeEfficiency;
    const minimizeEnergy = !!goals.minimizeEnergyConsumption;
    const minimizeWater = !!goals.minimizeWaterUsage;

    // Constraints
    const budget = optimizationData.budgetConstraint || 0;
    const areaConstraint = optimizationData.areaConstraint || 0;
    const pressureConstraint = optimizationData.pressureConstraint || 3;

    // Economic parameters
    const waterCost = optimizationData.waterCostPerM3 || 0.5;
    const energyCost = optimizationData.energyCostPerKWh || 0.15;
    const laborCost = optimizationData.laborCostPerHour || 15;
    const maintenancePct = optimizationData.maintenanceCostPercentage || 5;

    // Gather relevant hydraulic results
    const uniformity = hydraulicResults.distributionUniformity || 0;
    const efficiency = hydraulicResults.applicationEfficiency || 0;
    const flowRate = hydraulicResults.systemFlowRate || 0;
    const pressureLoss = hydraulicResults.totalPressureLoss || 0;
    const operatingPressure = hydraulicResults.operatingPressure || 0;
    const irrigationTime = hydraulicResults.irrigationTimePerEvent || 0;

    // Estimate cost (very basic, based on pipe size, area, and components)
    const pipeCostPerM = {
      PE: 2.5,
      PVC: 3.0,
      HDPE: 4.0
    };
    const pipelineMaterial: 'PE' | 'PVC' | 'HDPE' = (designData.pipelineMaterial as 'PE' | 'PVC' | 'HDPE') || 'PE';
    const mainPipeLength = Math.sqrt(designData.totalArea || 0);
    const secondaryPipeLength = Math.sqrt(designData.totalArea || 0);
    const lateralPipeLength = Math.sqrt(designData.totalArea || 0) / 2;
    const totalPipeLength = mainPipeLength + secondaryPipeLength + lateralPipeLength;
    const pipeCost = totalPipeLength * (pipeCostPerM[pipelineMaterial] || 2.5);

    // Emitter cost
    const emitterUnitCost = 0.25;
    const totalEmitters = (designData.numberOfPlants || 0) * (designData.emittersPerPlant || 1);
    const emitterCost = totalEmitters * emitterUnitCost;

    // Component cost
    let componentCost = 0;
    if (designData.components?.hasFiltration) componentCost += 150;
    if (designData.components?.hasAutomation) componentCost += 300;
    if (designData.components?.hasFertigation) componentCost += 200;
    if (designData.components?.hasBackflowPrevention) componentCost += 100;
    if (designData.components?.hasPressureRegulation) componentCost += 120;
    if (designData.components?.hasFlowMeter) componentCost += 80;

    // Labor cost (simple estimate)
    const laborHours = totalPipeLength / 10 + totalEmitters / 100;
    const totalLaborCost = laborHours * laborCost;

    // Maintenance cost (annualized)
    const annualMaintenance = ((pipeCost + emitterCost + componentCost) * maintenancePct) / 100;

    // Water and energy cost (annual, based on flow and irrigation time)
    const dailyWaterM3 = (flowRate * irrigationTime) / 1000; // L/min * min = L/day, /1000 = m3/day
    const annualWaterCost = dailyWaterM3 * 365 * waterCost;

    // Energy: assume 0.5 kWh per m3 pumped per bar of pressure
    const dailyEnergyKWh = dailyWaterM3 * (operatingPressure || 1) * 0.5;
    const annualEnergyCost = dailyEnergyKWh * 365 * energyCost;

    // Total estimated cost
    const estimatedCost = pipeCost + emitterCost + componentCost + totalLaborCost + annualMaintenance + annualWaterCost + annualEnergyCost;

    // Calculate savings (if goals are set)
    let waterSavings = 0;
    let energySavings = 0;
    let baselineWater = 0;
    let baselineEnergy = 0;
    if (minimizeWater) {
      // Compare to a baseline (e.g., 30% less than conventional)
      baselineWater = dailyWaterM3 * 1.3;
      waterSavings = (baselineWater - dailyWaterM3) * 365;
    }
    if (minimizeEnergy) {
      baselineEnergy = dailyEnergyKWh * 1.2;
      energySavings = (baselineEnergy - dailyEnergyKWh) * 365;
    }

    // Score calculation (simple weighted sum)
    let score = 0;
    let maxScore = 0;
    if (minimizeCost) {
      score += Math.max(0, 100 - (estimatedCost / (budget || estimatedCost)) * 100);
      maxScore += 100;
    }
    if (maximizeUniformity) {
      score += Math.min(uniformity, 100);
      maxScore += 100;
    }
    if (maximizeEfficiency) {
      score += Math.min(efficiency, 100);
      maxScore += 100;
    }
    if (minimizeWater) {
      score += Math.max(0, Math.min((waterSavings / (baselineWater * 365)) * 100, 100));
      maxScore += 100;
    }
    if (minimizeEnergy) {
      score += Math.max(0, Math.min((energySavings / (baselineEnergy * 365)) * 100, 100));
      maxScore += 100;
    }
    const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;

    // Build optimization result
    this.optimizationResults = {
      estimatedCost,
      waterSavings,
      energySavings,
      uniformityAchieved: uniformity,
      efficiencyAchieved: efficiency,
      finalScore,
      constraints: {
        budget,
        areaConstraint,
        pressureConstraint
      },
      pipeCost,
      emitterCost,
      componentCost,
      laborCost: totalLaborCost,
      annualMaintenance,
      annualWaterCost,
      annualEnergyCost
    };

    clearInterval(this.calculationProgress);
    this.calculationProgress = 100;
    this.isOptimizing = false;
    this.successMessage = 'Optimización completada';
    this.cdr.detectChanges();
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