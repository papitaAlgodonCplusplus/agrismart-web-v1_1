import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';

export interface ContainerType {
  id: number;
  name: string;
  formulaType: number;
  active?: boolean;
}

export interface CreateContainerTypeCommand {
  name: string;
  formulaType: number;
}

export interface UpdateContainerTypeCommand {
  id: number;
  name: string;
  formulaType: number;
  active: boolean;
}

export const FORMULA_TYPES = [
  { value: 1, label: 'Cónico (Troncocónico)' },
  { value: 2, label: 'Cilíndrico' },
  { value: 3, label: 'Cúbico' }
];

@Injectable({ providedIn: 'root' })
export class ContainerTypeService {
  private apiUrl = '/ContainerType';

  constructor(private http: ApiService) {}

  getAll(includeInactives = false): Observable<any> {
    const params = new HttpParams().set('IncludeInactives', includeInactives.toString());
    return this.http.get<any>(this.apiUrl, params);
  }

  create(command: CreateContainerTypeCommand): Observable<any> {
    return this.http.post<any>(this.apiUrl, command);
  }

  update(command: UpdateContainerTypeCommand): Observable<any> {
    return this.http.put<any>(this.apiUrl, command);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
