import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Dropper {
  id: number;
  catalogId: number;
  name: string;
  flowRate: number;
  active?: boolean;
  dateCreated?: Date;
  dateUpdated?: Date;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateDropperCommand {
  catalogId: number;
  name: string;
  flowRate: number;
  createdBy: number;
}

export interface UpdateDropperCommand {
  id: number;
  catalogId: number;
  name: string;
  flowRate: number;
  active: boolean;
  updatedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class DropperService {
  private apiUrl = `${environment.agronomicApiUrl}/Dropper`;

  constructor(private http: HttpClient) { }

  /**
   * Get all droppers
   * @param includeInactives - Include inactive records
   */
  getAll(includeInactives: boolean = false): Observable<any> {
    let params = new HttpParams();
    if (includeInactives) {
      params = params.set('IncludeInactives', includeInactives.toString());
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get dropper by ID
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get droppers by catalog ID
   */
  getByCatalogId(catalogId: number): Observable<any> {
    const params = new HttpParams().set('catalogId', catalogId.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Create new dropper
   */
  create(command: CreateDropperCommand): Observable<any> {
    return this.http.post<any>(this.apiUrl, command);
  }

  /**
   * Update existing dropper
   */
  update(command: UpdateDropperCommand): Observable<any> {
    return this.http.put<any>(this.apiUrl, command);
  }

  /**
   * Delete dropper
   */
  delete(id: number, deletedBy: number): Observable<any> {
    let params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { params });
  }
}
