// src/app/features/devices/device-list/device-list.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, tap, of, finalize, forkJoin } from 'rxjs';

// Services
import { DeviceService, DeviceFilters, DeviceCreateRequest, DeviceUpdateRequest, DeviceStatistics } from '../services/device.service';
import { Device } from '../../../core/models/models';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss']
})
export class DeviceListComponent implements OnInit {
  devices: Device[] = [];
  filteredDevices: Device[] = [];
  selectedDevice: Device | null = null;
  deviceForm!: FormGroup;

  // UI State
  isLoading = false;
  isFormVisible = false;
  isEditMode = false;
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  // Filters
  filters: DeviceFilters = {
    onlyActive: true,
    searchTerm: '',
    deviceType: '',
    status: '',
    batteryLevelMin: undefined,
    batteryLevelMax: undefined,
    signalStrengthMin: undefined,
    signalStrengthMax: undefined,
    lastSeenWithin: undefined
  };

  // Error handling
  errorMessage = '';
  successMessage = '';

  // Statistics
  statistics: DeviceStatistics | null = null;

  // Device types
  deviceTypes = [
    { value: 'Sensor', label: 'Sensor' },
    { value: 'Actuador', label: 'Actuador' },
    { value: 'Controlador', label: 'Controlador' },
    { value: 'Gateway', label: 'Gateway' },
    { value: 'Cámara', label: 'Cámara' },
    { value: 'Estación Meteorológica', label: 'Estación Meteorológica' },
    { value: 'Medidor de Flujo', label: 'Medidor de Flujo' },
    { value: 'Monitor de pH', label: 'Monitor de pH' },
    { value: 'Otro', label: 'Otro' }
  ];

  // Device statuses
  deviceStatuses = [
    { value: 'Online', label: 'En línea', color: 'success' },
    { value: 'Offline', label: 'Desconectado', color: 'danger' },
    { value: 'Maintenance', label: 'Mantenimiento', color: 'warning' },
    { value: 'Error', label: 'Error', color: 'danger' }
  ];

  // Manufacturers
  manufacturers = [
    { value: 'AgriSmart', label: 'AgriSmart' },
    { value: 'Bosch', label: 'Bosch' },
    { value: 'Siemens', label: 'Siemens' },
    { value: 'Arduino', label: 'Arduino' },
    { value: 'Raspberry Pi', label: 'Raspberry Pi' },
    { value: 'LoRaWAN', label: 'LoRaWAN' },
    { value: 'Zigbee', label: 'Zigbee' },
    { value: 'Otro', label: 'Otro' }
  ];

  constructor(
    private deviceService: DeviceService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  initializeForm(): void {
    this.deviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      deviceType: ['', [Validators.required]],
      serialNumber: [''],
      model: [''],
      manufacturer: [''],
      firmwareVersion: [''],
      macAddress: ['', [Validators.pattern(/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i)]],
      ipAddress: ['', [Validators.pattern(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]],
      batteryLevel: ['', [Validators.min(0), Validators.max(100)]],
      signalStrength: ['', [Validators.min(-120), Validators.max(0)]],
      status: ['Offline', [Validators.required]],
      isActive: [true]
    });
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load devices and statistics in parallel
    forkJoin({
      devices: this.deviceService.getAll(undefined, this.filters).pipe(
        catchError(error => {
          console.error('Error loading devices:', error);
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
      next: (data) => {
        this.devices = data.devices;
        this.statistics = data.statistics;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos iniciales';
        console.error('Error in loadInitialData:', error);
      }
    });
  }

  loadDevices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deviceService.getAll(undefined, this.filters)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al cargar los dispositivos';
          console.error('Error loading devices:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(devices => {
        this.devices = devices;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    let filtered = [...this.devices];

    // Search term filter
    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(device =>
        device.name.toLowerCase().includes(searchTerm) ||
        (device.serialNumber && device.serialNumber.toLowerCase().includes(searchTerm)) ||
        (device.model && device.model.toLowerCase().includes(searchTerm)) ||
        (device.manufacturer && device.manufacturer.toLowerCase().includes(searchTerm)) ||
        (device.deviceType && device.deviceType.toLowerCase().includes(searchTerm))
      );
    }

    // Device type filter
    if (this.filters.deviceType) {
      filtered = filtered.filter(device => device.deviceType === this.filters.deviceType);
    }

    // Status filter
    if (this.filters.status) {
      filtered = filtered.filter(device => device.status === this.filters.status);
    }

    // Battery level range filter
    if (this.filters.batteryLevelMin !== undefined) {
      filtered = filtered.filter(device => (device.batteryLevel || 0) >= this.filters.batteryLevelMin!);
    }
    if (this.filters.batteryLevelMax !== undefined) {
      filtered = filtered.filter(device => (device.batteryLevel || 0) <= this.filters.batteryLevelMax!);
    }

    // Signal strength range filter
    if (this.filters.signalStrengthMin !== undefined) {
      filtered = filtered.filter(device => (device.signalStrength || -120) >= this.filters.signalStrengthMin!);
    }
    if (this.filters.signalStrengthMax !== undefined) {
      filtered = filtered.filter(device => (device.signalStrength || -120) <= this.filters.signalStrengthMax!);
    }

    // Last seen filter (within hours)
    if (this.filters.lastSeenWithin !== undefined) {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - this.filters.lastSeenWithin);
      filtered = filtered.filter(device => 
        device.lastSeen && new Date(device.lastSeen) >= cutoffTime
      );
    }

    // Active status filter
    if (this.filters.onlyActive !== undefined) {
      filtered = filtered.filter(device => device.isActive === this.filters.onlyActive);
    }

    this.filteredDevices = filtered;
    this.totalRecords = filtered.length;
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      onlyActive: true,
      searchTerm: '',
      deviceType: '',
      status: '',
      batteryLevelMin: undefined,
      batteryLevelMax: undefined,
      signalStrengthMin: undefined,
      signalStrengthMax: undefined,
      lastSeenWithin: undefined
    };
    this.applyFilters();
  }

  // CRUD Operations
  showCreateForm(): void {
    this.selectedDevice = null;
    this.isEditMode = false;
    this.isFormVisible = true;
    this.deviceForm.reset({
      status: 'Offline',
      isActive: true
    });
  }

  showEditForm(device: Device): void {
    this.selectedDevice = device;
    this.isEditMode = true;
    this.isFormVisible = true;
    
    this.deviceForm.patchValue({
      name: device.name,
      description: device.description || '',
      deviceType: device.deviceType || '',
      serialNumber: device.serialNumber || '',
      model: device.model || '',
      manufacturer: device.manufacturer || '',
      firmwareVersion: device.firmwareVersion || '',
      macAddress: device.macAddress || '',
      ipAddress: device.ipAddress || '',
      batteryLevel: device.batteryLevel || '',
      signalStrength: device.signalStrength || '',
      status: device.status || 'Offline',
      isActive: device.isActive
    });
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.selectedDevice = null;
    this.isEditMode = false;
    this.deviceForm.reset();
    this.clearMessages();
  }

  submitForm(): void {
    if (this.deviceForm.valid) {
      const formValue = this.deviceForm.value;
      const deviceData: DeviceCreateRequest | DeviceUpdateRequest = {
        name: formValue.name,
        description: formValue.description,
        deviceType: formValue.deviceType,
        serialNumber: formValue.serialNumber,
        model: formValue.model,
        manufacturer: formValue.manufacturer,
        firmwareVersion: formValue.firmwareVersion,
        macAddress: formValue.macAddress,
        ipAddress: formValue.ipAddress,
        batteryLevel: formValue.batteryLevel ? parseInt(formValue.batteryLevel) : undefined,
        signalStrength: formValue.signalStrength ? parseInt(formValue.signalStrength) : undefined,
        status: formValue.status,
        isActive: formValue.isActive
      };

      if (this.isEditMode && this.selectedDevice) {
        this.updateDevice({ ...deviceData, id: this.selectedDevice.id });
      } else {
        this.createDevice(deviceData as DeviceCreateRequest);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  createDevice(deviceData: DeviceCreateRequest): void {
    this.isLoading = true;
    this.clearMessages();

    this.deviceService.create(deviceData)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al crear el dispositivo';
          console.error('Error creating device:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(device => {
        if (device) {
          this.successMessage = 'Dispositivo creado exitosamente';
          this.hideForm();
          this.loadDevices();
        }
      });
  }

  updateDevice(deviceData: any): void {
    this.isLoading = true;
    this.clearMessages();

    this.deviceService.update(deviceData)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al actualizar el dispositivo';
          console.error('Error updating device:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(device => {
        if (device) {
          this.successMessage = 'Dispositivo actualizado exitosamente';
          this.hideForm();
          this.loadDevices();
        }
      });
  }

  deleteDevice(device: Device): void {
    if (confirm(`¿Está seguro que desea eliminar el dispositivo "${device.name}"?`)) {
      this.isLoading = true;
      this.clearMessages();

      this.deviceService.delete(device.id)
        .pipe(
          catchError(error => {
            this.errorMessage = 'Error al eliminar el dispositivo';
            console.error('Error deleting device:', error);
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.successMessage = 'Dispositivo eliminado exitosamente';
            this.loadDevices();
          }
        });
    }
  }

  toggleDeviceStatus(device: Device): void {
    this.isLoading = true;
    this.clearMessages();

    this.deviceService.toggleStatus(device.id, !device.isActive)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al cambiar el estado del dispositivo';
          console.error('Error toggling device status:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(updatedDevice => {
        if (updatedDevice) {
          this.successMessage = `Dispositivo ${updatedDevice.isActive ? 'activado' : 'desactivado'} exitosamente`;
          this.loadDevices();
        }
      });
  }

  // View methods
  viewDetails(device: Device): void {
    this.router.navigate(['/devices', device.id]);
  }

  editDevice(device: Device): void {
    this.router.navigate(['/devices', device.id, 'edit']);
  }

  // Utility methods
  private markFormGroupTouched(): void {
    Object.keys(this.deviceForm.controls).forEach(key => {
      const control = this.deviceForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.deviceForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.deviceForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} debe ser menor a ${field.errors['max'].max}`;
      if (field.errors['pattern']) {
        if (fieldName === 'macAddress') return 'Formato de dirección MAC inválido (ej: 00:11:22:33:44:55)';
        if (fieldName === 'ipAddress') return 'Formato de dirección IP inválido';
      }
    }
    return '';
  }

  getDeviceTypeLabel(deviceType: string): string {
    const type = this.deviceTypes.find(t => t.value === deviceType);
    return type?.label || deviceType;
  }

  getStatusLabel(status: string): string {
    const deviceStatus = this.deviceStatuses.find(s => s.value === status);
    return deviceStatus?.label || status;
  }

  getStatusColor(status: string): string {
    const deviceStatus = this.deviceStatuses.find(s => s.value === status);
    return deviceStatus?.color || 'secondary';
  }

  getManufacturerLabel(manufacturer: string): string {
    const mfg = this.manufacturers.find(m => m.value === manufacturer);
    return mfg?.label || manufacturer;
  }

  getBatteryLevelColor(batteryLevel?: number): string {
    if (!batteryLevel) return 'secondary';
    if (batteryLevel > 60) return 'success';
    if (batteryLevel > 30) return 'warning';
    return 'danger';
  }

  getSignalStrengthColor(signalStrength?: number): string {
    if (!signalStrength) return 'secondary';
    if (signalStrength > -50) return 'success';
    if (signalStrength > -80) return 'warning';
    return 'danger';
  }

  getSignalStrengthBars(signalStrength?: number): number {
    if (!signalStrength) return 0;
    if (signalStrength > -50) return 4;
    if (signalStrength > -60) return 3;
    if (signalStrength > -80) return 2;
    if (signalStrength > -100) return 1;
    return 0;
  }

  formatLastSeen(lastSeen?: Date): string {
    if (!lastSeen) return 'Nunca';
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes > 0) return `Hace ${diffMinutes} min`;
    return 'Ahora mismo';
  }

  // Pagination
  getPaginatedData(): Device[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredDevices.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // Statistics
  getTotalCount(): number {
    return this.statistics?.totalDevices || this.filteredDevices.length;
  }

  getActiveCount(): number {
    return this.statistics?.activeDevices || this.filteredDevices.filter(device => device.isActive).length;
  }

  getInactiveCount(): number {
    return this.getTotalCount() - this.getActiveCount();
  }

  getOnlineCount(): number {
    return this.statistics?.onlineDevices || this.filteredDevices.filter(device => device.status === 'Online').length;
  }

  getOfflineCount(): number {
    return this.statistics?.offlineDevices || this.filteredDevices.filter(device => device.status === 'Offline').length;
  }

  getLowBatteryCount(): number {
    return this.statistics?.lowBatteryDevices || this.filteredDevices.filter(device => (device.batteryLevel || 0) < 20).length;
  }

  getAverageBatteryLevel(): number {
    return this.statistics?.averageBatteryLevel || 0;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}