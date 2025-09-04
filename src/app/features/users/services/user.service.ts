// src/app/features/users/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { User, Profile, UserStatus, UserPreferences, UserFarm } from '../../../core/models/models';

export interface UserFilters {
  onlyActive?: boolean;
  profile?: string;
  farmId?: number | null;
  searchTerm?: string;
  status?: string;
  department?: string;
  position?: string;
  twoFactorEnabled?: boolean;
  lastLoginWithin?: number; // days
  createdDateFrom?: string;
  createdDateTo?: string;
  hasProfilePicture?: boolean;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  bio?: string;
  profilePicture?: string;
  profileId?: number;
  userStatusId?: number;
  password: string;
  twoFactorEnabled?: boolean;
  isActive?: boolean;
  userFarms?: {
    farmId: number;
    role?: string;
    permissions?: string[];
  }[];
  preferences?: Partial<UserPreferences>;
}

export interface UserUpdateRequest extends Partial<Omit<UserCreateRequest, 'password'>> {
  currentPassword?: string;
  newPassword?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  onlineUsers: number; // logged in within last hour
  recentUsers: number; // logged in within last 24 hours
  byProfile: {
    [profileName: string]: {
      count: number;
      activeCount: number;
    };
  };
  byStatus: {
    [statusName: string]: number;
  };
  byDepartment: {
    [department: string]: number;
  };
  twoFactorEnabled: number;
  averageLastLogin: number; // days ago
  newUsersThisMonth: number;
  mostActiveUser: {
    name: string;
    loginCount: number;
  };
}

export interface UserActivity {
  id: number;
  userId: number;
  activityType: 'login' | 'logout' | 'profile_update' | 'password_change' | 'farm_access' | 'system_action';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  metadata?: any;
  timestamp: Date;
}

export interface UserSession {
  id: string;
  userId: number;
  deviceType: string;
  browser: string;
  ipAddress: string;
  location?: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
}

export interface UserPermission {
  id: number;
  name: string;
  description?: string;
  category: string;
  isDefault: boolean;
}

export interface UserAuditLog {
  id: number;
  userId: number;
  actionType: 'create' | 'update' | 'delete' | 'status_change' | 'password_reset' | 'login' | 'logout';
  description: string;
  changedFields?: string[];
  oldValues?: any;
  newValues?: any;
  performedById: number;
  performedBy?: User;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api/users';
  private readonly profilesUrl = '/api/profiles';
  private readonly userStatusUrl = '/api/user-statuses';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all users with optional filters
   */
  getAll(filters?: UserFilters): Observable<User[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.profile) {
        params = params.set('profile', filters.profile);
      }
      if (filters.farmId) {
        params = params.set('farmId', filters.farmId.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.department) {
        params = params.set('department', filters.department);
      }
      if (filters.position) {
        params = params.set('position', filters.position);
      }
      if (filters.twoFactorEnabled !== undefined) {
        params = params.set('twoFactorEnabled', filters.twoFactorEnabled.toString());
      }
      if (filters.lastLoginWithin !== undefined) {
        params = params.set('lastLoginWithin', filters.lastLoginWithin.toString());
      }
      if (filters.createdDateFrom) {
        params = params.set('createdDateFrom', filters.createdDateFrom);
      }
      if (filters.createdDateTo) {
        params = params.set('createdDateTo', filters.createdDateTo);
      }
      if (filters.hasProfilePicture !== undefined) {
        params = params.set('hasProfilePicture', filters.hasProfilePicture.toString());
      }
    }

    return this.apiService.get<User[]>(this.baseUrl, params);
  }

  /**
   * Get user by ID
   */
  getById(id: number): Observable<User> {
    return this.apiService.get<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new user
   */
  create(data: UserCreateRequest): Observable<User> {
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      twoFactorEnabled: data.twoFactorEnabled || false
    };

    return this.apiService.post<User>(this.baseUrl, payload);
  }

  /**
   * Update user
   */
  update(id: number, data: UserUpdateRequest): Observable<User> {
    return this.apiService.put<User>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete user
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle user status
   */
  toggleStatus(id: number, isActive: boolean): Observable<User> {
    const payload = { isActive };
    return this.apiService.put<User>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Reset user password
   */
  resetPassword(id: number): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>(`${this.baseUrl}/${id}/reset-password`, {});
  }

  /**
   * Change user password
   */
  changePassword(id: number, data: PasswordChangeRequest): Observable<{ message: string }> {
    return this.apiService.put<{ message: string }>(`${this.baseUrl}/${id}/change-password`, data);
  }

  /**
   * Update user preferences
   */
  updatePreferences(id: number, preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.apiService.put<UserPreferences>(`${this.baseUrl}/${id}/preferences`, preferences);
  }

  /**
   * Toggle two-factor authentication
   */
  toggleTwoFactor(id: number, enabled: boolean): Observable<User> {
    const payload = { twoFactorEnabled: enabled };
    return this.apiService.put<User>(`${this.baseUrl}/${id}/two-factor`, payload);
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(id: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.http.put<User>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/${id}/profile-picture`,
      formData,
      { headers: this.getAuthHeaders(false) }
    );
  }

  /**
   * Remove profile picture
   */
  removeProfilePicture(id: number): Observable<User> {
    return this.apiService.delete<User>(`${this.baseUrl}/${id}/profile-picture`);
  }

  /**
   * Get active users
   */
  getActive(): Observable<User[]> {
    return this.getAll({ onlyActive: true });
  }

  /**
   * Get users by profile
   */
  getByProfile(profileName: string): Observable<User[]> {
    return this.getAll({ profile: profileName });
  }

  /**
   * Get users by farm
   */
  getByFarm(farmId: number): Observable<User[]> {
    return this.getAll({ farmId });
  }

  /**
   * Search users
   */
  search(searchTerm: string): Observable<User[]> {
    return this.getAll({ searchTerm });
  }

  /**
   * Get online users (logged in within last hour)
   */
  getOnlineUsers(): Observable<User[]> {
    return this.getAll({ lastLoginWithin: 0.04 }); // 1 hour = 0.04 days
  }

  /**
   * Get user statistics
   */
  getStatistics(): Observable<UserStatistics> {
    return this.apiService.get<UserStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * Get user activity log
   */
  getUserActivity(userId: number, limit?: number): Observable<UserActivity[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.apiService.get<UserActivity[]>(`${this.baseUrl}/${userId}/activity`, params);
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId: number): Observable<UserSession[]> {
    return this.apiService.get<UserSession[]>(`${this.baseUrl}/${userId}/sessions`);
  }

  /**
   * Terminate user session
   */
  terminateSession(userId: number, sessionId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${userId}/sessions/${sessionId}`);
  }

  /**
   * Terminate all user sessions
   */
  terminateAllSessions(userId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${userId}/sessions`);
  }

  /**
   * Get user audit log
   */
  getUserAuditLog(userId?: number, limit?: number, dateFrom?: string, dateTo?: string): Observable<UserAuditLog[]> {
    let params = new HttpParams();
    
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.apiService.get<UserAuditLog[]>(`${this.baseUrl}/audit`, params);
  }

  /**
   * Assign user to farm
   */
  assignToFarm(userId: number, farmId: number, role?: string, permissions?: string[]): Observable<UserFarm> {
    const payload = { farmId, role, permissions };
    return this.apiService.post<UserFarm>(`${this.baseUrl}/${userId}/farms`, payload);
  }

  /**
   * Remove user from farm
   */
  removeFromFarm(userId: number, farmId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${userId}/farms/${farmId}`);
  }

  /**
   * Update user farm permissions
   */
  updateFarmPermissions(userId: number, farmId: number, permissions: string[]): Observable<UserFarm> {
    const payload = { permissions };
    return this.apiService.put<UserFarm>(`${this.baseUrl}/${userId}/farms/${farmId}`, payload);
  }

  /**
   * Get user permissions
   */
  getUserPermissions(userId: number, farmId?: number): Observable<string[]> {
    let params = new HttpParams();
    if (farmId) {
      params = params.set('farmId', farmId.toString());
    }

    return this.apiService.get<string[]>(`${this.baseUrl}/${userId}/permissions`, params);
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId: number, permission: string, farmId?: number): Observable<boolean> {
    let params = new HttpParams().set('permission', permission);
    if (farmId) {
      params = params.set('farmId', farmId.toString());
    }

    return this.apiService.get<boolean>(`${this.baseUrl}/${userId}/has-permission`, params);
  }

  /**
   * Bulk operations
   */
  bulkUpdate(userIds: number[], data: Partial<UserUpdateRequest>): Observable<User[]> {
    const payload = { userIds, updateData: data };
    return this.apiService.put<User[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  bulkDelete(userIds: number[]): Observable<void> {
    const payload = { userIds };
    return this.apiService.post<void>(`${this.baseUrl}/bulk-delete`, payload);
  }

  bulkActivate(userIds: number[]): Observable<User[]> {
    const payload = { userIds, isActive: true };
    return this.apiService.put<User[]>(`${this.baseUrl}/bulk-status`, payload);
  }

  bulkDeactivate(userIds: number[]): Observable<User[]> {
    const payload = { userIds, isActive: false };
    return this.apiService.put<User[]>(`${this.baseUrl}/bulk-status`, payload);
  }

  /**
   * Profile Management
   */
  getAllProfiles(): Observable<Profile[]> {
    return this.apiService.get<Profile[]>(this.profilesUrl);
  }

  getProfileById(id: number): Observable<Profile> {
    return this.apiService.get<Profile>(`${this.profilesUrl}/${id}`);
  }

  createProfile(data: { name: string; description?: string; permissions?: string[] }): Observable<Profile> {
    return this.apiService.post<Profile>(this.profilesUrl, data);
  }

  updateProfile(id: number, data: { name?: string; description?: string; permissions?: string[] }): Observable<Profile> {
    return this.apiService.put<Profile>(`${this.profilesUrl}/${id}`, data);
  }

  deleteProfile(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.profilesUrl}/${id}`);
  }

  /**
   * User Status Management
   */
  getAllUserStatuses(): Observable<UserStatus[]> {
    return this.apiService.get<UserStatus[]>(this.userStatusUrl);
  }

  createUserStatus(data: { name: string; description?: string }): Observable<UserStatus> {
    return this.apiService.post<UserStatus>(this.userStatusUrl, data);
  }

  updateUserStatus(id: number, data: { name?: string; description?: string }): Observable<UserStatus> {
    return this.apiService.put<UserStatus>(`${this.userStatusUrl}/${id}`, data);
  }

  deleteUserStatus(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.userStatusUrl}/${id}`);
  }

  /**
   * Export users data
   */
  exportUsers(filters?: UserFilters, format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.apiConfig.agronomicApiUrl}${this.baseUrl}/export`, {
      params,
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Import users from file
   */
  importUsers(file: File): Observable<{ success: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: number; errors: any[] }>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/import`,
      formData,
      { headers: this.getAuthHeaders(false) }
    );
  }

  /**
   * Utility methods for components
   */
  formatUserName(user: User): string {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return user.email || 'Usuario sin nombre';
  }

  formatUserRole(userFarm: UserFarm): string {
    return userFarm.role || 'Sin rol';
  }

  isUserOnline(lastLoginDate: Date | string | undefined): boolean {
    if (!lastLoginDate) return false;
    const loginDate = new Date(lastLoginDate);
    const hoursSinceLogin = (Date.now() - loginDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceLogin <= 1; // Online if logged in within last hour
  }

  isUserRecentlyActive(lastLoginDate: Date | string | undefined, days: number = 7): boolean {
    if (!lastLoginDate) return false;
    const loginDate = new Date(lastLoginDate);
    const daysSinceLogin = (Date.now() - loginDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLogin <= days;
  }

  calculateDaysSinceLastLogin(lastLoginDate: Date | string | undefined): number {
    if (!lastLoginDate) return -1;
    const loginDate = new Date(lastLoginDate);
    return Math.floor((Date.now() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Data transformation methods
   */
  groupByProfile(users: User[]): { [profileName: string]: User[] } {
    return users.reduce((groups, user) => {
      const profileName = user.profile?.name || 'Sin perfil';
      if (!groups[profileName]) {
        groups[profileName] = [];
      }
      groups[profileName].push(user);
      return groups;
    }, {} as { [profileName: string]: User[] });
  }

  groupByDepartment(users: User[]): { [department: string]: User[] } {
    return users.reduce((groups, user) => {
      const department = user.department || 'Sin departamento';
      if (!groups[department]) {
        groups[department] = [];
      }
      groups[department].push(user);
      return groups;
    }, {} as { [department: string]: User[] });
  }

  sortByName(users: User[], ascending: boolean = true): User[] {
    return [...users].sort((a, b) => {
      const nameA = this.formatUserName(a).toLowerCase();
      const nameB = this.formatUserName(b).toLowerCase();
      const comparison = nameA.localeCompare(nameB);
      return ascending ? comparison : -comparison;
    });
  }

  sortByLastLogin(users: User[], ascending: boolean = false): User[] {
    return [...users].sort((a, b) => {
      if (!a.lastLoginDate && !b.lastLoginDate) return 0;
      if (!a.lastLoginDate) return ascending ? -1 : 1;
      if (!b.lastLoginDate) return ascending ? 1 : -1;

      const dateA = new Date(a.lastLoginDate).getTime();
      const dateB = new Date(b.lastLoginDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  filterByActiveStatus(users: User[], activeOnly: boolean = true): User[] {
    return users.filter(user => activeOnly ? user.isActive : !user.isActive);
  }

  filterByOnlineStatus(users: User[], onlineOnly: boolean = true): User[] {
    return users.filter(user => onlineOnly ? this.isUserOnline(user.lastLoginDate) : !this.isUserOnline(user.lastLoginDate));
  }

  /**
   * Private helper methods
   */
  private getAuthHeaders(includeContentType: boolean = true): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    const headers: { [header: string]: string } = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private handleError(error: any): Observable<never> {
    console.error('User Service Error:', error);
    throw error;
  }
}