// src/app/features/irrigation-engineering-design/irrigation-engineering-design-scheduling.component.ts
// This file contains the scheduling-specific logic to be integrated into the main component

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IrrigationSchedulingService,
    IrrigationPlan,
    IrrigationMode,
    IrrigationPlanEntry,
    CreateIrrigationPlanEntryCommand,
    UpdateIrrigationPlanEntryCommand
} from '../services/irrigation-scheduling.service';
import { AlertService } from '../../core/services/alert.service';

// Add these properties to the existing IrrigationEngineeringDesignComponent class:

@Component({
    selector: 'app-irrigation-engineering-design-scheduling',
    templateUrl: './irrigation-engineering-design-scheduling.component.html',
    styleUrls: ['./irrigation-engineering-design-scheduling.component.css']
})
export class SchedulingEnhancement {
    // Scheduling properties
    irrigationPlans: IrrigationPlan[] = [];
    irrigationModes: IrrigationMode[] = [];
    plannedEntries: IrrigationPlanEntry[] = [];
    selectedPlan: IrrigationPlan | null = null;
    selectedEntry: IrrigationPlanEntry | null = null;

    // Forms
    planForm!: FormGroup;
    entryForm!: FormGroup;

    // UI State
    showPlanForm = false;
    showEntryForm = false;
    isEditMode = false;

    // Days of week for UI
    daysOfWeek = [
        { name: 'Monday', value: 1, label: 'L' },
        { name: 'Tuesday', value: 2, label: 'M' },
        { name: 'Wednesday', value: 4, label: 'X' },
        { name: 'Thursday', value: 8, label: 'J' },
        { name: 'Friday', value: 16, label: 'V' },
        { name: 'Saturday', value: 32, label: 'S' },
        { name: 'Sunday', value: 64, label: 'D' }
    ];

    constructor(
        private fb: FormBuilder,
        private schedulingService: IrrigationSchedulingService,
        private alertService: AlertService
    ) {
        this.initializeForms();
    }

    // ==================== Initialization ====================

    initializeForms(): void {
        this.planForm = this.fb.group({
            id: [0],
            name: ['', Validators.required],
            dayMask: [0, [Validators.required, Validators.min(1)]],
            active: [true]
        });

        this.entryForm = this.fb.group({
            id: [0],
            irrigationPlanId: [null, Validators.required],
            irrigationModeId: [null, Validators.required],
            startHours: [6, [Validators.required, Validators.min(0), Validators.max(23)]],
            startMinutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
            duration: [30, [Validators.required, Validators.min(1)]],
            wStart: [null],
            wEnd: [null],
            frequency: [1],
            sequence: [1, [Validators.required, Validators.min(1)]],
            active: [true]
        });
    }

    loadSchedulingData(): void {
        // Load irrigation modes
        this.schedulingService.getAllIrrigationModes()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (modes: IrrigationMode[]) => {
                    this.irrigationModes = modes;
                },
                error: (error: any) => {
                    console.error('Error loading modes:', error);
                }
            });

        // Load irrigation plans
        this.loadIrrigationPlans();
    }

    loadIrrigationPlans(): void {
        this.schedulingService.getAllIrrigationPlans()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (plans: IrrigationPlan[]) => {
                    if (Array.isArray(plans)) {
                        this.irrigationPlans = plans;
                        if (plans.length > 0 && !this.selectedPlan) {
                            this.selectPlan(plans[0]);
                        }
                    } else {
                        this.irrigationPlans = [];
                        console.error('Invalid irrigation plans data:', plans);
                    }
                },
                error: (error: any) => {
                    console.error('Error loading plans:', error);
                }
            });
    }

    loadPlannedEntries(): void {
        const plannedMode = this.irrigationModes.find(m => m.name === 'Planned');
        if (!plannedMode) {
            console.warn('Planned mode not found');
            return;
        }

        this.schedulingService.getAllIrrigationPlanEntries(
            this.selectedPlan?.id,
            plannedMode.id
        )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (entries: IrrigationPlanEntry[]) => {
                    this.plannedEntries = entries;
                },
                error: (error: any) => {
                    console.error('Error loading entries:', error);
                }
            });
    }

    // ==================== Plan Management ====================

    selectPlan(plan: IrrigationPlan): void {
        this.selectedPlan = plan;
        this.loadPlannedEntries();
    }

    openNewPlanForm(): void {
        this.isEditMode = false;
        this.planForm.reset({
            id: 0,
            name: '',
            dayMask: 0,
            active: true
        });
        this.showPlanForm = true;
    }

    openEditPlanForm(plan: IrrigationPlan): void {
        this.isEditMode = true;
        this.planForm.patchValue(plan);
        this.showPlanForm = true;
    }

    savePlan(): void {
        if (!this.planForm.valid) {
            return;
        }

        const formValue = this.planForm.value;
        const userId = 1; // Get from auth service

        if (this.isEditMode) {
            const command = {
                ...formValue,
                updatedBy: userId
            };

            this.schedulingService.updateIrrigationPlan(command)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.showPlanForm = false;
                        this.loadIrrigationPlans();
                    },
                    error: (error: any) => {
                        console.error('Error updating plan:', error);
                    }
                });
        } else {
            const command = {
                name: formValue.name,
                dayMask: formValue.dayMask,
                active: formValue.active,
                createdBy: userId
            };

            this.schedulingService.createIrrigationPlan(command)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        
                        this.showPlanForm = false;
                        this.loadIrrigationPlans();
                    },
                    error: (error: any) => {
                        
                        console.error('Error creating plan:', error);
                    }
                });
        }
    }

    deletePlan(plan: IrrigationPlan): void {
        if (!confirm(`Are you sure you want to delete plan "${plan.name}"?`)) {
            return;
        }

        this.schedulingService.deleteIrrigationPlan(plan.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    
                    if (this.selectedPlan?.id === plan.id) {
                        this.selectedPlan = null;
                    }
                    this.loadIrrigationPlans();
                },
                error: (error: any) => {
                    
                    console.error('Error deleting plan:', error);
                }
            });
    }

    // ==================== Entry Management ====================

    openNewEntryForm(): void {
        if (!this.selectedPlan) {
            
            return;
        }

        const plannedMode = this.irrigationModes.find(m => m.name === 'Planned');
        if (!plannedMode) {
            
            return;
        }

        this.isEditMode = false;
        this.entryForm.reset({
            id: 0,
            irrigationPlanId: this.selectedPlan.id,
            irrigationModeId: plannedMode.id,
            startHours: 6,
            startMinutes: 0,
            duration: 30,
            wStart: null,
            wEnd: null,
            frequency: 1,
            sequence: this.plannedEntries.length + 1,
            active: true
        });
        this.showEntryForm = true;
    }

    openEditEntryForm(entry: IrrigationPlanEntry): void {
        this.isEditMode = true;
        this.selectedEntry = entry;

        // Parse time
        const timeParts = entry.startTime.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);

        this.entryForm.patchValue({
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
        this.showEntryForm = true;
    }

    saveEntry(): void {
        if (!this.entryForm.valid) {
            
            return;
        }

        const formValue = this.entryForm.value;
        const userId = 1; // Get from auth service

        const startTime = this.schedulingService.toTimeSpan(
            formValue.startHours,
            formValue.startMinutes
        );

        if (this.isEditMode) {
            const command: UpdateIrrigationPlanEntryCommand = {
                id: formValue.id,
                irrigationPlanId: formValue.irrigationPlanId,
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
                        
                        this.showEntryForm = false;
                        this.loadPlannedEntries();
                    },
                    error: (error: any) => {
                        
                        console.error('Error updating entry:', error);
                    }
                });
        } else {
            const command: CreateIrrigationPlanEntryCommand = {
                irrigationPlanId: formValue.irrigationPlanId,
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
                        
                        this.showEntryForm = false;
                        this.loadPlannedEntries();
                    },
                    error: (error: any) => {
                        
                        console.error('Error creating entry:', error);
                    }
                });
        }
    }

    deleteEntry(entry: IrrigationPlanEntry): void {
        if (!confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        this.schedulingService.deleteIrrigationPlanEntry(entry.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    
                    this.loadPlannedEntries();
                },
                error: (error: any) => {
                    
                    console.error('Error deleting entry:', error);
                }
            });
    }

    // ==================== Helper Methods ====================

    toggleDay(dayValue: number): void {
        const currentMask = this.planForm.get('dayMask')?.value || 0;
        const newMask = currentMask ^ dayValue;
        this.planForm.patchValue({ dayMask: newMask });
    }

    isDaySelected(dayValue: number): boolean {
        const dayMask = this.planForm.get('dayMask')?.value || 0;
        return (dayMask & dayValue) !== 0;
    }

    getDaysDisplay(dayMask: number): string {
        const days = this.schedulingService.dayMaskToDays(dayMask);
        if (days.length === 7) return 'Every day';
        if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) {
            return 'Weekdays';
        }
        if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
            return 'Weekends';
        }
        return days.join(', ');
    }

    formatEntryTime(entry: IrrigationPlanEntry): string {
        return this.schedulingService.formatTime(entry.startTime);
    }

    getWeekRange(entry: IrrigationPlanEntry): string {
        if (entry.wStart && entry.wEnd) {
            return `Weeks ${entry.wStart}-${entry.wEnd}`;
        }
        if (entry.wStart) {
            return `From week ${entry.wStart}`;
        }
        if (entry.wEnd) {
            return `Until week ${entry.wEnd}`;
        }
        return 'All year';
    }

    cancelForm(): void {
        this.showPlanForm = false;
        this.showEntryForm = false;
        this.selectedEntry = null;
    }

    private destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}