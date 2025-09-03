// src/app/features/fertilizers/fertilizer-list/fertilizer-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FertilizerService } from '../services/fertilizer.service';
import { Fertilizer } from '../../../core/models/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-fertilizer-list',
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Lista de Fertilizantes</h2>
          <p class="text-muted">Gestión de fertilizantes y nutrientes para cultivos</p>
          <hr>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row align-items-end">
            <div class="col-md-2">
              <label class="form-label">Solo Activos</label>
              <div class="form-check">
                <input 
                  type="checkbox" 
                  id="onlyActives"
                  class="form-check-input" 
                  [(ngModel)]="onlyActive"
                  (change)="loadFertilizers()">
                <label class="form-check-label" for="onlyActives">
                  Mostrar solo activos
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Tipo de Fertilizante</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedType"
                (change)="loadFertilizers()">
                <option value="">Todos los tipos</option>
                <option value="Organico">Orgánico</option>
                <option value="Inorganico">Inorgánico</option>
                <option value="Liquido">Líquido</option>
                <option value="Solido">Sólido</option>
                <option value="Foliar">Foliar</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Categoría NPK</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedNPKCategory"
                (change)="loadFertilizers()">
                <option value="">Todas las categorías</option>
                <option value="Alto N">Alto Nitrógeno</option>
                <option value="Alto P">Alto Fósforo</option>
                <option value="Alto K">Alto Potasio</option>
                <option value="Balanceado">Balanceado</option>
                <option value="Micronutrientes">Micronutrientes</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary" (click)="loadFertilizers()">
                <i class="bi bi-search me-1"></i>Consultar
              </button>
            </div>
            <div class="col-md-2">
              <button class="btn btn-success" (click)="createNew()">
                <i class="bi bi-plus me-1"></i>Nuevo
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Buscar fertilizantes..."
              [(ngModel)]="searchTerm"
              (keyup.enter)="loadFertilizers()">
            <button class="btn btn-outline-secondary" (click)="loadFertilizers()">
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
          <p class="mt-2">Cargando fertilizantes...</p>
        </div>
      </div>

      <!-- Fertilizers Table -->
      <div class="row" *ngIf="!isLoading && (fertilizers$ | async) as fertilizers">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-droplet me-2"></i>
                Fertilizantes ({{ fertilizers.length }})
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
                      <th>Composición NPK</th>
                      <th>Concentración</th>
                      <th>Aplicación</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let fertilizer of fertilizers; trackBy: trackByFn">
                      <td>
                        <span class="badge bg-secondary">{{ fertilizer?.id }}</span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="bi bi-flask me-2" 
                             [class.text-success]="fertilizer?.type === 'Organico'"
                             [class.text-primary]="fertilizer?.type === 'Inorganico'"
                             [class.text-info]="fertilizer?.type === 'Liquido'"></i>
                          <div>
                            <strong>{{ fertilizer?.name }}</strong>
                            <div class="text-muted small" *ngIf="fertilizer?.brand">
                              {{ fertilizer?.brand }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getTypeClass(fertilizer?.type)">
                          {{ fertilizer?.type }}
                        </span>
                        <div class="text-muted small" *ngIf="fertilizer?.formulation">
                          {{ fertilizer?.formulation }}
                        </div>
                      </td>
                      <td>
                        <div class="d-flex gap-1" *ngIf="fertilizer?.nitrogenPercentage || fertilizer?.phosphorusPercentage || fertilizer?.potassiumPercentage">
                          <span class="badge bg-success" *ngIf="fertilizer?.nitrogenPercentage">
                            N: {{ fertilizer?.nitrogenPercentage }}%
                          </span>
                          <span class="badge bg-warning" *ngIf="fertilizer?.phosphorusPercentage">
                            P: {{ fertilizer?.phosphorusPercentage }}%
                          </span>
                          <span class="badge bg-info" *ngIf="fertilizer?.potassiumPercentage">
                            K: {{ fertilizer?.potassiumPercentage }}%
                          </span>
                        </div>
                        <span class="text-muted" *ngIf="!fertilizer?.nitrogenPercentage && !fertilizer?.phosphorusPercentage && !fertilizer?.potassiumPercentage">
                          No especificado
                        </span>
                      </td>
                      <td>
                        <strong>{{ fertilizer?.concentration || 'N/A' }}</strong>
                        <div class="text-muted small">{{ fertilizer?.concentrationUnit || '' }}</div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getApplicationClass(fertilizer?.applicationMethod)">
                          <i class="bi" [ngClass]="getApplicationIcon(fertilizer?.applicationMethod)"></i>
                          {{ fertilizer?.applicationMethod || 'No especificado' }}
                        </span>
                      </td>
                      <td>
                        <div class="text-center">
                          <!-- <strong [class.text-danger]="fertilizer?.currentStock <= fertilizer?.minimumStock"
                                  [class.text-warning]="fertilizer?.currentStock <= fertilizer?.minimumStock * 1.2 && fertilizer?.currentStock > fertilizer?.minimumStock"
                                  [class.text-success]="fertilizer?.currentStock > fertilizer?.minimumStock * 1.2">
                            {{ fertilizer?.currentStock || 0 }}
                          </strong> -->
                          <div class="text-muted small">{{ fertilizer?.stockUnit || 'kg' }}</div>
                          <div class="text-muted small" *ngIf="fertilizer?.minimumStock">
                            Min: {{ fertilizer?.minimumStock }}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="fertilizer?.isActive ? 'bg-success' : 'bg-danger'">
                          <i class="bi" [ngClass]="fertilizer?.isActive ? 'bi-check-circle' : 'bi-x-circle'"></i>
                          {{ fertilizer?.isActive ? 'Activo' : 'Inactivo' }}
                        </span>
                        <div class="text-muted small" *ngIf="fertilizer?.expirationDate">
                          Exp: {{ fertilizer?.expirationDate | date:'shortDate' }}
                        </div>
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-info"
                            (click)="view(fertilizer)"
                            title="Ver detalles">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-primary"
                            (click)="edit(fertilizer)"
                            title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-success"
                            (click)="adjustStock(fertilizer)"
                            title="Ajustar stock">
                            <i class="bi bi-box"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            (click)="delete(fertilizer)"
                            title="Eliminar">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty State -->
                <div class="text-center p-4" *ngIf="fertilizers.length === 0">
                  <i class="bi bi-flask display-4 text-muted"></i>
                  <h5 class="mt-3">No se encontraron fertilizantes</h5>
                  <p class="text-muted">
                    {{ getEmptyStateMessage() }}
                  </p>
                  <button class="btn btn-primary" (click)="createNew()">
                    <i class="bi bi-plus me-1"></i>
                    Registrar primer fertilizante
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
      <div class="row mt-4" *ngIf="(fertilizers$ | async) as fertilizers">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ fertilizers.length }}</h4>
                  <p class="mb-0">Total Fertilizantes</p>
                </div>
                <i class="bi bi-flask display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getOrganicCount(fertilizers) }}</h4>
                  <p class="mb-0">Orgánicos</p>
                </div>
                <i class="bi bi-leaf display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getLowStockCount(fertilizers) }}</h4>
                  <p class="mb-0">Stock Bajo</p>
                </div>
                <i class="bi bi-exclamation-triangle display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getExpiringCount(fertilizers) }}</h4>
                  <p class="mb-0">Por Vencer</p>
                </div>
                <i class="bi bi-calendar-x display-6"></i>
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
    .badge {
      font-size: 0.7em;
    }
  `]
})
export class FertilizerListComponent implements OnInit {
  fertilizers$: Observable<Fertilizer[]> | undefined;
  onlyActive = true;
  selectedType = '';
  selectedNPKCategory = '';
  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fertilizerService: FertilizerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFertilizers();
  }

  loadFertilizers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      onlyActive: this.onlyActive,
      type: this.selectedType,
      npkCategory: this.selectedNPKCategory,
      searchTerm: this.searchTerm.trim()
    };

    this.fertilizers$ = this.fertilizerService.getAll(filters);

    this.fertilizers$.subscribe({
      next: (fertilizers) => {
        this.isLoading = false;
        console.log(`Loaded ${fertilizers.length} fertilizers`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los fertilizantes';
        console.error('Error loading fertilizers:', error);
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/fertilizers/new']);
  }

  view(fertilizer: Fertilizer): void {
    this.router.navigate(['/fertilizers', fertilizer?.id]);
  }

  edit(fertilizer: Fertilizer): void {
    this.router.navigate(['/fertilizers', fertilizer?.id, 'edit']);
  }

  adjustStock(fertilizer: Fertilizer): void {
    this.router.navigate(['/fertilizers', fertilizer?.id, 'stock']);
  }

  delete(fertilizer: Fertilizer): void {
    if (confirm(`¿Está seguro de eliminar el fertilizante "${fertilizer?.name}"?`)) {
      this.fertilizerService.delete(fertilizer?.id).subscribe({
        next: () => {
          this.successMessage = 'Fertilizante eliminado correctamente';
          this.loadFertilizers();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el fertilizante';
          console.error('Delete error:', error);
        }
      });
    }
  }

  trackByFn(index: number, fertilizer: Fertilizer): number {
    return fertilizer?.id;
  }

  getTypeClass(type: string | undefined): string {
    if (type === undefined) {
      type = 'Organico';
    }

    const typeClasses: { [key: string]: string } = {
      'Organico': 'bg-success',
      'Inorganico': 'bg-primary',
      'Liquido': 'bg-info',
      'Solido': 'bg-secondary',
      'Foliar': 'bg-warning'
    };
    return typeClasses[type] || 'bg-light text-dark';
  }

  getApplicationClass(method: string | undefined): string {
    if (method === undefined) {
      method = 'Riego';
    }

    const applicationClasses: { [key: string]: string } = {
      'Riego': 'bg-info',
      'Foliar': 'bg-warning',
      'Suelo': 'bg-success',
      'Fertirrigacion': 'bg-primary'
    };
    return applicationClasses[method] || 'bg-secondary';
  }

  getApplicationIcon(method: string | undefined): string {
    if (method === undefined) {
      method = 'Riego';
    }
    const applicationIcons: { [key: string]: string } = {
      'Riego': 'bi-droplet',
      'Foliar': 'bi-cloud-drizzle',
      'Suelo': 'bi-geo-alt',
      'Fertirrigacion': 'bi-water'
    };
    return applicationIcons[method] || 'bi-circle';
  }

  getEmptyStateMessage(): string {
    if (this.selectedType) {
      return `No hay fertilizantes de tipo "${this.selectedType}"`;
    }
    if (this.searchTerm) {
      return `No se encontraron fertilizantes con el término "${this.searchTerm}"`;
    }
    return this.onlyActive ? 'No hay fertilizantes activos registrados' : 'No hay fertilizantes registrados';
  }

  getOrganicCount(fertilizers: Fertilizer[]): number {
    return fertilizers.filter(f => f.type === 'Organico').length;
  }

  getLowStockCount(fertilizers: Fertilizer[]): number {
    return fertilizers.filter(f =>
      f.currentStock !== undefined &&
      f.minimumStock !== undefined &&
      f.currentStock <= f.minimumStock
    ).length;
  }

  getExpiringCount(fertilizers: Fertilizer[]): number {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return fertilizers.filter(f =>
      f.expirationDate &&
      new Date(f.expirationDate) <= thirtyDaysFromNow
    ).length;
  }
}