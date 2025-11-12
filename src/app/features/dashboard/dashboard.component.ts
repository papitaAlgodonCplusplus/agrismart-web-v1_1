  // dashboard.component.ts - Enhanced with Real API-Based Alerts
  import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Router } from '@angular/router';
  import { Observable, forkJoin, of, catchError } from 'rxjs';

  // Services
  import { AuthService } from '../../core/auth/auth.service';
  import { ApiService } from '../../core/services/api.service';
  import { IrrigationSectorService } from '../services/irrigation-sector.service';

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
    type: 'success' | 'warning' | 'info' | 'danger' | 'primary';
    message: string;
    timestamp: Date;
    user?: string;
    deviceId?: string;
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
      users: [],
      deviceRawData: []
    };

    isLoading = true;
    errorMessage = '';

    constructor(
      private authService: AuthService,
      private apiService: ApiService,
      private irrigationService: IrrigationSectorService,
      private router: Router,
      private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
      this.loadDashboardStats();
    }

    private loadDashboardStats(): void {
      this.isLoading = true;
      this.errorMessage = '';

      // Load data from multiple endpoints including device raw data
      forkJoin({
        farms: this.apiService.get('/Farm').pipe(catchError(() => of([]))),
        devices: this.apiService.get('/Device').pipe(catchError(() => of([]))),
        crops: this.apiService.get('/Crop').pipe(catchError(() => of([]))),
        cropProductions: this.apiService.get('/CropProduction').pipe(catchError(() => of([]))),
        users: this.apiService.get('/User').pipe(catchError(() => of([]))),
        deviceRawData: this.irrigationService.getDeviceRawData().pipe(catchError(() => of([])))
      }).subscribe({
        next: (data) => {
          console.log('Dashboard data loaded:', data);
          this.rawData = data;
          this.calculateStats();
          this.generateRecentActivitiesFromRealData();
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
      // Extract arrays from nested structure
      const farms = this.rawData.farms?.farms || [];
      const devices = this.rawData.devices?.devices || [];
      const crops = this.rawData.crops?.crops || [];
      const cropProductions = this.rawData.cropProductions?.cropProductions || [];
      const users = this.rawData.users?.users || [];
      const userId = this.authService.getCurrentUserId();

      // Calculate active devices from raw data
      const activeDeviceNames = new Set(
        (this.rawData.deviceRawData || []).map((d: any) => d.sensor)
      );

      this.stats = {
        totalFarms: farms.length,
        totalDevices: devices.length,
        activeDevices: activeDeviceNames.size,
        totalCrops: crops.filter((c: any) => c.createdBy?.toString() === userId?.toString()).length,
        activeCropProductions: cropProductions.filter((cp: any) => cp.isActive || cp.active).length,
        totalUsers: users.length,
        alertsCount: this.calculateRealAlerts(devices, this.rawData.deviceRawData || [])
      };
    }

    private calculateRealAlerts(devices: any[], rawDeviceData: any[]): number {
      let alerts = 0;

      // Get set of active device names from raw data
      const activeDeviceNames = new Set(rawDeviceData.map((d: any) => d.sensor));
      console.log('Active devices from raw data:', activeDeviceNames);

      // Count offline/inactive registered devices
      alerts += devices.filter((d: any) => !activeDeviceNames.has(d.name)).length;
      console.log('Offline/inactive devices:', devices.filter((d: any) => !activeDeviceNames.has(d.name)).map((d: any) => d.name));

      // Analyze raw device data for alerts
      const deviceDataMap = new Map<string, any[]>();

      rawDeviceData.forEach((data: any) => {
        const deviceName = data.sensor;
        if (!deviceDataMap.has(deviceName)) {
          deviceDataMap.set(deviceName, []);
        }
        deviceDataMap.get(deviceName)!.push(data);
      });
      console.log('Device data map:', deviceDataMap);

      // Check each active device for alert conditions
      deviceDataMap.forEach((dataPoints, deviceName) => {
        const latestData = dataPoints[dataPoints.length - 1];
        console.log(`Analyzing data for device: ${deviceName}`, latestData);

        // Battery alerts (low battery)
        const batteryKeys = ['Bat', 'BAT', 'Bat_V', 'BatV'];
        for (const key of batteryKeys) {
          if (latestData.sensor === key  && latestData !== null) {
            const batValue = parseFloat(latestData.payload);
            if (batValue < 3.5) alerts++; // Low battery threshold
          }
        }

        // Temperature alerts (anomalous readings)
        const tempKeys = ['TEMP_SOIL', 'temp_SOIL', 'temp_DS18B20', 'TempC_DS18B20'];
        for (const key of tempKeys) {
          if (latestData.sensor === key  && latestData !== null) {
            const tempValue = parseFloat(latestData.payload);
            if (tempValue > 100 || tempValue < 0) alerts++; // Anomalous temperature
          }
        }

        // pH alerts (out of optimal range)
        const phKeys = ['PH1_SOIL', 'PH_SOIL'];
        for (const key of phKeys) {
          if (latestData.sensor === key  && latestData !== null) {
            const phValue = parseFloat(latestData.payload);
            if (phValue < 1 || phValue > 14) alerts++; // Invalid pH
            else if (phValue < 5.5 || phValue > 7.5) alerts++; // Out of optimal range
          }
        }

        // Alarm alerts
        if (latestData['Alarm'] === 'TRUE' || latestData['Alarm'] === true) {
          alerts++;
        }

        // Pressure alerts
        if (latestData['Water_pressure_MPa'] !== undefined) {
          const pressure = parseFloat(latestData['Water_pressure_MPa'].payload);
          if (pressure > 1.0) alerts++; // High pressure
        }

        // Check last update time
        const lastUpdate = new Date(latestData.recordDate);
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate > 24) alerts++; // Device not reporting for 24+ hours
      });

      return alerts;
    }

    private generateRecentActivitiesFromRealData(): void {
      this.recentActivities = [];
      let activityId = 1;

      const rawDeviceData = this.rawData.deviceRawData || [];
      const devices = this.rawData.devices?.devices || [];

      // Get set of active device names
      const activeDeviceNames = new Set(rawDeviceData.map((d: any) => d.sensor));

      // Create map of latest data per device
      const deviceDataMap = new Map<string, any>();
      rawDeviceData.forEach((data: any) => {
        const existing = deviceDataMap.get(data.sensor);
        if (!existing || new Date(data.recordDate) > new Date(existing.recordDate)) {
          deviceDataMap.set(data.sensor, data);
        }
      });

      console.log('Generating activities from device data:', deviceDataMap);

      // Generate activities from device data analysis
      deviceDataMap.forEach((latestData, deviceName) => {
        console.log(`Analyzing data for device: ${deviceName}`, latestData);
        // Check for various alert conditions and create activities

        // Battery alerts
        const batteryKeys = ['Bat', 'BAT', 'Bat_V', 'BatV'];
        for (const key of batteryKeys) {
          if (latestData.sensor === key && latestData !== null) {
            console.log(`Analyzing battery data for device: ${deviceName}`, latestData);
            const batValue = parseFloat(latestData.payload);
            const timestamp = new Date(latestData.recordDate);
            if (batValue < 3.5) {
              this.recentActivities.push({
                icon: 'bi-battery',
                id: activityId++,
                type: 'danger',
                message: `${deviceName}: Batería crítica (${batValue.toFixed(2)}V)`,
                timestamp,
                deviceId: deviceName
              });
            } else if (batValue < 3.3) {
              this.recentActivities.push({
                icon: 'bi-battery-half',
                id: activityId++,
                type: 'warning',
                message: `${deviceName}: Batería baja (${batValue.toFixed(2)}V)`,
                timestamp,
                deviceId: deviceName
              });
            }
          }
        }

        // Temperature alerts
        const tempKeys = ['TEMP_SOIL', 'temp_SOIL', 'temp_DS18B20', 'TempC_DS18B20'];
        for (const key of tempKeys) {
          if (latestData.sensor === key  && latestData !== null) {
            const tempValue = parseFloat(latestData.payload);
            const timestamp = new Date(latestData.recordDate);
            if (tempValue > 100) {
              this.recentActivities.push({
                icon: 'bi-thermometer-high',
                id: activityId++,
                type: 'warning',
                message: `${deviceName}: Temperatura anómala (${tempValue.toFixed(1)}°C)`,
                timestamp,
                deviceId: deviceName
              });
            } else if (tempValue > 50) {
              this.recentActivities.push({
                icon: 'bi-thermometer-sun',
                id: activityId++,
                type: 'warning',
                message: `${deviceName}: Temperatura alta (${tempValue.toFixed(1)}°C)`,
                timestamp,
                deviceId: deviceName
              });
            }
          }
        }

        // pH alerts
        const phKeys = ['PH1_SOIL', 'PH_SOIL'];
        for (const key of phKeys) {
          if (latestData.sensor === key  && latestData !== null) {
            const phValue = parseFloat(latestData.payload);
            const timestamp = new Date(latestData.recordDate);
            if (phValue < 1 || phValue > 14) {
              this.recentActivities.push({
                icon: 'bi-droplet',
                id: activityId++,
                type: 'warning',
                message: `${deviceName}: pH fuera de rango (${phValue.toFixed(2)})`,
                timestamp,
                deviceId: deviceName
              });
            } else if (phValue < 5.5 || phValue > 7.5) {
              this.recentActivities.push({
                icon: 'bi-droplet-half',
                id: activityId++,
                type: 'info',
                message: `${deviceName}: pH no óptimo (${phValue.toFixed(2)})`,
                timestamp,
                deviceId: deviceName
              });
            }
          }
        }

        // Alarm alerts
        if (latestData['Alarm'] === 'TRUE' || latestData['Alarm'] === true) {
          this.recentActivities.push({
            icon: 'bi-bell-fill',
            id: activityId++,
            type: 'danger',
            message: `${deviceName}: Alarma activada`,
            timestamp: new Date(latestData['Alarm'].recordDate),
            deviceId: deviceName
          });
        }

        // Pressure alerts
        if (latestData['Water_pressure_MPa'] !== undefined) {
          const pressure = parseFloat(latestData['Water_pressure_MPa'].payload);
          if (pressure > 1.0) {
            this.recentActivities.push({
              icon: 'bi-arrows-angle-expand',
              id: activityId++,
              type: 'warning',
              message: `${deviceName}: Presión alta (${pressure.toFixed(3)} MPa)`,
              timestamp: new Date(latestData['Water_pressure_MPa'].recordDate),
              deviceId: deviceName
            });
          }
        }

        // Positive activities - recent data received
        const timestamp = new Date(latestData[Object.keys(latestData)[0]].recordDate);
        const hoursSinceUpdate = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 1) {
          this.recentActivities.push({
            icon: 'bi-check-circle',
            id: activityId++,
            type: 'success',
            message: `${deviceName}: Datos recibidos correctamente`,
            timestamp,
            deviceId: deviceName
          });
        }
      });

      // Add activities for inactive devices
      // devices.forEach((device: any) => {
      //   if (!activeDeviceNames.has(device.name)) {
      //     this.recentActivities.push({
      //       icon: 'bi-wifi-off',
      //       id: activityId++,
      //       type: 'warning',
      //       message: `${device.name}: Sin enviar datos`,
      //       timestamp: new Date(),
      //       deviceId: device.name
      //     });
      //   }
      // });

      // Sort by timestamp (most recent first) and limit to top 10
      this.recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.recentActivities = this.recentActivities.slice(0, 10);

      // If no real activities, add a default informative message
      if (this.recentActivities.length === 0) {
        this.recentActivities.push({
          icon: 'bi-info-circle',
          id: 1,
          type: 'info',
          message: 'Sistema operando normalmente',
          timestamp: new Date(),
          user: 'Sistema'
        });
      }
    }

    // Getter methods for dashboard cards
    getTotalFarms(): number {
      return this.stats.totalFarms;
    }

    getActiveFarms(): number {
      return this.rawData.farms?.farms?.filter((f: any) => f.isActive || f.active)?.length || 0;
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

    getTopFarm(): string {
      return this.rawData.farms?.farms?.[0]?.name || 'N/A';
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
      const classes: { [key: string]: string } = {
        'success': 'bg-success',
        'warning': 'bg-warning',
        'info': 'bg-info',
        'danger': 'bg-danger',
        'primary': 'bg-primary'
      };
      return classes[type] || 'bg-secondary';
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

    // Navigation methods
    navigateToIrrigationRequirements(): void {
      this.router.navigate(['/irrigation-on-demand']);
    }

    navigateToShinyDashboard(): void {
      this.router.navigate(['/shiny-dashboard']);
    }

    navigateToNutrientFormulation(): void {
      this.router.navigate(['/nutrient-formulation']);
    }

    navigateToWaterAnalysis(): void {
      this.router.navigate(['/water-chemistry']);
    }

    navigateToFertilizers(): void {
      this.router.navigate(['/fertilizers']);
    }

    navigateToIrrigationDesignRequirements(): void {
      this.router.navigate(['/irrigation-engineering-design']);
    }

    navigateToCrops(): void {
      this.router.navigate(['/crops']);
    }

    navigateToCropPhases(): void {
      this.router.navigate(['/crop-phases']);
    }

    navigateToPhaseRequirements(): void {
      this.router.navigate(['/phase-requirements']);
    }

    navigateToCropProduction(): void {
      this.router.navigate(['/crop-production']);
    }

    navigateToFarms(): void {
      this.router.navigate(['/farms']);
    }

    navigateToDevices(): void {
      this.router.navigate(['/devices']);
    }

    navigateToProductionUnits(): void {
      this.router.navigate(['/production-units']);
    }
  }