// src/app/features/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
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

          <div class="alert alert-danger mt-3" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>
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
    }
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
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
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(field: string): boolean {
    const formField = this.loginForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}