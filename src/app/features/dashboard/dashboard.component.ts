// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { CompanyService } from '../companies/services/company.service';
import { FarmService } from '../farms/services/farm.service';
import { CropService } from '../crops/services/crop.service';
import { DeviceService } from '../devices/services/device.service';
import { forkJoin } from 'rxjs';
import { DatePipe, CommonModule } from '@angular/common';

export interface DashboardStats {
  totalCompanies: number;
  totalFarms: number;
  totalCrops: number;
  totalDevices: number;
  activeDevices: number;
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <div class="row mb-4">
        <div class="col-12">
          <h1>Dashboard - AgriSmart</h1>
          <p class="text-muted">Bienvenido, {{ currentUser?.name || 'Usuario' }}</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4" *ngIf="stats">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.totalCompanies }}</h4>
                  <p class="card-text">Empresas</p>
                </div>
                <i class="bi bi-building display-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.totalFarms }}</h4>
                  <p class="card-text">Fincas</p>
                </div>
                <i class="bi bi-tree display-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.totalCrops }}</h4>
                  <p class="card-text">Cultivos</p>
                </div>
                <i class="bi bi-flower1 display-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ stats.activeDevices }}/{{ stats.totalDevices }}</h4>
                  <p class="card-text">Dispositivos</p>
                </div>
                <i class="bi bi-cpu display-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="row" *ngIf="isLoading">
        <div class="col-12 text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando estadísticas...</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <h3>Acciones Rápidas</h3>
        </div>
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-building-add display-4 text-primary"></i>
              <h5 class="card-title mt-2">Nueva Empresa</h5>
              <p class="card-text">Crear una nueva empresa</p>
              <button class="btn btn-primary" (click)="navigateTo('/companies/new')">
                Crear
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-tree-fill display-4 text-success"></i>
              <h5 class="card-title mt-2">Nueva Finca</h5>
              <p class="card-text">Crear una nueva finca</p>
              <button class="btn btn-success" (click)="navigateTo('/farms/new')">
                Crear
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-flower2 display-4 text-warning"></i>
              <h5 class="card-title mt-2">Nuevo Cultivo</h5>
              <p class="card-text">Crear un nuevo cultivo</p>
              <button class="btn btn-warning" (click)="navigateTo('/crops/new')">
                Crear
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="bi bi-cpu-fill display-4 text-info"></i>
              <h5 class="card-title mt-2">Nuevo Dispositivo</h5>
              <p class="card-text">Registrar un nuevo dispositivo</p>
              <button class="btn btn-info" (click)="navigateTo('/devices/new')">
                Crear
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Actividad Reciente</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-building text-primary me-2"></i>
                    Sistema iniciado correctamente
                  </div>
                  <small class="text-muted">{{ currentDate | date:'short' }}</small>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-person-check text-success me-2"></i>
                    Usuario conectado
                  </div>
                  <small class="text-muted">{{ currentDate | date:'short' }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div class="row" *ngIf="errorMessage">
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard .card {
      transition: transform 0.2s;
    }
    .dashboard .card:hover {
      transform: translateY(-2px);
    }
    .display-4 {
      opacity: 0.8;
    }
  `],
  providers: [DatePipe],
  imports: [DatePipe, CommonModule]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats: DashboardStats | null = null;
  isLoading = true;
  errorMessage = '';
  currentDate = new Date();

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
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load all statistics in parallel
    forkJoin({
      companies: this.companyService.getAll(),
      farms: this.farmService.getAll(),
      crops: this.cropService.getAll(),
      devices: this.deviceService.getAll()
    }).subscribe({
      next: (data) => {
        this.stats = {
          totalCompanies: data.companies.length,
          totalFarms: data.farms.length,
          totalCrops: data.crops.length,
          totalDevices: data.devices.length,
          activeDevices: data.devices.filter(d => d.isActive).length
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las estadísticas del dashboard';
        this.isLoading = false;
        console.error('Dashboard stats error:', error);
      }
    });
  }

  navigateTo(path: string): void {
    // This would use Router in a real implementation
    console.log('Navigate to:', path);
    // this.router.navigate([path]);
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }
}