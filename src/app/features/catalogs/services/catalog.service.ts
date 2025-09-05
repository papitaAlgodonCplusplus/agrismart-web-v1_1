// src/app/features/catalogs/services/catalog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiConfigService } from '../../../core/services/api-config.service';

export interface Catalog {
    id: number;
    name: string;
    description?: string;
    clientId: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
}) export class CatalogService {
    constructor(
        private apiService: ApiService,
        private apiConfig: ApiConfigService,
        private http: HttpClient
    ) {
        console.log('agronomicApiUrl:', this.apiConfig.agronomicApiUrl);
    }

    getAll(clientId: number = 0): Observable<Catalog[]> {
        const params = new HttpParams().set('ClientId', clientId.toString());
        console.log('Making request to: /Catalog with params:', params.toString());

        // Pass just the endpoint path, not the full URL
        return this.apiService.get<Catalog[]>('/Catalog', params);
    }

    getById(id: number): Observable<Catalog> {  // Fixed typo
        return this.apiService.get<Catalog>(`/Catalog/${id}`);
    }

    getByClientId(clientId: number): Observable<Catalog[]> {
        const params = new HttpParams().set('ClientId', clientId.toString());
        return this.apiService.get<Catalog[]>('/Catalog', params);
    }

    create(data: Partial<Catalog>): Observable<Catalog> {
        return this.apiService.post<Catalog>('/Catalog', data);
    }

    update(id: number, data: Partial<Catalog>): Observable<Catalog> {
        return this.apiService.put<Catalog>(`/Catalog/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.apiService.delete<void>(`/Catalog/${id}`);
    }

    /**
     * Get current user's default catalog
     * This assumes you have a way to get the current user's clientId
     */
    getCurrentUserCatalog(): Observable<Catalog[]> {
        // You'll need to implement this based on how you get the current user's clientId
        // For now, this is a placeholder that you can modify based on your auth system
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.clientId) {
            return this.getByClientId(currentUser.clientId);
        }
        return this.getAll();
    }

    /**
     * Helper method to get current user - implement this based on your auth system
     */
    private getCurrentUser(): { clientId: number } | null {
        // This is a placeholder - implement based on your authentication system
        // You might get this from localStorage, a user service, or auth service
        try {
            const userData = localStorage.getItem('user_data');
            if (userData) {
                const user = JSON.parse(userData);
                return { clientId: user.clientId };
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
        return null;
    }
}