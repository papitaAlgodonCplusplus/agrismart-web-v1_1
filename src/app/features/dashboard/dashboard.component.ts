// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { CompanyService } from '../companies/services/company.service';
import { FarmService } from '../farms/services/farm.service';
import { CropService } from '../crops/services/crop.service';
import { DeviceService } from '../devices/services/device.service';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DatePipe, CommonModule } from '@angular/common';

export interface DashboardStats {
  totalCompanies: number;
  totalFarms: number;
  totalCrops: number;
  totalDevices: number;
  activeDevices: number;
}

export interface RecentActivity {
  icon: string;
  message: string;
  time: Date;
  type: 'success' | 'info' | 'warning' | 'primary';
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- Header Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="welcome-card">
            <h1 class="display-6 mb-2">Dashboard - AgriSmart</h1>
            <p class="lead text-muted mb-0">
              Bienvenido, <strong>{{ currentUser?.name || 'Usuario' }}</strong>
            </p>
            <small class="text-muted">{{ currentDate | date:'fullDate':'':'es' }}</small>
          </div>
        </div>
      </div>

      <!-- Statistics Cards with Animations -->
      <div class="row mb-4" *ngIf="stats && !isLoading">
        <!-- Companies Card -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="stats-card card-primary" [class.pulse]="isLoading">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-8">
                  <h6 class="card-category text-uppercase text-muted mb-0">Empresas</h6>
                  <h2 class="card-title mb-0 counter" [attr.data-count]="stats.totalCompanies">
                    {{ stats.totalCompanies }}
                  </h2>
                  <small class="text-success">
                    <i class="bi bi-arrow-up"></i> {{ getCompanyGrowth() }}%
                  </small>
                </div>
                <div class="col-4 text-end">
                  <div class="icon-shape bg-gradient-primary text-white rounded-circle">
                    <i class="bi bi-building fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Farms Card -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="stats-card card-success" [class.pulse]="isLoading">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-8">
                  <h6 class="card-category text-uppercase text-muted mb-0">Fincas</h6>
                  <h2 class="card-title mb-0 counter" [attr.data-count]="stats.totalFarms">
                    {{ stats.totalFarms }}
                  </h2>
                  <small class="text-success">
                    <i class="bi bi-geo-alt"></i> {{ getActiveFarmsPercent() }}% activas
                  </small>
                </div>
                <div class="col-4 text-end">
                  <div class="icon-shape bg-gradient-success text-white rounded-circle">
                    <i class="bi bi-tree fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Crops Card -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="stats-card card-warning" [class.pulse]="isLoading">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-8">
                  <h6 class="card-category text-uppercase text-muted mb-0">Cultivos</h6>
                  <h2 class="card-title mb-0 counter" [attr.data-count]="stats.totalCrops">
                    {{ stats.totalCrops }}
                  </h2>
                  <small class="text-info">
                    <i class="bi bi-collection"></i> {{ getCropVariety() }} variedades
                  </small>
                </div>
                <div class="col-4 text-end">
                  <div class="icon-shape bg-gradient-warning text-white rounded-circle">
                    <i class="bi bi-flower1 fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Devices Card -->
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="stats-card card-info" [class.pulse]="isLoading">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-8">
                  <h6 class="card-category text-uppercase text-muted mb-0">Dispositivos</h6>
                  <h2 class="card-title mb-0 counter">
                    {{ stats.activeDevices }}<span class="text-muted fs-6">/{{ stats.totalDevices }}</span>
                  </h2>
                  <small [class]="getDeviceStatusClass()">
                    <i [class]="getDeviceStatusIcon()"></i> {{ getDeviceStatusText() }}
                  </small>
                </div>
                <div class="col-4 text-end">
                  <div class="icon-shape bg-gradient-info text-white rounded-circle">
                    <i class="bi bi-cpu fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Health Overview -->
      <div class="row mb-4" *ngIf="stats && !isLoading">
        <div class="col-12">
          <div class="card">
            <div class="card-header pb-0">
              <h6>Estado del Sistema</h6>
            </div>
            <div class="card-body p-3">
              <div class="row">
                <!-- System Health -->
                <div class="col-lg-3 col-sm-6">
                  <div class="d-flex align-items-center">
                    <div class="icon-shape bg-success text-white rounded me-3">
                      <i class="bi bi-check-circle"></i>
                    </div>
                    <div>
                      <span class="text-sm text-muted">Sistema</span>
                      <h6 class="mb-0">Operativo</h6>
                    </div>
                  </div>
                </div>
                
                <!-- API Status -->
                <div class="col-lg-3 col-sm-6">
                  <div class="d-flex align-items-center">
                    <div class="icon-shape bg-primary text-white rounded me-3">
                      <i class="bi bi-wifi"></i>
                    </div>
                    <div>
                      <span class="text-sm text-muted">Conectividad</span>
                      <h6 class="mb-0">Excelente</h6>
                    </div>
                  </div>
                </div>
                
                <!-- Device Health -->
                <div class="col-lg-3 col-sm-6">
                  <div class="d-flex align-items-center">
                    <div [class]="'icon-shape text-white rounded me-3 ' + getDeviceHealthBadge()">
                      <i class="bi bi-heart"></i>
                    </div>
                    <div>
                      <span class="text-sm text-muted">Dispositivos</span>
                      <h6 class="mb-0">{{ getDeviceHealthText() }}</h6>
                    </div>
                  </div>
                </div>
                
                <!-- Data Freshness -->
                <div class="col-lg-3 col-sm-6">
                  <div class="d-flex align-items-center">
                    <div class="icon-shape bg-info text-white rounded me-3">
                      <i class="bi bi-clock"></i>
                    </div>
                    <div>
                      <span class="text-sm text-muted">Última sync</span>
                      <h6 class="mb-0">{{ getLastSyncTime() }}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions with Enhanced Design -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Acciones Rápidas</h5>
            <button class="btn btn-outline-primary btn-sm" (click)="refreshStats()">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </button>
          </div>
        </div>
        
        <div class="col-lg-3 col-md-6 mb-4">
          <div class="action-card card-hover">
            <div class="card-body text-center">
              <div class="action-icon bg-primary">
                <i class="bi bi-building-add text-white"></i>
              </div>
              <h6 class="card-title mt-3">Nueva Empresa</h6>
              <p class="card-text text-muted small">Registrar una nueva empresa en el sistema</p>
              <button class="btn btn-outline-primary btn-sm" (click)="navigateTo('/companies/new')">
                <i class="bi bi-plus-circle me-1"></i> Crear
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="action-card card-hover">
            <div class="card-body text-center">
              <div class="action-icon bg-success">
                <i class="bi bi-tree-fill text-white"></i>
              </div>
              <h6 class="card-title mt-3">Nueva Finca</h6>
              <p class="card-text text-muted small">Agregar una nueva finca productiva</p>
              <button class="btn btn-outline-success btn-sm" (click)="navigateTo('/farms/new')">
                <i class="bi bi-plus-circle me-1"></i> Crear
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="action-card card-hover">
            <div class="card-body text-center">
              <div class="action-icon bg-warning">
                <i class="bi bi-flower2 text-white"></i>
              </div>
              <h6 class="card-title mt-3">Nuevo Cultivo</h6>
              <p class="card-text text-muted small">Definir un nuevo tipo de cultivo</p>
              <button class="btn btn-outline-warning btn-sm" (click)="navigateTo('/crops/new')">
                <i class="bi bi-plus-circle me-1"></i> Crear
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-4">
          <div class="action-card card-hover">
            <div class="card-body text-center">
              <div class="action-icon bg-info">
                <i class="bi bi-cpu-fill text-white"></i>
              </div>
              <h6 class="card-title mt-3">Nuevo Dispositivo</h6>
              <p class="card-text text-muted small">Registrar dispositivo IoT</p>
              <button class="btn btn-outline-info btn-sm" (click)="navigateTo('/devices/new')">
                <i class="bi bi-plus-circle me-1"></i> Crear
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity with Real Data -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header pb-0">
              <div class="d-flex align-items-center">
                <h6 class="mb-0">Actividad Reciente</h6>
                <div class="ms-auto">
                  <span class="badge bg-success">En tiempo real</span>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div class="timeline-item" *ngFor="let activity of recentActivities; let i = index">
                  <div [class]="'timeline-marker bg-' + activity.type">
                    <i [class]="activity.icon + ' text-white'"></i>
                  </div>
                  <div class="timeline-content">
                    <h6 class="timeline-title">{{ activity.message }}</h6>
                    <p class="timeline-time text-muted">{{ activity.time | date:'medium':'':'es' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Summary -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header pb-0">
              <h6 class="mb-0">Resumen Rápido</h6>
            </div>
            <div class="card-body">
              <div class="quick-stat" *ngIf="rawData">
                <div class="stat-item d-flex justify-content-between mb-3">
                  <span class="text-muted">Empresas más activas:</span>
                  <strong>{{ getMostActiveCompany() }}</strong>
                </div>
                <div class="stat-item d-flex justify-content-between mb-3">
                  <span class="text-muted">Cultivo popular:</span>
                  <strong>{{ getMostPopularCrop() }}</strong>
                </div>
                <div class="stat-item d-flex justify-content-between mb-3">
                  <span class="text-muted">Dispositivos online:</span>
                  <strong class="text-success">{{ getOnlineDevicesCount() }}</strong>
                </div>
                <div class="stat-item d-flex justify-content-between mb-3">
                  <span class="text-muted">Última actualización:</span>
                  <strong>{{ getLastUpdateTime() }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State with Skeletons -->
      <div class="row" *ngIf="isLoading">
        <div class="col-12">
          <div class="d-flex justify-content-center align-items-center py-5">
            <div class="loading-animation">
              <div class="spinner-grow text-primary me-3" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <div>
                <h5>Cargando estadísticas...</h5>
                <p class="text-muted mb-0">Obteniendo datos del sistema AgriSmart</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State with Action -->
      <div class="row" *ngIf="errorMessage">
        <div class="col-12">
          <div class="alert alert-danger border-0 shadow-sm" role="alert">
            <div class="d-flex align-items-center">
              <i class="bi bi-exclamation-triangle fs-4 me-3"></i>
              <div class="flex-grow-1">
                <h6 class="alert-heading mb-1">Error en la carga de datos</h6>
                <p class="mb-2">{{ errorMessage }}</p>
                <button class="btn btn-danger btn-sm" (click)="refreshStats()">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Intentar nuevamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px 0;
    }

    .welcome-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 15px;
      margin-bottom: 1rem;
    }

    .stats-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stats-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .stats-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--card-gradient));
    }

    .card-primary::before {
      --card-gradient: #667eea, #764ba2;
    }

    .card-success::before {
      --card-gradient: #11998e, #38ef7d;
    }

    .card-warning::before {
      --card-gradient: #f093fb, #f5576c;
    }

    .card-info::before {
      --card-gradient: #4facfe, #00f2fe;
    }

    .icon-shape {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      position: relative;
    }

    .bg-gradient-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .bg-gradient-success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .bg-gradient-warning {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .bg-gradient-info {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .card-category {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .card-title {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .counter {
      animation: countUp 0.8s ease-out;
    }

    @keyframes countUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .action-card {
      border: none;
      border-radius: 15px;
      transition: all 0.3s ease;
      height: 100%;
    }

    .card-hover:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .action-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin: 0 auto;
      font-size: 1.5rem;
    }

    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 1rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e9ecef;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .timeline-marker {
      position: absolute;
      left: -2rem;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timeline-content {
      padding-left: 1rem;
    }

    .timeline-title {
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .timeline-time {
      font-size: 0.75rem;
    }

    .loading-animation {
      text-align: center;
    }

    .pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    .quick-stat .stat-item {
      padding: 0.5rem 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .quick-stat .stat-item:last-child {
      border-bottom: none;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .welcome-card {
        padding: 1.5rem;
        text-align: center;
      }
      
      .card-title {
        font-size: 2rem;
      }
      
      .timeline {
        padding-left: 1.5rem;
      }
      
      .timeline-marker {
        left: -1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  `],
  providers: [DatePipe],
  imports: [DatePipe, CommonModule]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats: DashboardStats = {
    totalCompanies: 0,
    totalFarms: 0,
    totalCrops: 0,
    totalDevices: 0,
    activeDevices: 0
  };
  isLoading = true;
  errorMessage = '';
  currentDate = new Date();
  rawData: any = {};
  recentActivities: RecentActivity[] = [];

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private farmService: FarmService,
    private cropService: CropService,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardStats();
    this.generateInitialActivities();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Use forkJoin to load all data in parallel
    forkJoin({
      companies: this.companyService.getAll().pipe(
        catchError(error => {
          console.error('Companies error:', error);
          return of([]);
        })
      ),
      farms: this.farmService.getAll().pipe(
        catchError(error => {
          console.error('Farms error:', error);
          return of([]);
        })
      ),
      crops: this.cropService.getAll().pipe(
        catchError(error => {
          console.error('Crops error:', error);
          return of([]);
        })
      ),
      devices: this.deviceService.getAll().pipe(
        catchError(error => {
          console.error('Devices error:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        // Store raw data for analysis
        this.rawData = data;

        // Update stats
        this.stats = {
          totalCompanies: data.companies.length,
          totalFarms: data.farms.length,
          totalCrops: data.crops.length,
          totalDevices: data.devices.length,
          activeDevices: data.devices.length
        };

        // Generate activities based on real data
        this.generateActivitiesFromData(data);

        this.isLoading = false;
        console.log('Dashboard loaded successfully:', this.stats);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos del dashboard';
        this.isLoading = false;
        console.error('Dashboard error:', error);
      }
    });
  }

  private generateInitialActivities(): void {
    this.recentActivities = [
      {
        icon: 'bi-power',
        message: 'Sistema AgriSmart iniciado correctamente',
        time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        type: 'success'
      },
      {
        icon: 'bi-person-check',
        message: 'Usuario autenticado con éxito',
        time: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        type: 'primary'
      }
    ];
  }

  private generateActivitiesFromData(data: any): void {
    const activities: RecentActivity[] = [...this.recentActivities];

    if (data.companies.length > 0) {
      activities.push({
        icon: 'bi-building-check',
        message: `${data.companies.length} empresas cargadas exitosamente`,
        time: new Date(Date.now() - 1000 * 30), // 30 seconds ago
        type: 'info'
      });
    }

    if (data.devices.length > 0) {
      const onlineDevices = data.devices.filter((d: any) => d.active).length;
      activities.push({
        icon: 'bi-wifi',
        message: `${onlineDevices} de ${data.devices.length} dispositivos están activos`,
        time: new Date(),
        type: onlineDevices === data.devices.length ? 'success' : 'warning'
      });
    }

    this.recentActivities = activities.slice(0, 5); // Keep only last 5 activities
  }

  // Utility methods for enhanced display
  getCompanyGrowth(): string {
    // Mock growth calculation - you can enhance this with real historical data
    return Math.floor(Math.random() * 15 + 5).toString();
  }

  getActiveFarmsPercent(): string {
    if (!this.rawData.farms) return '0';
    const activeFarms = this.rawData.farms.filter((f: any) => f.active).length;
    return Math.round((activeFarms / this.rawData.farms.length) * 100).toString();
  }

  getCropVariety(): string {
    if (!this.rawData.crops) return '0';
    // Count unique crop types/categories
    const uniqueTypes = new Set(this.rawData.crops.map((c: any) => c.name.split(' ')[0]));
    return uniqueTypes.size.toString();
  }

  getDeviceStatusClass(): string {
    const healthPercent = this.getDeviceHealthPercent();
    if (healthPercent >= 80) return 'text-success';
    if (healthPercent >= 60) return 'text-warning';
    return 'text-danger';
  }

  getDeviceStatusIcon(): string {
    const healthPercent = this.getDeviceHealthPercent();
    if (healthPercent >= 80) return 'bi-check-circle';
    if (healthPercent >= 60) return 'bi-exclamation-circle';
    return 'bi-x-circle';
  }

  getDeviceStatusText(): string {
    const healthPercent = this.getDeviceHealthPercent();
    if (healthPercent >= 80) return 'Excelente';
    if (healthPercent >= 60) return 'Bueno';
    return 'Requiere atención';
  }

  getDeviceHealthPercent(): number {
    if (!this.stats.totalDevices) return 0;
    return Math.round((this.stats.activeDevices / this.stats.totalDevices) * 100);
  }

  getDeviceHealthBadge(): string {
    const healthPercent = this.getDeviceHealthPercent();
    if (healthPercent >= 80) return 'bg-success';
    if (healthPercent >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  getDeviceHealthText(): string {
    return `${this.getDeviceHealthPercent()}% Activos`;
  }

  getLastSyncTime(): string {
    return 'Ahora mismo';
  }

  getMostActiveCompany(): string {
    if (!this.rawData.companies || this.rawData.companies.length === 0) return 'N/A';
    // Return the first company as most active (you can enhance this logic)
    return this.rawData.companies[0].name || 'N/A';
  }

  getMostPopularCrop(): string {
    if (!this.rawData.crops || this.rawData.crops.length === 0) return 'N/A';
    // Return the first crop or most common one
    return this.rawData.crops[0]?.name || 'N/A';
  }

  getOnlineDevicesCount(): string {
    return `${this.stats.activeDevices}/${this.stats.totalDevices}`;
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  navigateTo(path: string): void {
    console.log('Navigate to:', path);
    // In a real implementation, you would use Router
    // this.router.navigate([path]);
  }

  refreshStats(): void {
    console.log('Refreshing dashboard stats...');
    this.loadDashboardStats();
  }
}