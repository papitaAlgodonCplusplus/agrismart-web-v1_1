import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DailyKPIOutput } from '../../services/calculations/kpi-orchestrator.service';
import {
  AggregatedPeriodKPIs,
  AggregationDataset,
  AggregationPeriod,
  GrowthStage
} from '../models/aggregation.models';
import { GrowthStageCalculatorService } from './growth-stage-calculator.service';

@Injectable({
  providedIn: 'root'
})
export class KpiAggregatorService {

  constructor(
    private growthStageService: GrowthStageCalculatorService
  ) { }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Aggregate daily KPIs by week
   */
  aggregateByWeek(
    dailyKPIs: DailyKPIOutput[],
    plantingDate: Date
  ): AggregationDataset {

    if (dailyKPIs.length === 0) {
      return this.createEmptyDataset('week');
    }

    // Group KPIs by week
    const weekGroups = this.groupByWeek(dailyKPIs, plantingDate);

    // Aggregate each week
    const periods: AggregatedPeriodKPIs[] = [];
    weekGroups.forEach((kpis, weekNumber) => {
      const aggregated = this.aggregatePeriod(kpis, 'week', weekNumber, plantingDate);
      periods.push(aggregated);
    });

    // Sort by start date
    periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return this.createDataset(periods, 'week', dailyKPIs, plantingDate);
  }

  /**
   * Aggregate daily KPIs by growth stage
   */
  aggregateByGrowthStage(
    dailyKPIs: DailyKPIOutput[],
    plantingDate: Date,
    cropId?: number
  ): Observable<AggregationDataset> {

    if (dailyKPIs.length === 0) {
      return new Observable(observer => {
        observer.next(this.createEmptyDataset('stage'));
        observer.complete();
      });
    }

    return this.growthStageService.getGrowthStages(cropId).pipe(
      map(stages => {
        // Group KPIs by growth stage
        const stageGroups = this.groupByGrowthStage(dailyKPIs, plantingDate, stages);

        // Aggregate each stage
        const periods: AggregatedPeriodKPIs[] = [];
        stageGroups.forEach((kpis, stage) => {
          if (kpis.length > 0) { // Only include stages with data
            const aggregated = this.aggregatePeriodWithStage(kpis, stage, plantingDate);
            periods.push(aggregated);
          }
        });

        // Sort by stage start day
        periods.sort((a, b) => {
          if (!a.growthStage || !b.growthStage) return 0;
          return a.growthStage.startDay - b.growthStage.startDay;
        });

        return this.createDataset(periods, 'stage', dailyKPIs, plantingDate);
      })
    );
  }

  /**
   * Get default chart configuration
   */
  getDefaultChartConfig() {
    return {
      chartType: 'groupedBar' as const,
      showIrrigation: true,
      showDrainage: true,
      showET: false,
      showCumulative: false,
      colors: {
        irrigation: '#007bff',
        drainage: '#dc3545',
        et: '#28a745',
        cumulative: '#6c757d'
      }
    };
  }

  // ==========================================================================
  // PRIVATE GROUPING METHODS
  // ==========================================================================

  private groupByWeek(
    dailyKPIs: DailyKPIOutput[],
    plantingDate: Date
  ): Map<number, DailyKPIOutput[]> {
    const weekMap = new Map<number, DailyKPIOutput[]>();

    dailyKPIs.forEach(kpi => {
      const weekNum = this.growthStageService.getWeekNumber(kpi.date, plantingDate);
      if (!weekMap.has(weekNum)) {
        weekMap.set(weekNum, []);
      }
      weekMap.get(weekNum)!.push(kpi);
    });

    return weekMap;
  }

  private groupByGrowthStage(
    dailyKPIs: DailyKPIOutput[],
    plantingDate: Date,
    stages: GrowthStage[]
  ): Map<GrowthStage, DailyKPIOutput[]> {
    const stageMap = new Map<GrowthStage, DailyKPIOutput[]>();

    // Initialize map with all stages
    stages.forEach(stage => stageMap.set(stage, []));

    // Group KPIs by stage
    dailyKPIs.forEach(kpi => {
      const stage = this.growthStageService.getGrowthStageForDate(
        kpi.date,
        plantingDate,
        stages
      );

      // Only add KPI if a matching stage was found
      if (stage) {
        stageMap.get(stage)?.push(kpi);
      }
    });

    return stageMap;
  }

  // ==========================================================================
  // PRIVATE AGGREGATION METHODS
  // ==========================================================================

  private aggregatePeriod(
    kpis: DailyKPIOutput[],
    periodType: AggregationPeriod,
    periodNumber: number,
    plantingDate: Date
  ): AggregatedPeriodKPIs {

    const sortedKPIs = kpis.sort((a, b) => a.date.getTime() - b.date.getTime());
    const startDate = sortedKPIs[0].date;
    const endDate = sortedKPIs[sortedKPIs.length - 1].date;
    const daysInPeriod = kpis.length;

    // Calculate irrigation aggregates
    const totalIrrigationVolume = kpis.reduce((sum, kpi) => sum + kpi.irrigation.totalVolume, 0);
    const numberOfEvents = kpis.reduce((sum, kpi) => sum + kpi.irrigation.metrics.length, 0);
    const totalDuration = kpis.reduce((sum, kpi) => sum + kpi.irrigation.totalDuration, 0);

    // Get crop metadata from first KPI
    const area = kpis[0].crop.area;
    const totalPlants = kpis[0].crop.totalPlants;

    // Calculate drainage aggregates
    const drainPercentages = kpis
      .filter(kpi => kpi.irrigation.averageDrainPercentage > 0)
      .map(kpi => kpi.irrigation.averageDrainPercentage);
    const averageDrainPercentage = drainPercentages.length > 0
      ? drainPercentages.reduce((sum, val) => sum + val, 0) / drainPercentages.length
      : 0;

    const totalDrainageVolume = totalIrrigationVolume * (averageDrainPercentage / 100);

    // Calculate climate aggregates
    const totalET = kpis.reduce((sum, kpi) => sum + (kpi.cropEvapoTranspiration || 0), 0);
    const averageET = totalET / daysInPeriod;
    const averageVPD = kpis.reduce((sum, kpi) => sum + kpi.climate.vaporPressureDeficit, 0) / daysInPeriod;
    const averageTemp = kpis.reduce((sum, kpi) => sum + kpi.climate.averageTemperature, 0) / daysInPeriod;
    const totalDegreeDays = kpis.reduce((sum, kpi) => sum + kpi.climate.degreesDay, 0);

    return {
      periodType,
      periodLabel: this.getPeriodLabel(periodType, periodNumber),
      startDate,
      endDate,
      daysInPeriod,

      irrigation: {
        totalVolume: totalIrrigationVolume,
        totalVolumePerPlant: totalIrrigationVolume / totalPlants,
        totalVolumePerM2: totalIrrigationVolume / area,
        averageDailyVolume: totalIrrigationVolume / daysInPeriod,
        numberOfEvents: numberOfEvents,
        averageEventVolume: numberOfEvents > 0 ? totalIrrigationVolume / numberOfEvents : 0,
        averageDuration: numberOfEvents > 0 ? totalDuration / numberOfEvents : 0
      },

      drainage: {
        totalVolume: totalDrainageVolume,
        totalVolumePerPlant: totalDrainageVolume / totalPlants,
        totalVolumePerM2: totalDrainageVolume / area,
        averageDrainPercentage: averageDrainPercentage
      },

      climate: {
        averageET: averageET,
        totalET: totalET,
        averageVPD: averageVPD,
        averageTemperature: averageTemp,
        totalDegreeDays: totalDegreeDays
      },

      efficiency: {
        waterUseEfficiency: totalET > 0 ? totalIrrigationVolume / totalET : 0,
        drainageEfficiency: averageDrainPercentage
      }
    };
  }

  private aggregatePeriodWithStage(
    kpis: DailyKPIOutput[],
    stage: GrowthStage,
    plantingDate: Date
  ): AggregatedPeriodKPIs {
    const aggregated = this.aggregatePeriod(kpis, 'stage', stage.id, plantingDate);
    aggregated.growthStage = stage;
    aggregated.periodLabel = stage.name;
    return aggregated;
  }

  // ==========================================================================
  // PRIVATE UTILITY METHODS
  // ==========================================================================

  private getPeriodLabel(periodType: AggregationPeriod, periodNumber: number): string {
    switch (periodType) {
      case 'week':
        return `Semana ${periodNumber}`;
      case 'month':
        return `Mes ${periodNumber}`;
      case 'day':
        return `Día ${periodNumber}`;
      default:
        return `Periodo ${periodNumber}`;
    }
  }

  private createDataset(
    periods: AggregatedPeriodKPIs[],
    aggregationPeriod: AggregationPeriod,
    dailyKPIs: DailyKPIOutput[],
    plantingDate: Date
  ): AggregationDataset {

    const totalIrrigationVolume = periods.reduce((sum, p) => sum + p.irrigation.totalVolume, 0);
    const totalDrainageVolume = periods.reduce((sum, p) => sum + p.drainage.totalVolume, 0);
    const totalET = periods.reduce((sum, p) => sum + (p.climate?.totalET || 0), 0);
    const averageDrainPercentage = periods.reduce((sum, p) => sum + p.drainage.averageDrainPercentage, 0) / periods.length;

    // Get metadata from first KPI
    const firstKPI = dailyKPIs[0];

    return {
      cropProductionId: firstKPI.cropProductionId,
      plantingDate,
      aggregationPeriod,
      periods,
      totals: {
        totalIrrigationVolume,
        totalDrainageVolume,
        totalET,
        averageDrainPercentage
      },
      metadata: {
        totalPlants: firstKPI.crop.totalPlants,
        area: firstKPI.crop.area,
        containerVolume: firstKPI.crop.containerVolume?.value || 0
      }
    };
  }

  private createEmptyDataset(aggregationPeriod: AggregationPeriod): AggregationDataset {
    return {
      cropProductionId: 0,
      plantingDate: new Date(),
      aggregationPeriod,
      periods: [],
      totals: {
        totalIrrigationVolume: 0,
        totalDrainageVolume: 0,
        totalET: 0,
        averageDrainPercentage: 0
      },
      metadata: {
        totalPlants: 0,
        area: 0,
        containerVolume: 0
      }
    };
  }
}
