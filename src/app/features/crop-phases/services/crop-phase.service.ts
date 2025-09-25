// src/app/features/crop-phases/services/crop-phase.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfigService } from '../../../core/services/api-config.service';

// Backend response structure (matches your AgriSmart API)
interface BackendResponse<T> {
    success: boolean;
    exception: any;
    result: T;
}

export interface CropPhase {
    id: number;
    dateCreated?: Date;
    dateUpdated?: Date;
    createdBy?: number;
    updatedBy?: number;
    cropId: number;
    catalogId: number;
    name: string;
    description?: string;
    sequence?: number;
    startingWeek?: number;
    endingWeek?: number;
    startDate?: Date;
    endDate?: Date;
    active: boolean;
}

export interface CropPhaseCreateRequest {
    cropId: number;
    catalogId: number;
    name: string;
    description?: string;
    sequence?: number;
    startingWeek?: number;
    endingWeek?: number;
}

export interface CropPhaseUpdateRequest {
    id: number;
    cropId: number;
    catalogId: number;
    name: string;
    description?: string;
    sequence?: number;
    startingWeek?: number;
    endingWeek?: number;
    active: boolean;
}

export interface CropPhaseFilters {
    cropId?: number;
    catalogId?: number;
    includeInactives?: boolean;
    onlyActive?: boolean;
    searchTerm?: string;
}

export interface CropPhaseDeleteResponse {
    id: number;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class CropPhaseService {
    constructor(
        private apiConfig: ApiConfigService,
        private http: HttpClient
    ) { }

    // In crop-phase.service.ts, update the getAll method:
    getAll(filters?: CropPhaseFilters): Observable<CropPhase[]> {
        let params = new HttpParams();
        const headers = this.getAuthHeaders();

        if (filters) {
            if (filters.cropId !== undefined) {
                params = params.set('CropId', filters.cropId.toString());
            }
            if (filters.catalogId !== undefined) {
                params = params.set('CatalogId', filters.catalogId.toString());
            }
            if (filters.includeInactives !== undefined) {
                params = params.set('IncludeInactives', filters.includeInactives.toString());
            }
            if (filters.onlyActive !== undefined) {
                params = params.set('IncludeInactives', (!filters.onlyActive).toString());
            }
        }

        const url = `${this.apiConfig.agronomicApiUrl}/CropPhase`;

        return this.http.get<any>(url, { params, headers })
            .pipe(
                map(response => {
                    console.log('CropPhase getAll response:', response);

                    // Handle direct array response
                    if (Array.isArray(response)) {
                        return response;
                    }

                    // Handle wrapped response
                    if (response.success && response.result) {
                        return response.result.cropPhases || [];
                    }

                    // Handle other wrapped formats
                    if (response.cropPhases) {
                        return response.cropPhases;
                    }

                    throw new Error(`CropPhase API failed: ${response.exception || 'Unknown error'}`);
                }),
                catchError(error => {
                    console.error('CropPhaseService.getAll error:', error);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Get crop phase by ID - Backend: GET /CropPhase/{Id}
     */
    getById(id: number): Observable<CropPhase> {
        const url = `${this.apiConfig.agronomicApiUrl}/CropPhase/${id}`;

        return this.http.get<BackendResponse<CropPhase>>(url)
            .pipe(
                map(response => {
                    console.log('CropPhase getById response:', response);
                    if (response.success) {
                        return response.result;
                    }
                    throw new Error(`Get CropPhase by ID failed: ${response.exception}`);
                }),
                catchError(error => {
                    console.error('CropPhaseService.getById error:', error);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Create new crop phase - Backend: POST /CropPhase
     */
    create(data: CropPhaseCreateRequest): Observable<CropPhase> {
        const url = `${this.apiConfig.agronomicApiUrl}/CropPhase`;
        const headers = this.getAuthHeaders();

        return this.http.post<BackendResponse<CropPhase>>(url, data, { headers })
            .pipe(
                map(response => {
                    console.log('CropPhase create response:', response);
                    if (response.success) {
                        return response.result;
                    }
                    throw new Error(`Create CropPhase failed: ${response.exception}`);
                }),
                catchError(error => {
                    console.error('CropPhaseService.create error:', error);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Update crop phase - Backend: PUT /CropPhase
     */
    update(data: CropPhaseUpdateRequest): Observable<CropPhase> {
        const url = `${this.apiConfig.agronomicApiUrl}/CropPhase`;
        const headers = this.getAuthHeaders();

        return this.http.put<BackendResponse<CropPhase>>(url, data, { headers })
            .pipe(
                map(response => {
                    console.log('CropPhase update response:', response);
                    if (response.success) {
                        return response.result;
                    }
                    throw new Error(`Update CropPhase failed: ${response.exception}`);
                }),
                catchError(error => {
                    console.error('CropPhaseService.update error:', error);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Delete crop phase - Backend: DELETE /CropPhase/{Id}
     */
    delete(id: number): Observable<CropPhaseDeleteResponse> {
        const url = `${this.apiConfig.agronomicApiUrl}/CropPhase/${id}`;
        const headers = this.getAuthHeaders();

        return this.http.delete<BackendResponse<CropPhaseDeleteResponse>>(url, { headers })
            .pipe(
                map(response => {
                    console.log('CropPhase delete response:', response);
                    if (response.success) {
                        return response.result;
                    }
                    throw new Error(`Delete CropPhase failed: ${response.exception}`);
                }),
                catchError(error => {
                    console.error('CropPhaseService.delete error:', error);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Get crop phases by crop ID
     */
    getByCropId(cropId: number, includeInactives: boolean = false): Observable<CropPhase[]> {
        const filters: CropPhaseFilters = { cropId, includeInactives };
        return this.getAll(filters);
    }

    /**
     * Get crop phases by catalog ID
     */
    getByCatalogId(catalogId: number, includeInactives: boolean = false): Observable<CropPhase[]> {
        const filters: CropPhaseFilters = { catalogId, includeInactives };
        return this.getAll(filters);
    }

    /**
     * Get active crop phases only
     */
    getActive(): Observable<CropPhase[]> {
        const filters: CropPhaseFilters = { onlyActive: true };
        return this.getAll(filters);
    }

    /**
     * Toggle crop phase status
     */
    toggleStatus(phase: CropPhase): Observable<CropPhase> {
        const updateData: CropPhaseUpdateRequest = {
            ...phase,
            active: !phase.active
        };
        return this.update(updateData);
    }

    /**
     * Bulk operations
     */
    bulkDelete(ids: number[]): Observable<CropPhaseDeleteResponse[]> {
        const deleteRequests = ids.map(id => this.delete(id));
        return new Observable(observer => {
            Promise.all(deleteRequests.map(req => req.toPromise()))
                .then(results => {
                    observer.next(results as CropPhaseDeleteResponse[]);
                    observer.complete();
                })
                .catch(error => observer.error(error));
        });
    }

    bulkToggleStatus(phases: CropPhase[], newStatus: boolean): Observable<CropPhase[]> {
        const updateRequests = phases.map(phase => {
            const updateData: CropPhaseUpdateRequest = {
                ...phase,
                active: newStatus
            };
            return this.update(updateData);
        });

        return new Observable(observer => {
            Promise.all(updateRequests.map(req => req.toPromise()))
                .then(results => {
                    observer.next(results as CropPhase[]);
                    observer.complete();
                })
                .catch(error => observer.error(error));
        });
    }

    /**
     * Utility methods
     */
    sortBySequence(phases: CropPhase[], ascending: boolean = true): CropPhase[] {
        return [...phases].sort((a, b) => {
            const seqA = a.sequence || 0;
            const seqB = b.sequence || 0;
            return ascending ? seqA - seqB : seqB - seqA;
        });
    }

    sortByWeek(phases: CropPhase[], ascending: boolean = true): CropPhase[] {
        return [...phases].sort((a, b) => {
            const weekA = a.startingWeek || 0;
            const weekB = b.startingWeek || 0;
            return ascending ? weekA - weekB : weekB - weekA;
        });
    }

    sortByName(phases: CropPhase[], ascending: boolean = true): CropPhase[] {
        return [...phases].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return ascending ? comparison : -comparison;
        });
    }

    groupByCrop(phases: CropPhase[]): { [cropId: number]: CropPhase[] } {
        return phases.reduce((groups, phase) => {
            if (!groups[phase.cropId]) {
                groups[phase.cropId] = [];
            }
            groups[phase.cropId].push(phase);
            return groups;
        }, {} as { [cropId: number]: CropPhase[] });
    }

    groupByCatalog(phases: CropPhase[]): { [catalogId: number]: CropPhase[] } {
        return phases.reduce((groups, phase) => {
            if (!groups[phase.catalogId]) {
                groups[phase.catalogId] = [];
            }
            groups[phase.catalogId].push(phase);
            return groups;
        }, {} as { [catalogId: number]: CropPhase[] });
    }

    filterByActiveStatus(phases: CropPhase[], activeOnly: boolean = true): CropPhase[] {
        return phases.filter(phase => activeOnly ? phase.active : !phase.active);
    }

    filterByWeekRange(phases: CropPhase[], minWeek: number, maxWeek: number): CropPhase[] {
        return phases.filter(phase => {
            const startWeek = phase.startingWeek || 0;
            const endWeek = phase.endingWeek || startWeek;
            return startWeek >= minWeek && endWeek <= maxWeek;
        });
    }

    /**
     * Validation methods
     */
    validatePhaseSequence(phases: CropPhase[]): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const sortedPhases = this.sortBySequence(phases);

        // Check for duplicate sequences
        const sequences = sortedPhases.map(p => p.sequence).filter(s => s !== undefined);
        const uniqueSequences = [...new Set(sequences)];
        if (sequences.length !== uniqueSequences.length) {
            errors.push('Hay secuencias duplicadas en las fases del cultivo');
        }

        // Check for gaps in sequence
        for (let i = 1; i < uniqueSequences.length; i++) {
            if (uniqueSequences[i]! - uniqueSequences[i - 1]! > 1) {
                errors.push(`Hay un salto en la secuencia entre ${uniqueSequences[i - 1]} y ${uniqueSequences[i]}`);
            }
        }

        // Check week overlaps
        for (let i = 0; i < sortedPhases.length - 1; i++) {
            const current = sortedPhases[i];
            const next = sortedPhases[i + 1];

            if (current.endingWeek && next.startingWeek && current.endingWeek >= next.startingWeek) {
                errors.push(`La fase "${current.name}" se superpone con "${next.name}" en las semanas`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    calculatePhaseDuration(phase: CropPhase): number {
        if (!phase.startingWeek || !phase.endingWeek) return 0;
        return phase.endingWeek - phase.startingWeek + 1;
    }

    calculateTotalDuration(phases: CropPhase[]): number {
        const sortedPhases = this.sortBySequence(phases);
        if (sortedPhases.length === 0) return 0;

        const firstPhase = sortedPhases[0];
        const lastPhase = sortedPhases[sortedPhases.length - 1];

        if (!firstPhase.startingWeek || !lastPhase.endingWeek) return 0;

        return lastPhase.endingWeek - firstPhase.startingWeek + 1;
    }

    formatWeekRange(phase: CropPhase): string {
        if (!phase.startingWeek && !phase.endingWeek) return 'No especificado';
        if (phase.startingWeek && phase.endingWeek) {
            if (phase.startingWeek === phase.endingWeek) {
                return `Semana ${phase.startingWeek}`;
            }
            return `Semanas ${phase.startingWeek}-${phase.endingWeek}`;
        }
        if (phase.startingWeek) return `Desde semana ${phase.startingWeek}`;
        return `Hasta semana ${phase.endingWeek}`;
    }

    formatDuration(phase: CropPhase): string {
        const duration = this.calculatePhaseDuration(phase);
        if (duration === 0) return 'No especificado';
        if (duration === 1) return '1 semana';
        return `${duration} semanas`;
    }

    /**
     * Search and filter methods
     */
    searchByName(phases: CropPhase[], searchTerm: string): CropPhase[] {
        const term = searchTerm.toLowerCase();
        return phases.filter(phase =>
            phase.name.toLowerCase().includes(term) ||
            (phase.description && phase.description.toLowerCase().includes(term))
        );
    }

    /**
     * Export methods
     */
    exportToCSV(phases: CropPhase[]): string {
        const headers = [
            'ID', 'Nombre', 'Descripción', 'Cultivo ID', 'Catálogo ID',
            'Secuencia', 'Semana Inicio', 'Semana Fin', 'Duración', 'Estado'
        ];

        const csvData = phases.map(phase => [
            phase.id,
            phase.name,
            phase.description || '',
            phase.cropId,
            phase.catalogId,
            phase.sequence || '',
            phase.startingWeek || '',
            phase.endingWeek || '',
            this.calculatePhaseDuration(phase),
            phase.active ? 'Activo' : 'Inactivo'
        ]);

        return [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
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
        console.error('CropPhase Service Error:', error);

        let errorMessage = 'An unknown error occurred';
        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status) {
            errorMessage = `HTTP ${error.status}: ${error.statusText}`;
        }

        return throwError(() => new Error(errorMessage));
    }
}