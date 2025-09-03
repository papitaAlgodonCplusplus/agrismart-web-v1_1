// src/app/features/crop-production/crop-production-list/crop-production-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CropProductionService } from '../services/crop-production.service';
import { CropProduction } from '../../../core/models/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-crop-production-list',
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Lista de Producciones de Cultivo</h2>
          <hr>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row align-items-end">
            <div class="col-md-2">
              <label class="form-label">Solo Activas</label>
              <div class="form-check">
                <input 
                  type="checkbox" 
                  id="onlyActives"
                  class="form-check-input" 
                  [(ngModel)]="onlyActive"
                  (change)="loadCropProductions()">
                <label class="form-check-label" for="onlyActives">
                  Mostrar solo activas
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Estado</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedStatus"
                (change)="loadCropProductions()">
                <option value="">Todos los estados</option>
                <option value="Preparacion">Preparación</option>
                <option value="Siembra">Siembra</option>
                <option value="Crecimiento">Crecimiento</option>
                <option value="Floracion">Floración</option>
                <option value="Fructificacion">Fructificación</option>
                <option value="Cosecha">Cosecha</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Cultivo</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedCropId"
                (change)="loadCropProductions()">
                <option value="">Todos los cultivos</option>
                <option *ngFor="let crop of crops" [value]="crop.id">
                  {{ crop.name }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary" (click)="loadCropProductions()">
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
              placeholder="Buscar producciones..."
              [(ngModel)]="searchTerm"
              (keyup.enter)="loadCropProductions()">
            <button class="btn btn-outline-secondary" (click)="loadCropProductions()">
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
          <p class="mt-2">Cargando producciones de cultivo...</p>
        </div>
      </div>

      <!-- Crop Productions Table -->
      <div class="row" *ngIf="!isLoading && (cropProductions$ | async) as cropProductions">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-seedling me-2"></i>
                Producciones de Cultivo ({{ cropProductions.length }})
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Código</th>
                      <th>Cultivo</th>
                      <th>Unidad de Producción</th>
                      <th>Estado</th>
                      <th>Fecha Siembra</th>
                      <th>Fecha Est. Cosecha</th>
                      <th>Progreso</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let production of cropProductions; trackBy: trackByFn">
                      <td>
                        <span class="badge bg-secondary">{{ production.id }}</span>
                      </td>
                      <td>
                        <strong>{{ production.code || 'CP-' + production.id }}</strong>
                        <div class="text-muted small" *ngIf="production.description">
                          {{ production.description | slice:0:30 }}{{ production.description.length > 30 ? '...' : '' }}
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="bi bi-flower1 me-2 text-success"></i>
                          <div>
                            <strong>{{ production.crop?.name || 'Sin cultivo' }}</strong>
                            <div class="text-muted small">{{ production.crop?.variety || '' }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <i class="bi bi-grid-3x3-gap me-1"></i>
                        {{ production.productionUnit?.name || 'Sin unidad' }}
                        <div class="text-muted small">
                          <i class="bi bi-geo-alt"></i>
                          {{ production.productionUnit?.farm?.name || '' }}
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getStatusClass(production.status)">
                          <i class="bi" [ngClass]="getStatusIcon(production.status)"></i>
                          {{ getStatusText(production.status) }}
                        </span>
                      </td>
                      <td>
                        <i class="bi bi-calendar-date me-1"></i>
                        {{ production.plantingDate | date:'shortDate' }}
                      </td>
                      <td>
                        <i class="bi bi-calendar-check me-1"></i>
                        {{ production.estimatedHarvestDate | date:'shortDate' }}
                        <div class="text-muted small" *ngIf="getDaysToHarvest(production.estimatedHarvestDate) !== null">
                          {{ getDaysToHarvest(production.estimatedHarvestDate) > 0 ? 
                             getDaysToHarvest(production.estimatedHarvestDate) + ' días restantes' : 
                             'Listo para cosecha' }}
                        </div>
                      </td>
                      <td>
                        <div class="progress" style="width: 100px; height: 20px;">
                          <div 
                            class="progress-bar"
                            [class.bg-success]="production.progress >= 100"
                            [class.bg-info]="production.progress < 100"
                            [style.width.%]="production.progress">
                            {{ production.progress }}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-info"
                            (click)="view(production)"
                            title="Ver detalles">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-primary"
                            (click)="edit(production)"
                            title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-success"
                            (click)="manageIrrigation(production)"
                            title="Gestionar irrigación">
                            <i class="bi bi-droplet"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            (click)="delete(production)"
                            title="Eliminar">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty State -->
                <div class="text-center p-4" *ngIf="cropProductions.length === 0">
                  <i class="bi bi-seedling display-4 text-muted"></i>
                  <h5 class="mt-3">No se encontraron producciones de cultivo</h5>
                  <p class="text-muted">
                    {{ getEmptyStateMessage() }}
                  </p>
                  <button class="btn btn-primary" (click)="createNew()">
                    <i class="bi bi-plus me-1"></i>
                    Crear primera producción de cultivo
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

      <!-- Statistics Cards -->
      <div class="row mt-4" *ngIf="(cropProductions$ | async) as cropProductions">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ cropProductions.length }}</h4>
                  <p class="mb-0">Total Producciones</p>
                </div>
                <i class="bi bi-seedling display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getProductionsByStatus(cropProductions, 'Crecimiento').length }}</h4>
                  <p class="mb-0">En Crecimiento</p>
                </div>
                <i class="bi bi-graph-up-arrow display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getProductionsByStatus(cropProductions, 'Cosecha').length }}</h4>
                  <p class="mb-0">Listas para Cosecha</p>
                </div>
                <i class="bi bi-scissors display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getAverageProgress(cropProductions) | number:'1.0-0' }}%</h4>
                  <p class="mb-0">Progreso Promedio</p>
                </div>
                <i class="bi bi-bar-chart display-6"></i>
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
    .progress {
      border-radius: 10px;
    }
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid rgba(0, 0, 0, 0.125);
    }
  `]
})
export class CropProductionListComponent implements OnInit {
  cropProductions$: Observable<CropProduction[]> | undefined;
  crops: any[] = [];
  onlyActive = true;
  selectedStatus = '';
  selectedCropId = '';
  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private cropProductionService: CropProductionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCrops();
    this.loadCropProductions();
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

    this.cropProductions$ = this.cropProductionService.getAll(filters);
    
    this.cropProductions$.subscribe({
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
    // This should use CropService
    // For now, mock data
    this.crops = [
      { id: 1, name: 'Tomate' },
      { id: 2, name: 'Lechuga' },
      { id: 3, name: 'Pepino' },
      { id: 4, name: 'Pimiento' }
    ];
  }

  createNew(): void {
    this.router.navigate(['/crop-production/new']);
  }

  view(production: CropProduction): void {
    this.router.navigate(['/crop-production', production.id]);
  }

  edit(production: CropProduction): void {
    this.router.navigate(['/crop-production', production.id, 'edit']);
  }

  manageIrrigation(production: CropProduction): void {
    this.router.navigate(['/crop-production', production.id, 'irrigation']);
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

  getStatusClass(status: string): string {
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

  getStatusIcon(status: string): string {
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

  getStatusText(status: string): string {
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

  getDaysToHarvest(harvestDate: Date | string | null): number | null {
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
    return productions.filter(p => p.status === status);
  }

  getAverageProgress(productions: CropProduction[]): number {
    if (productions.length === 0) return 0;
    const total = productions.reduce((sum, p) => sum + (p.progress || 0), 0);
    return total / productions.length;
  }
}