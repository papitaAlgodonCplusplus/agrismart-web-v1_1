import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GrowthStage } from '../models/aggregation.models';
import { CropPhaseService, CropPhase } from '../../crop-phases/services/crop-phase.service';

@Injectable({
  providedIn: 'root'
})
export class GrowthStageCalculatorService {

  constructor(private cropPhaseService: CropPhaseService) { }

  /**
   * Convert CropPhase array to GrowthStage array
   */
  private convertCropPhasesToGrowthStages(cropPhases: CropPhase[]): GrowthStage[] {
    // Default colors and icons for different stage types
    const stageColors = ['#8B4513', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#6610f2'];
    const stageIcons = ['bi-seed', 'bi-tree', 'bi-flower1', 'bi-apple', 'bi-basket', 'bi-sun', 'bi-stars'];

    // Sort by sequence or starting week
    const sortedPhases = cropPhases
      .filter(phase => phase.active)
      .sort((a, b) => {
        if (a.sequence !== undefined && b.sequence !== undefined) {
          return a.sequence - b.sequence;
        }
        return (a.startingWeek || 0) - (b.startingWeek || 0);
      });

    return sortedPhases.map((phase, index) => {
      // Convert weeks to days (assuming 7 days per week)
      const startDay = (phase.startingWeek || 0) * 7;
      const endDay = (phase.endingWeek || phase.startingWeek || 0) * 7 + 6;

      return {
        id: phase.id,
        name: phase.name,
        startDay: startDay,
        endDay: endDay,
        color: stageColors[index % stageColors.length],
        icon: stageIcons[index % stageIcons.length],
        description: phase.description || ''
      };
    });
  }

  /**
   * Get all growth stages from API by crop ID
   */
  getGrowthStages(cropId?: number): Observable<GrowthStage[]> {
    if (!cropId) {
      console.warn('No cropId provided, returning empty growth stages array');
      return of([]);
    }

    return this.cropPhaseService.getByCropId(cropId, false).pipe(
      map(cropPhases => {
        if (cropPhases && cropPhases.length > 0) {
          return this.convertCropPhasesToGrowthStages(cropPhases);
        }
        console.warn(`No crop phases found for cropId ${cropId}`);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching crop phases:', error);
        throw error;
      })
    );
  }

  /**
   * Get all growth stages from API (all crops)
   */
  getAllGrowthStages(): Observable<GrowthStage[]> {
    return this.cropPhaseService.getAll().pipe(
      map(cropPhases => {
        if (cropPhases && cropPhases.length > 0) {
          return this.convertCropPhasesToGrowthStages(cropPhases);
        }
        console.warn('No crop phases found');
        return [];
      }),
      catchError(error => {
        console.error('Error fetching all crop phases:', error);
        throw error;
      })
    );
  }

  /**
   * Determine which growth stage a given date falls into
   */
  getGrowthStageForDate(
    date: Date,
    plantingDate: Date,
    stages: GrowthStage[]
  ): GrowthStage | undefined {
    if (!stages || stages.length === 0) {
      console.warn('No growth stages provided');
      return undefined;
    }

    const daysAfterPlanting = this.getDaysAfterPlanting(date, plantingDate);

    // Find the stage that contains this day
    const stage = stages.find(s =>
      daysAfterPlanting >= s.startDay && daysAfterPlanting <= s.endDay
    );

    // Return the stage or undefined if not found
    return stage;
  }

  /**
   * Get all dates that belong to a specific growth stage
   */
  getDatesInStage(
    stage: GrowthStage,
    plantingDate: Date,
    availableDates: Date[]
  ): Date[] {
    return availableDates.filter(date => {
      const daysAfter = this.getDaysAfterPlanting(date, plantingDate);
      return daysAfter >= stage.startDay && daysAfter <= stage.endDay;
    });
  }

  /**
   * Calculate days after planting
   */
  getDaysAfterPlanting(currentDate: Date, plantingDate: Date): number {
    const diffTime = currentDate.getTime() - plantingDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the week number for a given date relative to planting
   */
  getWeekNumber(date: Date, plantingDate: Date): number {
    const daysAfter = this.getDaysAfterPlanting(date, plantingDate);
    return Math.floor(daysAfter / 7) + 1; // Week 1, 2, 3, etc.
  }

  /**
   * Group dates by week
   */
  groupDatesByWeek(dates: Date[], plantingDate: Date): Map<number, Date[]> {
    const weekMap = new Map<number, Date[]>();

    dates.forEach(date => {
      const weekNum = this.getWeekNumber(date, plantingDate);
      if (!weekMap.has(weekNum)) {
        weekMap.set(weekNum, []);
      }
      weekMap.get(weekNum)!.push(date);
    });

    return weekMap;
  }

  /**
   * Get week label
   */
  getWeekLabel(weekNumber: number): string {
    return `Semana ${weekNumber}`;
  }

  /**
   * Get date range for a week
   */
  getWeekDateRange(weekNumber: number, plantingDate: Date): { start: Date; end: Date } {
    const startDay = (weekNumber - 1) * 7;
    const endDay = startDay + 6;

    const startDate = new Date(plantingDate);
    startDate.setDate(startDate.getDate() + startDay);

    const endDate = new Date(plantingDate);
    endDate.setDate(endDate.getDate() + endDay);

    return { start: startDate, end: endDate };
  }

  /**
   * Get progress within current growth stage
   */
  getStageProgress(
    currentDate: Date,
    plantingDate: Date,
    stage: GrowthStage
  ): number {
    const daysAfterPlanting = this.getDaysAfterPlanting(currentDate, plantingDate);
    const daysIntoStage = daysAfterPlanting - stage.startDay;
    const stageDuration = stage.endDay - stage.startDay;

    return Math.min(100, Math.max(0, (daysIntoStage / stageDuration) * 100));
  }
}
