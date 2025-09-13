// src/app/features/irrigation/on-demand-irrigation.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, interval, BehaviorSubject } from 'rxjs';
import { takeUntil, switchMap, startWith, map, catchError } from 'rxjs/operators';
import {
    IrrigationSectorService,
    Container,
    Dropper,
    GrowingMedium,
    IrrigationEvent,
    IrrigationMeasurement,
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

/*

// src/app/core/models/crop-production.model.ts
export interface CropProduction {
  id: number;
  code?: string | undefined;
  cropId: number;
  crop?: Crop;
  productionUnitId: number;
  productionUnit?: ProductionUnit;
  plantingDate: Date;
  estimatedHarvestDate?: Date;
  actualHarvestDate?: Date;
  status: string | undefined; // 'Preparacion', 'Siembra', 'Crecimiento', 'Floracion', 'Fructificacion', 'Cosecha', 'Finalizada'
  progress?: number; // percentage 0-100
  plantedArea?: number;
  expectedYield?: number;
  actualYield?: number;
  description?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
*/

interface OnDemandCalculationResult {
    shouldIrrigate: boolean;
    recommendedDuration: number; // minutes
    waterAmount: number; // liters
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


// Create a separate interface for the API response structure
// This should be added to your types or interfaces file

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

// Extended CropProduction interface to include the missing properties
export interface ExtendedCropProduction extends CropProduction {
    // API response properties
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
}

// Extended interfaces for other entities
export interface ExtendedContainer {
    id: number;
    name: string;
    catalogId: number;
    containerTypeId: number;
    height: number;
    width: number;
    length: number;
    upperDiameter: number;
    lowerDiameter: number;
    active: boolean;
    dateCreated: string;
    dateUpdated?: string;
    createdBy: number;
    updatedBy?: number;
}

export interface ExtendedDropper {
    id: number;
    name: string;
    catalogId: number;
    flowRate: number;
    active: boolean;
    dateCreated: string;
    dateUpdated?: string;
    createdBy: number;
    updatedBy?: number;
}

export interface ExtendedGrowingMedium {
    id: number;
    name: string;
    catalogId: number;
    containerCapacityPercentage: number;
    permanentWiltingPoint: number;
    fiveKpaHumidity: number;
    active: boolean;
    dateCreated: string;
    dateUpdated?: string;
    createdBy: number;
    updatedBy?: number;
}


@Component({
    selector: 'app-on-demand-irrigation',
    templateUrl: './on-demand-irrigation.component.html',
    styleUrls: ['./on-demand-irrigation.component.css'],
    standalone: true,
    providers: [DatePipe],
    imports: [CommonModule,
        ReactiveFormsModule,]
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
    systemStatus: IrrigationSystemStatus | null = null;
    recentEvents: IrrigationEvent[] = [];
    recentMeasurements: IrrigationMeasurement[] = [];

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

    // Update these property types
    cropProductions: ExtendedCropProduction[] = [];
    containers: ExtendedContainer[] = [];
    droppers: ExtendedDropper[] = [];
    growingMediums: ExtendedGrowingMedium[] = [];

    selectedCropProduction: ExtendedCropProduction | null = null;
    selectedContainer: ExtendedContainer | null = null;
    selectedDropper: ExtendedDropper | null = null;
    selectedGrowingMedium: ExtendedGrowingMedium | null = null;


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
            irrigationMode: ['automatic', Validators.required], // automatic, manual, scheduled
            duration: [30, [Validators.required, Validators.min(1), Validators.max(480)]], // minutes
            waterAmount: [0, [Validators.min(0)]], // liters (calculated automatically)
            priority: ['medium', Validators.required],
            reason: ['on_demand', Validators.required],
            overrideSchedule: [false],
            useOptimalTiming: [true],
            considerWeather: [true],
            notes: [''],

            // Advanced hydraulic options
            customFlowRate: [0, [Validators.min(0)]],
            targetPressure: [2.5, [Validators.min(0.5), Validators.max(10)]], // bar
            pipeLength: [100, [Validators.min(1)]],
            elevation: [0],

            // Environmental thresholds
            minSoilMoisture: [30, [Validators.min(0), Validators.max(100)]],
            maxTemperature: [35, [Validators.min(0), Validators.max(50)]],
            minHumidity: [40, [Validators.min(0), Validators.max(100)]],
        });

        // React to crop production changes
        this.irrigationForm.get('cropProductionId')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(cropProductionId => {
                if (cropProductionId) {
                    this.onCropProductionSelected(+cropProductionId);
                }
            });

        // React to irrigation mode changes
        this.irrigationForm.get('irrigationMode')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(mode => {
                this.onIrrigationModeChanged(mode);
            });
    }

    private setupRealTimeUpdates(): void {
        if (this.autoRefresh) {
            interval(30000) // Update every 30 seconds
                .pipe(
                    startWith(0),
                    switchMap(() => this.loadSystemStatus()),
                    takeUntil(this.destroy$)
                )
                .subscribe();
        }
    }

    private loadSystemStatus(): Observable<any> {
        return this.irrigationService.getIrrigationSystemStatus()
            .pipe(
                map(status => {
                    console.log('System Status:', status);
                    this.systemStatus = status;
                    return status;
                }),
                catchError(error => {
                    console.error('Error loading system status:', error);
                    return [];
                })
            );
    }

    onCropProductionSelected(cropProductionId: number): void {
        this.selectedCropProduction = this.cropProductions.find(cp => cp.id === cropProductionId) || null;

        if (this.selectedCropProduction) {
            // Load related data
            this.loadCropProductionDetails();
            this.loadRecentEvents();
            this.loadRecentMeasurements();
            this.calculateOptimalSchedule();
        }
    }

    private loadCropProductionDetails(): void {
        if (!this.selectedCropProduction) return;

        // Load container details
        if (this.selectedCropProduction.containerId) {
            this.irrigationService.getContainerById(this.selectedCropProduction.containerId)
                .pipe(takeUntil(this.destroy$))
                .subscribe(container => {
                    // Map dateCreated and dateUpdated to string if needed
                    this.selectedContainer = {
                        ...container,
                        dateCreated: typeof container.dateCreated === 'string' ? container.dateCreated : container.dateCreated?.toISOString?.() ?? '',
                        dateUpdated: new Date(Date.now()).toISOString()
                    };
                    this.updateCalculations();
                });
        }

        // Load dropper details
        if (this.selectedCropProduction.dropperId) {
            this.irrigationService.getDropperById(this.selectedCropProduction.dropperId)
                .pipe(takeUntil(this.destroy$))
                .subscribe(dropper => {
                    this.selectedDropper = {
                        ...dropper,
                        dateCreated: typeof dropper.dateCreated === 'string' ? dropper.dateCreated : dropper.dateCreated?.toISOString?.() ?? '',
                        dateUpdated: Date.now().toString()
                    };
                    this.updateCalculations();
                });
        }

        // Load growing medium details
        if (this.selectedCropProduction.growingMediumId) {
            this.irrigationService.getGrowingMediumById(this.selectedCropProduction.growingMediumId)
                .pipe(takeUntil(this.destroy$))
                .subscribe(growingMedium => {
                    this.selectedGrowingMedium = {
                        id: growingMedium.id,
                        name: growingMedium.name,
                        catalogId: growingMedium.catalogId ?? 0,
                        containerCapacityPercentage: growingMedium.containerCapacityPercentage ?? 0,
                        permanentWiltingPoint: growingMedium.permanentWiltingPoint ?? 0,
                        fiveKpaHumidity: (growingMedium as any).fiveKpaHumidity ?? 0,
                        active: growingMedium.active ?? true,
                        dateCreated: typeof growingMedium.dateCreated === 'string' ? growingMedium.dateCreated : growingMedium.dateCreated?.toISOString?.() ?? '',
                        dateUpdated: Date.now().toString(),
                        createdBy: growingMedium.createdBy ?? 0,
                        updatedBy: growingMedium.createdBy,
                    };
                    this.updateCalculations();
                });
        }

        // Load real-time sensor data
        this.irrigationService.getRealTimeSensorData(this.selectedCropProduction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.realTimeData$.next(data);
            });
    }

    private loadRecentEvents(): void {
        if (!this.selectedCropProduction) return;

        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

        this.irrigationService.getIrrigationEvents(startDate, endDate, this.selectedCropProduction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(events => {
                this.recentEvents = events.slice(0, 10); // Last 10 events
            });
    }

    private loadRecentMeasurements(): void {
        if (!this.selectedCropProduction) return;

        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours

        this.irrigationService.getIrrigationMeasurements(this.selectedCropProduction.id, startDate, endDate)
            .pipe(takeUntil(this.destroy$))
            .subscribe(measurements => {
                this.recentMeasurements = measurements.slice(0, 10); // Last 10 measurements
            });
    }

    private calculateOptimalSchedule(): void {
        if (!this.selectedCropProduction) return;

        this.irrigationService.optimizeIrrigationSchedule(this.selectedCropProduction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(optimization => {
                this.scheduleOptimization = optimization;
                this.updateFormWithOptimization();
            });
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
        if (!this.selectedCropProduction || !this.selectedContainer || !this.selectedDropper) {
            this.alertService.showError('Please select a crop production first');
            return;
        }

        this.isCalculating = true;

        // Perform hydraulic calculations
        this.performHydraulicCalculations();

        // Calculate evapotranspiration
        this.calculateEvapotranspiration();

        // Calculate flow rate
        this.calculateFlowRate();

        // Perform on-demand calculation logic
        this.performOnDemandCalculation();
    }

    private performHydraulicCalculations(): void {
        const formValue = this.irrigationForm.value;
        const flowRate = formValue.customFlowRate || (this.selectedDropper!.flowRate * this.selectedCropProduction!.numberOfDroppersPerContainer);

        this.irrigationService.calculateHydraulics(
            flowRate,
            25, // Default pipe size in mm
            formValue.pipeLength,
            formValue.elevation,
            [{ type: 'elbow', quantity: 4 }, { type: 'tee', quantity: 2 }] // Standard fittings
        ).pipe(takeUntil(this.destroy$))
            .subscribe(calculation => {
                this.hydraulicCalculation = calculation;
            });
    }

    private calculateEvapotranspiration(): void {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

        this.irrigationService.calculateEvapotranspiration(
            this.selectedCropProduction!.id,
            startDate,
            endDate
        ).pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.evapotranspirationData = data;
            });
    }

    private calculateFlowRate(): void {
        // this.irrigationService.calculateFlowRate(
        //     this.selectedCropProduction!.containerId,
        //     this.selectedCropProduction!.dropperId,
        //     this.selectedCropProduction!.numberOfDroppersPerContainer,
        //     this.selectedCropProduction!.area
        // ).pipe(takeUntil(this.destroy$))
        //     .subscribe(calculation => {
        //         this.flowRateCalculation = calculation;
        //     });
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

                    // Refresh data
                    this.loadRecentEvents();
                    this.loadSystemStatus().subscribe();

                    // Reset calculation result to force recalculation
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
            // Automatically recalculate when dependencies change
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
            timestamp: new Date().toISOString()
        };

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `irrigation-report-${this.selectedCropProduction.code}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.alertService.showSuccess('Report exported successfully');
    }

    // Utility methods
    getStatusColor(status: string): string {
        const colorMap: { [key: string]: string } = {
            'running': 'text-green-600',
            'stopped': 'text-gray-600',
            'maintenance': 'text-yellow-600',
            'error': 'text-red-600',
            'scheduled': 'text-blue-600'
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
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    formatFlowRate(flowRate: number): string {
        return `${flowRate.toFixed(1)} L/h`;
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

    private handleError(message: string, error: any): void {
        console.error(message, error);
        this.errorMessage = message;
        this.alertService.showError(message);

        // Clear error message after 5 seconds
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
        return this.recentMeasurements.reduce((sum, measurement) => sum + measurement.recordValue, 0);
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
        return this.systemStatus?.alerts?.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length === 0;
    }


    // Mapping function to convert API response to extended interface
    private mapApiResponseToCropProduction(apiResponse: CropProductionApiResponse): ExtendedCropProduction {
        //   area(containerId: any, dropperId: any, numberOfDroppersPerContainer: any, area: any): unknown;
        return {
            // Standard CropProduction properties
            id: apiResponse.id,
            code: apiResponse.name, // Using name as code since API doesn't have separate code
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

            // Extended properties from API
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

    // Updated loadInitialData method
    private loadInitialData(): void {
        this.isLoading = true;

        // Load crop productions with proper mapping
        this.cropProductionService.getAll()
            .pipe(
                map((response: any) => {
                    // Handle the response structure from your log
                    const data = response?.cropProductions || response || [];
                    console.log('Raw Crop Productions Response:', response);

                    // Map the API response to our extended interface
                    const mappedData = Array.isArray(data)
                        ? data.map(item => this.mapApiResponseToCropProduction(item))
                        : [];

                    return mappedData;
                }),
                switchMap(cropProductions => {
                    console.log('Mapped Crop Productions:', cropProductions);
                    this.cropProductions = cropProductions;

                    // Load containers, droppers, and growing mediums in parallel
                    return Promise.all([
                        this.irrigationService.getAllContainers(true).toPromise(),
                        this.irrigationService.getAllDroppers(true).toPromise(),
                        this.irrigationService.getAllGrowingMediums(true).toPromise()
                    ]);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: ([containers, droppers, growingMediums]) => {
                    console.log('Containers:', containers);
                    console.log('Droppers:', droppers);
                    console.log('Growing Mediums:', growingMediums);
                    this.containers = (containers || []).map((container: Container) => ({
                        ...container,
                        dateCreated: typeof container.dateCreated === 'string'
                            ? container.dateCreated
                            : container.dateCreated?.toISOString?.() ?? '',
                        dateUpdated: Date.now().toString()
                    }));
                    this.droppers = (droppers || []).map((dropper: Dropper) => ({
                        ...dropper,
                        dateCreated: typeof dropper.dateCreated === 'string'
                            ? dropper.dateCreated
                            : dropper.dateCreated?.toISOString?.() ?? '',
                        dateUpdated: Date.now().toString()
                    }));
                    this.growingMediums = (growingMediums || []).map((medium: GrowingMedium) => ({
                        id: medium.id,
                        name: medium.name,
                        catalogId: medium.catalogId ?? 0,
                        containerCapacityPercentage: medium.containerCapacityPercentage ?? 0,
                        permanentWiltingPoint: medium.permanentWiltingPoint ?? 0,
                        fiveKpaHumidity: (medium as any).fiveKpaHumidity ?? 0,
                        active: medium.active ?? true,
                        dateCreated: typeof medium.dateCreated === 'string'
                            ? medium.dateCreated
                            : medium.dateCreated?.toISOString?.() ?? '',
                        dateUpdated: Date.now().toString(),
                        createdBy: medium.createdBy ?? 0,
                        updatedBy: medium.createdBy,
                    }));
                    this.isLoading = false;
                },
                error: (error) => {
                    this.handleError('Error loading initial data', error);
                    this.isLoading = false;
                }
            });

        // Load system status
        this.loadSystemStatus();
    }

    // Safe property access methods
    getCropProductionName(): string {
        return this.selectedCropProduction?.name || this.selectedCropProduction?.code || '';
    }

    getCropProductionArea(): number {
        if (!this.selectedCropProduction) return 0;

        // Try to get from calculated area or from length/width
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

    // Safe access for container properties
    getContainerDimensions(): string {
        if (!this.selectedContainer) return 'N/A';
        return `${this.selectedContainer.length || 0}cm × ${this.selectedContainer.width || 0}cm × ${this.selectedContainer.height || 0}cm`;
    }

    // Safe access for dropper properties
    getTotalFlowRate(): number {
        if (!this.selectedDropper || !this.selectedCropProduction?.numberOfDroppersPerContainer) {
            return 0;
        }
        return this.selectedDropper.flowRate * this.selectedCropProduction.numberOfDroppersPerContainer;
    }

    // Safe access for growing medium properties
    getGrowingMediumWaterRetention(): number {
        return this.selectedGrowingMedium?.containerCapacityPercentage || 0;
    }

    getGrowingMediumDrainage(): number {
        // Calculate drainage as complement of water retention
        const retention = this.getGrowingMediumWaterRetention();
        return retention > 0 ? (100 - retention) : 0;
    }

    // Update the performOnDemandCalculation method
    private performOnDemandCalculation(): void {
        const realTimeData = this.realTimeData$.value;
        const formValue = this.irrigationForm.value;

        // Calculate water deficit based on ET and recent irrigation
        const avgET = this.evapotranspirationData.length > 0
            ? this.evapotranspirationData.reduce((sum, data) => sum + data.cropET, 0) / this.evapotranspirationData.length
            : 5; // Default 5mm/day

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
            waterDeficit > 10; // mm

        // Calculate recommended duration and water amount using safe access
        const flowRate = this.flowRateCalculation?.totalFlowRate || this.getTotalFlowRate();
        const area = this.getCropProductionArea();
        const requiredWater = waterDeficit * area / 1000; // Convert mm to liters
        const recommendedDuration = Math.max(15, Math.min(240, requiredWater / (flowRate || 1) * 60)); // 15-240 minutes

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

        // Update form with recommendations
        if (formValue.irrigationMode === 'automatic') {
            this.irrigationForm.patchValue({
                duration: Math.round(recommendedDuration),
                waterAmount: Math.round(requiredWater),
                priority
            });
        }

        this.isCalculating = false;
    }

    // Add these methods to your OnDemandIrrigationComponent class

    /**
     * Get device icon based on device ID
     */
    getDeviceIcon(deviceId: string): string {
        const deviceType = this.getDeviceTypeFromId(deviceId);

        const iconMap: { [key: string]: string } = {
            'suelo': 'bi-moisture',
            'presion': 'bi-speedometer2',
            'ph': 'bi-droplet-half',
            'flujo': 'bi-water',
            'meteo': 'bi-cloud-sun',
            'default': 'bi-cpu'
        };

        return iconMap[deviceType] || iconMap['default'];
    }

    /**
     * Get device type from device ID
     */
    private getDeviceTypeFromId(deviceId: string): string {
        const lowerDeviceId = deviceId.toLowerCase();

        if (lowerDeviceId.includes('suelo')) return 'suelo';
        if (lowerDeviceId.includes('presion')) return 'presion';
        if (lowerDeviceId.includes('ph')) return 'ph';
        if (lowerDeviceId.includes('flujo')) return 'flujo';
        if (lowerDeviceId.includes('meteo') || lowerDeviceId.includes('meteorolog')) return 'meteo';

        return 'default';
    }

    /**
     * Get human-readable device type
     */
    getDeviceType(deviceId: string): string {
        const deviceType = this.getDeviceTypeFromId(deviceId);

        const typeMap: { [key: string]: string } = {
            'suelo': 'Humedad Suelo',
            'presion': 'Presión',
            'ph': 'pH',
            'flujo': 'Flujo',
            'meteo': 'Meteorológica',
            'default': 'Otro'
        };

        return typeMap[deviceType] || typeMap['default'];
    }

    /**
     * Get device type CSS class
     */
    getDeviceTypeClass(deviceId: string): string {
        return this.getDeviceTypeFromId(deviceId);
    }

    /**
     * Get device status color class
     */
    getDeviceStatusClass(isActive: boolean): string {
        return isActive ? 'status-active' : 'status-inactive';
    }

    /**
     * Get device row class based on status
     */
    getDeviceRowClass(device: any): string {
        return device.active ? 'device-active' : 'device-inactive';
    }

    /**
     * Count devices by type
     */
    getDeviceCountByType(): { [type: string]: number } {
        if (!this.systemStatus?.devices) return {};

        return this.systemStatus.devices.reduce((counts: { [x: string]: any; }, device: { deviceId: string; }) => {
            const type = this.getDeviceTypeFromId(device.deviceId);
            counts[type] = (counts[type] || 0) + 1;
            return counts;
        }, {} as { [type: string]: number });
    }

    /**
     * Get active devices count by type
     */
    getActiveDeviceCountByType(): { [type: string]: number } {
        if (!this.systemStatus?.devices) return {};

        return this.systemStatus.devices
            .filter((device: { active: any; }) => device.active)
            .reduce((counts: { [x: string]: any; }, device: { deviceId: string; }) => {
                const type = this.getDeviceTypeFromId(device.deviceId);
                counts[type] = (counts[type] || 0) + 1;
                return counts;
            }, {} as { [type: string]: number });
    }

    /**
     * Filter devices by type
     */
    getDevicesByType(type: string): any[] {
        if (!this.systemStatus?.devices) return [];

        return this.systemStatus.devices.filter((device: { deviceId: string; }) =>
            this.getDeviceTypeFromId(device.deviceId) === type
        );
    }

    /**
     * Check if device is critical for irrigation
     */
    isIrrigationCriticalDevice(deviceId: string): boolean {
        const criticalTypes = ['flujo', 'presion', 'suelo'];
        const deviceType = this.getDeviceTypeFromId(deviceId);
        return criticalTypes.includes(deviceType);
    }

    /**
     * Get device health status
     */
    getDeviceHealth(device: any): 'healthy' | 'warning' | 'critical' {
        if (!device.active) return 'critical';

        // Add more logic based on last update time, sensor readings, etc.
        const lastUpdate = device.dateUpdated || device.dateCreated;
        const hoursSinceUpdate = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate > 24) return 'warning';
        if (hoursSinceUpdate > 72) return 'critical';

        return 'healthy';
    }

    /**
     * Sort devices by priority (critical irrigation devices first)
     */
    sortDevicesByPriority(devices: any[]): any[] {
        return [...devices].sort((a, b) => {
            const aIsCritical = this.isIrrigationCriticalDevice(a.deviceId);
            const bIsCritical = this.isIrrigationCriticalDevice(b.deviceId);

            if (aIsCritical && !bIsCritical) return -1;
            if (!aIsCritical && bIsCritical) return 1;

            // If both are critical or both are not, sort by active status
            if (a.active && !b.active) return -1;
            if (!a.active && b.active) return 1;

            // Finally, sort alphabetically
            return a.deviceId.localeCompare(b.deviceId);
        });
    }

    /**
     * Get device summary statistics
     */
    getDeviceSummaryStats(): {
        total: number;
        active: number;
        byType: { [type: string]: { total: number; active: number } };
        criticalOffline: number;
    } {
        if (!this.systemStatus?.devices) {
            return { total: 0, active: 0, byType: {}, criticalOffline: 0 };
        }

        const devices = this.systemStatus.devices;
        const byType: { [type: string]: { total: number; active: number } } = {};
        let criticalOffline = 0;

        devices.forEach((device: { deviceId: string; active: any; }) => {
            const type = this.getDeviceTypeFromId(device.deviceId);

            if (!byType[type]) {
                byType[type] = { total: 0, active: 0 };
            }

            byType[type].total++;
            if (device.active) {
                byType[type].active++;
            } else if (this.isIrrigationCriticalDevice(device.deviceId)) {
                criticalOffline++;
            }
        });

        return {
            total: devices.length,
            active: devices.filter((d: { active: any; }) => d.active).length,
            byType,
            criticalOffline
        };
    }
}