// src/app/features/irrigation/irrigation-sector-list/irrigation-sector-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { IrrigationSector } from '../../core/models/models';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-irrigation-sector-list',
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Gestión de Sectores de Irrigación</h2>
          <p class="text-muted">Monitoreo y control de sistemas de irrigación</p>
          <hr>
        </div>
      </div>

      <!-- Controls and Actions -->
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
                  (change)="loadIrrigationSectors()">
                <label class="form-check-label" for="onlyActives">
                  Mostrar solo activos
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Estado de Irrigación</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedIrrigationStatus"
                (change)="loadIrrigationSectors()">
                <option value="">Todos los estados</option>
                <option value="running">En Ejecución</option>
                <option value="scheduled">Programado</option>
                <option value="stopped">Detenido</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Producción</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedProductionId"
                (change)="loadIrrigationSectors()">
                <option value="">Todas las producciones</option>
                <option *ngFor="let production of cropProductions" [value]="production.id">
                  {{ production.code }} - {{ production.crop?.name }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary" (click)="loadIrrigationSectors()">
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
          <div class="d-flex gap-2">
            <button 
              class="btn btn-outline-info"
              (click)="toggleAutoRefresh()"
              [class.active]="autoRefresh">
              <i class="bi" [ngClass]="autoRefresh ? 'bi-pause-circle' : 'bi-play-circle'"></i>
              {{ autoRefresh ? 'Pausar' : 'Auto-actualizar' }}
            </button>
            <button class="btn btn-outline-primary" (click)="loadIrrigationSectors()">
              <i class="bi bi-arrow-clockwise"></i>
              Actualizar
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
          <p class="mt-2">Cargando sectores de irrigación...</p>
        </div>
      </div>

      <!-- Irrigation Sectors Grid -->
      <div class="row" *ngIf="!isLoading && (irrigationSectors$ | async) as irrigationSectors">
        <div class="col-12">
          <!-- Cards View -->
          <div class="row">
            <div class="col-lg-4 col-md-6 mb-4" *ngFor="let sector of irrigationSectors; trackBy: trackByFn">
              <div class="card h-100" [class.border-success]="sector.isIrrigating" [class.border-danger]="sector.hasError">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="bi bi-droplet me-2"></i>
                    {{ sector.name }}
                  </h6>
                  <span class="badge" [ngClass]="getStatusClass(sector.irrigationStatus)">
                    {{ getStatusText(sector.irrigationStatus) }}
                  </span>
                </div>
                <div class="card-body">
                  <!-- Status Indicators -->
                  <div class="row text-center mb-3">
                    <div class="col-4">
                      <div class="d-flex flex-column align-items-center">
                        <i class="bi bi-thermometer-half display-6" 
                           [class.text-danger]="sector.currentTemperature > 30"
                           [class.text-warning]="sector.currentTemperature > 25"
                           [class.text-primary]="sector.currentTemperature <= 25"></i>
                        <small class="text-muted">{{ sector.currentTemperature || '--' }}°C</small>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="d-flex flex-column align-items-center">
                        <i class="bi bi-moisture display-6"
                           [class.text-info]="sector.currentHumidity > 60"
                           [class.text-warning]="sector.currentHumidity < 40"
                           [class.text-success]="sector.currentHumidity >= 40 && sector.currentHumidity <= 60"></i>
                        <small class="text-muted">{{ sector.currentHumidity || '--' }}%</small>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="d-flex flex-column align-items-center">
                        <i class="bi bi-water display-6"
                           [class.text-primary]="sector.waterFlow > 0"
                           [class.text-muted]="!sector.waterFlow"></i>
                        <small class="text-muted">{{ sector.waterFlow || 0 }} L/h</small>
                      </div>
                    </div>
                  </div>

                  <!-- Production Info -->
                  <div class="mb-3">
                    <strong class="text-muted">Producción:</strong><br>
                    <span class="text-primary">{{ sector.cropProduction?.code || 'Sin asignar' }}</span>
                    <div class="text-muted small">{{ sector.cropProduction?.crop?.name }}</div>
                  </div>

                  <!-- Irrigation Progress -->
                  <div class="mb-3" *ngIf="sector.isIrrigating && sector.irrigationProgress">
                    <strong class="text-muted">Progreso de Irrigación:</strong>
                    <div class="progress mt-1">
                      <div 
                        class="progress-bar bg-info"
                        [style.width.%]="sector.irrigationProgress">
                        {{ sector.irrigationProgress }}%
                      </div>
                    </div>
                    <small class="text-muted" *ngIf="sector.remainingTime">
                      Tiempo restante: {{ sector.remainingTime }} min
                    </small>
                  </div>

                  <!-- Next Scheduled Irrigation -->
                  <div class="mb-3" *ngIf="sector.nextIrrigationTime">
                    <strong class="text-muted">Próxima Irrigación:</strong><br>
                    <span class="text-info">{{ sector.nextIrrigationTime | date:'short' }}</span>
                  </div>

                  <!-- Last Irrigation -->
                  <div class="mb-3" *ngIf="sector.lastIrrigationTime">
                    <strong class="text-muted">Última Irrigación:</strong><br>
                    <span class="text-success">{{ sector.lastIrrigationTime | date:'short' }}</span>
                  </div>
                </div>

                <div class="card-footer">
                  <div class="btn-group w-100" role="group">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-primary"
                      (click)="view(sector)"
                      title="Ver detalles">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-success"
                      (click)="toggleIrrigation(sector)"
                      [disabled]="sector.irrigationStatus === 'maintenance' || sector.hasError"
                      title="{{ sector.isIrrigating ? 'Detener irrigación' : 'Iniciar irrigación' }}">
                      <i class="bi" [ngClass]="sector.isIrrigating ? 'bi-stop-circle' : 'bi-play-circle'"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-info"
                      (click)="scheduleIrrigation(sector)"
                      title="Programar irrigación">
                      <i class="bi bi-calendar-plus"></i>
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-warning"
                      (click)="edit(sector)"
                      title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="text-center p-4" *ngIf="irrigationSectors.length === 0">
            <i class="bi bi-droplet display-1 text-muted"></i>
            <h5 class="mt-3">No se encontraron sectores de irrigación</h5>
            <p class="text-muted">
              {{ getEmptyStateMessage() }}
            </p>
            <button class="btn btn-primary" (click)="createNew()">
              <i class="bi bi-plus me-1"></i>
              Crear primer sector de irrigación
            </button>
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
      <div class="row mt-4" *ngIf="(irrigationSectors$ | async) as irrigationSectors">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ irrigationSectors.length }}</h4>
                  <p class="mb-0">Total Sectores</p>
                </div>
                <i class="bi bi-droplet display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getActiveIrrigatingCount(irrigationSectors) }}</h4>
                  <p class="mb-0">Irrigando Ahora</p>
                </div>
                <i class="bi bi-play-circle display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getScheduledCount(irrigationSectors) }}</h4>
                  <p class="mb-0">Programados</p>
                </div>
                <i class="bi bi-calendar-check display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getErrorCount(irrigationSectors) }}</h4>
                  <p class="mb-0">Con Errores</p>
                </div>
                <i class="bi bi-exclamation-triangle display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: all 0.2s ease-in-out;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    .card.border-success {
      border-width: 2px !important;
      box-shadow: 0 0 10px rgba(25, 135, 84, 0.3);
    }
    .card.border-danger {
      border-width: 2px !important;
      box-shadow: 0 0 10px rgba(220, 53, 69, 0.3);
    }
    .progress {
      height: 8px;
      border-radius: 4px;
    }
  `]
})
export class IrrigationSectorListComponent implements OnInit {
  irrigationSectors$: Observable<IrrigationSector[]> | undefined;
  cropProductions: any[] = [];
  onlyActive = true;
  selectedIrrigationStatus = '';
  selectedProductionId = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  autoRefresh = false;

  constructor(
    private irrigationSectorService: IrrigationSectorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCropProductions();
    this.loadIrrigationSectors();
  }

  loadIrrigationSectors(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      onlyActive: this.onlyActive,
      irrigationStatus: this.selectedIrrigationStatus,
      cropProductionId: this.selectedProductionId ? parseInt(this.selectedProductionId, 10) : null
    };

    // Setup auto-refresh if enabled
    if (this.autoRefresh) {
      this.irrigationSectors$ = interval(30000).pipe(
        startWith(0),
        switchMap(() => this.irrigationSectorService.getAll(filters))
      );
    } else {
      this.irrigationSectors$ = this.irrigationSectorService.getAll(filters);
    }
    
    this.irrigationSectors$.subscribe({
      next: (sectors) => {
        this.isLoading = false;
        console.log(`Loaded ${sectors.length} irrigation sectors`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los sectores de irrigación';
        console.error('Error loading irrigation sectors:', error);
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

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    this.loadIrrigationSectors();
  }

  createNew(): void {
    this.router.navigate(['/irrigation/sectors/new']);
  }

  view(sector: IrrigationSector): void {
    this.router.navigate(['/irrigation/sectors', sector.id]);
  }

  edit(sector: IrrigationSector): void {
    this.router.navigate(['/irrigation/sectors', sector.id, 'edit']);
  }

  toggleIrrigation(sector: IrrigationSector): void {
    const action = sector.isIrrigating ? 'detener' : 'iniciar';
    if (confirm(`¿Está seguro de ${action} la irrigación del sector "${sector.name}"?`)) {
      this.irrigationSectorService.toggleIrrigation(sector.id, !sector.isIrrigating).subscribe({
        next: () => {
          this.successMessage = `Irrigación ${sector.isIrrigating ? 'detenida' : 'iniciada'} correctamente`;
          this.loadIrrigationSectors();
        },
        error: (error: any) => {
          this.errorMessage = `Error al ${action} la irrigación`;
          console.error('Toggle irrigation error:', error);
        }
      });
    }
  }

  scheduleIrrigation(sector: IrrigationSector): void {
    this.router.navigate(['/irrigation/sectors', sector.id, 'schedule']);
  }

  trackByFn(index: number, sector: IrrigationSector): number {
    return sector.id;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'running': 'bg-success',
      'scheduled': 'bg-info',
      'stopped': 'bg-secondary',
      'maintenance': 'bg-warning',
      'error': 'bg-danger'
    };
    return statusClasses[status] || 'bg-light text-dark';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'running': 'Ejecutando',
      'scheduled': 'Programado',
      'stopped': 'Detenido',
      'maintenance': 'Mantenimiento',
      'error': 'Error'
    };
    return statusTexts[status] || status;
  }

  getEmptyStateMessage(): string {
    if (this.selectedIrrigationStatus) {
      return `No hay sectores con estado "${this.getStatusText(this.selectedIrrigationStatus)}"`;
    }
    if (this.selectedProductionId) {
      const production = this.cropProductions.find(p => p.id.toString() === this.selectedProductionId);
      return `No hay sectores asignados a la producción "${production?.code}"`;
    }
    return this.onlyActive ? 'No hay sectores de irrigación activos' : 'No hay sectores de irrigación registrados';
  }

  getActiveIrrigatingCount(sectors: IrrigationSector[]): number {
    return sectors.filter(s => s.isIrrigating).length;
  }

  getScheduledCount(sectors: IrrigationSector[]): number {
    return sectors.filter(s => s.irrigationStatus === 'scheduled').length;
  }

  getErrorCount(sectors: IrrigationSector[]): number {
    return sectors.filter(s => s.hasError || s.irrigationStatus === 'error').length;
  }
}