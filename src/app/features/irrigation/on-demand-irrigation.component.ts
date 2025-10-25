// src/app/features/irrigation/on-demand-irrigation.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// Services
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { FarmService } from '../farms/services/farm.service';
import {
    IrrigationSchedulingService,
    IrrigationMode,
    IrrigationPlan,
    IrrigationPlanEntry,
    CreateIrrigationPlanEntryCommand,
    UpdateIrrigationPlanEntryCommand
} from '../services/irrigation-scheduling.service';
import { AlertService } from '../../core/services/alert.service';

// Models
import { CropProduction, Farm } from '../../core/models/models';

@Component({
    selector: 'app-on-demand-irrigation',
    templateUrl: './on-demand-irrigation.component.html',
    styleUrls: ['./on-demand-irrigation.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class OnDemandIrrigationComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Core Data
    onDemandMode: IrrigationMode | null = null;
    irrigationPlans: IrrigationPlan[] = [];
    onDemandEntries: IrrigationPlanEntry[] = [];

    // Reference Data
    farms: Farm[] = [];
    cropProductions: CropProduction[] = [];
    filteredCropProductions: CropProduction[] = [];

    // Forms
    executionForm!: FormGroup;

    // UI State
    isLoading = false;
    isExecuting = false;
    showExecutionForm = false;
    selectedEntry: IrrigationPlanEntry | null = null;

    // Messages
    errorMessage = '';
    successMessage = '';

    constructor(
        private fb: FormBuilder,
        private schedulingService: IrrigationSchedulingService,
        private sectorService: IrrigationSectorService,
        private cropProductionService: CropProductionService,
        private farmService: FarmService,
        private alertService: AlertService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadInitialData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ==================== INITIALIZATION ====================

    initializeForm(): void {
        const now = new Date();
        this.executionForm = this.fb.group({
            irrigationPlanId: [null, Validators.required],
            farmId: [null],
            cropProductionId: [null],
            startHours: [now.getHours(), [Validators.required, Validators.min(0), Validators.max(23)]],
            startMinutes: [now.getMinutes(), [Validators.required, Validators.min(0), Validators.max(59)]],
            duration: [30, [Validators.required, Validators.min(1), Validators.max(240)]],
            sequence: [1, [Validators.required, Validators.min(1)]],
            notes: ['']
        });
    }

    // ==================== DATA LOADING ====================

    loadInitialData(): void {
        this.isLoading = true;

        // Load OnDemand mode
        this.schedulingService.getOnDemandMode()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (mode) => {
                    if (mode) {
                        this.onDemandMode = mode;
                        this.loadIrrigationPlans();
                       // this.loadOnDemandEntries();
                    } else {
                        this.showError('OnDemand irrigation mode not found in the system');
                        this.isLoading = false;
                    }
                },
                error: (error) => {
                    this.showError('Failed to load OnDemand mode');
                    console.error('Error loading OnDemand mode:', error);
                    this.isLoading = false;
                }
            });

        // Load farms
        this.farmService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (farms) => {
                    this.farms = farms;
                },
                error: (error) => {
                    console.error('Error loading farms:', error);
                }
            });

        // Load crop productions
        this.cropProductionService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (productions) => {
                    this.cropProductions = productions;
                    this.filteredCropProductions = productions;
                },
                error: (error) => {
                    console.error('Error loading crop productions:', error);
                }
            });
    }

    loadIrrigationPlans(): void {
        this.schedulingService.getAllIrrigationPlansWithEntries()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (plans: any) => {
                    console.log('Irrigation Plans:', plans.irrigationPlans);
                    console.log('Irrigation Plans Entries:', plans.irrigationPlanEntries);
                    const plansArray = Array.isArray(plans.irrigationPlans) ? plans.irrigationPlans : [];
                    this.irrigationPlans = plansArray.filter((p: { active: any; }) => p.active);

                    const entriesArray = Array.isArray(plans.irrigationPlanEntries) ? plans.irrigationPlanEntries : [];
                    console.log('Filtered Active Irrigation Plans:', this.irrigationPlans);
                    console.log('All Irrigation Plan Entries:', entriesArray);
                    this.onDemandEntries = entriesArray.filter(((e: { irrigationModeId: number; }) => e.irrigationModeId === this.onDemandMode!.id));

                    this.isLoading = false;
                    
                },
                error: (error) => {
                    this.showError('Failed to load irrigation plans');
                    console.error('Error loading irrigation plans:', error);
                    this.isLoading = false;
                }
            });
    }

    loadOnDemandEntries(): void {
        if (!this.onDemandMode) return;

        this.schedulingService.getAllIrrigationPlanEntries(undefined, this.onDemandMode.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (entries) => {
                    // Sort by date created, most recent first
                    this.onDemandEntries = entries.sort((a, b) =>
                        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
                    );
                },
                error: (error) => {
                    console.error('Error loading on-demand entries:', error);
                }
            });
    }

    // ==================== FORM HANDLERS ====================

    onFarmChange(farmId: number): void {
        if (farmId) {
            this.filteredCropProductions = this.cropProductions.filter(
                cp => cp.productionUnitId && this.getProductionUnitFarmId(cp.productionUnitId) === farmId
            );
            this.executionForm.patchValue({ cropProductionId: null });
        } else {
            this.filteredCropProductions = this.cropProductions;
        }
    }

    getProductionUnitFarmId(productionUnitId: number): number | null {
        // This would need to be implemented based on your ProductionUnit service
        // For now, returning null as placeholder
        return null;
    }

    // ==================== EXECUTION METHODS ====================

    showExecutionDialog(): void {
        this.selectedEntry = null;
        this.executionForm.reset({
            irrigationPlanId: null,
            farmId: null,
            cropProductionId: null,
            startHours: new Date().getHours(),
            startMinutes: new Date().getMinutes(),
            duration: 30,
            sequence: 1,
            notes: ''
        });
        this.showExecutionForm = true;
    }

    cancelExecution(): void {
        this.showExecutionForm = false;
        this.selectedEntry = null;
    }

    executeOnDemandIrrigation(): void {
        if (this.executionForm.invalid || !this.onDemandMode) {
            this.showError('Please fill in all required fields');
            return;
        }

        this.isExecuting = true;
        const formValue = this.executionForm.value;

        // Convert hours and minutes to TimeSpan string
        const startTime = this.schedulingService.toTimeSpan(
            formValue.startHours,
            formValue.startMinutes
        );

        // Get current user ID (you'll need to get this from your auth service)
        const userId = 1; // Placeholder - replace with actual user ID

        const command: any = {
            irrigationPlanId: formValue.irrigationPlanId,
            irrigationModeId: this.onDemandMode.id,
            startTime: startTime,
            duration: formValue.duration,
            wStart: null,
            wEnd: null,
            frequency: null,
            sequence: formValue.sequence,
            active: true,
            createdBy: userId
        };

        this.schedulingService.createIrrigationPlanEntry(command)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.showSuccess('On-demand irrigation executed successfully');
                    this.showExecutionForm = false;
                    this.loadOnDemandEntries();
                    this.isExecuting = false;

                    // Check if it should execute immediately
                    const scheduledTime = new Date();
                    scheduledTime.setHours(formValue.startHours, formValue.startMinutes, 0, 0);
                    const now = new Date();
                },
                error: (error) => {
                    this.showError('Failed to execute on-demand irrigation');
                    console.error('Error executing irrigation:', error);
                    this.isExecuting = false;
                }
            });
    }

    // ==================== QUICK ACTIONS ====================

    quickExecute(planId: number, durationMinutes: number): void {
        if (!this.onDemandMode) {
            this.showError('OnDemand mode not available');
            return;
        }

        const now = new Date();
        const startTime = this.schedulingService.toTimeSpan(now.getHours(), now.getMinutes());
        const userId = 1; // Placeholder

        const command: CreateIrrigationPlanEntryCommand = {
            irrigationPlanId: planId,
            irrigationModeId: this.onDemandMode.id,
            startTime: startTime,
            duration: durationMinutes,
            sequence: 1,
            active: true,
            createdBy: userId
        };

        this.isExecuting = true;

        this.schedulingService.createIrrigationPlanEntry(command)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showSuccess(`Quick irrigation started for ${durationMinutes} minutes`);
                    this.loadOnDemandEntries();
                    this.isExecuting = false;
                },
                error: (error) => {
                    this.showError('Failed to start quick irrigation');
                    console.error('Error:', error);
                    this.isExecuting = false;
                }
            });
    }

    // ==================== ENTRY MANAGEMENT ====================

    deleteEntry(entry: IrrigationPlanEntry): void {
        if (!confirm('Are you sure you want to delete this execution record?')) {
            return;
        }

        this.schedulingService.deleteIrrigationPlanEntry(entry.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showSuccess('Execution record deleted');
                    this.loadOnDemandEntries();
                },
                error: (error) => {
                    this.showError('Failed to delete execution record');
                    console.error('Error:', error);
                }
            });
    }

    viewEntryDetails(entry: IrrigationPlanEntry): void {
        this.selectedEntry = entry;
    }

    closeEntryDetails(): void {
        this.selectedEntry = null;
    }

    // ==================== HELPER METHODS ====================

    getIrrigationPlanName(planId: number): string {
        const plan = this.irrigationPlans.find(p => p.id === planId);
        return plan ? plan.name : `Plan #${planId}`;
    }

    getFarmName(farmId: number): string {
        const farm = this.farms.find(f => f.id === farmId);
        return farm ? farm.name : 'Unknown Farm';
    }

    getCropProductionName(cropProductionId: number): string {
        const production = this.cropProductions.find(cp => cp.id === cropProductionId);
        return production ? production.name || `Production #${cropProductionId}` : 'Unknown';
    }

    formatTime(timeSpan: string): string {
        return this.schedulingService.formatTime(timeSpan);
    }

    formatDateTime(date: string | Date): string {
        const d = new Date(date);
        return d.toLocaleString();
    }

    formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    getEntryStatus(entry: IrrigationPlanEntry): string {
        const now = new Date();
        const createdDate = new Date(entry.dateCreated);
        const startTime = this.parseTimeSpan(entry.startTime);

        // Calculate execution start time
        const executionStart = new Date(createdDate);
        executionStart.setHours(startTime.hours, startTime.minutes, 0, 0);

        // Calculate execution end time
        const executionEnd = new Date(executionStart);
        executionEnd.setMinutes(executionEnd.getMinutes() + entry.duration);

        if (now < executionStart) {
            return 'Scheduled';
        } else if (now >= executionStart && now <= executionEnd) {
            const remaining = Math.floor((executionEnd.getTime() - now.getTime()) / 60000);
            return `Active (${remaining} min remaining)`;
        } else {
            return 'Completed';
        }
    }

    getStatusClass(entry: IrrigationPlanEntry): string {
        const status = this.getEntryStatus(entry);
        if (status.includes('Active')) return 'status-active';
        if (status === 'Scheduled') return 'status-scheduled';
        return 'status-completed';
    }

    getTodayExecutionCount(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.onDemandEntries.filter(entry => {
            const entryDate = new Date(entry.dateCreated);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        }).length;
    }

    getTodayTotalDuration(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.onDemandEntries
            .filter(entry => {
                const entryDate = new Date(entry.dateCreated);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            })
            .reduce((total, entry) => total + entry.duration, 0);
    }

    getActiveExecutions(): IrrigationPlanEntry[] {
        return this.onDemandEntries.filter(entry =>
            this.getEntryStatus(entry).includes('Active')
        );
    }

    parseTimeSpan(timeSpan: string): { hours: number; minutes: number } {
        const parts = timeSpan.split(':');
        return {
            hours: parseInt(parts[0], 10),
            minutes: parseInt(parts[1], 10)
        };
    }

    // ==================== MESSAGE HELPERS ====================

    showError(message: string): void {
        this.errorMessage = message;
        this.successMessage = '';
        setTimeout(() => this.errorMessage = '', 5000);
    }

    showSuccess(message: string): void {
        this.successMessage = message;
        this.errorMessage = '';
        setTimeout(() => this.successMessage = '', 5000);
    }

    clearMessages(): void {
        this.errorMessage = '';
        this.successMessage = '';
    }
}