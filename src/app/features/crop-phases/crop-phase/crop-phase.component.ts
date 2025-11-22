// src/app/features/crop-phases/crop-phase/crop-phase.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, tap, of, finalize, forkJoin } from 'rxjs';

// Services
import {
  CropPhaseService,
  CropPhase,
  CropPhaseFilters,
  CropPhaseCreateRequest,
  CropPhaseUpdateRequest
} from '../services/crop-phase.service';
import { Crop } from '../../../core/models/models';
import { CropService } from '../../crops/services/crop.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CatalogService, Catalog } from '../../catalogs/services/catalog.service';

@Component({
  selector: 'app-crop-phase',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crop-phase.component.html',
  styleUrls: ['./crop-phase.component.css']
})
export class CropPhaseComponent implements OnInit {
  cropPhases: CropPhase[] = [];
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  filteredCropPhases: CropPhase[] = [];
  selectedCropPhase: CropPhase | null = null;
  cropPhaseForm!: FormGroup;

  // Related data
  availableCrops: Crop[] = [];
  availableCatalogs: Catalog[] = [];
  selectedCatalogId: number | null = null;
  isLoadingCatalogs = false;
  isLoadingCrops = false;

  // UI State
  isLoading = false;
  isFormVisible = false;
  isEditMode = false;
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  // Filters
  filters: CropPhaseFilters = {
    onlyActive: true,
    searchTerm: '',
    cropId: undefined,
    minDuration: undefined,
    maxDuration: undefined
  };

  // Error handling
  errorMessage = '';
  successMessage = '';

  constructor(
    private cropPhaseService: CropPhaseService,
    private cropService: CropService,
    private authService: AuthService,
    private catalogService: CatalogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadInitialData();
  }

  private checkAuthentication(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  private initializeForm(): void {
    this.cropPhaseForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      cropId: [null, Validators.required],
      catalogId: [null, Validators.required],
      startingWeek: [1, [Validators.required, Validators.min(1), Validators.max(52)]],
      durationWeeks: [1, [Validators.required, Validators.min(1), Validators.max(52)]],
      criticalNotes: ['', Validators.maxLength(1000)],
      temperatureRange: [''],
      humidityRange: [''],
      lightRequirement: [''],
      active: [true]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin({
      catalogs: this.catalogService.getAll(),
      crops: this.cropService.getAll(true),
      cropPhases: this.cropPhaseService.getAll()
    }).subscribe({
      next: (data: any) => {
        try {
          console.log("🐶 Data: ", data)
          // Safely handle catalogs - check if it's an array
          this.availableCatalogs = data.catalogs.catalogs;
          // if (Array.isArray(data.catalogs)) {
          //   .filter((c: { isActive: any; }) => c.isActive);
          // } else if (data.catalogs && typeof data.catalogs === 'object') {
          //   // Handle case where catalogs might be wrapped in another object
          //   const catalogsArray = data.catalogs.data || data.catalogs.items || [];
          //   this.availableCatalogs = Array.isArray(catalogsArray)
          //     ? catalogsArray.filter(c => c.isActive)
          //     : [];
          // } else {
          //   console.warn('Catalogs data is not in expected format:', data.catalogs);
          //   this.availableCatalogs = [];
          // }

          if (this.availableCatalogs.length > 0) {
            this.selectedCatalogId = this.availableCatalogs[0].id;
          }

          // Safely handle crops - check if it's an array
          this.availableCrops = data.crops;

          // Safely handle cropPhases - check if it's an array
          if (Array.isArray(data.cropPhases)) {
            this.cropPhases = data.cropPhases;
          } else if (data.cropPhases && typeof data.cropPhases === 'object') {
            // Handle case where cropPhases might be wrapped in another object
            const cropPhasesArray = data.cropPhases.data || data.cropPhases.items || [];
            this.cropPhases = Array.isArray(cropPhasesArray) ? cropPhasesArray : [];
          } else {
            console.warn('CropPhases data is not in expected format:', data.cropPhases);
            this.cropPhases = [];
          }

          this.applyClientFilters();

          this.isLoading = false;
          this.cdr.markForCheck();
        } catch (error) {
          console.error('Error processing initial data:', error);
          this.errorMessage = 'Error al procesar los datos iniciales';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.errorMessage = 'Error al cargar los datos iniciales';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadCropPhases(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cropPhaseService.getAll(this.filters).subscribe({
      next: (cropPhases) => {
        this.cropPhases = cropPhases;
        this.applyClientFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading crop phases:', error);
        this.errorMessage = 'Error al cargar las fases de cultivo';
        this.cropPhases = [];
        this.filteredCropPhases = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyClientFilters(): void {
    let filtered = [...this.cropPhases];

    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(phase =>
        phase.name?.toLowerCase().includes(searchTerm) ||
        phase.description?.toLowerCase().includes(searchTerm) ||
        phase.criticalNotes?.toLowerCase().includes(searchTerm)
      );
    }

    if (this.filters.cropId) {
      filtered = filtered.filter(phase => phase.cropId === this.filters.cropId);
    }

    if (this.filters.minDuration !== undefined) {
      filtered = filtered.filter(phase =>
        (phase.durationWeeks || 0) >= this.filters.minDuration!
      );
    }

    if (this.filters.maxDuration !== undefined) {
      filtered = filtered.filter(phase =>
        (phase.durationWeeks || 0) <= this.filters.maxDuration!
      );
    }

    if (this.filters.onlyActive) {
      filtered = filtered.filter(phase => phase.active);
    }
 
    filtered.sort((a, b) => {
      if (a.cropId !== b.cropId) {
        const cropA = this.getCropName(a.cropId);
        const cropB = this.getCropName(b.cropId);
        return cropA.localeCompare(cropB);
      }
      return (a.startingWeek || 0) - (b.startingWeek || 0);
    });
    this.filteredCropPhases = filtered;
    this.totalRecords = filtered.length;
    this.applySorting();
  }

  // Filter methods
  onFiltersChange(): void {
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.filters = {
      onlyActive: true,
      searchTerm: '',
      cropId: undefined,
      minDuration: undefined,
      maxDuration: undefined
    };
    this.applyClientFilters();
  }

  // CRUD Operations
  showCreateForm(): void {
    this.isEditMode = false;
    this.isFormVisible = true;
    this.selectedCropPhase = null;
    this.cropPhaseForm.reset();
    this.cropPhaseForm.patchValue({
      active: true, 
      startingWeek: 1,
      durationWeeks: 1
    });
    this.clearMessages();
  }

  showEditForm(cropPhase: CropPhase): void {
    this.isEditMode = true;
    this.isFormVisible = true;
    this.selectedCropPhase = cropPhase;
    this.cropPhaseForm.patchValue(cropPhase);
    this.clearMessages();
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
   * Apply sorting to filtered data
   */
  private applySorting(): void {
    if (!this.sortField) return;

    this.filteredCropPhases.sort((a: any, b: any) => {
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
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.isEditMode = false;
    this.selectedCropPhase = null;
    this.cropPhaseForm.reset();
    this.clearMessages();
  }

  submitForm(): void {
    const formData = this.cropPhaseForm.value;
    this.isLoading = true;
    this.clearMessages();

    if (this.isEditMode && this.selectedCropPhase) {
      // Update existing crop phase
      const updateData: CropPhaseUpdateRequest = {
        ...formData,
        id: this.selectedCropPhase.id
      };

      this.cropPhaseService.update(updateData).subscribe({
        next: (updatedCropPhase) => {
          this.successMessage = 'Fase de cultivo actualizada exitosamente';
          this.hideForm();
          this.loadCropPhases();
        },
        error: (error) => {
          console.error('Error updating crop phase:', error);
          this.errorMessage = 'Error al actualizar la fase de cultivo';
          this.isLoading = false;
        }
      });
    } else {
      // Create new crop phase
      const createData: CropPhaseCreateRequest = formData;

      this.cropPhaseService.create(createData).subscribe({
        next: (newCropPhase) => {
          this.successMessage = 'Fase de cultivo creada exitosamente';
          this.hideForm();
          this.loadCropPhases();
        },
        error: (error) => {
          console.error('Error creating crop phase:', error);
          this.errorMessage = 'Error al crear la fase de cultivo';
          this.isLoading = false;
        }
      });
    }
  }

  deleteCropPhase(cropPhase: CropPhase): void {
    if (!cropPhase.id) return;

    if (confirm(`¿Está seguro de que desea eliminar la fase "${cropPhase.name}"?`)) {
      this.isLoading = true;
      this.clearMessages();

      this.cropPhaseService.delete(cropPhase.id).subscribe({
        next: () => {
          this.successMessage = 'Fase de cultivo eliminada exitosamente';
          this.loadCropPhases();
        },
        error: (error) => {
          console.error('Error deleting crop phase:', error);
          this.errorMessage = 'Error al eliminar la fase de cultivo';
          this.isLoading = false;
        }
      });
    }
  }

  toggleCropPhaseStatus(cropPhase: CropPhase): void {
    if (!cropPhase.id) return;

    const newStatus = !cropPhase.active;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro de que desea ${action} la fase "${cropPhase.name}"?`)) {
      this.isLoading = true;
      this.clearMessages();

      const updateData: CropPhaseUpdateRequest = {
        ...cropPhase,
        active: newStatus
      };

      this.cropPhaseService.update(updateData).subscribe({
        next: (updatedCropPhase) => {
          this.successMessage = `Fase de cultivo ${newStatus ? 'activada' : 'desactivada'} exitosamente`;
          this.loadCropPhases();
        },
        error: (error) => {
          console.error('Error toggling crop phase status:', error);
          this.errorMessage = `Error al ${action} la fase de cultivo`;
          this.isLoading = false;
        }
      });
    }
  }

  // Utility methods
  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getCropName(cropId?: number): string {
    if (!cropId) return 'N/A';
    const crop = this.availableCrops.find(c => c.id === cropId);
    return crop ? crop.name || 'N/A' : 'N/A';
  }

  getFieldError(fieldName: string): string {
    const control = this.cropPhaseForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (control.errors['maxlength']) return `${this.getFieldLabel(fieldName)} es demasiado largo`;
      if (control.errors['min']) return `${this.getFieldLabel(fieldName)} debe ser mayor a ${control.errors['min'].min}`;
      if (control.errors['max']) return `${this.getFieldLabel(fieldName)} debe ser menor a ${control.errors['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      description: 'Descripción',
      cropId: 'Cultivo', 
      startingWeek: 'Semana de inicio',
      durationWeeks: 'Duración en semanas',
      criticalNotes: 'Notas críticas',
      temperatureRange: 'Rango de temperatura',
      humidityRange: 'Rango de humedad',
      lightRequirement: 'Requerimiento de luz'
    };
    return labels[fieldName] || fieldName;
  }

  // Pagination
  getPaginatedData(): CropPhase[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredCropPhases.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // Statistics
  getTotalCount(): number {
    return this.filteredCropPhases.length;
  }

  getActiveCount(): number {
    return this.filteredCropPhases.filter(phase => phase.active).length;
  }

  getInactiveCount(): number {
    return this.filteredCropPhases.filter(phase => !phase.active).length;
  }

  getPhasesByDuration(weeks: number): number {
    return this.filteredCropPhases.filter(phase => (phase.durationWeeks || 0) === weeks).length;
  }

  getAverageDuration(): number {
    if (this.filteredCropPhases.length === 0) return 0;
    const total = this.filteredCropPhases.reduce((sum, phase) => sum + (phase.durationWeeks || 0), 0);
    return Math.round((total / this.filteredCropPhases.length) * 10) / 10;
  }

  // Crop phases by crop
  getPhasesByCrop(): { [cropName: string]: number } {
    const groupedByCrop: { [cropName: string]: number } = {};

    this.filteredCropPhases.forEach(phase => {
      const cropName = this.getCropName(phase.cropId);
      groupedByCrop[cropName] = (groupedByCrop[cropName] || 0) + 1;
    });

    return groupedByCrop;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
 

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}