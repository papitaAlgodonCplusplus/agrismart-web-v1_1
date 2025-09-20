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
        let params = new HttpParams().set('ClientId', clientId.toString());
        console.log('Making request to: /Catalog with params:', params.toString());

        // Pass just the endpoint path, not the full URL
        return this.apiService.get<Catalog[]>('/Catalog', params);
    }

    getById(id: number): Observable<Catalog> {  // Fixed typo
        return this.apiService.get<Catalog>(`/Catalog/${id}`);
    }

    getByClientId(clientId: number): Observable<Catalog[]> {
        console.log("Get by Client Id FERT: ", clientId)
        const params = new HttpParams().set('ClientId', clientId.toString());
        return this.apiService.get<Catalog[]>('/Catalog', params);
    }

    create(data: Partial<Catalog>): Observable<Catalog> {
        return this.apiService.post<Catalog>('/Catalog', data);
    }

    update( data: Partial<Catalog>): Observable<Catalog> {
        return this.apiService.put<Catalog>(`/Catalog`, data);
    }

    delete(id: number): Observable<void> {
        return this.apiService.delete<void>(`/Catalog/${id}`);
    }

    /**
     * Get current user's default catalog
     * This assumes you have a way to get the current user's clientId
     */
    getCurrentUserCatalog(user: any): Observable<any> {
        if (user && user['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid']) {
            return this.getByClientId(user['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid']);
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