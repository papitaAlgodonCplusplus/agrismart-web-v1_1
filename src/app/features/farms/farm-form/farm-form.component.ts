// src/app/features/farms/farm-form/farm-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FarmService } from '../services/farm.service';
import { CompanyService } from '../../companies/services/company.service';
import { Farm } from '../../../core/models/models';
import { Company } from '../../../core/models/models';

@Component({
  selector: 'app-farm-form',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h2>{{ isEditMode ? 'Editar' : 'Nueva' }} Finca</h2>
          <hr>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <form [formGroup]="farmForm" (ngSubmit)="onSubmit()">
            <div class="card">
              <div class="card-header">
                <h5>Información de la Finca</h5>
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
                        placeholder="Ingrese el nombre de la finca">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                        El nombre es requerido
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="companyId" class="form-label">Empresa *</label>
                      <select 
                        id="companyId"
                        class="form-select"
                        formControlName="companyId"
                        [class.is-invalid]="isFieldInvalid('companyId')">
                        <option value="">Seleccione una empresa</option>
                        <option 
                          *ngFor="let company of companies" 
                          [value]="company.id">
                          {{ company.name }}
                        </option>
                      </select>
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('companyId')">
                        La empresa es requerida
                      </div>
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
                        placeholder="Descripción de la finca (opcional)">
                      </textarea>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="location" class="form-label">Ubicación</label>
                      <input 
                        type="text" 
                        id="location"
                        class="form-control"
                        formControlName="location"
                        placeholder="Ubicación de la finca">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="area" class="form-label">Área (hectáreas)</label>
                      <input 
                        type="number" 
                        id="area"
                        class="form-control"
                        formControlName="area"
                        min="0"
                        step="0.01"
                        placeholder="0.00">
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
                        Activa
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
                    [disabled]="farmForm.invalid || isLoading">
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
                Complete la información de la finca. Los campos marcados con (*) son obligatorios.
              </p>
              <hr>
              <div class="row text-center" *ngIf="isEditMode && farm">
                <div class="col-6">
                  <small class="text-muted">Creada</small>
                  <div>{{ farm.createdAt | date:'short' }}</div>
                </div>
                <div class="col-6" *ngIf="farm.updatedAt">
                  <small class="text-muted">Actualizada</small>
                  <div>{{ farm.updatedAt | date:'short' }}</div>
                </div>
              </div>
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
export class FarmFormComponent implements OnInit {
  farmForm: FormGroup;
  companies: Company[] = [];
  farm: Farm | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  farmId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private farmService: FarmService,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.farmForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      companyId: ['', [Validators.required]],
      location: ['', [Validators.maxLength(200)]],
      area: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.checkEditMode();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.farmId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadFarm(this.farmId);
    }
  }

  private loadCompanies(): void {
    this.companyService.getAll(true).subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las empresas';
        console.error('Error loading companies:', error);
      }
    });
  }

  private loadFarm(id: number): void {
    this.isLoading = true;
    this.farmService.getById(id).subscribe({
      next: (farm) => {
        this.farm = farm;
        this.farmForm.patchValue({
          name: farm.name,
          description: farm.description,
          companyId: farm.companyId,
          location: farm.location,
          area: farm.area,
          isActive: farm.isActive
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar la finca';
        this.isLoading = false;
        console.error('Error loading farm:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.farmForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const farmData = {
        ...this.farmForm.value,
        companyId: parseInt(this.farmForm.value.companyId, 10)
      };

      const operation = this.isEditMode
        ? this.farmService.update(this.farmId!, farmData)
        : this.farmService.create(farmData);

      operation.subscribe({
        next: (farm) => {
          this.isLoading = false;
          this.router.navigate(['/farms']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al guardar la finca';
          console.error('Error saving farm:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/farms']);
  }

  isFieldInvalid(field: string): boolean {
    const formField = this.farmForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.farmForm.controls).forEach(key => {
      const control = this.farmForm.get(key);
      control?.markAsTouched();
    });
  }
}