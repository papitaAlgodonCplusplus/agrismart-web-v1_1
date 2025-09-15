// src/app/features/services/irrigation-engineering.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, tap, retry } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';

// =============================================================================
// INTERFACES FOR THE NEW API SYSTEM
// =============================================================================

// Backend response wrapper (matches AgriSmart API pattern)
interface BackendResponse<T> {
  success: boolean;
  exception: any;
  result: T;
}

// Main design interfaces
export interface IrrigationEngineeringDesignDto {
  id: number;
  name: string;
  description?: string;
  designType: string; // 'drip', 'sprinkler', 'micro-sprinkler'
  status: string; // 'draft', 'completed', 'approved', 'rejected'
  
  // Relationships
  cropProductionId?: number;
  cropProductionName?: string;
  farmId?: number;
  farmName?: string;
  clientId: number;
  clientName: string;
  
  // Area and Physical Parameters
  totalArea: number;
  numberOfSectors: number;
  containerDensity: number;
  plantDensity: number;
  dailyWaterRequirement: number;
  irrigationFrequency: number;
  
  // Component Selections
  containerId?: number;
  containerName?: string;
  dropperId?: number;
  dropperName?: string;
  growingMediumId?: number;
  growingMediumName?: string;
  
  // Climate Parameters
  averageTemperature: number;
  averageHumidity: number;
  windSpeed: number;
  solarRadiation: number;
  elevation: number;
  
  // Water Source
  waterSourceType: string;
  waterPressure: number;
  waterFlowRate: number;
  
  // Water Quality (abbreviated)
  waterPh: number;
  electricalConductivity: number;
  totalDissolvedSolids: number;
  
  // Pipeline Configuration
  mainPipeDiameter: number;
  secondaryPipeDiameter: number;
  lateralPipeDiameter: number;
  mainPipeMaterial: string;
  
  // System Components
  hasFiltration: boolean;
  hasAutomation: boolean;
  hasFertigation: boolean;
  
  // Calculated Results (summary)
  totalSystemFlowRate: number;
  requiredPumpPower: number;
  uniformityCoefficient: number;
  totalProjectCost: number;
  applicationEfficiency: number;
  
  // Validation Status
  isHydraulicallyValid: boolean;
  isEconomicallyViable: boolean;
  isEnvironmentallySound: boolean;
  meetsAgronomicRequirements: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  creatorName: string;
  version?: string;
  isActive: boolean;
  requiresRecalculation: boolean;
}

export interface IrrigationEngineeringDesignDetailDto extends IrrigationEngineeringDesignDto {
  // Extended Water Quality Parameters
  nitrates: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  sulfur: number;
  iron: number;
  manganese: number;
  zinc: number;
  copper: number;
  boron: number;
  
  // Extended Pipeline Configuration
  secondaryPipeMaterial: string;
  lateralPipeMaterial: string;
  mainPipeLength: number;
  secondaryPipeLength: number;
  lateralPipeLength: number;
  
  // Extended System Components
  hasFlowMeter: boolean;
  hasPressureRegulator: boolean;
  hasBackflowPrevention: boolean;
  filtrationSystemType?: string;
  automationSystemType?: string;
  fertigationSystemType?: string;
  
  // Extended Hydraulic Parameters
  systemPressureLoss: number;
  pumpEfficiency: number;
  maxFlowVelocity: number;
  emitterFlowRate: number;
  workingPressure: number;
  emitterSpacing: number;
  lateralSpacing: number;
  
  // Extended Economic Analysis
  totalMaterialCost: number;
  installationCost: number;
  maintenanceCostPerYear: number;
  energyConsumptionPerYear: number;
  waterConsumptionPerYear: number;
  costPerSquareMeter: number;
  paybackPeriod: number;
  waterSavingsPercentage: number;
  energySavingsPercentage: number;
  
  // Extended Performance Metrics
  distributionUniformity: number;
  waterUseEfficiency: number;
  sustainabilityScore: number;
  
  // Environmental Factors
  soilWaterHoldingCapacity: number;
  soilInfiltrationRate: number;
  soilType: string;
  slopePercentage: number;
  drainageClass: string;
  
  // Validation and Recommendations
  validationNotes?: string;
  recommendationsAndOptimizations?: string;
  
  // Complex Data
  detailedHydraulicCalculationsJson?: string;
  componentSpecificationsJson?: string;
  operationScheduleJson?: string;
  materialListJson?: string;
  installationInstructionsJson?: string;
  maintenanceScheduleJson?: string;
  
  // Extended Metadata
  updatedBy?: number;
  updaterName?: string;
  approvedBy?: number;
  approverName?: string;
  approvedAt?: string;
  isTemplate: boolean;
  isPublic: boolean;
  tags?: string;
  
  // Calculation Status
  lastCalculatedAt?: string;
  calculationInProgress: boolean;
  calculationErrors?: string;
  calculationNotes?: string;
}

export interface CreateIrrigationEngineeringDesignDto {
  name: string;
  description?: string;
  designType: string;
  cropProductionId?: number;
  farmId?: number;
  clientId: number;
  totalArea: number;
  numberOfSectors: number;
  containerDensity: number;
  plantDensity: number;
  dailyWaterRequirement: number;
  irrigationFrequency: number;
  containerId?: number;
  dropperId?: number;
  growingMediumId?: number;
  averageTemperature: number;
  averageHumidity: number;
  windSpeed: number;
  solarRadiation: number;
  elevation: number;
  waterSourceType: string;
  waterPressure: number;
  waterFlowRate: number;
  waterPh: number;
  electricalConductivity: number;
  totalDissolvedSolids: number;
  nitrates: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  sulfur: number;
  iron: number;
  manganese: number;
  zinc: number;
  copper: number;
  boron: number;
  mainPipeDiameter: number;
  secondaryPipeDiameter: number;
  lateralPipeDiameter: number;
  mainPipeMaterial: string;
  secondaryPipeMaterial: string;
  lateralPipeMaterial: string;
  mainPipeLength: number;
  secondaryPipeLength: number;
  lateralPipeLength: number;
  hasFiltration: boolean;
  hasAutomation: boolean;
  hasFertigation: boolean;
  hasFlowMeter: boolean;
  hasPressureRegulator: boolean;
  hasBackflowPrevention: boolean;
  filtrationSystemType?: string;
  automationSystemType?: string;
  fertigationSystemType?: string;
  soilWaterHoldingCapacity: number;
  soilInfiltrationRate: number;
  soilType: string;
  slopePercentage: number;
  drainageClass: string;
  tags?: string;
  isTemplate: boolean;
  isPublic: boolean;
  componentSpecificationsJson?: string;
  operationScheduleJson?: string;
  materialListJson?: string;
  installationInstructionsJson?: string;
  maintenanceScheduleJson?: string;
}

export interface UpdateIrrigationEngineeringDesignDto extends CreateIrrigationEngineeringDesignDto {
  id: number;
  status: string;
  totalMaterialCost?: number;
  installationCost?: number;
  maintenanceCostPerYear?: number;
  version?: string;
  validationNotes?: string;
  recommendationsAndOptimizations?: string;
}

export interface IrrigationDesignFilterDto {
  clientId?: number;
  farmId?: number;
  cropProductionId?: number;
  designType?: string;
  status?: string;
  searchTerm?: string;
  isActive?: boolean;
  isTemplate?: boolean;
  requiresRecalculation?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  minArea?: number;
  maxArea?: number;
  minCost?: number;
  maxCost?: number;
  isHydraulicallyValid?: boolean;
  isEconomicallyViable?: boolean;
  tags?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface IrrigationDesignCalculationRequestDto {
  designId: number;
  recalculateHydraulics: boolean;
  recalculateEconomics: boolean;
  recalculatePerformance: boolean;
  runOptimization: boolean;
  calculationNotes?: string;
}

export interface IrrigationDesignCalculationResultDto {
  designId: number;
  success: boolean;
  calculatedAt: string;
  errors?: string;
  warnings?: string;
  
  // Hydraulic Results
  totalSystemFlowRate: number;
  systemPressureLoss: number;
  requiredPumpPower: number;
  uniformityCoefficient: number;
  applicationEfficiency: number;
  
  // Economic Results
  totalProjectCost: number;
  costPerSquareMeter: number;
  paybackPeriod: number;
  
  // Performance Results
  waterUseEfficiency: number;
  sustainabilityScore: number;
  
  // Validation Results
  isHydraulicallyValid: boolean;
  isEconomicallyViable: boolean;
  isEnvironmentallySound: boolean;
  meetsAgronomicRequirements: boolean;
  
  recommendationsAndOptimizations?: string;
}

export interface IrrigationDesignSummaryDto {
  totalDesigns: number;
  activeDesigns: number;
  completedDesigns: number;
  designsRequiringRecalculation: number;
  totalAreaDesigned: number;
  averageCostPerSquareMeter: number;
  averageEfficiency: number;
  totalProjectValue: number;
  designTypeStats: DesignTypeStatDto[];
  monthlyActivity: MonthlyDesignActivityDto[];
}

export interface DesignTypeStatDto {
  designType: string;
  count: number;
  totalArea: number;
  averageCost: number;
}

export interface MonthlyDesignActivityDto {
  year: number;
  month: number;
  monthName: string;
  designsCreated: number;
  designsCompleted: number;
  totalAreaDesigned: number;
}

// =============================================================================
// LEGACY INTERFACES (for backward compatibility)
// =============================================================================

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
  totalPressureLoss: number;
  systemFlowRate: number;
  distributionUniformity: number;
  applicationEfficiency: number;
  emitterPerformance: {
    averageFlowRate: number;
    uniformityCoefficient: number;
  };
}

export interface SystemValidation {
  isValid: boolean;
  overallScore: number;
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationIssue {
  id: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation?: string;
}

export interface DesignOptimization {
  achievedEfficiency: number;
  optimizedCost: number;
  costReduction: number;
  efficiencyGain: number;
}

export interface EconomicAnalysis {
  totalMaterialCost: number;
  installationCost: number;
  totalProjectCost: number;
  paybackPeriod: number;
  roi: number;
}

// =============================================================================
// MAIN SERVICE CLASS
// =============================================================================

@Injectable({
  providedIn: 'root'
})
export class IrrigationEngineeringService {
  private readonly baseUrl = '/api/IrrigationEngineeringDesign';
  
  // State management
  private currentDesignSubject = new BehaviorSubject<IrrigationEngineeringDesignDetailDto | null>(null);
  public currentDesign$ = this.currentDesignSubject.asObservable();
  
  private designsSubject = new BehaviorSubject<IrrigationEngineeringDesignDto[]>([]);
  public designs$ = this.designsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private apiConfig: ApiConfigService
  ) {}

  // =============================================================================
  // DESIGN CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all irrigation engineering designs with filtering and pagination
   */
  getDesigns(filters?: IrrigationDesignFilterDto): Observable<IrrigationEngineeringDesignDto[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<BackendResponse<IrrigationEngineeringDesignDto[]>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}`,
      { params }
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          this.designsSubject.next(response.result);
          return response.result;
        }
        throw new Error(response.exception || 'Failed to fetch designs');
      }),
      catchError(this.handleError<IrrigationEngineeringDesignDto[]>('getDesigns', []))
    );
  }

  /**
   * Get a specific irrigation engineering design by ID
   */
  getDesignById(id: number, includeInactive = false): Observable<IrrigationEngineeringDesignDetailDto> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }

    return this.http.get<BackendResponse<IrrigationEngineeringDesignDetailDto>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/${id}`,
      { params }
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          this.currentDesignSubject.next(response.result);
          return response.result;
        }
        throw new Error(response.exception || 'Design not found');
      }),
      catchError(this.handleError<IrrigationEngineeringDesignDetailDto>('getDesignById'))
    );
  }

  /**
   * Create a new irrigation engineering design
   */
  createDesign(design: CreateIrrigationEngineeringDesignDto): Observable<IrrigationEngineeringDesignDto> {
    return this.http.post<BackendResponse<IrrigationEngineeringDesignDto>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}`,
      design
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          this.refreshDesigns(); // Refresh the list
          return response.result;
        }
        throw new Error(response.exception || 'Failed to create design');
      }),
      catchError(this.handleError<IrrigationEngineeringDesignDto>('createDesign'))
    );
  }

  /**
   * Update an existing irrigation engineering design
   */
  updateDesign(id: number, design: UpdateIrrigationEngineeringDesignDto): Observable<IrrigationEngineeringDesignDto> {
    return this.http.put<BackendResponse<IrrigationEngineeringDesignDto>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/${id}`,
      design
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          this.refreshDesigns(); // Refresh the list
          // Update current design if it's the same one
          if (this.currentDesignSubject.value?.id === id) {
            this.getDesignById(id).subscribe(); // Refresh current design
          }
          return response.result;
        }
        throw new Error(response.exception || 'Failed to update design');
      }),
      catchError(this.handleError<IrrigationEngineeringDesignDto>('updateDesign'))
    );
  }

  /**
   * Delete an irrigation engineering design
   */
  deleteDesign(id: number, hardDelete = false): Observable<boolean> {
    let params = new HttpParams();
    if (hardDelete) {
      params = params.set('hardDelete', 'true');
    }

    return this.http.delete<BackendResponse<boolean>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/${id}`,
      { params }
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          this.refreshDesigns(); // Refresh the list
          // Clear current design if it's the deleted one
          if (this.currentDesignSubject.value?.id === id) {
            this.currentDesignSubject.next(null);
          }
          return response.result;
        }
        throw new Error(response.exception || 'Failed to delete design');
      }),
      catchError(this.handleError<boolean>('deleteDesign', false))
    );
  }

  // =============================================================================
  // CALCULATION OPERATIONS
  // =============================================================================

  /**
   * Calculate or recalculate irrigation design parameters
   */
  calculateDesign(id: number, calculationRequest: IrrigationDesignCalculationRequestDto): Observable<IrrigationDesignCalculationResultDto> {
    return this.http.post<BackendResponse<IrrigationDesignCalculationResultDto>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/${id}/calculate`,
      calculationRequest
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          // Refresh the design to get updated calculated values
          this.getDesignById(id).subscribe();
          return response.result;
        }
        throw new Error(response.exception || 'Calculation failed');
      }),
      catchError(this.handleError<IrrigationDesignCalculationResultDto>('calculateDesign'))
    );
  }

  /**
   * Quick calculation without full persistence
   */
  quickCalculate(designData: any): Observable<any> {
    // Create a temporary design for calculation
    const tempDesign: CreateIrrigationEngineeringDesignDto = {
      ...designData,
      name: 'temp_calculation',
      clientId: designData.clientId || 1,
      isTemplate: false,
      isPublic: false
    };

    return this.createDesign(tempDesign).pipe(
      map(created => {
        const calcRequest: IrrigationDesignCalculationRequestDto = {
          designId: created.id,
          recalculateHydraulics: true,
          recalculateEconomics: true,
          recalculatePerformance: true,
          runOptimization: false
        };
        
        return this.calculateDesign(created.id, calcRequest).pipe(
          tap(() => {
            // Clean up temporary design
            this.deleteDesign(created.id, true).subscribe();
          })
        );
      }),
      map(calc$ => calc$),
      catchError(this.handleError<IrrigationDesignCalculationResultDto>('quickCalculate'))
    );
  }

  // =============================================================================
  // TEMPLATE OPERATIONS
  // =============================================================================

  /**
   * Get irrigation design templates
   */
  getTemplates(designType?: string, publicOnly = false, searchTerm?: string): Observable<IrrigationEngineeringDesignDto[]> {
    let params = new HttpParams();
    if (designType) params = params.set('designType', designType);
    if (publicOnly) params = params.set('publicOnly', 'true');
    if (searchTerm) params = params.set('searchTerm', searchTerm);

    return this.http.get<BackendResponse<IrrigationEngineeringDesignDto[]>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/templates`,
      { params }
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          return response.result;
        }
        throw new Error(response.exception || 'Failed to fetch templates');
      }),
      catchError(this.handleError<IrrigationEngineeringDesignDto[]>('getTemplates', []))
    );
  }

  /**
   * Save design as template
   */
  saveAsTemplate(design: IrrigationEngineeringDesignDetailDto, templateName: string, isPublic = false): Observable<IrrigationEngineeringDesignDto> {
    const templateDesign: UpdateIrrigationEngineeringDesignDto = {
      ...design,
      name: templateName,
      isTemplate: true,
      isPublic: isPublic,
      status: 'completed'
    };

    return this.updateDesign(design.id, templateDesign);
  }

  // =============================================================================
  // SUMMARY AND STATISTICS
  // =============================================================================

  /**
   * Get irrigation design summary statistics
   */
  getSummary(clientId?: number, farmId?: number, fromDate?: string, toDate?: string): Observable<IrrigationDesignSummaryDto> {
    let params = new HttpParams();
    if (clientId) params = params.set('clientId', clientId.toString());
    if (farmId) params = params.set('farmId', farmId.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<BackendResponse<IrrigationDesignSummaryDto>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/summary`,
      { params }
    ).pipe(
      map(response => {
        if (response.success && response.result) {
          return response.result;
        }
        throw new Error(response.exception || 'Failed to fetch summary');
      }),
      catchError(this.handleError<IrrigationDesignSummaryDto>('getSummary'))
    );
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================

  /**
   * Bulk update design statuses
   */
  bulkUpdateStatus(ids: number[], status: string): Observable<number> {
    let params = new HttpParams().set('status', status);

    return this.http.patch<BackendResponse<number>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/bulk/status`,
      ids,
      { params }
    ).pipe(
      map(response => {
        if (response.success && response.result !== undefined) {
          this.refreshDesigns(); // Refresh the list
          return response.result;
        }
        throw new Error(response.exception || 'Bulk update failed');
      }),
      catchError(this.handleError<number>('bulkUpdateStatus', 0))
    );
  }

  /**
   * Bulk trigger recalculation
   */
  bulkRecalculate(ids: number[]): Observable<number> {
    return this.http.post<BackendResponse<number>>(
      `${this.apiConfig.agronomicApiUrl}${this.baseUrl}/bulk/recalculate`,
      ids
    ).pipe(
      map(response => {
        if (response.success && response.result !== undefined) {
          this.refreshDesigns(); // Refresh the list
          return response.result;
        }
        throw new Error(response.exception || 'Bulk recalculation failed');
      }),
      catchError(this.handleError<number>('bulkRecalculate', 0))
    );
  }

  // =============================================================================
  // EXPORT AND IMPORT
  // =============================================================================

  /**
   * Export design to various formats
   */
  exportDesign(id: number, format: 'pdf' | 'excel' | 'cad' | 'json' = 'json'): Observable<Blob> {
    return this.getDesignById(id).pipe(
      map(design => {
        if (format === 'json') {
          const jsonData = JSON.stringify(design, null, 2);
          return new Blob([jsonData], { type: 'application/json' });
        }
        // For other formats, you would call specific export endpoints
        // This is a placeholder implementation
        throw new Error(`Export format ${format} not yet implemented`);
      }),
      catchError(this.handleError<Blob>('exportDesign'))
    );
  }

  // =============================================================================
  // INTEGRATION WITH EXISTING SERVICES
  // =============================================================================

  /**
   * Get designs for a specific crop production
   */
  getDesignsForCropProduction(cropProductionId: number): Observable<IrrigationEngineeringDesignDto[]> {
    return this.getDesigns({ cropProductionId, isActive: true });
  }

  /**
   * Get designs for a specific farm
   */
  getDesignsForFarm(farmId: number): Observable<IrrigationEngineeringDesignDto[]> {
    return this.getDesigns({ farmId, isActive: true });
  }

  /**
   * Get designs requiring recalculation
   */
  getDesignsRequiringRecalculation(): Observable<IrrigationEngineeringDesignDto[]> {
    return this.getDesigns({ requiresRecalculation: true, isActive: true });
  }

  // =============================================================================
  // VALIDATION AND UTILITIES
  // =============================================================================

  /**
   * Validate design parameters before saving
   */
  validateDesign(design: CreateIrrigationEngineeringDesignDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!design.name || design.name.trim().length < 3) {
      errors.push('Design name must be at least 3 characters long');
    }

    if (design.totalArea <= 0) {
      errors.push('Total area must be greater than zero');
    }

    if (design.dailyWaterRequirement <= 0) {
      errors.push('Daily water requirement must be greater than zero');
    }

    if (design.numberOfSectors < 1) {
      errors.push('Number of sectors must be at least 1');
    }

    // Pipe sizing validation
    if (design.mainPipeDiameter <= design.secondaryPipeDiameter) {
      errors.push('Main pipe diameter should be larger than secondary pipe diameter');
    }

    if (design.secondaryPipeDiameter <= design.lateralPipeDiameter) {
      errors.push('Secondary pipe diameter should be larger than lateral pipe diameter');
    }

    // Water quality validation
    if (design.waterPh < 5.5 || design.waterPh > 8.5) {
      errors.push('Water pH should be between 5.5 and 8.5 for optimal irrigation');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // =============================================================================
  // LEGACY COMPATIBILITY METHODS
  // =============================================================================

  /**
   * Legacy method - converts new DTO to old interface format
   */
  convertToLegacyFormat(design: IrrigationEngineeringDesignDetailDto): IrrigationDesign {
    return {
      id: design.id,
      name: design.name,
      description: design.description || '',
      designParameters: {
        totalArea: design.totalArea,
        numberOfSectors: design.numberOfSectors,
        designType: design.designType,
        // ... other parameters
      },
      hydraulicParameters: {
        totalPressureLoss: design.systemPressureLoss,
        systemFlowRate: design.totalSystemFlowRate,
        distributionUniformity: design.distributionUniformity,
        applicationEfficiency: design.applicationEfficiency,
        emitterPerformance: {
          averageFlowRate: design.emitterFlowRate,
          uniformityCoefficient: design.uniformityCoefficient
        }
      },
      optimizationParameters: {},
      calculationResults: {
        hydraulic: null, // Would need to convert
        validation: null, // Would need to convert
        optimization: null, // Would need to convert
        economic: {
          totalMaterialCost: design.totalMaterialCost,
          installationCost: design.installationCost,
          totalProjectCost: design.totalProjectCost,
          paybackPeriod: design.paybackPeriod,
          roi: 0 // Calculate if needed
        }
      },
      createdAt: new Date(design.createdAt),
      updatedAt: design.updatedAt ? new Date(design.updatedAt) : new Date(),
      status: design.status as 'draft' | 'validated' | 'approved'
    };
  }

  // =============================================================================
  // PRIVATE UTILITY METHODS
  // =============================================================================

  /**
   * Refresh the designs list
   */
  private refreshDesigns(): void {
    this.getDesigns().subscribe();
  }

  /**
   * Handle HTTP errors
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log to remote logging service if available
      // this.logError(operation, error);
      
      // Let the app keep running by returning an empty result or throwing
      if (result !== undefined) {
        return new Observable(observer => {
          observer.next(result as T);
          observer.complete();
        });
      } else {
        return throwError(() => new Error(`${operation} failed: ${error.message || error}`));
      }
    };
  }

  /**
   * Clear current design state
   */
  clearCurrentDesign(): void {
    this.currentDesignSubject.next(null);
  }

  /**
   * Set current design
   */
  setCurrentDesign(design: IrrigationEngineeringDesignDetailDto): void {
    this.currentDesignSubject.next(design);
  }

  // =============================================================================
  // ADVANCED FILTERING AND SEARCH
  // =============================================================================

  /**
   * Search designs with advanced filters
   */
  searchDesigns(searchCriteria: {
    searchTerm?: string;
    designType?: string;
    status?: string;
    costRange?: { min: number; max: number };
    areaRange?: { min: number; max: number };
    efficiencyRange?: { min: number; max: number };
    dateRange?: { from: string; to: string };
    tags?: string[];
  }): Observable<IrrigationEngineeringDesignDto[]> {
    
    const filters: IrrigationDesignFilterDto = {
      searchTerm: searchCriteria.searchTerm,
      designType: searchCriteria.designType,
      status: searchCriteria.status,
      minCost: searchCriteria.costRange?.min,
      maxCost: searchCriteria.costRange?.max,
      minArea: searchCriteria.areaRange?.min,
      maxArea: searchCriteria.areaRange?.max,
      createdAfter: searchCriteria.dateRange?.from,
      createdBefore: searchCriteria.dateRange?.to,
      isActive: true,
      pageSize: 100 // Large page size for search
    };

    // Handle tags if provided
    if (searchCriteria.tags && searchCriteria.tags.length > 0) {
      filters.tags = searchCriteria.tags.join(',');
    }

    return this.getDesigns(filters).pipe(
      map(designs => {
        // Additional client-side filtering for efficiency range
        if (searchCriteria.efficiencyRange) {
          return designs.filter(design => 
            design.applicationEfficiency >= (searchCriteria.efficiencyRange?.min || 0) &&
            design.applicationEfficiency <= (searchCriteria.efficiencyRange?.max || 100)
          );
        }
        return designs;
      })
    );
  }

  /**
   * Get design recommendations based on current selection
   */
  getDesignRecommendations(baseDesign: IrrigationEngineeringDesignDetailDto): Observable<IrrigationEngineeringDesignDto[]> {
    // Find similar designs for recommendations
    const filters: IrrigationDesignFilterDto = {
      designType: baseDesign.designType,
      minArea: baseDesign.totalArea * 0.7,
      maxArea: baseDesign.totalArea * 1.3,
      isActive: true,
      isHydraulicallyValid: true,
      isEconomicallyViable: true,
      pageSize: 5
    };

    return this.getDesigns(filters).pipe(
      map(designs => designs.filter(d => d.id !== baseDesign.id))
    );
  }

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  /**
   * Monitor design performance metrics
   */
  getDesignPerformanceMetrics(designId: number): Observable<{
    efficiency: number;
    uniformity: number;
    sustainability: number;
    costEffectiveness: number;
    overallScore: number;
  }> {
    return this.getDesignById(designId).pipe(
      map(design => ({
        efficiency: design.applicationEfficiency,
        uniformity: design.distributionUniformity,
        sustainability: design.sustainabilityScore,
        costEffectiveness: design.totalArea > 0 ? 100 - (design.costPerSquareMeter / 100) : 0,
        overallScore: (
          design.applicationEfficiency * 0.3 +
          design.distributionUniformity * 0.25 +
          design.sustainabilityScore * 0.25 +
          (design.totalArea > 0 ? 100 - (design.costPerSquareMeter / 100) : 0) * 0.2
        )
      }))
    );
  }

  /**
   * Compare multiple designs
   */
  compareDesigns(designIds: number[]): Observable<{
    designs: IrrigationEngineeringDesignDetailDto[];
    comparison: {
      bestEfficiency: number;
      bestCost: number;
      bestSustainability: number;
      recommendations: string[];
    };
  }> {
    const designObservables = designIds.map(id => this.getDesignById(id));
    
    return combineLatest(designObservables).pipe(
      map(designs => {
        const validDesigns = designs.filter(d => d !== null);
        
        const bestEfficiency = Math.max(...validDesigns.map(d => d.applicationEfficiency));
        const bestCost = Math.min(...validDesigns.map(d => d.totalProjectCost));
        const bestSustainability = Math.max(...validDesigns.map(d => d.sustainabilityScore));
        
        const recommendations: string[] = [];
        
        // Generate recommendations based on comparison
        const bestEfficiencyDesign = validDesigns.find(d => d.applicationEfficiency === bestEfficiency);
        const bestCostDesign = validDesigns.find(d => d.totalProjectCost === bestCost);
        const bestSustainabilityDesign = validDesigns.find(d => d.sustainabilityScore === bestSustainability);
        
        if (bestEfficiencyDesign) {
          recommendations.push(`Design "${bestEfficiencyDesign.name}" has the highest efficiency (${bestEfficiency.toFixed(1)}%)`);
        }
        
        if (bestCostDesign) {
          recommendations.push(`Design "${bestCostDesign.name}" is the most cost-effective (${bestCost.toLocaleString()})`);
        }
        
        if (bestSustainabilityDesign) {
          recommendations.push(`Design "${bestSustainabilityDesign.name}" has the best sustainability score (${bestSustainability.toFixed(1)})`);
        }
        
        return {
          designs: validDesigns,
          comparison: {
            bestEfficiency,
            bestCost,
            bestSustainability,
            recommendations
          }
        };
      })
    );
  }

  // =============================================================================
  // REAL-TIME UPDATES AND NOTIFICATIONS
  // =============================================================================

  /**
   * Subscribe to design calculation progress
   */
  subscribeToCalculationProgress(designId: number): Observable<{
    designId: number;
    status: 'queued' | 'calculating' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    errors?: string[];
  }> {
    // This would typically use WebSockets or Server-Sent Events
    // For now, we'll poll the design status
    return new Observable(observer => {
      const pollInterval = setInterval(async () => {
        try {
          const design = await this.getDesignById(designId).toPromise();
          if (design) {
            const status = design.calculationInProgress ? 'calculating' : 
                          design.calculationErrors ? 'failed' : 'completed';
            
            observer.next({
              designId,
              status,
              progress: status === 'completed' ? 100 : status === 'calculating' ? 50 : 0,
              currentStep: status === 'calculating' ? 'Performing calculations...' : 
                          status === 'completed' ? 'Calculation completed' : 
                          'Calculation failed',
              errors: design.calculationErrors ? [design.calculationErrors] : undefined
            });
            
            if (status === 'completed' || status === 'failed') {
              clearInterval(pollInterval);
              observer.complete();
            }
          }
        } catch (error) {
          observer.error(error);
          clearInterval(pollInterval);
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup function
      return () => clearInterval(pollInterval);
    });
  }

  // =============================================================================
  // CACHING AND OFFLINE SUPPORT
  // =============================================================================

  private cacheKey = 'irrigation_designs_cache';
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Get designs with caching support
   */
  getDesignsWithCache(filters?: IrrigationDesignFilterDto): Observable<IrrigationEngineeringDesignDto[]> {
    const cacheKey = `${this.cacheKey}_${JSON.stringify(filters || {})}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }
    
    return this.getDesigns(filters).pipe(
      tap(designs => this.setCache(cacheKey, designs))
    );
  }

  private getFromCache(key: string): any {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < this.cacheExpiry) {
          return parsed.data;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    try {
      const cacheObject = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.cacheKey)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clearing failed:', error);
    }
  }

  // =============================================================================
  // DATA EXPORT AND REPORTING
  // =============================================================================

  /**
   * Generate comprehensive design report
   */
  generateDesignReport(designId: number): Observable<{
    design: IrrigationEngineeringDesignDetailDto;
    summary: string;
    recommendations: string[];
    performanceMetrics: any;
    costAnalysis: any;
    technicalSpecs: any;
  }> {
    return this.getDesignById(designId).pipe(
      map(design => {
        const summary = this.generateDesignSummary(design);
        const recommendations = this.generateRecommendations(design);
        const performanceMetrics = this.extractPerformanceMetrics(design);
        const costAnalysis = this.extractCostAnalysis(design);
        const technicalSpecs = this.extractTechnicalSpecs(design);

        return {
          design,
          summary,
          recommendations,
          performanceMetrics,
          costAnalysis,
          technicalSpecs
        };
      })
    );
  }

  private generateDesignSummary(design: IrrigationEngineeringDesignDetailDto): string {
    return `${design.designType.toUpperCase()} irrigation system design for ${design.totalArea} hectares. ` +
           `The system features ${design.numberOfSectors} sectors with ${design.applicationEfficiency.toFixed(1)}% application efficiency. ` +
           `Total project cost is estimated at ${design.totalProjectCost.toLocaleString()} with a payback period of ${design.paybackPeriod.toFixed(1)} years.`;
  }

  private generateRecommendations(design: IrrigationEngineeringDesignDetailDto): string[] {
    const recommendations: string[] = [];

    if (design.applicationEfficiency < 85) {
      recommendations.push('Consider improving emitter uniformity to increase application efficiency');
    }

    if (design.paybackPeriod > 5) {
      recommendations.push('Evaluate lower-cost alternatives to improve payback period');
    }

    if (design.sustainabilityScore < 70) {
      recommendations.push('Consider more sustainable materials and practices');
    }

    if (!design.hasAutomation && design.totalArea > 5) {
      recommendations.push('Automation system recommended for areas larger than 5 hectares');
    }

    return recommendations;
  }

  private extractPerformanceMetrics(design: IrrigationEngineeringDesignDetailDto) {
    return {
      applicationEfficiency: design.applicationEfficiency,
      distributionUniformity: design.distributionUniformity,
      waterUseEfficiency: design.waterUseEfficiency,
      sustainabilityScore: design.sustainabilityScore,
      uniformityCoefficient: design.uniformityCoefficient
    };
  }

  private extractCostAnalysis(design: IrrigationEngineeringDesignDetailDto) {
    return {
      totalProjectCost: design.totalProjectCost,
      materialCost: design.totalMaterialCost,
      installationCost: design.installationCost,
      costPerSquareMeter: design.costPerSquareMeter,
      paybackPeriod: design.paybackPeriod,
      annualMaintenanceCost: design.maintenanceCostPerYear,
      waterSavingsPercentage: design.waterSavingsPercentage,
      energySavingsPercentage: design.energySavingsPercentage
    };
  }

  private extractTechnicalSpecs(design: IrrigationEngineeringDesignDetailDto) {
    return {
      systemFlowRate: design.totalSystemFlowRate,
      workingPressure: design.workingPressure,
      pumpPower: design.requiredPumpPower,
      mainPipeDiameter: design.mainPipeDiameter,
      emitterFlowRate: design.emitterFlowRate,
      emitterSpacing: design.emitterSpacing,
      waterQuality: {
        ph: design.waterPh,
        ec: design.electricalConductivity,
        tds: design.totalDissolvedSolids
      }
    };
  }

  // =============================================================================
  // INTEGRATION HELPERS
  // =============================================================================

  /**
   * Convert design data for external integrations
   */
  convertForExport(design: IrrigationEngineeringDesignDetailDto, format: 'cad' | 'gis' | 'bim'): any {
    switch (format) {
      case 'cad':
        return {
          layers: {
            mainPipeline: { diameter: design.mainPipeDiameter, length: design.mainPipeLength },
            secondaryPipeline: { diameter: design.secondaryPipeDiameter, length: design.secondaryPipeLength },
            lateralPipeline: { diameter: design.lateralPipeDiameter, length: design.lateralPipeLength },
            emitters: { flowRate: design.emitterFlowRate, spacing: design.emitterSpacing }
          }
        };
      
      case 'gis':
        return {
          geometry: {
            area: design.totalArea,
            coordinates: [], // Would need actual coordinates
            elevation: design.elevation
          },
          properties: {
            designType: design.designType,
            flowRate: design.totalSystemFlowRate,
            pressure: design.workingPressure
          }
        };
      
      case 'bim':
        return {
          components: [
            { type: 'Pipeline', specs: { material: design.mainPipeMaterial, diameter: design.mainPipeDiameter } },
            { type: 'Pump', specs: { power: design.requiredPumpPower, efficiency: design.pumpEfficiency } },
            { type: 'Emitters', specs: { flowRate: design.emitterFlowRate, count: design.totalArea * 100 } }
          ]
        };
      
      default:
        return design;
    }
  }
}