// src/app/features/devices/device-form/device-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceService } from '../services/device.service';
import { Device } from '../../../core/models/models';

@Component({
  selector: 'app-device-form',
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h2>{{ isEditMode ? 'Editar' : 'Nuevo' }} Dispositivo</h2>
          <hr>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <form [formGroup]="deviceForm" (ngSubmit)="onSubmit()">
            <div class="card">
              <div class="card-header">
                <h5>Información del Dispositivo</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="name" class="form-label">Nombre *</label>
                      <input 
                        type="text" 
                        id="name"
                        class="form-control"
                        formControlName="name"
                        [class.is-invalid]="isFieldInvalid('name')"
                        placeholder="Nombre del dispositivo">
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                        El nombre es requerido
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="deviceType" class="form-label">Tipo de Dispositivo *</label>
                      <select 
                        id="deviceType"
                        class="form-select"
                        formControlName="deviceType"
                        [class.is-invalid]="isFieldInvalid('deviceType')">
                        <option value="">Seleccione un tipo</option>
                        <option value="Sensor">Sensor</option>
                        <option value="Actuador">Actuador</option>
                        <option value="Controlador">Controlador</option>
                        <option value="Gateway">Gateway</option>
                        <option value="Camara">Cámara</option>
                        <option value="Estacion Meteorologica">Estación Meteorológica</option>
                      </select>
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('deviceType')">
                        El tipo de dispositivo es requerido
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="serialNumber" class="form-label">Número de Serie</label>
                      <input 
                        type="text" 
                        id="serialNumber"
                        class="form-control"
                        formControlName="serialNumber"
                        placeholder="Número de serie del dispositivo">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="model" class="form-label">Modelo</label>
                      <input 
                        type="text" 
                        id="model"
                        class="form-control"
                        formControlName="model"
                        placeholder="Modelo del dispositivo">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="manufacturer" class="form-label">Fabricante</label>
                      <input 
                        type="text" 
                        id="manufacturer"
                        class="form-control"
                        formControlName="manufacturer"
                        placeholder="Fabricante del dispositivo">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="firmwareVersion" class="form-label">Versión de Firmware</label>
                      <input 
                        type="text" 
                        id="firmwareVersion"
                        class="form-control"
                        formControlName="firmwareVersion"
                        placeholder="v1.0.0">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-12">
                    <div class="mb-3">
                      <label for="description" class="form-label">Descripción</label>
                      <textarea 
                        id="description"
                        class="form-control"
                        rows="3"
                        formControlName="description"
                        placeholder="Descripción del dispositivo (opcional)">
                      </textarea>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="macAddress" class="form-label">Dirección MAC</label>
                      <input 
                        type="text" 
                        id="macAddress"
                        class="form-control"
                        formControlName="macAddress"
                        placeholder="00:00:00:00:00:00"
                        pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="ipAddress" class="form-label">Dirección IP</label>
                      <input 
                        type="text" 
                        id="ipAddress"
                        class="form-control"
                        formControlName="ipAddress"
                        placeholder="192.168.1.100">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="batteryLevel" class="form-label">Nivel de Batería (%)</label>
                      <input 
                        type="number" 
                        id="batteryLevel"
                        class="form-control"
                        formControlName="batteryLevel"
                        min="0"
                        max="100"
                        placeholder="100">
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="signalStrength" class="form-label">Intensidad de Señal (dBm)</label>
                      <input 
                        type="number" 
                        id="signalStrength"
                        class="form-control"
                        formControlName="signalStrength"
                        placeholder="-50">
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="status" class="form-label">Estado</label>
                      <select 
                        id="status"
                        class="form-select"
                        formControlName="status">
                        <option value="Online">En Línea</option>
                        <option value="Offline">Fuera de Línea</option>
                        <option value="Maintenance">Mantenimiento</option>
                        <option value="Error">Error</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3 form-check">
                      <input 
                        type="checkbox" 
                        class="form-check-input" 
                        id="isActive"
                        formControlName="isActive">
                      <label class="form-check-label" for="isActive">
                        Activo
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="d-flex justify-content-between">
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    (click)="onCancel()">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="deviceForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Info Panel -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6>Estado del Dispositivo</h6>
            </div>
            <div class="card-body" *ngIf="device">
              <div class="row text-center">
                <div class="col-6">
                  <div class="badge bg-success" *ngIf="device.status === 'Online'">
                    <i class="bi bi-wifi me-1"></i>En Línea
                  </div>
                  <div class="badge bg-danger" *ngIf="device.status === 'Offline'">
                    <i class="bi bi-wifi-off me-1"></i>Fuera de Línea
                  </div>
                  <div class="badge bg-warning" *ngIf="device.status === 'Maintenance'">
                    <i class="bi bi-tools me-1"></i>Mantenimiento
                  </div>
                  <div class="badge bg-danger" *ngIf="device.status === 'Error'">
                    <i class="bi bi-exclamation-triangle me-1"></i>Error
                  </div>
                </div>
                <div class="col-6" *ngIf="device.batteryLevel">
                  <div class="progress" style="height: 20px;">
                    <div 
                      class="progress-bar"
                      [class.bg-success]="device.batteryLevel > 50"
                      [class.bg-warning]="device.batteryLevel <= 50 && device.batteryLevel > 20"
                      [class.bg-danger]="device.batteryLevel <= 20"
                      [style.width.%]="device.batteryLevel">
                      {{ device.batteryLevel }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-header">
              <h6>Información</h6>
            </div>
            <div class="card-body">
              <p class="text-muted">
                <i class="bi bi-info-circle me-2"></i>
                Configure los parámetros del dispositivo IoT. Los campos marcados con (*) son obligatorios.
              </p>
              <hr>
              <div class="row text-center" *ngIf="isEditMode && device">
                <div class="col-6">
                  <small class="text-muted">Registrado</small>
                  <div>{{ device.createdAt | date:'short' }}</div>
                </div>
                <div class="col-6" *ngIf="device.lastSeen">
                  <small class="text-muted">Última Conexión</small>
                  <div>{{ device.lastSeen | date:'short' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="row" *ngIf="errorMessage">
        <div class="col-12">
          <div class="alert alert-danger mt-3" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeviceFormComponent implements OnInit {
  deviceForm: FormGroup;
  device: Device | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  deviceId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.deviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      deviceType: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      serialNumber: ['', [Validators.maxLength(50)]],
      model: ['', [Validators.maxLength(100)]],
      manufacturer: ['', [Validators.maxLength(100)]],
      firmwareVersion: ['', [Validators.maxLength(20)]],
      macAddress: [''],
      ipAddress: [''],
      batteryLevel: [null, [Validators.min(0), Validators.max(100)]],
      signalStrength: [null],
      status: ['Online'],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.deviceId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadDevice(this.deviceId);
    }
  }

  private loadDevice(id: number): void {
    this.isLoading = true;
    this.deviceService.getById(id).subscribe({
      next: (device) => {
        this.device = device;
        this.deviceForm.patchValue(device);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el dispositivo';
        this.isLoading = false;
        console.error('Error loading device:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.deviceForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const deviceData = this.deviceForm.value;

      const operation = this.isEditMode
        ? this.deviceService.update(this.deviceId!, deviceData)
        : this.deviceService.create(deviceData);

      operation.subscribe({
        next: (device) => {
          this.isLoading = false;
          this.router.navigate(['/devices']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al guardar el dispositivo';
          console.error('Error saving device:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/devices']);
  }

  isFieldInvalid(field: string): boolean {
    const formField = this.deviceForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.deviceForm.controls).forEach(key => {
      const control = this.deviceForm.get(key);
      control?.markAsTouched();
    });
  }
}