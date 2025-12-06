// src/app/features/production-units/production-unit-list/production-unit-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductionUnitService, ProductionUnitCreateRequest, ProductionUnitUpdateRequest } from '../services/production-unit.service';
import { FarmService } from '../../farms/services/farm.service';
import { ProductionUnit, ProductionUnitType, Farm } from '../../../core/models/models';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-production-unit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './production-unit-list.component.html',
  styleUrls: ['./production-unit-list.component.css']
})
export class ProductionUnitListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data observables and arrays
  productionUnits$: Observable<ProductionUnit[]> | undefined;
  farms: Farm[] = [];
  productionUnitTypes: ProductionUnitType[] = [];

  // Filter properties
  onlyActive = true;
  selectedFarmId = '';
  selectedTypeId = '';
  searchTerm = '';

  // Loading and state flags
  isLoading = false;
  isLoadingFarms = false;
  isLoadingTypes = false;
  isSubmitting = false;

  // Messages
  errorMessage = '';
  successMessage = '';
  formErrorMessage = '';

  // Modal states
  showModal = false;
  showViewModal = false;
  isEditMode = false;

  // Selected production unit
  selectedUnit: ProductionUnit | null = null;

  // Form
  productionUnitForm!: FormGroup;

  constructor(
    private productionUnitService: ProductionUnitService,
    private farmService: FarmService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadFarms();
    this.loadProductionUnitTypes();
    this.loadProductionUnits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the form with validation
   */
  initForm(): void {
    this.productionUnitForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      farmId: [null, Validators.required],
      productionUnitTypeId: [null, Validators.required],
      area: [null, [Validators.min(0)]],
      capacity: [null, [Validators.min(0)]],
      location: [''],
      soilType: [''],
      drainage: [''],
      irrigation: [false],
      greenhouseType: [''],
      climateControl: [false],
      ventilation: [''],
      lightingSystem: [''],
      isActive: [true]
    });
  }


  // INPUT unit.productionUnitTypeId
  getProductionTypeName(typeId: number | undefined): string | undefined {
    const type = this.productionUnitTypes.find(t => t.id === typeId);
    return type ? type.name : undefined;
  }

  /**
   * Load production units with filters
   */
  loadProductionUnits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Build filter parameters
    const filters = {
      onlyActive: this.onlyActive,
      farmId: this.selectedFarmId ? parseInt(this.selectedFarmId, 10) : null,
      productionUnitTypeId: this.selectedTypeId ? parseInt(this.selectedTypeId, 10) : null,
      searchTerm: this.searchTerm.trim()
    };

    this.productionUnits$ = this.productionUnitService.getAll(filters).pipe(
      map((units: any) => {
        // Check if response is an object with productionUnits property
        if (units && units.productionUnits) {
          if (!Array.isArray(units.productionUnits)) {
            console.warn('API returned non-array for production units:', units.productionUnits);
            return [];
          }
          return units.productionUnits;
        }
        // Check if it's already an array
        if (Array.isArray(units)) {
          return units;
        }
        // Check for alternative property names
        if (units && units.items && Array.isArray(units.items)) {
          return units.items;
        }
        if (units && units.data && Array.isArray(units.data)) {
          return units.data;
        }
        console.warn('API returned invalid production units data');
        return [];
      }),
      catchError(error => {
        console.error('Error loading production units:', error);
        this.errorMessage = 'Error al cargar las unidades de producción';
        this.isLoading = false;
        return of([]);
      }),
      takeUntil(this.destroy$)
    );

    this.productionUnits$.subscribe({
      next: (units) => {
        this.isLoading = false;
        console.log(`Loaded ${units.length} production units`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar las unidades de producción';
        console.error('Error loading production units:', error);
      }
    });
  }

  getFarmName(farmId: number | undefined): string | undefined {
    const farm = this.farms.find(f => f.id === farmId);
    return farm ? farm.name : undefined;
  }

  /**
   * Load farms for dropdown
   */
  private loadFarms(): void {
    this.isLoadingFarms = true;

    this.farmService.getAll(true)
      .pipe(
        map(farms => {
          if (!farms || !Array.isArray(farms)) {
            console.warn('API returned invalid farms data');
            return [];
          }
          return farms;
        }),
        catchError(error => {
          console.error('Error loading farms:', error);
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (farms: Farm[]) => {
          this.farms = farms;
          this.isLoadingFarms = false;
          console.log(`Loaded ${farms.length} farms`);
        },
        error: (error) => {
          this.isLoadingFarms = false;
          console.error('Error loading farms:', error);
        }
      });
  }

  /**
   * Load production unit types for dropdown
   */
  private loadProductionUnitTypes(): void {
    this.isLoadingTypes = true;

    this.productionUnitService.getAllTypes()
      .pipe(
        map((response: any) => {
          console.log('Production unit types API response:', response);
          const types = response.productionUnitTypes || [];
          if (!Array.isArray(types)) {
            console.warn('API returned invalid types data');
            return [];
          }
          return types;
        }),
        catchError(error => {
          console.error('Error loading production unit types:', error);
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (types: ProductionUnitType[]) => {
          this.productionUnitTypes = types;
          this.isLoadingTypes = false;
          console.log(`Loaded ${types.length} production unit types`);
        },
        error: (error) => {
          this.isLoadingTypes = false;
          console.error('Error loading production unit types:', error);
        }
      });
  }

  /**
   * Open create modal
   */
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedUnit = null;
    this.productionUnitForm.reset({
      isActive: true,
      irrigation: false,
      climateControl: false
    });
    this.formErrorMessage = '';
    this.showModal = true;
  }

  /**
   * Open edit modal
   */
  openEditModal(unit: ProductionUnit): void {
    this.isEditMode = true;
    this.selectedUnit = unit;
    this.productionUnitForm.patchValue({
      name: unit.name,
      description: unit.description,
      farmId: unit.farmId,
      productionUnitTypeId: unit.productionUnitTypeId,
      area: unit.area,
      capacity: unit.capacity,
      location: unit.location,
      soilType: unit.soilType,
      drainage: unit.drainage,
      irrigation: unit.irrigation || false,
      greenhouseType: unit.greenhouseType,
      climateControl: unit.climateControl || false,
      ventilation: unit.ventilation,
      lightingSystem: unit.lightingSystem,
      isActive: unit.isActive
    });
    this.formErrorMessage = '';
    this.showModal = true;
  }

  /**
   * Close create/edit modal
   */
  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedUnit = null;
    this.productionUnitForm.reset();
    this.formErrorMessage = '';
  }

  /**
   * Save production unit (create or update)
   */
  saveProductionUnit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.productionUnitForm.controls).forEach(key => {
      this.productionUnitForm.get(key)?.markAsTouched();
    });

    if (this.productionUnitForm.invalid) {
      this.formErrorMessage = 'Por favor complete todos los campos requeridos correctamente';
      return;
    }

    this.isSubmitting = true;
    this.formErrorMessage = '';

    const formValue = this.productionUnitForm.value;

    if (this.isEditMode && this.selectedUnit) {
      // Update existing production unit
      const updateData: ProductionUnitUpdateRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        farmId: formValue.farmId,
        productionUnitTypeId: formValue.productionUnitTypeId,
        area: formValue.area || undefined,
        capacity: formValue.capacity || undefined,
        location: formValue.location || undefined,
        soilType: formValue.soilType || undefined,
        drainage: formValue.drainage || undefined,
        irrigation: formValue.irrigation,
        greenhouseType: formValue.greenhouseType || undefined,
        climateControl: formValue.climateControl,
        ventilation: formValue.ventilation || undefined,
        lightingSystem: formValue.lightingSystem || undefined,
        isActive: formValue.isActive
      };

      this.productionUnitService.update(this.selectedUnit.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUnit) => {
            this.isSubmitting = false;
            this.successMessage = `Unidad de producción "${updatedUnit.name}" actualizada correctamente`;
            this.closeModal();
            this.loadProductionUnits();
            // Auto-hide success message after 5 seconds
            setTimeout(() => this.successMessage = '', 5000);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.formErrorMessage = error.message || 'Error al actualizar la unidad de producción';
            console.error('Update error:', error);
          }
        });
    } else {
      // Create new production unit
      const createData: ProductionUnitCreateRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        farmId: formValue.farmId,
        productionUnitTypeId: formValue.productionUnitTypeId,
        area: formValue.area || undefined,
        capacity: formValue.capacity || undefined,
        location: formValue.location || undefined,
        soilType: formValue.soilType || undefined,
        drainage: formValue.drainage || undefined,
        irrigation: formValue.irrigation,
        greenhouseType: formValue.greenhouseType || undefined,
        climateControl: formValue.climateControl,
        ventilation: formValue.ventilation || undefined,
        lightingSystem: formValue.lightingSystem || undefined,
        isActive: formValue.isActive
      };

      console.log('Creating production unit with data:', createData);

      this.productionUnitService.create(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newUnit) => {
            this.isSubmitting = false;
            this.successMessage = `Unidad de producción "${newUnit.name}" creada correctamente`;
            console.log('Created production unit:', newUnit);
            this.closeModal();
            this.loadProductionUnits();
            // Auto-hide success message after 5 seconds
            setTimeout(() => this.successMessage = '', 5000);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.formErrorMessage = error.message || 'Error al crear la unidad de producción';
            console.error('Create error:', error);
          }
        });
    }
  }

  /**
   * View production unit details
   */
  viewDetails(unit: ProductionUnit): void {
    this.selectedUnit = unit;
    this.showViewModal = true;
  }

  /**
   * Close view modal
   */
  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedUnit = null;
  }

  /**
   * Edit from view modal
   */
  editFromView(): void {
    if (this.selectedUnit) {
      this.closeViewModal();
      this.openEditModal(this.selectedUnit);
    }
  }

  /**
   * Toggle production unit active status
   */
  toggleStatus(unit: ProductionUnit): void {
    const newStatus = !unit.isActive;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro de ${action} la unidad de producción "${unit.name}"?`)) {
      this.productionUnitService.toggleStatus(unit.id, newStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUnit) => {
            this.successMessage = `Unidad de producción "${updatedUnit.name}" ${newStatus ? 'activada' : 'desactivada'} correctamente`;
            this.loadProductionUnits();
            // Auto-hide success message after 5 seconds
            setTimeout(() => this.successMessage = '', 5000);
          },
          error: (error) => {
            this.errorMessage = `Error al ${action} la unidad de producción`;
            console.error('Toggle status error:', error);
            // Auto-hide error message after 5 seconds
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
    }
  }

  /**
   * Confirm and delete production unit
   */
  confirmDelete(unit: ProductionUnit): void {
    const confirmation = confirm(
      `¿Está seguro de eliminar la unidad de producción "${unit.name}"?\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (confirmation) {
      this.productionUnitService.delete(unit.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = `Unidad de producción "${unit.name}" eliminada correctamente`;
            this.loadProductionUnits();
            // Auto-hide success message after 5 seconds
            setTimeout(() => this.successMessage = '', 5000);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Error al eliminar la unidad de producción. Puede que esté siendo utilizada en producciones activas.';
            console.error('Delete error:', error);
            // Auto-hide error message after 5 seconds
            setTimeout(() => this.errorMessage = '', 5000);
          }
        });
    }
  }

  /**
   * TrackBy function for ngFor optimization
   */
  trackByFn(index: number, unit: ProductionUnit): number {
    return unit.id;
  }

  /**
   * Get CSS class for production unit type badge
   */
  getTypeClass(typeName: string | undefined): string {
    if (!typeName) {
      return 'bg-secondary';
    }

    const typeClasses: { [key: string]: string } = {
      'Invernadero': 'bg-success',
      'Campo Abierto': 'bg-primary',
      'Hidropónico': 'bg-info',
      'Vivero': 'bg-warning text-dark',
      'Almacén': 'bg-secondary',
      'Túnel': 'bg-success',
      'Cultivo Vertical': 'bg-info',
      'Acuapónico': 'bg-primary'
    };

    return typeClasses[typeName] || 'bg-secondary';
  }

  /**
   * Get count of active production units
   */
  getActiveCount(units: ProductionUnit[]): number {
    if (!units || !Array.isArray(units)) {
      return 0;
    }
    return units.filter(unit => unit.isActive).length;
  }

  /**
   * Get total area of all production units
   */
  getTotalArea(units: ProductionUnit[]): number {
    if (!units || !Array.isArray(units)) {
      return 0;
    }
    return units.reduce((total, unit) => total + (unit.area || 0), 0);
  }

  /**
   * Get total capacity of all production units
   */
  getTotalCapacity(units: ProductionUnit[]): number {
    if (!units || !Array.isArray(units)) {
      return 0;
    }
    return units.reduce((total, unit) => total + (unit.capacity || 0), 0);
  }
}
