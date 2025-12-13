# Angular Frontend Implementation - CropProductionSpecs

Complete Angular implementation for managing Crop Production Specifications.

## File Structure
```
src/app/features/crop-production-specs/
├── services/
│   └── crop-production-specs.service.ts
├── crop-production-specs-list.component.ts
├── crop-production-specs-list.component.html
└── crop-production-specs-list.component.css
```

## Step 1: Create the Angular Service

**File: `src/app/features/crop-production-specs/services/crop-production-specs.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CropProductionSpecs {
  id: number;
  name: string;
  description?: string;
  betweenRowDistance: number;
  betweenContainerDistance: number;
  betweenPlantDistance: number;
  area: number;
  containerVolume: number;
  availableWaterPercentage: number;
  active: boolean;
  dateCreated?: Date;
  dateUpdated?: Date;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateCropProductionSpecsCommand {
  name: string;
  description?: string;
  betweenRowDistance: number;
  betweenContainerDistance: number;
  betweenPlantDistance: number;
  area: number;
  containerVolume: number;
  availableWaterPercentage: number;
  createdBy: number;
}

export interface UpdateCropProductionSpecsCommand {
  id: number;
  name: string;
  description?: string;
  betweenRowDistance: number;
  betweenContainerDistance: number;
  betweenPlantDistance: number;
  area: number;
  containerVolume: number;
  availableWaterPercentage: number;
  active: boolean;
  updatedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class CropProductionSpecsService {
  private apiUrl = `${environment.apiUrl}/CropProductionSpecs`;

  constructor(private http: HttpClient) { }

  getAll(includeInactives: boolean = false): Observable<any> {
    let params = new HttpParams();
    if (includeInactives) {
      params = params.set('IncludeInactives', includeInactives.toString());
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(command: CreateCropProductionSpecsCommand): Observable<any> {
    return this.http.post<any>(this.apiUrl, command);
  }

  update(command: UpdateCropProductionSpecsCommand): Observable<any> {
    return this.http.put<any>(this.apiUrl, command);
  }

  delete(id: number, deletedBy: number): Observable<any> {
    let params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { params });
  }
}
```

## Step 2: Create the Component TypeScript

**File: `src/app/features/crop-production-specs/crop-production-specs-list.component.ts`**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CropProductionSpecsService,
  CropProductionSpecs,
  CreateCropProductionSpecsCommand,
  UpdateCropProductionSpecsCommand
} from './services/crop-production-specs.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-crop-production-specs-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crop-production-specs-list.component.html',
  styleUrls: ['./crop-production-specs-list.component.css']
})
export class CropProductionSpecsListComponent implements OnInit {
  cropProductionSpecs: CropProductionSpecs[] = [];
  filteredSpecs: CropProductionSpecs[] = [];
  selectedSpecs: CropProductionSpecs | null = null;

  specsForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;
  errorMessage = '';

  includeInactives = false;
  searchTerm = '';

  // Sorting
  sortField: keyof CropProductionSpecs = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  currentUserId!: number;

  constructor(
    private specsService: CropProductionSpecsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    this.specsForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(500)],
      betweenRowDistance: [2.0, [Validators.required, Validators.min(0.01), Validators.max(100)]],
      betweenContainerDistance: [0.5, [Validators.required, Validators.min(0.01), Validators.max(100)]],
      betweenPlantDistance: [0.25, [Validators.required, Validators.min(0.01), Validators.max(100)]],
      area: [1000.0, [Validators.required, Validators.min(0.01), Validators.max(1000000)]],
      containerVolume: [10.0, [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      availableWaterPercentage: [50.0, [Validators.required, Validators.min(0), Validators.max(100)]],
      active: [true]
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.specsService.getAll(this.includeInactives).subscribe({
      next: (response) => {
        if (response.success && response.result) {
          this.cropProductionSpecs = response.result.cropProductionSpecs || [];
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading crop production specs:', error);
        this.errorMessage = 'Error al cargar las especificaciones de producción';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.cropProductionSpecs];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(specs =>
        specs.name.toLowerCase().includes(term) ||
        (specs.description && specs.description.toLowerCase().includes(term))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];

      if (aValue === undefined || bValue === undefined) return 0;

      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredSpecs = filtered;
    this.totalPages = Math.ceil(this.filteredSpecs.length / this.pageSize);
    this.currentPage = 1;
  }

  getPaginatedSpecs(): CropProductionSpecs[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredSpecs.slice(start, end);
  }

  sort(field: keyof CropProductionSpecs): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: keyof CropProductionSpecs): string {
    if (this.sortField !== field) return 'bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedSpecs = null;
    this.specsForm.reset({
      betweenRowDistance: 2.0,
      betweenContainerDistance: 0.5,
      betweenPlantDistance: 0.25,
      area: 1000.0,
      containerVolume: 10.0,
      availableWaterPercentage: 50.0,
      active: true
    });
    this.showModal = true;
  }

  openEditModal(specs: CropProductionSpecs): void {
    this.isEditMode = true;
    this.selectedSpecs = specs;
    this.specsForm.patchValue({
      name: specs.name,
      description: specs.description,
      betweenRowDistance: specs.betweenRowDistance,
      betweenContainerDistance: specs.betweenContainerDistance,
      betweenPlantDistance: specs.betweenPlantDistance,
      area: specs.area,
      containerVolume: specs.containerVolume,
      availableWaterPercentage: specs.availableWaterPercentage,
      active: specs.active
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSpecs = null;
    this.specsForm.reset();
  }

  saveSpecs(): void {
    if (this.specsForm.invalid) {
      Object.keys(this.specsForm.controls).forEach(key => {
        this.specsForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving = true;
    const formValue = this.specsForm.value;

    if (this.isEditMode && this.selectedSpecs) {
      const command: UpdateCropProductionSpecsCommand = {
        id: this.selectedSpecs.id,
        ...formValue,
        updatedBy: this.currentUserId
      };

      this.specsService.update(command).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadData();
            this.closeModal();
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating specs:', error);
          this.errorMessage = 'Error al actualizar las especificaciones';
          this.isSaving = false;
        }
      });
    } else {
      const command: CreateCropProductionSpecsCommand = {
        ...formValue,
        createdBy: this.currentUserId
      };

      this.specsService.create(command).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadData();
            this.closeModal();
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error creating specs:', error);
          this.errorMessage = 'Error al crear las especificaciones';
          this.isSaving = false;
        }
      });
    }
  }

  deleteSpecs(specs: CropProductionSpecs): void {
    if (!confirm(`¿Está seguro de eliminar "${specs.name}"?`)) {
      return;
    }

    this.specsService.delete(specs.id, this.currentUserId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadData();
        }
      },
      error: (error) => {
        console.error('Error deleting specs:', error);
        this.errorMessage = 'Error al eliminar las especificaciones';
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
```

Continue in next message with HTML and CSS...
