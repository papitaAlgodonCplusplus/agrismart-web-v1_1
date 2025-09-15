// src/app/features/irrigation/services/irrigation-engineering.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';

// Import the models we'll create
export interface IrrigationDesign {
  id: number;
  name: string;
  description: string;
  designParameters: any;
  hydraulicParameters: any;
  optimizationParameters: any;
  calculationResults: {
    hydraulic: HydraulicParameters | null;
    validation: SystemValidation | null;
    optimization: DesignOptimization | null;
    economic: EconomicAnalysis | null;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'validated' | 'approved';
}

export interface HydraulicParameters {
  // Pressure calculations
  totalPressureLoss: number;
  mainLinePressureLoss: number;
  secondaryLinePressureLoss: number;
  lateralLinePressureLoss: number;
  minorLosses: number;
  
  // Flow calculations
  systemFlowRate: number;
  designFlowRate: number;
  peakFlowRate: number;
  averageVelocity: number;
  reynoldsNumber: number;
  
  // Performance metrics
  distributionUniformity: number;
  applicationEfficiency: number;
  
  // Advanced calculations
  frictionFactor: number;
  velocityHead: number;
  staticHead: number;
  dynamicHead: number;
  
  // Emitter performance
  emitterPerformance: {
    averageFlowRate: number;
    coefficientOfVariation: number;
    uniformityCoefficient: number;
    emissionUniformity: number;
  };
  
  // System reliability
  systemReliability: {
    cloggingRisk: number;
    pressureStability: number;
    flowStability: number;
    maintenanceRequirement: number;
  };
}

export interface SystemValidation {
  isValid: boolean;
  overallScore: number;
  issues: ValidationIssue[];
  recommendations: string[];
  
  // Individual validations
  pressureValidation: {
    isValid: boolean;
    minPressure: number;
    maxPressure: number;
    pressureVariation: number;
  };
  
  flowValidation: {
    isValid: boolean;
    flowBalance: number;
    flowVariation: number;
    adequateFlow: boolean;
  };
  
  uniformityValidation: {
    isValid: boolean;
    achievedUniformity: number;
    targetUniformity: number;
    uniformityGrade: string;
  };
  
  // Technical compliance
  technicalCompliance: {
    velocityCompliance: boolean;
    pressureCompliance: boolean;
    materialCompatibility: boolean;
    standardsCompliance: boolean;
  };
  
  // Performance predictions
  performancePrediction: {
    expectedLifespan: number;
    maintenanceFrequency: number;
    energyEfficiency: number;
    waterUseEfficiency: number;
  };
}

export interface ValidationIssue {
  id: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation?: string;
  affectedParameter: string;
  currentValue: number;
  recommendedValue?: number;
}

export interface DesignOptimization {
  iterations: number;
  convergenceReached: boolean;
  optimizationTime: number;
  
  // Performance improvements
  achievedEfficiency: number;
  optimizedCost: number;
  uniformityImprovement: number;
  overallScore: number;
  
  // Comparative analysis
  costReduction: number;
  efficiencyGain: number;
  waterSavings: number;
  energySavings: number;
  
  // Optimized parameters
  optimizedParameters: {
    design?: any;
    hydraulic?: any;
    emitterFlowRate?: number;
    operatingPressure?: number;
    emitterSpacing?: number;
    pipelineDiameters?: {
      main: number;
      secondary: number;
      lateral: number;
    };
  };
  
  // Alternative scenarios
  alternativeScenarios: OptimizationScenario[];
  
  // Sensitivity analysis
  sensitivityAnalysis: {
    costSensitivity: number;
    efficiencySensitivity: number;
    robustness: number;
  };
}

export interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  efficiency: number;
  cost: number;
  score: number;
  parameters: any;
}

export interface PipelineDesign {
  // Main pipeline
  mainPipeline: {
    diameter: number;
    length: number;
    material: string;
    pressureLoss: number;
    velocity: number;
  };
  
  // Secondary lines
  secondaryLines: PipelineSection[];
  
  // Lateral lines
  lateralLines: PipelineSection[];
  
  // System layout
  systemLayout: {
    totalLength: number;
    numberOfSections: number;
    branchingPoints: number;
    elevationProfile: number[];
  };
  
  // Materials and fittings
  materials: {
    pipeMaterial: string;
    fittingTypes: string[];
    totalMaterialCost: number;
  };
}

export interface PipelineSection {
  id: string;
  diameter: number;
  length: number;
  material: string;
  flowRate: number;
  velocity: number;
  pressureLoss: number;
  startElevation: number;
  endElevation: number;
}

export interface WaterQualityParameters {
  ph: number;
  electricalConductivity: number;
  totalDissolvedSolids: number;
  nitrates: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  sulfur: number;
  
  // Quality assessment
  qualityAssessment: {
    overallGrade: string;
    irrigationSuitability: string;
    cloggingRisk: string;
    treatmentRequired: boolean;
    recommendations: string[];
  };
  
  // Compatibility analysis
  compatibilityAnalysis: {
    emitterCompatibility: boolean;
    pipeCompatibility: boolean;
    fertilizerCompatibility: boolean;
    biologicalRisk: string;
  };
}

export interface EconomicAnalysis {
  // Investment costs
  totalInvestment: number;
  pipelineCost: number;
  emitterCost: number;
  pumpingCost: number;
  controlCost: number;
  installationCost: number;
  
  // Operating costs
  annualOperatingCost: number;
  energyCost: number;
  waterCost: number;
  maintenanceCost: number;
  laborCost: number;
  replacementCost: number;
  
  // Financial metrics
  paybackPeriod: number;
  roi: number;
  npv: number;
  irr: number;
  
  // Cost-benefit analysis
  costBenefit: {
    waterSavingsBenefit: number;
    laborSavingsBenefit: number;
    yieldImprovementBenefit: number;
    qualityImprovementBenefit: number;
    totalBenefits: number;
  };
  
  // Lifecycle analysis
  lifecycleAnalysis: {
    designLife: number;
    totalLifecycleCost: number;
    annualizedCost: number;
    replacementSchedule: ReplacementItem[];
  };
  
  // Financing options
  financingOptions: {
    cashPayment: FinancingOption;
    loanFinancing: FinancingOption;
    leaseOption: FinancingOption;
  };
}

export interface ReplacementItem {
  component: string;
  replacementYear: number;
  cost: number;
  reason: string;
}

export interface FinancingOption {
  totalCost: number;
  monthlyPayment: number;
  interestRate: number;
  term: number;
  totalInterest: number;
}

@Injectable({
  providedIn: 'root'
})
export class IrrigationEngineeringService {
  
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private apiConfig: ApiConfigService
  ) {}

  // =============================================================================
  // DESIGN PERSISTENCE
  // =============================================================================

  saveDesign(design: any): Observable<IrrigationDesign> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/designs`;
    
    if (design.id) {
      // Update existing design
      return this.http.put<IrrigationDesign>(`${endpoint}/${design.id}`, design);
    } else {
      // Create new design
      return this.http.post<IrrigationDesign>(endpoint, design);
    }
  }

  getSavedDesigns(): Observable<any[]> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/designs`;
    return this.http.get<IrrigationDesign[]>(endpoint);
  }

  getDesign(id: number): Observable<IrrigationDesign> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/designs/${id}`;
    return this.http.get<IrrigationDesign>(endpoint);
  }

  deleteDesign(id: number): Observable<void> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/designs/${id}`;
    return this.http.delete<void>(endpoint);
  }

  exportDesign(design: any): Observable<any> {
    // For now, return the design as-is for JSON export
    // In production, this might generate PDF reports, CAD files, etc.
    return of(design).pipe(delay(500));
  }

  // =============================================================================
  // HYDRAULIC CALCULATIONS
  // =============================================================================

  performHydraulicCalculations(designData: any, hydraulicData: any): Observable<HydraulicParameters> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/calculations/hydraulic`;
    
    const payload = {
      designParameters: designData,
      hydraulicParameters: hydraulicData,
      calculationType: 'comprehensive'
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(response => this.processHydraulicResponse(response))
    );
  }

  performQuickCalculations(designData: any, hydraulicData: any): Observable<any> {
    // For real-time calculations, we might use a lighter endpoint or local calculations
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/calculations/quick`;
    
    const payload = {
      designParameters: designData,
      hydraulicParameters: hydraulicData
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(response => ({
        recommendedFlowRate: response.recommendedFlowRate || 0,
        pressureLoss: response.estimatedPressureLoss || 0,
        systemEfficiency: response.estimatedEfficiency || 0,
        waterVelocity: response.averageVelocity || 0,
        recommendedEmitterSpacing: response.recommendedSpacing || 0
      }))
    );
  }

  private processHydraulicResponse(response: any): HydraulicParameters {
    return {
      // Pressure calculations
      totalPressureLoss: response.totalPressureLoss || 0,
      mainLinePressureLoss: response.mainLinePressureLoss || 0,
      secondaryLinePressureLoss: response.secondaryLinePressureLoss || 0,
      lateralLinePressureLoss: response.lateralLinePressureLoss || 0,
      minorLosses: response.minorLosses || 0,
      
      // Flow calculations
      systemFlowRate: response.systemFlowRate || 0,
      designFlowRate: response.designFlowRate || 0,
      peakFlowRate: response.peakFlowRate || 0,
      averageVelocity: response.averageVelocity || 0,
      reynoldsNumber: response.reynoldsNumber || 0,
      
      // Performance metrics
      distributionUniformity: response.distributionUniformity || 85,
      applicationEfficiency: response.applicationEfficiency || 85,
      
      // Advanced calculations
      frictionFactor: response.frictionFactor || 0.02,
      velocityHead: response.velocityHead || 0,
      staticHead: response.staticHead || 0,
      dynamicHead: response.dynamicHead || 0,
      
      // Emitter performance
      emitterPerformance: {
        averageFlowRate: response.emitterPerformance?.averageFlowRate || 0,
        coefficientOfVariation: response.emitterPerformance?.coefficientOfVariation || 5,
        uniformityCoefficient: response.emitterPerformance?.uniformityCoefficient || 90,
        emissionUniformity: response.emitterPerformance?.emissionUniformity || 85
      },
      
      // System reliability
      systemReliability: {
        cloggingRisk: response.systemReliability?.cloggingRisk || 10,
        pressureStability: response.systemReliability?.pressureStability || 95,
        flowStability: response.systemReliability?.flowStability || 90,
        maintenanceRequirement: response.systemReliability?.maintenanceRequirement || 20
      }
    };
  }

  // =============================================================================
  // SYSTEM VALIDATION
  // =============================================================================

  performSystemValidation(
    designData: any, 
    hydraulicData: any, 
    hydraulicResults: any
  ): Observable<SystemValidation> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/validation/system`;
    
    const payload = {
      designParameters: designData,
      hydraulicParameters: hydraulicData,
      hydraulicResults: hydraulicResults
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(response => this.processValidationResponse(response))
    );
  }

  private processValidationResponse(response: any): SystemValidation {
    return {
      isValid: response.isValid || false,
      overallScore: response.overallScore || 0,
      issues: response.issues || [],
      recommendations: response.recommendations || [],
      
      // Individual validations
      pressureValidation: {
        isValid: response.pressureValidation?.isValid || false,
        minPressure: response.pressureValidation?.minPressure || 0,
        maxPressure: response.pressureValidation?.maxPressure || 0,
        pressureVariation: response.pressureValidation?.pressureVariation || 0
      },
      
      flowValidation: {
        isValid: response.flowValidation?.isValid || false,
        flowBalance: response.flowValidation?.flowBalance || 0,
        flowVariation: response.flowValidation?.flowVariation || 0,
        adequateFlow: response.flowValidation?.adequateFlow || false
      },
      
      uniformityValidation: {
        isValid: response.uniformityValidation?.isValid || false,
        achievedUniformity: response.uniformityValidation?.achievedUniformity || 0,
        targetUniformity: response.uniformityValidation?.targetUniformity || 90,
        uniformityGrade: response.uniformityValidation?.uniformityGrade || 'Poor'
      },
      
      // Technical compliance
      technicalCompliance: {
        velocityCompliance: response.technicalCompliance?.velocityCompliance || false,
        pressureCompliance: response.technicalCompliance?.pressureCompliance || false,
        materialCompatibility: response.technicalCompliance?.materialCompatibility || false,
        standardsCompliance: response.technicalCompliance?.standardsCompliance || false
      },
      
      // Performance predictions
      performancePrediction: {
        expectedLifespan: response.performancePrediction?.expectedLifespan || 10,
        maintenanceFrequency: response.performancePrediction?.maintenanceFrequency || 12,
        energyEfficiency: response.performancePrediction?.energyEfficiency || 75,
        waterUseEfficiency: response.performancePrediction?.waterUseEfficiency || 85
      }
    };
  }

  // =============================================================================
  // DESIGN OPTIMIZATION
  // =============================================================================

  performDesignOptimization(
    designData: any,
    hydraulicData: any,
    optimizationData: any,
    hydraulicResults: any
  ): Observable<DesignOptimization> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/optimization/design`;
    
    const payload = {
      designParameters: designData,
      hydraulicParameters: hydraulicData,
      optimizationParameters: optimizationData,
      currentResults: hydraulicResults
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(response => this.processOptimizationResponse(response))
    );
  }

  private processOptimizationResponse(response: any): DesignOptimization {
    return {
      iterations: response.iterations || 1000,
      convergenceReached: response.convergenceReached || true,
      optimizationTime: response.optimizationTime || 30,
      
      // Performance improvements
      achievedEfficiency: response.achievedEfficiency || 90,
      optimizedCost: response.optimizedCost || 0,
      uniformityImprovement: response.uniformityImprovement || 5,
      overallScore: response.overallScore || 85,
      
      // Comparative analysis
      costReduction: response.costReduction || 10,
      efficiencyGain: response.efficiencyGain || 8,
      waterSavings: response.waterSavings || 15,
      energySavings: response.energySavings || 12,
      
      // Optimized parameters
      optimizedParameters: response.optimizedParameters || {},
      
      // Alternative scenarios
      alternativeScenarios: response.alternativeScenarios || [],
      
      // Sensitivity analysis
      sensitivityAnalysis: {
        costSensitivity: response.sensitivityAnalysis?.costSensitivity || 0.3,
        efficiencySensitivity: response.sensitivityAnalysis?.efficiencySensitivity || 0.2,
        robustness: response.sensitivityAnalysis?.robustness || 0.8
      }
    };
  }

  // =============================================================================
  // ECONOMIC ANALYSIS
  // =============================================================================

  performEconomicAnalysis(designData: any, hydraulicResults: any): Observable<EconomicAnalysis> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/analysis/economic`;
    
    const payload = {
      designParameters: designData,
      hydraulicResults: hydraulicResults
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(response => this.processEconomicResponse(response))
    );
  }

  private processEconomicResponse(response: any): EconomicAnalysis {
    return {
      // Investment costs
      totalInvestment: response.totalInvestment || 0,
      pipelineCost: response.pipelineCost || 0,
      emitterCost: response.emitterCost || 0,
      pumpingCost: response.pumpingCost || 0,
      controlCost: response.controlCost || 0,
      installationCost: response.installationCost || 0,
      
      // Operating costs
      annualOperatingCost: response.annualOperatingCost || 0,
      energyCost: response.energyCost || 0,
      waterCost: response.waterCost || 0,
      maintenanceCost: response.maintenanceCost || 0,
      laborCost: response.laborCost || 0,
      replacementCost: response.replacementCost || 0,
      
      // Financial metrics
      paybackPeriod: response.paybackPeriod || 0,
      roi: response.roi || 0,
      npv: response.npv || 0,
      irr: response.irr || 0,
      
      // Cost-benefit analysis
      costBenefit: {
        waterSavingsBenefit: response.costBenefit?.waterSavingsBenefit || 0,
        laborSavingsBenefit: response.costBenefit?.laborSavingsBenefit || 0,
        yieldImprovementBenefit: response.costBenefit?.yieldImprovementBenefit || 0,
        qualityImprovementBenefit: response.costBenefit?.qualityImprovementBenefit || 0,
        totalBenefits: response.costBenefit?.totalBenefits || 0
      },
      
      // Lifecycle analysis
      lifecycleAnalysis: {
        designLife: response.lifecycleAnalysis?.designLife || 15,
        totalLifecycleCost: response.lifecycleAnalysis?.totalLifecycleCost || 0,
        annualizedCost: response.lifecycleAnalysis?.annualizedCost || 0,
        replacementSchedule: response.lifecycleAnalysis?.replacementSchedule || []
      },
      
      // Financing options
      financingOptions: {
        cashPayment: response.financingOptions?.cashPayment || {
          totalCost: 0,
          monthlyPayment: 0,
          interestRate: 0,
          term: 0,
          totalInterest: 0
        },
        loanFinancing: response.financingOptions?.loanFinancing || {
          totalCost: 0,
          monthlyPayment: 0,
          interestRate: 0,
          term: 0,
          totalInterest: 0
        },
        leaseOption: response.financingOptions?.leaseOption || {
          totalCost: 0,
          monthlyPayment: 0,
          interestRate: 0,
          term: 0,
          totalInterest: 0
        }
      }
    };
  }

  // =============================================================================
  // PIPELINE DESIGN
  // =============================================================================

  generatePipelineDesign(designData: any, hydraulicResults: HydraulicParameters): Observable<PipelineDesign> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/design/pipeline`;
    
    const payload = {
      designParameters: designData,
      hydraulicResults: hydraulicResults
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(response => this.processPipelineDesignResponse(response))
    );
  }

  private processPipelineDesignResponse(response: any): PipelineDesign {
    return {
      // Main pipeline
      mainPipeline: {
        diameter: response.mainPipeline?.diameter || 0,
        length: response.mainPipeline?.length || 0,
        material: response.mainPipeline?.material || 'PE',
        pressureLoss: response.mainPipeline?.pressureLoss || 0,
        velocity: response.mainPipeline?.velocity || 0
      },
      
      // Secondary lines
      secondaryLines: response.secondaryLines || [],
      
      // Lateral lines
      lateralLines: response.lateralLines || [],
      
      // System layout
      systemLayout: {
        totalLength: response.systemLayout?.totalLength || 0,
        numberOfSections: response.systemLayout?.numberOfSections || 0,
        branchingPoints: response.systemLayout?.branchingPoints || 0,
        elevationProfile: response.systemLayout?.elevationProfile || []
      },
      
      // Materials and fittings
      materials: {
        pipeMaterial: response.materials?.pipeMaterial || 'PE',
        fittingTypes: response.materials?.fittingTypes || [],
        totalMaterialCost: response.materials?.totalMaterialCost || 0
      }
    };
  }

  // =============================================================================
  // WATER QUALITY ANALYSIS
  // =============================================================================

  analyzeWaterQuality(waterQualityData: any): Observable<WaterQualityParameters> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/analysis/water-quality`;
    
    return this.http.post<any>(endpoint, waterQualityData).pipe(
      map(response => this.processWaterQualityResponse(response))
    );
  }

  private processWaterQualityResponse(response: any): WaterQualityParameters {
    return {
      ph: response.ph || 7,
      electricalConductivity: response.electricalConductivity || 0.8,
      totalDissolvedSolids: response.totalDissolvedSolids || 500,
      nitrates: response.nitrates || 10,
      phosphorus: response.phosphorus || 2,
      potassium: response.potassium || 5,
      calcium: response.calcium || 100,
      magnesium: response.magnesium || 50,
      sulfur: response.sulfur || 25,
      
      // Quality assessment
      qualityAssessment: {
        overallGrade: response.qualityAssessment?.overallGrade || 'Good',
        irrigationSuitability: response.qualityAssessment?.irrigationSuitability || 'Suitable',
        cloggingRisk: response.qualityAssessment?.cloggingRisk || 'Low',
        treatmentRequired: response.qualityAssessment?.treatmentRequired || false,
        recommendations: response.qualityAssessment?.recommendations || []
      },
      
      // Compatibility analysis
      compatibilityAnalysis: {
        emitterCompatibility: response.compatibilityAnalysis?.emitterCompatibility || true,
        pipeCompatibility: response.compatibilityAnalysis?.pipeCompatibility || true,
        fertilizerCompatibility: response.compatibilityAnalysis?.fertilizerCompatibility || true,
        biologicalRisk: response.compatibilityAnalysis?.biologicalRisk || 'Low'
      }
    };
  }

  // =============================================================================
  // REPORTING AND EXPORT
  // =============================================================================

  generateComprehensiveReport(design: IrrigationDesign): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/reports/comprehensive`;
    
    return this.http.post<any>(endpoint, design).pipe(
      map(response => ({
        reportId: response.reportId,
        downloadUrl: response.downloadUrl,
        reportType: response.reportType || 'PDF',
        generatedAt: new Date(response.generatedAt),
        sections: response.sections || []
      }))
    );
  }

  generateTechnicalDrawings(design: IrrigationDesign): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/drawings/technical`;
    
    return this.http.post<any>(endpoint, design).pipe(
      map(response => ({
        drawingId: response.drawingId,
        downloadUrl: response.downloadUrl,
        format: response.format || 'DWG',
        scale: response.scale || '1:100',
        sheets: response.sheets || []
      }))
    );
  }



  generateBillOfMaterials(design: IrrigationDesign): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/bom/generate`;
    
    return this.http.post<any>(endpoint, design).pipe(
      map(response => ({
        bomId: response.bomId,
        materials: response.materials || [],
        totalCost: response.totalCost || 0,
        suppliers: response.suppliers || [],
        lastUpdated: new Date(response.lastUpdated)
      }))
    );
  }

  // =============================================================================
  // TEMPLATE AND PRESET MANAGEMENT
  // =============================================================================

  getDesignTemplates(): Observable<any[]> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/templates`;
    return this.http.get<any[]>(endpoint);
  }

  saveAsTemplate(design: IrrigationDesign, templateName: string): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/templates`;
    
    const templateData = {
      name: templateName,
      description: design.description,
      designParameters: design.designParameters,
      hydraulicParameters: design.hydraulicParameters,
      category: 'custom',
      isPublic: false
    };

    return this.http.post<any>(endpoint, templateData);
  }

  // =============================================================================
  // INTEGRATION WITH EXISTING SERVICES
  // =============================================================================

  integrateWithCropProduction(cropProductionId: number): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/integration/crop-production/${cropProductionId}`;
    return this.http.get<any>(endpoint);
  }

  syncWithIoTDevices(designId: number): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/integration/iot-sync/${designId}`;
    return this.http.post<any>(endpoint, {});
  }

  // =============================================================================
  // VALIDATION UTILITIES
  // =============================================================================

  validateDesignParameters(designData: any): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/validation/parameters`;
    return this.http.post<any>(endpoint, designData);
  }

  checkSystemCompatibility(designData: any, existingComponents: any[]): Observable<any> {
    const endpoint = `${this.apiConfig.agronomicApiUrl}/irrigation/validation/compatibility`;
    
    const payload = {
      designParameters: designData,
      existingComponents: existingComponents
    };

    return this.http.post<any>(endpoint, payload);
  }
}