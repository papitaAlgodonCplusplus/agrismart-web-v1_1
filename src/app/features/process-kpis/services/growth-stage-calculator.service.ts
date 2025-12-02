import { Injectable } from '@angular/core';
import { GrowthStage, DEFAULT_GROWTH_STAGES } from '../models/aggregation.models';

@Injectable({
  providedIn: 'root'
})
export class GrowthStageCalculatorService {

  constructor() { }

  /**
   * Get all growth stages (can be customized per crop in future)
   */
  getGrowthStages(cropId?: number): GrowthStage[] {
    // TODO: In future, load crop-specific stages from API
    // For now, return default stages
    return DEFAULT_GROWTH_STAGES;
  }

  /**
   * Determine which growth stage a given date falls into
   */
  getGrowthStageForDate(
    date: Date,
    plantingDate: Date,
    stages: GrowthStage[] = DEFAULT_GROWTH_STAGES
  ): GrowthStage {
    const daysAfterPlanting = this.getDaysAfterPlanting(date, plantingDate);

    // Find the stage that contains this day
    const stage = stages.find(s =>
      daysAfterPlanting >= s.startDay && daysAfterPlanting <= s.endDay
    );

    // If not found, return last stage (shouldn't happen with proper stage config)
    return stage || stages[stages.length - 1];
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
