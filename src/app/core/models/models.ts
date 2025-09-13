// src/app/core/models/company.model.ts
export interface Company {
  id: number;
  name: string;
  description?: string | undefined;
  address?: string | undefined;
  phoneNumber?: string | undefined;
  email?: string | undefined;
  website?: string | undefined;
  taxId?: string | undefined;
  logo?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/features/irrigation/models/irrigation-engineering.models.ts

// =============================================================================
// MAIN IRRIGATION DESIGN INTERFACE
// =============================================================================

export interface HydraulicCalculationResult {
  pressureLoss: number; // bar
  flowRate: number; // L/min
  velocity: number; // m/s
  requiredPower: number; // W
}

export interface OptimizationResult {
  efficiency: number; // %
  cost: number; // currency
  uniformity: number; // %
  sustainability: number; // %
}

export interface WaterQualityAnalysis {
  ph: number;
  electricalConductivity: number; // dS/m
  totalDissolvedSolids: number; // ppm
  nitrates: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
}

export interface CorrosionProtection {
  material: string;
  thickness: number; // mm
  treatment: string;
}

export interface SupportStructure {
  type: 'post' | 'beam' | 'truss';
  material: string;
  height: number; // mm
  width: number; // mm
  length: number; // mm
}

export interface AccessPoint {
  type: 'valve' | 'junction' | 'inspection';
  location: string;
}

export interface PressureRegulatorSpec {
  type: 'manual' | 'automatic';
  pressureSetting: number; // bar
  flowRate: number; // L/min
}

export interface MaterialSpecification {
  name: string;
  type: string;
  density: number; // kg/m³
  thermalConductivity: number; // W/(m·K)
  specificHeat: number; // J/(kg·K)
}

export interface FlowMeterSpec {
  type: 'mechanical' | 'electromagnetic' | 'ultrasonic';
  diameter: number; // mm
  flowRange: {
    min: number; // L/min
    max: number; // L/min
  };
}

export interface CompatibilityMatrix {
  [key: string]: {
    [key: string]: boolean;
  };
}

export interface EnvironmentalRating {
  [key: string]: number; // Environmental impact scores
}

export interface ExcavationSpec {
  depth: number; // meters
  width: number; // meters
  soilType: string;
  slope: string;
  safetyMeasures: string[];
}

export interface BackfillSpec {
  material: string;
  compaction: string;
  layering: string;
}

export interface MarkingSpec {
  type: 'permanent' | 'temporary';
  color: string;
  location: string;
}

export interface CompactionSpec {
  method: 'static' | 'dynamic';
  equipment: string;
  moistureContent: number; // percentage
}

export interface PressureTestSpec {
  testPressure: number; // bar
  duration: number; // minutes
  acceptableDrop: number; // bar
}

export interface CostBreakdown {
  materials: number; // currency
  labor: number; // currency
  equipment: number; // currency
  total: number; // currency
}

export interface LeakTestSpec {
  testPressure: number; // bar
  duration: number; // minutes
  acceptableDrop: number; // bar
}

export interface CommissioningSpec {
  procedures: string[];
}

export interface ServiceConnection {
  type: 'permanent' | 'temporary';
  location: string;
  diameter: number; // mm
  material: string;
}

export interface MaintenanceAccess {
  accessId: string;
  location: string;
  type: 'manhole' | 'hatch' | 'door' | 'panel' | 'pit';
  dimensions: {
    length: number; // mm
    width: number; // mm
    height?: number; // mm
  };
  accessibilityLevel: 'easy' | 'moderate' | 'restricted';
  safetyFeatures: string[];
  notes?: string;
}

export interface DrainagePoint {
  pointId: string;
  location: string;
  type: 'drain-valve' | 'sump' | 'gravity-drain';
  diameter: number; // mm
  dischargeCapacity: number; // L/min
  elevation: number; // meters
  notes?: string;
}

export interface VentingPoint {
  pointId: string;
  location: string;
  type: 'air-valve' | 'vacuum-breaker' | 'vent-pipe';
  diameter: number; // mm
  ventingCapacity: number; // L/min
  elevation: number; // meters
  notes?: string;
}

export interface MonitoringPoint {
  pointId: string;
  location: string;
  monitoredParameter: string;
  sensorType: string;
  installationDate: Date;
  lastCalibrationDate?: Date;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  notes?: string;
}

export interface ReplacementSchedule {
  component: string;
  replacementInterval: number; // years
  nextReplacementDate: Date;
  estimatedCost: number;
  reason: string;
  notes?: string;
}

export interface TechnicalDrawing {
  drawingId: string;
  title: string;
  fileUrl: string;
  format: string;
  revision: string;
  createdBy: string;
  createdAt: Date;
  description?: string;
}

export interface SpecificationDocument {
  documentId: string;
  title: string;
  fileUrl: string;
  version: string;
  createdBy: string;
  createdAt: Date;
  description?: string;
}

export interface CalculationDocument {
  calculationId: string;
  title: string;
  fileUrl: string;
  calculationType: string;
  createdBy: string;
  createdAt: Date;
  description?: string;
}

export interface MaterialList {
  listId: string;
  title: string;
  items: MaterialListItem[];
  createdBy: string;
  createdAt: Date;
  description?: string;
}

export interface MaterialListItem {
  materialName: string;
  quantity: number;
  unit: string;
  specification?: string;
  supplier?: string;
  notes?: string;
}

export interface InstallationGuide {
  guideId: string;
  title: string;
  fileUrl: string;
  version: string;
  createdBy: string;
  createdAt: Date;
  description?: string;
}

export interface MaintenanceManual {
  manualId: string;
  title: string;
  fileUrl: string;
  version: string;
  createdBy: string;
  createdAt: Date;
  description?: string;
}

export interface IrrigationDesign {
  id: number;
  name: string;
  description: string;
  cropProductionId: number;
  designType: 'drip' | 'sprinkler' | 'micro-sprinkler' | 'subsurface' | 'overhead';
  status: 'draft' | 'validated' | 'approved' | 'implemented' | 'archived';
  version: string;

  // Core Design Parameters
  designParameters: {
    // Basic Information
    totalArea: number; // m²
    numberOfSectors: number;
    containerDensity: number; // containers/m²
    plantDensity: number; // plants/m²

    // Layout Configuration
    rowSpacing: number; // meters
    plantSpacing: number; // meters
    containerSpacing: number; // meters
    sectorLayout: SectorLayout[];

    // Water Requirements
    dailyWaterRequirement: number; // L/day/plant
    irrigationFrequency: number; // times per day
    irrigationDuration: number; // minutes per session
    peakWaterDemand: number; // L/min

    // Environmental Parameters
    climate: ClimateParameters;
    location: LocationParameters;

    // System Components
    containerId: number;
    dropperId: number;
    growingMediumId: number;

    // Infrastructure
    pipelineConfiguration: PipelineConfiguration;
    systemComponents: SystemComponents;
    automationLevel: 'manual' | 'semi-automatic' | 'fully-automatic';
  };

  // Hydraulic Design
  hydraulicParameters: HydraulicParameters;

  // Optimization Settings
  optimizationParameters?: DesignOptimization;

  // Calculation Results
  calculationResults: {
    hydraulic?: any;
    validation?: SystemValidation;
    optimization?: any;
    economic?: EconomicAnalysis;
    pipeline?: PipelineDesign;
    waterQuality?: WaterQualityAnalysis;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy?: number;
  tags: string[];
  isTemplate: boolean;
  templateCategory?: string;

  // Compliance and Standards
  designStandards: string[]; // ISO, ASAE, etc.
  regulatoryCompliance: any;

  // Project Information
  projectInfo?: {
    clientName: string;
    projectLocation: string;
    budgetRange: number;
    implementationDate: Date;
    expectedLifespan: number; // years
  };
}

// =============================================================================
// HYDRAULIC PARAMETERS INTERFACE
// =============================================================================

export interface HydraulicParameters {
  // Operating Conditions
  operatingPressure: number; // bar
  maxFlowRate: number; // L/min
  designVelocity: number; // m/s
  workingPressureRange: {
    min: number; // bar
    max: number; // bar
    optimal: number; // bar
  };

  // Pressure Management
  pressureLossCalculations: {
    frictionLossCoefficient: number;
    minorLossCoefficient: number;
    elevationChange: number; // meters
    pressureRegulationRequired: boolean;
    safetyFactor: number;
  };

  // Flow Characteristics
  flowParameters: {
    totalSystemFlow: number; // L/min
    sectorFlowRates: number[]; // L/min per sector
    peakFlowRate: number; // L/min
    minimumFlowRate: number; // L/min
    flowVariationTolerance: number; // percentage
  };

  // Emitter Specifications
  emitterConfiguration: EmitterConfiguration;

  // Uniformity Requirements
  uniformityTargets: {
    distributionUniformity: number; // percentage (target)
    emissionUniformity: number; // percentage (target)
    coefficientOfVariation: number; // maximum allowed
    christiansenCoefficient: number; // target
  };

  // Pressure Loss Distribution
  pressureLossBreakdown: {
    mainLineLoss: number; // bar
    secondaryLineLoss: number; // bar
    lateralLineLoss: number; // bar
    emitterLoss: number; // bar
    fittingsLoss: number; // bar
    elevationLoss: number; // bar
    totalSystemLoss: number; // bar
  };

  // System Dynamics
  systemDynamics: {
    startupPressure: number; // bar
    shutdownPressure: number; // bar
    pressureFluctuationRange: number; // bar
    responseTime: number; // seconds
    stabilizationTime: number; // seconds
  };

  // Performance Metrics
  performanceMetrics: {
    hydraulicEfficiency: number; // percentage
    energyEfficiency: number; // percentage
    applicationEfficiency: number; // percentage
    conveyanceEfficiency: number; // percentage
    overallSystemEfficiency: number; // percentage
  };

  // Validation Criteria
  validationCriteria: {
    pressureTolerances: {
      acceptable: number; // ±percentage
      optimal: number; // ±percentage
    };
    flowTolerances: {
      acceptable: number; // ±percentage
      optimal: number; // ±percentage
    };
    velocityLimits: {
      minimum: number; // m/s
      maximum: number; // m/s
    };
  };
}

// =============================================================================
// SYSTEM VALIDATION INTERFACE
// =============================================================================

export interface SystemValidation {
  // Overall Validation Status
  isValid: boolean;
  overallScore: number; // 0-100
  validationTimestamp: Date;
  validationVersion: string;

  // Validation Categories
  categories: {
    hydraulic: CategoryValidation;
    structural: CategoryValidation;
    operational: CategoryValidation;
    environmental: CategoryValidation;
    economic: CategoryValidation;
    regulatory: CategoryValidation;
  };

  // Issues and Recommendations
  issues: ValidationIssue[];
  recommendations: ValidationRecommendation[];
  warnings: ValidationWarning[];

  // Detailed Validations
  pressureValidation: {
    isValid: boolean;
    score: number;
    minPressure: number; // bar
    maxPressure: number; // bar
    averagePressure: number; // bar
    pressureVariation: number; // percentage
    criticalPoints: PressureCriticalPoint[];
    compliance: {
      withinOperatingRange: boolean;
      meetsUniformityRequirements: boolean;
      satisfiesEmitterRequirements: boolean;
    };
  };

  flowValidation: {
    isValid: boolean;
    score: number;
    totalFlowBalance: number; // percentage deviation
    sectorFlowBalance: number[]; // percentage deviation per sector
    flowDistributionUniformity: number; // percentage
    adequateFlowForAllZones: boolean;
    flowStabilityIndex: number; // 0-100
    compliance: {
      meetsDesignFlowRequirements: boolean;
      maintainsFlowUniformity: boolean;
      providesAdequateFlowMargin: boolean;
    };
  };

  uniformityValidation: {
    isValid: boolean;
    score: number;
    achievedUniformity: number; // percentage
    targetUniformity: number; // percentage
    uniformityGrade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unacceptable';
    spatialUniformity: number; // percentage
    temporalUniformity: number; // percentage
    coefficientOfVariation: number;
    uniformityMap: UniformityMap;
  };

  // Technical Compliance
  technicalCompliance: {
    velocityCompliance: boolean;
    pressureCompliance: boolean;
    materialCompatibility: boolean;
    standardsCompliance: boolean;
    safetyCompliance: boolean;
    environmentalCompliance: boolean;
    details: {
      velocityRange: { min: number; max: number; withinLimits: boolean; };
      pressureRange: { min: number; max: number; withinLimits: boolean; };
      materialSafety: { rating: string; approved: boolean; };
      applicableStandards: string[];
      complianceGaps: string[];
    };
  };

  // Performance Predictions
  performancePrediction: {
    expectedLifespan: number; // years
    maintenanceFrequency: number; // times per year
    energyEfficiency: number; // percentage
    waterUseEfficiency: number; // percentage
    degradationCurve: PerformanceDegradation[];
    reliabilityScore: number; // 0-100
    failureRiskAssessment: {
      probability: number; // percentage
      impact: 'Low' | 'Medium' | 'High' | 'Critical';
      mitigationStrategies: string[];
    };
  };

  // Quality Assurance
  qualityAssurance: {
    designReviewComplete: boolean;
    calculationsVerified: boolean;
    parametersValidated: boolean;
    reviewComments: string[];
    approvalStatus: 'Pending' | 'Approved' | 'Rejected' | 'Conditional';
    reviewer: string;
    reviewDate: Date;
  };
}

// =============================================================================
// DESIGN OPTIMIZATION INTERFACE
// =============================================================================

export interface DesignOptimization {
  // Optimization Configuration
  optimizationId: string;
  optimizationMethod: 'genetic' | 'gradient' | 'simulated-annealing' | 'particle-swarm' | 'hybrid';
  primaryObjective: 'efficiency' | 'cost' | 'uniformity' | 'sustainability' | 'performance' | 'multi-objective';

  // Objective Functions
  objectives: {
    efficiency: ObjectiveFunction;
    cost: ObjectiveFunction;
    uniformity: ObjectiveFunction;
    sustainability: ObjectiveFunction;
    reliability: ObjectiveFunction;
    maintenance: ObjectiveFunction;
  };

  // Constraints
  constraints: {
    budget: {
      maximum: number;
      currency: string;
      includeOperatingCosts: boolean;
    };
    performance: {
      minimumEfficiency: number; // percentage
      minimumUniformity: number; // percentage
      maximumPressureLoss: number; // bar
    };
    physical: {
      maximumArea: number; // m²
      availableElevation: number; // meters
      existingInfrastructure: string[];
    };
    regulatory: {
      waterUseRestrictions: boolean;
      environmentalLimits: EnvironmentalLimit[];
      safetyRequirements: string[];
    };
    operational: {
      maintenanceAccessibility: boolean;
      automationLevel: string;
      operatorSkillLevel: 'Basic' | 'Intermediate' | 'Advanced';
    };
  };

  // Algorithm Parameters
  algorithmParameters: {
    populationSize?: number; // for genetic algorithms
    generations?: number; // for genetic algorithms
    mutationRate?: number; // for genetic algorithms
    crossoverRate?: number; // for genetic algorithms
    learningRate?: number; // for gradient methods
    maxIterations: number;
    convergenceTolerance: number;
    timeLimit: number; // seconds
    parallelProcessing: boolean;
  };

  // Optimization Results
  results: {
    converged: boolean;
    iterations: number;
    executionTime: number; // seconds
    bestSolution: OptimizedSolution;
    alternativeSolutions: OptimizedSolution[];
    paretoFront?: ParetoSolution[]; // for multi-objective optimization
    convergenceHistory: ConvergencePoint[];
  };

  // Sensitivity Analysis
  sensitivityAnalysis: {
    parameterSensitivity: ParameterSensitivity[];
    robustness: number; // 0-100
    uncertaintyAnalysis: UncertaintyAnalysis;
    riskAssessment: OptimizationRisk[];
  };

  // Scenario Analysis
  scenarios: {
    baseCase: ScenarioResult;
    optimisticCase: ScenarioResult;
    pessimisticCase: ScenarioResult;
    customScenarios: ScenarioResult[];
  };

  // Performance Comparison
  performanceComparison: {
    originalDesign: PerformanceMetrics;
    optimizedDesign: PerformanceMetrics;
    improvements: {
      efficiency: number; // percentage improvement
      cost: number; // percentage reduction
      uniformity: number; // percentage improvement
      sustainability: number; // percentage improvement
    };
  };
}

// =============================================================================
// PIPELINE DESIGN INTERFACE
// =============================================================================

export interface DisinfectionSpec {
  method: string;
  dosage: number; // mg/L
  contactTime: number; // minutes
  byproducts: string[];
}

export interface PipelineDesign {
  // Design Identification
  designId: string;
  designVersion: string;
  lastUpdated: Date;

  // Main Distribution System
  mainPipeline: {
    diameter: number; // mm
    length: number; // meters
    material: PipeMaterial;
    pressureRating: number; // bar
    flowCapacity: number; // L/min
    installationDepth: number; // meters
    insulationRequired: boolean;
    corrosionProtection: CorrosionProtection;
    supportStructure: SupportStructure[];
    accessPoints: AccessPoint[];
  };

  // Secondary Distribution Lines
  secondaryLines: PipelineSection[];

  // Lateral Distribution Lines
  lateralLines: PipelineSection[];

  // Pipeline Network
  networkTopology: {
    totalLength: number; // meters
    numberOfJunctions: number;
    numberOfSections: number;
    branchingPoints: BranchingPoint[];
    loopConfiguration: boolean;
    redundancyLevel: 'None' | 'Partial' | 'Full';
  };

  // Hydraulic Profile
  hydraulicProfile: {
    elevationProfile: ElevationPoint[];
    pressureProfile: PressurePoint[];
    velocityProfile: VelocityPoint[];
    hydraulicGradeLine: HGLPoint[];
    energyGradeLine: EGLPoint[];
  };

  // Fittings and Components
  fittings: {
    valves: ValveSpecification[];
    tees: FittingSpecification[];
    elbows: FittingSpecification[];
    reducers: FittingSpecification[];
    couplings: FittingSpecification[];
    filters: FilterSpecification[];
    pressureRegulators: PressureRegulatorSpec[];
    flowMeters: FlowMeterSpec[];
  };

  // Materials and Specifications
  materials: {
    pipeMaterials: MaterialSpecification[];
    fittingMaterials: MaterialSpecification[];
    supportMaterials: MaterialSpecification[];
    totalMaterialCost: CostBreakdown;
    materialCompatibility: CompatibilityMatrix;
    environmentalRating: EnvironmentalRating;
  };

  // Installation Specifications
  installation: {
    excavationRequirements: ExcavationSpec[];
    backfillSpecifications: BackfillSpec[];
    compactionRequirements: CompactionSpec[];
    markingAndProtection: MarkingSpec[];
    testing: {
      pressureTesting: PressureTestSpec;
      leakTesting: LeakTestSpec;
      disinfection: DisinfectionSpec;
      commissioning: CommissioningSpec;
    };
  };

  // Maintenance and Access
  maintenance: {
    accessRequirements: MaintenanceAccess[];
    serviceConnections: ServiceConnection[];
    drainagePoints: DrainagePoint[];
    ventingPoints: VentingPoint[];
    monitoringPoints: MonitoringPoint[];
    replacementSchedule: ReplacementSchedule[];
  };

  // Documentation
  documentation: {
    technicalDrawings: TechnicalDrawing[];
    specifications: SpecificationDocument[];
    calculations: CalculationDocument[];
    materialLists: MaterialList[];
    installationGuides: InstallationGuide[];
    maintenanceManuals: MaintenanceManual[];
  };
}

// =============================================================================
// EMITTER CONFIGURATION INTERFACE
// =============================================================================

export interface EmitterConfiguration {
  // Emitter Identification
  emitterId: number;
  emitterType: 'drip' | 'micro-spray' | 'bubbler' | 'fogger' | 'sprinkler';
  manufacturer: string;
  model: string;
  partNumber: string;

  // Flow Characteristics
  flowCharacteristics: {
    nominalFlowRate: number; // L/h at rated pressure
    ratedPressure: number; // bar
    flowEquation: FlowEquation;
    flowExponent: number;
    pressureCompensating: boolean;
    selfCleaning: boolean;
    antiDrain: boolean;
  };

  // Physical Specifications
  physicalSpecs: {
    dimensions: {
      length: number; // mm
      width: number; // mm
      height: number; // mm
      weight: number; // grams
    };
    connectionType: 'barbed' | 'threaded' | 'push-fit' | 'snap-on';
    connectionSize: string; // e.g., "4mm", "1/4 inch"
    materials: {
      body: string;
      orifice: string;
      membrane: string;
      colorCode: string;
    };
  };

  // Performance Parameters
  performance: {
    operatingPressureRange: {
      minimum: number; // bar
      maximum: number; // bar
      optimal: number; // bar
    };
    temperatureRange: {
      minimum: number; // °C
      maximum: number; // °C
    };
    flowRateRange: {
      minimum: number; // L/h
      maximum: number; // L/h
    };
    uniformityCoefficient: number; // percentage
    coefficientOfVariation: number; // percentage
    cloggingResistance: 'Low' | 'Medium' | 'High' | 'Very High';
  };

  // Installation Parameters
  installation: {
    spacing: {
      alongLateral: number; // meters
    };
    placement: {
      height: number; // mm above ground
      angle: number; // degrees from vertical
      orientation: string;
    };
    lateralConfiguration: {
      emittersPerLateral: number;
      lateralSpacing: number; // meters
      lateralLength: number; // meters
    };
  };

  // Water Quality Requirements
  waterQualityRequirements: {
    filtrationLevel: number; // mesh size
    maximumTDS: number; // ppm
    pHRange: {
      minimum: number;
      maximum: number;
    };
    chemicalCompatibility: ChemicalCompatibility[];
    biologicalRisk: 'Low' | 'Medium' | 'High';
  };

  // Economic Factors
  economics: {
    unitCost: number;
    currency: string;
    expectedLifespan: number; // years
    replacementCost: number;
    maintenanceCost: number; // annual
    energyConsumption: number; // kWh/year
  };

  // Quality Control
  qualityControl: {
    manufacturingTolerance: number; // percentage
    qualityGrade: 'A' | 'B' | 'C';
    certifications: string[];
    warrantyPeriod: number; // months
    failureRate: number; // percentage per year
  };

  // Environmental Impact
  environmentalImpact: {
    recyclable: boolean;
    biodegradable: boolean;
    carbonFootprint: number; // kg CO2 equivalent
    environmentalRating: string;
  };
}

// =============================================================================
// WATER QUALITY PARAMETERS INTERFACE
// =============================================================================

export interface WaterQualityParameters {
  // Basic Parameters
  basicParameters: {
    ph: number;
    electricalConductivity: number; // dS/m
    totalDissolvedSolids: number; // ppm
    turbidity: number; // NTU
    temperature: number; // °C
    totalSuspendedSolids: number; // ppm
  };

  // Chemical Parameters
  chemicalParameters: {
    // Macronutrients
    nitrogen: {
      totalNitrogen: number; // ppm
      nitrates: number; // ppm as NO3-N
      nitrites: number; // ppm as NO2-N
      ammonium: number; // ppm as NH4-N
    };
    phosphorus: {
      totalPhosphorus: number; // ppm
      orthophosphate: number; // ppm as PO4-P
    };
    potassium: number; // ppm as K

    // Secondary nutrients
    calcium: number; // ppm as Ca
    magnesium: number; // ppm as Mg
    sulfur: number; // ppm as S

    // Micronutrients
    iron: number; // ppm as Fe
    manganese: number; // ppm as Mn
    zinc: number; // ppm as Zn
    copper: number; // ppm as Cu
    boron: number; // ppm as B
    molybdenum: number; // ppm as Mo

    // Other ions
    chloride: number; // ppm as Cl
    sodium: number; // ppm as Na
    bicarbonate: number; // ppm as HCO3
    carbonate: number; // ppm as CO3
    fluoride: number; // ppm as F
  };

  // Biological Parameters
  biologicalParameters: {
    totalColiform: number; // CFU/100ml
    fecalColiform: number; // CFU/100ml
    escherichiaColi: number; // CFU/100ml
    heterotrophicPlateCount: number; // CFU/ml
    algae: number; // cells/ml
    bacteria: number; // CFU/ml
    biologicalOxygenDemand: number; // ppm
    chemicalOxygenDemand: number; // ppm
  };

  // Physical Parameters
  physicalParameters: {
    color: number; // Pt-Co units
    odor: 'None' | 'Slight' | 'Moderate' | 'Strong';
    taste: 'None' | 'Slight' | 'Moderate' | 'Strong';
    foaming: boolean;
    oilAndGrease: number; // ppm
    totalSolids: number; // ppm
    volatileSolids: number; // ppm
    fixedSolids: number; // ppm
  };

  // Heavy Metals and Toxins
  heavyMetals: {
    lead: number; // ppm as Pb
    cadmium: number; // ppm as Cd
    chromium: number; // ppm as Cr
    mercury: number; // ppm as Hg
    arsenic: number; // ppm as As
    aluminum: number; // ppm as Al
    nickel: number; // ppm as Ni
  };

  // Quality Assessment
  qualityAssessment: {
    overallGrade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unacceptable';
    irrigationSuitability: 'Highly Suitable' | 'Suitable' | 'Marginal' | 'Unsuitable';
    salinity: {
      hazard: 'Low' | 'Medium' | 'High' | 'Very High';
      classification: SalinityClassification;
    };
    sodicity: {
      hazard: 'Low' | 'Medium' | 'High' | 'Very High';
      sodiumAdsorptionRatio: number;
    };
    cloggingRisk: {
      physical: 'Low' | 'Medium' | 'High';
      chemical: 'Low' | 'Medium' | 'High';
      biological: 'Low' | 'Medium' | 'High';
      overall: 'Low' | 'Medium' | 'High';
    };
    treatmentRequired: boolean;
    recommendations: WaterTreatmentRecommendation[];
  };

  // Compatibility Analysis
  compatibilityAnalysis: {
    emitterCompatibility: {
      compatible: boolean;
      riskFactors: string[];
      recommendedEmitterTypes: string[];
      filtrationRequirements: FilterRequirement[];
    };
    pipeCompatibility: {
      compatible: boolean;
      materialRecommendations: string[];
      corrosionRisk: 'Low' | 'Medium' | 'High';
      protectionRequired: boolean;
    };
    fertilizerCompatibility: {
      compatible: boolean;
      incompatibleCompounds: string[];
      precipitationRisk: 'Low' | 'Medium' | 'High';
      recommendations: string[];
    };
    cropCompatibility: {
      suitable: boolean;
      toxicityRisk: 'Low' | 'Medium' | 'High';
      yieldImpact: 'Positive' | 'Neutral' | 'Negative';
      longTermEffects: string[];
    };
  };

  // Monitoring and Testing
  monitoring: {
    samplingDate: Date;
    samplingLocation: string;
    samplingMethod: string;
    laboratoryName: string;
    certificationNumber: string;
    analysisDate: Date;
    chainOfCustody: boolean;
    qualityControl: {
      duplicates: boolean;
      blanks: boolean;
      standards: boolean;
    };
  };

  // Regulatory Compliance
  regulatoryCompliance: {
    drinkingWaterStandards: ComplianceStatus;
    irrigationWaterStandards: ComplianceStatus;
    environmentalRegulations: ComplianceStatus;
    localRegulations: ComplianceStatus;
    certificationRequired: boolean;
    permitRequired: boolean;
  };
}

// =============================================================================
// ECONOMIC ANALYSIS INTERFACE
// =============================================================================

export interface EconomicAnalysis {
  // Analysis Metadata
  analysisId: string;
  analysisDate: Date;
  currency: string;
  exchangeRate: number;
  inflationRate: number; // annual percentage
  discountRate: number; // percentage for NPV calculations
  analysisHorizon: number; // years

  // Capital Investment
  capitalInvestment: {
    // Direct Costs
    equipmentCosts: {
      pipelineSystem: CostComponent;
      emitterSystem: CostComponent;
      pumpingSystem: CostComponent;
      filtrationSystem: CostComponent;
      controlSystem: CostComponent;
      automationSystem: CostComponent;
      fertilizerSystem: CostComponent;
      monitoringSystem: CostComponent;
      subtotal: number;
    };

    // Installation Costs
    installationCosts: {
      excavation: CostComponent;
      pipeInstallation: CostComponent;
      electricalWork: CostComponent;
      civilWork: CostComponent;
      commissioning: CostComponent;
      testing: CostComponent;
      training: CostComponent;
      subtotal: number;
    };

    // Indirect Costs
    indirectCosts: {
      engineering: CostComponent;
      projectManagement: CostComponent;
      permits: CostComponent;
      contingency: CostComponent;
      overhead: CostComponent;
      subtotal: number;
    };

    totalCapitalInvestment: number;
  };

  // Operating Costs
  operatingCosts: {
    // Annual Operating Costs
    annual: {
      water: CostComponent;
      energy: CostComponent;
      labor: CostComponent;
      maintenance: CostComponent;
      fertilizers: CostComponent;
      chemicals: CostComponent;
      insurance: CostComponent;
      administration: CostComponent;
      subtotal: number;
    };

    // Variable Costs
    variable: {
      waterPerUnit: number; // cost per m³
      energyPerUnit: number; // cost per kWh
      fertilizerPerUnit: number; // cost per kg
      laborPerHour: number; // cost per hour
    };

    // Lifecycle Operating Costs
    lifecycle: LifecycleCost[];
  };

  // Revenue and Benefits
  revenueAndBenefits: {
    // Direct Benefits
    directBenefits: {
      yieldIncrease: BenefitComponent;
      qualityImprovement: BenefitComponent;
      waterSavings: BenefitComponent;
      laborSavings: BenefitComponent;
      energySavings: BenefitComponent;
      fertilizerSavings: BenefitComponent;
      subtotal: number;
    };

    // Indirect Benefits
    indirectBenefits: {
      riskReduction: BenefitComponent;
      environmentalBenefits: BenefitComponent;
      sustainabilityValue: BenefitComponent;
      brandValue: BenefitComponent;
      regulatoryCompliance: BenefitComponent;
      subtotal: number;
    };

    totalAnnualBenefits: number;
  };

  // Financial Metrics
  financialMetrics: {
    // Profitability Metrics
    netPresentValue: {
      value: number;
      currency: string;
      assumptions: string[];
    };
    internalRateOfReturn: {
      value: number; // percentage
      hurdle_rate: number; // percentage
      acceptable: boolean;
    };
    profitabilityIndex: {
      value: number;
      interpretation: string;
    };

    // Recovery Metrics
    paybackPeriod: {
      simple: number; // years
      discounted: number; // years
      acceptable: boolean;
    };

    // Risk Metrics
    breakEvenAnalysis: {
      breakEvenPoint: number; // years
      breakEvenVolume: number; // units
      marginOfSafety: number; // percentage
    };

    // Efficiency Metrics
    costEffectiveness: {
      costPerHectare: number;
      costPerPlant: number;
      costPerLiterSaved: number;
      costPerYieldUnit: number;
    };
  };

  // Sensitivity Analysis
  sensitivityAnalysis: {
    // Key Variables
    keyVariables: SensitivityVariable[];

    // Scenario Analysis
    scenarios: {
      optimistic: ScenarioResults;
      mostLikely: ScenarioResults;
      pessimistic: ScenarioResults;
    };

    // Monte Carlo Results
    monteCarlo: {
      simulations: number;
      confidenceIntervals: ConfidenceInterval[];
      riskMetrics: RiskMetrics;
    };
  };

  // Cost-Benefit Analysis
  costBenefitAnalysis: {
    // Annual Cash Flow
    cashFlowProjection: CashFlowYear[];

    // Cumulative Analysis
    cumulativeAnalysis: {
      totalCosts: number;
      totalBenefits: number;
      netBenefit: number;
      benefitCostRatio: number;
    };

    // Break-even Analysis
    breakEvenAnalysis: {
      volumeBreakEven: number;
      revenueBreakEven: number;
      timeBreakEven: number; // years
      sensitivityToChanges: number; // percentage
    };
  };

  // Financing Options
  financingOptions: {
    // Cash Purchase
    cashPurchase: {
      totalCost: number;
      immediatePayment: number;
      taxBenefits: number;
      netCost: number;
    };

    // Loan Financing
    loanFinancing: {
      loanAmount: number;
      interestRate: number; // annual percentage
      loanTerm: number; // years
      monthlyPayment: number;
      totalInterest: number;
      totalPayments: number;
      collateralRequired: boolean;
    };

    // Lease Options
    leaseOptions: {
      operatingLease: LeaseOption;
      capitalLease: LeaseOption;
      saleAndLeaseback: LeaseOption;
    };

    // Government Incentives
    incentives: {
      grants: IncentiveProgram[];
      taxCredits: IncentiveProgram[];
      subsidies: IncentiveProgram[];
      rebates: IncentiveProgram[];
      totalIncentiveValue: number;
    };
  };

  // Risk Analysis
  riskAnalysis: {
    // Financial Risks
    financialRisks: {
      marketRisk: RiskAssessment;
      creditRisk: RiskAssessment;
      liquidityRisk: RiskAssessment;
      currencyRisk: RiskAssessment;
      interestRateRisk: RiskAssessment;
    };

    // Technical Risks
    technicalRisks: {
      technologyRisk: RiskAssessment;
      performanceRisk: RiskAssessment;
      reliabilityRisk: RiskAssessment;
      obsolescenceRisk: RiskAssessment;
    };

    // Operational Risks
    operationalRisks: {
      maintenanceRisk: RiskAssessment;
      operatorRisk: RiskAssessment;
      supplierRisk: RiskAssessment;
      regulatoryRisk: RiskAssessment;
    };

    // Environmental Risks
    environmentalRisks: {
      climateRisk: RiskAssessment;
      waterAvailabilityRisk: RiskAssessment;
      environmentalComplianceRisk: RiskAssessment;
    };

    // Risk Mitigation
    mitigation: {
      insurance: InsuranceOption[];
      warranties: WarrantyOption[];
      contractualProtections: ContractualProtection[];
      contingencyPlans: ContingencyPlan[];
    };
  };

  // Lifecycle Cost Analysis
  lifecycleCostAnalysis: {
    designLife: number; // years
    phases: {
      development: LifecyclePhase;
      procurement: LifecyclePhase;
      installation: LifecyclePhase;
      operation: LifecyclePhase;
      maintenance: LifecyclePhase;
      disposal: LifecyclePhase;
    };

    // Replacement Schedule
    replacementSchedule: ReplacementItem[];

    // Maintenance Schedule
    maintenanceSchedule: MaintenanceItem[];

    // Total Lifecycle Cost
    totalLifecycleCost: number;
    annualizedCost: number;
    costPerYear: LifecycleCostYear[];
  };

  // Value Engineering
  valueEngineering: {
    // Alternative Options
    alternatives: AlternativeOption[];

    // Value Analysis
    valueAnalysis: {
      functionAnalysis: FunctionAnalysis[];
      costWorthAnalysis: CostWorthRatio[];
      valueIndex: number;
    };

    // Optimization Opportunities
    optimizationOpportunities: OptimizationOpportunity[];

    // Cost Reduction Ideas
    costReductionIdeas: CostReductionIdea[];
  };

  // Reporting and Documentation
  reporting: {
    executiveSummary: ExecutiveSummary;
    detailedAnalysis: DetailedAnalysisSection[];
    assumptions: AssumptionsList;
    limitations: string[];
    recommendations: EconomicRecommendation[];
    nextSteps: string[];
  };
}

// =============================================================================
// SUPPORTING INTERFACES AND TYPES
// =============================================================================

// Layout and Configuration Types
export interface SectorLayout {
  sectorId: number;
  name: string;
  area: number; // m²
  numberOfContainers: number;
  containerArrangement: 'grid' | 'rows' | 'irregular';
  irrigationSchedule: IrrigationSchedule;
}

export interface ClimateParameters {
  averageTemperature: number; // °C
  averageHumidity: number; // percentage
  windSpeed: number; // m/s
  solarRadiation: number; // MJ/m²/day
  precipitation: number; // mm/year
  evapotranspiration: number; // mm/day
  frostDays: number; // days per year
  growingDegradeDays: number;
}

export interface LocationParameters {
  latitude: number; // degrees
  longitude: number; // degrees
  elevation: number; // meters above sea level
  timezone: string;
  climateZone: string;
  soilType: string;
  drainageClass: string;
}

export interface PipelineConfiguration {
  mainPipeDiameter: number; // mm
  secondaryPipeDiameter: number; // mm
  lateralPipeDiameter: number; // mm
  pipelineMaterial: 'PE' | 'PVC' | 'HDPE' | 'Steel' | 'Concrete';
  pressureRating: number; // bar
  buriedDepth: number; // meters
  insulation: boolean;
  corrosionProtection: boolean;
}

export interface SystemComponents {
  hasFiltration: boolean;
  hasAutomation: boolean;
  hasFertigation: boolean;
  hasBackflowPrevention: boolean;
  hasPressureRegulation: boolean;
  hasFlowMeter: boolean;
  hasLeakDetection: boolean;
  hasRemoteMonitoring: boolean;
}

// Validation Types
export interface CategoryValidation {
  isValid: boolean;
  score: number; // 0-100
  weight: number; // importance weight
  issues: string[];
  recommendations: string[];
}

export interface ValidationIssue {
  id: string;
  category: string;
  severity: 'info' | 'warning' | 'critical' | 'blocker';
  message: string;
  description: string;
  affectedParameter: string;
  currentValue: number | string;
  recommendedValue?: number | string;
  recommendedAction: string;
  impact: string;
  priority: number; // 1-10
}

export interface ValidationRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  implementation: string;
  costImpact: 'None' | 'Low' | 'Medium' | 'High';
  timeImpact: 'None' | 'Low' | 'Medium' | 'High';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  expectedBenefit: string;
}

export interface ValidationWarning {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  autoCorrectAvailable: boolean;
  userActionRequired: boolean;
}

export interface PressureCriticalPoint {
  location: string;
  coordinates: { x: number; y: number; };
  pressure: number; // bar
  requiredPressure: number; // bar
  deficit: number; // bar
  impact: string;
}

export interface UniformityMap {
  gridSize: number; // meters
  dataPoints: UniformityDataPoint[];
  interpolationMethod: string;
  contourLines: ContourLine[];
  colorScale: ColorScale;
}

export interface UniformityDataPoint {
  x: number; // coordinates
  y: number;
  uniformityValue: number; // percentage
  flowRate: number; // L/h
  pressure: number; // bar
}

export interface PerformanceDegradation {
  year: number;
  performanceLevel: number; // percentage of original
  maintenanceRequired: boolean;
  replacementRequired: boolean;
  cost: number;
}

// Optimization Types
export interface ObjectiveFunction {
  weight: number; // 0-100 percentage
  priority: number; // 1-10
  targetValue?: number;
  minimumValue?: number;
  maximumValue?: number;
  optimizationDirection: 'minimize' | 'maximize' | 'target';
}

export interface OptimizedSolution {
  solutionId: string;
  objectiveValue: number;
  parameters: { [key: string]: number };
  performance: PerformanceMetrics;
  feasible: boolean;
  constraintViolations: string[];
  rank: number;
}

export interface ParetoSolution {
  solutionId: string;
  objectives: { [objective: string]: number };
  parameters: { [parameter: string]: number };
  dominatedBy: string[];
  dominates: string[];
}

export interface ConvergencePoint {
  iteration: number;
  bestObjectiveValue: number;
  averageObjectiveValue: number;
  improvement: number;
  timestamp: Date;
}

export interface ParameterSensitivity {
  parameterName: string;
  baseValue: number;
  sensitivityCoefficient: number;
  elasticity: number;
  rankingSensitivity: number; // 1-10
}

export interface UncertaintyAnalysis {
  uncertainParameters: UncertainParameter[];
  correlations: ParameterCorrelation[];
  confidenceIntervals: ConfidenceInterval[];
  robustnessIndex: number; // 0-100
}

export interface OptimizationRisk {
  riskType: string;
  probability: number; // 0-1
  impact: number; // 0-10
  riskScore: number;
  mitigation: string;
}

export interface ScenarioResult {
  scenarioName: string;
  parameters: { [key: string]: number };
  results: PerformanceMetrics;
  probability: number; // 0-1
  description: string;
}

export interface PerformanceMetrics {
  efficiency: number; // percentage
  uniformity: number; // percentage
  cost: number; // currency units
  sustainability: number; // score 0-100
  reliability: number; // percentage
  waterUseEfficiency: number; // percentage
  energyEfficiency: number; // percentage
}

// Pipeline Types
export interface PipelineSection {
  sectionId: string;
  startPoint: Point3D;
  endPoint: Point3D;
  diameter: number; // mm
  length: number; // meters
  material: PipeMaterial;
  flowRate: number; // L/min
  velocity: number; // m/s
  pressureLoss: number; // bar
  reynoldsNumber: number;
  frictionFactor: number;
  roughness: number; // mm
}

export interface PipeMaterial {
  type: string;
  grade: string;
  pressureRating: number; // bar
  temperatureRating: number; // °C
  roughness: number; // mm
  thermalExpansion: number; // mm/m/°C
  elasticModulus: number; // GPa
  cost: number; // per meter
}

export interface BranchingPoint {
  pointId: string;
  coordinates: Point3D;
  branchType: 'tee' | 'cross' | 'reducer' | 'manifold';
  inletDiameter: number; // mm
  outletDiameters: number[]; // mm
  pressureLoss: number; // bar
  flowSplit: number[]; // percentages
}

export interface ElevationPoint {
  distance: number; // meters from start
  elevation: number; // meters above datum
  description: string;
}

export interface PressurePoint {
  distance: number; // meters from start
  staticPressure: number; // bar
  dynamicPressure: number; // bar
  totalPressure: number; // bar
}

export interface VelocityPoint {
  distance: number; // meters from start
  velocity: number; // m/s
  diameter: number; // mm
  reynoldsNumber: number;
}

export interface HGLPoint {
  distance: number; // meters from start
  hydraulicGradeElevation: number; // meters
}

export interface EGLPoint {
  distance: number; // meters from start
  energyGradeElevation: number; // meters
}

// Material and Component Types
export interface ValveSpecification {
  valveType: 'gate' | 'globe' | 'ball' | 'butterfly' | 'check' | 'pressure-relief';
  size: number; // mm
  material: string;
  pressureRating: number; // bar
  endConnections: string;
  actuationType: 'manual' | 'electric' | 'pneumatic' | 'hydraulic';
  location: string;
  function: string;
  cost: number;
}

export interface FittingSpecification {
  fittingType: string;
  size: number; // mm
  material: string;
  pressureRating: number; // bar
  angle?: number; // degrees for elbows
  reductionRatio?: number; // for reducers
  quantity: number;
  cost: number;
}

export interface FilterSpecification {
  filterType: 'screen' | 'disc' | 'media' | 'cartridge';
  meshSize: number; // microns
  flowCapacity: number; // L/min
  pressureDrop: number; // bar
  material: string;
  backwashCapable: boolean;
  automationLevel: string;
  maintenanceFrequency: number; // days
  cost: number;
}

// Water Quality Types
export interface SalinityClassification {
  class: 'C1' | 'C2' | 'C3' | 'C4';
  description: string;
  suitability: string;
  restrictions: string[];
}

export interface WaterTreatmentRecommendation {
  treatmentType: string;
  purpose: string;
  equipment: string;
  chemicalsRequired: string[];
  estimatedCost: number;
  maintenanceRequirements: string;
  effectiveness: number; // percentage
}

export interface FilterRequirement {
  filterType: string;
  meshSize: number; // microns
  capacity: number; // L/min
  backwashFrequency: number; // hours
  estimatedCost: number;
}

export interface ChemicalCompatibility {
  chemical: string;
  compatible: boolean;
  interaction: string;
  precautions: string[];
}

export interface ComplianceStatus {
  compliant: boolean;
  standardName: string;
  exceedances: string[];
  actionRequired: boolean;
}

// Economic Types
export interface CostComponent {
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  currency: string;
  supplier?: string;
  notes?: string;
}

export interface BenefitComponent {
  description: string;
  annualValue: number;
  currency: string;
  certainty: 'High' | 'Medium' | 'Low';
  timing: string;
  notes?: string;
}

export interface LifecycleCost {
  year: number;
  operatingCost: number;
  maintenanceCost: number;
  replacementCost: number;
  totalCost: number;
  inflationAdjusted: number;
}

export interface CashFlowYear {
  year: number;
  costs: number;
  benefits: number;
  netCashFlow: number;
  discountedCashFlow: number;
  cumulativeNPV: number;
}

export interface SensitivityVariable {
  variableName: string;
  baseValue: number;
  range: { min: number; max: number; };
  impactOnNPV: number; // percentage change
  impactOnIRR: number; // percentage points
  elasticity: number;
}

export interface ScenarioResults {
  npv: number;
  irr: number; // percentage
  paybackPeriod: number; // years
  totalCosts: number;
  totalBenefits: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface ConfidenceInterval {
  metric: string;
  confidence: number; // percentage (e.g., 95)
  lowerBound: number;
  upperBound: number;
  mean: number;
  standardDeviation: number;
}

export interface RiskMetrics {
  probabilityOfLoss: number; // percentage
  valueAtRisk: number; // currency
  expectedShortfall: number; // currency
  worstCaseScenario: number; // currency
  bestCaseScenario: number; // currency
}

export interface LeaseOption {
  leaseTerm: number; // years
  monthlyPayment: number;
  totalPayments: number;
  residualValue: number;
  purchaseOption: boolean;
  maintenanceIncluded: boolean;
  taxImplications: string;
}

export interface IncentiveProgram {
  programName: string;
  incentiveType: 'grant' | 'tax-credit' | 'subsidy' | 'rebate';
  amount: number;
  percentage?: number;
  eligibilityCriteria: string[];
  applicationProcess: string;
  timeline: string;
  certainty: 'Confirmed' | 'Likely' | 'Possible';
}

export interface RiskAssessment {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number; // percentage
  impact: number; // scale 1-10
  riskScore: number;
  description: string;
  mitigationStrategies: string[];
  residualRisk: 'Low' | 'Medium' | 'High';
}

export interface InsuranceOption {
  coverageType: string;
  coverageAmount: number;
  annualPremium: number;
  deductible: number;
  exclusions: string[];
  provider: string;
}

export interface WarrantyOption {
  component: string;
  warrantyPeriod: number; // years
  coverage: string;
  provider: string;
  cost: number;
  transferable: boolean;
}

export interface ContractualProtection {
  protectionType: string;
  description: string;
  enforceability: 'High' | 'Medium' | 'Low';
  cost: number;
}

export interface ContingencyPlan {
  riskScenario: string;
  responseStrategy: string;
  resourcesRequired: string[];
  estimatedCost: number;
  implementationTime: number; // days
}

export interface LifecyclePhase {
  phaseName: string;
  duration: number; // years
  costs: number;
  activities: string[];
  risks: string[];
  deliverables: string[];
}

export interface ReplacementItem {
  component: string;
  replacementYear: number;
  cost: number;
  reason: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface MaintenanceItem {
  component: string;
  frequency: number; // times per year
  annualCost: number;
  maintenanceType: 'Preventive' | 'Corrective' | 'Predictive';
  required: string[];
  downtime: number; // hours
}

export interface LifecycleCostYear {
  year: number;
  capitalCost: number;
  operatingCost: number;
  maintenanceCost: number;
  replacementCost: number;
  salvageValue: number;
  totalCost: number;
  netPresentValue: number;
}

export interface AlternativeOption {
  optionId: string;
  optionName: string;
  description: string;
  costs: number;
  benefits: number;
  risks: string[];
  advantages: string[];
  disadvantages: string[];
  feasibility: 'High' | 'Medium' | 'Low';
  recommendationLevel: 'Recommended' | 'Consider' | 'Not Recommended';
}

export interface FunctionAnalysis {
  functionName: string;
  verb: string;
  noun: string;
  functionType: 'Basic' | 'Secondary' | 'Supporting';
  cost: number;
  value: number;
  importance: number; // 1-10
}

export interface CostWorthRatio {
  functionName: string;
  cost: number;
  worth: number;
  ratio: number;
  evaluation: 'Good Value' | 'Fair Value' | 'Poor Value';
}

export interface OptimizationOpportunity {
  opportunityId: string;
  description: string;
  potentialSavings: number;
  implementationCost: number;
  paybackPeriod: number; // years
  riskLevel: 'Low' | 'Medium' | 'High';
  priority: number; // 1-10
}

export interface CostReductionIdea {
  ideaId: string;
  category: string;
  description: string;
  estimatedSavings: number;
  implementationEffort: 'Low' | 'Medium' | 'High';
  feasibility: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
}

// Emitter Types
export interface FlowEquation {
  equation: string;
  coefficients: number[];
  validRange: { min: number; max: number; };
  accuracy: number; // percentage
}

// General Utility Types
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface ContourLine {
  level: number;
  points: Point3D[];
  color: string;
}

export interface ColorScale {
  minimum: number;
  maximum: number;
  colorStops: ColorStop[];
}

export interface ColorStop {
  value: number;
  color: string;
  label: string;
}

export interface UncertainParameter {
  parameterName: string;
  distributionType: 'normal' | 'uniform' | 'triangular' | 'beta';
  parameters: number[];
  correlatedWith: string[];
}

export interface ParameterCorrelation {
  parameter1: string;
  parameter2: string;
  correlationCoefficient: number; // -1 to 1
  significance: 'High' | 'Medium' | 'Low';
}

// Additional Regulatory and Environmental Types
export interface RegulatoryCompliance {
  localRegulations: ComplianceItem[];
  nationalStandards: ComplianceItem[];
  internationalStandards: ComplianceItem[];
  environmentalRegulations: ComplianceItem[];
  safetyRegulations: ComplianceItem[];
  waterRights: WaterRightsCompliance;
}

export interface ComplianceItem {
  regulationName: string;
  authority: string;
  requirement: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Pending' | 'N/A';
  required: string[];
  deadline?: Date;
}

export interface WaterRightsCompliance {
  waterRightRequired: boolean;
  permitNumber?: string;
  allocatedVolume: number; // m³/year
  usageRestrictions: string[];
  reportingRequirements: string[];
  renewalDate?: Date;
}

export interface EnvironmentalLimit {
  limitType: string;
  parameter: string;
  maximumValue: number;
  unit: string;
  regulatingAuthority: string;
  penalty: string;
}

export interface IrrigationSchedule {
  scheduleId: string;
  frequency: number; // times per day
  duration: number; // minutes
  startTimes: string[]; // HH:MM format
  seasonalAdjustments: SeasonalAdjustment[];
  cropStageAdjustments: CropStageAdjustment[];
}

export interface SeasonalAdjustment {
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  adjustmentFactor: number; // multiplier
  adjustmentType: 'frequency' | 'duration' | 'both';
}

export interface CropStageAdjustment {
  cropStage: string;
  adjustmentFactor: number;
  waterRequirementMultiplier: number;
}

// Reporting Types
export interface ExecutiveSummary {
  projectName: string;
  totalInvestment: number;
  expectedReturn: number;
  paybackPeriod: number;
  riskLevel: string;
  recommendation: string;
  keyBenefits: string[];
  keyRisks: string[];
}

export interface DetailedAnalysisSection {
  sectionTitle: string;
  content: string;
  charts: ChartDefinition[];
  tables: TableDefinition[];
  appendices: string[];
}

export interface AssumptionsList {
  economicAssumptions: EconomicAssumption[];
  technicalAssumptions: TechnicalAssumption[];
  marketAssumptions: MarketAssumption[];
}

export interface EconomicAssumption {
  assumption: string;
  value: number | string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
}

export interface TechnicalAssumption {
  assumption: string;
  value: number | string;
  basis: string;
  uncertainty: number; // percentage
}

export interface MarketAssumption {
  assumption: string;
  value: number | string;
  marketData: string;
  timeframe: string;
}

export interface EconomicRecommendation {
  recommendationType: 'Investment' | 'Alternative' | 'Deferral' | 'Rejection';
  title: string;
  description: string;
  rationale: string;
  conditions: string[];
  priority: 'High' | 'Medium' | 'Low';
  timeframe: string;
}

export interface ChartDefinition {
  chartType: string;
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  series: string[];
}

export interface TableDefinition {
  title: string;
  headers: string[];
  rows: any[][];
  formatting: TableFormatting;
}

export interface TableFormatting {
  currency: boolean;
  percentage: boolean;
  decimals: number;
  alignment: 'left' | 'center' | 'right';
}

// src/app/core/models/farm.model.ts
export interface Farm {
  id: number;
  name: string;
  description?: string | undefined;
  companyId: number;
  company?: Company;
  location?: string | undefined;
  address?: string | undefined;
  area?: number; // hectares
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  climate?: string | undefined;
  soilType?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/crop.model.ts
export interface Crop {
  id: number;
  name: string;
  scientificName?: string | undefined;
  description?: string | undefined;
  type?: string | undefined; // 'Vegetal', 'Fruta', 'Cereal', 'Hierba', 'Otro'
  variety?: string | undefined;
  growthCycleDays?: number;
  harvestSeason?: string | undefined;
  waterRequirement?: string | undefined; // 'Bajo', 'Medio', 'Alto'
  optimalTemperatureMin?: number;
  optimalTemperatureMax?: number;
  nitrogenRequirement?: number;
  phosphorusRequirement?: number;
  potassiumRequirement?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/device.model.ts
export interface Device {
  id: number;
  name: string;
  description?: string | undefined;
  deviceType: string | undefined; // 'Sensor', 'Actuador', 'Controlador', 'Gateway', 'Camara', 'Estacion Meteorologica'
  serialNumber?: string | undefined;
  model?: string | undefined;
  manufacturer?: string | undefined;
  firmwareVersion?: string | undefined;
  macAddress?: string | undefined;
  ipAddress?: string | undefined;
  batteryLevel?: number;
  signalStrength?: number;
  status: string | undefined; // 'Online', 'Offline', 'Maintenance', 'Error'
  lastSeen?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/production-unit.model.ts
export interface ProductionUnitType {
  id: number;
  name: string | undefined;
  description?: string | undefined;
}

export interface ProductionUnit {
  id: number;
  name: string | undefined;
  description?: string | undefined;
  farmId: number;
  farm?: Farm;
  productionUnitTypeId: number;
  productionUnitType?: ProductionUnitType;
  area?: number; // square meters
  capacity?: number;
  location?: string | undefined;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/crop-production.model.ts
export interface CropProduction {
  containerId?: any;
  dropperId: any;
  growingMediumId: any;
  numberOfDroppersPerContainer: number;
  area: number;
  id: number;
  code?: string | undefined;
  cropId: number;
  crop?: Crop;
  productionUnitId: number;
  productionUnit?: ProductionUnit;
  plantingDate: Date;
  estimatedHarvestDate?: Date;
  actualHarvestDate?: Date;
  status: string | undefined; // 'Preparacion', 'Siembra', 'Crecimiento', 'Floracion', 'Fructificacion', 'Cosecha', 'Finalizada'
  progress?: number; // percentage 0-100
  plantedArea?: number;
  expectedYield?: number;
  actualYield?: number;
  description?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  name: string | undefined; // computed: crop.name + ' - ' + productionUnit.name
  updatedAt?: Date;
}

// src/app/core/models/irrigation-sector.model.ts
export interface IrrigationSector {
  id: number;
  name: string | undefined;
  description?: string | undefined;
  cropProductionId: number;
  cropProduction?: CropProduction;
  irrigationStatus: string | undefined; // 'running', 'scheduled', 'stopped', 'maintenance', 'error'
  isIrrigating: boolean;
  hasError: boolean;
  currentTemperature?: number;
  currentHumidity?: number;
  waterFlow?: number;
  irrigationProgress?: number;
  remainingTime?: number;
  nextIrrigationTime?: Date;
  lastIrrigationTime?: Date;
  scheduleEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface FertilizerComposition {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  micronutrients?: string | undefined;
}

// src/app/core/models/fertilizer.model.ts
export interface Fertilizer {
  id: number;
  optimizationScore?: number;
  name: string | undefined;
  brand?: string | undefined;
  description?: string | undefined;
  type: string | undefined; // 'Organico', 'Inorganico', 'Liquido', 'Solido', 'Foliar'
  formulation?: string | undefined;
  concentration?: number;
  concentrationUnit?: string | undefined;
  applicationMethod?: string | undefined; // 'Riego', 'Foliar', 'Suelo', 'Fertirrigacion'
  nitrogenPercentage?: number;
  phosphorusPercentage?: number;
  potassiumPercentage?: number;
  micronutrients?: string | undefined;
  currentStock?: number;
  minimumStock?: number;
  stockUnit?: string | undefined;
  pricePerUnit?: number;
  supplier?: string | undefined;
  expirationDate?: Date;
  storageInstructions?: string | undefined;
  applicationInstructions?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  composition?: FertilizerComposition[];
}

// src/app/core/models/fertilizer-input.model.ts
export interface FertilizerInput {
  id: number;
  cropProductionId: number;
  cropProduction?: CropProduction;
  fertilizerId: number;
  fertilizer?: Fertilizer;
  applicationDate: Date;
  quantity: number;
  quantityUnit?: string | undefined;
  concentration?: number;
  concentrationUnit?: string | undefined;
  applicationMethod: string | undefined; // 'Riego', 'Foliar', 'Suelo', 'Fertirrigacion'
  appliedById: number;
  appliedBy?: User;
  verifiedById?: number;
  verifiedBy?: User;
  status: string | undefined; // 'planned', 'applied', 'verified', 'cancelled'
  notes?: string | undefined;
  weatherConditions?: string | undefined;
  soilConditions?: string | undefined;
  cost?: number;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/user.model.ts
export interface Profile {
  id: number;
  name: string | undefined;
  description?: string | undefined;
  permissions?: string | undefined[];
}

export interface UserStatus {
  id: number;
  name: string | undefined;
  description?: string | undefined;
}

export interface UserFarm {
  id: number;
  userId: number;
  farmId: number;
  farm?: Farm;
  role?: string | undefined;
  permissions?: string | undefined[];
  createdAt: Date;
}

export interface UserPreferences {
  language: string | undefined;
  timezone: string | undefined;
  dateFormat: string | undefined;
  theme: string | undefined;
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertsEnabled: boolean;
  weeklyReports: boolean;
}

export interface User {
  id: number;
  username: string | undefined;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  name: string | undefined; // computed: firstName + lastName
  phoneNumber?: string | undefined;
  position?: string | undefined;
  department?: string | undefined;
  bio?: string | undefined;
  profilePicture?: string | undefined;
  profileId?: number;
  profile?: Profile;
  userStatusId?: number;
  userStatus?: UserStatus;
  userFarms?: UserFarm[];
  preferences?: UserPreferences;
  lastLoginDate?: Date;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}