import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import {
  GrowingMediumService,
  GrowingMedium,
  CreateGrowingMediumCommand,
  UpdateGrowingMediumCommand
} from '../services/growing-medium.service';
import { CatalogService } from '../../catalogs/services/catalog.service';

@Component({
  selector: 'app-crop-medium-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crop-medium-manager.component.html',
  styleUrls: ['./crop-medium-manager.component.css']
})
export class CropMediumManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  media: GrowingMedium[] = [];
  catalogs: any[] = [];
  includeInactives = false;
  searchTerm = '';
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  formErrorMessage = '';

  showCreateModal = false;
  showEditModal = false;
  showViewModal = false;
  selectedMedium: GrowingMedium | null = null;

  mediumForm!: FormGroup;

  constructor(
    private mediumService: GrowingMediumService,
    private catalogService: CatalogService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadMedia();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.mediumForm = this.fb.group({
      catalogId:                    [null, Validators.required],
      name:                         ['',   [Validators.required, Validators.minLength(2)]],
      saturationPoint:              [95.8, [Validators.required, Validators.min(0), Validators.max(100)]],
      containerCapacityPercentage:  [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      permanentWiltingPoint:        [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fiveKpaHumidity:              [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      // Derived — auto-calculated, shown read-only
      easelyAvailableWaterPercentage: [{ value: null, disabled: true }],
      reserveWaterPercentage:         [{ value: null, disabled: true }],
      totalAvailableWaterPercentage:  [{ value: null, disabled: true }],
      active: [true]
    });

    // Auto-calculate derived fields whenever base values change
    ['containerCapacityPercentage', 'permanentWiltingPoint', 'fiveKpaHumidity'].forEach(field => {
      this.mediumForm.get(field)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.recalculateDerived());
    });
  }

  private recalculateDerived(): void {
    const cc  = +this.mediumForm.get('containerCapacityPercentage')?.value || 0;
    const pwp = +this.mediumForm.get('permanentWiltingPoint')?.value || 0;
    const h5  = +this.mediumForm.get('fiveKpaHumidity')?.value || 0;

    this.mediumForm.get('totalAvailableWaterPercentage')?.setValue(+(cc - pwp).toFixed(2), { emitEvent: false });
    this.mediumForm.get('easelyAvailableWaterPercentage')?.setValue(+(cc - h5).toFixed(2), { emitEvent: false });
    this.mediumForm.get('reserveWaterPercentage')?.setValue(+(h5 - pwp).toFixed(2), { emitEvent: false });
  }

  private loadCatalogs(): void {
    this.catalogService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => { this.catalogs = res.catalogs || res || []; },
        error: () => { this.errorMessage = 'Error al cargar catálogos'; }
      });
  }

  loadMedia(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.mediumService.getAll(this.includeInactives).pipe(
      map((res: any) => {
        this.media = res.growingMediums || res || [];
        console.log('Loaded growing mediums:', this.media);
        return this.media;
      }),
      catchError(() => {
        this.errorMessage = 'Error al cargar medios de cultivo';
        return of([]);
      })
    ).subscribe(() => { this.isLoading = false; });
  }

  get filteredMedia$(): Observable<GrowingMedium[]> {
    return of(this.media).pipe(
      map(list => {
        if (!this.searchTerm.trim()) return list;
        const s = this.searchTerm.toLowerCase();
        return list.filter(m =>
          m.name.toLowerCase().includes(s) ||
          m.id.toString().includes(s)
        );
      })
    );
  }

  createNew(): void {
    this.selectedMedium = null;
    this.formErrorMessage = '';
    this.mediumForm.reset({ active: true });
    this.showCreateModal = true;
  }

  view(medium: GrowingMedium): void {
    this.selectedMedium = medium;
    this.showViewModal = true;
  }

  edit(medium: GrowingMedium): void {
    this.selectedMedium = medium;
    this.formErrorMessage = '';
    this.mediumForm.patchValue({
      catalogId:                    medium.catalogId,
      name:                         medium.name,
      saturationPoint:              medium.saturationPoint ?? 95.8,
      containerCapacityPercentage:  medium.containerCapacityPercentage,
      permanentWiltingPoint:        medium.permanentWiltingPoint,
      fiveKpaHumidity:              medium.fiveKpaHumidity,
      easelyAvailableWaterPercentage: medium.easelyAvailableWaterPercentage,
      reserveWaterPercentage:       medium.reserveWaterPercentage,
      totalAvailableWaterPercentage: medium.totalAvailableWaterPercentage,
      active:                       medium.active
    });
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
    this.selectedMedium = null;
    this.formErrorMessage = '';
  }

  save(): void {
    if (this.mediumForm.invalid) {
      this.formErrorMessage = 'Por favor, complete todos los campos requeridos';
      Object.keys(this.mediumForm.controls).forEach(k => this.mediumForm.get(k)?.markAsTouched());
      return;
    }

    this.isSubmitting = true;
    this.formErrorMessage = '';
    const v = this.mediumForm.getRawValue(); // includes disabled fields
    const userId = this.getCurrentUserId();

    if (this.selectedMedium) {
      const cmd: UpdateGrowingMediumCommand = {
        id:                           this.selectedMedium.id,
        catalogId:                    v.catalogId,
        name:                         v.name,
        saturationPoint:              v.saturationPoint,
        containerCapacityPercentage:  v.containerCapacityPercentage,
        permanentWiltingPoint:        v.permanentWiltingPoint,
        fiveKpaHumidity:              v.fiveKpaHumidity,
        easelyAvailableWaterPercentage: v.easelyAvailableWaterPercentage,
        reserveWaterPercentage:       v.reserveWaterPercentage,
        totalAvailableWaterPercentage: v.totalAvailableWaterPercentage,
        active:                       v.active,
        updatedBy:                    userId
      };
      this.mediumService.update(cmd).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.isSubmitting = false; this.onSaved('Medio de cultivo actualizado correctamente'); },
        error: (err: any) => { this.isSubmitting = false; this.formErrorMessage = err.message || 'Error al actualizar'; }
      });
    } else {
      const cmd: CreateGrowingMediumCommand = {
        catalogId:                    v.catalogId,
        name:                         v.name,
        saturationPoint:              v.saturationPoint,
        containerCapacityPercentage:  v.containerCapacityPercentage,
        permanentWiltingPoint:        v.permanentWiltingPoint,
        fiveKpaHumidity:              v.fiveKpaHumidity,
        easelyAvailableWaterPercentage: v.easelyAvailableWaterPercentage,
        reserveWaterPercentage:       v.reserveWaterPercentage,
        totalAvailableWaterPercentage: v.totalAvailableWaterPercentage,
        createdBy:                    userId
      };
      this.mediumService.create(cmd).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.isSubmitting = false; this.onSaved('Medio de cultivo creado correctamente'); },
        error: (err: any) => { this.isSubmitting = false; this.formErrorMessage = err.message || 'Error al crear'; }
      });
    }
  }

  onSaved(msg: string): void {
    this.closeModal();
    this.successMessage = msg;
    this.loadMedia();
    setTimeout(() => { this.successMessage = ''; }, 5000);
  }

  delete(medium: GrowingMedium): void {
    if (!confirm(`¿Eliminar el medio de cultivo "${medium.name}"?`)) return;
    this.mediumService.delete(medium.id, this.getCurrentUserId()).subscribe({
      next: () => {
        this.successMessage = 'Medio de cultivo eliminado correctamente';
        this.loadMedia();
        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: () => {
        this.errorMessage = 'Error al eliminar el medio de cultivo';
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      }
    });
  }

  toggleActiveFilter(): void {
    this.includeInactives = !this.includeInactives;
    this.loadMedia();
  }

  clearSearch(): void { this.searchTerm = ''; }

  getCatalogName(catalogId: number): string {
    return this.catalogs.find(c => c.id === catalogId)?.name || 'N/A';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  trackByFn(_: number, m: GrowingMedium): number { return m.id; }

  getEmptyStateMessage(): string {
    if (this.searchTerm) return 'No se encontraron medios de cultivo que coincidan con la búsqueda';
    if (!this.includeInactives) return 'No hay medios de cultivo activos registrados';
    return 'No hay medios de cultivo registrados';
  }

  private getCurrentUserId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 1;
    } catch { return 1; }
  }
}
