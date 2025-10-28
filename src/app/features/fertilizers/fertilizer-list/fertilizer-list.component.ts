// src/app/features/fertilizers/fertilizer-list/fertilizer-list.component.ts - Part 1
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FertilizerService } from '../services/fertilizer.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CatalogService } from '../../catalogs/services/catalog.service';
import { Fertilizer } from '../../../core/models/models';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface EnhancedFertilizer extends Fertilizer {
  [key: string]: any;
}

interface FertilizerFilters {
  catalogId?: number;
  user?: any;
  onlyActive?: boolean;
  type?: string;
  searchTerm?: string;
  applicationMethod?: string;
  lowStock?: boolean;
  expiringWithin?: number; // days
  supplier?: string;
}

interface FertilizerAlert {
  type: 'warning' | 'danger' | 'info';
  message: string;
  count: number;
  items: EnhancedFertilizer[];
}

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
  // Data properties
  fertilizers: EnhancedFertilizer[] = [];
  filteredFertilizers: EnhancedFertilizer[] = [];
  availableCatalogs: any[] = [];
  selectedCatalogId: number | null = null;

  // Filter properties
  filters: FertilizerFilters = {
    onlyActive: true,
    searchTerm: '',
    type: '',
    applicationMethod: '',
    lowStock: false,
    expiringWithin: 0
  };

  // UI state
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentView: 'table' | 'cards' = 'table';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal properties
  showCreateModal = false;
  showDetailsModal = false;
  selectedFertilizer: EnhancedFertilizer | null = null;
  createForm: FormGroup;
  isCreating = false;

  // Alert properties
  alerts: FertilizerAlert[] = [];

  constructor(
    public authService: AuthService,
    public fertilizerService: FertilizerService,
    public catalogService: CatalogService,
    public router: Router,
    public fb: FormBuilder
  ) {
    this.createForm = this.initializeCreateForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  public initializeCreateForm(): FormGroup {
    return this.fb.group({
      catalogId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      manufacturer: ['', [Validators.required]],
      brand: [''],
      type: ['', [Validators.required]],
      description: [''],
      isLiquid: [false],
      concentration: [''],
      concentrationUnit: [''],
      applicationMethod: [''],
      nitrogenPercentage: ['', [Validators.min(0), Validators.max(100)]],
      phosphorusPercentage: ['', [Validators.min(0), Validators.max(100)]],
      potassiumPercentage: ['', [Validators.min(0), Validators.max(100)]],
      currentStock: ['', [Validators.min(0)]],
      minimumStock: ['', [Validators.min(0)]],
      stockUnit: [''],
      pricePerUnit: ['', [Validators.min(0)]],
      supplier: [''],
      expirationDate: [''],
      active: [true]
    });
  }

  public loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load catalogs first, then fertilizers
    this.catalogService.getAll().subscribe({
      next: (catalogs: any) => {
        console.log('Catalogs loaded:', catalogs);
        this.availableCatalogs = catalogs.catalogs || [];
        if (this.availableCatalogs.length > 0) {
          this.selectedCatalogId = this.availableCatalogs[0].id;
          this.filters.catalogId = this.selectedCatalogId !== null ? this.selectedCatalogId : undefined;
        }
        this.loadFertilizers();
      },
      error: (error) => {
        console.error('Error loading catalogs:', error);
        this.errorMessage = 'Error al cargar los catálogos';
        this.isLoading = false;
      }
    });
  }

  loadFertilizers(): void {
    if (!this.selectedCatalogId) {
      this.fertilizers = [];
      this.filteredFertilizers = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.fertilizerService.getFertilizersWithCatalogId(this.selectedCatalogId).subscribe({
      next: (response: any) => {
        // Handle different response structures
        let fertilizers = [];
        if (Array.isArray(response)) {
          fertilizers = response;
        } else if (response && response.result && Array.isArray(response.result.fertilizers)) {
          fertilizers = response.result.fertilizers;
        } else if (response && Array.isArray(response.fertilizers)) {
          fertilizers = response.fertilizers;
        }

        this.fertilizers = fertilizers.map((f: EnhancedFertilizer) => ({ ...f } as EnhancedFertilizer));
        this.applyFilters();
        this.generateAlerts();
        this.isLoading = false;
        console.log(`Loaded ${this.fertilizers.length} fertilizers`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los fertilizantes';
        console.error('Error loading fertilizers:', error);
      }
    });
  }

  public applyFilters(): void {
    let filtered = [...this.fertilizers];

    // Search filter
    if (this.filters.searchTerm?.trim()) {
      const searchLower = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        this.getProperty(f, 'name')?.toLowerCase().includes(searchLower) ||
        this.getProperty(f, 'brand')?.toLowerCase().includes(searchLower) ||
        this.getProperty(f, 'manufacturer')?.toLowerCase().includes(searchLower) ||
        this.getProperty(f, 'supplier')?.toLowerCase().includes(searchLower)
      );
    }

    // Active filter
    if (this.filters.onlyActive) {
      filtered = filtered.filter(f => this.getProperty(f, 'active') === true);
    }

    // Type filter
    if (this.filters.type) {
      if (this.filters.type === 'liquid') {
        filtered = filtered.filter(f => this.getProperty(f, 'isLiquid') === true);
      } else if (this.filters.type === 'solid') {
        filtered = filtered.filter(f => this.getProperty(f, 'isLiquid') === false);
      } else {
        filtered = filtered.filter(f => this.getProperty(f, 'type') === this.filters.type);
      }
    }

    // Application method filter
    if (this.filters.applicationMethod) {
      filtered = filtered.filter(f =>
        this.getProperty(f, 'applicationMethod') === this.filters.applicationMethod
      );
    }

    // Low stock filter
    if (this.filters.lowStock) {
      filtered = filtered.filter(f => this.isLowStock(f));
    }

    // Expiring filter
    if (this.filters.expiringWithin && this.filters.expiringWithin > 0) {
      filtered = filtered.filter(f => this.isExpiringWithin(f, this.filters.expiringWithin!));
    }

    // Supplier filter
    if (this.filters.supplier) {
      filtered = filtered.filter(f =>
        this.getProperty(f, 'supplier')?.toLowerCase().includes(this.filters.supplier!.toLowerCase())
      );
    }

    this.filteredFertilizers = filtered;
    this.applySorting();
  }

  public applySorting(): void {
    if (!this.sortField) return;

    this.filteredFertilizers.sort((a, b) => {
      const aValue = this.getProperty(a, this.sortField);
      const bValue = this.getProperty(b, this.sortField);

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }
  // src/app/features/fertilizers/fertilizer-list/fertilizer-list.component.ts - Part 2

  public generateAlerts(): void {
    this.alerts = [];

    // Low stock alerts
    const lowStockItems = this.fertilizers.filter(f => this.isLowStock(f));
    if (lowStockItems.length > 0) {
      this.alerts.push({
        type: 'warning',
        message: `${lowStockItems.length} fertilizante(s) con stock bajo`,
        count: lowStockItems.length,
        items: lowStockItems
      });
    }

    // Expiring items (within 30 days)
    const expiringItems = this.fertilizers.filter(f => this.isExpiringWithin(f, 30));
    if (expiringItems.length > 0) {
      this.alerts.push({
        type: 'warning',
        message: `${expiringItems.length} fertilizante(s) vencen en los próximos 30 días`,
        count: expiringItems.length,
        items: expiringItems
      });
    }

    // Expired items
    const expiredItems = this.fertilizers.filter(f => this.isExpired(f));
    if (expiredItems.length > 0) {
      this.alerts.push({
        type: 'danger',
        message: `${expiredItems.length} fertilizante(s) vencido(s)`,
        count: expiredItems.length,
        items: expiredItems
      });
    }
  }

  // Utility methods
  public getProperty(obj: any, key: string): any {
    return obj ? obj[key] : undefined;
  }

  public isLowStock(fertilizer: EnhancedFertilizer): boolean {
    const currentStock = this.getProperty(fertilizer, 'currentStock');
    const minimumStock = this.getProperty(fertilizer, 'minimumStock');
    return currentStock !== null && minimumStock !== null && currentStock <= minimumStock;
  }

  public isExpiringWithin(fertilizer: EnhancedFertilizer, days: number): boolean {
    const expirationDate = this.getProperty(fertilizer, 'expirationDate');
    if (!expirationDate) return false;

    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 && diffDays <= days;
  }

  public isExpired(fertilizer: EnhancedFertilizer): boolean {
    const expirationDate = this.getProperty(fertilizer, 'expirationDate');
    if (!expirationDate) return false;

    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  }

  // Display methods
  getFertilizerStatus(fertilizer: EnhancedFertilizer): string {
    if (!this.getProperty(fertilizer, 'active')) return 'inactive';
    if (this.isExpired(fertilizer)) return 'expired';
    if (this.isExpiringWithin(fertilizer, 30)) return 'expiring-soon';
    if (this.isLowStock(fertilizer)) return 'low-stock';
    return 'good';
  }

  getFertilizerStatusLabel(status: string): string {
    const labels = {
      'good': 'En buen estado',
      'low-stock': 'Stock bajo',
      'expiring-soon': 'Próximo a vencer',
      'expired': 'Vencido',
      'inactive': 'Inactivo'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getFertilizerStatusClass(status: string): string {
    const classes = {
      'good': 'bg-success',
      'low-stock': 'bg-warning',
      'expiring-soon': 'bg-warning',
      'expired': 'bg-danger',
      'inactive': 'bg-secondary'
    };
    return classes[status as keyof typeof classes] || 'bg-secondary';
  }

  calculateNPKRatio(fertilizer: EnhancedFertilizer): string {
    const n = this.getProperty(fertilizer, 'nitrogenPercentage') || 0;
    const p = this.getProperty(fertilizer, 'phosphorusPercentage') || 0;
    const k = this.getProperty(fertilizer, 'potassiumPercentage') || 0;

    if (n === 0 && p === 0 && k === 0) return '-';
    return `${n}-${p}-${k}`;
  }

  formatStock(fertilizer: EnhancedFertilizer): string {
    const stock = this.getProperty(fertilizer, 'currentStock');
    const unit = this.getProperty(fertilizer, 'stockUnit');
    if (stock === null || stock === undefined) return '-';
    return `${stock} ${unit || 'unidades'}`.trim();
  }

  formatPrice(fertilizer: EnhancedFertilizer): string {
    const price = this.getProperty(fertilizer, 'pricePerUnit');
    return price ? `$${price.toFixed(2)}` : '-';
  }

  // Action methods
  onCatalogChange(): void {
    this.filters.catalogId = this.selectedCatalogId !== null ? this.selectedCatalogId : undefined;
    this.loadFertilizers();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  clearFilters(): void {
    this.filters = {
      onlyActive: true,
      searchTerm: '',
      type: '',
      applicationMethod: '',
      lowStock: false,
      expiringWithin: 0,
      catalogId: this.selectedCatalogId !== null ? this.selectedCatalogId : undefined
    };
    this.sortField = '';
    this.sortDirection = 'asc';
    this.applyFilters();
  }

  toggleView(): void {
    this.currentView = this.currentView === 'table' ? 'cards' : 'table';
  }

  // Modal methods
  openCreateModal(): void {
    this.showCreateModal = true;
    this.createForm.reset({
      catalogId: this.selectedCatalogId,
      name: '',
      manufacturer: '',
      brand: '',
      type: '',
      description: '',
      isLiquid: false,
      active: true
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createForm.reset();
    this.isCreating = false;
  }

  openDetailsModal(fertilizer: EnhancedFertilizer): void {
    this.selectedFertilizer = { ...fertilizer };
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedFertilizer = null;
  }

  onSubmitCreate(): void {
    if (this.createForm.valid) {
      this.isCreating = true;

      const formData = this.createForm.value;

      // Clean up the data
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          formData[key] = null;
        }
      });

      this.fertilizerService.create(formData).subscribe({
        next: (fertilizer) => {
          this.successMessage = `Fertilizante "${this.getProperty(fertilizer, 'name')}" creado correctamente`;
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

  // CRUD operations
  createNew(): void {
    this.openCreateModal();
  }

  view(fertilizer: EnhancedFertilizer): void {
    this.openDetailsModal(fertilizer);
  }

  edit(fertilizer: EnhancedFertilizer): void {
    this.router.navigate(['/fertilizers', this.getProperty(fertilizer, 'id'), 'edit']);
  }

  delete(fertilizer: EnhancedFertilizer): void {
    const name = this.getProperty(fertilizer, 'name');
    if (confirm(`¿Está seguro de eliminar el fertilizante "${name}"?`)) {
      this.fertilizerService.delete(this.getProperty(fertilizer, 'id')).subscribe({
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

  duplicate(fertilizer: any): void {
    const duplicateData = { ...fertilizer };
    delete duplicateData.id;
    duplicateData.name = `${this.getProperty(fertilizer, 'name')} (Copia)`;

    this.fertilizerService.create(duplicateData).subscribe({
      next: () => {
        this.successMessage = 'Fertilizante duplicado correctamente';
        this.loadFertilizers();
      },
      error: (error) => {
        this.errorMessage = 'Error al duplicar el fertilizante';
        console.error('Duplicate error:', error);
      }
    });
  }

  // Export functionality
  exportToCSV(): void {
    const headers = [
      'ID', 'Nombre', 'Marca', 'Fabricante', 'Tipo', 'NPK', 'Stock Actual',
      'Stock Mínimo', 'Precio', 'Proveedor', 'Vencimiento', 'Estado'
    ];

    const csvData = this.filteredFertilizers.map(f => [
      this.getProperty(f, 'id') || '',
      this.getProperty(f, 'name') || '',
      this.getProperty(f, 'brand') || '',
      this.getProperty(f, 'manufacturer') || '',
      this.getProperty(f, 'type') || '',
      this.calculateNPKRatio(f),
      this.formatStock(f),
      this.getProperty(f, 'minimumStock') ?
        `${this.getProperty(f, 'minimumStock')} ${this.getProperty(f, 'stockUnit') || ''}`.trim() : '',
      this.formatPrice(f),
      this.getProperty(f, 'supplier') || '',
      this.getProperty(f, 'expirationDate') ?
        new Date(this.getProperty(f, 'expirationDate')).toLocaleDateString() : '',
      this.getFertilizerStatusLabel(this.getFertilizerStatus(f))
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fertilizantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Form validation methods
  public markFormGroupTouched(): void {
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
      if (field.errors['min']) return `${fieldName} no puede ser negativo`;
      if (field.errors['max']) return `${fieldName} no puede ser mayor a ${field.errors['max'].max}`;
    }
    return '';
  }

  // Statistics methods
  getTotalCount(): number {
    return this.fertilizers.length;
  }

  getLiquidCount(): number {
    return this.fertilizers.filter(f => this.getProperty(f, 'isLiquid')).length;
  }

  getSolidCount(): number {
    return this.fertilizers.filter(f => !this.getProperty(f, 'isLiquid')).length;
  }

  getActiveCount(): number {
    return this.fertilizers.filter(f => this.getProperty(f, 'active')).length;
  }

  getLowStockCount(): number {
    return this.fertilizers.filter(f => this.isLowStock(f)).length;
  }

  getExpiringCount(): number {
    return this.fertilizers.filter(f => this.isExpiringWithin(f, 30)).length;
  }

  // Utility methods
  getEmptyStateMessage(): string {
    if (this.filters.searchTerm) {
      return `No se encontraron fertilizantes con el término "${this.filters.searchTerm}"`;
    }
    if (this.filters.type === 'liquid') {
      return 'No hay fertilizantes líquidos registrados';
    }
    if (this.filters.type === 'solid') {
      return 'No hay fertilizantes sólidos registrados';
    }
    if (this.filters.lowStock) {
      return 'No hay fertilizantes con stock bajo';
    }
    return this.filters.onlyActive ? 'No hay fertilizantes activos registrados' : 'No hay fertilizantes registrados';
  }

  public trackByFn(index: number, item: any): any {
    return item && item.id ? item.id : index;
  }
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}