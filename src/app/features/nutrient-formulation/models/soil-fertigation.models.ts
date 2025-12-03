// ============================================================================
// SOIL FERTIGATION CALCULATION MODELS
// ============================================================================

import { SoilAnalysisResponse } from '../../soil-analysis/models/soil-analysis.models';

/**
 * Input for soil fertigation calculation
 */
export interface SoilFertigationInput {
  // Crop targets (same as hydroponics)
  targetConcentrations: {
    N: number;
    P: number;
    K: number;
    Ca: number;
    Mg: number;
    S: number;
  };

  // Soil analysis data
  soilAnalysis: SoilAnalysisResponse;

  // Water analysis
  waterAnalysis: {
    N?: number;
    P?: number;
    K?: number;
    Ca?: number;
    Mg?: number;
    S?: number;
  };

  // Irrigation parameters
  irrigationVolume: number;              // Liters per application
  irrigationsPerWeek: number;            // Frequency
  leachingFraction: number;              // % (typically 15-25%)
  applicationEfficiency: number;         // % (typically 85-95%)

  // Crop parameters
  cropArea: number;                      // m²
  rootingDepth: number;                  // cm (typical: 30-60cm)

  // Selected fertilizers
  fertilizers: any[];
}

/**
 * Adjusted nutrient targets after accounting for soil + water contributions
 */
export interface AdjustedNutrientTargets {
  nutrient: string;
  originalTarget: number;                // mg/L target from crop requirements
  soilContribution: number;              // mg/L from soil (adjusted for availability)
  waterContribution: number;             // mg/L from irrigation water
  adjustedTarget: number;                // mg/L needed from fertilizers
  availabilityFactor: number;            // 0-1 (pH-dependent)
  reasoning: string;
}

/**
 * Soil fertigation calculation output
 */
export interface SoilFertigationOutput {
  // Adjusted targets
  adjustedTargets: AdjustedNutrientTargets[];

  // Fertilizer recommendations (from Python API)
  fertilizerRecommendations: any;

  // Application schedule
  applicationSchedule: {
    volumePerApplication: number;        // Liters
    concentrationInSolution: any;        // mg/L for each nutrient
    totalFertilizerPerWeek: any;         // kg per nutrient per week
    applicationsPerWeek: number;
  };

  // Soil buffering analysis
  soilBuffering: {
    cationExchangeCapacity: number;      // meq/100g
    bufferingStrength: 'low' | 'medium' | 'high';
    nutrientRetention: {
      [nutrient: string]: number;        // % retained by soil
    };
  };

  // Warnings and recommendations
  warnings: string[];
  recommendations: string[];
}

/**
 * Nutrient availability factors by pH range
 */
export interface NutrientAvailabilityFactors {
  N: number;
  P: number;
  K: number;
  Ca: number;
  Mg: number;
  S: number;
  Fe?: number;
  Mn?: number;
  Zn?: number;
  Cu?: number;
  B?: number;
}

/**
 * Soil nutrient supply capacity
 */
export interface SoilNutrientSupply {
  nutrient: string;
  soilTestValue: number;                 // ppm
  availableAmount: number;               // ppm (after pH adjustment)
  supplyDuration: number;                // weeks (estimated)
  needsFertigation: boolean;
}

/**
 * Comparison between soil and hydroponic formulations
 */
export interface FormulationComparison {
  nutrient: string;
  hydroponicAmount: number;
  soilAmount: number;
  difference: number;
  percentDifference: number;
  reason: string;
}
