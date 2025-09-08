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
import { Router } from '@angular/router';

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
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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
    private router: Router,
    private authService: AuthService,
    private companyService: CompanyService,
    private farmService: FarmService,
    private cropService: CropService,
    private deviceService: DeviceService
  ) { }

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
        this.rawData = data;
        this.processStats(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Dashboard data loading error:', error);
        this.errorMessage = 'Error al cargar los datos del dashboard. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }

  private processStats(data: any): void {
    this.stats = {
      totalCompanies: data.companies?.length || 0,
      totalFarms: data.farms?.length || 0,
      totalCrops: data.crops?.length || 0,
      totalDevices: data.devices?.length || 0,
      activeDevices: data.devices.length || 0
    };
  }

  private generateInitialActivities(): void {
    const activities: RecentActivity[] = [
      {
        icon: 'bi-check-circle',
        message: 'Sistema de riego automático activado',
        time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        type: 'success'
      },
      {
        icon: 'bi-thermometer-half',
        message: 'Sensor de temperatura registra 24°C',
        time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        type: 'info'
      },
      {
        icon: 'bi-droplet',
        message: 'Nivel de humedad del suelo: 65%',
        time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        type: 'primary'
      },
      {
        icon: 'bi-exclamation-triangle',
        message: 'Dispositivo IoT requiere mantenimiento',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'warning'
      },
      {
        icon: 'bi-gear',
        message: 'Configuración de fertilización actualizada',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        type: 'info'
      }
    ];

    this.recentActivities = activities;
  }

  // Helper methods for template
  getCompanyGrowth(): number {
    // Mock calculation - in real app, this would compare with previous period
    return Math.floor(Math.random() * 20) + 5;
  }

  getFarmGrowth(): number {
    return Math.floor(Math.random() * 15) + 3;
  }

  getCropGrowth(): number {
    return Math.floor(Math.random() * 25) + 8;
  }

  getDeviceEfficiency(): number {
    if (this.stats.totalDevices === 0) return 0;
    return Math.round((this.stats.activeDevices / this.stats.totalDevices) * 100);
  }

  getMostActiveCompany(): string {
    return this.rawData.companies?.[0]?.name || 'N/A';
  }

  getMostPopularCrop(): string {
    return this.rawData.crops?.[0]?.name || 'N/A';
  }

  getOnlineDevicesCount(): number {
    return this.stats.activeDevices;
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }

  getActivityTypeClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      case 'primary': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  navigateToIrrigationRequirements(): void {
    this.router.navigate(['/irrigation-on-demand']);
  }

  navigateToShinyDashboard(): void {
    this.router.navigate(['/shiny-dashboard']);
  }

  /**
   * Navigate to nutrient solution formulation
   */
  navigateToNutrientFormulation(): void {
    this.router.navigate(['/nutrient-formulation']);
  }

  /**
   * Navigate to water analysis/chemistry management
   */
  navigateToWaterAnalysis(): void {
    this.router.navigate(['/water-chemistry']);
  }

  /**
   * Navigate to fertilizer management
   */
  navigateToFertilizers(): void {
    this.router.navigate(['/fertilizers']);
  }

  /**
   * Navigate to crop requirements
   */
  navigateToCropRequirements(): void {
    this.router.navigate(['/crops']);
  }
}