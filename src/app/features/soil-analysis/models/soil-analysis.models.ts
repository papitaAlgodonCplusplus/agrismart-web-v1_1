// ============================================================================
// SOIL ANALYSIS DATA MODELS
// ============================================================================

/**
 * Soil analysis entity from API
 */
export interface SoilAnalysis {
  id?: number;
  cropProductionId: number;

  // Metadata
  sampleDate: Date | string;
  labReportNumber?: string;
  labName?: string;
  sampleDepth?: string;
  sampleLocation?: string;

  // Physical Properties - Texture
  sandPercent?: number;
  siltPercent?: number;
  clayPercent?: number;
  textureClass?: string;
  bulkDensity?: number;

  // Chemical Properties
  phSoil?: number;
  electricalConductivity?: number;
  organicMatterPercent?: number;
  cationExchangeCapacity?: number;

  // Macronutrients - Nitrogen (ppm)
  nitrateNitrogen?: number;
  ammoniumNitrogen?: number;
  totalNitrogen?: number;

  // Macronutrients - Others (ppm)
  phosphorus?: number;
  phosphorusMethod?: string;
  potassium?: number;
  calcium?: number;
  calciumCarbonate?: number;
  magnesium?: number;
  sulfur?: number;

  // Secondary Nutrients (ppm)
  sodium?: number;
  chloride?: number;

  // Micronutrients (ppm)
  iron?: number;
  manganese?: number;
  zinc?: number;
  copper?: number;
  boron?: number;
  molybdenum?: number;

  // Calculated Ratios
  caToMgRatio?: number;
  mgToKRatio?: number;
  basePercentCa?: number;
  basePercentMg?: number;
  basePercentK?: number;
  basePercentNa?: number;
  baseSaturationPercent?: number;

  // Interpretation
  interpretationLevel?: 'Low' | 'Medium' | 'High' | 'Very High';
  recommendations?: string;
  notes?: string;

  // System fields
  active: boolean;
  dateCreated?: Date | string;
  dateUpdated?: Date | string;
}

/**
 * Soil analysis response with additional info
 */
export interface SoilAnalysisResponse extends SoilAnalysis {
  textureInfo?: SoilTextureInfo;
  availableNutrients?: { [key: string]: AvailableNutrient };
}

/**
 * Soil texture classification information
 */
export interface SoilTextureInfo {
  textureClassName: string;
  description: string;
  typicalFieldCapacity?: number;
  typicalWiltingPoint?: number;
  typicalAvailableWater?: number;
  drainageClass?: string;
  workabilityClass?: string;
}

/**
 * Available nutrient calculation
 */
export interface AvailableNutrient {
  nutrient: string;
  soilTestValue: number;
  availabilityFactor: number;
  availableAmount: number;
  unit: string;
}

/**
 * Texture validation result
 */
export interface TextureValidation {
  isValid: boolean;
  textureClass?: string;
  errorMessage?: string;
  textureInfo?: SoilTextureInfo;
}

/**
 * API Response wrapper
 */
export interface SoilAnalysisApiResponse {
  success: boolean;
  result: SoilAnalysisResponse | SoilAnalysisResponse[];
  message?: string;
  exception?: string;
}
