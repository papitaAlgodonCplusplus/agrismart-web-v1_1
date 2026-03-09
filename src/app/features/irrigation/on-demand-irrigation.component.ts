// src/app/features/irrigation/on-demand-irrigation.component.ts (UPDATED VERSION)
// This is the updated version that uses IrrigationPlanEntryHistory instead of IrrigationPlanEntry for execution history

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
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
import { IrrigationRecommendation } from '../services/models/irrigation-decision.models';
import { IrrigationAutoMonitorService } from '../services/irrigation-auto-monitor.service';
import { CropService } from '../crops/services/crop.service';

// Models
import { CropProduction, Farm, Crop } from '../../core/models/models';

@Component({
    selector: 'app-on-demand-irrigation',
    templateUrl: './on-demand-irrigation.component.html',
    styleUrls: ['./on-demand-irrigation.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class OnDemandIrrigationComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Core Data
    onDemandMode: IrrigationMode | null = null;
    irrigationPlans: IrrigationPlan[] = [];
    onDemandEntries: IrrigationPlanEntry[] = []; // Available schedules/durations
    executionHistory: IrrigationPlanEntryHistory[] = []; // Actual execution history

    // Reference Data
    farms: Farm[] = [];
    cropProductions: CropProduction[] = [];
    crops: Crop[] = [];
    sectors: any[] = [];

    // Forms
    executionForm!: FormGroup;

    // UI State
    isLoading = false;
    isExecuting = false;
    showExecutionForm = false;
    selectedHistory: IrrigationPlanEntryHistory | null = null;

    // Auto Mode State (mirrored from IrrigationAutoMonitorService)
    autoModeEnabled = false;
    currentRecommendation: IrrigationRecommendation | null = null;
    recommendationError: { title: string; details: string[] } | null = null;
    selectedSectorId: number | null = null;
    selectedSector: any | null = null;
    selectedCropProductionId: number | null = null;
    isLoadingRecommendation = false;
    autoAcceptEnabled = false;
    lastRecommendationTime: Date | null = null;
    nextCheckCountdown: number = 0;

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
        private router: Router,
        private cropService: CropService,
        public monitor: IrrigationAutoMonitorService,
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.subscribeToMonitor();
    }

    ngOnDestroy(): void {
        // Do NOT stop monitoring here — it must survive navigation.
        // monitoring lives in IrrigationAutoMonitorService (root singleton).
        this.destroy$.next();
        this.destroy$.complete();
    }

    private subscribeToMonitor(): void {
        this.monitor.autoModeEnabled$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.autoModeEnabled = v);
        this.monitor.currentRecommendation$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.currentRecommendation = v);
        this.monitor.recommendationError$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.recommendationError = v);
        this.monitor.isLoadingRecommendation$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.isLoadingRecommendation = v);
        this.monitor.lastRecommendationTime$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.lastRecommendationTime = v);
        this.monitor.nextCheckCountdown$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.nextCheckCountdown = v);
        this.monitor.isExecuting$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.isExecuting = v);
        this.monitor.autoAcceptEnabled$.pipe(takeUntil(this.destroy$))
            .subscribe(v => this.autoAcceptEnabled = v);
        this.monitor.notification$.pipe(takeUntil(this.destroy$))
            .subscribe(n => {
                if (n.type === 'success') {
                    this.showSuccess(n.message);
                    this.loadExecutionHistory();
                } else {
                    this.showError(n.message);
                }
            });
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
                next: (farms) => { this.farms = farms; },
                error: (error) => { console.error('Error loading farms:', error); }
            });

        // Load crops
        this.cropService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (crops) => { this.crops = crops; },
                error: (error) => { console.error('Error loading crops:', error); }
            });

        // Load crop productions
        this.cropProductionService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (productions: any) => {
                    this.cropProductions = Array.isArray(productions)
                        ? productions
                        : (productions.cropProductions || []);
                },
                error: (error) => { console.error('Error loading crop productions:', error); }
            });

        // Load sectors (valves)
        this.sectorService.getAllCropProductionIrrigationSectors()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (sectors) => { this.sectors = sectors; },
                error: (error) => { console.error('Error loading sectors:', error); }
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

                    if (this.monitor.isEnabled) {
                        this.monitor.updateConfig({ irrigationPlans: this.irrigationPlans });
                    }

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
        this.executionForm.patchValue({ cropProductionId: null });
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
        const userId = 1; // Placeholder

        const command: CreateIrrigationPlanEntryCommand = {
            irrigationPlanId: planId,
            irrigationModeId: this.onDemandMode.id,
            executionDate: now.toISOString(),
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

    // ==================== ANALYSIS DISPLAY HELPERS ====================

    getRuleIcon(rule: any): string {
        if (rule.shouldTrigger) {
            if (rule.urgency === 'critical') return 'bi-exclamation-triangle-fill';
            return 'bi-exclamation-circle-fill';
        }
        if (rule.volumeAdjustment && rule.volumeAdjustment !== 1.0) return 'bi-sliders';
        return 'bi-check-circle-fill';
    }

    getRuleStatusClass(rule: any): string {
        if (rule.shouldTrigger) {
            if (rule.urgency === 'critical') return 'rule-critical';
            if (rule.urgency === 'high') return 'rule-high';
            return 'rule-triggered';
        }
        if (rule.volumeAdjustment && rule.volumeAdjustment !== 1.0) return 'rule-adjust';
        return 'rule-ok';
    }

    getMoistureStatusClass(depletion: number): string {
        if (depletion >= 60) return 'sensor-critical';
        if (depletion >= 40) return 'sensor-warning';
        if (depletion >= 25) return 'sensor-caution';
        return 'sensor-ok';
    }

    getVPDStatusClass(vpd: number): string {
        if (vpd > 1.2) return 'sensor-warning';
        if (vpd < 0.4) return 'sensor-caution';
        return 'sensor-ok';
    }

    getDrainageStatusClass(drain: number): string {
        if (drain > 25) return 'sensor-warning';
        if (drain < 15) return 'sensor-caution';
        return 'sensor-ok';
    }

    formatHoursSince(hours: number): string {
        if (hours < 1) return `${Math.round(hours * 60)} min`;
        if (hours < 24) return `${hours.toFixed(1)} h`;
        return `${(hours / 24).toFixed(1)} d`;
    }

    getTriggeredRulesCount(rules: any[]): number {
        return rules.filter(r => r.shouldTrigger).length;
    }

    translateUrgency(urgency: string): string {
        const map: Record<string, string> = {
            critical: 'CRÍTICO',
            high: 'ALTO',
            medium: 'MEDIO',
            low: 'BAJO'
        };
        return map[urgency] ?? urgency.toUpperCase();
    }

    getSensorFailedClass(value: any): string {
        return (value === null || value === undefined) ? 'sensor-failed' : '';
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

    toggleAutoAccept(): void {
        this.monitor.setAutoAccept(!this.monitor.isAutoAcceptEnabled);
    }

    toggleAutoMode(): void {
        if (this.monitor.isEnabled) {
            this.monitor.stop();
            this.showSuccess('Auto Mode disabled');
        } else {
            if (!this.selectedSectorId || !this.selectedCropProductionId || !this.onDemandMode) {
                this.showError('Por favor seleccione una válvula primero');
                return;
            }
            this.monitor.start({
                cropProductionId: this.selectedCropProductionId,
                sectorId: this.selectedSectorId,
                selectedSector: this.selectedSector,
                onDemandMode: this.onDemandMode,
                irrigationPlans: this.irrigationPlans,
            });
            this.showSuccess('Auto Mode enabled - monitoring irrigation needs');
        }
    }

    formatCountdown(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    manualExecuteRecommendation(): void {
        this.monitor.manualExecuteRecommendation()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => this.showSuccess(`Riego programado para ejecutarse en 2 minutos (${this.currentRecommendation!.recommendedDuration} min)`),
                error: (error) => this.showError(error.message || 'Error al crear la entrada del plan de riego')
            });
    }

    dismissRecommendation(): void {
        this.monitor.dismissRecommendation();
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

    onSectorChange(sectorId: any): void {
        this.selectedSectorId = sectorId ? +sectorId : null;
        this.selectedSector = this.sectors.find(s => s.id === this.selectedSectorId) || null;
        this.selectedCropProductionId = this.selectedSector?.cropProductionId || null;

        if (this.monitor.isEnabled) {
            this.monitor.updateConfig({
                sectorId: this.selectedSectorId!,
                selectedSector: this.selectedSector,
                cropProductionId: this.selectedCropProductionId!,
            });
            this.monitor.loadRecommendation();
        }
    }

    getSelectedCropProductionName(): string {
        if (!this.selectedSector?.cropProductionId) return '—';
        const cp = this.cropProductions.find((p: any) => p.id === this.selectedSector.cropProductionId) as any;
        return cp?.name || cp?.code || `Producción #${this.selectedSector.cropProductionId}`;
    }

    getSelectedCropName(): string {
        if (!this.selectedSector?.cropProductionId) return '—';
        const cp = this.cropProductions.find((p: any) => p.id === this.selectedSector.cropProductionId) as any;
        if (!cp?.cropId) return '—';
        const crop = this.crops.find(c => c.id === cp.cropId);
        return crop?.name || `Cultivo #${cp.cropId}`;
    }
}