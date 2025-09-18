// src/app/features/devices/services/device.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, of, throwError } from 'rxjs';
import { map, catchError, startWith, switchMap } from 'rxjs/operators';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Device } from '../../../core/models/models';

// Backend response structure (matches your AgriSmart API)
interface BackendResponse<T> {
  success: boolean;
  exception: any;
  result: T;
}

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
  name?: string | undefined;
  description?: string;
  deviceType?: string;
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
  constructor(
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all devices with optional filters - Backend: GET /Device (REQUIRES AUTH)
   */
  getAll(onlyActive?: boolean, filters?: DeviceFilters): Observable<any[]> {
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('DeviceService: No authentication token - returning empty array');
      return of([]);
    }

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

    const url = `${this.apiConfig.agronomicApiUrl}/Device`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<{devices: Device[]}>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getAll response:', response);
          if (response.success) {
            return response.result?.devices || [];
          }
          throw new Error(`Device API failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getAll error:', error);
          console.error('URL attempted:', url);
          // Return empty array for dashboard instead of failing
          return of([]);
        })
      );
  }

  /**
   * Get device by ID - Backend: GET /Device/{id} (if implemented)
   */
  getById(id: number): Observable<Device> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/${id}`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<Device>>(url, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getById response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get Device by ID failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getById error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Create new device - Backend: POST /Device
   */
  create(data: DeviceCreateRequest): Observable<Device> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = {
      ...data,
      status: data.status || 'Offline',
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    const url = `${this.apiConfig.agronomicApiUrl}/Device`;
    const headers = this.getAuthHeaders();

    return this.http.post<BackendResponse<Device>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.create response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Create Device failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.create error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update device - Backend: PUT /Device
   */
  update(id: number, data: DeviceUpdateRequest): Observable<Device> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { ...data, id };
    const url = `${this.apiConfig.agronomicApiUrl}/Device`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Device>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.update response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update Device failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.update error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Delete device - Backend: DELETE /Device/{id} (if implemented)
   */
  delete(id: number): Observable<void> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/${id}`;
    const headers = this.getAuthHeaders();

    return this.http.delete<BackendResponse<void>>(url, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.delete response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Delete Device failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.delete error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Toggle device status - Custom endpoint
   */
  toggleStatus(id: number, isActive: boolean): Observable<Device> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { id, isActive };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/status`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Device>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.toggleStatus response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Toggle Device status failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.toggleStatus error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update device connection status - Custom endpoint
   */
  updateConnectionStatus(id: number, status: string, lastSeen?: Date): Observable<Device> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { 
      id,
      status,
      ...(lastSeen && { lastSeen: lastSeen.toISOString() })
    };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/connection-status`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Device>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.updateConnectionStatus response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update connection status failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.updateConnectionStatus error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update device battery level - Custom endpoint
   */
  updateBatteryLevel(id: number, batteryLevel: number): Observable<Device> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { id, batteryLevel };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/battery`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Device>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.updateBatteryLevel response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update battery level failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.updateBatteryLevel error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Update device signal strength - Custom endpoint
   */
  updateSignalStrength(id: number, signalStrength: number): Observable<Device> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { id, signalStrength };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/signal`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Device>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.updateSignalStrength response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Update signal strength failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.updateSignalStrength error:', error);
          return this.handleError(error);
        })
      );
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
   * Get device statistics - Custom endpoint
   */
  getStatistics(): Observable<DeviceStatistics> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/statistics`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<DeviceStatistics>>(url, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getStatistics response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get Device statistics failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getStatistics error:', error);
          return this.handleError(error);
        })
      );
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
   * Get available device types - Custom endpoint
   */
  getAvailableTypes(): Observable<string[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/types`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<string[]>>(url, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getAvailableTypes response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get available types failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getAvailableTypes error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get device readings - Custom endpoint
   */
  getDeviceReadings(
    deviceId: number, 
    startDate?: Date, 
    endDate?: Date, 
    limit?: number
  ): Observable<DeviceReading[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

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

    const url = `${this.apiConfig.agronomicApiUrl}/Device/${deviceId}/readings`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<DeviceReading[]>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getDeviceReadings response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get device readings failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getDeviceReadings error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get latest readings for a device - Custom endpoint
   */
  getLatestReadings(deviceId: number, count: number = 10): Observable<DeviceReading[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const params = new HttpParams().set('latest', count.toString());
    const url = `${this.apiConfig.agronomicApiUrl}/Device/${deviceId}/readings`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<DeviceReading[]>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getLatestReadings response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get latest readings failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getLatestReadings error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get device alerts - Custom endpoint
   */
  getDeviceAlerts(deviceId: number, activeOnly: boolean = true): Observable<DeviceAlert[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('activeOnly', 'true');
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/${deviceId}/alerts`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<DeviceAlert[]>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getDeviceAlerts response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get device alerts failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getDeviceAlerts error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get all system alerts - Custom endpoint
   */
  getAllAlerts(activeOnly: boolean = true): Observable<DeviceAlert[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('activeOnly', 'true');
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/alerts`;
    const headers = this.getAuthHeaders();

    return this.http.get<BackendResponse<DeviceAlert[]>>(url, { params, headers })
      .pipe(
        map(response => {
          console.log('DeviceService.getAllAlerts response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Get all alerts failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.getAllAlerts error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Acknowledge alert - Custom endpoint
   */
  acknowledgeAlert(alertId: number): Observable<DeviceAlert> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/alerts/${alertId}/acknowledge`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<DeviceAlert>>(url, {}, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.acknowledgeAlert response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Acknowledge alert failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.acknowledgeAlert error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Resolve alert - Custom endpoint
   */
  resolveAlert(alertId: number, resolution?: string): Observable<DeviceAlert> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { ...(resolution && { resolution }) };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/alerts/${alertId}/resolve`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<DeviceAlert>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.resolveAlert response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Resolve alert failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.resolveAlert error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Send command to device - Custom endpoint
   */
  sendCommand(deviceId: number, command: string, parameters?: any): Observable<{
    success: boolean;
    message: string;
    commandId: string;
  }> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { command, ...(parameters && { parameters }) };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/${deviceId}/command`;
    const headers = this.getAuthHeaders();

    return this.http.post<BackendResponse<any>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.sendCommand response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Send command failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.sendCommand error:', error);
          return this.handleError(error);
        })
      );
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
   * Bulk operations - Custom endpoint
   */
  bulkUpdate(ids: number[], data: Partial<DeviceUpdateRequest>): Observable<Device[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { ids, updateData: data };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/bulk-update`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Device[]>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.bulkUpdate response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Bulk update devices failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.bulkUpdate error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Bulk status update - Custom endpoint
   */
  bulkStatusUpdate(ids: number[], isActive: boolean): Observable<Device[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const payload = { ids, isActive };
    const url = `${this.apiConfig.agronomicApiUrl}/Device/bulk-status`;
    const headers = this.getAuthHeaders();

    return this.http.put<BackendResponse<Device[]>>(url, payload, { headers })
      .pipe(
        map(response => {
          console.log('DeviceService.bulkStatusUpdate response:', response);
          if (response.success) {
            return response.result;
          }
          throw new Error(`Bulk status update failed: ${response.exception}`);
        }),
        catchError(error => {
          console.error('DeviceService.bulkStatusUpdate error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Export to Excel - Custom endpoint
   */
  exportToExcel(filters?: DeviceFilters): Observable<Blob> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiConfig.agronomicApiUrl}/Device/export/excel`;
    const headers = this.getAuthHeaders();
    
    return this.http.get(url, {
      params,
      responseType: 'blob',
      headers
    }).pipe(
      catchError(error => {
        console.error('DeviceService.exportToExcel error:', error);
        return this.handleError(error);
      })
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

    return [...devices]
    
    // .sort((a, b) => {
    //   const priorityA = statusPriority[a.status] || 5;
    //   const priorityB = statusPriority[b.status] || 5;
    //   const comparison = priorityA - priorityB;
    //   return ascending ? comparison : -comparison;
    // });
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
    
    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      errorMessage = `HTTP ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}