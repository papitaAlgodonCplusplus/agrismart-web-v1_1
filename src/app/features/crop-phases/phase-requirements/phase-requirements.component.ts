// src/app/features/crop-phases/phase-requirements/phase-requirements.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, tap, of, finalize, forkJoin } from 'rxjs';

// Services
import { CropPhaseService, CropPhase } from '../services/crop-phase.service';
import { CropService } from '../../crops/services/crop.service';
import { Crop } from '../../../core/models/models';
import { AuthService } from '../../../core/auth/auth.service';
import { CatalogService, Catalog } from '../../catalogs/services/catalog.service';
import { ApiService } from '../../../core/services/api.service';

// Interfaces
export interface CropPhaseSolutionRequirement {
  id?: number;
  cropPhaseId?: number;
  phaseId?: number;
  name?: string;
  description?: string;
  notes?: string;
  // Macronutrients (ppm)
  ec?: number;
  hco3?: number;
  no3?: number;
  h2po4?: number;
  so4?: number;
  cl?: number;
  nh4?: number;
  k?: number;
  ca?: number;
  mg?: number;
  na?: number;
  // Micronutrients (ppm)
  fe?: number;
  mn?: number;
  zn?: number;
  cu?: number;
  b?: number;
  mo?: number;
  // Solution properties
  ph?: number;
  temperature?: number;
  // Status
  active?: boolean;
  isValidated?: boolean;
  validatedAt?: Date;
  validatedBy?: number;
  validationNotes?: string;
  usageCount?: number;
  lastUsedAt?: Date;
  dateCreated?: Date;
  dateUpdated?: Date;
  createdBy?: number;
  updatedBy?: number;
}

export interface PhaseRequirementFilters {
  searchTerm?: string;
  cropId?: number;
  cropPhaseId?: number;
  onlyActive?: boolean;
  onlyValidated?: boolean;
}

@Component({
  selector: 'app-phase-requirements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './phase-requirements.component.html',
  styleUrls: ['./phase-requirements.component.css']
})
export class PhaseRequirementsComponent implements OnInit {
  requirements: CropPhaseSolutionRequirement[] = [];
  filteredRequirements: any[] = [];
  selectedRequirement: CropPhaseSolutionRequirement | null = null;
  requirementForm!: FormGroup;

  // Related data
  availableCrops: Crop[] = [];
  availableCropPhases: CropPhase[] = [];
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
  filters: PhaseRequirementFilters = {
    searchTerm: '',
    cropId: undefined,
    cropPhaseId: undefined,
    onlyActive: true,
    onlyValidated: false
  };

  // Error handling
  errorMessage = '';
  successMessage = '';

  // Form sections visibility
  showMacronutrients = true;
  showMicronutrients = false;
  showSolutionProperties = false;

  constructor(
    private cropPhaseService: CropPhaseService,
    private cropService: CropService,
    private authService: AuthService,
    private catalogService: CatalogService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadInitialData();
    this.cdr.detectChanges();
  }

  private checkAuthentication(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  private initializeForm(): void {
    this.requirementForm = this.fb.group({
      name: ['', [Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      cropPhaseId: [null, [Validators.required]],
      notes: ['', [Validators.maxLength(500)]],

      // Macronutrients
      ec: [0, [Validators.min(0), Validators.max(10)]],
      hco3: [0, [Validators.min(0), Validators.max(1000)]],
      no3: [0, [Validators.min(0), Validators.max(1000)]],
      h2po4: [0, [Validators.min(0), Validators.max(1000)]],
      so4: [0, [Validators.min(0), Validators.max(1000)]],
      cl: [0, [Validators.min(0), Validators.max(1000)]],
      nh4: [0, [Validators.min(0), Validators.max(1000)]],
      k: [0, [Validators.min(0), Validators.max(1000)]],
      ca: [0, [Validators.min(0), Validators.max(1000)]],
      mg: [0, [Validators.min(0), Validators.max(1000)]],
      na: [0, [Validators.min(0), Validators.max(1000)]],

      // Micronutrients
      fe: [0, [Validators.min(0), Validators.max(50)]],
      mn: [0, [Validators.min(0), Validators.max(50)]],
      zn: [0, [Validators.min(0), Validators.max(50)]],
      cu: [0, [Validators.min(0), Validators.max(50)]],
      b: [0, [Validators.min(0), Validators.max(50)]],
      mo: [0, [Validators.min(0), Validators.max(50)]],

      // Solution properties
      ph: [6.5, [Validators.min(3), Validators.max(9)]],
      temperature: [22, [Validators.min(10), Validators.max(35)]],

      active: [true]
    });
  }


  // Filter methods
  onFiltersChange(): void {
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      cropId: undefined,
      cropPhaseId: undefined,
      onlyActive: true,
      onlyValidated: false
    };
    this.applyClientFilters();
  }

  onCropChange(): void {
    // Update available crop phases when crop changes
    this.filters.cropPhaseId = undefined;
    this.applyClientFilters();
  }

  getFilteredCropPhases(): CropPhase[] {
    if (!this.filters.cropId) return this.availableCropPhases;
    return this.availableCropPhases.filter(phase => phase.cropId === this.filters.cropId);
  }

  // CRUD Operations
  showCreateForm(): void {
    this.isEditMode = false;
    this.isFormVisible = true;
    this.selectedRequirement = null;
    this.requirementForm.reset();
    this.requirementForm.patchValue({
      active: true,
      ec: 1.2,
      ph: 6.5,
      temperature: 22
    });
    this.clearMessages();
  }

  showEditForm(requirement: CropPhaseSolutionRequirement): void {
    this.isEditMode = true;
    this.isFormVisible = true;
    this.selectedRequirement = requirement;
    this.requirementForm.patchValue(requirement);
    this.clearMessages();
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.isEditMode = false;
    this.selectedRequirement = null;
    this.requirementForm.reset();
    this.clearMessages();
  }
  // Update the submitForm method in your component:
  submitForm(): void {
    if (this.requirementForm.invalid) {
      this.requirementForm.markAllAsTouched();
      return;
    }

    const formData = this.requirementForm.value;
    this.isLoading = true;
    this.clearMessages();

    // Map the form data to match the API schema exactly
    const apiRequestData = this.mapFormDataToApiRequest(formData);

    if (this.isEditMode && this.selectedRequirement) {
      // Update existing requirement
      const updateData = {
        ...apiRequestData,
        id: this.selectedRequirement.id
      };

      console.log('Updating requirement with data:', updateData);
      this.apiService.put<CropPhaseSolutionRequirement>('/CropPhaseSolutionRequirement', updateData).subscribe({
        next: (updatedRequirement) => {
          this.successMessage = 'Requerimiento actualizado exitosamente';
          this.hideForm();
          this.loadRequirements();
        },
        error: (error) => {
          console.error('Error updating requirement:', error);
          this.errorMessage = 'Error al actualizar el requerimiento';
          this.isLoading = false;
        }
      });
    } else {
      // Create new requirement
      console.log('Creating requirement with data:', apiRequestData);
      this.apiService.post<CropPhaseSolutionRequirement>('/CropPhaseSolutionRequirement', apiRequestData).subscribe({
        next: (newRequirement) => {
          this.successMessage = 'Requerimiento creado exitosamente';
          this.hideForm();
          this.loadRequirements();
        },
        error: (error) => {
          console.error('Error creating requirement:', error);
          this.errorMessage = 'Error al crear el requerimiento';
          this.isLoading = false;
        }
      });
    }
  }


  deleteRequirement(requirement: CropPhaseSolutionRequirement): void {
    if (!requirement.id) return;

    if (confirm(`¿Está seguro de que desea eliminar el requerimiento "${requirement.name || 'Sin nombre'}"?`)) {
      this.isLoading = true;
      this.clearMessages();

      this.apiService.delete<void>(`/CropPhaseSolutionRequirement/${requirement.id}`).subscribe({
        next: () => {
          this.successMessage = 'Requerimiento eliminado exitosamente';
          this.loadRequirements();
        },
        error: (error) => {
          console.error('Error deleting requirement:', error);
          this.errorMessage = 'Error al eliminar el requerimiento';
          this.isLoading = false;
        }
      });
    }
  }

  toggleRequirementStatus(requirement: CropPhaseSolutionRequirement): void {
    if (!requirement.id) return;

    const newStatus = !requirement.active;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro de que desea ${action} el requerimiento?`)) {
      this.isLoading = true;
      this.clearMessages();

      const updateData = {
        ...requirement,
        active: newStatus
      };

      this.apiService.put<CropPhaseSolutionRequirement>('/CropPhaseSolutionRequirement', updateData).subscribe({
        next: (updatedRequirement) => {
          this.successMessage = `Requerimiento ${newStatus ? 'activado' : 'desactivado'} exitosamente`;
          this.loadRequirements();
        },
        error: (error) => {
          console.error('Error toggling requirement status:', error);
          this.errorMessage = `Error al ${action} el requerimiento`;
          this.isLoading = false;
        }
      });
    }
  }

  validateRequirement(requirement: CropPhaseSolutionRequirement): void {
    if (!requirement.id) return;

    if (confirm(`¿Desea validar este requerimiento como correcto?`)) {
      this.isLoading = true;
      this.clearMessages();

      const updateData = {
        ...requirement,
        isValidated: true,
        validatedAt: new Date(),
        validatedBy: this.authService.getCurrentUser()?.id
      };

      this.apiService.put<CropPhaseSolutionRequirement>('/CropPhaseSolutionRequirement', updateData).subscribe({
        next: (updatedRequirement) => {
          this.successMessage = 'Requerimiento validado exitosamente';
          this.loadRequirements();
        },
        error: (error) => {
          console.error('Error validating requirement:', error);
          this.errorMessage = 'Error al validar el requerimiento';
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

  getCropNameRequirement(cropPhaseId?: number): string {
    if (!cropPhaseId) {
      console.error('Invalid cropPhaseId:', cropPhaseId);
      return 'N/A';
    }
    const phase = this.availableCropPhases.find(p => p.id.toString() === cropPhaseId.toString());
    if (!phase) {
      console.error('Crop phase not found for id:', cropPhaseId);
      return 'N/A';
    }
    const crop = this.availableCrops.find(c => c.id.toString() === phase.cropId.toString());
    return crop ? crop.name || 'N/A' : 'N/A';
  }

  getCropName(phase?: any): string {
    if (!phase) {
      console.error('Invalid phase:', phase);
      return 'N/A';
    }

    const crop = this.availableCrops.find(c => c.id === phase.cropId);
    return crop ? crop.name || 'N/A' : 'N/A';
  }

  getCropPhaseName(cropPhaseId?: number): string {
    if (!cropPhaseId) return 'N/A';
    const phase = this.availableCropPhases.find(p => p.id === cropPhaseId);
    return phase ? phase.name || 'N/A' : 'N/A';
  }

  getNPKRatio(requirement: CropPhaseSolutionRequirement): string {
    const n = (requirement.no3 || 0) + (requirement.nh4 || 0);
    const p = requirement.h2po4 || 0;
    const k = requirement.k || 0;

    if (n === 0 && p === 0 && k === 0) return 'N/A';

    const total = n + p + k;
    if (total === 0) return 'N/A';

    const nRatio = Math.round((n / total) * 100);
    const pRatio = Math.round((p / total) * 100);
    const kRatio = Math.round((k / total) * 100);

    return `${nRatio}-${pRatio}-${kRatio}`;
  }

  getTotalNutrients(requirement: CropPhaseSolutionRequirement): number {
    return (requirement.no3 || 0) + (requirement.nh4 || 0) + (requirement.h2po4 || 0) +
      (requirement.k || 0) + (requirement.ca || 0) + (requirement.mg || 0) +
      (requirement.so4 || 0);
  }

  getTotalMicronutrients(requirement: CropPhaseSolutionRequirement): number {
    return (requirement.fe || 0) + (requirement.mn || 0) + (requirement.zn || 0) +
      (requirement.cu || 0) + (requirement.b || 0) + (requirement.mo || 0);
  }

  getFieldError(fieldName: string): string {
    const control = this.requirementForm.get(fieldName);
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
      cropPhaseId: 'Fase de cultivo',
      notes: 'Notas',
      ec: 'Conductividad eléctrica',
      hco3: 'Bicarbonato',
      no3: 'Nitrato',
      h2po4: 'Fosfato dihidrógeno',
      so4: 'Sulfato',
      cl: 'Cloruro',
      nh4: 'Amonio',
      k: 'Potasio',
      ca: 'Calcio',
      mg: 'Magnesio',
      na: 'Sodio',
      fe: 'Hierro',
      mn: 'Manganeso',
      zn: 'Zinc',
      cu: 'Cobre',
      b: 'Boro',
      mo: 'Molibdeno',
      ph: 'pH',
      temperature: 'Temperatura'
    };
    return labels[fieldName] || fieldName;
  }

  // Form section toggles
  toggleMacronutrients(): void {
    this.showMacronutrients = !this.showMacronutrients;
  }

  toggleMicronutrients(): void {
    this.showMicronutrients = !this.showMicronutrients;
  }

  toggleSolutionProperties(): void {
    this.showSolutionProperties = !this.showSolutionProperties;
  }

  // Pagination
  getPaginatedData(): any {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredRequirements.slice(startIndex, endIndex);
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
    return this.filteredRequirements.length;
  }

  getActiveCount(): number {
    return this.filteredRequirements.filter(req => req.active).length;
  }

  getValidatedCount(): number {
    return this.filteredRequirements.filter(req => req.isValidated).length;
  }

  getRequirementsByPhase(): { [phaseName: string]: number } {
    const groupedByPhase: { [phaseName: string]: number } = {};

    this.filteredRequirements.forEach(req => {
      const phaseName = this.getCropPhaseName(req.cropPhaseId);
      groupedByPhase[phaseName] = (groupedByPhase[phaseName] || 0) + 1;
    });

    return groupedByPhase;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Fixed version of the phase-requirements.component.ts

  // Update the getRequirements method to handle the response structure correctly:
  private getRequirements(): Observable<any> {
    return this.apiService.get<any>('/CropPhaseSolutionRequirement').pipe(
      tap(response => {
        console.log('Raw API response:', response);
      }),
      catchError(error => {
        console.warn('Error loading requirements:', error);
        return of({ cropPhaseRequirements: [] }); // Return expected structure on error
      })
    );
  }

  // Update the loadRequirements method to handle the response correctly:
  private loadRequirements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.getRequirements().subscribe({
      next: (response) => {
        console.log('Requirements response:', response);

        // Handle different response structures
        if (Array.isArray(response)) {
          // Direct array response
          this.requirements = response;
        } else if (response && Array.isArray(response.cropPhaseRequirements)) {
          // Object with cropPhaseRequirements array
          this.requirements = response.cropPhaseRequirements;
        } else if (response && response.data && Array.isArray(response.data)) {
          // Object with data array
          this.requirements = response.data;
        } else {
          // Fallback to empty array
          console.warn('Unexpected response structure:', response);
          this.requirements = [];
        }

        this.applyClientFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading requirements:', error);
        this.errorMessage = 'Error al cargar los requerimientos de fase';
        this.requirements = [];
        this.filteredRequirements = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Update the applyClientFilters method to be more defensive:
  private applyClientFilters(): void {
    // Ensure requirements is always an array
    if (!Array.isArray(this.requirements)) {
      console.warn('Requirements is not an array:', this.requirements);
      this.requirements = [];
    }

    let filtered = [...this.requirements];

    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.name?.toLowerCase().includes(searchTerm) ||
        req.description?.toLowerCase().includes(searchTerm) ||
        req.notes?.toLowerCase().includes(searchTerm)
      );
    }

    if (this.filters.cropId) {
      const cropPhaseIds = this.availableCropPhases
        .filter(phase => phase.cropId === this.filters.cropId)
        .map(phase => phase.id);
      filtered = filtered.filter(req =>
        req.cropPhaseId && cropPhaseIds.includes(req.cropPhaseId)
      );
    }

    if (this.filters.cropPhaseId) {
      filtered = filtered.filter(req => req.cropPhaseId === this.filters.cropPhaseId);
    }

    if (this.filters.onlyActive) {
      filtered = filtered.filter(req => req.active);
    }

    if (this.filters.onlyValidated) {
      filtered = filtered.filter(req => req.isValidated);
    }

    this.filteredRequirements = filtered;
    this.totalRecords = filtered.length;
  }

  // Update the loadInitialData method to handle the requirements response:
  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin({
      catalogs: this.catalogService.getAll().pipe(
        catchError(error => {
          console.error('Error loading catalogs:', error);
          return of([]); // Return empty array on error
        })
      ),
      crops: this.cropService.getAll(true).pipe(
        catchError(error => {
          console.error('Error loading crops:', error);
          return of([]);
        })
      ),
      cropPhases: this.cropPhaseService.getAll().pipe(
        catchError(error => {
          console.error('Error loading crop phases:', error);
          return of([]);
        })
      ),
      requirements: this.getRequirements()
    }).subscribe({
      next: (data) => {
        try {
          console.log('Initial data loaded:', data);

          // Safely handle catalogs with proper validation
          this.availableCatalogs = Array.isArray(data.catalogs)
            ? data.catalogs.filter(c => c && c.isActive)
            : [];

          if (this.availableCatalogs.length > 0) {
            this.selectedCatalogId = this.availableCatalogs[0].id;
          }

          // Safely handle crops with proper validation
          this.availableCrops = data.crops;

          // Safely handle crop phases with proper validation
          this.availableCropPhases = Array.isArray(data.cropPhases)
            ? data.cropPhases.filter(p => p && p.active)
            : [];

          // Safely handle requirements with improved response handling
          const requirementsData = data.requirements;
          if (Array.isArray(requirementsData)) {
            this.requirements = requirementsData;
          } else if (requirementsData && Array.isArray(requirementsData.cropPhaseRequirements)) {
            this.requirements = requirementsData.cropPhaseRequirements;
          } else if (requirementsData && requirementsData.data && Array.isArray(requirementsData.data)) {
            this.requirements = requirementsData.data;
          } else {
            console.warn('Unexpected requirements response structure:', requirementsData);
            this.requirements = [];
          }

          this.applyClientFilters();

          this.isLoading = false;
          this.cdr.markForCheck();
        } catch (processingError) {
          console.error('Error processing loaded data:', processingError);
          this.errorMessage = 'Error al procesar los datos cargados';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.errorMessage = 'Error al cargar los datos iniciales. Por favor, recargue la página.';

        // Initialize with empty arrays to prevent further errors
        this.availableCatalogs = [];
        this.availableCrops = [];
        this.availableCropPhases = [];
        this.requirements = [];
        this.filteredRequirements = [];

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Update the mapFormDataToApiRequest method to fix the API field mapping:
  private mapFormDataToApiRequest(formData: any): any {
    const currentUser = this.authService.getCurrentUser();

    // Get the selected crop phase to extract the phaseId
    const selectedCropPhase = this.availableCropPhases.find(phase =>
      phase.id === Number(formData.cropPhaseId)
    );

    return {
      // Basic fields - ensure proper type conversion to numbers
      cropPhaseId: Number(selectedCropPhase?.id) || 0,
      phaseId: Number(selectedCropPhase?.id) || 0,
      name: formData.name || '',
      description: formData.description || '',
      notes: formData.notes || '',

      // Macronutrients - Fixed field names to match API exactly
      ec: Number(formData.ec) || 0,
      hco3: Number(formData.hco3) || 0,    // Changed from hcO3
      no3: Number(formData.no3) || 0,      // Changed from nO3
      h2po4: Number(formData.h2po4) || 0,  // Changed from h2PO4
      so4: Number(formData.so4) || 0,      // Changed from sO4
      cl: Number(formData.cl) || 0,
      nh4: Number(formData.nh4) || 0,      // Changed from nH4
      k: Number(formData.k) || 0,
      ca: Number(formData.ca) || 0,
      mg: Number(formData.mg) || 0,
      na: Number(formData.na) || 0,

      // Micronutrients - ensure all are numbers
      fe: Number(formData.fe) || 0,
      mn: Number(formData.mn) || 0,
      zn: Number(formData.zn) || 0,
      cu: Number(formData.cu) || 0,
      b: Number(formData.b) || 0,
      mo: Number(formData.mo) || 0,

      // Solution properties - Fixed field name
      ph: Number(formData.ph) || 6.5,      // Changed from pH
      temperature: Number(formData.temperature) || 22,

      // Status fields - ensure proper types
      active: Boolean(formData.active),
      createdBy: Number(currentUser?.id) || 1
    };
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}