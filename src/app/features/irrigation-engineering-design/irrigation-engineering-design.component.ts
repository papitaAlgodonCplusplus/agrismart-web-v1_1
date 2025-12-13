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
import { IrrigationCalculationsService, IrrigationMetric, IrrigationMonitorResponse, IrrigationEventEntity, CropProductionEntity, MeasurementVariable, DeviceRawDataPoint } from '../services/irrigation-calculations.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { SubstrateCurveAnalyzerComponent } from './components/substrate-curve-analyzer/substrate-curve-analyzer.component';
import { CropProductionSpecsService, CropProductionSpecs } from '../crop-production-specs/services/crop-production-specs.service';

@Component({
  selector: 'app-irrigation-engineering-design',
  templateUrl: './irrigation-engineering-design.component.html',
  styleUrls: ['./irrigation-engineering-design.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SubstrateCurveAnalyzerComponent
  ]
})
export class IrrigationEngineeringDesignComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private currentUserId!: number;

  // ==================== UI STATE ====================
  activeTab: 'plans' | 'entries' | 'modes' | 'history' | 'metrics' | 'substrate' = 'plans';
  isLoading = false;
  isSaving = false;

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  // Modals
  showPlanModal = false;
  showEntryModal = false;
  showModeModal = false;
  showHistoryDetailsModal = false;
  showComparisonModal = false;

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



  // ==================== NEW: IRRIGATION METRICS TAB ====================
  irrigationMetrics: IrrigationMetric[] = [];
  selectedCropProductionId: number | null = null;
  metricsStartDate: string = '';
  metricsEndDate: string = '';
  isLoadingMetrics = false;
  selectedMetric: IrrigationMetric | null = null;
  cropProductions: any[] = [];

  metricsSummary = {
    totalEvents: 0,
    avgVolume: 0,
    avgDrainPercentage: 0,
    avgDurationMinutes: 0,
    avgFlow: 0,
    efficiency: 0
  };

  // Metric comparison
  metricComparison: any = null;
 

  // Crop production specifications (Container, spacing, area)
  cropProductionSpecs: CropProductionSpecs[] = [];
  selectedCropProductionSpecs: CropProductionSpecs | null = null;


  constructor(
    private fb: FormBuilder,
    private irrigationSchedulingService: IrrigationSchedulingService,
    private irrigationHistoryService: IrrigationPlanEntryHistoryService,
    private alertService: AlertService,
    private authService: AuthService,
    private irrigationCalculationsService: IrrigationCalculationsService,
    private cropProductionService: CropProductionService,
    private irrigationSectorService: IrrigationSectorService,
    private cropProductionSpecsService: CropProductionSpecsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
    this.initializeForms();
    this.loadAllData();
    this.loadCropProductions();
    this.loadCropProductionSpecs();
    this.setDefaultDateRange();
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
        next: (data: any) => {
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


  /**
   * Sort by field
   */
  sortByField(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  /**
   * Apply sorting to current data based on active tab
   */
  private applySorting(): void {
    if (!this.sortField) return;

    const sortFunction = (a: any, b: any) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];

      let comparison = 0;

      if (aValue == null && bValue == null) {
        comparison = 0;
      } else if (aValue == null) {
        comparison = 1;
      } else if (bValue == null) {
        comparison = -1;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    };

    // Apply sorting to the appropriate array based on active tab
    switch (this.activeTab) {
      case 'plans':
        this.irrigationPlans.sort(sortFunction);
        break;
      case 'entries':
        this.filteredEntries.sort(sortFunction);
        break;
      case 'modes':
        this.irrigationModes.sort(sortFunction);
        break;
      case 'history':
        this.executionHistory.sort(sortFunction);
        break;
    }
  }

  /**
   * Load crop productions for selection
   */
  private loadCropProductions(): void {
    this.cropProductionService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cropProductions) => {
        this.cropProductions = cropProductions;

        if (cropProductions.length === 0) {
          console.error('No crop productions found - user needs to create crop productions first');
          this.alertService.showWarning('No hay producciones de cultivo disponibles. Por favor, cree una producción primero.');
        }
      },
      error: (error) => {
        console.error('Error loading crop productions:', error);
        this.alertService.showError('Error al cargar producciones de cultivo');
      }
    });
  }

  /**
   * Load crop production specifications (spacing, area, container config)
   */
  private loadCropProductionSpecs(): void {
    this.cropProductionSpecsService.getAll(false).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success && response.result) {
          this.cropProductionSpecs = response.result.cropProductionSpecs || [];

          // Auto-select first active specs
          if (this.cropProductionSpecs.length > 0) {
            this.selectedCropProductionSpecs = this.cropProductionSpecs[0];
            console.log('Loaded crop production specs:', this.selectedCropProductionSpecs);
          }
        }
      },
      error: (error) => {
        console.error('Error loading crop production specs:', error);
        this.alertService.showWarning('No se pudieron cargar las especificaciones de producción. Usando valores por defecto.');
      }
    });
  }

  /**
   * Set default date range (last 7 days)
   */
  private setDefaultDateRange(): void {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    this.metricsEndDate = end.toISOString().split('T')[0];
    this.metricsStartDate = start.toISOString().split('T')[0];
  }

  /**
   * Event handler when crop production changes
   */
  onCropProductionChange(): void {
    this.loadMetrics();
  }

  /**
   * Load irrigation metrics for selected crop production
   */
  loadMetrics(): void {
    if (!this.selectedCropProductionId) {
      this.alertService.showError('Por favor seleccione una producción de cultivo');
      return;
    }

    if (!this.metricsStartDate || !this.metricsEndDate) {
      this.alertService.showError('Por favor seleccione un rango de fechas');
      return;
    }

    this.isLoadingMetrics = true;
    this.irrigationMetrics = [];

    // Get device raw data from irrigation sector service
    this.irrigationSectorService.getDeviceRawData().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoadingMetrics = false)
    ).subscribe({
      next: (rawData: any[]) => {
        // Process raw data into irrigation events
        this.processRawDataIntoMetrics(rawData);
        this.calculateMetricsSummary();
        this.alertService.showSuccess(`${this.irrigationMetrics.length} eventos de riego procesados`);
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.alertService.showError('Error al cargar métricas de riego');
      }
    });
  }

  // In irrigation-engineering-design.component.ts

  private processRawDataIntoMetrics(rawData: any[]): void {
    try {
      // Separate pressure data (for event detection) and flow data (for volume calculation)
      const pressureData: DeviceRawDataPoint[] = rawData
        .filter(d => d.sensor === 'Water_pressure_MPa' || d.sensor.includes('presion'))
        .map(d => this.convertToDeviceRawDataPoint(d));

      const flowInputData: DeviceRawDataPoint[] = rawData
        .filter(d =>
          d.sensor === 'Water_flow_value' ||
          d.sensor === 'Total_pulse' ||
          d.deviceId.includes('flujo')
        )
        .map(d => this.convertToDeviceRawDataPoint(d));

      const drainData: DeviceRawDataPoint[] = rawData
        .filter(d =>
          d.sensor.includes('rain')
        )
        .map(d => this.convertToDeviceRawDataPoint(d));

      // Use flow data as drain if no dedicated drain sensors
      const drainDataFinal = drainData.length > 0 ? drainData : flowInputData;

      console.log(`Pressure readings: ${pressureData.length}`);
      console.log(`Flow input readings: ${flowInputData.length}`);
      console.log(`Drain readings: ${drainDataFinal.length}`);

      // Use real crop production specs or fallback to defaults
      const cropProduction: CropProductionEntity = this.selectedCropProductionSpecs ? {
        id: this.selectedCropProductionId!,
        betweenRowDistance: this.selectedCropProductionSpecs.betweenRowDistance,
        betweenContainerDistance: this.selectedCropProductionSpecs.betweenContainerDistance,
        betweenPlantDistance: this.selectedCropProductionSpecs.betweenPlantDistance,
        area: this.selectedCropProductionSpecs.area,
        containerVolume: this.selectedCropProductionSpecs.containerVolume,
        availableWaterPercentage: this.selectedCropProductionSpecs.availableWaterPercentage
      } : {
        // Fallback to default values if no specs loaded
        id: this.selectedCropProductionId!,
        betweenRowDistance: 2.0,
        betweenContainerDistance: 0.5,
        betweenPlantDistance: 0.25,
        area: 1000,
        containerVolume: 10,
        availableWaterPercentage: 50
      };

      // Step 1: Detect irrigation events from pressure changes
      const irrigationEvents = this.irrigationCalculationsService.getCropProductionIrrigationEvents(
        cropProduction,
        pressureData,
        0.002 // Pressure delta threshold in MPa
      );

      console.log(`Detected ${irrigationEvents.length} irrigation events`);

      if (irrigationEvents.length === 0) {
        this.alertService.showWarning('No se detectaron eventos de riego en el período seleccionado');
        return;
      }

      // Step 2: Calculate volumes for each event using flow sensors
      const eventsWithVolumes = this.irrigationCalculationsService.getIrrigationEventsVolumes(
        irrigationEvents,
        flowInputData,
        drainDataFinal
      );

      // Step 3: Calculate metrics for each event
      this.irrigationMetrics = [];

      for (let i = 0; i < eventsWithVolumes.length; i++) {
        const currentEvent = eventsWithVolumes[i];
        const previousEvent = i > 0 ? eventsWithVolumes[i - 1] : null;

        const inputs = previousEvent
          ? [currentEvent, previousEvent]
          : [currentEvent];

        try {
          const metric = this.irrigationCalculationsService.calculateIrrigationMetrics(
            inputs,
            cropProduction
          );

          this.irrigationMetrics.push(metric);
        } catch (error) {
          console.error('Error calculating metric for event:', error);
        }
      }

      // Sort by date descending
      this.irrigationMetrics.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      console.log(`Processed ${this.irrigationMetrics.length} irrigation metrics`);
      console.log(this.irrigationMetrics);

    } catch (error) {
      console.error('Error processing raw data:', error);
      this.alertService.showError('Error al procesar datos de riego: ' + (error as Error).message);
    }
  }

  // Helper to convert raw data to typed interface
  private convertToDeviceRawDataPoint(data: any): DeviceRawDataPoint {
    return {
      id: data.id,
      recordDate: new Date(data.recordDate),
      clientId: data.clientId,
      userId: data.userId,
      deviceId: data.deviceId,
      sensor: data.sensor,
      payload: data.payload,
      summarized: data.summarized
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateMetricsSummary(): void {
    if (this.irrigationMetrics.length === 0) {
      this.metricsSummary = {
        totalEvents: 0,
        avgVolume: 0,
        avgDrainPercentage: 0,
        avgDurationMinutes: 0,
        avgFlow: 0,
        efficiency: 0
      };
      return;
    }

    const totalVolume = this.irrigationMetrics.reduce(
      (sum, m) => sum + m.irrigationVolumenTotal.value, 0
    );

    const totalDrain = this.irrigationMetrics.reduce(
      (sum, m) => sum + m.drainPercentage, 0
    );

    this.metricsSummary = {
      totalEvents: this.irrigationMetrics.length,
      avgVolume: totalVolume / this.irrigationMetrics.length,
      avgDrainPercentage: totalDrain / this.irrigationMetrics.length,
      avgDurationMinutes: this.irrigationMetrics.reduce(
        (sum, m) => sum + (m.irrigationLength / (1000 * 60)), 0
      ) / this.irrigationMetrics.length,
      avgFlow: this.irrigationMetrics.reduce(
        (sum, m) => sum + m.irrigationFlow.value, 0
      ) / this.irrigationMetrics.length,
      efficiency: 100 - (totalDrain / this.irrigationMetrics.length)
    };
  }

  /**
   * Get drain status text
   */
  getDrainStatus(drainPercentage: number): string {
    if (drainPercentage < 10) return 'Bajo (< 10%)';
    if (drainPercentage > 30) return 'Alto (> 30%)';
    return 'Óptimo (10-30%)';
  }

  /**
   * View metric details
   */
  viewMetricDetails(metric: IrrigationMetric): void {
    this.selectedMetric = metric;
    const display = this.irrigationCalculationsService.convertToDisplayFormat(metric);

    const message = `
      Fecha: ${new Date(metric.date).toLocaleString()}
      Intervalo: ${display.intervalHours || 'N/A'} horas
      Duración: ${display.lengthMinutes} minutos
      Volumen Total: ${display.totalVolume} L
      Volumen/m²: ${display.volumePerM2} L/m²
      Volumen/Planta: ${display.volumePerPlant} L
      Drenaje: ${display.drainPercentage}%
      Flujo: ${display.flowRate} L/hr
      Precipitación: ${display.precipitationRate} L/m²/hr
    `;

    this.alertService.showInfo(message.trim());
  }

  /**
   * Compare metrics
   */
  compareMetrics(metric: IrrigationMetric): void {
    if (!metric || this.irrigationMetrics.length === 0) {
      this.alertService.showWarning('No hay suficientes métricas para comparar');
      return;
    }

    // Calculate statistics from all metrics
    const stats = this.calculateMetricsStatistics();

    // Calculate deviations for the selected metric
    const comparison = {
      selectedMetric: metric,
      statistics: stats,
      deviations: this.calculateDeviations(metric, stats),
      recommendations: this.generateRecommendations(metric, stats)
    };

    this.metricComparison = comparison;
    this.showComparisonModal = true;
  }

  /**
   * Calculate statistics from all metrics
   */
  private calculateMetricsStatistics(): any {
    if (this.irrigationMetrics.length === 0) {
      return null;
    }

    const metrics = this.irrigationMetrics;

    // Extract values
    const volumes = metrics.map(m => m.irrigationVolumenTotal.value);
    const drainages = metrics.map(m => m.drainPercentage);
    const durations = metrics.map(m => m.irrigationLength / (1000 * 60)); // Convert to minutes
    const flows = metrics.map(m => m.irrigationFlow.value);
    const precipitations = metrics.map(m => m.irrigationPrecipitation.value);

    return {
      volume: {
        min: Math.min(...volumes),
        max: Math.max(...volumes),
        avg: volumes.reduce((a, b) => a + b, 0) / volumes.length,
        median: this.calculateMedian(volumes)
      },
      drainage: {
        min: Math.min(...drainages),
        max: Math.max(...drainages),
        avg: drainages.reduce((a, b) => a + b, 0) / drainages.length,
        median: this.calculateMedian(drainages)
      },
      duration: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        median: this.calculateMedian(durations)
      },
      flow: {
        min: Math.min(...flows),
        max: Math.max(...flows),
        avg: flows.reduce((a, b) => a + b, 0) / flows.length,
        median: this.calculateMedian(flows)
      },
      precipitation: {
        min: Math.min(...precipitations),
        max: Math.max(...precipitations),
        avg: precipitations.reduce((a, b) => a + b, 0) / precipitations.length,
        median: this.calculateMedian(precipitations)
      }
    };
  }

  /**
   * Calculate median value
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate deviations from statistics
   */
  private calculateDeviations(metric: IrrigationMetric, stats: any): any {
    const volumeDeviation = ((metric.irrigationVolumenTotal.value - stats.volume.avg) / stats.volume.avg) * 100;
    const drainageDeviation = ((metric.drainPercentage - stats.drainage.avg) / stats.drainage.avg) * 100;
    const durationDeviation = (((metric.irrigationLength / (1000 * 60)) - stats.duration.avg) / stats.duration.avg) * 100;
    const flowDeviation = ((metric.irrigationFlow.value - stats.flow.avg) / stats.flow.avg) * 100;

    return {
      volume: {
        value: volumeDeviation,
        status: this.getDeviationStatus(volumeDeviation)
      },
      drainage: {
        value: drainageDeviation,
        status: this.getDrainageDeviationStatus(metric.drainPercentage, drainageDeviation)
      },
      duration: {
        value: durationDeviation,
        status: this.getDeviationStatus(durationDeviation)
      },
      flow: {
        value: flowDeviation,
        status: this.getDeviationStatus(flowDeviation)
      }
    };
  }

  /**
   * Get deviation status (normal, warning, critical)
   */
  private getDeviationStatus(deviation: number): string {
    const absDeviation = Math.abs(deviation);
    if (absDeviation < 10) return 'normal';
    if (absDeviation < 25) return 'warning';
    return 'critical';
  }

  /**
   * Get drainage deviation status (considering optimal range 15-25%)
   */
  private getDrainageDeviationStatus(drainPercentage: number, _deviation: number): string {
    // Optimal drainage is 15-25%
    if (drainPercentage >= 15 && drainPercentage <= 25) {
      return 'optimal';
    } else if (drainPercentage < 10 || drainPercentage > 30) {
      return 'critical';
    }
    return 'warning';
  }

  /**
   * Generate recommendations based on deviations
   */
  private generateRecommendations(metric: IrrigationMetric, stats: any): string[] {
    const recommendations: string[] = [];
    const volumeDeviation = ((metric.irrigationVolumenTotal.value - stats.volume.avg) / stats.volume.avg) * 100;

    // Volume recommendations
    if (Math.abs(volumeDeviation) > 25) {
      if (volumeDeviation > 0) {
        recommendations.push('El volumen de riego es significativamente mayor al promedio. Considere reducir el tiempo de riego.');
      } else {
        recommendations.push('El volumen de riego es significativamente menor al promedio. Verifique si las plantas están recibiendo suficiente agua.');
      }
    }

    // Drainage recommendations
    if (metric.drainPercentage < 10) {
      recommendations.push('Drenaje muy bajo (<10%). Aumente el volumen de riego para alcanzar 15-25% de drenaje óptimo.');
    } else if (metric.drainPercentage > 30) {
      recommendations.push('Drenaje muy alto (>30%). Reduzca el volumen de riego para evitar desperdicio de agua y nutrientes.');
    } else if (metric.drainPercentage >= 15 && metric.drainPercentage <= 25) {
      recommendations.push('Drenaje en rango óptimo (15-25%). Mantenga esta configuración.');
    }

    // Flow recommendations
    const flowDeviation = ((metric.irrigationFlow.value - stats.flow.avg) / stats.flow.avg) * 100;
    if (Math.abs(flowDeviation) > 20) {
      recommendations.push('Flujo de riego irregular. Verifique goteros y presión del sistema.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Todos los parámetros están dentro de rangos normales.');
    }

    return recommendations;
  }

  /**
   * Close comparison modal
   */
  closeComparisonModal(): void {
    this.showComparisonModal = false;
    this.metricComparison = null;
  }

  /**
   * Update existing setActiveTab to include 'metrics' and 'substrate'
   */
  setActiveTab(tab: 'plans' | 'entries' | 'modes' | 'history' | 'metrics' | 'substrate'): void {
    this.activeTab = tab as any;
    this.sortField = '';
    this.sortDirection = 'asc';

    if (tab === 'history') {
      this.loadExecutionHistory();
    } else if (tab === 'metrics') {
      if (this.selectedCropProductionId) {
        this.loadMetrics();
      }
    }
  }
}