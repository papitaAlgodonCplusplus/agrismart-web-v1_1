// ============================================================================
// IRRIGATION VOLUME CALCULATOR DATA MODELS
// ============================================================================

import { SubstrateReleaseCurve } from './substrate-analysis.models';

/**
 * Input parameters for irrigation volume calculation
 */
export interface IrrigationVolumeInput {
  // Substrate characteristics
  substrateCurve: SubstrateReleaseCurve;

  // Crop production setup
  numberOfContainers: number;
  containersPerPlant: number;        // Usually 1, but could be 2 for large plants
  totalArea: number;                 // m²
  plantDensity: number;              // plants/m²

  // Irrigation strategy
  depletionPercentage: number;       // % of available water to deplete before irrigating (0-100)
  targetDrainPercentage: number;     // % of applied water that should drain (typically 15-25%)

  // Optional: current moisture level
  currentMoisturePercentage?: number; // If measured, allows more precise calculation
}

/**
 * Calculated irrigation volumes and recommendations
 */
export interface IrrigationVolumeOutput {
  // Per container calculations
  waterDepletedPerContainer: number;      // Liters consumed since last irrigation
  volumeNeededPerContainer: number;       // Liters to restore to optimal level
  volumeWithDrainPerContainer: number;    // Liters including drain percentage

  // Total system calculations
  totalWaterDepleted: number;             // Liters for entire system
  totalVolumeNeeded: number;              // Liters to restore entire system
  totalVolumeWithDrain: number;           // Liters including drain for entire system

  // Per area calculations
  volumePerSquareMeter: number;           // L/m²
  precipitationRate: number;              // mm (same as L/m²)

  // Irrigation duration (if flow rate available)
  durationMinutes?: number;               // Calculated if flowRate provided

  // Recommendation metadata
  recommendationLevel: 'optimal' | 'acceptable' | 'caution' | 'critical';
  recommendation: string;
  reasoning: string[];

  // Visual zones for display
  zones: {
    optimal: { min: number; max: number };      // 20-40% depletion
    acceptable: { min: number; max: number };   // 40-60% depletion
    caution: { min: number; max: number };      // 60-80% depletion
    critical: { min: number; max: number };     // 80-100% depletion
  };
}

/**
 * Configuration for the calculator widget
 */
export interface CalculatorConfig {
  // Display options
  showPerContainer: boolean;
  showPerPlant: boolean;
  showPerArea: boolean;
  showDurationCalculator: boolean;

  // Calculation options
  defaultDepletionPercentage: number;     // Default: 30%
  defaultDrainPercentage: number;         // Default: 20%
  minDepletionPercentage: number;         // Min slider value: 10%
  maxDepletionPercentage: number;         // Max slider value: 100%

  // Flow rate for duration calculation (optional)
  systemFlowRate?: number;                // L/min

  // Color scheme for zones
  colors: {
    optimal: string;
    acceptable: string;
    caution: string;
    critical: string;
  };
}

/**
 * Historical irrigation event for comparison
 */
export interface IrrigationHistoryEvent {
  date: Date;
  volumeApplied: number;              // Liters
  drainageVolume: number;             // Liters
  drainPercentage: number;            // %
  depletionAtIrrigation: number;      // % depletion when irrigation started
  durationMinutes: number;
  notes?: string;
}

/**
 * Comparison between calculated and historical irrigation
 */
export interface IrrigationComparison {
  calculatedVolume: number;
  averageHistoricalVolume: number;
  difference: number;                  // Liters
  differencePercentage: number;        // %
  suggestion: string;
}

/**
 * Quick preset irrigation strategies
 */
export interface IrrigationPreset {
  id: string;
  name: string;
  description: string;
  depletionPercentage: number;
  drainPercentage: number;
  icon: string;
  suitableFor: string[];              // e.g., ["Vegetative stage", "High VPD conditions"]
}
