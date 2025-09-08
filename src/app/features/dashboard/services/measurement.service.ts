// src/app/features/dashboard/services/measurement.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface MeasurementVariable {
  id: number;
  name: string;
  catalogId: number;
  measurementUnitId: number;
  measurementVariableStandardId?: number;
  active: boolean;
  measurementUnit?: {
    id: number;
    name: string;
    symbol: string;
    active: boolean;
  };
}

export interface MeasurementData {
  id: number;
  cropProductionId: number;
  measurementVariableId: number;
  recordDate: string;
  avgValue: number;
  minValue: number;
  maxValue: number;
  sumValue: number;
}

export interface MeasurementBase {
  id: number;
  cropProductionId: number;
  measurementVariableId: number;
  recordDate: string;
  value: number;
  measurementVariable?: MeasurementVariable;
}

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  constructor(private apiService: ApiService) {}

  /**
   * Get measurement variables by catalog ID
   * Endpoint: /MeasurementVariable?CatalogId={catalogId}
   */
  getMeasurementVariables(catalogId: number): Observable<MeasurementVariable[]> {
    const params = new HttpParams() //.set('CatalogId', catalogId.toString());
    return this.apiService.get<MeasurementVariable[]>(`/MeasurementVariable`, params);
  }

  /**
   * Get historical measurement data
   * Endpoint: /Measurement?CropProductionId={id}&MeasurementVariableId={varId}&PeriodStartingDate={start}&PeriodEndingDate={end}
   */
  getMeasurements(
    cropProductionId: number,
    measurementVariableId: number,
    periodStartingDate: string,
    periodEndingDate: string
  ): Observable<MeasurementData[]> {
    const params = new HttpParams()
      .set('CropProductionId', cropProductionId.toString())
      .set('MeasurementVariableId', measurementVariableId.toString())
      .set('PeriodStartingDate', periodStartingDate)
      .set('PeriodEndingDate', periodEndingDate);

    return this.apiService.get<MeasurementData[]>(`/Measurement`, params);
  }

  /**
   * Get recent climate data (last 24 hours)
   * Endpoint: /MeasurementBase?CropProductionId={id}&MeasurementVariableId={varId}&PeriodStartingDate={start}&PeriodEndingDate={end}
   */
  getMeasurementBase(
    cropProductionId: number,
    measurementVariableId: number,
    periodStartingDate: string,
    periodEndingDate: string
  ): Observable<MeasurementBase[]> {
    const params = new HttpParams()
      .set('CropProductionId', cropProductionId.toString())
      .set('MeasurementVariableId', measurementVariableId.toString())
      .set('PeriodStartingDate', periodStartingDate)
      .set('PeriodEndingDate', periodEndingDate);

    return this.apiService.get<MeasurementBase[]>(`/MeasurementBase`, params);
  }

  /**
   * Get measurements for multiple variables at once
   */
  getMeasurementsForMultipleVariables(
    cropProductionId: number,
    measurementVariableIds: number[],
    periodStartingDate: string,
    periodEndingDate: string
  ): Observable<MeasurementData[]> {
    const params = new HttpParams()
      .set('CropProductionId', cropProductionId.toString())
      .set('MeasurementVariableIds', measurementVariableIds.join(','))
      .set('PeriodStartingDate', periodStartingDate)
      .set('PeriodEndingDate', periodEndingDate);

    return this.apiService.get<MeasurementData[]>(`/Measurement/Multiple`, params);
  }

  /**
   * Get measurement statistics for a time period
   */
  getMeasurementStatistics(
    cropProductionId: number,
    measurementVariableId: number,
    periodStartingDate: string,
    periodEndingDate: string
  ): Observable<{
    count: number;
    avgValue: number;
    minValue: number;
    maxValue: number;
    sumValue: number;
    standardDeviation: number;
  }> {
    const params = new HttpParams()
      .set('CropProductionId', cropProductionId.toString())
      .set('MeasurementVariableId', measurementVariableId.toString())
      .set('PeriodStartingDate', periodStartingDate)
      .set('PeriodEndingDate', periodEndingDate);

    return this.apiService.get(`/Measurement/Statistics`, params);
  }

  /**
   * Get latest measurements for dashboard
   */
  getLatestMeasurements(cropProductionId: number, limit: number = 10): Observable<MeasurementBase[]> {
    const params = new HttpParams()
      .set('CropProductionId', cropProductionId.toString())
      .set('Limit', limit.toString());

    return this.apiService.get<MeasurementBase[]>(`/MeasurementBase/Latest`, params);
  }

  /**
   * Get measurement trends analysis
   */
  getMeasurementTrends(
    cropProductionId: number,
    measurementVariableId: number,
    timeScale: 'hour' | 'day' | 'week' | 'month' = 'day',
    periods: number = 30
  ): Observable<{
    trend: 'increasing' | 'decreasing' | 'stable';
    trendValue: number;
    correlation: number;
    forecasts: { date: string; predictedValue: number; confidence: number }[];
  }> {
    const params = new HttpParams()
      .set('CropProductionId', cropProductionId.toString())
      .set('MeasurementVariableId', measurementVariableId.toString())
      .set('TimeScale', timeScale)
      .set('Periods', periods.toString());

    return this.apiService.get(`/Measurement/Trends`, params);
  }
}