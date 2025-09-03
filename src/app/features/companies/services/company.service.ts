// src/app/features/companies/services/company.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Company } from '../../../core/models/models';

export interface CompanyFilters {
  onlyActive?: boolean;
  searchTerm?: string;
  hasActiveFarms?: boolean;
  location?: string;
  taxId?: string;
}

export interface CompanyCreateRequest {
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  taxId?: string;
  logo?: string;
  isActive?: boolean;
}

export interface CompanyUpdateRequest extends Partial<CompanyCreateRequest> {}

export interface CompanyStatistics {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalFarms: number;
  averageFarmsPerCompany: number;
  companiesWithActiveFarms: number;
  recentlyCreated: number; // created in last 30 days
  byLocation: {
    [location: string]: number;
  };
  growthTrend: {
    month: string;
    created: number;
    activated: number;
    deactivated: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly baseUrl = '/api/companies';

  constructor(
    private apiService: ApiService,
    private apiConfig: ApiConfigService,
    private http: HttpClient
  ) {}

  /**
   * Get all companies with optional filters
   */
  getAll(onlyActive?: boolean, filters?: CompanyFilters): Observable<Company[]> {
    let params = new HttpParams();

    // Handle legacy boolean parameter for backward compatibility
    if (onlyActive !== undefined) {
      params = params.set('onlyActive', onlyActive.toString());
    }

    // Handle new filters object
    if (filters) {
      if (filters.onlyActive !== undefined) {
        params = params.set('onlyActive', filters.onlyActive.toString());
      }
      if (filters.searchTerm) {
        params = params.set('searchTerm', filters.searchTerm);
      }
      if (filters.hasActiveFarms !== undefined) {
        params = params.set('hasActiveFarms', filters.hasActiveFarms.toString());
      }
      if (filters.location) {
        params = params.set('location', filters.location);
      }
      if (filters.taxId) {
        params = params.set('taxId', filters.taxId);
      }
    }

    return this.apiService.get<Company[]>(this.baseUrl, params);
  }

  /**
   * Get company by ID
   */
  getById(id: number): Observable<Company> {
    return this.apiService.get<Company>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new company
   */
  create(data: CompanyCreateRequest): Observable<Company> {
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.apiService.post<Company>(this.baseUrl, payload);
  }

  /**
   * Update company
   */
  update(id: number, data: CompanyUpdateRequest): Observable<Company> {
    return this.apiService.put<Company>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete company
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle company status
   */
  toggleStatus(id: number, isActive: boolean): Observable<Company> {
    const payload = { isActive };
    return this.apiService.put<Company>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Get active companies only
   */
  getActive(): Observable<Company[]> {
    return this.getAll(true);
  }

  /**
   * Search companies by name or tax ID
   */
  search(searchTerm: string): Observable<Company[]> {
    const filters: CompanyFilters = { searchTerm };
    return this.getAll(undefined, filters);
  }

  /**
   * Get companies with active farms
   */
  getWithActiveFarms(): Observable<Company[]> {
    const filters: CompanyFilters = { hasActiveFarms: true };
    return this.getAll(undefined, filters);
  }

  /**
   * Get company statistics
   */
  getStatistics(): Observable<CompanyStatistics> {
    return this.apiService.get<CompanyStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * Get companies by location
   */
  getByLocation(location: string): Observable<Company[]> {
    const filters: CompanyFilters = { location };
    return this.getAll(undefined, filters);
  }

  /**
   * Bulk update companies
   */
  bulkUpdate(ids: number[], data: Partial<CompanyUpdateRequest>): Observable<Company[]> {
    const payload = { ids, updateData: data };
    return this.apiService.put<Company[]>(`${this.baseUrl}/bulk-update`, payload);
  }

  /**
   * Export to Excel
   */
  exportToExcel(filters?: CompanyFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/export/excel`;
    
    return this.http.get(url, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Utility methods
   */
  formatTaxId(taxId: string): string {
    if (!taxId) return '';
    // Format tax ID with dashes (e.g., 123456789 -> 123-456-789)
    return taxId.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^[\+]?[0-9\-\(\)\s]+$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Data transformation methods
   */
  sortByName(companies: Company[], ascending: boolean = true): Company[] {
    return [...companies].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return ascending ? comparison : -comparison;
    });
  }

  sortByCreatedDate(companies: Company[], ascending: boolean = false): Company[] {
    return [...companies].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  filterByActiveStatus(companies: Company[], activeOnly: boolean = true): Company[] {
    return companies.filter(company => activeOnly ? company.isActive : !company.isActive);
  }

  groupByLocation(companies: Company[]): { [location: string]: Company[] } {
    return companies.reduce((groups, company) => {
      const location = this.extractLocationFromAddress(company.address) || 'Sin ubicación';
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(company);
      return groups;
    }, {} as { [location: string]: Company[] });
  }

  private extractLocationFromAddress(address?: string): string | null {
    if (!address) return null;
    // Simple extraction - in real implementation, you might use a more sophisticated parser
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : null;
  }

  /**
   * Private helper methods
   */
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Company Service Error:', error);
    throw error;
  }
}