// src/app/features/admin/admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';

interface Entity {
  id?: number;
  name?: string;
  [key: string]: any;
}

interface EntityConfig {
  name: string;
  endpoint: string;
  displayName: string;
  icon: string;
  fields: EntityField[];
}

interface EntityField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'boolean';
  required?: boolean;
  options?: { value: any; label: string }[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header">
        <h1 class="admin-title">
          <i class="bi bi-gear-fill"></i>
          Panel de Administración AgriSmart
        </h1>
        <p class="admin-subtitle">Gestión completa de entidades del sistema</p>
      </div>

      <!-- Sidebar Navigation -->
      <div class="admin-layout">
        <div class="admin-sidebar">
          <h3>Entidades</h3>
          <ul class="entity-list">
            <li *ngFor="let entityConfig of entityConfigs" 
                class="entity-item"
                [class.active]="selectedEntity === entityConfig.name"
                (click)="selectEntity(entityConfig.name)">
              <i [class]="entityConfig.icon"></i>
              <span>{{ entityConfig.displayName }}</span>
            </li>
          </ul>
          
          <div class="admin-actions mt-4">
            <button class="btn btn-outline-secondary btn-sm w-100 mb-2" 
                    (click)="goToDashboard()">
              <i class="bi bi-arrow-left"></i> Volver al Dashboard
            </button>
            <button class="btn btn-outline-danger btn-sm w-100" 
                    (click)="logout()">
              <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="admin-content">
          <div *ngIf="!selectedEntity" class="welcome-screen">
            <div class="welcome-content">
              <i class="bi bi-database display-1 text-muted"></i>
              <h2>Bienvenido al Panel de Administración</h2>
              <p class="lead">Selecciona una entidad del menú lateral para comenzar a gestionar los datos del sistema.</p>
              <div class="stats-grid">
                <div class="stat-card" *ngFor="let stat of entityStats">
                  <i [class]="stat.icon"></i>
                  <div class="stat-info">
                    <h4>{{ stat.count }}</h4>
                    <p>{{ stat.label }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Entity Management -->
          <div *ngIf="selectedEntity" class="entity-management">
            <!-- Entity Header -->
            <div class="entity-header">
              <h2>
                <i [class]="getCurrentEntityConfig()?.icon"></i>
                {{ getCurrentEntityConfig()?.displayName }}
              </h2>
              <div class="entity-actions">
                <button class="btn btn-primary" (click)="showCreateForm()">
                  <i class="bi bi-plus-lg"></i> Crear Nuevo
                </button>
                <button class="btn btn-outline-secondary" (click)="refreshData()">
                  <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoading" class="loading-state">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p>Cargando datos...</p>
            </div>

            <!-- Error State -->
            <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible" role="alert">
              <i class="bi bi-exclamation-triangle"></i>
              {{ errorMessage }}
              <button type="button" class="btn-close" (click)="clearError()"></button>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="alert alert-success alert-dismissible" role="alert">
              <i class="bi bi-check-circle"></i>
              {{ successMessage }}
              <button type="button" class="btn-close" (click)="clearSuccess()"></button>
            </div>

            <!-- Search and Filters -->
            <div class="search-filters mb-3" *ngIf="!isLoading && !errorMessage">
              <div class="row">
                <div class="col-md-6">
                  <input type="text" 
                         class="form-control" 
                         placeholder="Buscar..." 
                         [(ngModel)]="searchTerm"
                         (input)="filterData()">
                </div>
                <div class="col-md-6">
                  <div class="d-flex gap-2">
                    <select class="form-select" [(ngModel)]="filterStatus" (change)="filterData()">
                      <option value="">Todos los estados</option>
                      <option value="true">Activos</option>
                      <option value="false">Inactivos</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Data Table -->
            <div class="table-container" *ngIf="!isLoading && !errorMessage">
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>#</th>
                    <th *ngFor="let field of getCurrentEntityConfig()?.fields?.slice(0, 4)" 
                        (click)="sortBy(field.key)" 
                        class="sortable">
                      {{ field.label }}
                      <i class="bi bi-arrow-up-down"></i>
                    </th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of filteredData; trackBy: trackByFn">
                    <td>{{ item.id }}</td>
                    <td *ngFor="let field of getCurrentEntityConfig()?.fields?.slice(0, 4)">
                      <span [ngSwitch]="field.type">
                        <span *ngSwitchCase="'boolean'">
                          <i class="bi" [class.bi-check-circle-fill]="item[field.key]" 
                             [class.bi-x-circle-fill]="!item[field.key]"
                             [class.text-success]="item[field.key]"
                             [class.text-danger]="!item[field.key]"></i>
                        </span>
                        <span *ngSwitchCase="'date'">
                          {{ item[field.key] | date:'dd/MM/yyyy' }}
                        </span>
                        <span *ngSwitchDefault>
                          {{ item[field.key] || '-' }}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span class="badge" 
                            [class.bg-success]="item['isActive']" 
                            [class.bg-secondary]="!item['isActive']">
                        {{ item['isActive'] ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" 
                                (click)="viewItem(item)"
                                title="Ver detalles">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" 
                                (click)="editItem(item)"
                                title="Editar"> 
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="deleteItem(item)"
                                title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div *ngIf="filteredData.length === 0" class="empty-state">
                <i class="bi bi-inbox display-1 text-muted"></i>
                <h3>No hay datos disponibles</h3>
                <p>No se encontraron registros para {{ getCurrentEntityConfig()?.displayName }}.</p>
                <button class="btn btn-primary" (click)="showCreateForm()">
                  <i class="bi bi-plus-lg"></i> Crear el primer registro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Create/Edit -->
      <div class="modal fade" 
           [class.show]="showModal" 
           [style.display]="showModal ? 'block' : 'none'"
           id="entityModal" 
           tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? 'Editar' : 'Crear' }} {{ getCurrentEntityConfig()?.displayName }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form *ngIf="currentItem" (ngSubmit)="saveItem()" #entityForm="ngForm">
                <div class="row">
                  <div *ngFor="let field of getCurrentEntityConfig()?.fields" 
                       class="col-md-6 mb-3"
                       [class.col-md-12]="field.type === 'textarea'">
                    
                    <label [for]="field.key" class="form-label">
                      {{ field.label }}
                      <span *ngIf="field.required" class="text-danger">*</span>
                    </label>

                    <!-- Text Input -->
                    <input *ngIf="field.type === 'text' || field.type === 'email'" 
                           [type]="field.type"
                           class="form-control"
                           [id]="field.key"
                           [(ngModel)]="currentItem[field.key]"
                           [name]="field.key"
                           [required]="field.required ?? false">

                    <!-- Number Input -->
                    <input *ngIf="field.type === 'number'" 
                           type="number"
                           class="form-control"
                           [id]="field.key"
                           [(ngModel)]="currentItem[field.key]"
                           [name]="field.key"
                           [required]="field.required ?? false">

                    <!-- Date Input -->
                    <input *ngIf="field.type === 'date'" 
                           type="date"
                           class="form-control"
                           [id]="field.key"
                           [(ngModel)]="currentItem[field.key]"
                           [name]="field.key"
                           [required]="field.required ?? false">

                    <!-- Textarea -->
                    <textarea *ngIf="field.type === 'textarea'" 
                              class="form-control"
                              [id]="field.key"
                              [(ngModel)]="currentItem[field.key]"
                              [name]="field.key"
                              [required]="field.required ?? false"
                              rows="3"></textarea>

                    <!-- Select -->
                    <select *ngIf="field.type === 'select'" 
                            class="form-select"
                            [id]="field.key"
                            [(ngModel)]="currentItem[field.key]"
                            [name]="field.key"
                            [required]="field.required ?? false">
                      <option value="">Seleccionar...</option>
                      <option *ngFor="let option of field.options" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>

                    <!-- Boolean/Checkbox -->
                    <div *ngIf="field.type === 'boolean'" class="form-check">
                      <input type="checkbox" 
                             class="form-check-input"
                             [id]="field.key"
                             [(ngModel)]="currentItem[field.key]"
                             [name]="field.key">
                      <label class="form-check-label" [for]="field.key">
                        {{ field.label }}
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">
                Cancelar
              </button>
              <button type="button" 
                      class="btn btn-primary" 
                      (click)="saveItem()">
                <i class="bi bi-save"></i> 
                {{ isEditing ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Backdrop -->
      <div *ngIf="showModal" class="modal-backdrop fade show"></div>
    </div>
  `,
  styles: [`
    .admin-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .admin-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      text-align: center;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    .admin-title {
      color: #2c3e50;
      margin: 0;
      font-weight: 700;
      font-size: 2.5rem;
    }

    .admin-subtitle {
      color: #7f8c8d;
      margin: 0.5rem 0 0 0;
      font-size: 1.1rem;
    }

    .admin-layout {
      display: flex;
      min-height: calc(100vh - 140px);
    }

    .admin-sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
    }

    .entity-list {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }

    .entity-item {
      padding: 0.75rem 1rem;
      margin: 0.25rem 0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(52, 73, 94, 0.05);
    }

    .entity-item:hover {
      background: rgba(52, 73, 94, 0.1);
      transform: translateX(5px);
    }

    .entity-item.active {
      background: #3498db;
      color: white;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }

    .admin-content {
      flex: 1;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      margin: 1rem;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    .welcome-screen {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
    }

    .welcome-content h2 {
      color: #2c3e50;
      margin: 1rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .stat-card i {
      font-size: 2rem;
      opacity: 0.8;
    }

    .stat-info h4 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-info p {
      margin: 0;
      opacity: 0.9;
    }

    .entity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #ecf0f1;
    }

    .entity-header h2 {
      color: #2c3e50;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .entity-actions {
      display: flex;
      gap: 0.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .table {
      margin: 0;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sortable:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #7f8c8d;
    }

    .empty-state h3 {
      margin: 1rem 0;
    }

    .modal.show {
      background: rgba(0, 0, 0, 0.5);
    }

    .search-filters {
      background: rgba(52, 73, 94, 0.05);
      padding: 1rem;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .admin-layout {
        flex-direction: column;
      }
      
      .admin-sidebar {
        width: 100%;
      }
      
      .entity-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
      
      .entity-actions {
        justify-content: center;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  private apiService = inject(ApiService);
  private apiConfig = inject(ApiConfigService);
  private router = inject(Router);

  // State management
  selectedEntity: string = '';
  entityData: Entity[] = [];
  filteredData: Entity[] = [];
  currentItem: Entity = {};
  isLoading = false;
  isEditing = false;
  showModal = false;
  errorMessage = '';
  successMessage = '';
  
  // Filtering and search
  searchTerm = '';
  filterStatus = '';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Entity statistics
  entityStats = [
    { icon: 'bi bi-building', count: 0, label: 'Compañías' },
    { icon: 'bi bi-house', count: 0, label: 'Fincas' },
    { icon: 'bi bi-cpu', count: 0, label: 'Dispositivos' },
    { icon: 'bi bi-flower1', count: 0, label: 'Cultivos' }
  ];

  // Entity configurations
  entityConfigs: EntityConfig[] = [
    {
      name: 'company',
      endpoint: this.apiConfig.endpoints.company,
      displayName: 'Compañías',
      icon: 'bi bi-building',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'address', label: 'Dirección', type: 'text' },
        { key: 'phoneNumber', label: 'Teléfono', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'website', label: 'Sitio Web', type: 'text' },
        { key: 'taxId', label: 'ID Fiscal', type: 'text' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'farm',
      endpoint: this.apiConfig.endpoints.farm,
      displayName: 'Fincas',
      icon: 'bi bi-house',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'companyId', label: 'Compañía', type: 'select', required: true, options: [] },
        { key: 'location', label: 'Ubicación', type: 'text' },
        { key: 'address', label: 'Dirección', type: 'text' },
        { key: 'area', label: 'Área (hectáreas)', type: 'number' },
        { key: 'climate', label: 'Clima', type: 'text' },
        { key: 'soilType', label: 'Tipo de Suelo', type: 'text' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'crop',
      endpoint: this.apiConfig.endpoints.crop,
      displayName: 'Cultivos',
      icon: 'bi bi-flower1',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'scientificName', label: 'Nombre Científico', type: 'text' },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'type', label: 'Tipo', type: 'select', options: [
          { value: 'Vegetal', label: 'Vegetal' },
          { value: 'Fruta', label: 'Fruta' },
          { value: 'Cereal', label: 'Cereal' },
          { value: 'Hierba', label: 'Hierba' },
          { value: 'Otro', label: 'Otro' }
        ]},
        { key: 'variety', label: 'Variedad', type: 'text' },
        { key: 'growthCycleDays', label: 'Días de Ciclo', type: 'number' },
        { key: 'harvestSeason', label: 'Temporada de Cosecha', type: 'text' },
        { key: 'waterRequirement', label: 'Requerimiento de Agua', type: 'select', options: [
          { value: 'Bajo', label: 'Bajo' },
          { value: 'Medio', label: 'Medio' },
          { value: 'Alto', label: 'Alto' }
        ]},
        { key: 'optimalTemperatureMin', label: 'Temp. Mínima (°C)', type: 'number' },
        { key: 'optimalTemperatureMax', label: 'Temp. Máxima (°C)', type: 'number' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'device',
      endpoint: this.apiConfig.endpoints.device,
      displayName: 'Dispositivos',
      icon: 'bi bi-cpu',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'deviceType', label: 'Tipo', type: 'select', options: [
          { value: 'Sensor', label: 'Sensor' },
          { value: 'Actuador', label: 'Actuador' },
          { value: 'Controlador', label: 'Controlador' },
          { value: 'Gateway', label: 'Gateway' },
          { value: 'Camara', label: 'Cámara' },
          { value: 'Estacion Meteorologica', label: 'Estación Meteorológica' }
        ]},
        { key: 'serialNumber', label: 'Número de Serie', type: 'text' },
        { key: 'model', label: 'Modelo', type: 'text' },
        { key: 'manufacturer', label: 'Fabricante', type: 'text' },
        { key: 'firmwareVersion', label: 'Versión Firmware', type: 'text' },
        { key: 'macAddress', label: 'Dirección MAC', type: 'text' },
        { key: 'ipAddress', label: 'Dirección IP', type: 'text' },
        { key: 'status', label: 'Estado', type: 'select', options: [
          { value: 'Online', label: 'En línea' },
          { value: 'Offline', label: 'Fuera de línea' },
          { value: 'Maintenance', label: 'Mantenimiento' },
          { value: 'Error', label: 'Error' }
        ]},
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'waterChemistry',
      endpoint: this.apiConfig.endpoints.waterChemistry,
      displayName: 'Química del Agua',
      icon: 'bi bi-droplet',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'phLevel', label: 'Nivel pH', type: 'number' },
        { key: 'electricalConductivity', label: 'Conductividad Eléctrica', type: 'number' },
        { key: 'totalDissolvedSolids', label: 'Sólidos Disueltos Totales', type: 'number' },
        { key: 'temperature', label: 'Temperatura (°C)', type: 'number' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'cropPhase',
      endpoint: this.apiConfig.endpoints.cropPhase,
      displayName: 'Fases de Cultivo',
      icon: 'bi bi-arrow-right-circle',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'durationDays', label: 'Duración (días)', type: 'number' },
        { key: 'orderSequence', label: 'Orden', type: 'number' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'productionUnit',
      endpoint: this.apiConfig.endpoints.productionUnit,
      displayName: 'Unidades de Producción',
      icon: 'bi bi-grid',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'farmId', label: 'Finca', type: 'select', required: true, options: [] },
        { key: 'productionUnitTypeId', label: 'Tipo', type: 'select', required: true, options: [] },
        { key: 'area', label: 'Área (m²)', type: 'number' },
        { key: 'capacity', label: 'Capacidad', type: 'number' },
        { key: 'location', label: 'Ubicación', type: 'text' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'sensor',
      endpoint: this.apiConfig.endpoints.sensor,
      displayName: 'Sensores',
      icon: 'bi bi-speedometer2',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'sensorType', label: 'Tipo de Sensor', type: 'text' },
        { key: 'measurementVariable', label: 'Variable de Medición', type: 'text' },
        { key: 'unit', label: 'Unidad', type: 'text' },
        { key: 'minValue', label: 'Valor Mínimo', type: 'number' },
        { key: 'maxValue', label: 'Valor Máximo', type: 'number' },
        { key: 'accuracy', label: 'Precisión', type: 'number' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'user',
      endpoint: this.apiConfig.endpoints.user,
      displayName: 'Usuarios',
      icon: 'bi bi-people',
      fields: [
        { key: 'firstName', label: 'Nombre', type: 'text', required: true },
        { key: 'lastName', label: 'Apellido', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phoneNumber', label: 'Teléfono', type: 'text' },
        { key: 'role', label: 'Rol', type: 'select', options: [
          { value: '1', label: 'Administrador' },
          { value: '2', label: 'Usuario' },
          { value: '3', label: 'Operador' }
        ]},
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'license',
      endpoint: this.apiConfig.endpoints.license,
      displayName: 'Licencias',
      icon: 'bi bi-key',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'licenseKey', label: 'Clave de Licencia', type: 'text', required: true },
        { key: 'validFrom', label: 'Válida Desde', type: 'date' },
        { key: 'validTo', label: 'Válida Hasta', type: 'date' },
        { key: 'maxUsers', label: 'Máximo Usuarios', type: 'number' },
        { key: 'maxDevices', label: 'Máximo Dispositivos', type: 'number' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadEntityStats();
  }

  async loadEntityStats(): Promise<void> {
    try {
      // Load basic statistics for dashboard
      const statsPromises = [
        this.loadEntityCount('company'),
        this.loadEntityCount('farm'),
        this.loadEntityCount('device'),
        this.loadEntityCount('crop')
      ];

      const [companies, farms, devices, crops] = await Promise.all(statsPromises);
      
      this.entityStats = [
        { icon: 'bi bi-building', count: companies, label: 'Compañías' },
        { icon: 'bi bi-house', count: farms, label: 'Fincas' },
        { icon: 'bi bi-cpu', count: devices, label: 'Dispositivos' },
        { icon: 'bi bi-flower1', count: crops, label: 'Cultivos' }
      ];
    } catch (error) {
      console.error('Error loading entity statistics:', error);
    }
  }

  async loadEntityCount(entityName: string): Promise<number> {
    try {
      const config = this.entityConfigs.find(c => c.name === entityName);
      if (!config) return 0;

      const url = this.apiConfig.getAgronomicUrl(config.endpoint);
      const data = await this.apiService.get<Entity[]>(url).toPromise();
      return data?.length || 0;
    } catch (error) {
      return 0;
    }
  }

  selectEntity(entityName: string): void {
    this.selectedEntity = entityName;
    this.loadEntityData();
  }

  getCurrentEntityConfig(): EntityConfig | undefined {
    return this.entityConfigs.find(config => config.name === this.selectedEntity);
  }

  async loadEntityData(): Promise<void> {
    const config = this.getCurrentEntityConfig();
    if (!config) return;

    this.isLoading = true;
    this.clearMessages();

    try {
      const url = this.apiConfig.getAgronomicUrl(config.endpoint);
      this.entityData = await this.apiService.get<Entity[]>(url).toPromise() || [];
      this.filteredData = [...this.entityData];

      // Load related data for select fields
      await this.loadRelatedData(config);
    } catch (error) {
      this.errorMessage = 'Error al cargar los datos. Por favor, intente nuevamente.';
      console.error('Error loading entity data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadRelatedData(config: EntityConfig): Promise<void> {
    for (const field of config.fields) {
      if (field.type === 'select' && !field.options?.length) {
        // Load related entity data for select fields
        if (field.key === 'companyId') {
          const companies = await this.loadEntityCount('company');
          // Simplified - in real implementation, load actual company data
          field.options = [
            { value: 1, label: 'Compañía Ejemplo 1' },
            { value: 2, label: 'Compañía Ejemplo 2' }
          ];
        } else if (field.key === 'farmId') {
          field.options = [
            { value: 1, label: 'Finca Ejemplo 1' },
            { value: 2, label: 'Finca Ejemplo 2' }
          ];
        } else if (field.key === 'productionUnitTypeId') {
          field.options = [
            { value: 1, label: 'Invernadero' },
            { value: 2, label: 'Campo Abierto' },
            { value: 3, label: 'Hidropónico' }
          ];
        }
      }
    }
  }

  filterData(): void {
    let filtered = [...this.entityData];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply status filter
    if (this.filterStatus !== '') {
      const isActive = this.filterStatus === 'true';
      filtered = filtered.filter(item => item['isActive'] === isActive);
    }

    // Apply sorting
    if (this.sortField) {
      filtered.sort((a, b) => {
        const aVal = a[this.sortField];
        const bVal = b[this.sortField];
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = filtered;
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filterData();
  }

  showCreateForm(): void {
    this.isEditing = false;
    this.currentItem = { isActive: true };
    this.showModal = true;
  }

  viewItem(item: Entity): void {
    // Implement view details functionality
    console.log('Viewing item:', item);
  }

  editItem(item: Entity): void {
    this.isEditing = true;
    this.currentItem = { ...item };
    this.showModal = true;
  }

  async deleteItem(item: Entity): Promise<void> {
    if (!confirm(`¿Está seguro de que desea eliminar este registro?`)) {
      return;
    }

    const config = this.getCurrentEntityConfig();
    if (!config) return;

    try {
      const url = this.apiConfig.getAgronomicUrl(`${config.endpoint}/${item.id}`);
      await this.apiService.delete(url).toPromise();
      
      this.successMessage = 'Registro eliminado exitosamente.';
      this.loadEntityData();
    } catch (error) {
      this.errorMessage = 'Error al eliminar el registro.';
      console.error('Error deleting item:', error);
    }
  }

  async saveItem(): Promise<void> {
    const config = this.getCurrentEntityConfig();
    if (!config) return;

    try {
      const url = this.apiConfig.getAgronomicUrl(config.endpoint);
      
      if (this.isEditing) {
        await this.apiService.put(`${url}/${this.currentItem.id}`, this.currentItem).toPromise();
        this.successMessage = 'Registro actualizado exitosamente.';
      } else {
        await this.apiService.post(url, this.currentItem).toPromise();
        this.successMessage = 'Registro creado exitosamente.';
      }

      this.closeModal();
      this.loadEntityData();
    } catch (error) {
      this.errorMessage = `Error al ${this.isEditing ? 'actualizar' : 'crear'} el registro.`;
      console.error('Error saving item:', error);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentItem = {};
  }

  refreshData(): void {
    this.loadEntityData();
  }

  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  trackByFn(index: number, item: Entity): any {
    return item.id || index;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    // Implement logout functionality
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}