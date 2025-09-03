// src/app/features/devices/services/device.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Device } from '../../../core/models/models';

export interface DeviceFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  deviceType?: string;
  status?: string;
  batteryLevelMin?: number;
  batteryLevelMax?: number;
  signalStrengthMin?: number;
  signalStrengthMax?: number;
  lastSeenWithin?: number; // hours
  farmId?: number;
  productionUnitId?: number;
}

export interface DeviceCreateRequest {
  name: string;
  description?: string;
  deviceType: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  firmwareVersion?: string;
  macAddress?: string;
  ipAddress?: string;
  batteryLevel?: number;
  signalStrength?: number;
  status?: string;
  isActive?: boolean;
}

export interface DeviceUpdateRequest extends Partial<DeviceCreateRequest> {}

export interface DeviceStatistics {
  totalDevices: number;
  activeDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  errorDevices: number;
  byType: {
    [deviceType: string]: {
      count: number;
      online: number;
      offline: number;
      averageBatteryLevel: number;
    };
  };
  byStatus: {
    [status: string]: number;
  };
  averageBatteryLevel: number;
  lowBatteryDevices: number; // < 20%
  averageSignalStrength: number;
  poorSignalDevices: number; // < -80 dBm
  recentlySeenDevices: number; // within last hour
  oldestDevice: {
    name: string;
    lastSeen: Date;
  };
}

export interface DeviceReading {
  id: number;
  deviceId: number;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'good' | 'fair' | 'poor' | 'invalid';
}

export interface DeviceAlert {
  id: number;
  deviceId: number;
  alertType: 'battery_low' | 'offline' | 'signal_weak' | 'sensor_error' | 'maintenance_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  isActive: boolean;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly baseUrl = '/api/devices';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all devices with optional filters
   */
  getAll(onlyActive?: boolean, filters?: DeviceFilters): Observable<Device[]> {
    let params = new HttpParams();

    // Handle legacy boolean parameter for backward compatibility
    if (onlyActive !== undefined) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    // Handle new filters object
    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.deviceType) {
        params = params.set('deviceType', filters.deviceType);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.batteryLevelMin !== undefined) {
        params = params.set('batteryLevelMin', filters.batteryLevelMin.toString());
      }
      if (filters.batteryLevelMax !== undefined) {
        params = params.set('batteryLevelMax', filters.batteryLevelMax.toString());
      }
      if (filters.signalStrengthMin !== undefined) {
        params = params.set('signalStrengthMin', filters.signalStrengthMin.toString());
      }
      if (filters.signalStrengthMax !== undefined) {
        params = params.set('signalStrengthMax', filters.signalStrengthMax.toString());
      }
      if (filters.lastSeenWithin !== undefined) {
        params = params.set('lastSeenWithin', filters.lastSeenWithin.toString());
      }
      if (filters.farmId) {
        params = params.set('farmId', filters.farmId.toString());
      }
      if (filters.productionUnitId) {
        params = params.set('productionUnitId', filters.productionUnitId.toString());
      }
    }

    return this.apiService.get<Device[]>(this.baseUrl, params);
  }

  /**
   * Get device by ID
   */
  getById(id: number): Observable<Device> {
    return this.apiService.get<Device>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new device
   */
  create(data: DeviceCreateRequest): Observable<Device> {
    const payload = {
      ...data,
      status: data.status || 'Offline',
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<Device>(this.baseUrl, payload);
  }

  /**
   * Update device
   */
  update(id: number, data: DeviceUpdateRequest): Observable<Device> {
    return this.apiService.put<Device>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete device
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle device status
   */
  toggleStatus(id: number, isActive: boolean): Observable<Device> {
    const payload = { isActive };
    return this.apiService.put<Device>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Update device connection status
   */
  updateConnectionStatus(id: number, status: string, lastSeen?: Date): Observable<Device> {
    const payload = { 
      status,
      ...(lastSeen && { lastSeen: lastSeen.toISOString() })
    };
    return this.apiService.put<Device>(`${this.baseUrl}/${id}/connection-status`, payload);
  }

  /**
   * Update device battery level
   */
  updateBatteryLevel(id: number, batteryLevel: number): Observable<Device> {
    const payload = { batteryLevel };
    return this.apiService.put<Device>(`${this.baseUrl}/${id}/battery`, payload);
  }

  /**
   * Update device signal strength
   */
  updateSignalStrength(id: number, signalStrength: number): Observable<Device> {
    const payload = { signalStrength };
    return this.apiService.put<Device>(`${this.baseUrl}/${id}/signal`, payload);
  }

  /**
   * Get active devices only
   */
  getActive(): Observable<Device[]> {
    return this.getAll(true);
  }

  /**
   * Get online devices
   */
  getOnline(): Observable<Device[]> {
    const filters: DeviceFilters = { status: 'Online' };
    return this.getAll(undefined, filters);
  }

  /**
   * Get offline devices
   */
  getOffline(): Observable<Device[]> {
    const filters: DeviceFilters = { status: 'Offline' };
    return this.getAll(undefined, filters);
  }

  /**
   * Get devices by type
   */
  getByType(deviceType: string): Observable<Device[]> {
    const filters: DeviceFilters = { deviceType };
    return this.getAll(undefined, filters);
  }

  /**
   * Get devices with low battery
   */
  getLowBattery(threshold: number = 20): Observable<Device[]> {
    const filters: DeviceFilters = { 
      batteryLevelMin: 0, 
      batteryLevelMax: threshold 
    };
    return this.getAll(undefined, filters);
  }

  /**
   * Get devices with poor signal
   */
  getPoorSignal(threshold: number = -80): Observable<Device[]> {
    const filters: DeviceFilters = { 
      signalStrengthMin: -120, 
      signalStrengthMax: threshold 
    };
    return this.getAll(undefined, filters);
  }

  /**
   * Get devices not seen recently
   */
  getNotSeenRecently(hours: number = 24): Observable<Device[]> {
    const filters: DeviceFilters = { lastSeenWithin: hours };
    return this.getAll(undefined, filters);
  }

  /**
   * Search devices by name, serial number, or model
   */
  search(searchTerm: string): Observable<Device[]> {
    const filters: DeviceFilters = { searchTerm };
    return this.getAll(undefined, filters);
  }

  /**
   * Get device statistics
   */
  getStatistics(): Observable<DeviceStatistics> {
    return this.apiService.get<DeviceStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * Get real-time device statistics (refreshed every 30 seconds)
   */
  getRealTimeStatistics(): Observable<DeviceStatistics> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getStatistics())
    );
  }

  /**
   * Get available device types
   */
  getAvailableTypes(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.baseUrl}/types`);
  }

  /**
   * Get device readings
   */
  getDeviceReadings(
    deviceId: number, 
    startDate?: Date, 
    endDate?: Date, 
    limit?: number
  ): Observable<DeviceReading[]> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.apiService.get<DeviceReading[]>(`${this.baseUrl}/${deviceId}/readings`, params);
  }

  /**
   * Get latest readings for a device
   */
  getLatestReadings(deviceId: number, count: number = 10): Observable<DeviceReading[]> {
    const params = new HttpParams().set('latest', count.toString());
    return this.apiService.get<DeviceReading[]>(`${this.baseUrl}/${deviceId}/readings`, params);
  }

  /**
   * Get device alerts
   */
  getDeviceAlerts(deviceId: number, activeOnly: boolean = true): Observable<DeviceAlert[]> {
    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('activeOnly', 'true');
    }

    return this.apiService.get<DeviceAlert[]>(`${this.baseUrl}/${deviceId}/alerts`, params);
  }

  /**
   * Get all system alerts
   */
  getAllAlerts(activeOnly: boolean = true): Observable<DeviceAlert[]> {
    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('activeOnly', 'true');
    }

    return this.apiService.get<DeviceAlert[]>(`${this.baseUrl}/alerts`, params);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: number): Observable<DeviceAlert> {
    return this.apiService.put<DeviceAlert>(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {});
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: number, resolution?: string): Observable<DeviceAlert> {
    const payload = { ...(resolution && { resolution }) };
    return this.apiService.put<DeviceAlert>(`${this.baseUrl}/alerts/${alertId}/resolve`, payload);
  }

  /**
   * Send command to device
   */
  sendCommand(deviceId: number, command: string, parameters?: any): Observable<{
    success: boolean;
    message: string;
    commandId: string;
  }> {
    const payload = { command, ...(parameters && { parameters }) };
    return this.apiService.post(`${this.baseUrl}/${deviceId}/command`, payload);
  }

  /**
   * Restart device
   */
  restartDevice(deviceId: number): Observable<any> {
    return this.sendCommand(deviceId, 'restart');
  }

  /**
   * Update device firmware
   */
  updateFirmware(deviceId: number, firmwareVersion: string): Observable<any> {
    return this.sendCommand(deviceId, 'update_firmware', { version: firmwareVersion });
  }

  /**
   * Calibrate device sensors
   */
  calibrateSensors(deviceId: number): Observable<any> {
    return this.sendCommand(deviceId, 'calibrate_sensors');
  }

  /**
   * Bulk operations
   */
  bulkUpdate(ids: number[], data: Partial<DeviceUpdateRequest>): Observable<Device[]> {
    const payload = { ids, updateData: data };
    return this.apiService.put<Device[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  /**
   * Bulk status update
   */
  bulkStatusUpdate(ids: number[], isActive: boolean): Observable<Device[]> {
    const payload = { ids, isActive };
    return this.apiService.put<Device[]>(`${this.baseUrl}/bulk-status`, payload);
  }

  /**
   * Export to Excel
   */
  exportToExcel(filters?: DeviceFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/export/excel`;
    
    return this.http.get(url, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Utility methods
   */
  formatDeviceType(deviceType: string): string {
    const typeMap: { [key: string]: string } = {
      'Sensor': 'Sensor',
      'Actuador': 'Actuador',
      'Controlador': 'Controlador',
      'Gateway': 'Gateway',
      'Camara': 'Cámara',
      'Estacion Meteorologica': 'Estación Meteorológica'
    };
    return typeMap[deviceType] || deviceType;
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Online': 'En Línea',
      'Offline': 'Fuera de Línea',
      'Maintenance': 'Mantenimiento',
      'Error': 'Error'
    };
    return statusMap[status] || status;
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Online': 'bi-wifi',
      'Offline': 'bi-wifi-off',
      'Maintenance': 'bi-tools',
      'Error': 'bi-exclamation-triangle'
    };
    return iconMap[status] || 'bi-question-circle';
  }

  getBatteryIcon(batteryLevel: number): string {
    if (batteryLevel >= 75) return 'bi-battery-full';
    if (batteryLevel >= 50) return 'bi-battery-three-quarters';
    if (batteryLevel >= 25) return 'bi-battery-half';
    if (batteryLevel >= 10) return 'bi-battery-low';
    return 'bi-battery';
  }

  getBatteryClass(batteryLevel: number): string {
    if (batteryLevel >= 50) return 'text-success';
    if (batteryLevel >= 25) return 'text-warning';
    return 'text-danger';
  }

  getSignalIcon(signalStrength: number): string {
    if (signalStrength >= -50) return 'bi-reception-4';
    if (signalStrength >= -60) return 'bi-reception-3';
    if (signalStrength >= -70) return 'bi-reception-2';
    if (signalStrength >= -80) return 'bi-reception-1';
    return 'bi-reception-0';
  }

  getSignalClass(signalStrength: number): string {
    if (signalStrength >= -60) return 'text-success';
    if (signalStrength >= -80) return 'text-warning';
    return 'text-danger';
  }

  isOnline(device: Device): boolean {
    return device.status === 'Online';
  }

  isLowBattery(device: Device, threshold: number = 20): boolean {
    return device.batteryLevel !== undefined && device.batteryLevel <= threshold;
  }

  isPoorSignal(device: Device, threshold: number = -80): boolean {
    return device.signalStrength !== undefined && device.signalStrength <= threshold;
  }

  getTimeSinceLastSeen(lastSeen: Date | string): string {
    if (!lastSeen) return 'Nunca';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours >= 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours >= 1) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes >= 1) {
      return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'Hace un momento';
    }
  }

  validateMacAddress(macAddress: string): boolean {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(macAddress);
  }

  validateIpAddress(ipAddress: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ipAddress);
  }

  /**
   * Data transformation methods
   */
  sortByName(devices: Device[], ascending: boolean = true): Device[] {
    return [...devices].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return ascending ? comparison : -comparison;
    });
  }

  sortByStatus(devices: Device[], ascending: boolean = true): Device[] {
    const statusPriority: { [key: string]: number } = {
      'Online': 1,
      'Offline': 2,
      'Maintenance': 3,
      'Error': 4
    };

    return [...devices].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 5;
      const priorityB = statusPriority[b.status] || 5;
      const comparison = priorityA - priorityB;
      return ascending ? comparison : -comparison;
    });
  }

  sortByLastSeen(devices: Device[], ascending: boolean = false): Device[] {
    return [...devices].sort((a, b) => {
      if (!a.lastSeen && !b.lastSeen) return 0;
      if (!a.lastSeen) return 1;
      if (!b.lastSeen) return -1;

      const dateA = new Date(a.lastSeen).getTime();
      const dateB = new Date(b.lastSeen).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  sortByBatteryLevel(devices: Device[], ascending: boolean = true): Device[] {
    return [...devices].sort((a, b) => {
      const batteryA = a.batteryLevel || 0;
      const batteryB = b.batteryLevel || 0;
      return ascending ? batteryA - batteryB : batteryB - batteryA;
    });
  }

  groupByType(devices: Device[]): { [deviceType: string]: Device[] } {
    return devices.reduce((groups, device) => {
      const deviceType = device.deviceType || 'Sin tipo';
      if (!groups[deviceType]) {
        groups[deviceType] = [];
      }
      groups[deviceType].push(device);
      return groups;
    }, {} as { [deviceType: string]: Device[] });
  }

  groupByStatus(devices: Device[]): { [status: string]: Device[] } {
    return devices.reduce((groups, device) => {
      const status = device.status || 'Desconocido';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(device);
      return groups;
    }, {} as { [status: string]: Device[] });
  }

  groupByManufacturer(devices: Device[]): { [manufacturer: string]: Device[] } {
    return devices.reduce((groups, device) => {
      const manufacturer = device.manufacturer || 'Sin especificar';
      if (!groups[manufacturer]) {
        groups[manufacturer] = [];
      }
      groups[manufacturer].push(device);
      return groups;
    }, {} as { [manufacturer: string]: Device[] });
  }

  filterByActiveStatus(devices: Device[], activeOnly: boolean = true): Device[] {
    return devices.filter(device => activeOnly ? device.isActive : !device.isActive);
  }

  filterByOnlineStatus(devices: Device[], onlineOnly: boolean = true): Device[] {
    return devices.filter(device => onlineOnly ? this.isOnline(device) : !this.isOnline(device));
  }

  filterByBatteryLevel(devices: Device[], minLevel: number, maxLevel: number = 100): Device[] {
    return devices.filter(device => {
      const batteryLevel = device.batteryLevel || 0;
      return batteryLevel >= minLevel && batteryLevel <= maxLevel;
    });
  }

  filterBySignalStrength(devices: Device[], minSignal: number, maxSignal: number = 0): Device[] {
    return devices.filter(device => {
      const signalStrength = device.signalStrength || -120;
      return signalStrength >= minSignal && signalStrength <= maxSignal;
    });
  }

  filterByLastSeenWithin(devices: Device[], hours: number): Device[] {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    return devices.filter(device => {
      if (!device.lastSeen) return false;
      const lastSeenDate = new Date(device.lastSeen);
      return lastSeenDate >= cutoffTime;
    });
  }

  /**
   * Alert severity helpers
   */
  getAlertSeverityClass(severity: string): string {
    const severityClasses: { [key: string]: string } = {
      'low': 'bg-info',
      'medium': 'bg-warning',
      'high': 'bg-danger',
      'critical': 'bg-dark'
    };
    return severityClasses[severity] || 'bg-secondary';
  }

  getAlertTypeIcon(alertType: string): string {
    const typeIcons: { [key: string]: string } = {
      'battery_low': 'bi-battery',
      'offline': 'bi-wifi-off',
      'signal_weak': 'bi-reception-0',
      'sensor_error': 'bi-exclamation-triangle',
      'maintenance_due': 'bi-tools'
    };
    return typeIcons[alertType] || 'bi-bell';
  }

  formatAlertMessage(alert: DeviceAlert): string {
    const messageMap: { [key: string]: string } = {
      'battery_low': `Batería baja (${alert.message})`,
      'offline': 'Dispositivo sin conexión',
      'signal_weak': `Señal débil (${alert.message})`,
      'sensor_error': `Error en sensor: ${alert.message}`,
      'maintenance_due': 'Mantenimiento programado'
    };
    return messageMap[alert.alertType] || alert.message;
  }

  /**
   * Device health assessment
   */
  calculateDeviceHealthScore(device: Device): number {
    let score = 100;

    // Status penalties
    if (device.status === 'Offline') score -= 30;
    if (device.status === 'Error') score -= 50;
    if (device.status === 'Maintenance') score -= 20;

    // Battery level penalties
    if (device.batteryLevel !== undefined) {
      if (device.batteryLevel < 10) score -= 25;
      else if (device.batteryLevel < 25) score -= 15;
      else if (device.batteryLevel < 50) score -= 5;
    }

    // Signal strength penalties
    if (device.signalStrength !== undefined) {
      if (device.signalStrength < -100) score -= 20;
      else if (device.signalStrength < -80) score -= 10;
      else if (device.signalStrength < -60) score -= 5;
    }

    // Last seen penalties
    if (device.lastSeen) {
      const hoursSinceLastSeen = (Date.now() - new Date(device.lastSeen).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSeen > 24) score -= 20;
      else if (hoursSinceLastSeen > 6) score -= 10;
      else if (hoursSinceLastSeen > 1) score -= 5;
    } else {
      score -= 30; // Never seen
    }

    return Math.max(0, Math.min(100, score));
  }

  getDeviceHealthCategory(score: number): string {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    if (score >= 20) return 'Malo';
    return 'Crítico';
  }

  getDeviceHealthColor(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    if (score >= 20) return 'danger';
    return 'dark';
  }

  /**
   * Private helper methods
   */
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Device Service Error:', error);
    throw error;
  }
}