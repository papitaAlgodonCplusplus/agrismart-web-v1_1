// ============================================================================
// SPLIT APPLICATION CALCULATOR MODELS
// ============================================================================

/**
 * Growth stage definition for crop
 */
export interface GrowthStage {
  id: number;
  name: string;
  startDay: number;                    // Days after planting/transplant
  endDay: number;
  durationDays: number;
  description: string;

  // Nutrient demand coefficients (0-1 scale, relative to maximum)
  nitrogenDemand: number;              // 0.0 - 1.0
  phosphorusDemand: number;
  potassiumDemand: number;
  calciumDemand: number;
  magnesiumDemand: number;

  // Growth characteristics
  growthRate: 'slow' | 'moderate' | 'rapid';
  criticalPeriod: boolean;             // Is this a critical nutrient period?
  notes?: string;
}

/**
 * Input for split application calculation
 */
export interface SplitApplicationInput {
  // Total nutrient requirements (kg/ha or kg total)
  totalNutrients: {
    N: number;
    P: number;
    K: number;
    Ca: number;
    Mg: number;
    S: number;
  };

  // Crop information
  cropName: string;
  cropArea: number;                    // hectares or m²
  plantingDate: Date;
  harvestDate: Date;
  totalCycleDays: number;

  // Growth stages
  growthStages: GrowthStage[];

  // Split strategy
  splitStrategy: 'equal' | 'demand-based' | 'custom';
  numberOfSplits: number;              // 2-10 typical

  // Application method
  applicationMethod: 'fertigation' | 'foliar' | 'soil-broadcast' | 'soil-banded';

  // Constraints
  minDaysBetweenApplications: number;  // Minimum days between applications
  maxNPerApplication: number;          // Maximum N kg/ha per application (to prevent burn)

  // Environmental considerations
  rainySeasonAdjustment: boolean;      // Reduce amounts if heavy rain expected?
  soilType: 'sandy' | 'loam' | 'clay'; // Affects leaching and retention

  // Soil contribution (from soil analysis)
  soilContribution?: {
    N: number;
    P: number;
    K: number;
    Ca: number;
    Mg: number;
    S: number;
  };
}

/**
 * Individual split application
 */
export interface SplitApplication {
  applicationNumber: number;
  applicationDate: Date;
  daysAfterPlanting: number;
  growthStage: string;

  // Nutrient amounts for this application (kg/ha or kg)
  nutrients: {
    N: number;
    P: number;
    K: number;
    Ca: number;
    Mg: number;
    S: number;
  };

  // Percentage of total for each nutrient
  percentOfTotal: {
    N: number;
    P: number;
    K: number;
    Ca: number;
    Mg: number;
    S: number;
  };

  // Rationale
  rationale: string;
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Warnings
  warnings: string[];

  // Application instructions
  instructions: string;
}

/**
 * Complete split application schedule output
 */
export interface SplitApplicationSchedule {
  // Input summary
  cropName: string;
  totalArea: number;
  cycleDuration: number;
  plantingDate: Date;
  harvestDate: Date;

  // Total nutrients to apply
  totalNutrients: {
    N: number;
    P: number;
    K: number;
    Ca: number;
    Mg: number;
    S: number;
  };

  // Split applications
  applications: SplitApplication[];
  numberOfSplits: number;

  // Summary statistics
  summary: {
    averageDaysBetweenApplications: number;
    maxSingleApplicationN: number;
    totalApplicationEvents: number;
    estimatedLaborHours: number;
    estimatedCost?: number;
  };

  // Efficiency metrics
  efficiency: {
    nutrientUseEfficiency: number;      // % (higher is better)
    leachingRisk: 'low' | 'medium' | 'high';
    costEffectiveness: 'poor' | 'fair' | 'good' | 'excellent';
  };

  // Calendar view data
  calendar: CalendarEvent[];

  // Recommendations
  recommendations: string[];
  warnings: string[];
}

/**
 * Calendar event for visual display
 */
export interface CalendarEvent {
  date: Date;
  title: string;
  description: string;
  type: 'application' | 'stage-change' | 'milestone';
  nutrients?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Comparison between different split strategies
 */
export interface SplitStrategyComparison {
  strategyName: string;
  numberOfSplits: number;

  // Efficiency scores (0-100)
  nutrientEfficiency: number;
  laborEfficiency: number;
  costEfficiency: number;
  overallScore: number;

  // Risk assessment
  leachingRisk: number;               // 0-100 (lower is better)
  deficiencyRisk: number;             // 0-100 (lower is better)

  // Practical considerations
  complexity: 'simple' | 'moderate' | 'complex';
  suitableFor: string[];              // e.g., ["small farms", "high-value crops"]

  advantages: string[];
  disadvantages: string[];
}

/**
 * Nutrient uptake curve for crop
 */
export interface NutrientUptakeCurve {
  nutrient: string;
  dataPoints: {
    daysAfterPlanting: number;
    cumulativeUptake: number;         // kg/ha
    dailyUptakeRate: number;          // kg/ha/day
    percentOfTotal: number;           // %
  }[];
}

/**
 * Preset split strategies
 */
export interface SplitStrategyPreset {
  id: string;
  name: string;
  description: string;
  numberOfSplits: number;
  distributionPattern: number[];      // Percentage for each split (must sum to 100)
  suitableCrops: string[];
  suitableScales: string[];           // e.g., ["small", "medium", "large"]
  advantages: string[];
  disadvantages: string[];
}
