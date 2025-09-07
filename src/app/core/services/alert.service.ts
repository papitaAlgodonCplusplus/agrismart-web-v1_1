// src/app/core/services/alert.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
  duration?: number; // milliseconds
  actions?: AlertAction[];
  data?: any;
  timestamp: Date;
}

export interface AlertAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface AlertOptions {
  title?: string;
  autoClose?: boolean;
  keepAfterRouteChange?: boolean;
  duration?: number;
  actions?: AlertAction[];
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private defaultAutoClose = true;
  private defaultDuration = 5000; // 5 seconds

  constructor() {}

  /**
   * Observable for single alerts (for toast notifications)
   */
  onAlert(alertId?: string): Observable<Alert> {
    return this.alertSubject.asObservable().pipe(
      filter(x => x && x.id === alertId)
    );
  }

  /**
   * Observable for all alerts (for alert lists)
   */
  getAlerts(): Observable<Alert[]> {
    return this.alertsSubject.asObservable();
  }

  /**
   * Show success alert
   */
  showSuccess(message: string, options?: AlertOptions): string {
    return this.alert('success', message, options);
  }

  /**
   * Show error alert
   */
  showError(message: string, options?: AlertOptions): string {
    return this.alert('error', message, {
      ...options,
      autoClose: options?.autoClose ?? false, // Errors don't auto-close by default
      duration: options?.duration ?? 10000 // Longer duration for errors
    });
  }

  /**
   * Show warning alert
   */
  showWarning(message: string, options?: AlertOptions): string {
    return this.alert('warning', message, options);
  }

  /**
   * Show info alert
   */
  showInfo(message: string, options?: AlertOptions): string {
    return this.alert('info', message, options);
  }

  /**
   * Show loading alert
   */
  showLoading(message: string = 'Cargando...', options?: AlertOptions): string {
    return this.alert('info', message, {
      ...options,
      autoClose: false // Loading alerts should not auto-close
    });
  }

  /**
   * Show confirmation alert with actions
   */
  showConfirmation(
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    options?: AlertOptions
  ): string {
    const actions: AlertAction[] = [
      {
        label: 'Confirmar',
        action: () => {
          onConfirm();
          this.clearAlert(alertId);
        },
        style: 'primary'
      },
      {
        label: 'Cancelar',
        action: () => {
          if (onCancel) onCancel();
          this.clearAlert(alertId);
        },
        style: 'secondary'
      }
    ];

    const alertId = this.alert('warning', message, {
      ...options,
      autoClose: false,
      actions
    });

    return alertId;
  }

  /**
   * Show delete confirmation
   */
  showDeleteConfirmation(
    itemName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    return this.showConfirmation(
      `¿Está seguro de que desea eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      onConfirm,
      onCancel,
      {
        title: 'Confirmar Eliminación'
      }
    );
  }

  /**
   * Show form validation errors
   */
  showValidationErrors(errors: { [key: string]: string }): string {
    const errorList = Object.entries(errors)
      .map(([field, error]) => `• ${field}: ${error}`)
      .join('\n');

    return this.showError(`Errores de validación:\n${errorList}`, {
      title: 'Formulario Inválido'
    });
  }

  /**
   * Show API error
   */
  showApiError(error: any, customMessage?: string): string {
    let message = customMessage || 'Ha ocurrido un error inesperado';
    
    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Add status code if available
    if (error?.status) {
      message = `${message} (Código: ${error.status})`;
    }

    return this.showError(message, {
      title: 'Error del Servidor'
    });
  }

  /**
   * Show network error
   */
  showNetworkError(): string {
    return this.showError(
      'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      {
        title: 'Error de Conexión'
      }
    );
  }

  /**
   * Clear specific alert
   */
  clearAlert(id?: string): void {
    if (id) {
      const alerts = this.alertsSubject.value.filter(alert => alert.id !== id);
      this.alertsSubject.next(alerts);
    }
  }

  /**
   * Clear all alerts
   */
  clearAllAlerts(): void {
    this.alertsSubject.next([]);
  }

  /**
   * Clear alerts of specific type
   */
  clearAlertsOfType(type: Alert['type']): void {
    const alerts = this.alertsSubject.value.filter(alert => alert.type !== type);
    this.alertsSubject.next(alerts);
  }

  /**
   * Update existing alert
   */
  updateAlert(id: string, updates: Partial<Alert>): void {
    const alerts = this.alertsSubject.value.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    );
    this.alertsSubject.next(alerts);
  }

  /**
   * Get specific alert by ID
   */
  getAlert(id: string): Alert | undefined {
    return this.alertsSubject.value.find(alert => alert.id === id);
  }

  /**
   * Check if alert exists
   */
  hasAlert(id: string): boolean {
    return this.alertsSubject.value.some(alert => alert.id === id);
  }

  /**
   * Get alerts count
   */
  getAlertsCount(): number {
    return this.alertsSubject.value.length;
  }

  /**
   * Get alerts count by type
   */
  getAlertsCountByType(type: Alert['type']): number {
    return this.alertsSubject.value.filter(alert => alert.type === type).length;
  }

  /**
   * Private method to create and manage alerts
   */
  private alert(
    type: Alert['type'], 
    message: string, 
    options?: AlertOptions
  ): string {
    const id = this.generateId();
    const autoClose = options?.autoClose ?? this.defaultAutoClose;
    const duration = options?.duration ?? this.defaultDuration;

    const alert: Alert = {
      id,
      type,
      title: options?.title,
      message,
      autoClose,
      keepAfterRouteChange: options?.keepAfterRouteChange ?? false,
      duration,
      actions: options?.actions,
      data: options?.data,
      timestamp: new Date()
    };

    // Add to alerts array
    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, alert]);

    // Emit single alert for toast notifications
    this.alertSubject.next(alert);

    // Auto-close if enabled
    if (autoClose && duration > 0) {
      setTimeout(() => {
        this.clearAlert(id);
      }, duration);
    }

    return id;
  }

  /**
   * Generate unique ID for alerts
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Utility methods for common scenarios
   */

  /**
   * Show save success message
   */
  showSaveSuccess(itemName?: string): string {
    const message = itemName 
      ? `${itemName} guardado exitosamente`
      : 'Guardado exitosamente';
    return this.showSuccess(message);
  }

  /**
   * Show delete success message
   */
  showDeleteSuccess(itemName?: string): string {
    const message = itemName 
      ? `${itemName} eliminado exitosamente`
      : 'Eliminado exitosamente';
    return this.showSuccess(message);
  }

  /**
   * Show update success message
   */
  showUpdateSuccess(itemName?: string): string {
    const message = itemName 
      ? `${itemName} actualizado exitosamente`
      : 'Actualizado exitosamente';
    return this.showSuccess(message);
  }

  /**
   * Show operation in progress
   */
  showOperationInProgress(operation: string): string {
    return this.showLoading(`${operation} en progreso...`);
  }

  /**
   * Show unauthorized error
   */
  showUnauthorizedError(): string {
    return this.showError(
      'No tiene permisos para realizar esta acción',
      {
        title: 'Acceso Denegado'
      }
    );
  }

  /**
   * Show session expired error
   */
  showSessionExpiredError(): string {
    return this.showError(
      'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
      {
        title: 'Sesión Expirada',
        duration: 0 // Don't auto-close
      }
    );
  }

  /**
   * Show file upload success
   */
  showFileUploadSuccess(fileName?: string): string {
    const message = fileName 
      ? `Archivo "${fileName}" cargado exitosamente`
      : 'Archivo cargado exitosamente';
    return this.showSuccess(message);
  }

  /**
   * Show file upload error
   */
  showFileUploadError(fileName?: string, reason?: string): string {
    let message = fileName 
      ? `Error al cargar el archivo "${fileName}"`
      : 'Error al cargar el archivo';
    
    if (reason) {
      message += `: ${reason}`;
    }
    
    return this.showError(message);
  }

  /**
   * Show export success
   */
  showExportSuccess(format?: string): string {
    const message = format 
      ? `Datos exportados exitosamente en formato ${format.toUpperCase()}`
      : 'Datos exportados exitosamente';
    return this.showSuccess(message);
  }

  /**
   * Show import success
   */
  showImportSuccess(count?: number): string {
    const message = count 
      ? `${count} registros importados exitosamente`
      : 'Datos importados exitosamente';
    return this.showSuccess(message);
  }

  /**
   * Show connection restored
   */
  showConnectionRestored(): string {
    return this.showSuccess('Conexión restaurada');
  }

  /**
   * Show data synchronization success
   */
  showSyncSuccess(): string {
    return this.showSuccess('Datos sincronizados exitosamente');
  }

  /**
   * Show irrigation success (specific to irrigation module)
   */
  showIrrigationStarted(sectorName?: string, duration?: number): string {
    let message = 'Irrigación iniciada exitosamente';
    if (sectorName) {
      message = `Irrigación iniciada en ${sectorName}`;
    }
    if (duration) {
      message += ` por ${duration} minutos`;
    }
    return this.showSuccess(message);
  }

  /**
   * Show irrigation stopped
   */
  showIrrigationStopped(sectorName?: string): string {
    const message = sectorName 
      ? `Irrigación detenida en ${sectorName}`
      : 'Irrigación detenida exitosamente';
    return this.showInfo(message);
  }

  /**
   * Show sensor calibration success
   */
  showSensorCalibrationSuccess(sensorType?: string): string {
    const message = sensorType 
      ? `Sensor ${sensorType} calibrado exitosamente`
      : 'Sensor calibrado exitosamente';
    return this.showSuccess(message);
  }

  /**
   * Show maintenance reminder
   */
  showMaintenanceReminder(equipment: string, daysOverdue?: number): string {
    let message = `Mantenimiento requerido para ${equipment}`;
    if (daysOverdue && daysOverdue > 0) {
      message += ` (${daysOverdue} días de retraso)`;
    }
    return this.showWarning(message, {
      title: 'Recordatorio de Mantenimiento',
      autoClose: false
    });
  }

  /**
   * Show system alert
   */
  showSystemAlert(alertType: string, equipment: string, severity: 'low' | 'medium' | 'high' | 'critical'): string {
    const severityMap = {
      low: 'Baja',
      medium: 'Media', 
      high: 'Alta',
      critical: 'Crítica'
    };

    const message = `Alerta de ${alertType} en ${equipment}`;
    const type = severity === 'critical' || severity === 'high' ? 'error' : 'warning';
    
    return this.alert(type, message, {
      title: `Alerta del Sistema - Severidad ${severityMap[severity]}`,
      autoClose: severity === 'low',
      duration: severity === 'critical' ? 0 : undefined
    });
  }
}