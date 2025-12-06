// src/app/features/crop-production/crop-production-list/crop-production-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CropProductionService, CropProductionCreateRequest, CropProductionUpdateRequest } from '../services/crop-production.service';
import { CropService } from '../../crops/services/crop.service';
import { ProductionUnitService } from '../../production-units/services/production-unit.service';
import { CropProduction, Crop, ProductionUnit } from '../../../core/models/models';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-crop-production-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './crop-production-list.component.html',
  styleUrls: ['./crop-production-list.component.css']
})
export class CropProductionListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  cropProductions$: Observable<CropProduction[]> | undefined;
  crops: Crop[] = [];
  productionUnits: any[] = [];
  containers: any[] = [];
  growingMediums: any[] = [];
  droppers: any[] = [];
  onlyActive = true;
  selectedStatus = '';
  selectedCropId = '';
  searchTerm = '';
  isLoading = false;
  isLoadingCrops = false;
  isLoadingUnits = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  formErrorMessage = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showViewModal = false;
  showIrrigationModal = false;
  selectedProduction: CropProduction | null = null;

  // Form
  productionForm!: FormGroup;
  statusOptions = ['Preparacion', 'Siembra', 'Crecimiento', 'Floracion', 'Fructificacion', 'Cosecha', 'Finalizada'];

  constructor(
    private cropProductionService: CropProductionService,
    private cropService: CropService,
    private productionUnitService: ProductionUnitService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCrops();
    this.loadProductionUnits();
    this.loadContainers();
    this.loadGrowingMediums();
    this.loadDroppers();
    this.loadCropProductions();
  }

  initForm(): void {
    this.productionForm = this.fb.group({
      cropId: [null, Validators.required],
      productionUnitId: [null, Validators.required],
      name: ['', Validators.required],
      containerId: [null, Validators.required],
      growingMediumId: [null, Validators.required],
      dropperId: [null, Validators.required],
      width: [null, [Validators.required, Validators.min(0)]],
      length: [null, [Validators.required, Validators.min(0)]],
      betweenRowDistance: [null, [Validators.required, Validators.min(0)]],
      betweenContainerDistance: [null, [Validators.required, Validators.min(0)]],
      betweenPlantDistance: [null, [Validators.required, Validators.min(0)]],
      plantsPerContainer: [null, [Validators.required, Validators.min(1)]],
      numberOfDroppersPerContainer: [null, [Validators.required, Validators.min(0)]],
      windSpeedMeasurementHeight: [null, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      altitude: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      depletionPercentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      drainThreshold: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCropProductions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Build filter parameters
    const filters = {
      onlyActive: this.onlyActive,
      status: this.selectedStatus,
      cropId: this.selectedCropId ? parseInt(this.selectedCropId, 10) : null,
      searchTerm: this.searchTerm.trim()
    };

    this.cropProductions$ = this.cropProductionService.getAll(filters).pipe(
      map((productions: any) => {
        console.log('Raw crop productions response:', productions);
        // Ensure we always have an array
        if (!productions.cropProductions) {
          console.warn('API returned undefined/null for crop productions');
          return [];
        }
        if (!Array.isArray(productions.cropProductions)) {
          console.warn('API returned non-array for crop productions:', productions.cropProductions);
           
          return [];
        }
        return productions.cropProductions;
      }),
      catchError(error => {
        console.error('Error loading crop productions:', error);
        this.errorMessage = 'Error al cargar las producciones de cultivo';
        this.isLoading = false;
        return of([]);
      })
    );

    this.cropProductions$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (productions) => {
        this.isLoading = false;
        console.log(`Loaded ${productions.length} crop productions`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar las producciones de cultivo';
        console.error('Error loading crop productions:', error);
      }
    });
  }

  private loadCrops(): void {
    this.isLoadingCrops = true;

    this.cropService.getAll(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (crops: Crop[]) => {
          this.crops = crops;
          this.isLoadingCrops = false;
          console.log(`Loaded ${crops.length} crops`);
        },
        error: (error) => {
          this.isLoadingCrops = false;
          console.error('Error loading crops:', error);
          this.errorMessage = 'Error al cargar el catálogo de cultivos';
        }
      });
  }

  private loadProductionUnits(): void {
    this.isLoadingUnits = true;

    this.productionUnitService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (units: any) => {
          console.log('Raw production units response:', units);
          this.productionUnits = units.productionUnits;
          this.isLoadingUnits = false;
          console.log(`Loaded ${units.length} production units`);
        },
        error: (error) => {
          this.isLoadingUnits = false;
          console.error('Error loading production units:', error);
          this.errorMessage = 'Error al cargar las unidades de producción';
        }
      });
  }

  private loadContainers(): void {
    // TODO: Replace with actual API call when endpoint is available
    this.containers = [
      { id: 1, name: 'Maceta Estándar' },
      { id: 2, name: 'Maceta Grande' },
      { id: 3, name: 'Contenedor NFT' },
      { id: 4, name: 'Bolsa de Cultivo' }
    ];
  }

  private loadGrowingMediums(): void {
    // TODO: Replace with actual API call when endpoint is available
    this.growingMediums = [
      { id: 1, name: 'Tierra' },
      { id: 2, name: 'Fibra de Coco' },
      { id: 3, name: 'Perlita' },
      { id: 4, name: 'Vermiculita' },
      { id: 5, name: 'Mezcla Hidropónica' }
    ];
  }

  private loadDroppers(): void {
    // TODO: Replace with actual API call when endpoint is available
    this.droppers = [
      { id: 1, name: 'Gotero 2L/h' },
      { id: 2, name: 'Gotero 4L/h' },
      { id: 3, name: 'Gotero 8L/h' },
      { id: 4, name: 'Microaspersor' }
    ];
  }

  createNew(): void {
    this.selectedProduction = null;
    this.formErrorMessage = '';
    this.productionForm.reset({
      cropId: null,
      productionUnitId: null,
      name: '',
      containerId: null,
      growingMediumId: null,
      dropperId: null,
      width: null,
      length: null,
      betweenRowDistance: null,
      betweenContainerDistance: null,
      betweenPlantDistance: null,
      plantsPerContainer: null,
      numberOfDroppersPerContainer: null,
      windSpeedMeasurementHeight: 2,
      startDate: '',
      endDate: '',
      altitude: 0,
      latitude: null,
      longitude: null,
      depletionPercentage: 50,
      drainThreshold: 10
    });
    this.showCreateModal = true;
  }

  view(production: CropProduction): void {
    this.selectedProduction = production;
    this.showViewModal = true;
  }

  edit(production: CropProduction): void {
    this.selectedProduction = production;
    this.formErrorMessage = '';

    // Populate form with existing values
    // Note: Some fields may not exist in the production object if it was created with old schema
    this.productionForm.patchValue({
      cropId: production.cropId,
      productionUnitId: production.productionUnitId,
      name: (production as any).name || production.code || '',
      containerId: (production as any).containerId || null,
      growingMediumId: (production as any).growingMediumId || null,
      dropperId: (production as any).dropperId || null,
      width: (production as any).width || null,
      length: (production as any).length || null,
      betweenRowDistance: (production as any).betweenRowDistance || null,
      betweenContainerDistance: (production as any).betweenContainerDistance || null,
      betweenPlantDistance: (production as any).betweenPlantDistance || null,
      plantsPerContainer: (production as any).plantsPerContainer || null,
      numberOfDroppersPerContainer: (production as any).numberOfDroppersPerContainer || null,
      windSpeedMeasurementHeight: (production as any).windSpeedMeasurementHeight || 2,
      startDate: (production as any).startDate ? this.formatDateForInput((production as any).startDate) : (production.plantingDate ? this.formatDateForInput(production.plantingDate) : ''),
      endDate: (production as any).endDate ? this.formatDateForInput((production as any).endDate) : (production.estimatedHarvestDate ? this.formatDateForInput(production.estimatedHarvestDate) : ''),
      altitude: (production as any).altitude || 0,
      latitude: (production as any).latitude || null,
      longitude: (production as any).longitude || null,
      depletionPercentage: (production as any).depletionPercentage || 50,
      drainThreshold: (production as any).drainThreshold || 10
    });

    this.showEditModal = true;
  }

  manageIrrigation(production: CropProduction): void {
    this.selectedProduction = production;
    this.showIrrigationModal = true;
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
    this.showIrrigationModal = false;
    this.selectedProduction = null;
    this.formErrorMessage = '';
  }

  saveProduction(): void {
    if (this.productionForm.invalid) {
      this.formErrorMessage = 'Por favor, complete todos los campos requeridos';
      Object.keys(this.productionForm.controls).forEach(key => {
        this.productionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.formErrorMessage = '';

    const formValue = this.productionForm.value;

    if (this.selectedProduction) {
      // Update existing production
      const updateData: CropProductionUpdateRequest = {
        ...formValue,
        plantingDate: formValue.plantingDate,
        estimatedHarvestDate: formValue.estimatedHarvestDate || undefined
      };

      this.cropProductionService.update(this.selectedProduction.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (production) => {
            this.isSubmitting = false;
            this.onProductionSaved();
            console.log('Production updated:', production);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.formErrorMessage = error.message || 'Error al actualizar la producción';
            console.error('Update error:', error);
          }
        });
    } else {
      // Create new production
      const createData: CropProductionCreateRequest = {
        ...formValue,
        startDate: formValue.startDate,
        endDate: formValue.endDate
      };

      console.log('Creating crop production with data:', createData);

      this.cropProductionService.create(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (production) => {
            this.isSubmitting = false;
            this.onProductionSaved();
            console.log('Production created:', production);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.formErrorMessage = error.message || 'Error al crear la producción';
            console.error('Create error:', error);
          }
        });
    }
  }

  onProductionSaved(): void {
    this.closeModal();
    this.successMessage = 'Producción guardada correctamente';
    this.loadCropProductions();

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  delete(production: CropProduction): void {
    if (confirm(`¿Está seguro de eliminar la producción "${production.code || 'CP-' + production.id}"?`)) {
      this.cropProductionService.delete(production.id).subscribe({
        next: () => {
          this.successMessage = 'Producción de cultivo eliminada correctamente';
          this.loadCropProductions();
        },
        error: (error: any) => {
          this.errorMessage = 'Error al eliminar la producción de cultivo';
          console.error('Delete error:', error);
        }
      });
    }
  }

  trackByFn(index: number, production: CropProduction): number {
    return production.id;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-light text-dark';

    const statusClasses: { [key: string]: string } = {
      'Preparacion': 'bg-secondary',
      'Siembra': 'bg-info',
      'Crecimiento': 'bg-primary',
      'Floracion': 'bg-warning',
      'Fructificacion': 'bg-success',
      'Cosecha': 'bg-danger',
      'Finalizada': 'bg-dark'
    };
    return statusClasses[status] || 'bg-light text-dark';
  }

  getStatusIcon(status: string | undefined): string {
    if (!status) return 'bi-circle';

    const statusIcons: { [key: string]: string } = {
      'Preparacion': 'bi-gear',
      'Siembra': 'bi-seed',
      'Crecimiento': 'bi-graph-up-arrow',
      'Floracion': 'bi-flower1',
      'Fructificacion': 'bi-apple',
      'Cosecha': 'bi-scissors',
      'Finalizada': 'bi-check-circle'
    };
    return statusIcons[status] || 'bi-circle';
  }

  getStatusText(status: string | undefined): string {
    if (!status) return 'Desconocido';

    const statusTexts: { [key: string]: string } = {
      'Preparacion': 'Preparación',
      'Siembra': 'Siembra',
      'Crecimiento': 'Crecimiento',
      'Floracion': 'Floración',
      'Fructificacion': 'Fructificación',
      'Cosecha': 'Cosecha',
      'Finalizada': 'Finalizada'
    };
    return statusTexts[status] || status;
  }

  getDaysToHarvest(harvestDate: Date | string | null | undefined): number | null {
    if (!harvestDate) return null;

    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  getEmptyStateMessage(): string {
    if (this.selectedStatus) {
      return `No hay producciones con estado "${this.getStatusText(this.selectedStatus)}"`;
    }
    if (this.selectedCropId) {
      const crop = this.crops.find(c => c.id.toString() === this.selectedCropId);
      return `No hay producciones del cultivo "${crop?.name}"`;
    }
    if (!this.onlyActive) {
      return 'No hay producciones de cultivo registradas';
    }
    return 'No hay producciones de cultivo activas';
  }

  getProductionsByStatus(productions: CropProduction[], status: string): CropProduction[] {
    if (!productions || !Array.isArray(productions)) {
      console.warn('getProductionsByStatus received non-array:', productions);
      return [];
    }
    return productions.filter(p => p.status === status);
  }

  getAverageProgress(productions: CropProduction[]): number {
    if (!productions || !Array.isArray(productions) || productions.length === 0) return 0;
    const total = productions.reduce((sum, p) => sum + (p.progress || 0), 0);
    return total / productions.length;
  }

  formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
