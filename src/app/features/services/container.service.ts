import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Container {
  id: number;
  catalogId: number;
  name: string;
  containerTypeId: number;
  height: number;
  width: number;
  length: number;
  lowerDiameter: number;
  upperDiameter: number;
  active?: boolean;
  dateCreated?: Date;
  dateUpdated?: Date;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateContainerCommand {
  catalogId: number;
  name: string;
  containerTypeId: number;
  height: number;
  width: number;
  length: number;
  lowerDiameter: number;
  upperDiameter: number;
  createdBy: number;
}

export interface UpdateContainerCommand {
  id: number;
  catalogId: number;
  name: string;
  containerTypeId: number;
  height: number;
  width: number;
  length: number;
  lowerDiameter: number;
  upperDiameter: number;
  active: boolean;
  updatedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  private apiUrl = `${environment.agronomicApiUrl}/Container`;

  constructor(private http: HttpClient) { }

  /**
   * Get all containers
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
   * Get container by ID
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get containers by catalog ID
   */
  getByCatalogId(catalogId: number): Observable<any> {
    const params = new HttpParams().set('catalogId', catalogId.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Create new container
   */
  create(command: CreateContainerCommand): Observable<any> {
    return this.http.post<any>(this.apiUrl, command);
  }

  /**
   * Update existing container
   */
  update(command: UpdateContainerCommand): Observable<any> {
    return this.http.put<any>(this.apiUrl, command);
  }

  /**
   * Delete container
   */
  delete(id: number, deletedBy: number): Observable<any> {
    let params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { params });
  }
}
