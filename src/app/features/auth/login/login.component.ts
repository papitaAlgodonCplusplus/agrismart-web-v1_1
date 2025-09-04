// src/app/features/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="text-center mb-4">
          <h2>AgriSmart</h2>
          <p class="text-muted">Iniciar Sesión</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email"
              class="form-control"
              formControlName="email"
              [class.is-invalid]="isFieldInvalid('email')"
              placeholder="Ingrese su email">
            <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
              <small *ngIf="loginForm.get('email')?.errors?.['required']">El email es requerido</small>
              <small *ngIf="loginForm.get('email')?.errors?.['email']">Ingrese un email válido</small>
            </div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input 
              type="password" 
              id="password"
              class="form-control"
              formControlName="password"
              [class.is-invalid]="isFieldInvalid('password')"
              placeholder="Ingrese su contraseña">
            <div class="invalid-feedback" *ngIf="isFieldInvalid('password')">
              <small *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida</small>
            </div>
          </div>

          <div class="mb-3 form-check">
            <input 
              type="checkbox" 
              class="form-check-input" 
              id="rememberMe"
              formControlName="rememberMe">
            <label class="form-check-label" for="rememberMe">
              Recordarme
            </label>
          </div>

          <div class="d-grid">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="loginForm.invalid || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger mt-3" role="alert">
            {{ errorMessage }}
          </div>
        </form>

        <div class="text-center mt-3">
          <small class="text-muted">
            ¿Olvidaste tu contraseña? <a href="#" class="text-decoration-none">Recuperar</a>
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h2 {
      color: #2c3e50;
      font-weight: 600;
    }

    .btn-primary {
      background-color: #27ae60;
      border-color: #27ae60;
    }

    .btn-primary:hover {
      background-color: #219a52;
      border-color: #1e8449;
    }

    .form-control:focus {
      border-color: #27ae60;
      box-shadow: 0 0 0 0.2rem rgba(39, 174, 96, 0.25);
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Redirect to dashboard if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }

    // Set default test values for development
    if (!this.isProduction()) {
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

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.loginForm.value;
    
    // FIXED: Use the helper method to create proper request structure
    const loginRequest = this.authService.createLoginRequest(
      formValue.email, 
      formValue.password
    );

    console.log('DEBUG Frontend - Sending login request:', loginRequest);

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('DEBUG Frontend - Login successful:', response);
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('DEBUG Frontend - Login error:', error);
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
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
    if (error.status === 401) {
      return 'Email o contraseña incorrectos.';
    } else if (error.status === 0) {
      return 'No se puede conectar con el servidor. Verifique su conexión.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Ocurrió un error inesperado. Intente nuevamente.';
    }
  }

  private isProduction(): boolean {
    return false; // Set to true in production build
  }
}