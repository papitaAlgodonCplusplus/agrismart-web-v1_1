// src/app/features/fertilizer-inputs/fertilizer-input-list/fertilizer-input-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FertilizerInputService } from '../services/fertilizer-input.service';
import { FertilizerInput } from '../../../core/models/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-fertilizer-input-list',
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Lista de Aportes de Fertilizante</h2>
          <p class="text-muted">Registro y seguimiento de aplicaciones de fertilizantes</p>
          <hr>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row align-items-end">
            <div class="col-md-2">
              <label class="form-label">Fecha Desde</label>
              <input 
                type="date" 
                class="form-control"
                [(ngModel)]="dateFrom"
                (change)="loadFertilizerInputs()">
            </div>
            <div class="col-md-2">
              <label class="form-label">Fecha Hasta</label>
              <input 
                type="date" 
                class="form-control"
                [(ngModel)]="dateTo"
                (change)="loadFertilizerInputs()">
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Producción</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedProductionId"
                (change)="loadFertilizerInputs()">
                <option value="">Todas las producciones</option>
                <option *ngFor="let production of cropProductions" [value]="production.id">
                  {{ production.code }} - {{ production.crop?.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Fertilizante</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedFertilizerId"
                (change)="loadFertilizerInputs()">
                <option value="">Todos los fertilizantes</option>
                <option *ngFor="let fertilizer of fertilizers" [value]="fertilizer.id">
                  {{ fertilizer.name }}
                </option>
              </select>
            </div>
            <div class="col-md-1">
              <button class="btn btn-primary" (click)="loadFertilizerInputs()">
                <i class="bi bi-search"></i>
              </button>
            </div>
            <div class="col-md-1">
              <button class="btn btn-success" (click)="createNew()">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="d-flex gap-2">
            <button class="btn btn-outline-success" (click)="exportToExcel()">
              <i class="bi bi-file-earmark-excel me-1"></i>Exportar
            </button>
            <button class="btn btn-outline-info" (click)="showStatistics()">
              <i class="bi bi-bar-chart me-1"></i>Estadísticas
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
          <p class="mt-2">Cargando aportes de fertilizante...</p>
        </div>
      </div>

      <!-- Fertilizer Inputs Table -->
      <div class="row" *ngIf="!isLoading && (fertilizerInputs$ | async) as fertilizerInputs">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-droplet-half me-2"></i>
                Aportes de Fertilizante ({{ fertilizerInputs.length }})
              </h5>
              <small class="text-muted">Última actualización: {{ lastUpdated | date:'short' }}</small>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Fecha/Hora</th>
                      <th>Producción</th>
                      <th>Fertilizante</th>
                      <th>Cantidad</th>
                      <th>Concentración</th>
                      <th>Método</th>
                      <th>Responsable</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let input of fertilizerInputs; trackBy: trackByFn">
                      <td>
                        <span class="badge bg-secondary">FI-{{ input.id }}</span>
                      </td>
                      <td>
                        <div>
                          <strong>{{ input.applicationDate | date:'shortDate' }}</strong>
                          <div class="text-muted small">{{ input.applicationDate | date:'shortTime' }}</div>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="bi bi-seedling me-2 text-success"></i>
                          <div>
                            <strong>{{ input.cropProduction?.code || 'N/A' }}</strong>
                            <div class="text-muted small">{{ input.cropProduction?.crop?.name }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="bi bi-flask me-2" 
                             [class.text-success]="input.fertilizer?.type === 'Organico'"
                             [class.text-primary]="input.fertilizer?.type === 'Inorganico'"></i>
                          <div>
                            <strong>{{ input.fertilizer?.name || 'N/A' }}</strong>
                            <div class="text-muted small">{{ input.fertilizer?.brand }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-center">
                          <strong class="text-primary">{{ input.quantity | number:'1.2-2' }}</strong>
                          <div class="text-muted small">{{ input.quantityUnit || 'L' }}</div>
                        </div>
                      </td>
                      <td>
                        <div class="text-center" *ngIf="input.concentration">
                          <strong>{{ input.concentration | number:'1.1-2' }}</strong>
                          <div class="text-muted small">{{ input.concentrationUnit || 'g/L' }}</div>
                        </div>
                        <span class="text-muted" *ngIf="!input.concentration">N/A</span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getApplicationMethodClass(input.applicationMethod)">
                          <i class="bi" [ngClass]="getApplicationMethodIcon(input.applicationMethod)"></i>
                          {{ input.applicationMethod }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="bi bi-person me-2"></i>
                          <!-- <div>
                            <strong>{{ input.appliedBy?.name || 'N/A' }}</strong>
                            <div class="text-muted small">{{ input.appliedBy?.role }}</div>
                          </div> -->
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getStatusClass(input.status)">
                          <i class="bi" [ngClass]="getStatusIcon(input.status)"></i>
                          {{ getStatusText(input.status) }}
                        </span>
                        <div class="text-muted small" *ngIf="input.verifiedBy">
                          Verificado por {{ input.verifiedBy?.name }}
                        </div>
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-info"
                            (click)="view(input)"
                            title="Ver detalles">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-primary"
                            (click)="edit(input)"
                            title="Editar"
                            [disabled]="input.status === 'verified'">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <!-- [disabled]="input.status === 'verified'" -->
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-success"
                            (click)="verify(input)"
                            title="Verificar aplicación"
                            *ngIf="input.status === 'applied'">
                            <i class="bi bi-check-circle"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-warning"
                            (click)="duplicate(input)"
                            title="Duplicar aplicación">
                            <i class="bi bi-files"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-danger"
                            (click)="delete(input)"
                            title="Eliminar"
                            [disabled]="input.status === 'verified'">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty State -->
                <div class="text-center p-4" *ngIf="fertilizerInputs.length === 0">
                  <i class="bi bi-droplet-half display-4 text-muted"></i>
                  <h5 class="mt-3">No se encontraron aportes de fertilizante</h5>
                  <p class="text-muted">
                    {{ getEmptyStateMessage() }}
                  </p>
                  <button class="btn btn-primary" (click)="createNew()">
                    <i class="bi bi-plus me-1"></i>
                    Registrar primer aporte
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

      <!-- Summary Statistics -->
      <div class="row mt-4" *ngIf="(fertilizerInputs$ | async) as fertilizerInputs">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6><i class="bi bi-bar-chart me-2"></i>Resumen del Período</h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-2">
                  <div class="border-end">
                    <h4 class="text-primary">{{ fertilizerInputs.length }}</h4>
                    <small class="text-muted">Total Aplicaciones</small>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="border-end">
                    <h4 class="text-success">{{ getVerifiedCount(fertilizerInputs) }}</h4>
                    <small class="text-muted">Verificadas</small>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="border-end">
                    <h4 class="text-warning">{{ getPendingCount(fertilizerInputs) }}</h4>
                    <small class="text-muted">Pendientes</small>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="border-end">
                    <h4 class="text-info">{{ getTotalQuantity(fertilizerInputs) | number:'1.0-0' }}</h4>
                    <small class="text-muted">Total Litros</small>
                  </div>
                </div>
                <div class="col-md-2">
                  <div class="border-end">
                    <h4 class="text-secondary">{{ getUniqueProductionsCount(fertilizerInputs) }}</h4>
                    <small class="text-muted">Producciones</small>
                  </div>
                </div>
                <div class="col-md-2">
                  <h4 class="text-dark">{{ getUniqueFertilizersCount(fertilizerInputs) }}</h4>
                  <small class="text-muted">Fertilizantes Usados</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Applications by Date Chart -->
      <div class="row mt-4" *ngIf="(fertilizerInputs$ | async) as fertilizerInputs">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6><i class="bi bi-calendar3 me-2"></i>Aplicaciones por Fecha</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th class="text-center">Aplicaciones</th>
                      <th class="text-center">Cantidad Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let dayData of getApplicationsByDay(fertilizerInputs) | slice:0:5">
                      <td>{{ dayData.date | date:'shortDate' }}</td>
                      <td class="text-center">
                        <span class="badge bg-primary">{{ dayData.count }}</span>
                      </td>
                      <td class="text-center">{{ dayData.totalQuantity | number:'1.1-1' }} L</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Most Used Fertilizers -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6><i class="bi bi-flask me-2"></i>Fertilizantes Más Utilizados</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Fertilizante</th>
                      <th class="text-center">Usos</th>
                      <th class="text-center">Cantidad Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let fertData of getMostUsedFertilizers(fertilizerInputs) | slice:0:5">
                      <td>{{ fertData.name }}</td>
                      <td class="text-center">
                        <span class="badge bg-info">{{ fertData.uses }}</span>
                      </td>
                      <td class="text-center">{{ fertData.totalQuantity | number:'1.1-1' }} L</td>
                    </tr>
                  </tbody>
                </table>
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
export class FertilizerInputListComponent implements OnInit {
  fertilizerInputs$: Observable<FertilizerInput[]> | undefined;
  cropProductions: any[] = [];
  fertilizers: any[] = [];
  dateFrom = '';
  dateTo = '';
  selectedProductionId = '';
  selectedFertilizerId = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  lastUpdated = new Date();

  constructor(
    private fertilizerInputService: FertilizerInputService,
    private router: Router
  ) {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadCropProductions();
    this.loadFertilizers();
    this.loadFertilizerInputs();
  }

  loadFertilizerInputs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.lastUpdated = new Date();

    const filters = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      cropProductionId: this.selectedProductionId ? parseInt(this.selectedProductionId, 10) : null,
      fertilizerId: this.selectedFertilizerId ? parseInt(this.selectedFertilizerId, 10) : null
    };

    this.fertilizerInputs$ = this.fertilizerInputService.getAll(filters);

    this.fertilizerInputs$.subscribe({
      next: (inputs) => {
        this.isLoading = false;
        console.log(`Loaded ${inputs.length} fertilizer inputs`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los aportes de fertilizante';
        console.error('Error loading fertilizer inputs:', error);
      }
    });
  }

  private loadCropProductions(): void {
    // This should use CropProductionService
    this.cropProductions = [
      { id: 1, code: 'CP-001', crop: { name: 'Tomate' } },
      { id: 2, code: 'CP-002', crop: { name: 'Lechuga' } },
      { id: 3, code: 'CP-003', crop: { name: 'Pepino' } }
    ];
  }

  private loadFertilizers(): void {
    // This should use FertilizerService
    this.fertilizers = [
      { id: 1, name: 'NPK 20-20-20', brand: 'AgroNutrientes' },
      { id: 2, name: 'Urea 46%', brand: 'FertilMax' },
      { id: 3, name: 'Humus Líquido', brand: 'BioOrganics' }
    ];
  }

  createNew(): void {
    this.router.navigate(['/fertilizer-inputs/new']);
  }

  view(input: FertilizerInput): void {
    this.router.navigate(['/fertilizer-inputs', input.id]);
  }

  edit(input: FertilizerInput): void {
    this.router.navigate(['/fertilizer-inputs', input.id, 'edit']);
  }

  verify(input: FertilizerInput): void {
    if (confirm(`¿Confirmar que la aplicación de fertilizante FI-${input.id} fue realizada correctamente?`)) {
      this.fertilizerInputService.verify(input.id).subscribe({
        next: () => {
          this.successMessage = 'Aplicación verificada correctamente';
          this.loadFertilizerInputs();
        },
        error: (error) => {
          this.errorMessage = 'Error al verificar la aplicación';
          console.error('Verify error:', error);
        }
      });
    }
  }

  duplicate(input: FertilizerInput): void {
    this.router.navigate(['/fertilizer-inputs/new'], {
      queryParams: { duplicate: input.id }
    });
  }

  delete(input: FertilizerInput): void {
    if (confirm(`¿Está seguro de eliminar el aporte FI-${input.id}?`)) {
      this.fertilizerInputService.delete(input.id).subscribe({
        next: () => {
          this.successMessage = 'Aporte de fertilizante eliminado correctamente';
          this.loadFertilizerInputs();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el aporte';
          console.error('Delete error:', error);
        }
      });
    }
  }

  exportToExcel(): void {
    // Implementation for Excel export
    console.log('Exporting to Excel...');
    this.successMessage = 'Exportación iniciada. El archivo se descargará automáticamente.';
  }

  showStatistics(): void {
    this.router.navigate(['/fertilizer-inputs/statistics']);
  }

  trackByFn(index: number, input: FertilizerInput): number {
    return input.id;
  }

  getApplicationMethodClass(method: string | undefined): string {
    if (method === undefined) {
      method = 'Riego';
    }
    const methodClasses: { [key: string]: string } = {
      'Riego': 'bg-info',
      'Foliar': 'bg-warning',
      'Suelo': 'bg-success',
      'Fertirrigacion': 'bg-primary'
    };
    return methodClasses[method] || 'bg-secondary';
  }

  getApplicationMethodIcon(method: string | undefined): string {
    if (method === undefined) {
      method = 'Riego';
    }
    const methodIcons: { [key: string]: string } = {
      'Riego': 'bi-droplet',
      'Foliar': 'bi-cloud-drizzle',
      'Suelo': 'bi-geo-alt',
      'Fertirrigacion': 'bi-water'
    };
    return methodIcons[method] || 'bi-circle';
  }

  getStatusClass(status: string | undefined): string {
    if (status === undefined) {
      status = 'applied';
    }
    const statusClasses: { [key: string]: string } = {
      'planned': 'bg-secondary',
      'applied': 'bg-warning',
      'verified': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-light text-dark';
  }

  getStatusIcon(status: string | undefined): string {
    if (status === undefined) {
     status = 'applied'
    }
    const statusIcons: { [key: string]: string } = {
      'planned': 'bi-calendar',
      'applied': 'bi-droplet-half',
      'verified': 'bi-check-circle',
      'cancelled': 'bi-x-circle'
    };
    return statusIcons[status] || 'bi-circle';
  }

  getStatusText(status: string | undefined): string {
    if (status === undefined) {
     status = 'applied'
    }
    const statusTexts: { [key: string]: string } = {
      'planned': 'Planeado',
      'applied': 'Aplicado',
      'verified': 'Verificado',
      'cancelled': 'Cancelado'
    };
    return statusTexts[status] || status;
  }

  getEmptyStateMessage(): string {
    if (this.selectedProductionId && this.selectedFertilizerId) {
      return `No hay aportes para la producción y fertilizante seleccionados en el período especificado`;
    }
    if (this.selectedProductionId) {
      return `No hay aportes para la producción seleccionada en el período especificado`;
    }
    if (this.selectedFertilizerId) {
      return `No hay aportes del fertilizante seleccionado en el período especificado`;
    }
    return `No hay aportes de fertilizante registrados en el período del ${this.dateFrom} al ${this.dateTo}`;
  }

  getVerifiedCount(inputs: FertilizerInput[]): number {
    return inputs.filter(input => input.status === 'verified').length;
  }

  getPendingCount(inputs: FertilizerInput[]): number {
    return inputs.filter(input => input.status === 'applied').length;
  }

  getTotalQuantity(inputs: FertilizerInput[]): number {
    return inputs.reduce((total, input) => total + (input.quantity || 0), 0);
  }

  getUniqueProductionsCount(inputs: FertilizerInput[]): number {
    const uniqueProductions = new Set(inputs.map(input => input.cropProduction?.id).filter(id => id));
    return uniqueProductions.size;
  }

  getUniqueFertilizersCount(inputs: FertilizerInput[]): number {
    const uniqueFertilizers = new Set(inputs.map(input => input.fertilizer?.id).filter(id => id));
    return uniqueFertilizers.size;
  }

  getApplicationsByDay(inputs: FertilizerInput[]): any[] {
    const dayMap = new Map<string, { count: number; totalQuantity: number; date: Date }>();

    inputs.forEach(input => {
      const dateKey = new Date(input.applicationDate).toDateString();
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, {
          count: 0,
          totalQuantity: 0,
          date: new Date(input.applicationDate)
        });
      }
      const dayData = dayMap.get(dateKey)!;
      dayData.count++;
      dayData.totalQuantity += input.quantity || 0;
    });

    return Array.from(dayMap.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getMostUsedFertilizers(inputs: FertilizerInput[]): any[] {
    const fertilizerMap = new Map<number, { name: string | undefined; uses: number; totalQuantity: number }>();

    inputs.forEach(input => {
      if (input.fertilizer?.id) {
        if (!fertilizerMap.has(input.fertilizer.id)) {
          fertilizerMap.set(input.fertilizer.id, {
            name: input.fertilizer.name,
            uses: 0,
            totalQuantity: 0
          });
        }
        const fertData = fertilizerMap.get(input.fertilizer.id)!;
        fertData.uses++;
        fertData.totalQuantity += input.quantity || 0;
      }
    });

    return Array.from(fertilizerMap.values())
      .sort((a, b) => b.uses - a.uses);
  }
}