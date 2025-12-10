// src/app/features/services/models/irrigation-decision.models.ts

// ============================================================================
// IRRIGATION RECOMMENDATION INTERFACES
// ============================================================================

export interface IrrigationRecommendation {
  shouldIrrigate: boolean;
  recommendedVolume: number; // liters per container
  recommendedDuration: number; // minutes
  totalVolume: number; // liters total for all containers
  confidence: number; // 0-100%
  reasoning: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  bestTimeToExecute?: Date; // if not now
  nextRecommendedCheck?: Date; // when to check again
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
  growthStage?: string;
  cropWaterStress?: number; // 0-100%

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
