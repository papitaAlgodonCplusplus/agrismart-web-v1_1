// ============================================================================
// SUBSTRATE ANALYSIS DATA MODELS
// ============================================================================

/**
 * Represents a point on the substrate release curve
 * Maps matric potential (kPa) to volumetric water content (%)
 */
export interface SubstrateCurvePoint {
  matricPotential: number;        // kPa (0-10 range typical)
  volumetricWaterContent: number; // % (0-100)
  airContent: number;             // % (0-100)
  label?: string;                 // e.g., "Saturated", "Container Capacity"
}

/**
 * Complete substrate release curve with key characteristic points
 */
export interface SubstrateReleaseCurve {
  // Raw data points for plotting (typically 20-50 points for smooth curve)
  dataPoints: SubstrateCurvePoint[];

  // Key characteristic points (from PDF Page 21)
  characteristicPoints: {
    saturated: SubstrateCurvePoint;           // 0 kPa
    containerCapacity: SubstrateCurvePoint;   // 1 kPa
    fiveKpa: SubstrateCurvePoint;             // 5 kPa (field capacity equivalent)
    tenKpa: SubstrateCurvePoint;              // 10 kPa
    permanentWiltingPoint?: SubstrateCurvePoint; // 15 kPa (if available)
  };

  // Calculated water zones (as shown in PDF graphic)
  waterZones: {
    totalAvailableWater: number;    // % (Container Capacity - PWP)
    easilyAvailableWater: number;   // % (1 kPa - 5 kPa)
    reserveWater: number;           // % (5 kPa - 10 kPa)
  };

  // Substrate identification
  growingMediumId: number;
  growingMediumName: string;
  containerVolume: number;          // Liters
}

/**
 * Input data required to generate substrate curve
 * Maps to existing GrowingMedium + Container entities
 */
export interface SubstrateAnalysisInput {
  // From GrowingMedium entity (YOUR EXISTING DATA)
  growingMediumId: number;
  growingMediumName: string;
  containerCapacityPercentage: number;      // θ at 1 kPa
  permanentWiltingPoint: number;            // θ at ~15 kPa
  easelyAvailableWaterPercentage: number;   // Difference between 1-5 kPa
  reserveWaterPercentage: number;           // Difference between 5-10 kPa
  totalAvailableWaterPercentage: number;    // Total ATD

  // From Container entity (YOUR EXISTING DATA)
  containerId: number;
  containerVolume: number;                  // Liters

  // Optional: if you have lab-measured curve points
  labMeasuredPoints?: SubstrateCurvePoint[];
}

/**
 * Visualization configuration options
 */
export interface SubstrateCurveChartConfig {
  // Chart dimensions
  width?: number;
  height?: number;

  // Display options
  showAirContent: boolean;          // Show air percentage line
  showWaterZones: boolean;          // Show colored zones
  showCharacteristicPoints: boolean; // Mark key points
  showGridLines: boolean;

  // Calculation options
  curveResolution: number;          // Number of interpolated points (default: 50)
  maxMatricPotential: number;       // Max kPa to display (default: 10)

  // Color scheme
  colors: {
    waterLine: string;
    airLine: string;
    saturatedZone: string;
    containerCapacityZone: string;
    easilyAvailableZone: string;
    reserveZone: string;
  };
}
