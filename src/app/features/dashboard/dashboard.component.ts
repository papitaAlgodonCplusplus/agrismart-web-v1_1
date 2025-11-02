// src/app/features/dashboard/dashboard.component.ts (Updated)
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, forkJoin, of, catchError } from 'rxjs';

// Services
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/services/api.service';

interface DashboardStats {
  totalFarms: number;
  totalDevices: number;
  activeDevices: number;
  totalCrops: number;
  activeCropProductions: number;
  totalUsers: number;
  alertsCount: number;
}

interface RecentActivity {
  icon: string;
  id: number;
  type: string;
  message: string;
  timestamp: Date;
  user?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalFarms: 0,
    totalDevices: 0,
    activeDevices: 0,
    totalCrops: 0,
    activeCropProductions: 0,
    totalUsers: 0,
    alertsCount: 0
  };

  recentActivities: RecentActivity[] = [];
  rawData: any = {
    farms: [],
    devices: [],
    crops: [],
    cropProductions: [],
    users: []
  };

  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load data from multiple endpoints
    forkJoin({
      farms: this.apiService.get('/Farm').pipe(catchError(() => of([]))),
      devices: this.apiService.get('/Device').pipe(catchError(() => of([]))),
      crops: this.apiService.get('/Crop').pipe(catchError(() => of([]))),
      cropProductions: this.apiService.get('/CropProduction').pipe(catchError(() => of([]))),
      users: this.apiService.get('/User').pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.rawData = data;
        this.calculateStats();
        this.generateRecentActivities();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage = 'Error al cargar los datos del dashboard';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private calculateStats(): void {
    console.log("rawData: ", this.rawData);

    // Extract arrays from nested structure
    const farms = this.rawData.farms?.farms || [];
    const devices = this.rawData.devices?.devices || [];
    const crops = this.rawData.crops?.crops || [];
    const cropProductions = this.rawData.cropProductions?.cropProductions || [];
    const users = this.rawData.users?.users || [];
    const userId = this.authService.getCurrentUser()?.id;

    this.stats = {
      totalFarms: farms.length,
      totalDevices: devices.length,
      activeDevices: devices.filter((d: any) => d.isActive || d.active).length,
      totalCrops: crops.filter((c: any) => c.createdBy.toString() === userId.toString()).length,
      activeCropProductions: cropProductions.filter((cp: any) => cp.isActive || cp.active).length,
      totalUsers: users.length,
      alertsCount: this.calculateAlerts(devices, cropProductions)
    };
  }

  private calculateAlerts(devices: any[], cropProductions: any[]): number {
    let alerts = 0;

    // If no parameters provided, extract from rawData (for backward compatibility)
    if (!devices || !cropProductions || devices === undefined || cropProductions === undefined) {
      devices = this.rawData.devices?.devices || [];
      cropProductions = this.rawData.cropProductions?.cropProductions || [];
    }

    // Count offline devices as alerts
    alerts += devices.filter((d: any) => !(d.isActive || d.active)).length;

    // Count inactive crop productions as potential alerts
    alerts += cropProductions.filter((cp: any) => !(cp.isActive || cp.active)).length;

    return alerts;
  }

  private generateRecentActivities(): void {
    this.recentActivities = [
      {
        icon: 'bi-check-circle',
        id: 1,
        type: 'success',
        message: 'Sistema de riego activado automáticamente',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'Sistema'
      },
      {
        icon: 'bi-thermometer-half',
        id: 2,
        type: 'info',
        message: 'Nuevos datos de sensores recibidos',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        user: 'Sensor IoT-001'
      },
      {
        icon: 'bi-droplet',
        id: 3,
        type: 'warning',
        message: 'Nivel de pH fuera del rango óptimo',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: 'Monitor Químico'
      },
      {
        icon: 'bi-gear',
        id: 4,
        type: 'primary',
        message: 'Nuevo cultivo agregado al catálogo',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        user: this.authService.getCurrentUser()?.name || 'Usuario'
      }
    ];
  }

  // Getter methods for dashboard cards
  getTotalFarms(): number {
    return this.stats.totalFarms;
  }

  getActiveFarms(): number {
    return this.rawData.farms?.filter((f: any) => f.isActive || f.active)?.length || 0;
  }

  getTotalDevices(): number {
    return this.stats.totalDevices;
  }

  getTotalCrops(): number {
    return this.stats.totalCrops;
  }

  getActiveCropProductions(): number {
    return this.stats.activeCropProductions;
  }

  getAlertsCount(): number {
    return this.stats.alertsCount;
  }

  // Additional utility methods
  getTopFarm(): string {
    return this.rawData.farms?.[0]?.name || 'N/A';
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
    console.log("going to water")
    this.router.navigate(['/water-chemistry']);
  }

  /**
   * Navigate to fertilizer management
   */
  navigateToFertilizers(): void {
    this.router.navigate(['/fertilizers']);
  }

  /**
   * Navigate to irrigation design requirements
   */
  navigateToIrrigationDesignRequirements(): void {
    this.router.navigate(['/irrigation-engineering-design']);
  }

  // NEW: Navigation methods for new components

  /**
   * Navigate to crop catalog management
   */
  navigateToCrops(): void {
    this.router.navigate(['/crops']);
  }

  /**
   * Navigate to crop phases management
   */
  navigateToCropPhases(): void {
    this.router.navigate(['/crop-phases']);
  }

  /**
   * Navigate to phase requirements management
   */
  navigateToPhaseRequirements(): void {
    this.router.navigate(['/phase-requirements']);
  }

  /**
   * Navigate to crop production management
   */
  navigateToCropProduction(): void {
    this.router.navigate(['/crop-production']);
  }

  /**
   * Navigate to farms management
   */
  navigateToFarms(): void {
    this.router.navigate(['/farms']);
  }

  /**
   * Navigate to devices management
   */
  navigateToDevices(): void {
    this.router.navigate(['/devices']);
  }

  /**
   * Navigate to production units management
   */
  navigateToProductionUnits(): void {
    this.router.navigate(['/production-units']);
  }
}