// src/app/features/farms/farm-list/farm-list.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, tap, of, finalize, forkJoin } from 'rxjs';

// Services
import { FarmService, FarmFilters, FarmCreateRequest, FarmUpdateRequest, FarmStatistics } from '../services/farm.service';
import { Farm, Company } from '../../../core/models/models';
import { AuthService } from '../../../core/auth/auth.service';
import { CompanyService } from '../../companies/services/company.service';

@Component({
  selector: 'app-farm-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './farm-list.component.html',
  styleUrls: ['./farm-list.component.scss']
})
export class FarmListComponent implements OnInit {
  farms: Farm[] = [];
  filteredFarms: Farm[] = [];
  selectedFarm: Farm | null = null;
  farmForm!: FormGroup;

  // Companies
  availableCompanies: Company[] = [];
  selectedCompanyId: number | null = null;
  isLoadingCompanies = false;

  // UI State
  isLoading = false;
  isFormVisible = false;
  isEditMode = false;
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  // Filters
  filters: FarmFilters = {
    onlyActive: true,
    searchTerm: '',
    location: '',
    minArea: undefined,
    maxArea: undefined,
    hasActiveProductions: undefined,
    soilType: '',
    climate: ''
  };

  // Error handling
  errorMessage = '';
  successMessage = '';

  // Climate types
  climateTypes = [
    { value: 'Tropical', label: 'Tropical' },
    { value: 'Subtropical', label: 'Subtropical' },
    { value: 'Templado', label: 'Templado' },
    { value: 'Continental', label: 'Continental' },
    { value: 'Mediterráneo', label: 'Mediterráneo' },
    { value: 'Árido', label: 'Árido' },
    { value: 'Semi-árido', label: 'Semi-árido' },
    { value: 'Otro', label: 'Otro' }
  ];

  // Soil types
  soilTypes = [
    { value: 'Arcilloso', label: 'Arcilloso' },
    { value: 'Arenoso', label: 'Arenoso' },
    { value: 'Limoso', label: 'Limoso' },
    { value: 'Franco', label: 'Franco' },
    { value: 'Franco arcilloso', label: 'Franco arcilloso' },
    { value: 'Franco arenoso', label: 'Franco arenoso' },
    { value: 'Franco limoso', label: 'Franco limoso' },
    { value: 'Orgánico', label: 'Orgánico' },
    { value: 'Otro', label: 'Otro' }
  ];

  constructor(
    private farmService: FarmService,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  initializeForm(): void {
    this.farmForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      companyId: ['', [Validators.required]],
      location: [''],
      address: [''],
      area: ['', [Validators.min(0)]],
      latitude: ['', [Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.min(-180), Validators.max(180)]],
      climate: [''],
      soilType: [''],
      isActive: [true]
    });
  }

  // NEW: Data mapping function to normalize API response
  private mapApiResponseToFarm(apiResponse: any): Farm {
    return {
      id: apiResponse.id,
      name: apiResponse.name,
      description: apiResponse.description,
      companyId: apiResponse.companyId,
      location: apiResponse.location,
      address: apiResponse.address,
      area: apiResponse.area,
      latitude: apiResponse.latitude,
      longitude: apiResponse.longitude,

      climate: apiResponse.climate,
      soilType: apiResponse.soilType,
      isActive: apiResponse.active !== undefined ? apiResponse.active : apiResponse.isActive, // Map 'active' to 'isActive'
      timeZoneId: apiResponse.timeZoneId,
      company: apiResponse.company,
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    } as Farm;
  }

  // NEW: Data mapping function for companies
  private mapApiResponseToCompany(apiResponse: any): Company {
    return {
      id: apiResponse.id,
      clientId: apiResponse.clientId,
      catalogId: apiResponse.catalogId,
      name: apiResponse.name,
      description: apiResponse.description,
      isActive: apiResponse.active !== undefined ? apiResponse.active : apiResponse.isActive, // Map 'active' to 'isActive'
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    } as Company;
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load companies and farms in parallel
    forkJoin({
      companies: this.companyService.getAll(true).pipe(
        catchError(error => {
          console.error('Error loading companies:', error);
          return of([]);
        })
      ),
      farms: this.farmService.getAll(undefined, this.filters).pipe(
        catchError(error => {
          console.error('Error loading farms:', error);
          return of([]);
        })
      )
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log('Initial data loaded:', data);

        // Map API responses to expected format
        this.availableCompanies = data.companies.map(company => this.mapApiResponseToCompany(company));
        this.farms = data.farms.map(farm => this.mapApiResponseToFarm(farm));

        console.log('Mapped farms:', this.farms);
        console.log('Mapped companies:', this.availableCompanies);

        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los datos iniciales';
        console.error('Error in loadInitialData:', error);
      }
    });
  }

  loadFarms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.farmService.getAll(undefined, this.filters)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al cargar las fincas';
          console.error('Error loading farms:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(farmsResponse => {
        // Map API response to expected format
        this.farms = farmsResponse.map(farm => this.mapApiResponseToFarm(farm));
        console.log('Loaded and mapped farms:', this.farms);
        this.applyFilters();
      });
  }

  applyFilters(): void {
    let filtered = [...this.farms];

    console.log('Applying filters to farms:', filtered);
    console.log('Current filters:', this.filters);

    // Search term filter
    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(farm =>
        farm.name.toLowerCase().includes(searchTerm) ||
        (farm.location && farm.location.toLowerCase().includes(searchTerm)) ||
        (farm.address && farm.address.toLowerCase().includes(searchTerm)) ||
        (farm.company?.name && farm.company.name.toLowerCase().includes(searchTerm))
      );
    }

    // Location filter
    if (this.filters.location) {
      const location = this.filters.location.toLowerCase();
      filtered = filtered.filter(farm =>
        (farm.location && farm.location.toLowerCase().includes(location)) ||
        (farm.address && farm.address.toLowerCase().includes(location))
      );
    }

    // Area range filter
    if (this.filters.minArea !== undefined) {
      filtered = filtered.filter(farm => (farm.area || 0) >= this.filters.minArea!);
    }
    if (this.filters.maxArea !== undefined) {
      filtered = filtered.filter(farm => (farm.area || 0) <= this.filters.maxArea!);
    }

    // Soil type filter
    if (this.filters.soilType) {
      filtered = filtered.filter(farm => farm.soilType === this.filters.soilType);
    }

    // Climate filter
    if (this.filters.climate) {
      filtered = filtered.filter(farm => farm.climate === this.filters.climate);
    }

    // Company filter
    if (this.filters.companyId) {
      filtered = filtered.filter(farm => farm.companyId === this.filters.companyId);
    }

    // Active status filter - NOW PROPERLY MAPPED
    if (this.filters.onlyActive !== undefined) {
      console.log('Applying active filter:', this.filters.onlyActive);
      console.log('Farms before active filter:', filtered.map(f => ({ name: f.name, isActive: f.isActive })));
      filtered = filtered.filter(farm => farm.isActive === this.filters.onlyActive);
      console.log('Farms after active filter:', filtered.map(f => ({ name: f.name, isActive: f.isActive })));
    }

    this.filteredFarms = filtered;
    this.totalRecords = filtered.length;
    this.currentPage = 1;

    console.log('Final filtered farms:', this.filteredFarms);
    console.log('Total records:', this.totalRecords);
  }

  onFilterChange(): void {
    console.log('Filter changed, reapplying filters');
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      onlyActive: true,
      searchTerm: '',
      location: '',
      minArea: undefined,
      maxArea: undefined,
      hasActiveProductions: undefined,
      soilType: '',
      climate: ''
    };
    this.applyFilters();
  }

  // CRUD Operations
  showCreateForm(): void {
    this.selectedFarm = null;
    this.isEditMode = false;
    this.isFormVisible = true;
    this.farmForm.reset({
      isActive: true
    });
  }

  showEditForm(farm: Farm): void {
    this.selectedFarm = farm;
    this.isEditMode = true;
    this.isFormVisible = true;

    this.farmForm.patchValue({
      name: farm.name,
      description: farm.description || '',
      companyId: farm.companyId,
      location: farm.location || '',
      address: farm.address || '',
      area: farm.area || '',
      latitude: farm?.latitude || '',
      longitude: farm?.longitude || '',
      climate: farm.climate || '',
      soilType: farm.soilType || '',
      isActive: farm.isActive
    });
  }

  hideForm(): void {
    this.isFormVisible = false;
    this.selectedFarm = null;
    this.isEditMode = false;
    this.farmForm.reset();
    this.clearMessages();
  }

  submitForm(): void {
    if (this.farmForm.valid) {
      console.log('Form is valid, preparing to submit:', this.farmForm.value);
      const formValue = this.farmForm.value;
      const farmData: any = {
        name: formValue.name,
        description: formValue.description,
        companyId: parseInt(formValue.companyId),
        location: formValue.location,
        address: formValue.address,
        area: formValue.area ? parseFloat(formValue.area) : undefined,
        latitude: parseFloat(formValue.latitude),
        longitude: parseFloat(formValue.longitude),
        climate: formValue.climate,
        soilType: formValue.soilType,
        isActive: formValue.isActive
      };

      console.log('Submitting form with data:', farmData);

      if (this.isEditMode && this.selectedFarm) {
        this.updateFarm(farmData);
      } else {
        this.createFarm(farmData as any);
      }
    } else {
      console.log('Form is invalid:', this.farmForm.errors);
      this.markFormGroupTouched();
    }
  }

  createFarm(farmData: any): void {
    this.isLoading = true;
    this.clearMessages();

    console.log('Creating farm with data:', farmData);
    this.farmService.create(farmData)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al crear la finca';
          console.error('Error creating farm:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(farm => {
        if (farm) {
          this.successMessage = 'Finca creada exitosamente';
          this.hideForm();
          this.loadFarms();
        }
      });
  }

  updateFarm(farmData: any): void {
    this.isLoading = true;
    this.clearMessages();

    this.farmService.update(farmData)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al actualizar la finca';
          console.error('Error updating farm:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(farm => {
        if (farm) {
          this.successMessage = 'Finca actualizada exitosamente';
          this.hideForm();
          this.loadFarms();
        }
      });
  }

  deleteFarm(farm: Farm): void {
    if (confirm(`¿Está seguro que desea eliminar la finca "${farm.name}"?`)) {
      this.isLoading = true;
      this.clearMessages();

      this.farmService.delete(farm.id)
        .pipe(
          catchError(error => {
            this.errorMessage = 'Error al eliminar la finca';
            console.error('Error deleting farm:', error);
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.successMessage = 'Finca eliminada exitosamente';
            this.loadFarms();
          }
        });
    }
  }

  toggleFarmStatus(farm: Farm): void {
    this.isLoading = true;
    this.clearMessages();

    this.farmService.toggleStatus(farm.id, !farm.isActive)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Error al cambiar el estado de la finca';
          console.error('Error toggling farm status:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(updatedFarm => {
        if (updatedFarm) {
          this.successMessage = `Finca ${updatedFarm.isActive ? 'activada' : 'desactivada'} exitosamente`;
          this.loadFarms();
        }
      });
  }

  // View methods
  viewDetails(farm: Farm): void {
    this.router.navigate(['/farms', farm.id]);
  }

  editFarm(farm: Farm): void {
    this.router.navigate(['/farms', farm.id, 'edit']);
  }

  // Utility methods
  private markFormGroupTouched(): void {
    Object.keys(this.farmForm.controls).forEach(key => {
      const control = this.farmForm.get(key);
      control?.markAsTouched();
      if (control && typeof control === 'object' && 'controls' in control) {
        Object.keys((control as any).controls).forEach(nestedKey => {
          (control as any).controls[nestedKey].markAsTouched();
        });
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.farmForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.farmForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} debe ser menor a ${field.errors['max'].max}`;
    }
    return '';
  }

  getCompanyName(companyId: number): string {
    const company = this.availableCompanies.find(c => c.id === companyId);
    return company?.name || 'Sin empresa';
  }

  getClimateLabel(climate: string): string {
    const climateType = this.climateTypes.find(c => c.value === climate);
    return climateType?.label || climate;
  }

  getSoilTypeLabel(soilType: string): string {
    const soil = this.soilTypes.find(s => s.value === soilType);
    return soil?.label || soilType;
  }

  // Pagination
  getPaginatedData(): Farm[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredFarms.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // Statistics
  getTotalCount(): number {
    return this.filteredFarms.length;
  }

  getActiveCount(): number {
    return this.filteredFarms.filter(farm => farm.isActive).length;
  }

  getInactiveCount(): number {
    return this.filteredFarms.filter(farm => !farm.isActive).length;
  }

  getTotalArea(): number {
    return this.filteredFarms.reduce((sum, farm) => sum + (farm.area || 0), 0);
  }

  getAverageArea(): number {
    const total = this.getTotalArea();
    const count = this.getTotalCount();
    return count > 0 ? total / count : 0;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}