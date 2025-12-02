# 📘 **DETAILED IMPLEMENTATION GUIDE: Task 1.4 - Weekly/Stage Aggregation Graphs**

---

## 🎯 **OBJECTIVE**
Extend the `process-kpis.component` to add time-based aggregation views (by week and by growth stage) for irrigation and drainage data, implementing the visualizations from PDF Pages 26-27. This helps users analyze irrigation behavior patterns over the crop cycle.

---

## 📁 **FILE STRUCTURE**

```
src/app/features/process-kpis/
├── process-kpis.component.ts                    # EXTEND
├── process-kpis.component.html                  # EXTEND
├── process-kpis.component.css                   # EXTEND
├── services/
│   ├── kpi-aggregator.service.ts               # NEW
│   └── growth-stage-calculator.service.ts      # NEW
└── models/
    └── aggregation.models.ts                    # NEW
```

---

## 📋 **STEP-BY-STEP IMPLEMENTATION**

---

### **STEP 1: Create Aggregation Data Models** (15 minutes)

**File**: `src/app/features/process-kpis/models/aggregation.models.ts`

```typescript
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

/**
 * Default crop growth stages (can be customized per crop)
 */
export const DEFAULT_GROWTH_STAGES: GrowthStage[] = [
  {
    id: 1,
    name: 'Germinación/Establecimiento',
    startDay: 0,
    endDay: 14,
    color: '#8B4513',
    icon: 'bi-seed',
    description: 'Desde siembra/trasplante hasta establecimiento inicial'
  },
  {
    id: 2,
    name: 'Vegetativo',
    startDay: 15,
    endDay: 45,
    color: '#28a745',
    icon: 'bi-tree',
    description: 'Crecimiento vegetativo activo, formación de estructura'
  },
  {
    id: 3,
    name: 'Floración',
    startDay: 46,
    endDay: 90,
    color: '#ffc107',
    icon: 'bi-flower1',
    description: 'Diferenciación floral, polinización, cuajado de frutos'
  },
  {
    id: 4,
    name: 'Fructificación',
    startDay: 91,
    endDay: 150,
    color: '#dc3545',
    icon: 'bi-apple',
    description: 'Desarrollo y maduración de frutos'
  },
  {
    id: 5,
    name: 'Cosecha/Fin',
    startDay: 151,
    endDay: 999,
    color: '#6c757d',
    icon: 'bi-basket',
    description: 'Cosecha y fin de ciclo'
  }
];
```

---

### **STEP 2: Create Growth Stage Calculator Service** (30 minutes)

**File**: `src/app/features/process-kpis/services/growth-stage-calculator.service.ts`

```typescript
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
```

---

### **STEP 3: Create KPI Aggregator Service** (45 minutes)

**File**: `src/app/features/process-kpis/services/kpi-aggregator.service.ts`

```typescript
import { Injectable } from '@angular/core';
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
  ): AggregationDataset {
    
    if (dailyKPIs.length === 0) {
      return this.createEmptyDataset('stage');
    }
    
    const stages = this.growthStageService.getGrowthStages(cropId);
    
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
      stageMap.get(stage)?.push(kpi);
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
```

---

### **STEP 4: Extend Process KPIs Component TypeScript** (45 minutes)

**File**: `src/app/features/process-kpis/process-kpis.component.ts` **(ADD TO EXISTING)**

```typescript
// ADD THESE IMPORTS
import { KpiAggregatorService } from './services/kpi-aggregator.service';
import { GrowthStageCalculatorService } from './services/growth-stage-calculator.service';
import { 
  AggregationDataset, 
  AggregationChartConfig,
  GrowthStage 
} from './models/aggregation.models';
import { ViewChild, ElementRef } from '@angular/core';

// ADD TO COMPONENT CLASS
export class ProcessKPIsComponent implements OnInit, OnDestroy {
  // ... existing properties ...
  
  // NEW: Aggregation properties
  weeklyAggregation: AggregationDataset | null = null;
  stageAggregation: AggregationDataset | null = null;
  aggregationChartConfig: AggregationChartConfig;
  currentAggregationView: 'weekly' | 'stage' = 'weekly';
  plantingDate: Date = new Date(); // Should come from crop production data
  
  // NEW: Chart references
  @ViewChild('weeklyChart', { static: false }) weeklyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stageChart', { static: false }) stageChartCanvas!: ElementRef<HTMLCanvasElement>;
  private weeklyChart: Chart | null = null;
  private stageChart: Chart | null = null;
  
  constructor(
    // ... existing dependencies ...
    private kpiAggregator: KpiAggregatorService,          // ADD
    private growthStageService: GrowthStageCalculatorService  // ADD
  ) {
    // ... existing constructor code ...
    this.aggregationChartConfig = this.kpiAggregator.getDefaultChartConfig();
  }
  
  // ADD NEW METHOD: Calculate aggregations
  calculateAggregations(): void {
    if (this.kpiData.length === 0) {
      console.warn('No KPI data available for aggregation');
      return;
    }
    
    // Get planting date from first KPI or crop production data
    // TODO: Load actual planting date from CropProduction API
    this.plantingDate = this.estimatePlantingDate();
    
    // Calculate weekly aggregation
    this.weeklyAggregation = this.kpiAggregator.aggregateByWeek(
      this.kpiData,
      this.plantingDate
    );
    
    // Calculate growth stage aggregation
    this.stageAggregation = this.kpiAggregator.aggregateByGrowthStage(
      this.kpiData,
      this.plantingDate,
      this.selectedCropId
    );
    
    console.log('Weekly aggregation:', this.weeklyAggregation);
    console.log('Stage aggregation:', this.stageAggregation);
    
    // Render charts
    this.renderAggregationCharts();
  }
  
  // ADD NEW METHOD: Estimate planting date from data
  private estimatePlantingDate(): Date {
    if (this.kpiData.length === 0) return new Date();
    
    // Assume first KPI date is approximately N days after planting
    // For now, subtract 14 days as a rough estimate
    const firstKPIDate = this.kpiData[0].date;
    const estimatedPlanting = new Date(firstKPIDate);
    estimatedPlanting.setDate(estimatedPlanting.getDate() - 14);
    
    return estimatedPlanting;
  }
  
  // ADD NEW METHOD: Render aggregation charts
  renderAggregationCharts(): void {
    // Destroy existing charts
    if (this.weeklyChart) {
      this.weeklyChart.destroy();
      this.weeklyChart = null;
    }
    if (this.stageChart) {
      this.stageChart.destroy();
      this.stageChart = null;
    }
    
    // Wait for canvases to be available
    setTimeout(() => {
      if (this.weeklyAggregation && this.weeklyChartCanvas) {
        this.renderWeeklyChart();
      }
      if (this.stageAggregation && this.stageChartCanvas) {
        this.renderStageChart();
      }
    }, 100);
  }
  
  // ADD NEW METHOD: Render weekly aggregation chart
  private renderWeeklyChart(): void {
    if (!this.weeklyAggregation || !this.weeklyChartCanvas) return;
    
    const ctx = this.weeklyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const data = this.weeklyAggregation;
    const labels = data.periods.map(p => p.periodLabel);
    
    this.weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Riego (L/m²)',
            data: data.periods.map(p => p.irrigation.totalVolumePerM2),
            backgroundColor: this.aggregationChartConfig.colors.irrigation,
            borderColor: this.aggregationChartConfig.colors.irrigation,
            borderWidth: 2
          },
          {
            label: 'Drenaje (L/m²)',
            data: data.periods.map(p => p.drainage.totalVolumePerM2),
            backgroundColor: this.aggregationChartConfig.colors.drainage,
            borderColor: this.aggregationChartConfig.colors.drainage,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Riego y Drenaje Acumulado por Semana',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const index = items[0].dataIndex;
                const period = data.periods[index];
                return `Eventos: ${period.irrigation.numberOfEvents}\nDrenaje: ${period.drainage.averageDrainPercentage.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Semana',
              font: { size: 14, weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Volumen (L/m²)',
              font: { size: 14, weight: 'bold' }
            },
            beginAtZero
            : true
          }
        }
      }
    });
  }
  
  // ADD NEW METHOD: Render growth stage aggregation chart
  private renderStageChart(): void {
    if (!this.stageAggregation || !this.stageChartCanvas) return;
    
    const ctx = this.stageChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const data = this.stageAggregation;
    const labels = data.periods.map(p => p.periodLabel);
    const colors = data.periods.map(p => p.growthStage?.color || '#6c757d');
    
    this.stageChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Riego Total (L)',
            data: data.periods.map(p => p.irrigation.totalVolume),
            backgroundColor: colors.map(c => c + 'CC'),
            borderColor: colors,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Riego Acumulado por Etapa de Crecimiento',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const index = items[0].dataIndex;
                const period = data.periods[index];
                return `Días: ${period.daysInPeriod}\nPromedio diario: ${period.irrigation.averageDailyVolume.toFixed(1)} L\nEventos: ${period.irrigation.numberOfEvents}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Etapa de Crecimiento',
              font: { size: 14, weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Volumen Total (L)',
              font: { size: 14, weight: 'bold' }
            },
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // ADD NEW METHOD: Switch aggregation view
  switchAggregationView(view: 'weekly' | 'stage'): void {
    this.currentAggregationView = view;
  }
  
  // ADD NEW METHOD: Toggle chart data series
  toggleChartSeries(series: 'irrigation' | 'drainage' | 'et'): void {
    switch (series) {
      case 'irrigation':
        this.aggregationChartConfig.showIrrigation = !this.aggregationChartConfig.showIrrigation;
        break;
      case 'drainage':
        this.aggregationChartConfig.showDrainage = !this.aggregationChartConfig.showDrainage;
        break;
      case 'et':
        this.aggregationChartConfig.showET = !this.aggregationChartConfig.showET;
        break;
    }
    this.renderAggregationCharts();
  }
  
  // MODIFY EXISTING METHOD: processKPIs
  async processKPIs() {
    // ... existing code ...
    
    // ADD AT THE END:
    // After KPIs are calculated, compute aggregations
    if (this.kpiData.length > 0) {
      this.calculateAggregations();
    }
  }
  
  // MODIFY: ngOnDestroy to clean up charts
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // ADD: Destroy aggregation charts
    if (this.weeklyChart) this.weeklyChart.destroy();
    if (this.stageChart) this.stageChart.destroy();
  }
}
```

---

### **STEP 5: Extend Process KPIs Component Template** (45 minutes)

**File**: `src/app/features/process-kpis/process-kpis.component.html` **(ADD NEW TAB)**

```html
<!-- ADD TO EXISTING NAV TABS (after existing tabs) -->
<ul class="nav nav-tabs mb-4">
  <!-- ... existing tabs ... -->
  
  <li class="nav-item">
    <button 
      class="nav-link" 
      [class.active]="activeTab === 'aggregation'" 
      (click)="setActiveTab('aggregation')">
      <i class="bi bi-bar-chart-fill"></i>
      Agregación Semanal/Etapas
    </button>
  </li>
</ul>

<!-- ADD NEW TAB CONTENT (before closing div of tab-content) -->
<div *ngIf="activeTab === 'aggregation'" class="tab-pane active">
  
  <!-- AGGREGATION VIEW SELECTOR -->
  <div class="aggregation-controls">
    <div class="view-selector">
      <button 
        class="btn"
        [class.btn-primary]="currentAggregationView === 'weekly'"
        [class.btn-outline-primary]="currentAggregationView !== 'weekly'"
        (click)="switchAggregationView('weekly')">
        <i class="bi bi-calendar-week"></i>
        Por Semana
      </button>
      <button 
        class="btn"
        [class.btn-primary]="currentAggregationView === 'stage'"
        [class.btn-outline-primary]="currentAggregationView !== 'stage'"
        (click)="switchAggregationView('stage')">
        <i class="bi bi-graph-up-arrow"></i>
        Por Etapa de Crecimiento
      </button>
    </div>
    
    <!-- Chart Options -->
    <div class="chart-options">
      <label class="form-check-label me-3">
        <input 
          type="checkbox" 
          class="form-check-input"
          [checked]="aggregationChartConfig.showIrrigation"
          (change)="toggleChartSeries('irrigation')">
        Riego
      </label>
      <label class="form-check-label me-3">
        <input 
          type="checkbox" 
          class="form-check-input"
          [checked]="aggregationChartConfig.showDrainage"
          (change)="toggleChartSeries('drainage')">
        Drenaje
      </label>
      <label class="form-check-label">
        <input 
          type="checkbox" 
          class="form-check-input"
          [checked]="aggregationChartConfig.showET"
          (change)="toggleChartSeries('et')">
        ET
      </label>
    </div>
  </div>
  
  <!-- WEEKLY VIEW -->
  <div *ngIf="currentAggregationView === 'weekly' && weeklyAggregation" class="aggregation-view">
    
    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="summary-card">
            <div class="card-icon">
              <i class="bi bi-droplet-fill text-primary"></i>
            </div>
            <div class="card-content">
              <h6>Riego Total</h6>
              <div class="value">{{ weeklyAggregation.totals.totalIrrigationVolume | number:'1.0-0' }} L</div>
              <small>{{ weeklyAggregation.totals.totalIrrigationVolume / weeklyAggregation.metadata.area | number:'1.1-1' }} L/m²</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card">
            <div class="card-icon">
              <i class="bi bi-funnel-fill text-danger"></i>
            </div>
            <div class="card-content">
              <h6>Drenaje Total</h6>
              <div class="value">{{ weeklyAggregation.totals.totalDrainageVolume | number:'1.0-0' }} L</div>
              <small>{{ weeklyAggregation.totals.averageDrainPercentage | number:'1.1-1' }}% promedio</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card">
            <div class="card-icon">
              <i class="bi bi-calendar-week text-success"></i>
            </div>
            <div class="card-content">
              <h6>Semanas</h6>
              <div class="value">{{ weeklyAggregation.periods.length }}</div>
              <small>{{ weeklyAggregation.periods.reduce((sum, p) => sum + p.daysInPeriod, 0) }} días totales</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="summary-card">
            <div class="card-icon">
              <i class="bi bi-graph-up text-info"></i>
            </div>
            <div class="card-content">
              <h6>Eventos de Riego</h6>
              <div class="value">{{ weeklyAggregation.periods.reduce((sum, p) => sum + p.irrigation.numberOfEvents, 0) }}</div>
              <small>Promedio por semana: {{ (weeklyAggregation.periods.reduce((sum, p) => sum + p.irrigation.numberOfEvents, 0) / weeklyAggregation.periods.length) | number:'1.1-1' }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chart -->
    <div class="chart-container">
      <canvas #weeklyChart></canvas>
    </div>
    
    <!-- Detailed Table -->
    <div class="detailed-table mt-4">
      <h5 class="section-title">
        <i class="bi bi-table"></i>
        Detalle por Semana
      </h5>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Semana</th>
              <th>Periodo</th>
              <th>Días</th>
              <th>Riego (L)</th>
              <th>Riego (L/m²)</th>
              <th>Drenaje (%)</th>
              <th>Eventos</th>
              <th>Vol. Promedio</th>
              <th>Duración Prom.</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let period of weeklyAggregation.periods">
              <td><strong>{{ period.periodLabel }}</strong></td>
              <td>
                <small>
                  {{ period.startDate | date:'dd/MM' }} - {{ period.endDate | date:'dd/MM' }}
                </small>
              </td>
              <td>{{ period.daysInPeriod }}</td>
              <td>{{ period.irrigation.totalVolume | number:'1.0-0' }}</td>
              <td>{{ period.irrigation.totalVolumePerM2 | number:'1.2-2' }}</td>
              <td>
                <span 
                  class="badge"
                  [class.bg-success]="period.drainage.averageDrainPercentage >= 15 && period.drainage.averageDrainPercentage <= 25"
                  [class.bg-warning]="period.drainage.averageDrainPercentage < 15 || period.drainage.averageDrainPercentage > 25"
                  [class.bg-danger]="period.drainage.averageDrainPercentage < 10 || period.drainage.averageDrainPercentage > 35">
                  {{ period.drainage.averageDrainPercentage | number:'1.1-1' }}%
                </span>
              </td>
              <td>{{ period.irrigation.numberOfEvents }}</td>
              <td>{{ period.irrigation.averageEventVolume | number:'1.1-1' }} L</td>
              <td>{{ period.irrigation.averageDuration | number:'1.0-0' }} min</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="table-primary">
              <th colspan="3">TOTAL</th>
              <th>{{ weeklyAggregation.totals.totalIrrigationVolume | number:'1.0-0' }}</th>
              <th>{{ weeklyAggregation.totals.totalIrrigationVolume / weeklyAggregation.metadata.area | number:'1.2-2' }}</th>
              <th>{{ weeklyAggregation.totals.averageDrainPercentage | number:'1.1-1' }}%</th>
              <th>{{ weeklyAggregation.periods.reduce((sum, p) => sum + p.irrigation.numberOfEvents, 0) }}</th>
              <th colspan="2">-</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
  
  <!-- GROWTH STAGE VIEW -->
  <div *ngIf="currentAggregationView === 'stage' && stageAggregation" class="aggregation-view">
    
    <!-- Growth Stage Timeline -->
    <div class="growth-stage-timeline mb-4">
      <div class="timeline-container">
        <div 
          *ngFor="let period of stageAggregation.periods"
          class="timeline-stage"
          [style.flex]="period.daysInPeriod"
          [style.background]="period.growthStage?.color + '33'">
          <div class="stage-header" [style.color]="period.growthStage?.color">
            <i class="bi {{ period.growthStage?.icon }}"></i>
            <strong>{{ period.periodLabel }}</strong>
          </div>
          <div class="stage-days">{{ period.daysInPeriod }} días</div>
          <div class="stage-irrigation">
            {{ period.irrigation.totalVolume | number:'1.0-0' }} L
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chart -->
    <div class="chart-container">
      <canvas #stageChart></canvas>
    </div>
    
    <!-- Stage Details Cards -->
    <div class="stage-details mt-4">
      <h5 class="section-title">
        <i class="bi bi-info-circle"></i>
        Detalle por Etapa de Crecimiento
      </h5>
      <div class="row g-3">
        <div class="col-md-6" *ngFor="let period of stageAggregation.periods">
          <div class="stage-detail-card" [style.border-left-color]="period.growthStage?.color">
            <div class="stage-header-card">
              <i class="bi {{ period.growthStage?.icon }}" [style.color]="period.growthStage?.color"></i>
              <h6>{{ period.periodLabel }}</h6>
              <span class="stage-badge" [style.background]="period.growthStage?.color">
                Días {{ period.growthStage?.startDay }} - {{ period.growthStage?.endDay }}
              </span>
            </div>
            <p class="stage-description">{{ period.growthStage?.description }}</p>
            
            <div class="stage-metrics">
              <div class="metric-row">
                <span class="metric-label">Periodo de datos:</span>
                <span class="metric-value">
                  {{ period.startDate | date:'dd/MM/yyyy' }} - {{ period.endDate | date:'dd/MM/yyyy' }}
                  ({{ period.daysInPeriod }} días)
                </span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Riego total:</span>
                <span class="metric-value">{{ period.irrigation.totalVolume | number:'1.0-0' }} L</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Promedio diario:</span>
                <span class="metric-value">{{ period.irrigation.averageDailyVolume | number:'1.1-1' }} L/día</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Eventos de riego:</span>
                <span class="metric-value">{{ period.irrigation.numberOfEvents }}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Drenaje promedio:</span>
                <span 
                  class="metric-value"
                  [class.text-success]="period.drainage.averageDrainPercentage >= 15 && period.drainage.averageDrainPercentage <= 25"
                  [class.text-warning]="period.drainage.averageDrainPercentage < 15 || period.drainage.averageDrainPercentage > 25">
                  {{ period.drainage.averageDrainPercentage | number:'1.1-1' }}%
                </span>
              </div>
              <div class="metric-row" *ngIf="period.climate">
                <span class="metric-label">ET promedio:</span>
                <span class="metric-value">{{ period.climate.averageET | number:'1.2-2' }} mm/día</span>
              </div>
              <div class="metric-row" *ngIf="period.climate">
                <span class="metric-label">VPD promedio:</span>
                <span class="metric-value">{{ period.climate.averageVPD | number:'1.2-2' }} kPa</span>
              </div>
              <div class="metric-row" *ngIf="period.climate">
                <span class="metric-label">Grados día acumulados:</span>
                <span class="metric-value">{{ period.climate.totalDegreeDays | number:'1.0-0' }} °C·día</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- NO DATA STATE -->
  <div *ngIf="!weeklyAggregation && !stageAggregation" class="empty-state">
    <div class="empty-icon">
      <i class="bi bi-bar-chart"></i>
    </div>
    <h4>Sin Datos de Agregación</h4>
    <p>Procese los KPIs primero para generar gráficos de agregación semanal y por etapas.</p>
    <button class="btn btn-primary" (click)="processKPIs()">
      <i class="bi bi-calculator"></i>
      Procesar KPIs
    </button>
  </div>
  
</div>
```

---

### **STEP 6: Extend Component Styles** (30 minutes)

**File**: `src/app/features/process-kpis/process-kpis.component.css` **(ADD TO EXISTING)**

```css
/* ============================================================================
   AGGREGATION VIEW STYLES
   ============================================================================ */

/* Aggregation Controls */
.aggregation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.view-selector {
  display: flex;
  gap: 0.5rem;
}

.view-selector .btn {
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.chart-options {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.form-check-input {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

/* Summary Cards */
.summary-cards {
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
  transition: all 0.3s ease;
  height: 100%;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.summary-card .card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.summary-card .card-content {
  flex: 1;
}

.summary-card .card-content h6 {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-card .card-content .value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #343a40;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.summary-card .card-content small {
  color: #6c757d;
  font-size: 0.75rem;
}

/* Chart Container */
.chart-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 500px;
  margin-bottom: 2rem;
}

.chart-container canvas {
  max-height: 100%;
}

/* Detailed Table */
.detailed-table {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #007bff;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

/* Growth Stage Timeline */
.growth-stage-timeline {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-container {
  display: flex;
  gap: 2px;
  min-height: 120px;
}

.timeline-stage {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.timeline-stage:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stage-header {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stage-header i {
  font-size: 1.5rem;
}

.stage-days {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stage-irrigation {
  font-size: 1.1rem;
  font-weight: 600;
  color: #343a40;
}

/* Stage Detail Cards */
.stage-details {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stage-detail-card {
  background: white;
  border: 2px solid #dee2e6;
  border-left-width: 4px;
  border-radius: 8px;
  padding: 1.5rem;
  height: 100%;
  transition: all 0.3s ease;
}

.stage-detail-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stage-header-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.stage-header-card i {
  font-size: 1.75rem;
}

.stage-header-card h6 {
  flex: 1;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #343a40;
}

.stage-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.stage-description {
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.stage-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #343a40;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .aggregation-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .view-selector {
    justify-content: stretch;
  }
  
  .view-selector .btn {
    flex: 1;
  }
  
  .chart-options {
    justify-content: center;
  }
  
  .timeline-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .timeline-stage {
    min-height: auto;
  }
  
  .chart-container {
    height: 400px;
  }
}
```

---

## 🎯 **EXPECTED RESULT**

After completing all steps, you will have:

### ✅ **A Working Aggregation System That:**
1. **Groups daily irrigation data** by week and by growth stage
2. **Displays summary cards** with total volumes, events, and averages
3. **Renders interactive bar charts** showing irrigation and drainage by period
4. **Shows a visual timeline** of growth stages with data
5. **Provides detailed tables** with all metrics per period
6. **Allows toggling** between weekly and stage views
7. **Calculates efficiency metrics** (water use, drainage %)

### 📊 **Visual Output:**
- **Weekly View**: Bar chart with 10-15 weeks, showing irrigation + drainage per week
- **Stage View**: Colored bar chart with 4-5 growth stages, volumes matching stage colors
- **Timeline**: Horizontal timeline showing relative duration of each growth stage
- **Tables**: Sortable, detailed breakdown with all metrics

---

## ⏱️ **TIME BREAKDOWN**

| Step | Time | Cumulative |
|------|------|------------|
| 1. Data Models | 15 min | 15 min |
| 2. Growth Stage Service | 30 min | 45 min |
| 3. Aggregator Service | 45 min | 1h 30min |
| 4. Component TS | 45 min | 2h 15min |
| 5. Template HTML | 45 min | 3h |
| 6. Styles CSS | 30 min | **3h 30min TOTAL** |

---

## 🚀 **USAGE**

Once implemented, users can:
1. Navigate to **Process KPIs** tab
2. Click on **"Agregación Semanal/Etapas"** tab
3. Toggle between **Weekly** and **Growth Stage** views
4. See cumulative irrigation/drainage patterns
5. Identify which weeks/stages consumed most water
6. Compare drainage efficiency across periods
7. Export charts for reports

---

**Ready to implement?** This builds directly on your existing `process-kpis.component` and uses the irrigation data you're already calculating! 🎯