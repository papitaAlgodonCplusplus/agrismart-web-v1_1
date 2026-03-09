import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import { ContainerService, Container, CreateContainerCommand, UpdateContainerCommand } from '../../services/container.service';
import { ContainerTypeService, ContainerType, CreateContainerTypeCommand, UpdateContainerTypeCommand, FORMULA_TYPES } from '../services/container-type.service';
import { CatalogService } from '../../catalogs/services/catalog.service';

@Component({
  selector: 'app-container-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './container-manager.component.html',
  styleUrls: ['./container-manager.component.css']
})
export class ContainerManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ── Containers ──────────────────────────────────────────────
  containers: Container[] = [];
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
  selectedContainer: Container | null = null;

  containerForm!: FormGroup;

  // ── Container Types ──────────────────────────────────────────
  containerTypes: ContainerType[] = [];
  formulaTypes = FORMULA_TYPES;
  includeInactiveTypes = false;
  isLoadingTypes = false;
  isSubmittingType = false;
  typeErrorMessage = '';
  typeSuccessMessage = '';
  typeFormErrorMessage = '';

  showCreateTypeModal = false;
  showEditTypeModal = false;
  selectedType: ContainerType | null = null;

  containerTypeForm!: FormGroup;

  // Active tab: 'containers' | 'types'
  activeTab: 'containers' | 'types' = 'containers';

  constructor(
    private containerService: ContainerService,
    private containerTypeService: ContainerTypeService,
    private catalogService: CatalogService,
    private fb: FormBuilder
  ) {
    this.initContainerForm();
    this.initTypeForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadContainerTypes();
    this.loadContainers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Init Forms ───────────────────────────────────────────────

  initContainerForm(): void {
    this.containerForm = this.fb.group({
      catalogId:       [null, Validators.required],
      name:            ['',   [Validators.required, Validators.minLength(2)]],
      containerTypeId: [null, Validators.required],
      height:          [null, [Validators.required, Validators.min(0)]],
      width:           [null, [Validators.required, Validators.min(0)]],
      length:          [null, [Validators.required, Validators.min(0)]],
      lowerDiameter:   [null, [Validators.required, Validators.min(0)]],
      upperDiameter:   [null, [Validators.required, Validators.min(0)]],
      active:          [true]
    });
  }

  initTypeForm(): void {
    this.containerTypeForm = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(2)]],
      formulaType: [null, Validators.required],
      active:      [true]
    });
  }

  // ── Load Data ────────────────────────────────────────────────

  private loadCatalogs(): void {
    this.catalogService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => { this.catalogs = res.catalogs || res || []; },
        error: () => { this.errorMessage = 'Error al cargar catálogos'; }
      });
  }

  loadContainerTypes(): void {
    this.isLoadingTypes = true;
    this.containerTypeService.getAll(this.includeInactiveTypes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => { this.containerTypes = res.containerTypes || res || []; this.isLoadingTypes = false; },
        error: () => { this.typeErrorMessage = 'Error al cargar tipos de contenedor'; this.isLoadingTypes = false; }
      });
  }

  loadContainers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.containerService.getAll(this.includeInactives).pipe(
      map((res: any) => { this.containers = res.containers || res || []; return this.containers; }),
      catchError(() => { this.errorMessage = 'Error al cargar contenedores'; return of([]); })
    ).subscribe(() => { this.isLoading = false; });
  }

  // ── Container Filtering ──────────────────────────────────────

  get filteredContainers$(): Observable<Container[]> {
    return of(this.containers).pipe(
      map(list => {
        if (!this.searchTerm.trim()) return list;
        const s = this.searchTerm.toLowerCase();
        return list.filter(c => c.name.toLowerCase().includes(s) || c.id.toString().includes(s));
      })
    );
  }

  // ── Container CRUD ───────────────────────────────────────────

  createNew(): void {
    this.selectedContainer = null;
    this.formErrorMessage = '';
    this.containerForm.reset({ active: true, containerTypeId: null, catalogId: null,
      height: null, width: null, length: null, lowerDiameter: null, upperDiameter: null, name: '' });
    this.showCreateModal = true;
  }

  view(container: Container): void {
    this.selectedContainer = container;
    this.showViewModal = true;
  }

  edit(container: Container): void {
    this.selectedContainer = container;
    this.formErrorMessage = '';
    this.containerForm.patchValue({
      catalogId: container.catalogId, name: container.name,
      containerTypeId: container.containerTypeId, height: container.height,
      width: container.width, length: container.length,
      lowerDiameter: container.lowerDiameter, upperDiameter: container.upperDiameter,
      active: container.active
    });
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showCreateModal = false; this.showEditModal = false; this.showViewModal = false;
    this.selectedContainer = null; this.formErrorMessage = '';
  }

  save(): void {
    if (this.containerForm.invalid) {
      this.formErrorMessage = 'Por favor, complete todos los campos requeridos';
      Object.keys(this.containerForm.controls).forEach(k => this.containerForm.get(k)?.markAsTouched());
      return;
    }
    this.isSubmitting = true;
    this.formErrorMessage = '';
    const v = this.containerForm.value;
    const userId = this.getCurrentUserId();

    if (this.selectedContainer) {
      const cmd: UpdateContainerCommand = {
        id: this.selectedContainer.id, catalogId: v.catalogId, name: v.name,
        containerTypeId: v.containerTypeId, height: v.height, width: v.width, length: v.length,
        lowerDiameter: v.lowerDiameter, upperDiameter: v.upperDiameter, active: v.active, updatedBy: userId
      };
      this.containerService.update(cmd).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.isSubmitting = false; this.onSaved('Contenedor actualizado correctamente'); },
        error: (err: any) => { this.isSubmitting = false; this.formErrorMessage = err.message || 'Error al actualizar'; }
      });
    } else {
      const cmd: CreateContainerCommand = {
        catalogId: v.catalogId, name: v.name, containerTypeId: v.containerTypeId,
        height: v.height, width: v.width, length: v.length,
        lowerDiameter: v.lowerDiameter, upperDiameter: v.upperDiameter, createdBy: userId
      };
      this.containerService.create(cmd).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.isSubmitting = false; this.onSaved('Contenedor creado correctamente'); },
        error: (err: any) => { this.isSubmitting = false; this.formErrorMessage = err.message || 'Error al crear'; }
      });
    }
  }

  onSaved(msg: string): void {
    this.closeModal();
    this.successMessage = msg;
    this.loadContainers();
    setTimeout(() => { this.successMessage = ''; }, 5000);
  }

  delete(container: Container): void {
    if (!confirm(`¿Eliminar el contenedor "${container.name}"?`)) return;
    this.containerService.delete(container.id, this.getCurrentUserId()).subscribe({
      next: () => { this.successMessage = 'Contenedor eliminado correctamente'; this.loadContainers(); setTimeout(() => { this.successMessage = ''; }, 5000); },
      error: () => { this.errorMessage = 'Error al eliminar el contenedor'; setTimeout(() => { this.errorMessage = ''; }, 5000); }
    });
  }

  toggleActiveFilter(): void { this.includeInactives = !this.includeInactives; this.loadContainers(); }
  clearSearch(): void { this.searchTerm = ''; }

  // ── Container Type CRUD ──────────────────────────────────────

  createNewType(): void {
    this.selectedType = null;
    this.typeFormErrorMessage = '';
    this.containerTypeForm.reset({ name: '', formulaType: null, active: true });
    this.showCreateTypeModal = true;
  }

  editType(type: ContainerType): void {
    this.selectedType = type;
    this.typeFormErrorMessage = '';
    this.containerTypeForm.patchValue({ name: type.name, formulaType: type.formulaType, active: type.active });
    this.showEditTypeModal = true;
  }

  closeTypeModal(): void {
    this.showCreateTypeModal = false; this.showEditTypeModal = false;
    this.selectedType = null; this.typeFormErrorMessage = '';
  }

  saveType(): void {
    if (this.containerTypeForm.invalid) {
      this.typeFormErrorMessage = 'Por favor, complete todos los campos requeridos';
      Object.keys(this.containerTypeForm.controls).forEach(k => this.containerTypeForm.get(k)?.markAsTouched());
      return;
    }
    this.isSubmittingType = true;
    this.typeFormErrorMessage = '';
    const v = this.containerTypeForm.value;

    if (this.selectedType) {
      const cmd: UpdateContainerTypeCommand = { id: this.selectedType.id, name: v.name, formulaType: +v.formulaType, active: v.active };
      this.containerTypeService.update(cmd).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.isSubmittingType = false; this.onTypeSaved('Tipo actualizado correctamente'); },
        error: (err: any) => { this.isSubmittingType = false; this.typeFormErrorMessage = err.message || 'Error al actualizar'; }
      });
    } else {
      const cmd: CreateContainerTypeCommand = { name: v.name, formulaType: +v.formulaType };
      this.containerTypeService.create(cmd).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.isSubmittingType = false; this.onTypeSaved('Tipo creado correctamente'); },
        error: (err: any) => { this.isSubmittingType = false; this.typeFormErrorMessage = err.message || 'Error al crear'; }
      });
    }
  }

  onTypeSaved(msg: string): void {
    this.closeTypeModal();
    this.typeSuccessMessage = msg;
    this.loadContainerTypes();
    setTimeout(() => { this.typeSuccessMessage = ''; }, 5000);
  }

  deleteType(type: ContainerType): void {
    if (!confirm(`¿Eliminar el tipo "${type.name}"? Los contenedores que lo usen pueden quedar sin fórmula de volumen.`)) return;
    this.containerTypeService.delete(type.id).subscribe({
      next: () => { this.typeSuccessMessage = 'Tipo eliminado correctamente'; this.loadContainerTypes(); setTimeout(() => { this.typeSuccessMessage = ''; }, 5000); },
      error: () => { this.typeErrorMessage = 'Error al eliminar el tipo'; setTimeout(() => { this.typeErrorMessage = ''; }, 5000); }
    });
  }

  toggleInactiveTypes(): void { this.includeInactiveTypes = !this.includeInactiveTypes; this.loadContainerTypes(); }

  // ── Helpers ──────────────────────────────────────────────────

  getCatalogName(catalogId: number): string {
    return this.catalogs.find(c => c.id === catalogId)?.name || 'N/A';
  }

  getContainerTypeName(typeId: number): string {
    return this.containerTypes.find(t => t.id === typeId)?.name || `#${typeId}`;
  }

  getFormulaLabel(formulaType: number): string {
    return FORMULA_TYPES.find(f => f.value === formulaType)?.label || 'Desconocido';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  trackByFn(_: number, c: Container): number { return c.id; }
  trackByTypeFn(_: number, t: ContainerType): number { return t.id; }

  getEmptyStateMessage(): string {
    if (this.searchTerm) return 'No se encontraron contenedores que coincidan con la búsqueda';
    if (!this.includeInactives) return 'No hay contenedores activos registrados';
    return 'No hay contenedores registrados';
  }

  private getCurrentUserId(): number {
    try { const user = JSON.parse(localStorage.getItem('user') || '{}'); return user.id || 1; }
    catch { return 1; }
  }
}
