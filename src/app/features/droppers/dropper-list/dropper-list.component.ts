import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropperService, Dropper, CreateDropperCommand, UpdateDropperCommand } from '../../services/dropper.service';
import { CatalogService } from '../../catalogs/services/catalog.service';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dropper-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './dropper-list.component.html',
  styleUrls: ['./dropper-list.component.css']
})
export class DropperListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  droppers: Dropper[] = [];
  catalogs: any[] = [];
  includeInactives = false;
  searchTerm = '';
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  formErrorMessage = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showViewModal = false;
  selectedDropper: Dropper | null = null;

  // Form
  dropperForm!: FormGroup;

  constructor(
    private dropperService: DropperService,
    private catalogService: CatalogService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadDroppers();
  }

  initForm(): void {
    this.dropperForm = this.fb.group({
      catalogId: [null, Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      flowRate: [null, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDroppers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dropperService.getAll(this.includeInactives).pipe(
      map((response: any) => {
        console.log('Raw droppers response:', response);
        if (!response.droppers) {
          console.warn('API returned undefined/null for droppers');
          this.droppers = [];
          return [];
        } 
        this.droppers = response.droppers;
        return response.droppers;
      }),
      catchError(error => {
        console.error('Error loading droppers:', error);
        this.errorMessage = 'Error al cargar los goteros';
        this.isLoading = false;
        return of([]);
      })
    ).subscribe(() => {
      this.isLoading = false;
    }); 
  }

  private loadCatalogs(): void {
    this.catalogService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (catalogs: any) => {
          this.catalogs = catalogs.catalogs || catalogs || [];
          console.log(`Loaded ${this.catalogs.length} catalogs`);
        },
        error: (error) => {
          console.error('Error loading catalogs:', error);
          this.errorMessage = 'Error al cargar el catálogo';
        }
      });
  }

  get filteredDroppers$(): Observable<Dropper[]> {
    if (!this.droppers) return of([]);

    return of(this.droppers).pipe(
      map(droppers => {
        if (!this.searchTerm.trim()) return droppers;

        const search = this.searchTerm.toLowerCase();
        return droppers.filter(d =>
          d.name.toLowerCase().includes(search) ||
          d.flowRate.toString().includes(search) ||
          d.id.toString().includes(search)
        );
      })
    );
  }

  createNew(): void {
    this.selectedDropper = null;
    this.formErrorMessage = '';
    this.dropperForm.reset({
      catalogId: null,
      name: '',
      flowRate: null,
      active: true
    });
    this.showCreateModal = true;
  }

  view(dropper: Dropper): void {
    this.selectedDropper = dropper;
    this.showViewModal = true;
  }

  edit(dropper: Dropper): void {
    this.selectedDropper = dropper;
    this.formErrorMessage = '';

    this.dropperForm.patchValue({
      catalogId: dropper.catalogId,
      name: dropper.name,
      flowRate: dropper.flowRate,
      active: dropper.active
    });

    this.showEditModal = true;
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
    this.selectedDropper = null;
    this.formErrorMessage = '';
  }

  saveDropper(): void {
    if (this.dropperForm.invalid) {
      this.formErrorMessage = 'Por favor, complete todos los campos requeridos';
      Object.keys(this.dropperForm.controls).forEach(key => {
        this.dropperForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.formErrorMessage = '';

    const formValue = this.dropperForm.value;
    const currentUserId = this.getCurrentUserId();

    if (this.selectedDropper) {
      // Update existing dropper
      const updateData: UpdateDropperCommand = {
        id: this.selectedDropper.id,
        catalogId: formValue.catalogId,
        name: formValue.name,
        flowRate: formValue.flowRate,
        active: formValue.active,
        updatedBy: currentUserId
      };

      this.dropperService.update(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dropper) => {
            this.isSubmitting = false;
            this.onDropperSaved('Gotero actualizado correctamente');
            console.log('Dropper updated:', dropper);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.formErrorMessage = error.message || 'Error al actualizar el gotero';
            console.error('Update error:', error);
          }
        });
    } else {
      // Create new dropper
      const createData: CreateDropperCommand = {
        catalogId: formValue.catalogId,
        name: formValue.name,
        flowRate: formValue.flowRate,
        createdBy: currentUserId
      };

      console.log('Creating dropper with data:', createData);

      this.dropperService.create(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dropper) => {
            this.isSubmitting = false;
            this.onDropperSaved('Gotero creado correctamente');
            console.log('Dropper created:', dropper);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.formErrorMessage = error.message || 'Error al crear el gotero';
            console.error('Create error:', error);
          }
        });
    }
  }

  onDropperSaved(message: string): void {
    this.closeModal();
    this.successMessage = message;
    this.loadDroppers();

    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  delete(dropper: Dropper): void {
    if (confirm(`¿Está seguro de eliminar el gotero "${dropper.name}"?`)) {
      const currentUserId = this.getCurrentUserId();

      this.dropperService.delete(dropper.id, currentUserId).subscribe({
        next: () => {
          this.successMessage = 'Gotero eliminado correctamente';
          this.loadDroppers();
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error: any) => {
          this.errorMessage = 'Error al eliminar el gotero';
          console.error('Delete error:', error);
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      });
    }
  }

  trackByFn(index: number, dropper: Dropper): number {
    return dropper.id;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCatalogName(catalogId: number): string {
    const catalog = this.catalogs.find(c => c.id === catalogId);
    return catalog?.name || 'N/A';
  }

  private getCurrentUserId(): number {
    // Get from local storage or auth service
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  }

  toggleActiveFilter(): void {
    this.includeInactives = !this.includeInactives;
    this.loadDroppers();
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  getEmptyStateMessage(): string {
    if (this.searchTerm) {
      return 'No se encontraron goteros que coincidan con la búsqueda';
    }
    if (!this.includeInactives) {
      return 'No hay goteros activos registrados';
    }
    return 'No hay goteros registrados';
  }
}
