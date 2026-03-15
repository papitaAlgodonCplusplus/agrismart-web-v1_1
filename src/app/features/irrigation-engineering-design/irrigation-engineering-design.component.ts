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
import { CompanyService } from '../companies/services/company.service';
import { CropService } from '../crops/services/crop.service';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/auth/auth.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { SubstrateCurveAnalyzerComponent } from './components/substrate-curve-analyzer/substrate-curve-analyzer.component';

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
  activeTab: 'plans' | 'entries' | 'modes' | 'history' | 'substrate' | 'sectors' = 'plans';
  isLoading = false;
  isSaving = false;

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  // Modals
  showPlanModal = false;
  showEntryModal = false;
  showModeModal = false;
  showSectorModal = false;
  showHistoryDetailsModal = false;

  // Edit Mode
  isEditMode = false;

  // ==================== DATA COLLECTIONS ====================
  // Plans and Configuration
  irrigationPlans: IrrigationPlan[] = [];
  irrigationModes: IrrigationMode[] = [];
  irrigationEntries: IrrigationPlanEntry[] = []; // These are the TEMPLATES/SCHEDULES

  // Execution History (derived from IrrigationPlanEntry)
  executionHistory: IrrigationPlanEntry[] = [];

  // Filtered Data
  filteredEntries: IrrigationPlanEntry[] = [];
  filteredHistory: IrrigationPlanEntry[] = [];

  // Lookup data for valve identification
  sectors: any[] = [];
  companies: any[] = [];
  crops: any[] = [];

  // ==================== SECTOR / VALVE MANAGEMENT ====================
  irrigationSectors: any[] = [];
  relayModules: any[] = [];
  selectedSector: any | null = null;
  selectedRelayModule: any | null = null;
  sectorForm!: FormGroup;
  relayModuleForm!: FormGroup;
  isLoadingSectors = false;
  isLoadingRelays = false;
  showRelayModuleModal = false;

  // ==================== SELECTED ITEMS ====================
  selectedPlan: IrrigationPlan | null = null;
  selectedEntry: IrrigationPlanEntry | null = null;
  selectedMode: IrrigationMode | null = null;
  selectedHistoryRecord: IrrigationPlanEntry | null = null;

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

  // Used by sectors modal crop production dropdown
  cropProductions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private irrigationSchedulingService: IrrigationSchedulingService,
    private companyService: CompanyService,
    private cropService: CropService,
    private alertService: AlertService,
    private authService: AuthService,
    private cropProductionService: CropProductionService,
    private irrigationSectorService: IrrigationSectorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
    this.initializeForms();
    this.loadAllData();
    this.loadCropProductions();
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
      executionDate: [null, Validators.required],
      duration: [30, [Validators.required, Validators.min(1)]],
      wStart: [null, [Validators.min(1), Validators.max(52)]],
      wEnd: [null, [Validators.min(1), Validators.max(52)]],
      frequency: [null, Validators.min(1)],
      sequence: [1, [Validators.required, Validators.min(1)]],
      active: [true],
      companyID: [null],
      sectorID: [null],
      cropID: [null]
    });

    this.modeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      active: [true]
    });

    this.sectorForm = this.fb.group({
      cropProductionId: [null, Validators.required],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      polygon: [null],
      pumpRelayId: [null],
      valveRelayId: [null],
      active: [true]
    });

    this.relayModuleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(32)]],
      active: [true]
    });
  }

  private loadAllData(): void {
    this.isLoading = true;
    forkJoin({
      plansAndEntries: this.irrigationSchedulingService.getAllIrrigationPlansWithEntries(),
      modes: this.irrigationSchedulingService.getAllIrrigationModes(),
      companies: this.companyService.getAll(),
      crops: this.cropService.getAll(),
      sectors: this.irrigationSectorService.getAllCropProductionIrrigationSectors(),
      relayModules: this.irrigationSectorService.getAllRelayModules()
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
          this.companies = data.companies || [];
          this.crops = data.crops || [];
          this.sectors = data.sectors || [];
          this.irrigationSectors = data.sectors || [];
          this.relayModules = data.relayModules || [];

          this.filteredEntries = [...this.irrigationEntries];
          this.executionHistory = this.irrigationEntries.filter(e => !!e.executionDate && e.status !== 'Pendiente');
          this.filteredHistory = [...this.executionHistory];
        },
        error: (error) => {
          console.error('Error loading data:', error);
        }
      });
  }

  private loadCropProductions(): void {
    this.cropProductionService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.cropProductions = response.cropProductions || response || [];
      },
      error: (error) => {
        console.error('Error loading crop productions:', error);
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
      this.entryForm.patchValue({
        irrigationPlanId: entry.irrigationPlanId,
        irrigationModeId: entry.irrigationModeId,
        executionDate: entry.executionDate ? String(entry.executionDate).substring(0, 16) : null,
        duration: entry.duration,
        wStart: entry.wStart,
        wEnd: entry.wEnd,
        frequency: entry.frequency,
        sequence: entry.sequence,
        active: entry.active,
        companyID: entry.companyID ?? null,
        sectorID: entry.sectorID ?? null,
        cropID: entry.cropID ?? null
      });
    } else {
      this.entryForm.reset({
        executionDate: null,
        duration: 30,
        sequence: 1,
        active: true,
        companyID: null,
        sectorID: null,
        cropID: null
      });
    }

    this.showEntryModal = true;
  }

  closeEntryModal(): void {
    this.showEntryModal = false;
    this.selectedEntry = null;
    this.entryForm.reset({
      executionDate: null,
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
    // datetime-local gives a naive string (no timezone). Convert to UTC ISO so
    // the server always receives an unambiguous timestamp.
    const executionDateUtc = formValue.executionDate
      ? new Date(formValue.executionDate).toISOString()
      : null;

    if (this.isEditMode && this.selectedEntry) {
      const updateCommand: UpdateIrrigationPlanEntryCommand = {
        id: this.selectedEntry.id,
        irrigationPlanId: formValue.irrigationPlanId,
        irrigationModeId: formValue.irrigationModeId,
        executionDate: executionDateUtc ?? undefined,
        duration: formValue.duration,
        wStart: formValue.wStart,
        wEnd: formValue.wEnd,
        frequency: formValue.frequency,
        sequence: formValue.sequence,
        active: formValue.active,
        updatedBy: this.currentUserId,
        sectorID: formValue.sectorID ?? undefined,
        companyID: formValue.companyID ?? undefined,
        cropID: formValue.cropID ?? undefined
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
        executionDate: executionDateUtc ?? undefined,
        duration: formValue.duration,
        wStart: formValue.wStart,
        wEnd: formValue.wEnd,
        frequency: formValue.frequency,
        sequence: formValue.sequence,
        active: formValue.active,
        createdBy: this.currentUserId,
        sectorID: formValue.sectorID ?? undefined,
        companyID: formValue.companyID ?? undefined,
        cropID: formValue.cropID ?? undefined
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

  // ==================== SECTOR / VALVE OPERATIONS ====================

  loadSectors(): void {
    this.isLoadingSectors = true;
    this.irrigationSectorService.getAllCropProductionIrrigationSectors()
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingSectors = false))
      .subscribe({
        next: (sectors) => { this.irrigationSectors = sectors; },
        error: (error) => { console.error('Error loading sectors:', error); }
      });
  }

  openSectorModal(sector?: any): void {
    this.isEditMode = !!sector;
    this.selectedSector = sector || null;

    if (sector) {
      this.sectorForm.patchValue({
        cropProductionId: sector.cropProductionId,
        name: sector.name,
        polygon: sector.polygon ?? null,
        pumpRelayId: sector.pumpRelayId ?? null,
        valveRelayId: sector.valveRelayId ?? null,
        active: sector.active ?? true
      });
    } else {
      this.sectorForm.reset({ active: true });
    }

    this.showSectorModal = true;
  }

  closeSectorModal(): void {
    this.showSectorModal = false;
    this.selectedSector = null;
    this.sectorForm.reset({ active: true });
  }

  saveSector(): void {
    if (this.sectorForm.invalid) {
      this.sectorForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const fv = this.sectorForm.value;

    if (this.isEditMode && this.selectedSector) {
      this.irrigationSectorService.updateCropProductionIrrigationSector({
        id: this.selectedSector.id,
        cropProductionId: fv.cropProductionId,
        name: fv.name,
        polygon: fv.polygon ?? undefined,
        pumpRelayId: fv.pumpRelayId ?? undefined,
        valveRelayId: fv.valveRelayId ?? undefined,
        active: fv.active
      }).pipe(takeUntil(this.destroy$), finalize(() => this.isSaving = false))
        .subscribe({
          next: () => { this.closeSectorModal(); this.loadSectors(); },
          error: (error) => { console.error('Error updating sector:', error); }
        });
    } else {
      this.irrigationSectorService.createCropProductionIrrigationSector({
        cropProductionId: fv.cropProductionId,
        name: fv.name,
        polygon: fv.polygon ?? undefined,
        pumpRelayId: fv.pumpRelayId ?? undefined,
        valveRelayId: fv.valveRelayId ?? undefined
      }).pipe(takeUntil(this.destroy$), finalize(() => this.isSaving = false))
        .subscribe({
          next: () => { this.closeSectorModal(); this.loadSectors(); },
          error: (error) => { console.error('Error creating sector:', error); }
        });
    }
  }

  deleteSector(sector: any): void {
    if (!confirm(`¿Está seguro de eliminar el sector "${sector.name}"?`)) return;

    this.isLoadingSectors = true;
    this.irrigationSectorService.deleteCropProductionIrrigationSector(sector.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingSectors = false))
      .subscribe({
        next: () => { this.loadSectors(); },
        error: (error) => { console.error('Error deleting sector:', error); }
      });
  }

  getRelayName(relayId: number | null | undefined): string {
    if (!relayId) return '—';
    const relay = this.relayModules.find(r => r.id === relayId);
    return relay ? relay.name : `Relay #${relayId}`;
  }

  // ==================== RELAY MODULE OPERATIONS ====================

  loadRelayModules(): void {
    this.isLoadingRelays = true;
    this.irrigationSectorService.getAllRelayModules(true)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingRelays = false))
      .subscribe({
        next: (relays) => { this.relayModules = relays; },
        error: (error) => { console.error('Error loading relay modules:', error); }
      });
  }

  openRelayModuleModal(relay?: any): void {
    this.isEditMode = !!relay;
    this.selectedRelayModule = relay || null;

    if (relay) {
      this.relayModuleForm.patchValue({ name: relay.name, active: relay.active ?? true });
    } else {
      this.relayModuleForm.reset({ active: true });
    }

    this.showRelayModuleModal = true;
  }

  closeRelayModuleModal(): void {
    this.showRelayModuleModal = false;
    this.selectedRelayModule = null;
    this.relayModuleForm.reset({ active: true });
  }

  saveRelayModule(): void {
    if (this.relayModuleForm.invalid) {
      this.relayModuleForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const fv = this.relayModuleForm.value;

    if (this.isEditMode && this.selectedRelayModule) {
      this.irrigationSectorService.updateRelayModule({ id: this.selectedRelayModule.id, name: fv.name, active: fv.active })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving = false))
        .subscribe({
          next: () => { this.closeRelayModuleModal(); this.loadRelayModules(); },
          error: (error) => { console.error('Error updating relay module:', error); }
        });
    } else {
      this.irrigationSectorService.createRelayModule({ name: fv.name })
        .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving = false))
        .subscribe({
          next: (res: any) => { console.log('Relay module created:', res); this.closeRelayModuleModal(); this.loadRelayModules(); },
          error: (error) => { console.error('Error creating relay module:', error); }
        });
    }
  }

  deleteRelayModule(relay: any): void {
    if (!confirm(`¿Está seguro de eliminar el módulo relay "${relay.name}"?`)) return;

    this.isLoadingRelays = true;
    this.irrigationSectorService.deleteRelayModule(relay.id)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingRelays = false))
      .subscribe({
        next: () => { this.loadRelayModules(); },
        error: (error) => { console.error('Error deleting relay module:', error); }
      });
  }

  getSectorCountForRelay(relayId: number): number {
    return this.irrigationSectors.filter(
      s => s.pumpRelayId === relayId || s.valveRelayId === relayId
    ).length;
  }

  // ==================== EXECUTION HISTORY OPERATIONS ====================
  loadExecutionHistory(): void {
    this.isLoading = true;
    this.irrigationSchedulingService.getAllIrrigationPlanEntries()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res: any) => {
          const entries: IrrigationPlanEntry[] = res?.irrigationPlanEntries || res || [];
          this.irrigationEntries = entries;
          this.executionHistory = entries.filter(e => !!e.executionDate && e.status !== 'Pendiente');
          this.applyHistoryFilters();
        },
        error: (error) => {
          console.error('Error loading execution history:', error);
        }
      });
  }

  viewHistoryDetails(record: IrrigationPlanEntry): void {
    this.selectedHistoryRecord = record;
    this.showHistoryDetailsModal = true;
  }

  getSectorName(id?: number): string {
    if (!id) return 'N/A';
    const s = this.sectors.find(x => x.id === id);
    return s?.name ?? `Sector ${id}`;
  }

  getCompanyName(id?: number): string {
    if (!id) return 'N/A';
    const c = this.companies.find(x => x.id === id);
    return c?.name ?? `Empresa ${id}`;
  }

  getCropName(id?: number): string {
    if (!id) return 'N/A';
    const c = this.crops.find(x => x.id === id);
    return c?.name ?? `Cultivo ${id}`;
  }

  getValveName(entry: IrrigationPlanEntry): string {
    const parts = [
      this.getCompanyName(entry.companyID),
      this.getSectorName(entry.sectorID),
      this.getCropName(entry.cropID)
    ].filter(p => p !== 'N/A');
    return parts.length ? parts.join(' / ') : 'N/A';
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

      if (this.filterStatus) {
        matches = matches && record.status === this.filterStatus;
      }

      if (this.filterDateFrom) {
        const recordDate = new Date(record.executionDate as string);
        const filterDate = new Date(this.filterDateFrom);
        matches = matches && recordDate >= filterDate;
      }

      if (this.filterDateTo) {
        const recordDate = new Date(record.executionDate as string);
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
        this.formatDateTime(entry.executionDate || ''),
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
      headers = ['ID', 'Válvula', 'Fecha Ejecución', 'Fecha Recuperación', 'Fecha Stop', 'Estado', 'Duración (min)'];
      data = this.filteredHistory.map(record => [
        record.id,
        this.getValveName(record),
        record.executionDate ? this.formatDateTime(record.executionDate as string) : 'N/A',
        record.retrieveDate ? this.formatDateTime(record.retrieveDate) : 'N/A',
        record.stopDate ? this.formatDateTime(record.stopDate) : 'N/A',
        record.status || 'N/A',
        record.duration
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
   * Update existing setActiveTab to include 'substrate' and 'sectors'
   */
  setActiveTab(tab: 'plans' | 'entries' | 'modes' | 'history' | 'substrate' | 'sectors'): void {
    this.activeTab = tab;
    this.sortField = '';
    this.sortDirection = 'asc';

    if (tab === 'history') {
      this.loadExecutionHistory();
    } else if (tab === 'sectors') {
      this.loadSectors();
      this.loadRelayModules();
    }
  }
}