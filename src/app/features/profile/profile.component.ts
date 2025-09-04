// src/app/features/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../users/services/user.service';
import { User } from '../../core/models/models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h2>Mi Perfil</h2>
          <p class="text-muted">Gestiona tu información personal y configuración de cuenta</p>
          <hr>
        </div>
      </div>

      <div class="row" *ngIf="currentUser">
        <!-- Profile Picture and Basic Info -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-body text-center">
              <div class="mb-3">
                <img 
                  [src]="currentUser?.profilePicture || '/assets/images/default-avatar.png'" 
                  alt="{{ currentUser?.name }}"
                  class="rounded-circle mb-3"
                  style="width: 120px; height: 120px; object-fit: cover; border: 4px solid #e9ecef;">
                <div>
                  <input 
                    type="file" 
                    class="d-none" 
                    #fileInput 
                    accept="image/*"
                    (change)="onProfilePictureChange($event)">
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm"
                    (click)="fileInput.click()">
                    <i class="bi bi-camera me-1"></i>Cambiar Foto
                  </button>
                </div>
              </div>
              
              <h4>{{ currentUser.name }}</h4>
              <p class="text-muted">{{ currentUser.email }}</p>
              
              <div class="d-flex justify-content-center gap-2 mb-3">
                <span class="badge" [ngClass]="getProfileClass(currentUser.profile?.name)">
                  <i class="bi" [ngClass]="getProfileIcon(currentUser.profile?.name)"></i>
                  {{ currentUser.profile?.name || 'Sin perfil' }}
                </span>
                <span class="badge" [ngClass]="currentUser.isActive ? 'bg-success' : 'bg-danger'">
                  {{ currentUser.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <!-- Quick Stats -->
              <div class="row text-center">
                <div class="col-4">
                  <h6 class="text-primary">{{ getUserFarmsCount() }}</h6>
                  <small class="text-muted">Fincas</small>
                </div>
                <div class="col-4">
                  <h6 class="text-success">{{ getLastLoginDays() }}</h6>
                  <small class="text-muted">Días desde último acceso</small>
                </div>
                <div class="col-4">
                  <h6 class="text-info">{{ getAccountAge() }}</h6>
                  <small class="text-muted">Días de cuenta</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Assigned Farms -->
          <div class="card mt-4">
            <div class="card-header">
              <h6><i class="bi bi-geo-alt me-2"></i>Fincas Asignadas</h6>
            </div>
            <div class="card-body">
              <div *ngIf="currentUser.userFarms && currentUser.userFarms.length > 0">
                <div class="list-group list-group-flush">
                  <div class="list-group-item d-flex justify-content-between align-items-center px-0"
                       *ngFor="let userFarm of currentUser.userFarms">
                    <div>
                      <strong>{{ userFarm.farm?.name }}</strong>
                      <div class="text-muted small">{{ userFarm.farm?.description }}</div>
                    </div>
                    <span class="badge bg-info">{{ userFarm.role || 'Usuario' }}</span>
                  </div>
                </div>
              </div>
              <div *ngIf="!currentUser.userFarms || currentUser.userFarms.length === 0">
                <p class="text-muted text-center">No tienes fincas asignadas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link active" 
                    data-bs-toggle="tab" 
                    data-bs-target="#personal-info"
                    type="button" 
                    role="tab">
                    <i class="bi bi-person me-2"></i>Información Personal
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    data-bs-toggle="tab" 
                    data-bs-target="#security"
                    type="button" 
                    role="tab">
                    <i class="bi bi-shield-lock me-2"></i>Seguridad
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    data-bs-toggle="tab" 
                    data-bs-target="#preferences"
                    type="button" 
                    role="tab">
                    <i class="bi bi-gear me-2"></i>Preferencias
                  </button>
                </li>
              </ul>
            </div>
            
            <div class="card-body">
              <div class="tab-content">
                <!-- Personal Information Tab -->
                <div class="tab-pane fade show active" id="personal-info" role="tabpanel">
                  <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="firstName" class="form-label">Nombre *</label>
                          <input 
                            type="text" 
                            id="firstName"
                            class="form-control"
                            formControlName="firstName"
                            [class.is-invalid]="isFieldInvalid('firstName')">
                          <div class="invalid-feedback" *ngIf="isFieldInvalid('firstName')">
                            El nombre es requerido
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="lastName" class="form-label">Apellido *</label>
                          <input 
                            type="text" 
                            id="lastName"
                            class="form-control"
                            formControlName="lastName"
                            [class.is-invalid]="isFieldInvalid('lastName')">
                          <div class="invalid-feedback" *ngIf="isFieldInvalid('lastName')">
                            El apellido es requerido
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="email" class="form-label">Email *</label>
                          <input 
                            type="email" 
                            id="email"
                            class="form-control"
                            formControlName="email"
                            [class.is-invalid]="isFieldInvalid('email')">
                          <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                            <span *ngIf="profileForm.get('email')?.errors?.['required']">El email es requerido</span>
                            <span *ngIf="profileForm.get('email')?.errors?.['email']">Formato de email inválido</span>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="phoneNumber" class="form-label">Teléfono</label>
                          <input 
                            type="tel" 
                            id="phoneNumber"
                            class="form-control"
                            formControlName="phoneNumber"
                            placeholder="+57 300 000 0000">
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="position" class="form-label">Cargo</label>
                          <input 
                            type="text" 
                            id="position"
                            class="form-control"
                            formControlName="position"
                            placeholder="Ej: Supervisor de Campo">
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="department" class="form-label">Departamento</label>
                          <input 
                            type="text" 
                            id="department"
                            class="form-control"
                            formControlName="department"
                            placeholder="Ej: Operaciones Agrícolas">
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <div class="mb-3">
                          <label for="bio" class="form-label">Biografía</label>
                          <textarea 
                            id="bio"
                            class="form-control"
                            rows="3"
                            formControlName="bio"
                            placeholder="Cuéntanos un poco sobre ti...">
                          </textarea>
                        </div>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end">
                      <button 
                        type="submit" 
                        class="btn btn-primary"
                        [disabled]="profileForm.invalid || isUpdatingProfile">
                        <span *ngIf="isUpdatingProfile" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isUpdatingProfile ? 'Actualizando...' : 'Actualizar Perfil' }}
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Security Tab -->
                <div class="tab-pane fade" id="security" role="tabpanel">
                  <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
                    <div class="mb-4">
                      <h6>Cambiar Contraseña</h6>
                      <p class="text-muted">Mantén tu cuenta segura con una contraseña fuerte</p>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <div class="mb-3">
                          <label for="currentPassword" class="form-label">Contraseña Actual *</label>
                          <input 
                            type="password" 
                            id="currentPassword"
                            class="form-control"
                            formControlName="currentPassword"
                            [class.is-invalid]="isPasswordFieldInvalid('currentPassword')">
                          <div class="invalid-feedback" *ngIf="isPasswordFieldInvalid('currentPassword')">
                            La contraseña actual es requerida
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="newPassword" class="form-label">Nueva Contraseña *</label>
                          <input 
                            type="password" 
                            id="newPassword"
                            class="form-control"
                            formControlName="newPassword"
                            [class.is-invalid]="isPasswordFieldInvalid('newPassword')">
                          <div class="invalid-feedback" *ngIf="isPasswordFieldInvalid('newPassword')">
                            <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Confirma la nueva contraseña</span>
                            <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Las contraseñas no coinciden</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="alert alert-info">
                      <i class="bi bi-info-circle me-2"></i>
                      <strong>Consejos para una contraseña segura:</strong>
                      <ul class="mb-0 mt-2">
                        <li>Al menos 8 caracteres</li>
                        <li>Combina letras mayúsculas y minúsculas</li>
                        <li>Incluye números y símbolos</li>
                        <li>Evita información personal</li>
                      </ul>
                    </div>

                    <div class="d-flex justify-content-end">
                      <button 
                        type="submit" 
                        class="btn btn-warning"
                        [disabled]="passwordForm.invalid || isUpdatingPassword">
                        <span *ngIf="isUpdatingPassword" class="spinner-border spinner-border-sm me-2"></span>
                        <i class="bi bi-shield-lock me-1"></i>
                        {{ isUpdatingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                      </button>
                    </div>
                  </form>

                  <hr>

                  <!-- Two-Factor Authentication -->
                  <div class="mb-4">
                    <h6>Autenticación de Dos Factores</h6>
                    <p class="text-muted">Añade una capa extra de seguridad a tu cuenta</p>
                    
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Estado: </strong>
                        <span class="badge" [ngClass]="currentUser.twoFactorEnabled ? 'bg-success' : 'bg-secondary'">
                          {{ currentUser.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado' }}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        class="btn btn-sm"
                        [class.btn-danger]="currentUser.twoFactorEnabled"
                        [class.btn-success]="!currentUser.twoFactorEnabled"
                        (click)="toggleTwoFactor()">
                        <i class="bi" [ngClass]="currentUser.twoFactorEnabled ? 'bi-shield-x' : 'bi-shield-check'"></i>
                        {{ currentUser.twoFactorEnabled ? 'Deshabilitar' : 'Habilitar' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Preferences Tab -->
                <div class="tab-pane fade" id="preferences" role="tabpanel">
                  <form [formGroup]="preferencesForm" (ngSubmit)="onUpdatePreferences()">
                    <div class="mb-4">
                      <h6>Configuración de Interfaz</h6>
                      <p class="text-muted">Personaliza tu experiencia en AgriSmart</p>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="language" class="form-label">Idioma</label>
                          <select 
                            id="language"
                            class="form-select"
                            formControlName="language">
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="timezone" class="form-label">Zona Horaria</label>
                          <select 
                            id="timezone"
                            class="form-select"
                            formControlName="timezone">
                            <option value="America/Bogota">Bogotá (UTC-5)</option>
                            <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                            <option value="America/New_York">New York (UTC-5)</option>
                            <option value="Europe/Madrid">Madrid (UTC+1)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="dateFormat" class="form-label">Formato de Fecha</label>
                          <select 
                            id="dateFormat"
                            class="form-select"
                            formControlName="dateFormat">
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="theme" class="form-label">Tema</label>
                          <select 
                            id="theme"
                            class="form-select"
                            formControlName="theme">
                            <option value="light">Claro</option>
                            <option value="dark">Oscuro</option>
                            <option value="auto">Automático</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="mb-4">
                      <h6>Notificaciones</h6>
                      <p class="text-muted">Controla cómo y cuándo recibes notificaciones</p>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <div class="mb-3">
                          <div class="form-check form-switch">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              id="emailNotifications"
                              formControlName="emailNotifications">
                            <label class="form-check-label" for="emailNotifications">
                              Notificaciones por Email
                            </label>
                          </div>
                        </div>
                        <div class="mb-3">
                          <div class="form-check form-switch">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              id="pushNotifications"
                              formControlName="pushNotifications">
                            <label class="form-check-label" for="pushNotifications">
                              Notificaciones Push
                            </label>
                          </div>
                        </div>
                        <div class="mb-3">
                          <div class="form-check form-switch">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              id="alertsEnabled"
                              formControlName="alertsEnabled">
                            <label class="form-check-label" for="alertsEnabled">
                              Alertas de Sistema
                            </label>
                          </div>
                        </div>
                        <div class="mb-3">
                          <div class="form-check form-switch">
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              id="weeklyReports"
                              formControlName="weeklyReports">
                            <label class="form-check-label" for="weeklyReports">
                              Reportes Semanales
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="d-flex justify-content-end">
                      <button 
                        type="submit" 
                        class="btn btn-info"
                        [disabled]="isUpdatingPreferences">
                        <span *ngIf="isUpdatingPreferences" class="spinner-border spinner-border-sm me-2"></span>
                        <i class="bi bi-gear me-1"></i>
                        {{ isUpdatingPreferences ? 'Guardando...' : 'Guardar Preferencias' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div class="row" *ngIf="successMessage">
        <div class="col-12">
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = ''"></button>
          </div>
        </div>
      </div>

      <div class="row" *ngIf="errorMessage">
        <div class="col-12">
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-tabs .nav-link {
      color: #6c757d;
    }
    .nav-tabs .nav-link.active {
      color: #495057;
      background-color: #fff;
      border-color: #dee2e6 #dee2e6 #fff;
    }
    .form-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid rgba(0, 0, 0, 0.125);
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  preferencesForm: FormGroup;
  
  isUpdatingProfile = false;
  isUpdatingPassword = false;
  isUpdatingPreferences = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      position: [''],
      department: [''],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.preferencesForm = this.fb.group({
      language: ['es'],
      timezone: ['America/Bogota'],
      dateFormat: ['DD/MM/YYYY'],
      theme: ['light'],
      emailNotifications: [true],
      pushNotifications: [true],
      alertsEnabled: [true],
      weeklyReports: [false]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.populateForm();
      }
    });
  }

  private populateForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        phoneNumber: this.currentUser.phoneNumber,
        position: this.currentUser.position,
        department: this.currentUser.department,
        bio: this.currentUser.bio
      });

      // Load user preferences if available
      if (this.currentUser.preferences) {
        this.preferencesForm.patchValue(this.currentUser.preferences);
      }
    }
  }

  onProfilePictureChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor selecciona un archivo de imagen válido';
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMessage = 'La imagen no puede ser mayor a 5MB';
        return;
      }

      // Create FormData and upload
      const formData = new FormData();
      formData.append('profilePicture', file);

      // this.userService.updateProfilePicture(formData).subscribe({
      //   next: (response) => {
      //     this.successMessage = 'Foto de perfil actualizada correctamente';
      //     if (this.currentUser) {
      //       this.currentUser.profilePicture = response.profilePictureUrl;
      //     }
      //   },
      //   error: (error) => {
      //     this.errorMessage = 'Error al actualizar la foto de perfil';
      //     console.error('Profile picture update error:', error);
      //   }
      // });
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isUpdatingProfile = true;
      this.errorMessage = '';

      const profileData = this.profileForm.value;

      this.userService.updateProfile(this.currentUser.id, profileData).subscribe({
        next: (updatedUser) => {
          this.isUpdatingProfile = false;
          this.successMessage = 'Perfil actualizado correctamente';
          this.currentUser = { ...this.currentUser, ...updatedUser };
        },
        error: (error) => {
          this.isUpdatingProfile = false;
          this.errorMessage = error.error?.message || 'Error al actualizar el perfil';
          console.error('Profile update error:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid && this.currentUser) {
      this.isUpdatingPassword = true;
      this.errorMessage = '';

      const passwordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
        confirmPassword: this.passwordForm.value.confirmPassword
      };

      this.userService.changePassword(this.currentUser.id, passwordData).subscribe({
        next: () => {
          this.isUpdatingPassword = false;
          this.successMessage = 'Contraseña actualizada correctamente';
          this.passwordForm.reset();
        },
        error: (error) => {
          this.isUpdatingPassword = false;
          this.errorMessage = error.error?.message || 'Error al cambiar la contraseña';
          console.error('Password change error:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  onUpdatePreferences(): void {
    if (this.preferencesForm.valid && this.currentUser) {
      this.isUpdatingPreferences = true;
      this.errorMessage = '';

      const preferencesData = this.preferencesForm.value;

      this.userService.updatePreferences(this.currentUser.id, preferencesData).subscribe({
        next: (preferences) => {
          this.isUpdatingPreferences = false;
          this.successMessage = 'Preferencias guardadas correctamente';
          if (this.currentUser) {
            this.currentUser.preferences = preferences;
          }
        },
        error: (error) => {
          this.isUpdatingPreferences = false;
          this.errorMessage = error.error?.message || 'Error al guardar las preferencias';
          console.error('Preferences update error:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.preferencesForm);
    }
  }

  toggleTwoFactor(): void {
    if (this.currentUser) {
      const newStatus = !this.currentUser.twoFactorEnabled;
      
      this.userService.toggleTwoFactor(this.currentUser.id, newStatus).subscribe({
        next: () => {
          if (this.currentUser) {
            this.currentUser.twoFactorEnabled = newStatus;
          }
          this.successMessage = `Autenticación de dos factores ${newStatus ? 'habilitada' : 'deshabilitada'} correctamente`;
        },
        error: (error) => {
          this.errorMessage = 'Error al cambiar la configuración de dos factores';
          console.error('Two factor toggle error:', error);
        }
      });
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  isFieldInvalid(field: string): boolean {
    const formField = this.profileForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  isPasswordFieldInvalid(field: string): boolean {
    const formField = this.passwordForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getProfileClass(profileName: string): string {
    const profileClasses: { [key: string]: string } = {
      'Administrador': 'bg-danger',
      'Supervisor': 'bg-warning',
      'Operador': 'bg-primary',
      'Tecnico': 'bg-info',
      'Solo Lectura': 'bg-secondary'
    };
    return profileClasses[profileName] || 'bg-light text-dark';
  }

  getProfileIcon(profileName: string): string {
    const profileIcons: { [key: string]: string } = {
      'Administrador': 'bi-shield-fill-exclamation',
      'Supervisor': 'bi-eye-fill',
      'Operador': 'bi-gear-fill',
      'Tecnico': 'bi-tools',
      'Solo Lectura': 'bi-book'
    };
    return profileIcons[profileName] || 'bi-person';
  }

  getUserFarmsCount(): number {
    return this.currentUser?.userFarms?.length || 0;
  }

  getLastLoginDays(): number {
    if (!this.currentUser?.lastLoginDate) return -1;
    
    const today = new Date();
    const loginDate = new Date(this.currentUser.lastLoginDate);
    const diffTime = today.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getAccountAge(): number {
    if (!this.currentUser?.createdAt) return -1;
    
    const today = new Date();
    const createdDate = new Date(this.currentUser.createdAt);
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}