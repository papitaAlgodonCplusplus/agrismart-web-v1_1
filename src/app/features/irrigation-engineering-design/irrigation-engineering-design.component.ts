// src/app/features/irrigation/irrigation-engineering-design/irrigation-engineering-design.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

// Services
import { IrrigationEngineeringService } from '../services/irrigation-engineering.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { AlertService } from '../../core/services/alert.service';

// Models and Interfaces
import { 
  IrrigationDesign, 
  HydraulicParameters, 
  SystemValidation,
  DesignOptimization,
  PipelineDesign,
  EmitterConfiguration,
  WaterQualityParameters,
  EconomicAnalysis
} from '../../core/models/models';
import { Container, Dropper, GrowingMedium } from '../services/irrigation-sector.service';
import { CropProduction } from '../../core/models/models';

@Component({
  selector: 'app-irrigation-engineering-design',
  templateUrl: './irrigation-engineering-design.component.html',
  styleUrls: ['./irrigation-engineering-design.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule
  ]
})
export class IrrigationEngineeringDesignComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Forms
  designForm!: FormGroup;
  hydraulicForm!: FormGroup;
  optimizationForm!: FormGroup;

  // Data
  cropProductions: CropProduction[] = [];
  containers: Container[] = [];
  droppers: Dropper[] = [];
  growingMediums: GrowingMedium[] = [];

  // Current Design
  currentDesign: IrrigationDesign | null = null;
  savedDesigns: IrrigationDesign[] = [];

  // Calculations and Results
  hydraulicResults: HydraulicParameters | null = null;
  validationResults: SystemValidation | null = null;
  optimizationResults: DesignOptimization | null = null;
  pipelineDesign: PipelineDesign | null = null;
  economicAnalysis: EconomicAnalysis | null = null;

  // UI State
  activeTab = 'design';
  isCalculating = false;
  isOptimizing = false;
  isSaving = false;
  showAdvancedOptions = false;
  calculationProgress = 0;

  // Real-time calculations
  realTimeCalculations$ = new BehaviorSubject<any>(null);

  constructor(
    private fb: FormBuilder,
    private engineeringService: IrrigationEngineeringService,
    private irrigationService: IrrigationSectorService,
    private cropProductionService: CropProductionService,
    private alertService: AlertService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupRealTimeCalculations();
    this.loadSavedDesigns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================================================================
  // FORM INITIALIZATION
  // =============================================================================

  private initializeForms(): void {
    this.initializeDesignForm();
    this.initializeHydraulicForm();
    this.initializeOptimizationForm();
  }

  private initializeDesignForm(): void {
    this.designForm = this.fb.group({
      // Basic Design Information
      name: ['', Validators.required],
      description: [''],
      cropProductionId: ['', Validators.required],
      designType: ['drip', Validators.required], // drip, sprinkler, micro-sprinkler
      
      // System Configuration
      containerId: ['', Validators.required],
      dropperId: ['', Validators.required],
      growingMediumId: ['', Validators.required],
      
      // Area and Layout
      totalArea: [0, [Validators.required, Validators.min(0.1)]],
      numberOfSectors: [1, [Validators.required, Validators.min(1)]],
      containerDensity: [0, [Validators.required, Validators.min(0.01)]],
      plantDensity: [0, [Validators.required, Validators.min(0.01)]],
      
      // Water Requirements
      dailyWaterRequirement: [0, [Validators.required, Validators.min(0.1)]], // L/day/plant
      irrigationFrequency: [1, [Validators.required, Validators.min(0.1)]], // times per day
      
      // Environmental Parameters
      climate: this.fb.group({
        averageTemperature: [25, Validators.required],
        averageHumidity: [70, Validators.required],
        windSpeed: [2, Validators.required],
        solarRadiation: [20, Validators.required], // MJ/m²/day
        elevation: [1200, Validators.required] // meters above sea level
      }),
      
      // Water Source
      waterSource: this.fb.group({
        sourceType: ['well', Validators.required], // well, reservoir, municipal
        waterPressure: [0, Validators.required], // bar
        waterFlow: [0, Validators.required], // L/min
        waterQuality: this.fb.group({
          ph: [7, [Validators.min(4), Validators.max(9)]],
          electricalConductivity: [0.8, Validators.min(0)], // dS/m
          totalDissolvedSolids: [500, Validators.min(0)], // ppm
          nitrates: [10, Validators.min(0)], // ppm
          phosphorus: [2, Validators.min(0)], // ppm
          potassium: [5, Validators.min(0)] // ppm
        })
      }),

      // Pipeline Configuration
      mainPipeDiameter: [63, Validators.required], // mm
      secondaryPipeDiameter: [32, Validators.required], // mm
      lateralPipeDiameter: [16, Validators.required], // mm
      pipelineMaterial: ['PE', Validators.required], // PE, PVC, HDPE
      
      // System Components
      components: this.fb.group({
        hasFiltration: [true],
        hasAutomation: [false],
        hasFertigation: [false],
        hasBackflowPrevention: [true],
        hasPressureRegulation: [true],
        hasFlowMeter: [false]
      })
    });
  }

  private initializeHydraulicForm(): void {
    this.hydraulicForm = this.fb.group({
      // Operating Parameters
      operatingPressure: [1.5, [Validators.required, Validators.min(0.5)]],
      maxFlowRate: [0, [Validators.required, Validators.min(0.1)]],
      designVelocity: [1.5, [Validators.required, Validators.min(0.5), Validators.max(3)]],
      
      // Pressure Loss Calculations
      frictionLossCoefficient: [0.2, Validators.required],
      minorLossCoefficient: [0.1, Validators.required],
      elevationChange: [0, Validators.required], // meters
      
      // Emitter Specifications
      emitterFlowRate: [0, [Validators.required, Validators.min(0.1)]], // L/h
      emitterSpacing: [0.3, [Validators.required, Validators.min(0.1)]], // meters
      emitterPressure: [1, [Validators.required, Validators.min(0.5)]], // bar
      
      // Uniformity Requirements
      targetUniformity: [90, [Validators.required, Validators.min(80), Validators.max(98)]],
      pressureVariation: [10, [Validators.required, Validators.min(5), Validators.max(20)]] // %
    });
  }

  private initializeOptimizationForm(): void {
    this.optimizationForm = this.fb.group({
      // Optimization Objectives
      primaryObjective: ['efficiency', Validators.required], // efficiency, cost, uniformity, sustainability
      weightingFactors: this.fb.group({
        efficiency: [40, [Validators.min(0), Validators.max(100)]],
        cost: [30, [Validators.min(0), Validators.max(100)]],
        uniformity: [20, [Validators.min(0), Validators.max(100)]],
        sustainability: [10, [Validators.min(0), Validators.max(100)]]
      }),
      
      // Constraints
      constraints: this.fb.group({
        maxInvestment: [0, Validators.min(0)], // currency units
        minEfficiency: [85, [Validators.min(70), Validators.max(98)]],
        maxWaterConsumption: [0, Validators.min(0)], // L/day
        availableArea: [0, Validators.min(0)] // m²
      }),
      
      // Optimization Parameters
      optimizationMethod: ['genetic', Validators.required], // genetic, gradient, hybrid
      maxIterations: [1000, [Validators.min(100), Validators.max(10000)]],
      convergenceTolerance: [0.001, [Validators.min(0.0001), Validators.max(0.1)]],
      
      // Scenarios
      includeScenarios: this.fb.group({
        climateChange: [false],
        waterScarcity: [false],
        expansionPlanning: [false],
        maintenanceScheduling: [false]
      })
    });
  }

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  private loadInitialData(): void {
    combineLatest([
      this.cropProductionService.getAll(),
      this.irrigationService.getAllContainers(),
      this.irrigationService.getAllDroppers(),
      this.irrigationService.getAllGrowingMediums()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([crops, containers, droppers, mediums]) => {
        this.cropProductions = crops;
        this.containers = containers;
        this.droppers = droppers;
        this.growingMediums = mediums;
      },
      error: (error) => {
        this.alertService.showError('Error loading initial data', error);
      }
    });
  }

  private loadSavedDesigns(): void {
    this.engineeringService.getSavedDesigns().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (designs) => {
        this.savedDesigns = designs;
      },
      error: (error) => {
        console.error('Error loading saved designs:', error);
      }
    });
  }

  // =============================================================================
  // REAL-TIME CALCULATIONS
  // =============================================================================

  private setupRealTimeCalculations(): void {
    // Monitor form changes and trigger calculations
    combineLatest([
      this.designForm.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()),
      this.hydraulicForm.valueChanges.pipe(debounceTime(1000), distinctUntilChanged())
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.designForm.valid && this.hydraulicForm.valid) {
        this.performRealTimeCalculations();
      }
    });
  }

  private performRealTimeCalculations(): void {
    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;

    this.engineeringService.performQuickCalculations(designData, hydraulicData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (calculations) => {
        this.realTimeCalculations$.next(calculations);
        this.updateFormWithCalculations(calculations);
      },
      error: (error) => {
        console.error('Real-time calculation error:', error);
      }
    });
  }

  private updateFormWithCalculations(calculations: any): void {
    if (calculations.recommendedFlowRate) {
      this.hydraulicForm.patchValue({
        maxFlowRate: calculations.recommendedFlowRate
      }, { emitEvent: false });
    }

    if (calculations.recommendedEmitterSpacing) {
      this.hydraulicForm.patchValue({
        emitterSpacing: calculations.recommendedEmitterSpacing
      }, { emitEvent: false });
    }
  }

  // =============================================================================
  // MAIN CALCULATIONS
  // =============================================================================

  performHydraulicCalculations(): void {
    if (!this.designForm.valid || !this.hydraulicForm.valid) {
      this.alertService.showWarning('Please complete all required fields');
      return;
    }

    this.isCalculating = true;
    this.calculationProgress = 0;

    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;

    // Simulate calculation progress
    const progressInterval = setInterval(() => {
      this.calculationProgress += 10;
      if (this.calculationProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.engineeringService.performHydraulicCalculations(designData, hydraulicData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results: any) => {
        this.hydraulicResults = results;
        this.calculationProgress = 100;
        this.isCalculating = false;
        clearInterval(progressInterval);
        
        // Automatically perform validation
        this.performSystemValidation();
        
        this.alertService.showSuccess('Hydraulic calculations completed successfully');
        this.activeTab = 'results';
      },
      error: (error) => {
        this.isCalculating = false;
        this.calculationProgress = 0;
        clearInterval(progressInterval);
        this.alertService.showError('Error performing hydraulic calculations', error);
      }
    });
  }

  performSystemValidation(): void {
    if (!this.hydraulicResults) {
      this.alertService.showWarning('Please perform hydraulic calculations first');
      return;
    }

    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;

    this.engineeringService.performSystemValidation(designData, hydraulicData, this.hydraulicResults).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (validation: any) => {
        this.validationResults = validation;
        
        if (validation.isValid) {
          this.alertService.showSuccess('System validation passed');
        } else {
          this.alertService.showWarning('System validation found issues. Please review recommendations.');
        }
      },
      error: (error) => {
        this.alertService.showError('Error performing system validation', error);
      }
    });
  }

  // =============================================================================
  // OPTIMIZATION
  // =============================================================================

  performDesignOptimization(): void {
    if (!this.validationResults || !this.validationResults.isValid) {
      this.alertService.showWarning('Please ensure system validation passes before optimization');
      return;
    }

    this.isOptimizing = true;
    
    const designData = this.designForm.value;
    const hydraulicData = this.hydraulicForm.value;
    const optimizationData = this.optimizationForm.value;

    this.engineeringService.performDesignOptimization(
      designData, 
      hydraulicData, 
      optimizationData,
      this.hydraulicResults!
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (optimization: any) => {
        this.optimizationResults = optimization;
        this.isOptimizing = false;
        
        // Apply optimized parameters to forms
        if (optimization.optimizedParameters) {
          this.applyOptimizedParameters(optimization.optimizedParameters);
        }
        
        this.alertService.showSuccess('Design optimization completed');
        this.activeTab = 'optimization';
      },
      error: (error) => {
        this.isOptimizing = false;
        this.alertService.showError('Error performing design optimization', error);
      }
    });
  }

  private applyOptimizedParameters(optimized: any): void {
    if (optimized.hydraulic) {
      this.hydraulicForm.patchValue(optimized.hydraulic);
    }
    
    if (optimized.design) {
      this.designForm.patchValue(optimized.design);
    }

    // Trigger recalculation
    this.performHydraulicCalculations();
  }

  // =============================================================================
  // ECONOMIC ANALYSIS
  // =============================================================================

  performEconomicAnalysis(): void {
    if (!this.hydraulicResults) {
      this.alertService.showWarning('Please complete hydraulic calculations first');
      return;
    }

    const designData = this.designForm.value;
    
    this.engineeringService.performEconomicAnalysis(designData, this.hydraulicResults).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (analysis: any) => {
        this.economicAnalysis = analysis;
        this.alertService.showSuccess('Economic analysis completed');
      },
      error: (error) => {
        this.alertService.showError('Error performing economic analysis', error);
      }
    });
  }

  // =============================================================================
  // DESIGN PERSISTENCE
  // =============================================================================

  saveDesign(): void {
    if (!this.designForm.valid) {
      this.alertService.showWarning('Please complete all required design fields');
      return;
    }

    this.isSaving = true;
    
    const completeDesign: IrrigationDesign = {
      id: this.currentDesign?.id || 0,
      name: this.designForm.value.name,
      description: this.designForm.value.description,
      designParameters: this.designForm.value,
      hydraulicParameters: this.hydraulicForm.value,
      optimizationParameters: this.optimizationForm.value,
      calculationResults: {
        hydraulic: this.hydraulicResults ?? undefined,
        validation: this.validationResults ?? undefined,
        optimization: this.optimizationResults ?? undefined,
        economic: this.economicAnalysis ?? undefined
      },
      createdAt: this.currentDesign?.createdAt || new Date(),
      updatedAt: new Date(),
      status: this.validationResults?.isValid ? 'validated' : 'draft',
      cropProductionId: 0,
      designType: 'drip',
      version: '',
      createdBy: 0,
      tags: [],
      isTemplate: false,
      designStandards: [],
      regulatoryCompliance: undefined
    };

    this.engineeringService.saveDesign(completeDesign).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (savedDesign: any) => {
        this.currentDesign = savedDesign;
        this.isSaving = false;
        this.loadSavedDesigns(); // Refresh the list
        this.alertService.showSuccess('Design saved successfully');
      },
      error: (error) => {
        this.isSaving = false;
        this.alertService.showError('Error saving design', error);
      }
    });
  }

  loadDesign(design: IrrigationDesign): void {
    this.currentDesign = design;
    
    // Populate forms with saved data
    this.designForm.patchValue(design.designParameters);
    this.hydraulicForm.patchValue(design.hydraulicParameters);
    if (design.optimizationParameters) {
      this.optimizationForm.patchValue(design.optimizationParameters);
    }
    
    // Load calculation results if available
    if (design.calculationResults) {
      this.hydraulicResults = design.calculationResults.hydraulic;
      this.validationResults = design.calculationResults.validation ?? null;
      this.optimizationResults = design.calculationResults.optimization;
      this.economicAnalysis = design.calculationResults.economic ?? null;
    }

    this.alertService.showInfo(`Design "${design.name}" loaded successfully`);
  }

  deleteDesign(design: IrrigationDesign): void {
    if (confirm(`Are you sure you want to delete the design "${design.name}"?`)) {
      this.engineeringService.deleteDesign(design.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loadSavedDesigns();
          if (this.currentDesign?.id === design.id) {
            this.currentDesign = null;
          }
          this.alertService.showSuccess('Design deleted successfully');
        },
        error: (error) => {
          this.alertService.showError('Error deleting design', error);
        }
      });
    }
  }

  // =============================================================================
  // FORM UTILITIES
  // =============================================================================

  onCropProductionChange(): void {
    const cropProductionId = this.designForm.get('cropProductionId')?.value;
    if (cropProductionId) {
      this.cropProductionService.getCropProduction(cropProductionId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (cropProduction: any) => {
          // Auto-populate related fields
          this.designForm.patchValue({
            containerId: cropProduction.containerId,
            dropperId: cropProduction.dropperId,
            growingMediumId: cropProduction.growingMediumId,
            totalArea: cropProduction.plantedArea || 0
          });
        },
        error: (error) => {
          console.error('Error loading crop production details:', error);
        }
      });
    }
  }

  resetDesign(): void {
    if (confirm('Are you sure you want to reset the current design? All unsaved changes will be lost.')) {
      this.designForm.reset();
      this.hydraulicForm.reset();
      this.optimizationForm.reset();
      
      this.hydraulicResults = null;
      this.validationResults = null;
      this.optimizationResults = null;
      this.economicAnalysis = null;
      this.currentDesign = null;
      
      this.activeTab = 'design';
      this.initializeForms(); // Reset to default values
    }
  }

  exportDesign(): void {
    if (!this.currentDesign) {
      this.alertService.showWarning('Please save the design before exporting');
      return;
    }

    this.engineeringService.exportDesign(this.currentDesign).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (exportData) => {
        this.downloadFile(exportData, `irrigation_design_${this.currentDesign!.name}.json`);
        this.alertService.showSuccess('Design exported successfully');
      },
      error: (error) => {
        this.alertService.showError('Error exporting design', error);
      }
    });
  }

  private downloadFile(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // =============================================================================
  // UI UTILITIES
  // =============================================================================

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleAdvancedOptions(): void {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  getValidationSeverity(issue: any): string {
    if (issue.severity === 'critical') return 'danger';
    if (issue.severity === 'warning') return 'warning';
    return 'info';
  }

  formatNumber(value: number, decimals: number = 2): string {
    return value?.toFixed(decimals) || '0.00';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  }

  formatPercentage(value: number): string {
    return `${(value || 0).toFixed(1)}%`;
  }
}