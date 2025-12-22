// ============================================================================
// AGGREGATION DATA MODELS FOR WEEKLY/STAGE GROUPING
// ============================================================================

import { DailyKPIOutput } from '../../services/calculations/kpi-orchestrator.service';

/**
 * Time period types for aggregation
 */
export type AggregationPeriod = 'day' | 'week' | 'month' | 'stage';

/**
 * Growth stage definition
 */
export interface GrowthStage {
  id: number;
  name: string;
  startDay: number;        // Days after planting/transplanting
  endDay: number;
  color: string;
  icon: string;
  description: string;
}

/**
 * Aggregated KPIs for a specific time period
 */
export interface AggregatedPeriodKPIs {
  // Period identification
  periodType: AggregationPeriod;
  periodLabel: string;           // e.g., "Semana 3", "Etapa Vegetativa"
  startDate: Date;
  endDate: Date;
  daysInPeriod: number;

  // Growth stage info (if applicable)
  growthStage?: GrowthStage;

  // Irrigation aggregates
  irrigation: {
    totalVolume: number;              // L - sum of all irrigation events
    totalVolumePerPlant: number;      // L/plant
    totalVolumePerM2: number;         // L/m²
    averageDailyVolume: number;       // L/day average
    numberOfEvents: number;           // Count of irrigation events
    averageEventVolume: number;       // L/event average
    averageDuration: number;          // minutes/event average
  };

  // Drainage aggregates
  drainage: {
    totalVolume: number;              // L - sum of all drainage
    totalVolumePerPlant: number;      // L/plant
    totalVolumePerM2: number;         // L/m²
    averageDrainPercentage: number;   // % average
  };

  // Climate aggregates (optional)
  climate?: {
    averageET: number;                // mm/day
    totalET: number;                  // mm total
    averageVPD: number;               // kPa
    averageTemperature: number;       // °C
    totalDegreeDays: number;          // accumulated
  };

  // Efficiency metrics
  efficiency: {
    waterUseEfficiency: number;       // L water / L ET
    drainageEfficiency: number;       // % of applied water that drained
  };
}

/**
 * Complete aggregation dataset for visualization
 */
export interface AggregationDataset {
  cropProductionId: number;
  plantingDate: Date;
  aggregationPeriod: AggregationPeriod;
  periods: AggregatedPeriodKPIs[];

  // Totals across all periods
  totals: {
    totalIrrigationVolume: number;
    totalDrainageVolume: number;
    totalET: number;
    averageDrainPercentage: number;
  };

  // Crop production metadata
  metadata: {
    totalPlants: number;
    area: number;              // m²
    containerVolume: number;   // L
  };
}

/**
 * Chart configuration for aggregation visualizations
 */
export interface AggregationChartConfig {
  chartType: 'bar' | 'line' | 'stackedBar' | 'groupedBar';
  showIrrigation: boolean;
  showDrainage: boolean;
  showET: boolean;
  showCumulative: boolean;
  colors: {
    irrigation: string;
    drainage: string;
    et: string;
    cumulative: string;
  };
}

/**
 * Comparison between periods
 */
export interface PeriodComparison {
  period1: AggregatedPeriodKPIs;
  period2: AggregatedPeriodKPIs;
  differences: {
    irrigationVolumeDiff: number;          // L
    irrigationVolumePercentDiff: number;   // %
    drainPercentageDiff: number;           // percentage points
    numberOfEventsDiff: number;            // count
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}
 
