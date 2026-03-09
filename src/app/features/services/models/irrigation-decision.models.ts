// src/app/features/services/models/irrigation-decision.models.ts

// ============================================================================
// IRRIGATION RECOMMENDATION INTERFACES
// ============================================================================

export interface RuleEvaluationDisplay extends RuleEvaluation {
  ruleName: string;
  rulePriority: number;
}

export interface IrrigationCalculationBreakdown {
  containerVolumeLiters: number | null;    // configured container volume (L)
  tawPercentage: number | null;            // total available water %
  depletionFraction: number | null;        // current depletion as 0-1
  baseVolumeLiters: number | null;         // TAW * depletion * container volume
  volumeMultiplier: number;                // combined rule adjustments (e.g. 1.2)
  dropperFlowRateLH: number | null;        // L/h per dropper
  droppersPerContainer: number | null;     // count
  flowRateLPerMin: number | null;          // (flowRate * droppers) / 60
  totalContainers: number | null;          // area / (rowSpacing * containerSpacing)
}

export interface IrrigationRecommendation {
  shouldIrrigate: boolean;
  recommendedVolume: number | null; // liters per container, null if data missing
  recommendedDuration: number | null; // minutes, null if data missing
  totalVolume: number | null; // liters total for all containers, null if data missing
  confidence: number; // 0-100%
  reasoning: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  bestTimeToExecute?: Date; // if not now
  nextRecommendedCheck?: Date; // when to check again
  decisionFactors?: IrrigationDecisionFactors;
  ruleEvaluations?: RuleEvaluationDisplay[];
  missingData?: string[]; // list of missing configuration fields
  calculationBreakdown?: IrrigationCalculationBreakdown;
}

export interface IrrigationDecisionFactors {
  // Soil Moisture Status
  currentMoisture: number; // % volumetric
  containerCapacity: number; // % volumetric
  depletionPercentage: number; // %

  // Climate Conditions
  currentVPD?: number; // kPa
  currentTemperature?: number; // °C
  currentHumidity?: number; // %

  // Historical Data
  recentDrainagePercentage?: number; // %
  lastIrrigationTime?: Date;
  hoursSinceLastIrrigation?: number;

  // Crop Requirements
  growthStage?: string; // phase name, for display only
  cropWaterStress?: number; // 0-100%
  phaseWaterStressSensitivity?: 'low' | 'medium' | 'high'; // derived from CropPhase
  phaseDepletionThreshold?: number; // % depletion to trigger irrigation, derived from CropPhase

  // Data availability flags
  hasSoilMoistureData: boolean;

  // Time of Day
  currentHour: number;
  isOptimalTime: boolean;

  // Weather Forecast (optional)
  forecastedRainfall?: number; // mm in next 24h
  forecastedTemperature?: number; // °C average next 24h
}

export interface IrrigationRule {
  name: string;
  priority: number; // 1-10, higher is more important
  evaluate: (factors: IrrigationDecisionFactors) => RuleEvaluation;
}

export interface RuleEvaluation {
  shouldTrigger: boolean;
  confidence: number; // 0-100%
  reason: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  volumeAdjustment?: number; // multiplier (e.g., 1.2 = 20% more)
}

export interface WeatherForecast {
  timestamp: Date;
  temperature: number; // °C
  humidity: number; // %
  vpd: number; // kPa
  rainfall: number; // mm
  windSpeed?: number; // m/s
  solarRadiation?: number; // W/m²
}

export interface GrowthStageConfig {
  stage: 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  depletionThreshold: number; // % depletion to trigger irrigation
  optimalMoistureRange: { min: number; max: number }; // % volumetric
  irrigationFrequency: number; // times per day (typical)
  waterStressSensitivity: 'low' | 'medium' | 'high';
}
