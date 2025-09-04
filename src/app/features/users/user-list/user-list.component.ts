// src/app/features/users/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../../../core/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Gestión de Usuarios</h2>
          <p class="text-muted">Administración de usuarios del sistema AgriSmart</p>
          <hr>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="row align-items-end">
            <div class="col-md-2">
              <label class="form-label">Solo Activos</label>
              <div class="form-check">
                <input 
                  type="checkbox" 
                  id="onlyActives"
                  class="form-check-input" 
                  [(ngModel)]="onlyActive"
                  (change)="loadUsers()">
                <label class="form-check-label" for="onlyActives">
                  Mostrar solo activos
                </label>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Perfil</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedProfile"
                (change)="loadUsers()">
                <option value="">Todos los perfiles</option>
                <option value="Administrador">Administrador</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Operador">Operador</option>
                <option value="Tecnico">Técnico</option>
                <option value="Solo Lectura">Solo Lectura</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Filtro por Finca</label>
              <select 
                class="form-select"
                [(ngModel)]="selectedFarmId"
                (change)="loadUsers()">
                <option value="">Todas las fincas</option>
                <option *ngFor="let farm of farms" [value]="farm.id">
                  {{ farm.name }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary" (click)="loadUsers()">
                <i class="bi bi-search me-1"></i>Consultar
              </button>
            </div>
            <div class="col-md-2">
              <button class="btn btn-success" (click)="createNew()">
                <i class="bi bi-person-plus me-1"></i>Nuevo
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Buscar usuarios..."
              [(ngModel)]="searchTerm"
              (keyup.enter)="loadUsers()">
            <button class="btn btn-outline-secondary" (click)="loadUsers()">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="row" *ngIf="isLoading">
        <div class="col-12 text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando usuarios...</p>
        </div>
      </div>

      <!-- Users Table -->
      <div class="row" *ngIf="!isLoading && (users$ | async) as users">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-people me-2"></i>
                Usuarios del Sistema ({{ users.length }})
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Información Personal</th>
                      <th>Perfil</th>
                      <th>Fincas Asignadas</th>
                      <th>Último Acceso</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of users; trackBy: trackByFn">
                      <td>
                        <span class="badge bg-secondary">{{ user.id }}</span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar me-3">
                            <img 
                              [src]="user.profilePicture || '/assets/images/default-avatar.png'" 
                              alt="{{ user.name }}"
                              class="rounded-circle"
                              style="width: 40px; height: 40px; object-fit: cover;">
                          </div>
                          <div>
                            <strong>{{ user.name }}</strong>
                            <div class="text-muted small">{{ user.email }}</div>
                            <div class="text-muted small" *ngIf="user.username !== user.email">
                              @{{ user.username }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                          <div class="text-muted small" *ngIf="user.phoneNumber">
                            <i class="bi bi-telephone me-1"></i>{{ user.phoneNumber }}
                          </div>
                          <div class="text-muted small" *ngIf="user.position">
                            <i class="bi bi-briefcase me-1"></i>{{ user.position }}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="getProfileClass(user.profile?.name)">
                          <i class="bi" [ngClass]="getProfileIcon(user.profile?.name)"></i>
                          {{ user.profile?.name || 'Sin perfil' }}
                        </span>
                        <div class="text-muted small" *ngIf="user.profile?.description">
                          {{ user.profile?.description }}
                        </div>
                      </td>
                      <td>
                        <div *ngIf="user.userFarms && user.userFarms.length > 0">
                          <span class="badge bg-info me-1" 
                                *ngFor="let userFarm of user.userFarms | slice:0:2">
                            {{ userFarm.farm?.name }}
                          </span>
                          <span class="badge bg-secondary" 
                                *ngIf="user.userFarms.length > 2">
                            +{{ user.userFarms.length - 2 }} más
                          </span>
                        </div>
                        <span class="text-muted" *ngIf="!user.userFarms || user.userFarms.length === 0">
                          Sin fincas asignadas
                        </span>
                      </td>
                      <td>
                        <div *ngIf="user.lastLoginDate">
                          <strong>{{ user.lastLoginDate | date:'shortDate' }}</strong>
                          <div class="text-muted small">{{ user.lastLoginDate | date:'shortTime' }}</div>
                          <div class="text-muted small" *ngIf="getDaysSinceLastLogin(user.lastLoginDate) > 0">
                            Hace {{ getDaysSinceLastLogin(user.lastLoginDate) }} días
                          </div>
                        </div>
                        <span class="text-muted" *ngIf="!user.lastLoginDate">
                          Nunca se conectó
                        </span>
                      </td>
                      <td>
                        <div class="d-flex flex-column align-items-start">
                          <span class="badge mb-1" [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                            <i class="bi" [ngClass]="user.isActive ? 'bi-check-circle' : 'bi-x-circle'"></i>
                            {{ user.isActive ? 'Activo' : 'Inactivo' }}
                          </span>
                          <span class="badge" [ngClass]="getStatusClass(user.userStatus?.name)">
                            {{ user.userStatus?.name || 'Sin estado' }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-info"
                            (click)="view(user)"
                            title="Ver detalles">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-primary"
                            (click)="edit(user)"
                            title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline-warning"
                            (click)="resetPassword(user)"
                            title="Restablecer contraseña">
                            <i class="bi bi-key"></i>
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm"
                            [class.btn-outline-success]="!user.isActive"
                            [class.btn-outline-danger]="user.isActive"
                            (click)="toggleUserStatus(user)"
                            [title]="user.isActive ? 'Desactivar usuario' : 'Activar usuario'">
                            <i class="bi" [ngClass]="user.isActive ? 'bi-person-x' : 'bi-person-check'"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty State -->
                <div class="text-center p-4" *ngIf="users.length === 0">
                  <i class="bi bi-people display-4 text-muted"></i>
                  <h5 class="mt-3">No se encontraron usuarios</h5>
                  <p class="text-muted">
                    {{ getEmptyStateMessage() }}
                  </p>
                  <button class="btn btn-primary" (click)="createNew()">
                    <i class="bi bi-person-plus me-1"></i>
                    Crear primer usuario
                  </button>
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

      <!-- Statistics Cards -->
      <div class="row mt-4" *ngIf="(users$ | async) as users">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ users.length }}</h4>
                  <p class="mb-0">Total Usuarios</p>
                </div>
                <i class="bi bi-people display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getActiveUsersCount(users) }}</h4>
                  <p class="mb-0">Usuarios Activos</p>
                </div>
                <i class="bi bi-person-check display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getRecentLoginsCount(users) }}</h4>
                  <p class="mb-0">Accesos Recientes</p>
                </div>
                <i class="bi bi-clock display-6"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>{{ getAdminsCount(users) }}</h4>
                  <p class="mb-0">Administradores</p>
                </div>
                <i class="bi bi-shield-check display-6"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profiles Distribution -->
      <div class="row mt-4" *ngIf="(users$ | async) as users">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6><i class="bi bi-pie-chart me-2"></i>Distribución por Perfiles</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Perfil</th>
                      <th class="text-center">Cantidad</th>
                      <th class="text-center">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let profileData of getProfileDistribution(users)">
                      <td>
                        <span class="badge" [ngClass]="getProfileClass(profileData.profile)">
                          {{ profileData.profile }}
                        </span>
                      </td>
                      <td class="text-center">{{ profileData.count }}</td>
                      <td class="text-center">
                        <div class="progress" style="height: 20px;">
                          <div 
                            class="progress-bar"
                            [style.width.%]="profileData.percentage">
                            {{ profileData.percentage | number:'1.0-0' }}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h6><i class="bi bi-activity me-2"></i>Actividad Reciente</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Último Acceso</th>
                      <th class="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of getRecentActiveUsers(users) | slice:0:5">
                      <td>
                        <div class="d-flex align-items-center">
                          <img 
                            [src]="user.profilePicture || '/assets/images/default-avatar.png'" 
                            alt="{{ user.name }}"
                            class="rounded-circle me-2"
                            style="width: 24px; height: 24px; object-fit: cover;">
                          <span>{{ user.name }}</span>
                        </div>
                      </td>
                      <td>
                        <small>{{ user.lastLoginDate | date:'short' }}</small>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-success" *ngIf="isOnlineRecently(user.lastLoginDate)">
                          <i class="bi bi-circle-fill"></i>
                        </span>
                        <span class="badge bg-secondary" *ngIf="!isOnlineRecently(user.lastLoginDate)">
                          <i class="bi bi-circle"></i>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th {
      border-top: none;
      font-weight: 600;
    }
    .btn-group .btn {
      border-radius: 0.375rem;
      margin-right: 2px;
    }
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid rgba(0, 0, 0, 0.125);
    }
    .avatar img {
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .progress {
      border-radius: 10px;
    }
  `]
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]> | undefined;
  farms: any[] = [];
  onlyActive = true;
  selectedProfile = '';
  selectedFarmId = '';
  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFarms();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      onlyActive: this.onlyActive,
      profile: this.selectedProfile,
      farmId: this.selectedFarmId ? parseInt(this.selectedFarmId, 10) : null,
      searchTerm: this.searchTerm.trim()
    };

    this.users$ = this.userService.getAll(filters);
    
    this.users$.subscribe({
      next: (users) => {
        this.isLoading = false;
        console.log(`Loaded ${users.length} users`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los usuarios';
        console.error('Error loading users:', error);
      }
    });
  }

  private loadFarms(): void {
    // This should use FarmService
    this.farms = [
      { id: 1, name: 'Finca Norte' },
      { id: 2, name: 'Finca Sur' },
      { id: 3, name: 'Finca Este' }
    ];
  }

  createNew(): void {
    this.router.navigate(['/users/new']);
  }

  view(user: User): void {
    this.router.navigate(['/users', user.id]);
  }

  edit(user: User): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  resetPassword(user: User): void {
    if (confirm(`¿Está seguro de restablecer la contraseña del usuario "${user.name}"?`)) {
      this.userService.resetPassword(user.id).subscribe({
        next: () => {
          this.successMessage = `Contraseña restablecida para ${user.name}. Se ha enviado un email con las instrucciones.`;
        },
        error: (error) => {
          this.errorMessage = 'Error al restablecer la contraseña';
          console.error('Reset password error:', error);
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'desactivar' : 'activar';
    if (confirm(`¿Está seguro de ${action} al usuario "${user.name}"?`)) {
      this.userService.toggleStatus(user.id, !user.isActive).subscribe({
        next: () => {
          this.successMessage = `Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`;
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = `Error al ${action} el usuario`;
          console.error('Toggle status error:', error);
        }
      });
    }
  }

  trackByFn(index: number, user: User): number {
    return user.id;
  }

  getProfileClass(profileName: string | undefined): string {
    if (!profileName) return 'bg-light text-dark';

    const profileClasses: { [key: string]: string } = {
      'Administrador': 'bg-danger',
      'Supervisor': 'bg-warning',
      'Operador': 'bg-primary',
      'Tecnico': 'bg-info',
      'Solo Lectura': 'bg-secondary'
    };
    return profileClasses[profileName] || 'bg-light text-dark';
  }

  getProfileIcon(profileName: string | undefined): string {
    if (!profileName) return 'bi-person';

    const profileIcons: { [key: string]: string } = {
      'Administrador': 'bi-shield-fill-exclamation',
      'Supervisor': 'bi-eye-fill',
      'Operador': 'bi-gear-fill',
      'Tecnico': 'bi-tools',
      'Solo Lectura': 'bi-book'
    };
    return profileIcons[profileName] || 'bi-person';
  }

  getStatusClass(statusName: string | undefined): string {
    if (!statusName) return 'bg-light text-dark';

    const statusClasses: { [key: string]: string } = {
      'Conectado': 'bg-success',
      'Desconectado': 'bg-secondary',
      'Ocupado': 'bg-warning',
      'Ausente': 'bg-info'
    };
    return statusClasses[statusName] || 'bg-light text-dark';
  }

  getDaysSinceLastLogin(lastLoginDate: Date | string): number {
    if (!lastLoginDate) return -1;
    
    const today = new Date();
    const loginDate = new Date(lastLoginDate);
    const diffTime = today.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getEmptyStateMessage(): string {
    if (this.selectedProfile && this.selectedFarmId) {
      const farm = this.farms.find(f => f.id.toString() === this.selectedFarmId);
      return `No hay usuarios con perfil "${this.selectedProfile}" en la finca "${farm?.name}"`;
    }
    if (this.selectedProfile) {
      return `No hay usuarios con perfil "${this.selectedProfile}"`;
    }
    if (this.selectedFarmId) {
      const farm = this.farms.find(f => f.id.toString() === this.selectedFarmId);
      return `No hay usuarios asignados a la finca "${farm?.name}"`;
    }
    if (this.searchTerm) {
      return `No se encontraron usuarios con el término "${this.searchTerm}"`;
    }
    return this.onlyActive ? 'No hay usuarios activos' : 'No hay usuarios registrados';
  }

  getActiveUsersCount(users: User[]): number {
    return users.filter(user => user.isActive).length;
  }

  getRecentLoginsCount(users: User[]): number {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return users.filter(user => 
      user.lastLoginDate && 
      new Date(user.lastLoginDate) >= sevenDaysAgo
    ).length;
  }

  getAdminsCount(users: User[]): number {
    return users.filter(user => user.profile?.name === 'Administrador').length;
  }

  getProfileDistribution(users: User[]): any[] {
    const profileMap = new Map<string, number>();
    
    users.forEach(user => {
      const profile = user.profile?.name || 'Sin perfil';
      profileMap.set(profile, (profileMap.get(profile) || 0) + 1);
    });

    const total = users.length;
    return Array.from(profileMap.entries()).map(([profile, count]) => ({
      profile,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  }

  getRecentActiveUsers(users: User[]): User[] {
    return users
      .filter(user => user.lastLoginDate)
      .sort((a, b) => {
        const dateA = a.lastLoginDate ? new Date(a.lastLoginDate).getTime() : 0;
        const dateB = b.lastLoginDate ? new Date(b.lastLoginDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  isOnlineRecently(lastLoginDate: Date | string | undefined): boolean {
    if (!lastLoginDate) return false;
    
    const now = new Date();
    const loginDate = new Date(lastLoginDate);
    const diffMinutes = (now.getTime() - loginDate.getTime()) / (1000 * 60);
    
    return diffMinutes <= 30; // Consider online if logged in within last 30 minutes
  }
}