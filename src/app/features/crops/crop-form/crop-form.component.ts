// src/app/features/crops/crop-form/crop-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CropService } from '../services/crop.service';
import { Crop } from '../../../core/models/models';

@Component({
  selector: 'app-crop-form',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h2>{{ isEditMode ? 'Editar' : 'Nuevo' }} Cultivo</h2>
          <hr>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <form [formGroup]="cropForm" (ngSubmit)="onSubmit()">
            <div class="card">
              <div class="card-header">
                <h5>Información del Cultivo</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="name" class="form-label">Nombre *</label>
                      <input 
                        type="text" 
                        id="name"
                        class="form-control"
                        formControlName="name"
                        [class.is-invalid]="isFieldInvalid('name')"
                        placeholder="Nombre del cultivo">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                        El nombre es requerido
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="scientificName" class="form-label">Nombre Científico</label>
                      <input 
                        type="text" 
                        id="scientificName"
                        class="form-control"
                        formControlName="scientificName"
                        placeholder="Nombre científico">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="cropType" class="form-label">Tipo de Cultivo</label>
                      <select 
                        id="cropType"
                        class="form-select"
                        formControlName="cropType">
                        <option value="">Seleccione un tipo</option>
                        <option value="Vegetal">Vegetal</option>
                        <option value="Fruta">Fruta</option>
                        <option value="Cereal">Cereal</option>
                        <option value="Hierba">Hierba</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="variety" class="form-label">Variedad</label>
                      <input 
                        type="text" 
                        id="variety"
                        class="form-control"
                        formControlName="variety"
                        placeholder="Variedad del cultivo">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-12">
                    <div class="mb-3">
                      <label for="description" class="form-label">Descripción</label>
                      <textarea 
                        id="description"
                        class="form-control"
                        rows="3"
                        formControlName="description"
                        placeholder="Descripción del cultivo (opcional)">
                      </textarea>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="growthCycleDays" class="form-label">Ciclo de Crecimiento (días)</label>
                      <input 
                        type="number" 
                        id="growthCycleDays"
                        class="form-control"
                        formControlName="growthCycleDays"
                        min="1"
                        placeholder="90">
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="harvestSeason" class="form-label">Temporada de Cosecha</label>
                      <select 
                        id="harvestSeason"
                        class="form-select"
                        formControlName="harvestSeason">
                        <option value="">Seleccione temporada</option>
                        <option value="Primavera">Primavera</option>
                        <option value="Verano">Verano</option>
                        <option value="Otoño">Otoño</option>
                        <option value="Invierno">Invierno</option>
                        <option value="Todo el año">Todo el año</option>
                      </select>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="waterRequirement" class="form-label">Requerimiento de Agua</label>
                      <select 
                        id="waterRequirement"
                        class="form-select"
                        formControlName="waterRequirement">
                        <option value="">Seleccione nivel</option>
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="optimalTemperatureMin" class="form-label">Temperatura Mínima (°C)</label>
                      <input 
                        type="number" 
                        id="optimalTemperatureMin"
                        class="form-control"
                        formControlName="optimalTemperatureMin"
                        step="0.1"
                        placeholder="15.0">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="optimalTemperatureMax" class="form-label">Temperatura Máxima (°C)</label>
                      <input 
                        type="number" 
                        id="optimalTemperatureMax"
                        class="form-control"
                        formControlName="optimalTemperatureMax"
                        step="0.1"
                        placeholder="25.0">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3 form-check">
                      <input 
                        type="checkbox" 
                        class="form-check-input" 
                        id="isActive"
                        formControlName="isActive">
                      <label class="form-check-label" for="isActive">
                        Activo
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="d-flex justify-content-between">
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    (click)="onCancel()">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="cropForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Info Panel -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6>Información</h6>
            </div>
            <div class="card-body">
              <p class="text-muted">
                <i class="bi bi-info-circle me-2"></i>
                Complete la información del cultivo. Los campos marcados con (*) son obligatorios.
              </p>
              <hr>
              <div class="row text-center" *ngIf="isEditMode && crop">
                <div class="col-6">
                  <small class="text-muted">Creado</small>
                  <div>{{ crop.createdAt | date:'short' }}</div>
                </div>
                <div class="col-6" *ngIf="crop.updatedAt">
                  <small class="text-muted">Actualizado</small>
                  <div>{{ crop.updatedAt | date:'short' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-header">
              <h6>Consejos</h6>
            </div>
            <div class="card-body">
              <ul class="list-unstyled">
                <li><i class="bi bi-check-circle text-success me-2"></i>Defina temperaturas óptimas</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Especifique requerimientos de agua</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Indique el ciclo de crecimiento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="row" *ngIf="errorMessage">
        <div class="col-12">
          <div class="alert alert-danger mt-3" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class CropFormComponent implements OnInit {
  cropForm: FormGroup;
  crop: Crop | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  cropId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cropService: CropService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cropForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      scientificName: ['', [Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(500)]],
      cropType: [''],
      variety: ['', [Validators.maxLength(100)]],
      growthCycleDays: [null, [Validators.min(1)]],
      harvestSeason: [''],
      waterRequirement: [''],
      optimalTemperatureMin: [null],
      optimalTemperatureMax: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cropId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadCrop(this.cropId);
    }
  }

  private loadCrop(id: number): void {
    this.isLoading = true;
    this.cropService.getById(id).subscribe({
      next: (crop) => {
        this.crop = crop;
        this.cropForm.patchValue(crop);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el cultivo';
        this.isLoading = false;
        console.error('Error loading crop:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.cropForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const cropData = this.cropForm.value;

      const operation = this.isEditMode
        ? this.cropService.update(this.cropId!, cropData)
        : this.cropService.create(cropData);

      operation.subscribe({
        next: (crop) => {
          this.isLoading = false;
          this.router.navigate(['/crops']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al guardar el cultivo';
          console.error('Error saving crop:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/crops']);
  }

  isFieldInvalid(field: string): boolean {
    const formField = this.cropForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.cropForm.controls).forEach(key => {
      const control = this.cropForm.get(key);
      control?.markAsTouched();
    });
  }
}