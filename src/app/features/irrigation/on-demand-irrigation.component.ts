// src/app/features/irrigation/on-demand-irrigation.component.ts (UPDATED VERSION)
// This is the updated version that uses IrrigationPlanEntryHistory instead of IrrigationPlanEntry for execution history

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
} from '../services/irrigation-scheduling.service';
import {
    IrrigationPlanEntryHistoryService,
    IrrigationPlanEntryHistory,
    CreateIrrigationPlanEntryHistoryCommand
} from '../services/irrigation-plan-entry-history.service';
import { AlertService } from '../../core/services/alert.service';
import { IrrigationDecisionEngineService } from '../services/irrigation-decision-engine.service';
import { IrrigationRecommendation } from '../services/models/irrigation-decision.models';

// Models
import { CropProduction, Farm } from '../../core/models/models';

@Component({
    selector: 'app-on-demand-irrigation',
    templateUrl: './on-demand-irrigation.component.html',
    styleUrls: ['./on-demand-irrigation.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class OnDemandIrrigationComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private monitoringInterval: any;

    // Core Data
    onDemandMode: IrrigationMode | null = null;
    irrigationPlans: IrrigationPlan[] = [];
    onDemandEntries: IrrigationPlanEntry[] = []; // Available schedules/durations
    executionHistory: IrrigationPlanEntryHistory[] = []; // Actual execution history

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
    selectedHistory: IrrigationPlanEntryHistory | null = null;

    // Auto Mode State
    autoModeEnabled = false;
    currentRecommendation: IrrigationRecommendation | null = null;
    selectedCropProductionId: number | null = null;
    isLoadingRecommendation = false;
    lastRecommendationTime: Date | null = null;
    nextCheckCountdown: number = 0;
    private countdownInterval: any;

    // Messages
    errorMessage = '';
    successMessage = '';

    constructor(
        private fb: FormBuilder,
        private schedulingService: IrrigationSchedulingService,
        private historyService: IrrigationPlanEntryHistoryService,
        private sectorService: IrrigationSectorService,
        private cropProductionService: CropProductionService,
        private farmService: FarmService,
        private alertService: AlertService,
        private router: Router,
        private decisionEngine: IrrigationDecisionEngineService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadInitialData();
    }

    ngOnDestroy(): void {
        this.stopAutoMonitoring();
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
                        this.loadExecutionHistory(); // Load execution history instead of entries
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
                next: (productions: any) => {
                    this.cropProductions = productions.cropProductions;
                    this.filteredCropProductions = productions;
                },
                error: (error) => {
                    console.error('Error loading crop productions:', error);
                }
            });
    }

    loadIrrigationPlans(): void {
        if (!this.onDemandMode) return;

        this.schedulingService.getAllIrrigationPlansWithEntries()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (plans) => {
                    const plansArray = Array.isArray(plans.irrigationPlans) ? plans.irrigationPlans : [];
                    this.irrigationPlans = plansArray.filter((p: { active: any; }) => p.active);

                    // Load available entries (schedules/durations) for the on-demand mode
                    const entriesArray = Array.isArray(plans.irrigationPlanEntries) ? plans.irrigationPlanEntries : [];
                    this.onDemandEntries = entriesArray.filter((e: { irrigationModeId: number; }) => 
                        e.irrigationModeId === this.onDemandMode!.id
                    );

                    console.log('Active Irrigation Plans:', this.irrigationPlans);
                    console.log('OnDemand Entries (Available Schedules):', this.onDemandEntries);

                    this.isLoading = false;
                },
                error: (error) => {
                    this.showError('Failed to load irrigation plans');
                    console.error('Error loading irrigation plans:', error);
                    this.isLoading = false;
                }
            });
    }

    loadExecutionHistory(): void {
        if (!this.onDemandMode) return;

        // Load execution history by mode ID
        this.historyService.getByModeId(this.onDemandMode.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (histories) => {
                    // Sort by execution start time, most recent first
                    this.executionHistory = histories.sort((a, b) =>
                        new Date(b.executionStartTime).getTime() - new Date(a.executionStartTime).getTime()
                    );
                    console.log('Execution History:', this.executionHistory);
                },
                error: (error) => {
                    console.error('Error loading execution history:', error);
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
        return null;
    }

    // ==================== EXECUTION METHODS ====================

    showExecutionDialog(): void {
        this.selectedHistory = null;
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
        this.selectedHistory = null;
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

        const userId = 1; // Placeholder - replace with actual user ID

        // First, get or create an irrigation plan entry for this configuration
        const entryCommand: any = {
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

        // Create or use existing entry, then create history record
        this.schedulingService.createIrrigationPlanEntry(entryCommand)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (entryResponse) => {
                    // Now create the execution history record
                    const executionStartTime = new Date();
                    executionStartTime.setHours(formValue.startHours, formValue.startMinutes, 0, 0);

                    const historyCommand: CreateIrrigationPlanEntryHistoryCommand = {
                        irrigationPlanEntryId: entryResponse.data.id,
                        irrigationPlanId: formValue.irrigationPlanId,
                        irrigationModeId: this.onDemandMode!.id,
                        executionStartTime: executionStartTime,
                        plannedDuration: formValue.duration,
                        executionStatus: 'InProgress',
                        sequence: formValue.sequence,
                        notes: formValue.notes,
                        isManualExecution: true,
                        createdBy: userId
                    };

                    this.historyService.create(historyCommand)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: () => {
                                this.showSuccess('On-demand irrigation executed successfully');
                                this.showExecutionForm = false;
                                this.loadExecutionHistory();
                                this.isExecuting = false;
                            },
                            error: (error) => {
                                this.showError('Failed to create execution history');
                                console.error('Error creating history:', error);
                                this.isExecuting = false;
                            }
                        });
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
                next: (entryResponse) => {
                    // Create execution history
                    console.log("entryResponse: ", entryResponse)
                    const historyCommand: CreateIrrigationPlanEntryHistoryCommand = {
                        irrigationPlanEntryId: entryResponse.id,
                        irrigationPlanId: planId,
                        irrigationModeId: this.onDemandMode!.id,
                        executionStartTime: now,
                        plannedDuration: durationMinutes,
                        executionStatus: 'InProgress',
                        isManualExecution: true,
                        createdBy: userId
                    };

                    this.historyService.create(historyCommand)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: () => {
                                this.showSuccess(`Quick irrigation started for ${durationMinutes} minutes`);
                                this.loadExecutionHistory();
                                this.isExecuting = false;
                            },
                            error: (error) => {
                                this.showError('Failed to create execution history');
                                console.error('Error:', error);
                                this.isExecuting = false;
                            }
                        });
                },
                error: (error) => {
                    this.showError('Failed to start quick irrigation');
                    console.error('Error:', error);
                    this.isExecuting = false;
                }
            });
    }

    // ==================== HISTORY MANAGEMENT ====================

    deleteHistory(history: IrrigationPlanEntryHistory): void {
        if (!confirm('Are you sure you want to delete this execution record?')) {
            return;
        }

        this.historyService.delete(history.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showSuccess('Execution record deleted');
                    this.loadExecutionHistory();
                },
                error: (error) => {
                    this.showError('Failed to delete execution record');
                    console.error('Error:', error);
                }
            });
    }

    viewHistoryDetails(history: IrrigationPlanEntryHistory): void {
        this.selectedHistory = history;
    }

    closeHistoryDetails(): void {
        this.selectedHistory = null;
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

    getHistoryStatus(history: IrrigationPlanEntryHistory): string {
        const now = new Date();
        const executionStart = new Date(history.executionStartTime);
        
        if (history.executionStatus === 'Completed') {
            return 'Completed';
        } else if (history.executionStatus === 'Failed') {
            return 'Failed';
        } else if (history.executionStatus === 'Cancelled') {
            return 'Cancelled';
        } else if (history.executionStatus === 'InProgress') {
            if (history.executionEndTime) {
                return 'Completed';
            }
            // Calculate execution end time
            const executionEnd = new Date(executionStart);
            executionEnd.setMinutes(executionEnd.getMinutes() + history.plannedDuration);
            
            if (now >= executionStart && now <= executionEnd) {
                const remaining = Math.floor((executionEnd.getTime() - now.getTime()) / 60000);
                return `Active (${remaining} min remaining)`;
            } else if (now > executionEnd) {
                return 'Completed (needs update)';
            }
        } else if (history.executionStatus === 'Scheduled') {
            if (now < executionStart) {
                return 'Scheduled';
            } else {
                return 'In Progress';
            }
        }
        
        return history.executionStatus;
    }

    getStatusClass(history: IrrigationPlanEntryHistory): string {
        const status = this.getHistoryStatus(history);
        if (status.includes('Active') || status.includes('Progress')) return 'status-active';
        if (status.includes('Scheduled')) return 'status-scheduled';
        if (status.includes('Completed')) return 'status-completed';
        if (status.includes('Failed')) return 'status-failed';
        if (status.includes('Cancelled')) return 'status-cancelled';
        return '';
    }

    getTodayExecutionCount(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.executionHistory.filter(history => {
            const executionDate = new Date(history.executionStartTime);
            executionDate.setHours(0, 0, 0, 0);
            return executionDate.getTime() === today.getTime();
        }).length;
    }

    getTodayTotalDuration(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.executionHistory
            .filter(history => {
                const executionDate = new Date(history.executionStartTime);
                executionDate.setHours(0, 0, 0, 0);
                return executionDate.getTime() === today.getTime();
            })
            .reduce((total, history) => total + (history.actualDuration || history.plannedDuration), 0);
    }

    getActiveExecutions(): IrrigationPlanEntryHistory[] {
        return this.executionHistory.filter(history =>
            this.getHistoryStatus(history).includes('Active') || this.getHistoryStatus(history).includes('InProgress')
        );
    }

    getPlanDurations(planId: number): number[] {
        const durations = this.onDemandEntries
            .filter(entry => entry.irrigationPlanId === planId)
            .map(entry => entry.duration);
        
        return Array.from(new Set(durations)).sort((a, b) => a - b);
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

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    // ==================== AUTO MODE METHODS ====================

    toggleAutoMode(): void {
        this.autoModeEnabled = !this.autoModeEnabled;

        if (this.autoModeEnabled) {
            if (!this.selectedCropProductionId) {
                this.showError('Please select a crop production first');
                this.autoModeEnabled = false;
                return;
            }
            this.startAutoMonitoring();
            this.showSuccess('Auto Mode enabled - monitoring irrigation needs');
        } else {
            this.stopAutoMonitoring();
            this.showSuccess('Auto Mode disabled');
        }
    }

    startAutoMonitoring(): void {
        // Load initial recommendation
        this.loadRecommendation();

        // Set up periodic checking (every 5 minutes)
        this.monitoringInterval = setInterval(() => {
            this.loadRecommendation();
        }, 300000); // 5 minutes

        // Start countdown timer
        this.startCountdown();
    }

    stopAutoMonitoring(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.currentRecommendation = null;
        this.lastRecommendationTime = null;
        this.nextCheckCountdown = 0;
    }

    loadRecommendation(): void {
        if (!this.selectedCropProductionId) {
            return;
        }

        this.isLoadingRecommendation = true;
        this.lastRecommendationTime = new Date();

        this.decisionEngine.getRecommendation(this.selectedCropProductionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (recommendation) => {
                    this.currentRecommendation = recommendation;
                    this.isLoadingRecommendation = false;

                    // Handle critical urgency - auto-execute
                    if (recommendation.shouldIrrigate && recommendation.urgency === 'critical') {
                        this.autoExecuteRecommendation(recommendation);
                    }
                },
                error: (error) => {
                    console.error('Error loading recommendation:', error);
                    this.showError('Failed to load irrigation recommendation');
                    this.isLoadingRecommendation = false;
                }
            });
    }

    startCountdown(): void {
        this.nextCheckCountdown = 300; // 5 minutes in seconds
        this.countdownInterval = setInterval(() => {
            this.nextCheckCountdown--;
            if (this.nextCheckCountdown <= 0) {
                this.nextCheckCountdown = 300;
            }
        }, 1000);
    }

    formatCountdown(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    autoExecuteRecommendation(recommendation: IrrigationRecommendation): void {
        if (!this.selectedCropProductionId || this.isExecuting) {
            return;
        }

        // Find a suitable irrigation plan
        const plan = this.irrigationPlans[0]; // Use first available plan
        if (!plan) {
            this.showError('No irrigation plan available for auto-execution');
            return;
        }

        const now = new Date();
        const userId = 1; // Placeholder

        this.isExecuting = true;

        // Create entry command
        const entryCommand: CreateIrrigationPlanEntryCommand = {
            irrigationPlanId: plan.id,
            irrigationModeId: this.onDemandMode!.id,
            startTime: this.schedulingService.toTimeSpan(now.getHours(), now.getMinutes()),
            duration: recommendation.recommendedDuration,
            sequence: 1,
            active: true,
            createdBy: userId
        };

        this.schedulingService.createIrrigationPlanEntry(entryCommand)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (entryResponse) => {
                    // Create execution history
                    const historyCommand: CreateIrrigationPlanEntryHistoryCommand = {
                        irrigationPlanEntryId: entryResponse.id,
                        irrigationPlanId: plan.id,
                        irrigationModeId: this.onDemandMode!.id,
                        executionStartTime: now,
                        plannedDuration: recommendation.recommendedDuration,
                        executionStatus: 'InProgress',
                        isManualExecution: false,
                        notes: `Auto-executed: ${recommendation.reasoning.join('; ')}`,
                        createdBy: userId
                    };

                    this.historyService.create(historyCommand)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: () => {
                                this.showSuccess(`Auto-irrigation started: ${recommendation.recommendedDuration} min (${recommendation.urgency} urgency)`);
                                this.loadExecutionHistory();
                                this.isExecuting = false;
                            },
                            error: (error) => {
                                this.showError('Failed to create auto-execution history');
                                console.error('Error:', error);
                                this.isExecuting = false;
                            }
                        });
                },
                error: (error) => {
                    this.showError('Failed to auto-execute irrigation');
                    console.error('Error:', error);
                    this.isExecuting = false;
                }
            });
    }

    manualExecuteRecommendation(): void {
        if (!this.currentRecommendation || !this.selectedCropProductionId) {
            return;
        }

        // Pre-fill the execution form with recommendation values
        const recommendation = this.currentRecommendation;
        const now = new Date();

        this.executionForm.patchValue({
            irrigationPlanId: this.irrigationPlans[0]?.id || null,
            cropProductionId: this.selectedCropProductionId,
            startHours: now.getHours(),
            startMinutes: now.getMinutes(),
            duration: recommendation.recommendedDuration,
            sequence: 1,
            notes: `Based on recommendation: ${recommendation.reasoning.join('; ')}`
        });

        this.showExecutionDialog();
    }

    dismissRecommendation(): void {
        this.currentRecommendation = null;
    }

    getUrgencyClass(urgency: string): string {
        switch (urgency) {
            case 'critical': return 'urgency-critical';
            case 'high': return 'urgency-high';
            case 'medium': return 'urgency-medium';
            case 'low': return 'urgency-low';
            default: return '';
        }
    }

    getUrgencyIcon(urgency: string): string {
        switch (urgency) {
            case 'critical': return 'bi-exclamation-triangle-fill';
            case 'high': return 'bi-exclamation-circle-fill';
            case 'medium': return 'bi-info-circle-fill';
            case 'low': return 'bi-info-circle';
            default: return 'bi-info-circle';
        }
    }

    onCropProductionChange(cropProductionId: number): void {
        this.selectedCropProductionId = cropProductionId;

        // If auto mode is enabled, reload recommendation for new crop production
        if (this.autoModeEnabled) {
            this.loadRecommendation();
        }
    }
}