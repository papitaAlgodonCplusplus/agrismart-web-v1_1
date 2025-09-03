// src/app/features/production-units/production-unit-list/production-unit-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductionUnitService } from '../services/production-unit.service';
import { ProductionUnit } from '../../../core/models/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-production-unit-list',
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Lista de Unidades de Producción</h2>
          <hr>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row align-items-end">
            <div class="col-md-3">
              <label class="form-label">Solo Activas</label>
              <div class="form-check">
                <input 
                  type="checkbox" 
                  id="onlyActives"
                  class="form-check-input" 
                  [(ngModel)]="onlyActive"
                  (change)="loadProductionUnits()">
                <label class="form-check-label" for="onlyActives">
                  Mostrar solo activas
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Finca</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedFarmId"
                (change)="loadProductionUnits()">
                <option value="">Todas las fincas</option>
                <option *ngFor="let farm of farms" [value]="farm.id">
                  {{ farm.name }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary" (click)="loadProductionUnits()">
                <i class="bi bi-search me-1"></i>Consultar
              </button>
            </div>
            <div class="col-md-2">
              <button class="btn btn-success" (click)="createNew()">
                <i class="bi bi-plus me-1"></i>Nueva
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Buscar unidades de producción..."
              [(ngModel)]="searchTerm"
              (keyup.enter)="loadProductionUnits()">
            <button class="btn btn-outline-secondary" (click)="loadProductionUnits()">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="row" *ngIf="isLoading">
        <div class="col-12 text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando unidades de producción...</p>
        </div>
      </div>

      <!-- Production Units Table -->
      <div class="row" *ngIf="!isLoading && (productionUnits$ | async) as productionUnits">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-grid me-2"></i>
                Unidades de Producción ({{ productionUnits.length }})
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Finca</th>
                      <th>Área (m²)</th>
                      <th>Capacidad</th>
                      <th>Estado</th>
                      <th>Última Actualización</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let unit of productionUnits; trackBy: trackByFn">
                      <td>
                        <span class="badge bg-secondary">{{ unit.id }}</span>
                      </td>
                      <td>
                        <strong>{{ unit.name }}</strong>
                        <div class="text-muted small" *ngIf="unit.description">
                          {{ unit.description | slice:0:50 }}{{ unit.description.length > 50 ? '...' : '' }}
                        </div>
                      </td>
                      <td>
                        <span class="badge" 
                              [ngClass]="getTypeClass(unit.productionUnitType?.name)">
                          <i class="bi bi-tag me-1"></i>
                          {{ unit.productionUnitType?.name || 'Sin tipo' }}
                        </span>
                      </td>
                      <td>
                        <i class="bi bi-geo-alt me-1"></i>
                        {{ unit.farm?.name || 'Sin finca' }}
                      </td>
                      <td>
                        <i class="bi bi-arrows-fullscreen me-1"></i>
                        {{ unit.area | number:'1.2-2' }}
                      </td>
                      <td>
                        <i class="bi bi-stack me-1"></i>
                        {{ unit.capacity || 'N/A' }}
                      </td>
                      <td>
                        <span class="badge" [ngClass]="unit.isActive ? 'bg-success' : 'bg-danger'">
                          <i class="bi" [ngClass]="unit.isActive ? 'bi-check-circle' : 'bi-x-circle'"></i>
                          {{ unit.isActive ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td>
                        <small class="text-muted">
                          {{ unit.updatedAt || unit.createdAt | date:'short' }}
                        </small>
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-info"
                            (click)="view(unit)"
                            title="Ver detalles">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-primary"
                            (click)="edit(unit)"
                            title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            (click)="delete(unit)"
                            title="Eliminar">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty State -->
                <div class="text-center p-4" *ngIf="productionUnits.length === 0">
                  <i class="bi bi-grid display-4 text-muted"></i>
                  <h5 class="mt-3">No se encontraron unidades de producción</h5>
                  <p class="text-muted">
                    {{ onlyActive ? 'No hay unidades de producción activas' : 'No hay unidades de producción registradas' }}
                  </p>
                  <button class="btn btn-primary" (click)="createNew()">
                    <i class="bi bi-plus me-1"></i>
                    Crear primera unidad de producción
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div class="row" *ngIf="successMessage">
        <div class="col-12">
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = ''"></button>
          </div>
        </div>
      </div>

      <div class="row" *ngIf="errorMessage">
        <div class="col-12">
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
          </div>
        </div>
      </div>

      <!-- Statistics Card -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6><i class="bi bi-bar-chart me-2"></i>Estadísticas</h6>
            </div>
            <div class="card-body" *ngIf="(productionUnits$ | async) as productionUnits">
              <div class="row text-center">
                <div class="col-md-3">
                  <div class="border-end">
                    <h4 class="text-primary">{{ productionUnits.length }}</h4>
                    <small class="text-muted">Total</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="border-end">
                    <h4 class="text-success">{{ getActiveCount(productionUnits) }}</h4>
                    <small class="text-muted">Activas</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="border-end">
                    <h4 class="text-warning">{{ getTotalArea(productionUnits) | number:'1.2-2' }}</h4>
                    <small class="text-muted">Área Total (m²)</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <h4 class="text-info">{{ getTotalCapacity(productionUnits) | number }}</h4>
                  <small class="text-muted">Capacidad Total</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th {
      border-top: none;
      font-weight: 600;
    }
    .btn-group .btn {
      border-radius: 0.375rem;
      margin-right: 2px;
    }
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid rgba(0, 0, 0, 0.125);
    }
    .table-responsive {
      border-radius: 0.375rem;
    }
  `]
})
export class ProductionUnitListComponent implements OnInit {
  productionUnits$: Observable<ProductionUnit[]> | undefined;
  farms: any[] = [];
  onlyActive = true;
  selectedFarmId = '';
  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private productionUnitService: ProductionUnitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFarms();
    this.loadProductionUnits();
  }

  loadProductionUnits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Build filter parameters
    const filters = {
      onlyActive: this.onlyActive,
      farmId: this.selectedFarmId ? parseInt(this.selectedFarmId, 10) : null,
      searchTerm: this.searchTerm.trim()
    };

    this.productionUnits$ = this.productionUnitService.getAll(filters);
    
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

  private loadFarms(): void {
    // This should be injected FarmService
    // For now, mock data
    this.farms = [
      { id: 1, name: 'Finca Norte' },
      { id: 2, name: 'Finca Sur' },
      { id: 3, name: 'Finca Este' }
    ];
  }

  createNew(): void {
    this.router.navigate(['/production-units/new']);
  }

  view(unit: ProductionUnit): void {
    this.router.navigate(['/production-units', unit.id]);
  }

  edit(unit: ProductionUnit): void {
    this.router.navigate(['/production-units', unit.id, 'edit']);
  }

  delete(unit: ProductionUnit): void {
    if (confirm(`¿Está seguro de eliminar la unidad de producción "${unit.name}"?`)) {
      this.productionUnitService.delete(unit.id).subscribe({
        next: () => {
          this.successMessage = 'Unidad de producción eliminada correctamente';
          this.loadProductionUnits();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la unidad de producción';
          console.error('Delete error:', error);
        }
      });
    }
  }

  trackByFn(index: number, unit: ProductionUnit): number {
    return unit.id;
  }

  getTypeClass(typeName: string | undefined): string {
    if (typeName === undefined){
      typeName =  'Invernadero'
    }

    const typeClasses: { [key: string]: string } = {
      'Invernadero': 'bg-success',
      'Campo Abierto': 'bg-primary',
      'Hidropónico': 'bg-info',
      'Vivero': 'bg-warning',
      'Almacén': 'bg-secondary'
    };
    return typeClasses[typeName] || 'bg-light text-dark';
  }

  getActiveCount(units: ProductionUnit[]): number {
    return units.filter(unit => unit.isActive).length;
  }

  getTotalArea(units: ProductionUnit[]): number {
    return units.reduce((total, unit) => total + (unit.area || 0), 0);
  }

  getTotalCapacity(units: ProductionUnit[]): number {
    return units.reduce((total, unit) => total + (unit.capacity || 0), 0);
  }
}