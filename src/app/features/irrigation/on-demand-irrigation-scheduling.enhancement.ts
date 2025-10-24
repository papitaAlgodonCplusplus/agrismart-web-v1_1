// src/app/features/irrigation/on-demand-irrigation-scheduling.enhancement.ts
// This file contains the on-demand scheduling-specific logic to be integrated into the main component

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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