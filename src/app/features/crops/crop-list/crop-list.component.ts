// src/app/features/crops/crop-list/crop-list.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, tap, of, finalize } from 'rxjs';

// Services
import { CropService, CropFilters, CropCreateRequest, CropUpdateRequest } from '../services/crop.service';
import { Crop } from '../../../core/models/models';
import { AuthService } from '../../../core/auth/auth.service';
import { CatalogService, Catalog } from '../../catalogs/services/catalog.service';

@Component({
  selector: 'app-crop-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crop-list.component.html',
  styleUrls: ['./crop-list.component.scss']
})
export class CropListComponent implements OnInit {
  crops: Crop[] = [];
  filteredCrops: Crop[] = [];
  selectedCrop: Crop | null = null;
  cropForm!: FormGroup;

  // Catalogs
  availableCatalogs: Catalog[] = [];
  selectedCatalogId: number | null = null;
  isLoadingCatalogs = false;

  // UI State
  isLoading = false;
  isFormVisible = false;
  isEditMode = false;
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  // Filters
  filters: CropFilters = {
    onlyActive: true,
    searchTerm: '',
    type: '',
    harvestSeason: '',
    waterRequirement: ''
  };

  // Error handling
  errorMessage = '';
  successMessage = '';

  // Crop types
  cropTypes = [
    { value: 'Vegetal', label: 'Vegetal' },
    { value: 'Fruta', label: 'Fruta' },
    { value: 'Cereal', label: 'Cereal' },
    { value: 'Hierba', label: 'Hierba Aromática' },
    { value: 'Legumbre', label: 'Legumbre' },
    { value: 'Tubérculo', label: 'Tubérculo' },
    { value: 'Otro', label: 'Otro' }
  ];

  // Harvest seasons
  harvestSeasons = [
    { value: 'Primavera', label: 'Primavera' },
    { value: 'Verano', label: 'Verano' },
    { value: 'Otoño', label: 'Otoño' },
    { value: 'Invierno', label: 'Invierno' },
    { value: 'Todo el año', label: 'Todo el año' }
  ];

  // Water requirements
  waterRequirements = [
    { value: 'Bajo', label: 'Bajo' },
    { value: 'Medio', label: 'Medio' },
    { value: 'Alto', label: 'Alto' },
    { value: 'Muy Alto', label: 'Muy Alto' }
  ];

  constructor(
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
    this.loadCatalogs();
    this.loadCrops();
  }

  private checkAuthentication(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  private initializeForm(): void {
    this.cropForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      scientificName: [''],
      description: ['', Validators.maxLength(500)],
      type: [''],
      variety: [''],
      growthCycleDays: [''],
      harvestSeason: [''],
      waterRequirement: [''],
      cropBaseTemperature: ['', Validators.required],
      isActive: [true]
    });
  }

  private loadCatalogs(): void {
    this.isLoadingCatalogs = true;
    this.catalogService.getAll().subscribe({
      next: (catalogs) => {
        this.availableCatalogs = catalogs.filter(c => c.isActive);
        if (this.availableCatalogs.length > 0) {
          this.selectedCatalogId = this.availableCatalogs[0].id;
        }
        this.isLoadingCatalogs = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading catalogs:', error);
        this.errorMessage = 'Error al cargar los catálogos';
        this.isLoadingCatalogs = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadCrops(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cropService.getAll(this.filters.onlyActive, this.filters).subscribe({
      next: (crops) => {
        console.log('Crops loaded:', crops);
        this.crops = crops;
        this.applyClientFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading crops:', error);
        this.errorMessage = 'Error al cargar los cultivos. Por favor, intente nuevamente.';
        this.crops = [];
        this.filteredCrops = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyClientFilters(): void {
    let filtered = [...this.crops];

    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(crop =>
        crop.name?.toLowerCase().includes(searchTerm) ||
        crop.scientificName?.toLowerCase().includes(searchTerm) ||
        crop.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (this.filters.type) {
      filtered = filtered.filter(crop => crop.type === this.filters.type);
    }

    if (this.filters.harvestSeason) {
      filtered = filtered.filter(crop => crop.harvestSeason === this.filters.harvestSeason);
    }

    if (this.filters.waterRequirement) {
      filtered = filtered.filter(crop => crop.waterRequirement === this.filters.waterRequirement);
    }

    this.filteredCrops = filtered;
    this.totalRecords = filtered.length;
  }

  // Filter methods
  onFiltersChange(): void {
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.filters = {
      onlyActive: true,
      searchTerm: '',
      type: '',
      harvestSeason: '',
      waterRequirement: ''
    };
    this.applyClientFilters();
  }

  // CRUD Operations
  showCreateForm(): void {
    this.isEditMode = false;
    this.isFormVisible = true;
    this.selectedCrop = null;
    this.cropForm.reset();
    this.cropForm.patchValue({ isActive: true });
    this.clearMessages();
  }

  showEditForm(crop: Crop): void {
    this.isEditMode = true;
    this.isFormVisible = true;
    this.selectedCrop = crop;
    this.cropForm.patchValue(crop);
    this.clearMessages();
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.isEditMode = false;
    this.selectedCrop = null;
    this.cropForm.reset();
    this.clearMessages();
  }

  submitForm(): void {
    if (this.cropForm.invalid) {
      this.cropForm.markAllAsTouched();
      console.error("Invalid Form")
      return;
    }

    const formData = this.cropForm.value;
    this.isLoading = true;
    this.clearMessages();

    if (this.isEditMode && this.selectedCrop) {
      // Update existing crop
      const updateData: CropUpdateRequest = {
        ...formData,
        id: this.selectedCrop.id
      };

      this.cropService.update(updateData).subscribe({
        next: (updatedCrop) => {
          this.successMessage = 'Cultivo actualizado exitosamente';
          this.hideForm();
          this.loadCrops();
        },
        error: (error) => {
          console.error('Error updating crop:', error);
          this.errorMessage = 'Error al actualizar el cultivo';
          this.isLoading = false;
        }
      });
    } else {
      // Create new crop
      const createData: CropCreateRequest = formData;

      this.cropService.create(createData).subscribe({
        next: (newCrop) => {
          this.successMessage = 'Cultivo creado exitosamente';
          this.hideForm();
          this.loadCrops();
        },
        error: (error) => {
          console.error('Error creating crop:', error);
          this.errorMessage = 'Error al crear el cultivo';
          this.isLoading = false;
        }
      });
    }
  }

  deleteCrop(crop: Crop): void {
    if (!crop.id) return;

    if (confirm(`¿Está seguro de que desea eliminar el cultivo "${crop.name}"?`)) {
      this.isLoading = true;
      this.clearMessages();

      this.cropService.delete(crop.id).subscribe({
        next: () => {
          this.successMessage = 'Cultivo eliminado exitosamente';
          this.loadCrops();
        },
        error: (error) => {
          console.error('Error deleting crop:', error);
          this.errorMessage = 'Error al eliminar el cultivo';
          this.isLoading = false;
        }
      });
    }
  }

  toggleCropStatus(crop: Crop): void {
    if (!crop.id) return;

    const newStatus = !crop.isActive;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro de que desea ${action} el cultivo "${crop.name}"?`)) {
      this.isLoading = true;
      this.clearMessages();

      const updateData: CropUpdateRequest = {
        ...crop,
        isActive: newStatus
      };

      this.cropService.update(updateData).subscribe({
        next: (updatedCrop) => {
          this.successMessage = `Cultivo ${newStatus ? 'activado' : 'desactivado'} exitosamente`;
          this.loadCrops();
        },
        error: (error) => {
          console.error('Error toggling crop status:', error);
          this.errorMessage = `Error al ${action} el cultivo`;
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

  getFieldError(fieldName: string): string {
    const control = this.cropForm.get(fieldName);
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
      scientificName: 'Nombre científico',
      description: 'Descripción',
      type: 'Tipo',
      variety: 'Variedad',
      growthCycleDays: 'Días del ciclo de crecimiento',
      harvestSeason: 'Temporada de cosecha',
      waterRequirement: 'Requerimiento de agua',
      optimalTemperatureMin: 'Temperatura mínima óptima',
      optimalTemperatureMax: 'Temperatura máxima óptima',
      nitrogenRequirement: 'Requerimiento de nitrógeno',
      phosphorusRequirement: 'Requerimiento de fósforo',
      potassiumRequirement: 'Requerimiento de potasio'
    };
    return labels[fieldName] || fieldName;
  }

  formatCropType(type: string): string {
    const typeObj = this.cropTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  // Pagination
  getPaginatedData(): Crop[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredCrops.slice(startIndex, endIndex);
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
    return this.filteredCrops.length;
  }

  getActiveCount(): number {
    return this.filteredCrops.filter(crop => crop.isActive).length;
  }

  getInactiveCount(): number {
    return this.filteredCrops.filter(crop => !crop.isActive).length;
  }

  getTypeCount(type: string): number {
    return this.filteredCrops.filter(crop => crop.type === type).length;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}