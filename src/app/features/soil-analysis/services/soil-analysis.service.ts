import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  SoilAnalysis,
  SoilAnalysisResponse,
  SoilAnalysisApiResponse,
  SoilTextureInfo,
  AvailableNutrient,
  TextureValidation
} from '../models/soil-analysis.models';

@Injectable({
  providedIn: 'root'
})
export class SoilAnalysisService {
  private readonly baseEndpoint = '/SoilAnalysis';

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  /**
   * Get all soil analyses for a crop production
   */
  getByCropProduction(
    cropProductionId: number,
    includeInactive: boolean = true
  ): Observable<SoilAnalysisResponse[]> {
    let params = new HttpParams()
      .set('cropProductionId', cropProductionId.toString())
      .set('includeInactive', includeInactive.toString());

    return this.apiService.get<any>(this.baseEndpoint, params).pipe(
      map(response => {
        console.log('API Response for getByCropProduction:', response);

        return response;

      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get soil analysis by ID
   */
  getById(id: number): Observable<SoilAnalysisResponse> {
    return this.apiService.get<any>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => {
        if (response.success && response.result?.soilAnalysis) {
          return response.result.soilAnalysis;
        }
        throw new Error('Soil analysis not found');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get latest soil analysis for a crop production
   */
  getLatest(cropProductionId: number): Observable<SoilAnalysisResponse | null> {
    let params = new HttpParams().set('cropProductionId', cropProductionId.toString());

    return this.apiService.get<any>(`${this.baseEndpoint}/latest`, params).pipe(
      map(response => {
        if (response.success && response.result?.soilAnalysis) {
          return response.result.soilAnalysis;
        }
        return null;
      }),
      catchError(error => {
        // Return null instead of error for not found cases
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new soil analysis
   */
  create(soilAnalysis: SoilAnalysis): Observable<SoilAnalysisResponse> {
    return this.apiService.post<any>(this.baseEndpoint, soilAnalysis).pipe(
      map(response => {
        if (response.success && response.result) {
          return response.result;
        }
        throw new Error('Failed to create soil analysis');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update existing soil analysis
   */
  update(id: number, soilAnalysis: SoilAnalysis): Observable<SoilAnalysisResponse> {
    const updateData = { ...soilAnalysis, id: id };
    return this.apiService.put<any>(this.baseEndpoint, updateData).pipe(
      map(response => {
        if (response.success && response.result) {
          return response.result;
        }
        throw new Error('Failed to update soil analysis');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete soil analysis (soft delete)
   */
  delete(id: number): Observable<boolean> {
    return this.apiService.delete<any>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  /**
   * Get all soil texture classes (reference data)
   */
  getTextureClasses(): Observable<SoilTextureInfo[]> {
    return this.apiService.get<any>(`${this.baseEndpoint}/texture-classes`).pipe(
      map(response => {
        if (response.success && response.result?.textureClasses) {
          return response.result.textureClasses;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get available nutrients for a soil analysis
   */
  getAvailableNutrients(id: number): Observable<{ [key: string]: number }> {
    return this.apiService.get<any>(`${this.baseEndpoint}/${id}/available-nutrients`).pipe(
      map(response => {
        if (response.success && response.result?.availableNutrients) {
          return response.result.availableNutrients;
        }
        return {};
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validate soil texture percentages
   */
  validateTexture(
    sand: number,
    silt: number,
    clay: number
  ): Observable<TextureValidation> {
    let params = new HttpParams()
      .set('sand', sand.toString())
      .set('silt', silt.toString())
      .set('clay', clay.toString());

    return this.apiService.get<any>(`${this.baseEndpoint}/validate-texture`, params).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * Error handler
   */
  private handleError(error: any): Observable<never> {
    console.error('Soil Analysis Service Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error?.exception) {
      errorMessage = error.error.exception;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
