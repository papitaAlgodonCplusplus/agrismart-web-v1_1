// src/app/core/guards/admin.guard.ts
import { Injectable, inject } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAdminAccess(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAdminAccess(state.url);
  }

  private checkAdminAccess(url: string): Observable<boolean | UrlTree> | boolean | UrlTree {
    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('AdminGuard: User not authenticated, redirecting to login');
      return this.router.createUrlTree(['/login'], { 
        queryParams: { returnUrl: url } 
      });
    }

    // Check if user has admin privileges
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          console.log('AdminGuard: No user found, redirecting to login');
          return this.router.createUrlTree(['/login'], { 
            queryParams: { returnUrl: url } 
          });
        }

        // Check admin privileges
        const isAdmin = this.authService.isAdmin();
        const shouldRedirectToAdmin = this.authService.shouldRedirectToAdmin();

        console.log('AdminGuard: User admin check', {
          email: user.email,
          role: user.role,
          roleId: user.roleId,
          isAdmin,
          shouldRedirectToAdmin
        });

        if (isAdmin || shouldRedirectToAdmin) {
          console.log('AdminGuard: Access granted for admin user');
          return true;
        }

        console.log('AdminGuard: Access denied, redirecting to dashboard');
        // Redirect non-admin users to dashboard
        return this.router.createUrlTree(['/dashboard']);
      })
    );
  }

  /**
   * Check if user has specific admin permissions for certain actions
   */
  hasAdminPermission(permission: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Basic admin check
    if (!this.authService.isAdmin()) return false;

    // Here you can implement more granular permission checking
    // For now, all admin users have all permissions
    switch (permission) {
      case 'manage_users':
      case 'manage_companies':
      case 'manage_farms':
      case 'manage_devices':
      case 'manage_crops':
      case 'manage_water_chemistry':
      case 'manage_crop_phases':
      case 'manage_licenses':
      case 'manage_sensors':
      case 'view_all_data':
      case 'delete_records':
        return true;
      default:
        return false;
    }
  }

  /**
   * Check if current user can access specific entity management
   */
  canManageEntity(entityType: string): boolean {
    return this.hasAdminPermission(`manage_${entityType}`);
  }
}