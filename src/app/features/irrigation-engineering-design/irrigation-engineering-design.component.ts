// src/app/features/irrigation-scheduling/irrigation-engineering-design.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

// Services
import {
  IrrigationSchedulingService,
  IrrigationPlan,
  IrrigationMode,
  IrrigationPlanEntry,
  CreateIrrigationPlanCommand,
  UpdateIrrigationPlanCommand,
  CreateIrrigationPlanEntryCommand,
  UpdateIrrigationPlanEntryCommand
} from '../services/irrigation-scheduling.service';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-irrigation-scheduling',
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

  // UI State
  activeTab: 'plans' | 'entries' | 'modes' = 'plans';
  isLoading = false;
  isSaving = false;

  // Modals
  showPlanModal = false;
  showEntryModal = false;
  showModeModal = false;

  // Edit Mode
  isEditMode = false;

  // Data Collections
  irrigationPlans: IrrigationPlan[] = [];
  irrigationModes: IrrigationMode[] = [];
  irrigationEntries: IrrigationPlanEntry[] = [];
  filteredEntries: IrrigationPlanEntry[] = [];

  // Selected Items
  selectedPlan: IrrigationPlan | null = null;
  selectedEntry: IrrigationPlanEntry | null = null;
  selectedMode: IrrigationMode | null = null;

  // Forms
  planForm!: FormGroup;
  entryForm!: FormGroup;
  modeForm!: FormGroup;

  // Filters
  filterPlanId: number | null = null;
  filterModeId: number | null = null;
  filterActive: boolean | null = null;

  // Days of week for dayMask
  daysOfWeek = [
    { name: 'Lunes', value: 1, checked: false },
    { name: 'Martes', value: 2, checked: false },
    { name: 'Miércoles', value: 4, checked: false },
    { name: 'Jueves', value: 8, checked: false },
    { name: 'Viernes', value: 16, checked: false },
    { name: 'Sábado', value: 32, checked: false },
    { name: 'Domingo', value: 64, checked: false }
  ];

  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private schedulingService: IrrigationSchedulingService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeForms(): void {
    this.planForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      dayMask: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });

    this.entryForm = this.fb.group({
      id: [0],
      irrigationPlanId: [null, Validators.required],
      irrigationModeId: [null, Validators.required],
      startTime: ['', Validators.required],
      duration: [30, [Validators.required, Validators.min(1)]],
      wStart: [null, [Validators.min(1), Validators.max(52)]],
      wEnd: [null, [Validators.min(1), Validators.max(52)]],
      frequency: [null, [Validators.min(1)]],
      sequence: [1, [Validators.required, Validators.min(1)]],
      active: [true]
    });

    this.modeForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      active: [true]
    });
  }

  private loadAllData(): void {
    this.isLoading = true;

    forkJoin({
      plans: this.schedulingService.getAllIrrigationPlansWithEntries().pipe(catchError(() => of([]))),
      modes: this.schedulingService.getAllIrrigationModes().pipe(catchError(() => of([]))),
      entries: this.schedulingService.getAllIrrigationPlanEntries().pipe(catchError(() => of([])))
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: any) => {
          console.log('Data loaded: ', data);
          this.irrigationPlans = Array.isArray(data.plans.irrigationPlans) ? data.plans.irrigationPlans : [];
          this.irrigationModes = Array.isArray(data.modes.irrigationModes) ? data.modes.irrigationModes : [];
          this.irrigationEntries = Array.isArray(data.entries.irrigationPlanEntries) ? data.entries.irrigationPlanEntries : [];
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.irrigationPlans = [];
          this.irrigationModes = [];
          this.irrigationEntries = [];
        }
      });
  }

  // ==================== TAB MANAGEMENT ====================

  setActiveTab(tab: 'plans' | 'entries' | 'modes'): void {
    this.activeTab = tab;
  }

  // ==================== IRRIGATION PLAN METHODS ====================

  openPlanModal(plan?: IrrigationPlan): void {
    this.isEditMode = !!plan;

    if (plan) {
      this.selectedPlan = plan;
      this.planForm.patchValue(plan);
      this.updateDaysFromMask(plan.dayMask);
    } else {
      this.selectedPlan = null;
      this.planForm.reset({ id: 0, active: true, dayMask: 0 });
      this.resetDays();
    }

    this.showPlanModal = true;
  }

  closePlanModal(): void {
    this.showPlanModal = false;
    this.planForm.reset();
    this.selectedPlan = null;
    this.resetDays();
  }

  savePlan(): void {
    if (this.planForm.invalid) {
      console.error('Plan form is invalid: ', this.planForm.errors);
      return;
    }

    const dayMask = this.calculateDayMask();
    const formValue = this.planForm.value;
    const userId = this.getCurrentUserId();

    this.isSaving = true;

    if (this.isEditMode && formValue.id) {
      // Update existing plan
      const command: UpdateIrrigationPlanCommand = {
        id: formValue.id,
        name: formValue.name,
        dayMask: dayMask,
        active: formValue.active,
        updatedBy: userId
      };

      console.log('Updating plan with command:', command);
      this.schedulingService.updateIrrigationPlan(command)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Plan updated successfully: ', response);
            this.closePlanModal();
            this.loadAllData();
          },
          error: (error) => {
            console.error('Error updating plan:', error);

          }
        });
    } else {
      // Create new plan
      const command: CreateIrrigationPlanCommand = {
        name: formValue.name,
        dayMask: dayMask,
        active: formValue.active,
        createdBy: userId
      };

      console.log('Creating plan with command:', command);
      this.schedulingService.createIrrigationPlan(command)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Plan created successfully: ', response);
            this.closePlanModal();
            this.loadAllData();
          },
          error: (error) => {
            console.error('Error creating plan:', error);

          }
        });
    }
  }

  deletePlan(plan: IrrigationPlan): void {
    if (!confirm(`¿Está seguro de que desea eliminar el plan "${plan.name}"?`)) {
      return;
    }

    this.schedulingService.deleteIrrigationPlan(plan.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {

          this.loadAllData();
        },
        error: (error) => {
          console.error('Error deleting plan:', error);

        }
      });
  }

  // ==================== IRRIGATION PLAN ENTRY METHODS ====================

  openEntryModal(entry?: IrrigationPlanEntry): void {
    this.isEditMode = !!entry;

    if (entry) {
      this.selectedEntry = entry;
      this.entryForm.patchValue({
        ...entry,
        startTime: this.formatTimeForInput(entry.startTime)
      });
    } else {
      this.selectedEntry = null;
      this.entryForm.reset({
        id: 0,
        duration: 30,
        sequence: 1,
        active: true
      });
    }

    this.showEntryModal = true;
  }

  closeEntryModal(): void {
    this.showEntryModal = false;
    this.entryForm.reset();
    this.selectedEntry = null;
  }

  saveEntry(): void {
    if (this.entryForm.invalid) {

      return;
    }

    const formValue = this.entryForm.value;
    const userId = this.getCurrentUserId();
    const startTime = this.convertToTimeSpan(formValue.startTime);

    this.isSaving = true;

    if (this.isEditMode && formValue.id) {
      // Update existing entry
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

      console.log('Updating entry with command:', command);
      this.schedulingService.updateIrrigationPlanEntry(command)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (res) => {
            console.log('Entry updated successfully: ', res);
            this.closeEntryModal();
            this.loadAllData();
          },
          error: (error) => {
            console.error('Error updating entry:', error);

          }
        });
    } else {
      // Create new entry
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

      console.log('Creating entry with command:', command);
      this.schedulingService.createIrrigationPlanEntry(command)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Entry created successfully: ', response);
            this.closeEntryModal();
            this.loadAllData();
          },
          error: (error) => {
            console.error('Error creating entry:', error);

          }
        });
    }
  }

  deleteEntry(entry: IrrigationPlanEntry): void {
    if (!confirm(`¿Está seguro de que desea eliminar esta entrada de programación?`)) {
      return;
    }

    this.schedulingService.deleteIrrigationPlanEntry(entry.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {

          this.loadAllData();
        },
        error: (error) => {
          console.error('Error deleting entry:', error);

        }
      });
  }

  // ==================== IRRIGATION MODE METHODS ====================

  openModeModal(mode?: IrrigationMode): void {
    this.isEditMode = !!mode;

    if (mode) {
      this.selectedMode = mode;
      this.modeForm.patchValue(mode);
    } else {
      this.selectedMode = null;
      this.modeForm.reset({ id: 0, active: true });
    }

    this.showModeModal = true;
  }

  closeModeModal(): void {
    this.showModeModal = false;
    this.modeForm.reset();
    this.selectedMode = null;
  }

  saveMode(): void {
    if (this.modeForm.invalid) {

      return;
    }

    const formValue = this.modeForm.value;
    const userId = this.getCurrentUserId();

    this.isSaving = true;

    if (this.isEditMode && formValue.id) {
      // Note: The service doesn't have update/create mode methods yet
      // You'll need to add these to IrrigationSchedulingService

      this.closeModeModal();
      this.isSaving = false;
    } else {

      this.closeModeModal();
      this.isSaving = false;
    }
  }

  // ==================== FILTER METHODS ====================

  applyFilters(): void {
    let filtered = [...this.irrigationEntries];

    if (this.filterPlanId) {
      filtered = filtered.filter(e => e.irrigationPlanId === this.filterPlanId);
    }

    if (this.filterModeId) {
      filtered = filtered.filter(e => e.irrigationModeId === this.filterModeId);
    }

    if (this.filterActive !== null) {
      filtered = filtered.filter(e => e.active === this.filterActive);
    }

    this.filteredEntries = filtered;
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
  }

  clearFilters(): void {
    this.filterPlanId = null;
    this.filterModeId = null;
    this.filterActive = null;
    this.applyFilters();
  }

  // ==================== UTILITY METHODS ====================

  private getCurrentUserId(): number {
    // Get from auth service or return default
    return 1; // TODO: Get from AuthService
  }

  private calculateDayMask(): number {
    return this.daysOfWeek
      .filter(day => day.checked)
      .reduce((mask, day) => mask | day.value, 0);
  }

  getEntriesCountByMode(modeId: number): number {
    return this.irrigationEntries
      ? this.irrigationEntries.filter((entry: any) => entry.irrigationModeId === modeId).length
      : 0;
  }

  private updateDaysFromMask(dayMask: number): void {
    this.daysOfWeek.forEach(day => {
      day.checked = (dayMask & day.value) !== 0;
    });
  }

  private resetDays(): void {
    this.daysOfWeek.forEach(day => day.checked = false);
  }

  getDaysDisplay(dayMask: number): string {
    const days = this.schedulingService.dayMaskToDays(dayMask);
    const daysInSpanish: { [key: string]: string } = {
      'Monday': 'Lun',
      'Tuesday': 'Mar',
      'Wednesday': 'Mié',
      'Thursday': 'Jue',
      'Friday': 'Vie',
      'Saturday': 'Sáb',
      'Sunday': 'Dom'
    };

    return days.map(d => daysInSpanish[d] || d).join(', ') || 'Ninguno';
  }

  formatTimeDisplay(timeSpan: string): string {
    return this.schedulingService.formatTime(timeSpan);
  }

  private formatTimeForInput(timeSpan: string): string {
    // Convert "HH:mm:ss" to "HH:mm" for input type="time"
    const parts = timeSpan.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeSpan;
  }

  private convertToTimeSpan(time: string): string {
    // Convert "HH:mm" to "HH:mm:ss"
    const parts = time.split(':');
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}:00`;
    }
    return time;
  }

  getStatusBadgeClass(active: boolean): string {
    return active ? 'badge bg-success' : 'badge bg-secondary';
  }

  getStatusText(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

  getPlanName(planId: number): string {
    const plan = this.irrigationPlans.find(p => p.id === planId);
    return plan ? plan.name : 'N/A';
  }

  getModeName(modeId: number): string {
    const mode = this.irrigationModes.find(m => m.id === modeId);
    return mode ? mode.name : 'N/A';
  }

  // ==================== PAGINATION ====================

  get paginatedEntries(): IrrigationPlanEntry[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredEntries.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ==================== EXPORT ====================

  exportToExcel(): void {
    // Generate CSV for entries
    const headers = ['Plan', 'Modo', 'Hora Inicio', 'Duración (min)', 'Secuencia', 'Activo'];
    const rows = this.filteredEntries.map(entry => [
      this.getPlanName(entry.irrigationPlanId),
      this.getModeName(entry.irrigationModeId),
      this.formatTimeDisplay(entry.startTime),
      entry.duration.toString(),
      entry.sequence.toString(),
      entry.active ? 'Sí' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'programacion-riego.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);


  }
}