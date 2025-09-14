// src/app/features/fertilizers/fertilizer-list/fertilizer-list.component.ts - Corrected version
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FertilizerService } from '../services/fertilizer.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Fertilizer } from '../../../core/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-fertilizer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './fertilizer-list.component.html',
  styleUrls: ['./fertilizer-list.component.css']
})
export class FertilizerListComponent implements OnInit {
  fertilizers$: Observable<any[]> | undefined;
  onlyActive = true;
  selectedType = '';
  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal properties
  showCreateModal = false;
  createForm: FormGroup;
  isCreating = false;

  constructor(
    private authService: AuthService,
    private fertilizerService: FertilizerService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createForm = this.initializeCreateForm();
  }

  ngOnInit(): void {
    this.loadFertilizers();
  }

  private initializeCreateForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      manufacturer: ['', [Validators.required]],
      isLiquid: [false, [Validators.required]]
    });
  }

  loadFertilizers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters = {
      user: this.authService.getCurrentUser(),
      onlyActive: this.onlyActive,
      searchTerm: this.searchTerm.trim(),
      // Map liquid/solid filter
      ...(this.selectedType && { isLiquid: this.selectedType === 'true' })
    };

    this.fertilizers$ = this.fertilizerService.getAll(filters);

    this.fertilizers$.subscribe({
      next: (fertilizers) => {
        console.log("Retrieved fertilizers ", fertilizers);
        this.isLoading = false;
        console.log(`Loaded ${fertilizers.length} fertilizers`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los fertilizantes';
        console.error('Error loading fertilizers:', error);
      }
    });
  }

  // Modal methods
  openCreateModal(): void {
    this.showCreateModal = true;
    this.createForm.reset({
      name: '',
      manufacturer: '',
      isLiquid: false
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createForm.reset();
    this.isCreating = false;
  }

  onSubmitCreate(): void {
    if (this.createForm.valid) {
      this.isCreating = true;
      
      const formData = this.createForm.value;
      this.fertilizerService.setUser(this.authService.getCurrentUser());
      
      this.fertilizerService.createWithCurrentCatalog(formData).subscribe({
        next: (fertilizer) => {
          this.successMessage = `Fertilizante "${fertilizer.name}" creado correctamente`;
          this.closeCreateModal();
          this.loadFertilizers();
        },
        error: (error) => {
          this.errorMessage = 'Error al crear el fertilizante';
          console.error('Create error:', error);
          this.isCreating = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  createNew(): void {
    this.openCreateModal();
  }

  view(fertilizer: Fertilizer): void {
    this.router.navigate(['/fertilizers', fertilizer?.id]);
  }

  edit(fertilizer: Fertilizer): void {
    this.router.navigate(['/fertilizers', fertilizer?.id, 'edit']);
  }

  delete(fertilizer: Fertilizer): void {
    if (confirm(`¿Está seguro de eliminar el fertilizante "${fertilizer?.name}"?`)) {
      this.fertilizerService.delete(fertilizer?.id).subscribe({
        next: () => {
          this.successMessage = 'Fertilizante eliminado correctamente';
          this.loadFertilizers();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el fertilizante';
          console.error('Delete error:', error);
        }
      });
    }
  }

  getEmptyStateMessage(): string {
    if (this.selectedType === 'true') {
      return 'No hay fertilizantes líquidos registrados';
    }
    if (this.selectedType === 'false') {
      return 'No hay fertilizantes sólidos registrados';
    }
    if (this.searchTerm) {
      return `No se encontraron fertilizantes con el término "${this.searchTerm}"`;
    }
    return this.onlyActive ? 'No hay fertilizantes activos registrados' : 'No hay fertilizantes registrados';
  }

  getLiquidCount(fertilizers: any[]): number {
    if (!Array.isArray(fertilizers)) {
      console.warn('Expected fertilizers to be an array, got:', fertilizers);
      return 0;
    }
    return fertilizers.filter(f => f.isLiquid === true).length;
  }

  getActiveCount(fertilizers: any[]): number {
    if (!Array.isArray(fertilizers)) {
      console.warn('Expected fertilizers to be an array, got:', fertilizers);
      return 0;
    }
    return fertilizers.filter(f => f.active === true).length;
  }

  trackByFn(index: number, fertilizer: any): number | null {
    return fertilizer?.id || null;
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}