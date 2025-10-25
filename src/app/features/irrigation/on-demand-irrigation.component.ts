// src/app/features/irrigation/on-demand-irrigation.component.ts - ENHANCED VERSION
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, interval, BehaviorSubject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, startWith, map, catchError } from 'rxjs/operators';
import {
    IrrigationSectorService,
    Container,
    Dropper,
    GrowingMedium,
    IrrigationEvent,
    IrrigationMeasurement,
    Measurement,
    MeasurementBase,
    MeasurementKPI,
    HydraulicCalculation,
    EvapotranspirationData,
    IrrigationScheduleOptimization,
    FlowRateCalculation,
    IrrigationSystemStatus
} from '../services/irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { AlertService } from '../../core/services/alert.service';
import { CropProduction } from '../../core/models/models';
import { CommonModule, DatePipe } from '@angular/common';
 
import { 
  IrrigationSchedulingService, 
  IrrigationMode, 
  IrrigationPlanEntry,
  CreateIrrigationPlanEntryCommand,
  UpdateIrrigationPlanEntryCommand 
} from '../services/irrigation-scheduling.service';
 
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

interface OnDemandCalculationResult {
    shouldIrrigate: boolean;
    recommendedDuration: number;
    waterAmount: number;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    conditions: {
        soilMoisture: number;
        temperature: number;
        humidity: number;
        lastIrrigation: Date | null;
    };
    calculations: {
        evapotranspiration: number;
        waterDeficit: number;
        flowRate: number;
        efficiency: number;
    };
}

// Enhanced interfaces for analytics
interface WaterUsageAnalytics {
    startDate: Date;
    endDate: Date;
    totalUsage: number;
    dailyAverage: number;
    peakUsage: number;
    efficiency: number;
    trends: WaterUsageTrend[];
}

interface WaterUsageTrend {
    date: Date;
    usage: number;
}

interface EnvironmentalImpact {
    waterSavings: number;
    energySavings: number;
    carbonReduction: number;
}

export interface CropProductionApiResponse {
    id: number;
    name: string;
    cropId: number;
    productionUnitId: number;
    containerId: number;
    dropperId: number;
    growingMediumId: number;
    startDate: string;
    endDate: string;
    length: number;
    width: number;
    active: boolean;
    numberOfDroppersPerContainer: number;
    plantsPerContainer: number;
    betweenContainerDistance: number;
    betweenPlantDistance: number;
    betweenRowDistance: number;
    depletionPercentage: number;
    drainThreshold: number;
    altitude: number;
    latitude: number;
    longitude: number;
    windSpeedMeasurementHeight: number;
    dateCreated: string;
    dateUpdated?: string;
    createdBy: number;
    updatedBy?: number;
}

export interface ExtendedCropProduction extends CropProduction {
    name: string;
    containerId: number;
    dropperId: number;
    growingMediumId: number;
    length: number;
    width: number;
    startDate: string;
    endDate: string;
    active: boolean;
    numberOfDroppersPerContainer: number;
    plantsPerContainer?: number;
    betweenContainerDistance?: number;
    betweenPlantDistance?: number;
    betweenRowDistance?: number;
    depletionPercentage?: number;
    drainThreshold?: number;
    altitude?: number;
    latitude?: number;
    longitude?: number;
    windSpeedMeasurementHeight?: number;
    area: number;
}

@Component({
    selector: 'app-on-demand-irrigation',
    templateUrl: './on-demand-irrigation.component.html',
    styleUrls: ['./on-demand-irrigation.component.css'],
    standalone: true,
    providers: [DatePipe],
    imports: [CommonModule, ReactiveFormsModule]
})
export class OnDemandIrrigationComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Form and data
    irrigationForm!: FormGroup;

    // Calculation results
    calculationResult: OnDemandCalculationResult | null = null;
    hydraulicCalculation: HydraulicCalculation | null = null;
    evapotranspirationData: EvapotranspirationData[] = [];
    scheduleOptimization: IrrigationScheduleOptimization | null = null;
    flowRateCalculation: FlowRateCalculation | null = null;

    // System status
    systemStatus: IrrigationSystemStatus = {
        farmId: 0,
        systemStatus: '',
        devices: [],
        activeDevices: 0,
        totalDevices: 0,
        systemPressure: 0,
        totalFlowRate: 0,
        lastUpdate: '',
        alerts: [],
        measurements: {
            temperature: [],
            humidity: [],
            soilMoisture: [],
            pressure: [],
            flow: [],
        },
        climateReadings: [],
        soilReadings: [],
        flowReadings: []
    };
    recentEvents: IrrigationEvent[] = [];
    recentMeasurements: IrrigationMeasurement[] = [];
    aggregatedMeasurements: Measurement[] = [];
    rawMeasurements: MeasurementBase[] = [];
    kpiMeasurements: MeasurementKPI[] = [];

    // Analytics data
    waterUsageAnalytics: WaterUsageAnalytics | null = null;
    environmentalImpact: EnvironmentalImpact | null = null;

    // UI state
    isLoading = false;
    isCalculating = false;
    isIrrigating = false;
    showAdvancedOptions = false;
    autoRefresh = true;

    // Real-time data
    realTimeData$ = new BehaviorSubject<any>(null);

    // Error handling
    errorMessage = '';
    successMessage = '';

    // Data arrays
    cropProductions: ExtendedCropProduction[] = [];
    containers: Container[] = [];
    droppers: Dropper[] = [];
    growingMediums: GrowingMedium[] = [];

    selectedCropProduction: ExtendedCropProduction | null = null;
    selectedContainer: Container | null = null;
    selectedDropper: Dropper | null = null;
    selectedGrowingMedium: GrowingMedium | null = null;

    constructor(
        private fb: FormBuilder,
        private irrigationService: IrrigationSectorService,
        private cropProductionService: CropProductionService,
        private alertService: AlertService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.setupRealTimeUpdates();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.irrigationForm = this.fb.group({
            cropProductionId: ['', Validators.required],
            irrigationMode: ['automatic', Validators.required],
            duration: [30, [Validators.required, Validators.min(1), Validators.max(480)]],
            waterAmount: [0, [Validators.min(0)]],
            priority: ['medium', Validators.required],
            reason: ['on_demand', Validators.required],
            overrideSchedule: [false],
            useOptimalTiming: [true],
            considerWeather: [true],
            notes: [''],

            // Advanced hydraulic options
            customFlowRate: [0, [Validators.min(0)]],
            targetPressure: [1, [Validators.min(0.5), Validators.max(10)]],
            pipeLength: [100, [Validators.min(1)]],
            elevation: [0],

            // Environmental thresholds
            minSoilMoisture: [30, [Validators.min(0), Validators.max(100)]],
            maxTemperature: [35, [Validators.min(0), Validators.max(50)]],
            minHumidity: [40, [Validators.min(0), Validators.max(100)]]
        });

        // React to changes
        this.irrigationForm.get('cropProductionId')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(cropProductionId => {
                if (cropProductionId) {
                    this.onCropProductionSelected(+cropProductionId);
                }
            });

        this.irrigationForm.get('irrigationMode')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(mode => {
                this.onIrrigationModeChanged(mode);
            });
    }

    private setupRealTimeUpdates(): void {
        if (this.autoRefresh) {
            interval(30000)
                .pipe(
                    startWith(0),
                    switchMap(() => this.loadSystemStatus()),
                    takeUntil(this.destroy$)
                )
                .subscribe();
        }
    }

    private loadSystemStatus(): Observable<any> {
        return this.irrigationService.getIrrigationSystemStatus(this.systemStatus.farmId, this.selectedCropProduction?.id)
            .pipe(
                map(status => {
                    this.systemStatus = status;
                    return status;
                }),
                catchError(error => {
                    console.error('Error loading system status:', error);
                    return of(null);
                })
            );
    }

    onCropProductionSelected(cropProductionId: number): void {
        this.selectedCropProduction = this.cropProductions.find(cp => cp.id === cropProductionId) || null;

        if (this.selectedCropProduction) {
            this.loadCropProductionDetails();
            this.loadRecentEvents();
            this.loadRecentMeasurements();
            this.loadRealTimeSensorData();
            this.calculateOptimalSchedule();
            this.loadAnalyticsData();
        }
    }

    private loadCropProductionDetails(): void {
        if (!this.selectedCropProduction) return;

        forkJoin({
            container: this.selectedCropProduction.containerId ?
                this.irrigationService.getContainerById(this.selectedCropProduction.containerId) : of(null),
            dropper: this.selectedCropProduction.dropperId ?
                this.irrigationService.getDropperById(this.selectedCropProduction.dropperId) : of(null),
            growingMedium: this.selectedCropProduction.growingMediumId ?
                this.irrigationService.getGrowingMediumById(this.selectedCropProduction.growingMediumId) : of(null)
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ container, dropper, growingMedium }) => {
                    this.selectedContainer = container;
                    this.selectedDropper = dropper;
                    this.selectedGrowingMedium = growingMedium;
                    this.updateCalculations();
                },
                error: (error) => this.handleError('Error loading crop production details', error)
            });
    }

    private loadRecentEvents(): void {
        if (!this.selectedCropProduction) return;

        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        this.irrigationService.getIrrigationEvents(startDate, endDate, this.selectedCropProduction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (events) => {
                    this.recentEvents = events.slice(0, 10);
                },
                error: (error) => this.handleError('Error loading recent events', error)
            });
    }

    private loadRecentMeasurements(): void {
        if (!this.selectedCropProduction) return;

        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Load multiple types of measurements
        forkJoin({
            irrigationMeasurements: this.irrigationService.getIrrigationMeasurements(
            ).pipe(catchError(() => of([]))),

            aggregatedMeasurements: this.irrigationService.getMeasurements(
                this.selectedCropProduction.id, undefined, startDate, endDate
            ).pipe(catchError(() => of([]))),

            rawMeasurements: this.irrigationService.getMeasurementBase(
                this.selectedCropProduction.id, undefined, startDate, endDate
            ).pipe(catchError(() => of([]))),

            kpiMeasurements: this.irrigationService.getMeasurementKPI(
                this.selectedCropProduction.id, undefined, startDate, endDate
            ).pipe(catchError(() => of([])))
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ irrigationMeasurements, aggregatedMeasurements, rawMeasurements, kpiMeasurements }) => {
                    this.recentMeasurements = irrigationMeasurements.slice(0, 10);
                    this.aggregatedMeasurements = aggregatedMeasurements.slice(0, 10);
                    this.rawMeasurements = rawMeasurements.slice(0, 20);
                    this.kpiMeasurements = kpiMeasurements.slice(0, 10);
                },
                error: (error) => this.handleError('Error loading recent measurements', error)
            });
    }

    private loadRealTimeSensorData(): void {
        if (!this.selectedCropProduction) return;

        this.irrigationService.getRealTimeSensorData(this.selectedCropProduction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.realTimeData$.next(data);
                },
                error: (error) => console.error('Error loading real-time sensor data:', error)
            });
    }

    private calculateOptimalSchedule(): void {
        if (!this.selectedCropProduction) return;

        this.irrigationService.optimizeIrrigationSchedule(this.selectedCropProduction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (optimization) => {
                    this.scheduleOptimization = optimization;
                    this.updateFormWithOptimization();
                },
                error: (error) => console.error('Error calculating optimal schedule:', error)
            });
    }

    // NEW: Analytics data loading
    private loadAnalyticsData(): void {
        if (!this.selectedCropProduction) return;

        this.calculateWaterUsageAnalytics();
        this.calculateEnvironmentalImpact();
    }

    private calculateWaterUsageAnalytics(): void {
        if (!this.selectedCropProduction) return;

        const endDate = new Date();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

        // Calculate analytics from measurements
        const totalUsage = this.rawMeasurements
            .filter(m => m.measurementVariableId === 5) // Flow measurements
            .reduce((sum, measurement) => sum + measurement.recordValue, 0);

        const dailyAverage = totalUsage / 30;
        const peakUsage = Math.max(...this.rawMeasurements
            .filter(m => m.measurementVariableId === 5)
            .map(m => m.recordValue));

        // Generate trend data
        const trends: WaterUsageTrend[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dayUsage = this.rawMeasurements
                .filter(m => {
                    const measurementDate = new Date(m.recordDate);
                    return measurementDate.toDateString() === date.toDateString() &&
                        m.measurementVariableId === 5;
                })
                .reduce((sum, measurement) => sum + measurement.recordValue, 0);

            trends.push({ date, usage: dayUsage });
        }

        this.waterUsageAnalytics = {
            startDate,
            endDate,
            totalUsage,
            dailyAverage,
            peakUsage: peakUsage || 0,
            efficiency: this.systemEfficiency,
            trends
        };
    }

    private calculateEnvironmentalImpact(): void {
        const baselineWaterUsage = 1000; // Baseline comparison
        const actualUsage = this.currentWaterUsage;
        const waterSavings = Math.max(0, (baselineWaterUsage - actualUsage) / baselineWaterUsage * 100);

        // Calculate energy savings based on pump efficiency
        const energySavings = waterSavings * 0.5; // kWh saved

        // Calculate carbon reduction (assuming 0.5 kg CO2 per kWh)
        const carbonReduction = energySavings * 0.5;

        this.environmentalImpact = {
            waterSavings,
            energySavings,
            carbonReduction
        };
    }

    private updateFormWithOptimization(): void {
        if (!this.scheduleOptimization) return;

        this.irrigationForm.patchValue({
            duration: this.scheduleOptimization.recommendedDuration,
            waterAmount: this.scheduleOptimization.waterAmount,
            priority: this.scheduleOptimization.priority
        });
    }

    onIrrigationModeChanged(mode: string): void {
        const durationControl = this.irrigationForm.get('duration');
        const waterAmountControl = this.irrigationForm.get('waterAmount');

        if (mode === 'automatic') {
            durationControl?.disable();
            waterAmountControl?.disable();
        } else {
            durationControl?.enable();
            waterAmountControl?.enable();
        }

        this.updateCalculations();
    }

    calculateOnDemandIrrigation(): void {
        if (!this.selectedCropProduction) {
            this.alertService.showError('Please select a crop production first');
            return;
        }

        this.isCalculating = true;
        this.clearMessages();

        // Perform all calculations in parallel
        forkJoin({
            hydraulics: this.performHydraulicCalculations(),
            evapotranspiration: this.calculateEvapotranspiration(),
            flowRate: this.calculateFlowRate()
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ hydraulics, evapotranspiration, flowRate }) => {
                    this.hydraulicCalculation = hydraulics;
                    this.evapotranspirationData = evapotranspiration;
                    this.flowRateCalculation = flowRate;
                    this.performOnDemandCalculation();
                    this.isCalculating = false;
                },
                error: (error) => {
                    this.handleError('Error performing calculations', error);
                    this.isCalculating = false;
                }
            });
    }

    private performHydraulicCalculations(): Observable<HydraulicCalculation> {
        const formValue = this.irrigationForm.value;
        const flowRate = formValue.customFlowRate || (
            this.selectedDropper && this.selectedCropProduction
                ? this.selectedDropper.flowRate * this.selectedCropProduction.numberOfDroppersPerContainer
                : 50
        );

        return this.irrigationService.calculateHydraulics(
            flowRate,
            25,
            formValue.pipeLength,
            formValue.elevation,
            [{ type: 'elbow', quantity: 4 }, { type: 'tee', quantity: 2 }]
        );
    }

    private calculateEvapotranspiration(): Observable<EvapotranspirationData[]> {
        if (!this.selectedCropProduction) {
            return of([]);
        }

        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        return this.irrigationService.calculateEvapotranspiration(
            this.selectedCropProduction.id,
            startDate,
            endDate
        );
    }

    private calculateFlowRate(): Observable<FlowRateCalculation> {
        if (!this.selectedCropProduction || !this.selectedContainer) {
            return of({
                containerId: 0,
                dropperId: 0,
                numberOfDroppers: 0,
                totalFlowRate: 0,
                pressureRequired: 1,
                irrigationArea: 0,
                precipitationRate: 0,
                applicationEfficiency: 85,
                uniformity: 90,
                flowRatePerArea: 0
            });
        }

        return this.irrigationService.calculateFlowRate(
            this.selectedCropProduction.containerId,
            this.selectedCropProduction.dropperId,
            this.selectedCropProduction.numberOfDroppersPerContainer,
            this.selectedCropProduction.length * this.selectedCropProduction.width
        );
    }

    private performOnDemandCalculation(): void {
        const realTimeData = this.realTimeData$.value;
        const formValue = this.irrigationForm.value;

        // Calculate water deficit based on ET and recent irrigation
        const avgET = this.evapotranspirationData.length > 0
            ? this.evapotranspirationData.reduce((sum, data) => sum + data.cropET, 0) / this.evapotranspirationData.length
            : 5;

        const daysSinceLastIrrigation = this.recentEvents.length > 0
            ? Math.max(1, Math.floor((Date.now() - new Date(this.recentEvents[0].dateTimeStart).getTime()) / (24 * 60 * 60 * 1000)))
            : 1;

        const waterDeficit = avgET * daysSinceLastIrrigation;
        const soilMoisture = realTimeData?.soilMoisture || 50;
        const temperature = realTimeData?.temperature || 25;
        const humidity = realTimeData?.humidity || 60;

        // Determine if irrigation is needed
        const shouldIrrigate =
            soilMoisture < formValue.minSoilMoisture ||
            temperature > formValue.maxTemperature ||
            humidity < formValue.minHumidity ||
            waterDeficit > 10;

        // Calculate recommended duration and water amount
        const flowRate = this.flowRateCalculation?.totalFlowRate || 50;
        const area = this.getCropProductionArea();
        const requiredWater = waterDeficit * area / 1000;
        const recommendedDuration = Math.max(15, Math.min(240, requiredWater / (flowRate || 1) * 60));

        // Determine priority
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        if (soilMoisture < 20 || temperature > 40) priority = 'critical';
        else if (soilMoisture < 30 || temperature > 35) priority = 'high';
        else if (soilMoisture > 50 && temperature < 30) priority = 'low';

        this.calculationResult = {
            shouldIrrigate,
            recommendedDuration,
            waterAmount: requiredWater,
            reason: this.generateRecommendationReason(soilMoisture, temperature, humidity, waterDeficit),
            priority,
            conditions: {
                soilMoisture,
                temperature,
                humidity,
                lastIrrigation: this.recentEvents.length > 0 ? new Date(this.recentEvents[0].dateTimeStart) : null
            },
            calculations: {
                evapotranspiration: avgET,
                waterDeficit,
                flowRate,
                efficiency: this.flowRateCalculation?.applicationEfficiency || 85
            }
        };

        // Update form with recommendations if in automatic mode
        if (formValue.irrigationMode === 'automatic') {
            this.irrigationForm.patchValue({
                duration: Math.round(recommendedDuration),
                waterAmount: Math.round(requiredWater),
                priority
            });
        }
    }

    private generateRecommendationReason(soilMoisture: number, temperature: number, humidity: number, waterDeficit: number): string {
        const reasons = [];

        if (soilMoisture < 30) reasons.push(`Humedad del suelo baja (${soilMoisture}%)`);
        if (temperature > 30) reasons.push(`Temperatura alta (${temperature}°C)`);
        if (humidity < 50) reasons.push(`Humedad ambiental baja (${humidity}%)`);
        if (waterDeficit > 5) reasons.push(`Déficit hídrico (${waterDeficit.toFixed(1)}mm)`);

        return reasons.length > 0 ? reasons.join(', ') : 'Condiciones óptimas mantenidas';
    }

    executeIrrigation(): void {
        if (!this.selectedCropProduction || !this.calculationResult) {
            this.alertService.showError('Please calculate irrigation requirements first');
            return;
        }

        const formValue = this.irrigationForm.value;
        this.isIrrigating = true;

        this.irrigationService.triggerOnDemandIrrigation(
            this.selectedCropProduction.id,
            formValue.duration,
            `${formValue.reason}: ${this.calculationResult.reason}`
        ).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this.successMessage = `Irrigation started successfully for ${formValue.duration} minutes`;
                    this.alertService.showSuccess(this.successMessage);
                    this.loadRecentEvents();
                    this.loadSystemStatus().subscribe();
                    this.calculationResult = null;
                    this.isIrrigating = false;
                },
                error: (error) => {
                    this.handleError('Error starting irrigation', error);
                    this.isIrrigating = false;
                }
            });
    }

    stopIrrigation(): void {
        if (!this.selectedCropProduction) return;

        // Create a stop irrigation event (0 duration)
        this.irrigationService.triggerOnDemandIrrigation(
            this.selectedCropProduction.id,
            0,
            'Manual stop'
        ).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.successMessage = 'Irrigation stopped successfully';
                    this.alertService.showSuccess(this.successMessage);
                    this.loadSystemStatus().subscribe();
                    this.isIrrigating = false;
                },
                error: (error) => {
                    this.handleError('Error stopping irrigation', error);
                }
            });
    }

    testSystem(): void {
        if (!this.selectedCropProduction) {
            this.alertService.showError('Please select a crop production first');
            return;
        }

        this.irrigationService.testSystem(this.selectedCropProduction.id, 30)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this.alertService.showSuccess('System test completed successfully');
                },
                error: (error) => {
                    this.handleError('System test failed', error);
                }
            });
    }

    private updateCalculations(): void {
        if (this.selectedCropProduction && this.selectedContainer && this.selectedDropper) {
            setTimeout(() => this.calculateOnDemandIrrigation(), 500);
        }
    }

    toggleAdvancedOptions(): void {
        this.showAdvancedOptions = !this.showAdvancedOptions;
    }

    toggleAutoRefresh(): void {
        this.autoRefresh = !this.autoRefresh;
        if (this.autoRefresh) {
            this.setupRealTimeUpdates();
        }
    }

    resetForm(): void {
        this.irrigationForm.reset();
        this.calculationResult = null;
        this.hydraulicCalculation = null;
        this.evapotranspirationData = [];
        this.scheduleOptimization = null;
        this.flowRateCalculation = null;
        this.waterUsageAnalytics = null;
        this.environmentalImpact = null;
        this.selectedCropProduction = null;
        this.selectedContainer = null;
        this.selectedDropper = null;
        this.selectedGrowingMedium = null;
        this.clearMessages();
    }

    exportReport(): void {
        if (!this.calculationResult || !this.selectedCropProduction) {
            this.alertService.showError('No data to export');
            return;
        }

        const reportData = {
            cropProduction: this.selectedCropProduction,
            calculation: this.calculationResult,
            hydraulics: this.hydraulicCalculation,
            evapotranspiration: this.evapotranspirationData,
            flowRate: this.flowRateCalculation,
            systemStatus: this.systemStatus,
            analytics: {
                waterUsage: this.waterUsageAnalytics,
                environmentalImpact: this.environmentalImpact
            },
            measurements: {
                recent: this.recentMeasurements,
                aggregated: this.aggregatedMeasurements,
                raw: this.rawMeasurements,
                kpi: this.kpiMeasurements
            },
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `irrigation-report-${this.selectedCropProduction.name}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.alertService.showSuccess('Report exported successfully');
    }

    // NEW: Data quality methods for template
    getUniqueVariablesCount(): number {
        const uniqueVariables = new Set();

        this.rawMeasurements.forEach(m => uniqueVariables.add(m.measurementVariableId));
        this.aggregatedMeasurements.forEach(m => uniqueVariables.add(m.measurementVariableId));
        this.kpiMeasurements.forEach(m => uniqueVariables.add(m.kpiId));

        return uniqueVariables.size;
    }

    getUniqueSensorsCount(): number {
        const uniqueSensors = new Set();

        this.rawMeasurements.forEach(m => uniqueSensors.add(m.sensorId));

        return uniqueSensors.size;
    }

    // Utility methods
    getStatusColor(status: string): string {
        const colorMap: { [key: string]: string } = {
            'running': 'text-green-600',
            'stopped': 'text-gray-600',
            'maintenance': 'text-yellow-600',
            'error': 'text-red-600',
            'scheduled': 'text-blue-600',
            'completed': 'text-green-600',
            'active': 'text-green-600',
            'inactive': 'text-gray-600'
        };
        return colorMap[status] || 'text-gray-600';
    }

    getPriorityColor(priority: string): string {
        const colorMap: { [key: string]: string } = {
            'low': 'text-green-600',
            'medium': 'text-yellow-600',
            'high': 'text-orange-600',
            'critical': 'text-red-600'
        };
        return colorMap[priority] || 'text-gray-600';
    }

    formatDate(date: Date | string): string {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    }

    formatDuration(minutes: number): string {
        if (!minutes || minutes <= 0) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    formatWaterAmount(liters: number): string {
        if (!liters || liters <= 0) return '0 L';
        if (liters >= 1000) {
            return `${(liters / 1000).toFixed(1)} m³`;
        }
        return `${liters.toFixed(0)} L`;
    }

    formatFlowRate(flowRate: number): string {
        if (!flowRate || flowRate <= 0) return '0 L/h';
        return `${flowRate.toFixed(1)} L/h`;
    }

    formatPressure(pressure: number): string {
        if (!pressure || pressure <= 0) return '0 bar';
        return `${pressure.toFixed(1)} bar`;
    }

    formatPercentage(value: number): string {
        if (value === undefined || value === null) return '0%';
        return `${value.toFixed(1)}%`;
    }

    formatTemperature(temperature: number): string {
        if (!temperature && temperature !== 0) return 'N/A';
        return `${temperature.toFixed(1)}°C`;
    }

    private handleError(message: string, error: any): void {
        console.error(message, error);
        this.errorMessage = `${message}: ${error?.message || error}`;
        this.alertService.showError(this.errorMessage);
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    }

    private clearMessages(): void {
        this.errorMessage = '';
        this.successMessage = '';
    }

    // Getters for template
    get isFormValid(): boolean {
        return this.irrigationForm.valid && this.selectedCropProduction !== null;
    }

    get canExecuteIrrigation(): boolean {
        return this.isFormValid &&
            this.calculationResult !== null &&
            this.calculationResult.shouldIrrigate &&
            !this.isIrrigating;
    }

    get currentWaterUsage(): number {
        return this.rawMeasurements
            .filter(m => m.measurementVariableId === 5) // Flow measurements
            .reduce((sum, measurement) => sum + measurement.recordValue, 0);
    }

    get averageET(): number {
        return this.evapotranspirationData.length > 0
            ? this.evapotranspirationData.reduce((sum, data) => sum + data.cropET, 0) / this.evapotranspirationData.length
            : 0;
    }

    get systemEfficiency(): number {
        return this.flowRateCalculation?.applicationEfficiency || 0;
    }

    get lastIrrigationDate(): Date | null {
        return this.recentEvents.length > 0 ? new Date(this.recentEvents[0].dateTimeStart) : null;
    }

    get daysSinceLastIrrigation(): number {
        const lastDate = this.lastIrrigationDate;
        return lastDate ? Math.floor((Date.now() - lastDate.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    }

    get isSystemHealthy(): boolean {
        if (!this.systemStatus?.alerts) return true;
        return this.systemStatus.alerts.filter(alert =>
            alert.severity === 'critical' || alert.severity === 'high'
        ).length === 0;
    }

    // Device utility methods
    getDeviceIcon(deviceId: string): string {
        if (!deviceId) return 'bi-cpu';

        const deviceType = this.getDeviceTypeFromId(deviceId);
        const iconMap: { [key: string]: string } = {
            'suelo': 'bi-moisture',
            'presion': 'bi-speedometer2',
            'ph': 'bi-droplet-half',
            'flujo': 'bi-water',
            'meteo': 'bi-cloud-sun',
            'temperatura': 'bi-thermometer-half',
            'humedad': 'bi-droplet',
            'default': 'bi-cpu'
        };
        return iconMap[deviceType] || iconMap['default'];
    }

    private getDeviceTypeFromId(deviceId: string): string {
        if (!deviceId) return 'default';

        const lowerDeviceId = deviceId.toLowerCase();
        if (lowerDeviceId.includes('suelo')) return 'suelo';
        if (lowerDeviceId.includes('presion')) return 'presion';
        if (lowerDeviceId.includes('ph')) return 'ph';
        if (lowerDeviceId.includes('flujo')) return 'flujo';
        if (lowerDeviceId.includes('meteo') || lowerDeviceId.includes('meteorolog')) return 'meteo';
        if (lowerDeviceId.includes('temperatura')) return 'temperatura';
        if (lowerDeviceId.includes('humedad')) return 'humedad';
        return 'default';
    }

    getDeviceType(deviceId: string): string {
        const deviceType = this.getDeviceTypeFromId(deviceId);
        const typeMap: { [key: string]: string } = {
            'suelo': 'Humedad Suelo',
            'presion': 'Presión',
            'ph': 'pH',
            'flujo': 'Flujo',
            'meteo': 'Meteorológica',
            'temperatura': 'Temperatura',
            'humedad': 'Humedad',
            'default': 'Otro'
        };
        return typeMap[deviceType] || typeMap['default'];
    }

    getDeviceTypeClass(deviceId: string): string {
        return this.getDeviceTypeFromId(deviceId);
    }

    // Crop production utility methods
    private mapApiResponseToCropProduction(apiResponse: CropProductionApiResponse): ExtendedCropProduction {
        return {
            id: apiResponse.id,
            code: apiResponse.name,
            cropId: apiResponse.cropId,
            productionUnitId: apiResponse.productionUnitId,
            plantingDate: new Date(apiResponse.startDate),
            estimatedHarvestDate: apiResponse.endDate ? new Date(apiResponse.endDate) : undefined,
            status: apiResponse.active ? 'Activo' : 'Inactivo',
            plantedArea: apiResponse.length * apiResponse.width,
            isActive: apiResponse.active,
            createdAt: new Date(apiResponse.dateCreated),
            updatedAt: apiResponse.dateUpdated ? new Date(apiResponse.dateUpdated) : undefined,
            area: apiResponse.length * apiResponse.width,

            // Extended properties
            name: apiResponse.name,
            containerId: apiResponse.containerId,
            dropperId: apiResponse.dropperId,
            growingMediumId: apiResponse.growingMediumId,
            length: apiResponse.length,
            width: apiResponse.width,
            startDate: apiResponse.startDate,
            endDate: apiResponse.endDate,
            active: apiResponse.active,
            numberOfDroppersPerContainer: apiResponse.numberOfDroppersPerContainer,
            plantsPerContainer: apiResponse.plantsPerContainer,
            betweenContainerDistance: apiResponse.betweenContainerDistance,
            betweenPlantDistance: apiResponse.betweenPlantDistance,
            betweenRowDistance: apiResponse.betweenRowDistance,
            depletionPercentage: apiResponse.depletionPercentage,
            drainThreshold: apiResponse.drainThreshold,
            altitude: apiResponse.altitude,
            latitude: apiResponse.latitude,
            longitude: apiResponse.longitude,
            windSpeedMeasurementHeight: apiResponse.windSpeedMeasurementHeight
        };
    }

    private loadInitialData(): void {
        this.isLoading = true;

        this.cropProductionService.getAll()
            .pipe(
                map((response: any) => {
                    const data = response?.cropProductions || response || [];
                    return Array.isArray(data)
                        ? data.map(item => this.mapApiResponseToCropProduction(item))
                        : [];
                }),
                switchMap(cropProductions => {
                    this.cropProductions = cropProductions;
                    return forkJoin({
                        containers: this.irrigationService.getAllContainers(true).pipe(catchError(() => of([]))),
                        droppers: this.irrigationService.getAllDroppers(true).pipe(catchError(() => of([]))),
                        growingMediums: this.irrigationService.getAllGrowingMediums(true).pipe(catchError(() => of([])))
                    });
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: ({ containers, droppers, growingMediums }) => {
                    this.containers = containers || [];
                    this.droppers = droppers || [];
                    this.growingMediums = growingMediums || [];
                    this.isLoading = false;
                },
                error: (error) => {
                    this.handleError('Error loading initial data', error);
                    this.isLoading = false;
                }
            });

        this.loadSystemStatus().subscribe();
    }

    // Safe property access methods
    getCropProductionName(): string {
        return this.selectedCropProduction?.name || this.selectedCropProduction?.code || 'N/A';
    }

    getCropProductionArea(): number {
        if (!this.selectedCropProduction) return 0;
        if (this.selectedCropProduction.plantedArea) {
            return this.selectedCropProduction.plantedArea;
        }
        if (this.selectedCropProduction.length && this.selectedCropProduction.width) {
            return this.selectedCropProduction.length * this.selectedCropProduction.width;
        }
        return 0;
    }

    getCropProductionDimensions(): string {
        if (!this.selectedCropProduction?.length || !this.selectedCropProduction?.width) {
            return 'N/A';
        }
        return `${this.selectedCropProduction.length}m × ${this.selectedCropProduction.width}m`;
    }

    getCropProductionStatus(): string {
        return this.selectedCropProduction?.active ? 'Activo' : 'Inactivo';
    }

    getPlantingDate(): string {
        if (this.selectedCropProduction?.startDate) {
            return this.formatDate(this.selectedCropProduction.startDate);
        }
        if (this.selectedCropProduction?.plantingDate) {
            return this.formatDate(this.selectedCropProduction.plantingDate);
        }
        return 'N/A';
    }

    getHarvestDate(): string {
        if (this.selectedCropProduction?.endDate) {
            return this.formatDate(this.selectedCropProduction.endDate);
        }
        if (this.selectedCropProduction?.estimatedHarvestDate) {
            return this.formatDate(this.selectedCropProduction.estimatedHarvestDate);
        }
        return 'N/A';
    }

    getContainerDimensions(): string {
        if (!this.selectedContainer) return 'N/A';
        return `${this.selectedContainer.length || 0}cm × ${this.selectedContainer.width || 0}cm × ${this.selectedContainer.height || 0}cm`;
    }

    getTotalFlowRate(): number {
        if (!this.selectedDropper || !this.selectedCropProduction?.numberOfDroppersPerContainer) {
            return 0;
        }
        return this.selectedDropper.flowRate * this.selectedCropProduction.numberOfDroppersPerContainer;
    }

    getGrowingMediumWaterRetention(): number {
        return this.selectedGrowingMedium?.containerCapacityPercentage || 0;
    }

    getGrowingMediumDrainage(): number {
        const retention = this.getGrowingMediumWaterRetention();
        return retention > 0 ? (100 - retention) : 0;
    }
}