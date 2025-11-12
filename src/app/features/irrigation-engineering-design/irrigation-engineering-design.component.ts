// src/app/features/irrigation-engineering-design/irrigation-engineering-design.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

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
import { 
  IrrigationPlanEntryHistoryService,
  IrrigationPlanEntryHistory
} from '../services/irrigation-plan-entry-history.service';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/auth/auth.service';

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
  private currentUserId!: number;

  // ==================== UI STATE ====================
  activeTab: 'plans' | 'entries' | 'modes' | 'history' = 'plans';
  isLoading = false;
  isSaving = false;

  // Modals
  showPlanModal = false;
  showEntryModal = false;
  showModeModal = false;
  showHistoryDetailsModal = false;

  // Edit Mode
  isEditMode = false;

  // ==================== DATA COLLECTIONS ====================
  // Plans and Configuration
  irrigationPlans: IrrigationPlan[] = [];
  irrigationModes: IrrigationMode[] = [];
  irrigationEntries: IrrigationPlanEntry[] = []; // These are the TEMPLATES/SCHEDULES
  
  // Execution History
  executionHistory: IrrigationPlanEntryHistory[] = []; // These are the ACTUAL EXECUTIONS

  // Filtered Data
  filteredEntries: IrrigationPlanEntry[] = [];
  filteredHistory: IrrigationPlanEntryHistory[] = [];

  // ==================== SELECTED ITEMS ====================
  selectedPlan: IrrigationPlan | null = null;
  selectedEntry: IrrigationPlanEntry | null = null;
  selectedMode: IrrigationMode | null = null;
  selectedHistoryRecord: IrrigationPlanEntryHistory | null = null;

  // ==================== FORMS ====================
  planForm!: FormGroup;
  entryForm!: FormGroup;
  modeForm!: FormGroup;

  // ==================== FILTERS ====================
  filterPlanId: number | null = null;
  filterModeId: number | null = null;
  filterStatus: string = '';
  filterDateFrom: string = '';
  filterDateTo: string = '';

  // ==================== DAYS OF WEEK ====================
  daysOfWeek = [
    { bit: 1, name: 'Domingo', abbr: 'Dom' },
    { bit: 2, name: 'Lunes', abbr: 'Lun' },
    { bit: 4, name: 'Martes', abbr: 'Mar' },
    { bit: 8, name: 'Miércoles', abbr: 'Mié' },
    { bit: 16, name: 'Jueves', abbr: 'Jue' },
    { bit: 32, name: 'Viernes', abbr: 'Vie' },
    { bit: 64, name: 'Sábado', abbr: 'Sáb' }
  ];

  constructor(
    private fb: FormBuilder,
    private irrigationSchedulingService: IrrigationSchedulingService,
    private irrigationHistoryService: IrrigationPlanEntryHistoryService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.initializeForms();
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================
  private getCurrentUser(): void {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  private initializeForms(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      dayMask: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });

    this.entryForm = this.fb.group({
      irrigationPlanId: [null, Validators.required],
      irrigationModeId: [null, Validators.required],
      startTime: ['08:00', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      duration: [30, [Validators.required, Validators.min(1)]],
      wStart: [null, [Validators.min(1), Validators.max(52)]],
      wEnd: [null, [Validators.min(1), Validators.max(52)]],
      frequency: [null, Validators.min(1)],
      sequence: [1, [Validators.required, Validators.min(1)]],
      active: [true]
    });

    this.modeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      active: [true]
    });
  }

  private loadAllData(): void {
    this.isLoading = true;
    forkJoin({
      plansAndEntries: this.irrigationSchedulingService.getAllIrrigationPlansWithEntries(),
      modes: this.irrigationSchedulingService.getAllIrrigationModes(),
      history: this.irrigationHistoryService.getAll()
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data:any) => {
          this.irrigationPlans = data.plansAndEntries.irrigationPlans || [];
          this.irrigationEntries = data.plansAndEntries.irrigationPlanEntries || [];
          this.irrigationModes = data.modes.irrigationModes || [];
          this.executionHistory = data.history || [];
          
          this.filteredEntries = [...this.irrigationEntries];
          this.filteredHistory = [...this.executionHistory];
        },
        error: (error) => {
          console.error('Error loading data:', error);
          
        }
      });
  }

  // ==================== TAB NAVIGATION ====================
  setActiveTab(tab: 'plans' | 'entries' | 'modes' | 'history'): void {
    this.activeTab = tab;
    
    if (tab === 'history') {
      this.loadExecutionHistory();
    }
  }

  // ==================== PLAN OPERATIONS ====================
  openPlanModal(plan?: IrrigationPlan): void {
    this.isEditMode = !!plan;
    this.selectedPlan = plan || null;

    if (plan) {
      this.planForm.patchValue({
        name: plan.name,
        dayMask: plan.dayMask,
        active: plan.active
      });
    } else {
      this.planForm.reset({ dayMask: 0, active: true });
    }

    this.showPlanModal = true;
  }

  closePlanModal(): void {
    this.showPlanModal = false;
    this.selectedPlan = null;
    this.planForm.reset({ dayMask: 0, active: true });
  }

  savePlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.planForm.value;

    if (this.isEditMode && this.selectedPlan) {
      const updateCommand: UpdateIrrigationPlanCommand = {
        id: this.selectedPlan.id,
        name: formValue.name,
        dayMask: formValue.dayMask,
        active: formValue.active,
        updatedBy: this.currentUserId
      };

      this.irrigationSchedulingService.updateIrrigationPlan(updateCommand)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: () => {
            
            this.closePlanModal();
            this.loadAllData();
          },
          error: (error) => {
            console.error('Error updating plan:', error);
            
          }
        });
    } else {
      const createCommand: CreateIrrigationPlanCommand = {
        name: formValue.name,
        dayMask: formValue.dayMask,
        active: formValue.active,
        createdBy: this.currentUserId
      };

      this.irrigationSchedulingService.createIrrigationPlan(createCommand)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: () => {
            
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
    if (!confirm(`¿Está seguro de eliminar el plan "${plan.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.irrigationSchedulingService.deleteIrrigationPlan(plan.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          
          this.loadAllData();
        },
        error: (error) => {
          console.error('Error deleting plan:', error);
          
        }
      });
  }

  // ==================== ENTRY OPERATIONS ====================
  openEntryModal(entry?: IrrigationPlanEntry): void {
    this.isEditMode = !!entry;
    this.selectedEntry = entry || null;

    if (entry) {
      const timeString = entry.startTime.substring(0, 5); // "HH:mm:ss" -> "HH:mm"
      
      this.entryForm.patchValue({
        irrigationPlanId: entry.irrigationPlanId,
        irrigationModeId: entry.irrigationModeId,
        startTime: timeString,
        duration: entry.duration,
        wStart: entry.wStart,
        wEnd: entry.wEnd,
        frequency: entry.frequency,
        sequence: entry.sequence,
        active: entry.active
      });
    } else {
      this.entryForm.reset({
        startTime: '08:00',
        duration: 30,
        sequence: 1,
        active: true
      });
    }

    this.showEntryModal = true;
  }

  closeEntryModal(): void {
    this.showEntryModal = false;
    this.selectedEntry = null;
    this.entryForm.reset({
      startTime: '08:00',
      duration: 30,
      sequence: 1,
      active: true
    });
  }

  saveEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.entryForm.value;
    const startTimeString = `${formValue.startTime}:00`;

    if (this.isEditMode && this.selectedEntry) {
      const updateCommand: UpdateIrrigationPlanEntryCommand = {
        id: this.selectedEntry.id,
        irrigationPlanId: formValue.irrigationPlanId,
        irrigationModeId: formValue.irrigationModeId,
        startTime: startTimeString,
        duration: formValue.duration,
        wStart: formValue.wStart,
        wEnd: formValue.wEnd,
        frequency: formValue.frequency,
        sequence: formValue.sequence,
        active: formValue.active,
        updatedBy: this.currentUserId
      };

      this.irrigationSchedulingService.updateIrrigationPlanEntry(updateCommand)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: () => {
            
            this.closeEntryModal();
            this.loadAllData();
          },
          error: (error) => {
            console.error('Error updating entry:', error);
            
          }
        });
    } else {
      const createCommand: CreateIrrigationPlanEntryCommand = {
        irrigationPlanId: formValue.irrigationPlanId,
        irrigationModeId: formValue.irrigationModeId,
        startTime: startTimeString,
        duration: formValue.duration,
        wStart: formValue.wStart,
        wEnd: formValue.wEnd,
        frequency: formValue.frequency,
        sequence: formValue.sequence,
        active: formValue.active,
        createdBy: this.currentUserId
      };

      this.irrigationSchedulingService.createIrrigationPlanEntry(createCommand)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: () => {
            
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
    if (!confirm(`¿Está seguro de eliminar esta entrada de programación?`)) {
      return;
    }

    this.isLoading = true;
    this.irrigationSchedulingService.deleteIrrigationPlanEntry(entry.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          
          this.loadAllData();
        },
        error: (error) => {
          console.error('Error deleting entry:', error);
          
        }
      });
  }

  // ==================== MODE OPERATIONS ====================
  openModeModal(mode?: IrrigationMode): void {
    this.isEditMode = !!mode;
    this.selectedMode = mode || null;

    if (mode) {
      this.modeForm.patchValue({
        name: mode.name,
        active: mode.active
      });
    } else {
      this.modeForm.reset({ active: true });
    }

    this.showModeModal = true;
  }

  closeModeModal(): void {
    this.showModeModal = false;
    this.selectedMode = null;
    this.modeForm.reset({ active: true });
  }

  saveMode(): void {
    if (this.modeForm.invalid) {
      this.modeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.modeForm.value;

    if (this.isEditMode && this.selectedMode) {
      const updateCommand = {
        id: this.selectedMode.id,
        name: formValue.name,
        active: formValue.active,
        updatedBy: this.currentUserId
      };

      // this.irrigationSchedulingService.updateIrrigationMode(updateCommand)
      //   .pipe(
      //     takeUntil(this.destroy$),
      //     finalize(() => this.isSaving = false)
      //   )
      //   .subscribe({
      //     next: () => {
            
      //       this.closeModeModal();
      //       this.loadAllData();
      //     },
      //     error: (error) => {
      //       console.error('Error updating mode:', error);
            
      //     }
      //   });
    } else {
      const createCommand = {
        name: formValue.name,
        active: formValue.active,
        createdBy: this.currentUserId
      };

      // this.irrigationSchedulingService.createIrrigationMode(createCommand)
      //   .pipe(
      //     takeUntil(this.destroy$),
      //     finalize(() => this.isSaving = false)
      //   )
      //   .subscribe({
      //     next: () => {
            
      //       this.closeModeModal();
      //       this.loadAllData();
      //     },
      //     error: (error) => {
      //       console.error('Error creating mode:', error);
            
      //     }
      //   });
    }
  }

  deleteMode(mode: IrrigationMode): void {
    if (!confirm(`¿Está seguro de eliminar el modo "${mode.name}"?`)) {
      return;
    }

    this.isLoading = true;
    // this.irrigationSchedulingService.deleteIrrigationMode(mode.id)
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     finalize(() => this.isLoading = false)
    //   )
    //   .subscribe({
    //     next: () => {
          
    //       this.loadAllData();
    //     },
    //     error: (error) => {
    //       console.error('Error deleting mode:', error);
          
    //     }
    //   });
  }

  // ==================== EXECUTION HISTORY OPERATIONS ====================
  loadExecutionHistory(): void {
    this.isLoading = true;
    this.irrigationHistoryService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (history) => {
          this.executionHistory = history || [];
          this.applyHistoryFilters();
        },
        error: (error) => {
          console.error('Error loading execution history:', error);
          
        }
      });
  }

  viewHistoryDetails(historyRecord: IrrigationPlanEntryHistory): void {
    this.selectedHistoryRecord = historyRecord;
    this.showHistoryDetailsModal = true;
  }

  closeHistoryDetailsModal(): void {
    this.showHistoryDetailsModal = false;
    this.selectedHistoryRecord = null;
  }

  // ==================== FILTERS ====================
  applyEntryFilters(): void {
    this.filteredEntries = this.irrigationEntries.filter(entry => {
      let matches = true;

      if (this.filterPlanId) {
        matches = matches && entry.irrigationPlanId === this.filterPlanId;
      }

      if (this.filterModeId) {
        matches = matches && entry.irrigationModeId === this.filterModeId;
      }

      return matches;
    });
  }

  applyHistoryFilters(): void {
    this.filteredHistory = this.executionHistory.filter(record => {
      let matches = true;

      if (this.filterPlanId) {
        matches = matches && record.irrigationPlanId === this.filterPlanId;
      }

      if (this.filterModeId) {
        matches = matches && record.irrigationModeId === this.filterModeId;
      }

      if (this.filterStatus) {
        matches = matches && record.executionStatus === this.filterStatus;
      }

      if (this.filterDateFrom) {
        const recordDate = new Date(record.executionStartTime);
        const filterDate = new Date(this.filterDateFrom);
        matches = matches && recordDate >= filterDate;
      }

      if (this.filterDateTo) {
        const recordDate = new Date(record.executionStartTime);
        const filterDate = new Date(this.filterDateTo);
        filterDate.setHours(23, 59, 59, 999);
        matches = matches && recordDate <= filterDate;
      }

      return matches;
    });
  }

  clearFilters(): void {
    this.filterPlanId = null;
    this.filterModeId = null;
    this.filterStatus = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    
    if (this.activeTab === 'entries') {
      this.filteredEntries = [...this.irrigationEntries];
    } else if (this.activeTab === 'history') {
      this.filteredHistory = [...this.executionHistory];
    }
  }

  // ==================== HELPER METHODS ====================
  getPlanName(planId: number): string {
    const plan = this.irrigationPlans.find(p => p.id === planId);
    return plan ? plan.name : 'N/A';
  }

  getModeName(modeId: number): string {
    const mode = this.irrigationModes.find(m => m.id === modeId);
    return mode ? mode.name : 'N/A';
  }

  getDaysFromMask(dayMask: number): string {
    const selectedDays = this.daysOfWeek
      .filter(day => (dayMask & day.bit) === day.bit)
      .map(day => day.abbr);
    
    return selectedDays.length > 0 ? selectedDays.join(', ') : 'Ninguno';
  }

  toggleDay(event: any): void {
    const dayBit = parseInt(event.target.value);
    const currentMask = this.planForm.get('dayMask')?.value || 0;
    
    if (event.target.checked) {
      this.planForm.patchValue({ dayMask: currentMask | dayBit });
    } else {
      this.planForm.patchValue({ dayMask: currentMask & ~dayBit });
    }
  }

  isDaySelected(dayBit: number): boolean {
    const currentMask = this.planForm.get('dayMask')?.value || 0;
    return (currentMask & dayBit) === dayBit;
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // "HH:mm:ss" -> "HH:mm"
  }

  formatDateTime(dateTime: string | Date): string {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('es-ES');
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Scheduled': 'bg-info',
      'InProgress': 'bg-warning',
      'Completed': 'bg-success',
      'Failed': 'bg-danger',
      'Cancelled': 'bg-secondary'
    };
    return statusMap[status] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Scheduled': 'Programado',
      'InProgress': 'En Progreso',
      'Completed': 'Completado',
      'Failed': 'Fallido',
      'Cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  // ==================== EXPORT ====================
  exportToCSV(): void {
    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    if (this.activeTab === 'plans') {
      headers = ['ID', 'Nombre', 'Días', 'Activo', 'Fecha Creación'];
      data = this.irrigationPlans.map(plan => [
        plan.id,
        plan.name,
        this.getDaysFromMask(plan.dayMask),
        plan.active ? 'Sí' : 'No',
        this.formatDate(plan.dateCreated)
      ]);
      filename = 'planes-riego.csv';
    } else if (this.activeTab === 'entries') {
      headers = ['ID', 'Plan', 'Modo', 'Hora Inicio', 'Duración (min)', 'Secuencia', 'Activo'];
      data = this.filteredEntries.map(entry => [
        entry.id,
        this.getPlanName(entry.irrigationPlanId),
        this.getModeName(entry.irrigationModeId),
        this.formatTime(entry.startTime),
        entry.duration,
        entry.sequence,
        entry.active ? 'Sí' : 'No'
      ]);
      filename = 'entradas-programacion.csv';
    } else if (this.activeTab === 'modes') {
      headers = ['ID', 'Nombre', 'Activo', 'Fecha Creación'];
      data = this.irrigationModes.map(mode => [
        mode.id,
        mode.name,
        mode.active ? 'Sí' : 'No',
        this.formatDate(mode.dateCreated)
      ]);
      filename = 'modos-riego.csv';
    } else if (this.activeTab === 'history') {
      headers = ['ID', 'Plan', 'Modo', 'Inicio Ejecución', 'Fin Ejecución', 'Duración Planificada', 'Duración Real', 'Estado', 'Manual'];
      data = this.filteredHistory.map(record => [
        record.id,
        this.getPlanName(record.irrigationPlanId),
        this.getModeName(record.irrigationModeId),
        this.formatDateTime(record.executionStartTime),
        record.executionEndTime ? this.formatDateTime(record.executionEndTime) : 'N/A',
        record.plannedDuration,
        record.actualDuration || 'N/A',
        this.getStatusLabel(record.executionStatus),
        record.isManualExecution ? 'Sí' : 'No'
      ]);
      filename = 'historial-ejecuciones.csv';
    }

    if (data.length === 0) {
      
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}