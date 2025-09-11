import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, tap, of, finalize } from 'rxjs';

// Services
import { WaterChemistryService, WaterChemistry, WaterChemistryFilters } from '../water-chemistry/services/water-chemistry.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-water-chemistry',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './water-chemistry.component.html',
  styleUrls: ['./water-chemistry.component.css']
})
export class WaterChemistryComponent implements OnInit {
  waterChemistryRecords: WaterChemistry[] = [];
  filteredRecords: WaterChemistry[] = [];
  selectedRecord: WaterChemistry | null = null;
  waterChemistryForm!: FormGroup;
  
  // UI State
  isLoading = false;
  isFormVisible = false;
  isEditMode = false;
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  
  // Filters
  filters: WaterChemistryFilters = {
    onlyActive: true,
    searchTerm: '',
    minPh: undefined,
    maxPh: undefined,
    minEc: undefined,
    maxEc: undefined
  };

  // Error handling
  errorMessage = '';
  successMessage = '';

  constructor(
    private waterChemistryService: WaterChemistryService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadWaterChemistryRecords();
  }

  private checkAuthentication(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  private initializeForm(): void {
    this.waterChemistryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      
      // Major ions (mg/L)
      no3: [0, [Validators.min(0), Validators.max(1000)]],
      po4: [0, [Validators.min(0), Validators.max(100)]],
      k: [0, [Validators.min(0), Validators.max(1000)]],
      ca: [0, [Validators.min(0), Validators.max(1000)]],
      mg: [0, [Validators.min(0), Validators.max(500)]],
      na: [0, [Validators.min(0), Validators.max(1000)]],
      cl: [0, [Validators.min(0), Validators.max(1000)]],
      sul: [0, [Validators.min(0), Validators.max(1000)]],
      
      // Micronutrients (mg/L)
      fe: [0, [Validators.min(0), Validators.max(20)]],
      b: [0, [Validators.min(0), Validators.max(10)]],
      cu: [0, [Validators.min(0), Validators.max(5)]],
      zn: [0, [Validators.min(0), Validators.max(10)]],
      mn: [0, [Validators.min(0), Validators.max(10)]],
      mo: [0, [Validators.min(0), Validators.max(1)]],
      
      // Additional parameters
      h2po4: [0, [Validators.min(0), Validators.max(100)]],
      ec: [0, [Validators.min(0), Validators.max(10)]],
      ph: [7, [Validators.min(0), Validators.max(14)]],
      
      // Water quality parameters
      phLevel: [7, [Validators.min(0), Validators.max(14)]],
      ecLevel: [0, [Validators.min(0), Validators.max(10)]],
      tdsLevel: [0, [Validators.min(0), Validators.max(5000)]],
      temperature: [20, [Validators.min(-10), Validators.max(50)]],
      oxygenLevel: [0, [Validators.min(0), Validators.max(20)]],
      nitrateLevel: [0, [Validators.min(0), Validators.max(1000)]],
      phosphateLevel: [0, [Validators.min(0), Validators.max(100)]],
      
      isActive: [true]
    });
  }

  loadWaterChemistryRecords(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.waterChemistryService.getAll(this.filters).pipe(
      tap(records => {
        console.log('Loaded water chemistry records:', records);
      }),
      catchError(error => {
        console.error('Error loading water chemistry records:', error);
        this.errorMessage = 'Error al cargar los registros de química del agua';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(records => {
      console.log("records, ", records)
      this.waterChemistryRecords = records.waterChemistries;
      this.filteredRecords = this.waterChemistryRecords;
      // this.applyFilters();
      // this.updatePagination();
    });
  }

  applyFilters(): void {
    this.filteredRecords = this.waterChemistryRecords.filter(record => {
      if (this.filters.searchTerm) {
        const searchTerm = this.filters.searchTerm.toLowerCase();
        const matchesName = record.name?.toLowerCase().includes(searchTerm) || false;
        const matchesDescription = record.description?.toLowerCase().includes(searchTerm) || false;
        if (!matchesName && !matchesDescription) return false;
      }
      
      if (this.filters.onlyActive && !record.isActive) return false;
      
      if (this.filters.minPh !== undefined && (record.ph || 0) < this.filters.minPh) return false;
      if (this.filters.maxPh !== undefined && (record.ph || 0) > this.filters.maxPh) return false;
      
      if (this.filters.minEc !== undefined && (record.ec || 0) < this.filters.minEc) return false;
      if (this.filters.maxEc !== undefined && (record.ec || 0) > this.filters.maxEc) return false;
      
      return true;
    });
    
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalRecords = this.filteredRecords.length;
  }

  get paginatedRecords(): WaterChemistry[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredRecords.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      onlyActive: true,
      searchTerm: '',
      minPh: undefined,
      maxPh: undefined,
      minEc: undefined,
      maxEc: undefined
    };
    this.applyFilters();
  }

  showCreateForm(): void {
    this.selectedRecord = null;
    this.isEditMode = false;
    this.isFormVisible = true;
    this.waterChemistryForm.reset();
    this.waterChemistryForm.patchValue({ isActive: true });
    this.clearMessages();
  }

  editRecord(record: WaterChemistry): void {
    this.selectedRecord = record;
    this.isEditMode = true;
    this.isFormVisible = true;
    this.waterChemistryForm.patchValue(record);
    this.clearMessages();
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.selectedRecord = null;
    this.isEditMode = false;
    this.waterChemistryForm.reset();
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.waterChemistryForm.valid) {
      this.isLoading = true;
      this.clearMessages();
      
      const formData = this.waterChemistryForm.value;
      
      if (this.isEditMode && this.selectedRecord?.id) {
        this.updateRecord(this.selectedRecord.id, formData);
      } else {
        this.createRecord(formData);
      }
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente.';
    }
  }

  private createRecord(data: Partial<WaterChemistry>): void {
    this.waterChemistryService.create(data).pipe(
      catchError(error => {
        console.error('Error creating water chemistry record:', error);
        this.errorMessage = 'Error al crear el registro de química del agua';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(result => {
      if (result) {
        this.successMessage = 'Registro de química del agua creado exitosamente';
        this.loadWaterChemistryRecords();
        this.cancelForm();
      }
    });
  }

  private updateRecord(id: number, data: Partial<WaterChemistry>): void {
    this.waterChemistryService.update(id, data).pipe(
      catchError(error => {
        console.error('Error updating water chemistry record:', error);
        this.errorMessage = 'Error al actualizar el registro de química del agua';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(result => {
      if (result) {
        this.successMessage = 'Registro de química del agua actualizado exitosamente';
        this.loadWaterChemistryRecords();
        this.cancelForm();
      }
    });
  }

  deleteRecord(record: WaterChemistry): void {
    if (!record.id) return;
    
    if (confirm(`¿Está seguro de que desea eliminar el registro "${record.name}"?`)) {
      this.isLoading = true;
      this.clearMessages();
      
      this.waterChemistryService.delete(record.id).pipe(
        catchError(error => {
          console.error('Error deleting water chemistry record:', error);
          this.errorMessage = 'Error al eliminar el registro de química del agua';
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe(() => {
        this.successMessage = 'Registro eliminado exitosamente';
        this.loadWaterChemistryRecords();
      });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.waterChemistryForm.controls).forEach(key => {
      this.waterChemistryForm.get(key)?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.waterChemistryForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.waterChemistryForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // Water quality analysis methods
  getWaterQualityStatus(record: WaterChemistry): string {
    const ph = record.ph || record.phLevel || 7;
    const ec = record.ec || record.ecLevel || 0;
    
    if (ph < 5.5 || ph > 8.5) return 'poor';
    if (ec > 3) return 'high-salinity';
    if (ph >= 6.0 && ph <= 7.5 && ec <= 2) return 'excellent';
    return 'good';
  }

  getWaterQualityLabel(status: string): string {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'high-salinity': return 'Alta Salinidad';
      case 'poor': return 'Pobre';
      default: return 'Sin evaluar';
    }
  }

  getWaterQualityClass(status: string): string {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'high-salinity': return 'text-warning';
      case 'poor': return 'text-danger';
      default: return 'text-muted';
    }
  }
}