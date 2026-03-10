import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Water {
  id?: number;
  catalogId?: number;
  name?: string;
  active?: boolean;
}

export interface WatersResponse {
  waters: Water[];
}

@Injectable({
  providedIn: 'root'
})
export class WaterService {
  private readonly baseUrl = '/Water';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<WatersResponse> {
    return this.apiService.get<WatersResponse>(this.baseUrl);
  }

  getById(id: number): Observable<Water> {
    return this.apiService.get<Water>(`${this.baseUrl}/${id}`);
  }

  create(data: { catalogId: number; name: string }): Observable<Water> {
    return this.apiService.post<Water>(this.baseUrl, data);
  }

  update(data: { id: number; name: string; active: boolean }): Observable<Water> {
    return this.apiService.put<Water>(this.baseUrl, data);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}
