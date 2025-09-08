// src/app/features/dashboard/services/graph.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface GraphSeries {
  geomtype: 'Line' | 'Point' | 'Bar' | 'PointRange' | 'RefLine';
  measurementVariableId: number;
  axis: 'Primary' | 'Secondary';
  color: string;
  visible: boolean;
  createStats?: boolean;
  line_width?: number;
  line_type?: string;
  line_Transparency?: number;
  shape_type?: number;
  shape_size?: number;
  point_transparency?: number;
  bar_position?: string;
  bar_thickness?: number;
  bar_Transparency?: number;
  name?: string;
  yintercept?: number;
  [key: string]: any;
}

export interface GraphConfig {
  id: number;
  name: string;
  catalogId: number;
  summaryTimeScale: 'hour' | 'day' | 'week' | 'month' | 'daysOfGrowth' | 'weekOfGrowth' | 'monthOfGrowth';
  yAxisScaleType: 'auto' | 'cero';
  series: GraphSeries[];
  status: 'unmodified' | 'modified' | 'added';
  description?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GraphCreateRequest {
  name: string;
  catalogId: number;
  summaryTimeScale: 'hour' | 'day' | 'week' | 'month' | 'daysOfGrowth' | 'weekOfGrowth' | 'monthOfGrowth';
  yAxisScaleType: 'auto' | 'cero';
  description?: string;
  isDefault?: boolean;
  series: Omit<GraphSeries, 'id'>[];
}

export interface GraphUpdateRequest extends Partial<GraphCreateRequest> {
  status?: 'unmodified' | 'modified' | 'added';
}

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private baseUrl = '/Graph';

  constructor(private apiService: ApiService) { }

  /**
   * Get saved graph configurations by catalog ID
   * Endpoint: /Graph?CatalogId={catalogId}
   */
  getByCatalogId(catalogId: number): Observable<GraphConfig[]> {
    console.log('GraphService.getByCatalogId called with ID:', catalogId);
    const params = new HttpParams().set('CatalogId', catalogId.toString());
    return this.apiService.get<GraphConfig[]>(`/Graph`, params);
  }


  /**
   * Get all graphs
   */
  getAll(): Observable<GraphConfig[]> {
    return this.apiService.get<GraphConfig[]>(this.baseUrl);
  }

  /**
   * Get graph by ID
   */
  getById(id: number): Observable<GraphConfig> {
    return this.apiService.get<GraphConfig>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new graph configuration
   */
  create(graphData: GraphCreateRequest): Observable<GraphConfig> {
    return this.apiService.post<GraphConfig>(this.baseUrl, graphData);
  }

  /**
   * Update graph configuration
   */
  update(id: number, graphData: GraphUpdateRequest): Observable<GraphConfig> {
    return this.apiService.put<GraphConfig>(`${this.baseUrl}/${id}`, graphData);
  }

  /**
   * Delete graph configuration
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Clone graph configuration
   */
  clone(id: number, newName: string, catalogId?: number): Observable<GraphConfig> {
    const payload = {
      newName,
      ...(catalogId && { catalogId })
    };
    return this.apiService.post<GraphConfig>(`${this.baseUrl}/${id}/clone`, payload);
  }

  /**
   * Get default graphs for a catalog
   */
  getDefaultGraphs(catalogId: number): Observable<GraphConfig[]> {
    const params = new HttpParams()
      .set('CatalogId', catalogId.toString())
      .set('IsDefault', 'true');
    return this.apiService.get<GraphConfig[]>(this.baseUrl, params);
  }

  /**
   * Set graph as default
   */
  setAsDefault(id: number): Observable<GraphConfig> {
    return this.apiService.put<GraphConfig>(`${this.baseUrl}/${id}/set-default`, {});
  }

  /**
   * Get graph templates
   */
  getTemplates(): Observable<GraphConfig[]> {
    return this.apiService.get<GraphConfig[]>(`${this.baseUrl}/templates`);
  }

  /**
   * Create graph from template
   */
  createFromTemplate(templateId: number, catalogId: number, name: string): Observable<GraphConfig> {
    const payload = {
      templateId,
      catalogId,
      name
    };
    return this.apiService.post<GraphConfig>(`${this.baseUrl}/from-template`, payload);
  }

  /**
   * Validate graph configuration
   */
  validateConfiguration(graphData: GraphCreateRequest | GraphUpdateRequest): Observable<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return this.apiService.post(`${this.baseUrl}/validate`, graphData);
  }

  /**
   * Export graph configuration
   */
  exportConfiguration(id: number): Observable<Blob> {
    return this.apiService.getBlob(`${this.baseUrl}/${id}/export`);
  }

  /**
   * Import graph configuration
   */
  importConfiguration(file: File, catalogId: number): Observable<GraphConfig> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('catalogId', catalogId.toString());

    return this.apiService.post<GraphConfig>(`${this.baseUrl}/import`, formData);
  }

  /**
   * Get graphs by measurement variable
   */
  getByMeasurementVariable(measurementVariableId: number): Observable<GraphConfig[]> {
    const params = new HttpParams().set('MeasurementVariableId', measurementVariableId.toString());
    return this.apiService.get<GraphConfig[]>(`${this.baseUrl}/by-variable`, params);
  }

  /**
   * Get recommended graphs for crop production
   */
  getRecommendedGraphs(cropProductionId: number): Observable<GraphConfig[]> {
    const params = new HttpParams().set('CropProductionId', cropProductionId.toString());
    return this.apiService.get<GraphConfig[]>(`${this.baseUrl}/recommended`, params);
  }

  /**
   * Update graph series
   */
  updateSeries(graphId: number, series: GraphSeries[]): Observable<GraphConfig> {
    return this.apiService.put<GraphConfig>(`${this.baseUrl}/${graphId}/series`, { series });
  }

  /**
   * Add series to graph
   */
  addSeries(graphId: number, series: Omit<GraphSeries, 'id'>): Observable<GraphConfig> {
    return this.apiService.post<GraphConfig>(`${this.baseUrl}/${graphId}/series`, series);
  }

  /**
   * Remove series from graph
   */
  removeSeries(graphId: number, seriesId: number): Observable<GraphConfig> {
    return this.apiService.delete<GraphConfig>(`${this.baseUrl}/${graphId}/series/${seriesId}`);
  }

  /**
   * Get graph usage statistics
   */
  getUsageStatistics(catalogId?: number): Observable<{
    totalGraphs: number;
    mostUsedGraphs: { id: number; name: string; usageCount: number }[];
    graphsByTimeScale: { [key: string]: number };
    seriesDistribution: { [key: string]: number };
  }> {
    let params = new HttpParams();
    if (catalogId) {
      params = params.set('CatalogId', catalogId.toString());
    }
    return this.apiService.get(`${this.baseUrl}/usage-statistics`, params);
  }
}