// src/app/features/devices/device-list/device-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, forkJoin, of, Subject, interval } from 'rxjs';
import { catchError, tap, finalize, takeUntil, startWith, switchMap, map } from 'rxjs/operators';

// Services
import { DeviceService, DeviceFilters, DeviceCreateRequest, DeviceUpdateRequest, DeviceStatistics } from '../services/device.service';
import { IrrigationSectorService } from '../../services/irrigation-sector.service';
import { Device } from '../../../core/models/models';
import { AuthService } from '../../../core/auth/auth.service';

// Interfaces for enhanced device data
interface DeviceReading {
  value: number | null;
  timestamp: string;
  rawValue: string;
  sensor: string;
}

interface EnhancedDevice extends Device {
  isActive: boolean;
  lastSeen?: Date;
  lastReading?: Date;
  sensorReadings: { [sensor: string]: DeviceReading };
  connectionStatus: 'online' | 'warning' | 'offline' | 'inactive';
  deviceType: string;
  hasRealTimeData: boolean;
  cropProductionIds: number[];
}

interface DeviceRawDataItem {
  id: number;
  recordDate: string;
  clientId: string;
  userId: string;
  deviceId: string;
  sensor: string;
  payload: string;
}

interface IoTDeviceResponse {
  id: number;
  deviceId: string;
  active: boolean;
  companyId: number;
  dateCreated: string;
  dateUpdated?: string;
}

interface CropProductionDevice {
  cropProductionId: number;
  deviceId: number;
  startDate: string;
  active: boolean;
}

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss']
})
export class DeviceListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  devices: EnhancedDevice[] = [];
  filteredDevices: EnhancedDevice[] = [];
  registeredDevices: Device[] = [];
  iotDevices: IoTDeviceResponse[] = [];
  rawData: DeviceRawDataItem[] = [];
  cropProductionDevices: CropProductionDevice[] = [];
  
  // UI state
  selectedDevice: EnhancedDevice | null = null;
  isLoading = true;
  error: string | null = null;
  showForm = false;
  isEditMode = false;
  autoRefresh = true;
  
  // Form
  deviceForm!: FormGroup;
  
  // Filters
  filters: DeviceFilters = {};
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  
  // Statistics
  statistics: DeviceStatistics | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Device types and options
  deviceTypes = [
    { value: 'flujo', label: 'Sensor de Flujo' },
    { value: 'ph-suelo', label: 'Sensor de pH del Suelo' },
    { value: 'estacion-metereologica', label: 'Estación Meteorológica' },
    { value: 'presion', label: 'Sensor de Presión' },
    { value: 'suelo', label: 'Sensor de Suelo' },
    { value: 'otro', label: 'Otro' }
  ];
  
  manufacturers = [
    { value: 'Arduino', label: 'Arduino' },
    { value: 'Raspberry Pi', label: 'Raspberry Pi' },
    { value: 'AgriSmart', label: 'AgriSmart' },
    { value: 'Adafruit', label: 'Adafruit' },
    { value: 'SparkFun', label: 'SparkFun' },
    { value: 'Custom', label: 'Personalizado' }
  ];

  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'online', label: 'En línea' },
    { value: 'warning', label: 'Advertencia' },
    { value: 'offline', label: 'Desconectado' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  constructor(
    private deviceService: DeviceService,
    private irrigationService: IrrigationSectorService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAllDeviceData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.deviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      deviceType: ['', Validators.required],
      serialNumber: [''],
      model: [''],
      manufacturer: [''],
      firmwareVersion: [''],
      macAddress: [''],
      ipAddress: [''],
      batteryLevel: [100, [Validators.min(0), Validators.max(100)]],
      signalStrength: [-50, [Validators.min(-120), Validators.max(0)]],
      status: ['Offline'],
      isActive: [true]
    });
  }

  private setupAutoRefresh(): void {
    if (this.autoRefresh) {
      interval(30000) // Refresh every 30 seconds
        .pipe(
          startWith(0),
          switchMap(() => this.loadRealTimeData()),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  private loadAllDeviceData(): void {
    this.isLoading = true;
    this.error = null;

    // Load all required data using the same pattern as shiny-dashboard
    forkJoin({
      registeredDevices: this.deviceService.getAll().pipe(
        catchError(error => {
          console.error('Error loading registered devices:', error);
          return of([]);
        })
      ),
      iotDevices: this.irrigationService.getIoTDevices().pipe(
        catchError(error => {
          console.error('Error loading IoT devices:', error);
          return of([]);
        })
      ),
      rawData: this.irrigationService.getDeviceRawData().pipe(
        catchError(error => {
          console.error('Error loading raw data:', error);
          return of([]);
        })
      ),
      cropProductionDevices: this.irrigationService.getCropProductionDevices().pipe(
        catchError(error => {
          console.error('Error loading crop production devices:', error);
          return of([]);
        })
      ),
      statistics: this.deviceService.getStatistics().pipe(
        catchError(error => {
          console.error('Error loading statistics:', error);
          return of(null);
        })
      )
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ registeredDevices, iotDevices, rawData, cropProductionDevices, statistics }) => {
        console.log('Data loaded successfully: ', {
          registeredDevices: registeredDevices?.length || 0,
          iotDevices: iotDevices?.length || 0, 
          rawData: rawData?.length || 0,
          cropProductionDevices: cropProductionDevices?.length || 0
        });
        
        this.registeredDevices = registeredDevices || [];
        this.iotDevices = iotDevices || [];
        this.rawData = rawData || [];
        this.cropProductionDevices = cropProductionDevices || [];
        this.statistics = statistics;

        this.combineDeviceData();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading device data:', error);
        this.error = 'Error al cargar los datos de los dispositivos';
      }
    });
  }

  private loadRealTimeData(): Observable<any> {
    return forkJoin({
      rawData: this.irrigationService.getDeviceRawData().pipe(
        catchError(() => of([]))
      ),
      statistics: this.deviceService.getStatistics().pipe(
        catchError(() => of(null))
      )
    }).pipe(
      tap(({ rawData, statistics }) => {
        this.rawData = rawData || [];
        this.statistics = statistics;
        this.updateDeviceReadings();
        this.applyFilters();
      })
    );
  }

  private combineDeviceData(): void {
    const enhancedDevices: EnhancedDevice[] = [];

    // Start with registered devices from DeviceService
    this.registeredDevices.forEach(registeredDevice => {
      // Find matching raw data - the registered device deviceId is contained in the raw data deviceId
      // e.g., registered: 'flujo-02' matches raw: 'flujo-02-c7'
      const deviceRawData = this.rawData.filter(rd => 
        rd.deviceId.includes(registeredDevice.deviceId || '')
      );
      
      // Find linked crop productions
      const linkedToCropProductions = this.cropProductionDevices.filter(cpd => 
        cpd.deviceId === registeredDevice.id && cpd.active
      );

      const sensorReadings = this.processDeviceReadings(deviceRawData);
      const lastReading = this.getLastReadingDate(deviceRawData);
      const hasRealTimeData = deviceRawData.length > 0;
      const connectionStatus = this.determineConnectionStatus(lastReading, hasRealTimeData);

      const enhancedDevice: EnhancedDevice = {
        ...registeredDevice,
        name: registeredDevice.name || registeredDevice.deviceId || `Device ${registeredDevice.id}`,
        isActive: registeredDevice.active || false,
        lastSeen: registeredDevice.dateUpdated ? new Date(registeredDevice.dateUpdated) : undefined,
        lastReading,
        sensorReadings,
        connectionStatus,
        deviceType: this.extractDeviceType(registeredDevice),
        hasRealTimeData,
        cropProductionIds: [...new Set(linkedToCropProductions.map(cp => cp.cropProductionId))] // Remove duplicates
      };

      enhancedDevices.push(enhancedDevice);
    });

    // Add IoT devices that aren't registered in the DeviceService (if iotDevices data is available)
    if (this.iotDevices && Array.isArray(this.iotDevices)) {
      this.iotDevices.forEach(iotDevice => {
        const existsInRegistered = this.registeredDevices.some(rd => 
          iotDevice.deviceId.includes(rd.deviceId || '')
        );

        if (!existsInRegistered) {
          const deviceRawData = this.rawData.filter(rd => rd.deviceId === iotDevice.deviceId);
          const sensorReadings = this.processDeviceReadings(deviceRawData);
          const lastReading = this.getLastReadingDate(deviceRawData);
          const hasRealTimeData = deviceRawData.length > 0;
          const connectionStatus = this.determineConnectionStatus(lastReading, iotDevice.active);

          const enhancedDevice: EnhancedDevice = {
            id: iotDevice.id,
            name: iotDevice.deviceId,
            description: 'Dispositivo IoT no registrado',
            deviceType: this.extractDeviceTypeFromId(iotDevice.deviceId),
            serialNumber: '',
            model: '',
            manufacturer: '',
            firmwareVersion: '',
            macAddress: '',
            ipAddress: '',
            batteryLevel: 0,
            signalStrength: 0,
            status: iotDevice.active ? 'Online' : 'Offline',
            isActive: iotDevice.active,
            lastSeen: iotDevice.dateUpdated ? new Date(iotDevice.dateUpdated) : undefined,
            lastReading,
            sensorReadings,
            connectionStatus,
            hasRealTimeData,
            cropProductionIds: [],
            active: false,
            dateUpdated: '',
            deviceId: '',
            createdAt: new Date()
          };

          enhancedDevices.push(enhancedDevice);
        }
      });
    }

    this.devices = enhancedDevices;
    console.log('Enhanced devices created:', this.devices);
  }

  private processDeviceReadings(rawData: DeviceRawDataItem[]): { [sensor: string]: DeviceReading } {
    const readings: { [sensor: string]: DeviceReading } = {};

    // Group by sensor and get latest reading
    const sensorGroups = rawData.reduce((acc, curr) => {
      if (!acc[curr.sensor]) {
        acc[curr.sensor] = [];
      }
      acc[curr.sensor].push(curr);
      return acc;
    }, {} as { [key: string]: DeviceRawDataItem[] });

    Object.keys(sensorGroups).forEach(sensorName => {
      const sensorData = sensorGroups[sensorName];
      const latest = sensorData.sort((a, b) =>
        new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
      )[0];

      if (latest) {
        const numericValue = this.extractNumericValue(latest.payload);
        readings[sensorName] = {
          value: numericValue,
          timestamp: latest.recordDate,
          rawValue: latest.payload,
          sensor: sensorName
        };
      }
    });

    return readings;
  }

  private extractNumericValue(payload: string): number | null {
    if (!payload) return null;

    // Handle special cases like in shiny-dashboard
    if (payload.toLowerCase() === 'false') return 0;
    if (payload.toLowerCase() === 'true') return 1;
    if (payload.toLowerCase() === 'low') return 0;
    if (payload.toLowerCase() === 'high') return 1;

    const numericString = payload.replace(/[^\d.-]/g, '');
    const numericValue = parseFloat(numericString);
    return isNaN(numericValue) ? null : numericValue;
  }

  private extractDeviceType(device: Device): string {
    // Use the actual deviceId from the registered device to determine type
    const deviceId = device.deviceId || device.name || '';
    if (deviceId.includes('flujo')) return 'flujo';
    if (deviceId.includes('ph-suelo')) return 'ph-suelo';
    if (deviceId.includes('estacion-metereologica')) return 'estacion-metereologica';
    if (deviceId.includes('presion')) return 'presion';
    if (deviceId.includes('suelo')) return 'suelo';
    return 'otro';
  }

  private extractDeviceTypeFromId(deviceId: string): string {
    if (deviceId.includes('flujo')) return 'flujo';
    if (deviceId.includes('ph-suelo')) return 'ph-suelo';
    if (deviceId.includes('estacion-metereologica')) return 'estacion-metereologica';
    if (deviceId.includes('presion')) return 'presion';
    if (deviceId.includes('suelo')) return 'suelo';
    return 'otro';
  }

  private getLastReadingDate(rawData: DeviceRawDataItem[]): Date | undefined {
    if (rawData.length === 0) return undefined;
    const latest = rawData.sort((a, b) =>
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    )[0];
    return new Date(latest.recordDate);
  }

  private determineConnectionStatus(lastReading?: Date, hasData?: boolean): 'online' | 'warning' | 'offline' | 'inactive' {
    if (!hasData) return 'inactive';
    if (!lastReading) return 'offline';

    const now = new Date();
    const diffMinutes = (now.getTime() - lastReading.getTime()) / (1000 * 60);

    if (diffMinutes > 30) return 'offline';
    if (diffMinutes > 5) return 'warning';
    return 'online';
  }

  private updateDeviceReadings(): void {
    this.devices.forEach(device => {
      // Match using the registered device ID contained in raw data deviceId
      const deviceRawData = this.rawData.filter(rd => 
        rd.deviceId.includes(device.deviceId || '') || 
        rd.deviceId.includes(device.name || '')
      );
      device.sensorReadings = this.processDeviceReadings(deviceRawData);
      device.lastReading = this.getLastReadingDate(deviceRawData);
      device.hasRealTimeData = deviceRawData.length > 0;
      device.connectionStatus = this.determineConnectionStatus(device.lastReading, device.hasRealTimeData);
    });
  }

  // UI Methods
  applyFilters(): void {
    let filtered = [...this.devices];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(device =>
        device.name?.toLowerCase().includes(term) ||
        device.description?.toLowerCase().includes(term) ||
        device.deviceType?.toLowerCase().includes(term) ||
        device.serialNumber?.toLowerCase().includes(term) ||
        device.deviceId?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(device => device.connectionStatus === this.statusFilter);
    }

    if (this.typeFilter) {
      filtered = filtered.filter(device => device.deviceType === this.typeFilter);
    }

    this.totalItems = filtered.length;
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredDevices = filtered.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Device operations
  showAddForm(): void {
    this.selectedDevice = null;
    this.isEditMode = false;
    this.deviceForm.reset();
    this.deviceForm.patchValue({
      status: 'Offline',
      isActive: true,
      batteryLevel: 100,
      signalStrength: -50
    });
    this.showForm = true;
  }

  editDevice(device: EnhancedDevice): void {
    this.selectedDevice = device;
    this.isEditMode = true;
    this.deviceForm.patchValue(device);
    this.showForm = true;
  }

  hideForm(): void {
    this.showForm = false;
    this.selectedDevice = null;
    this.deviceForm.reset();
  }

  submitForm(): void {
    if (this.deviceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.deviceForm.value;

    if (this.isEditMode && this.selectedDevice) {
      this.updateDevice(formData);
    } else {
      this.createDevice(formData);
    }
  }

  private createDevice(data: DeviceCreateRequest): void {
    this.deviceService.create(data).subscribe({
      next: (device) => {
        console.log('Device created:', device);
        this.hideForm();
        this.loadAllDeviceData();
      },
      error: (error) => {
        console.error('Error creating device:', error);
        this.error = 'Error al crear el dispositivo';
      }
    });
  }

  private updateDevice(data: DeviceUpdateRequest): void {
    if (!this.selectedDevice) return;

    const updateData = { ...data, id: this.selectedDevice.id };
    this.deviceService.update(updateData).subscribe({
      next: (device) => {
        console.log('Device updated:', device);
        this.hideForm();
        this.loadAllDeviceData();
      },
      error: (error) => {
        console.error('Error updating device:', error);
        this.error = 'Error al actualizar el dispositivo';
      }
    });
  }

  deleteDevice(device: EnhancedDevice): void {
    if (confirm(`¿Está seguro de que desea eliminar el dispositivo "${device.name}"?`)) {
      this.deviceService.delete(device.id).subscribe({
        next: () => {
          console.log('Device deleted:', device.id);
          this.loadAllDeviceData();
        },
        error: (error) => {
          console.error('Error deleting device:', error);
          this.error = 'Error al eliminar el dispositivo';
        }
      });
    }
  }

  toggleDeviceStatus(device: EnhancedDevice): void {
    this.deviceService.toggleStatus(device.id, !device.isActive).subscribe({
      next: (updatedDevice) => {
        console.log('Device status toggled:', updatedDevice);
        this.loadAllDeviceData();
      },
      error: (error) => {
        console.error('Error toggling device status:', error);
        this.error = 'Error al cambiar el estado del dispositivo';
      }
    });
  }

  refreshData(): void {
    this.loadAllDeviceData();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    }
  }

  // Utility methods
  private markFormGroupTouched(): void {
    Object.keys(this.deviceForm.controls).forEach(key => {
      const control = this.deviceForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.deviceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.deviceForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
      if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}`;
    }
    return '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'online': return 'status-online';
      case 'warning': return 'status-warning';
      case 'offline': return 'status-offline';
      case 'inactive': return 'status-inactive';
      default: return 'status-unknown';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'online': return 'En línea';
      case 'warning': return 'Advertencia';
      case 'offline': return 'Desconectado';
      case 'inactive': return 'Inactivo';
      default: return 'Desconocido';
    }
  }

  getDeviceTypeLabel(type: string): string {
    const deviceType = this.deviceTypes.find(dt => dt.value === type);
    return deviceType?.label || type;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getReadingAge(date: Date): string {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'menos de 1 minuto';
    if (diffMinutes < 60) return `${diffMinutes} minutos`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} días`;
  }

  getSensorReadingsArray(device: EnhancedDevice): DeviceReading[] {
    return Object.values(device.sensorReadings);
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(page => typeof page === 'number') as number[];
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}