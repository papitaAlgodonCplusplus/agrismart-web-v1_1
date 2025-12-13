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
  private apiUrl = `${environment.agronomicApiUrl}/CropProductionSpecs`;

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
