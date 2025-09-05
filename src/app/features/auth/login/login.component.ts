// src/app/features/auth/login/login.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">

        <div class="login-header d-flex flex-column align-items-center position-relative">
          <img src="/assets/images/agrismart-logo.png" alt="AgriSmart" class="logo" 
               onerror="this.style.display='none'">
          <h2>Iniciar Sesión</h2>
          <p class="login-subtitle">Accede a tu cuenta de AgriSmart</p>
          <button *ngIf="authService.isAuthenticated()" (click)="logout()" class="btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-2" style="z-index:2;">
            <i class="bi bi-box-arrow-right"></i> Cerrar sesión
          </button>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">
              <i class="bi bi-envelope"></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('email')"
              formControlName="email"
              placeholder="usuario@empresa.com"
              autocomplete="email">
            <div *ngIf="isFieldInvalid('email')" class="invalid-feedback">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">
                El correo electrónico es requerido
              </span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">
                Ingrese un correo electrónico válido
              </span>
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">
              <i class="bi bi-lock"></i>
              Contraseña
            </label>
            <div class="password-input-container">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('password')"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password">
              <button
                type="button"
                class="password-toggle"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div *ngIf="isFieldInvalid('password')" class="invalid-feedback">
              La contraseña es requerida
            </div>
          </div>

          <!-- Remember Me -->
          <div class="form-group form-check">
            <input
              type="checkbox"
              id="rememberMe"
              class="form-check-input"
              formControlName="rememberMe">
            <label for="rememberMe" class="form-check-label">
              Recordar sesión
            </label>
          </div>

          <!-- Submit Button -->
          <div class="form-group">
            <button
              type="submit"
              class="btn btn-primary btn-login"
              [disabled]="isLoading || loginForm.invalid">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!isLoading" class="bi bi-box-arrow-in-right me-2"></i>
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="alert alert-danger mt-3" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>

          <!-- Admin Notice -->
          <div *ngIf="showAdminNotice" class="alert alert-info mt-3" role="alert">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Acceso de administrador detectado.</strong><br>
            Serás redirigido al panel de administración.
          </div>
        </form>

        <!-- Footer Links -->
        <div class="login-footer">
          <div class="links">
            <a href="#" class="link-primary">¿Olvidaste tu contraseña?</a>
          </div>
          <div class="version-info">
            <small class="text-muted">AgriSmart v1.1.0</small>
          </div>
        </div>

        <!-- Quick Login for Development -->
        <div *ngIf="isDevelopment" class="development-section">
          <hr>
          <h6 class="text-muted">Acceso Rápido - Desarrollo</h6>
          <div class="quick-login-buttons">
            <button type="button" 
                    class="btn btn-outline-primary btn-sm"
                    (click)="quickLogin('admin')">
              <i class="bi bi-shield-check"></i>
              Admin (ebrecha iapsoft.com)
            </button>
            <button type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    (click)="quickLogin('user')">
              <i class="bi bi-person"></i>
              Usuario Normal
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .login-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .logo {
      max-height: 60px;
      margin-bottom: 1rem;
    }

    .login-header h2 {
      margin: 0 0 0.5rem 0;
      font-weight: 700;
      font-size: 1.75rem;
    }

    .login-subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .login-form {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .form-control {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .password-input-container {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: color 0.3s ease;
    }

    .password-toggle:hover {
      color: #495057;
    }

    .form-check {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-check-input {
      margin: 0;
    }

    .btn-login {
      width: 100%;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      transition: all 0.3s ease;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-login:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .invalid-feedback {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .alert {
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .login-footer {
      padding: 1.5rem 2rem;
      background: #f8f9fa;
      text-align: center;
    }

    .links {
      margin-bottom: 1rem;
    }

    .link-primary {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .link-primary:hover {
      color: #5a6fd8;
      text-decoration: underline;
    }

    .development-section {
      padding: 1rem 2rem;
      background: #fff3cd;
      border-top: 1px solid #ffeaa7;
    }

    .development-section h6 {
      margin-bottom: 1rem;
      text-align: center;
    }

    .quick-login-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .quick-login-buttons .btn {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 0.5rem;
      }

      .login-header {
        padding: 1.5rem;
      }

      .login-form {
        padding: 1.5rem;
      }

      .login-footer {
        padding: 1rem 1.5rem;
      }
    }

    /* Loading animation */
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .btn-login:disabled {
      animation: pulse 1.5s infinite;
    }

    /* Success animation */
    @keyframes slideInUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .alert-info {
      animation: slideInUp 0.3s ease;
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showAdminNotice = false;
  returnUrl = '';
  isDevelopment = false; // Set to true for development environment

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Check if it's development environment
    this.isDevelopment = window.location.hostname === 'localhost';
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      const redirectUrl = this.authService.getRedirectUrl();
      this.router.navigate([redirectUrl]);
      return;
    }

    // Set default test values for development
    if (this.isDevelopment) {
      this.loginForm.patchValue({
        email: 'csolano@iapcr.com',
        password: '123'
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.performLogin();
  }

  quickLogin(type: 'admin' | 'user'): void {
    if (type === 'admin') {
      this.loginForm.patchValue({
        email: 'ebrecha@iapsoft.com',
        password: '123'
      });
    } else {
      this.loginForm.patchValue({
        email: 'csolano@iapcr.com',
        password: '123'
      });
    }
    
    this.performLogin();
  }

  private performLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showAdminNotice = false;

    const formValue = this.loginForm.value;
    const loginRequest = this.authService.createLoginRequest(
      formValue.email, 
      formValue.password
    );

    console.log('DEBUG Login Component - Sending login request:', loginRequest);

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('DEBUG Login Component - Login successful:', response);
        this.isLoading = false;
        
        // Check if this is an admin user
        if (this.authService.shouldRedirectToAdmin()) {
          this.showAdminNotice = true;
          
          // Delay redirect to show admin notice
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1500);
        } else {
          // Regular user redirect
          const targetUrl = this.returnUrl || this.authService.getRedirectUrl();
          this.router.navigate([targetUrl]);
        }
      },
      error: (error) => {
        console.error('DEBUG Login Component - Login error:', error);
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    // Default error messages based on status
    if (error?.status === 401) {
      return 'Credenciales inválidas. Verifique su email y contraseña.';
    }
    
    if (error?.status === 0) {
      return 'No se puede conectar al servidor. Verifique su conexión a internet.';
    }
    
    return 'Ha ocurrido un error inesperado. Intente nuevamente.';
  }
}