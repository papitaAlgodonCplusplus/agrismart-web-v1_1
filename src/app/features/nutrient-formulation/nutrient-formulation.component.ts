import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, catchError, tap, map, finalize } from 'rxjs';
import { WaterChemistryService, WaterChemistry } from '../water-chemistry/services/water-chemistry.service';
import { FertilizerService } from '../fertilizers/services/fertilizer.service';
import { CropService } from '../crops/services/crop.service';
import { ApiService } from '../../core/services/api.service';
import { CatalogService, Catalog } from '../catalogs/services/catalog.service';
import { AuthService } from '../../core/auth/auth.service';
import { RealDataSimpleFormulationService, SimpleFormulationRequest, SimpleFormulationResult } from './real-data-simple-formulation.service';
import { Chart, registerables } from 'chart.js';
import { AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';

import { NutrientRecipeService, CreateRecipeRequest, NutrientRecipe } from '../../core/services/nutrient-recipe.service';
import { SoilAnalysisService } from '../soil-analysis/services/soil-analysis.service';
import { SoilFertigationCalculatorService } from './services/soil-fertigation-calculator.service';
import { SoilAnalysisResponse } from '../soil-analysis/models/soil-analysis.models';
import {
  SoilFertigationInput,
  SoilFertigationOutput,
  AdjustedNutrientTargets
} from './models/soil-fertigation.models';

// Interfaces for the new API response
interface CalculationResponse {
    user_info: UserInfo;
    optimization_method: string;
    linear_programming_enabled: boolean;
    integration_metadata: IntegrationMetadata;
    optimization_summary: OptimizationSummary;
    performance_metrics: PerformanceMetrics;
    cost_analysis: CostAnalysis;
    calculation_results: CalculationResults;
    calculation_data_used?: CalculationDataUsed;
    linear_programming_analysis: LinearProgrammingAnalysis;
    data_sources: DataSources;
}

interface CalculationDataUsed {
    api_fertilizers_raw?: any[];
    water_analysis?: WaterAnalysis;
    volume_liters?: number;
    target_concentrations?: any;
}

interface WaterAnalysis {
    Ca?: number;
    K?: number;
    N?: number;
    P?: number;
    Mg?: number;
    S?: number;
    Fe?: number;
    Mn?: number;
    Zn?: number;
    Cu?: number;
    B?: number;
    Mo?: number;
}


export interface LoadedRecipe {
    id: number;
    name: string;
    description: string;
    cropId: number;
    cropName: string;
    cropPhaseId: number;
    cropPhaseName: string;
    volumeLiters: number;
    targetPh: number;
    targetEc: number;
    totalCost: number;
    costPerLiter: number;
    dateCreated: string;
    recipeType: string;
    fertilizers: {
        fertilizerId: number;
        fertilizerName: string;
        concentrationGramsPerLiter: number;
        totalGrams: number;
        totalCost: number;
        percentageOfN?: number;
        percentageOfP?: number;
        percentageOfK?: number;
    }[];
}

interface UserInfo {
    clientId: number;
    userEmail: string;
    password: string;
    profileId: number;
    userStatusId: number;
    id: number;
    dateCreated: string;
    dateUpdated?: string;
    createdBy: number;
    updatedBy?: number;
}

interface IntegrationMetadata {
    data_source: string;
    user_id: number;
    catalog_id: number;
    phase_id: number;
    water_id: number;
    fertilizers_analyzed: number;
    fertilizers_processed: number;
    micronutrients_added: number;
    optimization_method: string;
    calculation_timestamp: string;
    safety_caps_applied: boolean;
    strict_caps_mode: boolean;
    api_endpoints_used: string[];
}

interface NutrientDiagnostic {
    has_discrepancy: boolean;
    severity: 'none' | 'low' | 'medium' | 'high';
    deviation_percent: number;
    message: string;
    reasons: Array<{
        type: string;
        description: string;
    }>;
    supplying_fertilizers: string[];
}


interface NutrientDiagnostics {
    [nutrient: string]: NutrientDiagnostic;
}

interface OptimizationSummary {
    method: string;
    status: string;
    active_fertilizers: number;
    total_dosage_g_per_L: number;
    average_deviation_percent: number;
    solver_time_seconds: number;
    ionic_balance_error: number;
    success_rate_percent: number;
}

interface PerformanceMetrics {
    fertilizers_fetched: number;
    fertilizers_processed: number;
    micronutrients_auto_added: number;
    fertilizers_matched: number;
    active_dosages: number;
    optimization_method: string;
    micronutrient_coverage: string;
    safety_status: string;
    precision_achieved: string;
}

interface CostAnalysis {
    total_cost_crc: number;
    cost_per_liter_crc: number;
    cost_per_m3_crc: number;
    api_price_coverage_percent: number;
    fertilizer_costs: { [key: string]: number };
    cost_percentages: { [key: string]: number };
    pricing_sources: {
        api_prices_used: number;
        fallback_prices_used: number;
    };
    regional_factor: number;
    region: string;
}

// Add after existing interfaces
interface FertilizerUsageData {
    name: string;
    dosage_g_per_L: number;
    dosage_ml_per_L: number;
    cost_crc: number;
    cost_percentage: number;
    nutrient_contribution: {
        N: number;
        P: number;
        K: number;
        Ca: number;
        Mg: number;
        S: number;
        Fe: number;
        Mn: number;
        Zn: number;
        Cu: number;
        B: number;
        Mo: number;
    };
    raw_fertilizer: any; // From api_fertilizers_raw
}

interface EnhancedCostAnalysis {
    total_cost_crc: number;
    cost_per_liter_concentrated: number;
    cost_per_liter_diluted: number;
    cost_per_m3_diluted: number;
    cost_per_fertilizer: { [key: string]: number };
    api_price_coverage_percent: number;
}

interface WaterAnalysisDisplay {
    Ca: number;
    K: number;
    N: number;
    P: number;
    Mg: number;
    S: number;
    Fe: number;
    Mn: number;
    Zn: number;
    Cu: number;
    B: number;
    Mo: number;
}

interface CalculationResults {
    fertilizer_dosages: { [key: string]: FertilizerDosage };
    achieved_concentrations: { [key: string]: number };
    deviations_percent: { [key: string]: number };
    optimization_method: string;
    optimization_status: string;
    objective_value: number;
    ionic_balance_error: number;
    solver_time_seconds: number;
    active_fertilizers: number;
    total_dosage_g_per_L: number;
    calculation_status: {
        success: boolean;
        warnings: string[];
        iterations: number;
        convergence_error: number;
    };
    cost_analysis: CostAnalysis;
    pricing_info: any;
    verification_results: VerificationResult[];
    pdf_report: {
        generated: boolean;
        filename: string;
        integration_method: string;
    };
}

interface FertilizerDosage {
    dosage_ml_per_L: number;
    dosage_g_per_L: number;
}

interface VerificationResult {
    parameter: string;
    target_value: number;
    actual_value: number;
    percentage_deviation: number;
    status: string;
}

interface LinearProgrammingAnalysis {
    excellent_nutrients: number;
    good_nutrients: number;
    deviation_nutrients: number;
    total_nutrients: number;
}

interface DataSources {
    fertilizers_api: string;
    requirements_api: string;
    water_api: string;
    user_api: string;
    micronutrient_supplementation: string;
    optimization_engine: string;
    safety_system: string;
}
interface CropPhaseSolutionRequirement {
    nO3: number;
    nH4: number;
    h2PO4: number;
    sO4: number | undefined;
    ph: any;
    pH: any;
    cropPhaseId: number;
    id: number;
    phaseId: number;
    ec?: number;
    hco3?: number;
    no3?: number;
    h2po4?: number;
    so4?: number;
    cl?: number;
    nh4?: number;
    k?: number;
    ca?: number;
    mg?: number;
    na?: number;
    fe?: number;
    b?: number;
    cu?: number;
    zn?: number;
    mn?: number;
    mo?: number;
    n?: number;
    s?: number;
    p?: number;
    active: boolean;
}
interface FormulationRecipe {
    id?: number;
    name: string;
    waterSourceId: number;
    cropId: number;
    cropPhaseId: number;
    targetPh: number;
    targetEc: number;
    targetNitrogen: number;
    targetPhosphorus: number;
    targetPotassium: number;
    fertilizers: RecipeFertilizer[];
    totalCost: number;
    volumeLiters: number;
    createdAt?: Date;
    targetCalcium?: number;
    targetMagnesium?: number;
    targetSulfur?: number;
    targetIron?: number;
    nutrientProfile?: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
        calcium?: number;
        magnesium?: number;
    };
    instructions?: string[];
    warnings?: string[];
    description?: string;
    cropName?: string;
    cropPhaseName?: string;
    recipeType?: string;
    dateCreated?: Date | string;
    costPerLiter?: number;
}
interface Crop {
    id: number;
    name: string;
    scientificName?: string;
    description?: string;
    type?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    phases?: any[];
}
interface CropPhase {
    cropName: any;
    id: number;
    cropId: number;
    catalogId: number;
    name: string;
    description?: string;
    sequence?: number;
    startingWeek?: number;
    endingWeek?: number;
    active: boolean;
}
interface RecipeFertilizer {
    fertilizerId: number;
    fertilizer?: Fertilizer;
    concentration: number;
    percentageOfN: number;
    percentageOfP: number;
    percentageOfK: number;
    costPortion: number;
    fertilizerName?: string;
    concentrationGramsPerLiter?: number;
    totalGrams?: number;
    totalCost?: number;
}
interface FormulationConstraints {
    maxBudgetPerLiter: number;
    maxEc: number;
    minPh: number;
    maxPh: number;
    preferOrganic: boolean;
    excludeFertilizers: number[];
}
export interface FertilizerChemistry {
    id: number;
    fertilizerId: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    calcium?: number;
    magnesium?: number;
    sulfur?: number;
    iron?: number;
    manganese?: number;
    zinc?: number;
    copper?: number;
    boron?: number;
    molybdenum?: number;
    micronutrients?: string;
    purity?: number;
    ph?: number;
    ec?: number;
    solubility?: string;
    solubility20?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
export interface BackendResponse<T> {
    success: boolean;
    result: T;
    exception?: string;
    message?: string;
}
export interface Fertilizer {
    id: number;
    name: string | undefined;
    brand?: string | undefined;
    description?: string | undefined;
    type: string | undefined;
    formulation?: string | undefined;
    concentration?: number;
    concentrationUnit?: string | undefined;
    applicationMethod?: string | undefined;
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
    composition?: FertilizerComposition;
    optimizationScore?: number;
}
export interface FertilizerComposition {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium?: number;
    magnesium?: number;
    sulfur?: number;
    micronutrients?: string | undefined;
}
export interface EnhancedFertilizer extends Fertilizer {
    chemistry?: FertilizerChemistry;
    nutrientContent?: {
        nitrogenPpm: number;
        phosphorusPpm: number;
        potassiumPpm: number;
        calciumPpm: number;
        magnesiumPpm: number;
        sulfurPpm: number;
        ironPpm: number;
    };
}
export interface FertilizerFilters {
    onlyActive?: boolean;
    type?: string;
    npkCategory?: string;
    searchTerm?: string;
    applicationMethod?: string;
    lowStock?: boolean;
    expiringWithin?: number;
    supplier?: string;
    minStock?: number;
    maxStock?: number;
}
@Component({
    selector: 'app-nutrient-formulation',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './nutrient-formulation.component.html',
    styleUrls: ['./nutrient-formulation.component.css']
})
export class NutrientFormulationComponent implements OnInit {
    formulationForm: FormGroup;
    public readonly FERTILIZER_INPUT_ENDPOINT = '/FertilizerInput';
    public readonly ANALYTICAL_ENTITY_ENDPOINT = '/AnalyticalEntity';
    waterSources: WaterChemistry[] = [];
    fertilizers: any[] = [];
    fertilizerChemistries: FertilizerChemistry[] = [];
    crops: Crop[] = [];
    cropPhases: CropPhase[] = [];
    cropPhaseSolutionRequirements: CropPhaseSolutionRequirement[] = [];
    currentRecipe: any | null = null;
    formulationResults: any[] = [];
    savedRecipes: any[] = [];
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showAdvancedOptions = false;
    Message!: string;

    calculationForm!: FormGroup;
    // Enhanced data for visualizations
    fertilizerUsageData: any[] = [];
    enhancedCostAnalysis: EnhancedCostAnalysis | null = null;
    waterAnalysisDisplay: WaterAnalysisDisplay | null = null;
    performanceMetricsDisplay: any | null = null;
    optimizationSummaryDisplay: any | null = null;
    nutrientDiagnostics: NutrientDiagnostics = {};

    // Data arrays
    catalogs: Catalog[] = [];
    // Results
    calculationResults: CalculationResponse | null = null;

    showResults = false;

    // Chart data
    fertilizerChartData: any[] = [];
    nutrientChartData: any[] = [];
    costChartData: any[] = [];
    public Math = Math;
    private dosageChart: Chart | null = null;
    private costDistributionChart: Chart | null = null;

    public realDataFormulationService = new RealDataSimpleFormulationService();

    // Simple formulation specific properties
    simpleFormulationResult: SimpleFormulationResult | null = null;
    isCalculatingSimple = false;
    // Enhanced formulation results (includes Ca, Mg, pH, EC estimates)
    enhancedFormulationResults: any[] = [];

    // Soil mode properties
    formulationMode: 'hydroponics' | 'soil' = 'hydroponics';
    soilAnalysisList: SoilAnalysisResponse[] = [];
    selectedSoilAnalysis: SoilAnalysisResponse | null = null;
    soilFertigationResult: SoilFertigationOutput | null = null;
    adjustedTargets: AdjustedNutrientTargets[] = [];
    showSoilComparison = false;

    // Soil-specific form controls
    soilIrrigationVolume = 1000;        // L per application
    soilIrrigationsPerWeek = 3;         // Frequency
    soilLeachingFraction = 20;          // %
    soilApplicationEfficiency = 90;     // %
    soilRootingDepth = 40;              // cm

    constructor(
        public fb: FormBuilder,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef,
        private nutrientRecipeService: NutrientRecipeService,
        public http: HttpClient,
        public router: Router,
        private fixedFormulationService: RealDataSimpleFormulationService,
        public authService: AuthService,
        public waterChemistryService: WaterChemistryService,
        public fertilizerService: FertilizerService,
        public cropService: CropService,
        public catalogService: CatalogService,
        public apiService: ApiService,
        private soilAnalysisService: SoilAnalysisService,
        private soilFertigationCalc: SoilFertigationCalculatorService
    ) {
        Chart.register(...registerables);
        this.formulationForm = this.createForm();
        this.calculationForm = this.createCalculationForm(); // Add this line
    }

    // Add this new method to create the calculation form
    public createCalculationForm(): FormGroup {
        return this.fb.group({
            user_id: [1],
            catalogId: [null],
            cropPhaseId: [null, Validators.required],
            waterSourceId: [null, Validators.required],
            targetPh: [6.5],
            volume_liters: [1000, [Validators.required, Validators.min(1), Validators.max(100000)]],
            use_ml: [true],
            apply_safety_caps: [true],
            strict_caps: [false]
        });
    }
    ngOnInit(): void {
        // Ensure forms are initialized
        if (!this.formulationForm) {
            this.formulationForm = this.createForm();
        }
        if (!this.calculationForm) {
            this.calculationForm = this.createCalculationForm();
        }
        this.loadSavedRecipes();
        this.loadInitialData();
        this.loadFormData();
        this.debugFertilizerProperties();
        this.loadRealCropPhaseRequirements(); // Add this line
        // setTimeout(() => {
        //     this.debugCropPhaseRequirements();
        // }, 2000);
    }
    public createForm(): FormGroup {
        return this.fb.group({
            recipeName: ['Nueva Receta', Validators.required],
            waterSourceId: [null, Validators.required],
            cropId: [null],
            cropPhaseId: [null],
            volumeLiters: [[Validators.required]],
            targetPh: [2.0],
            targetEc: [3.0],
            maxBudgetPerLiter: [100],
            preferOrganic: [false],
            excludeFertilizers: [[]]
        });
    }
    public loadCropPhaseSolutionRequirements(): Observable<CropPhaseSolutionRequirement[]> {
        return this.apiService.get('/CropPhase').pipe(
            map(phases => Array.isArray(phases) ? phases : []),
            map(phases => {
                return [];
            })
        );
    }
    onCropChange(event?: any): void {
        const cropId = this.formulationForm.get('cropId')?.value;
        if (cropId) {
            this.formulationForm.patchValue({ cropPhaseId: null });
        }
    }
    onCropPhaseChange(): void {
        const cropPhaseId = this.formulationForm.get('cropPhaseId')?.value;
        if (cropPhaseId) {
            // Find the selected phase and set the cropId
            const selectedPhase = this.cropPhases.find(p => p.id === +cropPhaseId);
            if (selectedPhase) {
                this.formulationForm.patchValue({ cropId: selectedPhase.cropId });
            }
            this.loadPhaseRequirements(cropPhaseId);
        }
    }
    public loadPhaseRequirements(phaseId: number): void {
        const requirement = this.cropPhaseSolutionRequirements.find(req => req.phaseId === phaseId);
        if (requirement) {
            this.formulationForm.patchValue({
                targetPh: requirement.ec ? 6.5 : 6.5,
                targetEc: requirement.ec || 1.5
            });
        }
    }
    public generateFormulationResults(recipe: FormulationRecipe): any[] {
        let achievedN = 0, achievedP = 0, achievedK = 0;
        recipe.fertilizers.forEach(rf => {
            if (rf.fertilizer?.composition) {
                achievedN += (rf.concentration * rf.fertilizer.composition.nitrogen) / 100 * 10;
                achievedP += (rf.concentration * rf.fertilizer.composition.phosphorus) / 100 * 10;
                achievedK += (rf.concentration * rf.fertilizer.composition.potassium) / 100 * 10;
            }
        });
        return [
            {
                parameter: 'Nitrógeno Total',
                target: recipe.targetNitrogen,
                achieved: Math.round(achievedN * 10) / 10,
                unit: 'ppm',
                difference: Math.round((achievedN - recipe.targetNitrogen) * 10) / 10,
                status: Math.abs(achievedN - recipe.targetNitrogen) < 20 ? 'optimal' : 'acceptable'
            },
            {
                parameter: 'Fósforo',
                target: recipe.targetPhosphorus,
                achieved: Math.round(achievedP * 10) / 10,
                unit: 'ppm',
                difference: Math.round((achievedP - recipe.targetPhosphorus) * 10) / 10,
                status: Math.abs(achievedP - recipe.targetPhosphorus) < 10 ? 'optimal' : 'acceptable'
            },
            {
                parameter: 'Potasio',
                target: recipe.targetPotassium,
                achieved: Math.round(achievedK * 10) / 10,
                unit: 'ppm',
                difference: Math.round((achievedK - recipe.targetPotassium) * 10) / 10,
                status: Math.abs(achievedK - recipe.targetPotassium) < 30 ? 'optimal' : 'acceptable'
            },
            {
                parameter: 'pH',
                target: recipe.targetPh,
                achieved: recipe.targetPh,
                unit: '',
                difference: 0,
                status: 'optimal'
            },
            {
                parameter: 'EC',
                target: recipe.targetEc,
                achieved: recipe.targetEc,
                unit: 'dS/m',
                difference: 0,
                status: 'optimal'
            }
        ];
    }
    public saveSavedRecipes(): void {
        try {
            localStorage.setItem('nutrient_recipes', JSON.stringify(this.savedRecipes));
        } catch (error) {
            console.error('Error saving recipes to localStorage:', error);
        }
    }
    loadRecipe(recipe: FormulationRecipe): void {
        console.log("Recipe loaded from DB: ", recipe)
        this.currentRecipe = { ...recipe };
        this.formulationForm.patchValue({
            recipeName: recipe.name,
            waterSourceId: recipe.waterSourceId,
            cropId: recipe.cropId,
            cropPhaseId: recipe.cropPhaseId,
            volumeLiters: recipe.volumeLiters,
            targetPh: recipe.targetPh,
            targetEc: recipe.targetEc
        });
        this.formulationResults = this.generateFormulationResults(this.currentRecipe);
    }
    exportRecipe(): void {
        if (!this.currentRecipe) return;
        const data = JSON.stringify(this.currentRecipe, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receta-${this.currentRecipe.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    getWaterSourceName(id: number): string {
        const source = this.waterSources.find(w => w.id === id);
        return source?.name || 'Fuente desconocida';
    }
    getCropName(id: number): string {
        const crop = this.crops.find(c => c.id === id);
        return crop?.name || 'Cultivo desconocido';
    }
    getCropPhaseName(id: number): string {
        const phase = this.cropPhases.find(p => p.id === id);
        return phase?.name || 'Fase desconocida';
    }
    getFilteredCropPhases(): CropPhase[] {
        // returns cropphases where cropPhaseSolutionRequirements has an entry
        const availableCropPhasesId = this.cropPhaseSolutionRequirements.map(req => req.phaseId.toString());
        return this.cropPhases.filter(phase => availableCropPhasesId.includes(phase.id.toString()));
    }

    // Alias for template compatibility
    getFilteredPhases(): CropPhase[] {
        return this.getFilteredCropPhases();
    }

    // Alias for template compatibility
    onPhaseChange(event?: any): void {
        this.onCropPhaseChange();
        this.loadSoilAnalyses();
    }
    getStatusClass(target: number, achieved: number): string {
        const difference = Math.abs(target - achieved);
        if (difference < target * 0.1) {
            return 'status-optimal';
        } else if (difference < target * 0.3) {
            return 'text-warning';
        } else {
            return 'status-critical';
        }
    }
    getStatusText(target: number, achieved: number): string {
        const difference = Math.abs(target - achieved);
        if (difference < target * 0.1) {
            return 'Óptimo';
        } else if (difference < target * 0.3) {
            return 'Aceptable';
        } else {
            return 'Crítico';
        }
    }
    getStatusIcon(status: string): string {
        const icons = {
            'optimal': 'bi-check-circle-fill',
            'acceptable': 'bi-exclamation-triangle-fill',
            'critical': 'bi-x-circle-fill'
        };
        return icons[status as keyof typeof icons] || 'bi-question-circle';
    }
    toggleAdvancedOptions(): void {
        this.showAdvancedOptions = !this.showAdvancedOptions;
    }
    public sanitizeFormValues(formValue: any): any {
        return {
            ...formValue,
            waterSourceId: Number(formValue.waterSourceId),
            cropId: Number(formValue.cropId),
            cropPhaseId: formValue.cropPhaseId ? Number(formValue.cropPhaseId) : null,
            volumeLiters: Number(formValue.volumeLiters) || 1000,
            targetPh: Number(formValue.targetPh) || 6.5,
            targetEc: Number(formValue.targetEc) || 1.5,
            maxBudgetPerLiter: Number(formValue.maxBudgetPerLiter) || 100
        };
    }
    public calculateSimpleFertilizerMix(recipe: FormulationRecipe, fertilizers: Fertilizer[]): RecipeFertilizer[] {
        const selectedFertilizers: RecipeFertilizer[] = [];
        const targets = {
            nitrogen: Number(recipe.targetNitrogen) || 200,
            phosphorus: Number(recipe.targetPhosphorus) || 50,
            potassium: Number(recipe.targetPotassium) || 300
        };
        const nSource = fertilizers
            .filter(f => f.composition && f.composition.nitrogen > 0)
            .sort((a, b) => (b.composition?.nitrogen || 0) - (a.composition?.nitrogen || 0))[0];
        const pSource = fertilizers
            .filter(f => f.composition && f.composition.phosphorus > 0)
            .sort((a, b) => (b.composition?.phosphorus || 0) - (a.composition?.phosphorus || 0))[0];
        const kSource = fertilizers
            .filter(f => f.composition && f.composition.potassium > 0)
            .sort((a, b) => (b.composition?.potassium || 0) - (a.composition?.potassium || 0))[0];
        const volumeLiters = Number(recipe.volumeLiters) || 1000;
        if (nSource) {
            const concentration = this.calculateSimpleConcentration(nSource, targets.nitrogen, 'nitrogen', volumeLiters);
            if (concentration > 0) {
                selectedFertilizers.push({
                    fertilizerId: nSource.id,
                    fertilizer: nSource,
                    concentration: concentration,
                    percentageOfN: 60,
                    percentageOfP: 20,
                    percentageOfK: 20,
                    costPortion: concentration * (nSource.pricePerUnit || 0) * volumeLiters / 1000
                });
            }
        }
        if (pSource && pSource.id !== nSource?.id) {
            const concentration = this.calculateSimpleConcentration(pSource, targets.phosphorus, 'phosphorus', volumeLiters);
            if (concentration > 0) {
                selectedFertilizers.push({
                    fertilizerId: pSource.id,
                    fertilizer: pSource,
                    concentration: concentration,
                    percentageOfN: 20,
                    percentageOfP: 60,
                    percentageOfK: 20,
                    costPortion: concentration * (pSource.pricePerUnit || 0) * volumeLiters / 1000
                });
            }
        }
        if (kSource && kSource.id !== nSource?.id && kSource.id !== pSource?.id) {
            const concentration = this.calculateSimpleConcentration(kSource, targets.potassium, 'potassium', volumeLiters);
            if (concentration > 0) {
                selectedFertilizers.push({
                    fertilizerId: kSource.id,
                    fertilizer: kSource,
                    concentration: concentration,
                    percentageOfN: 20,
                    percentageOfP: 20,
                    percentageOfK: 60,
                    costPortion: concentration * (kSource.pricePerUnit || 0) * volumeLiters / 1000
                });
            }
        }
        recipe.totalCost = selectedFertilizers.reduce((sum, fert) => sum + fert.costPortion, 0);
        return selectedFertilizers;
    }
    public calculateSimpleConcentration(fertilizer: Fertilizer, targetPpm: number, nutrient: keyof FertilizerComposition, volumeLiters: number): number {
        if (!fertilizer.composition) return 0;
        let nutrientPercentageRaw = fertilizer.composition[nutrient];
        const nutrientPercentage = typeof nutrientPercentageRaw === 'number' ? nutrientPercentageRaw : Number(nutrientPercentageRaw) || 0;
        if (nutrientPercentage === 0) return 0;
        const concentration = (targetPpm * volumeLiters) / (nutrientPercentage * 10);
        return Math.max(0, Math.min(5, concentration));
    }
    public selectOptimalFertilizersFixed(fertilizers: any[], targets: any, volumeLiters: number): any[] {
        if (fertilizers.length === 0) {
            console.warn('No fertilizers provided to selectOptimalFertilizersFixed');
            return [];
        }
        const selected: any[] = [];
        const remaining = { ...targets };
        const maxFertilizers = 4;
        const scored = fertilizers.map(fert => {
            const score = this.calculateFertilizerScoreFixed(fert, targets);
            const maxSolubility = fert.chemistry?.solubility20 || 500;
            return {
                ...fert,
                score: score,
                maxSolubility: maxSolubility
            };
        }).sort((a, b) => b.score - a.score);
        for (const fertilizer of scored) {
            if (selected.length >= maxFertilizers) break;
            const concentration = this.calculateOptimalConcentrationFixed(fertilizer, remaining, volumeLiters);
            if (concentration > 0 && concentration <= fertilizer.maxSolubility * 0.8) {
                fertilizer.concentration = concentration;
                selected.push(fertilizer);
                this.updateRemainingTargetsFixed(remaining, fertilizer, concentration, volumeLiters);
                if (this.targetsAreSufficientFixed(remaining, targets)) {
                    break;
                }
            } else {
            }
        }
        return selected;
    }
    public calculateFertilizerScoreFixed(fertilizer: any, targets: any): number {
        if (!fertilizer.composition) return 0;
        const comp = fertilizer.composition;
        let score = 0;
        if (targets.nitrogen > 0 && comp.nitrogen > 0) {
            score += Math.min(40, (comp.nitrogen / 50) * 40);
        }
        if (targets.phosphorus > 0 && comp.phosphorus > 0) {
            score += Math.min(30, (comp.phosphorus / 20) * 30);
        }
        if (targets.potassium > 0 && comp.potassium > 0) {
            score += Math.min(30, (comp.potassium / 50) * 30);
        }
        const costScore = Math.max(0, 20 - (fertilizer.pricePerUnit || 0));
        score += costScore;
        if (fertilizer.chemistry) {
            const purityBonus = (fertilizer.chemistry.purity || 90) / 10;
            const solubilityBonus = Math.min((fertilizer.chemistry.solubility20 || 200) / 100, 5);
            score += purityBonus + solubilityBonus;
        }
        return score;
    }
    public calculateOptimalConcentrationFixed(fertilizer: any, targets: any, volumeLiters: number): number {
        if (!fertilizer.composition) return 0;
        const comp = fertilizer.composition;
        const concentrations: number[] = [];
        if (targets.nitrogen > 0 && comp.nitrogen > 0) {
            const needed = (targets.nitrogen * volumeLiters) / (comp.nitrogen * 10);
            concentrations.push(needed / 1000);
        }
        if (targets.phosphorus > 0 && comp.phosphorus > 0) {
            const needed = (targets.phosphorus * volumeLiters) / (comp.phosphorus * 10);
            concentrations.push(needed / 1000);
        }
        if (targets.potassium > 0 && comp.potassium > 0) {
            const needed = (targets.potassium * volumeLiters) / (comp.potassium * 10);
            concentrations.push(needed / 1000);
        }
        if (concentrations.length === 0) {
            return 0;
        }
        const result = Math.min(...concentrations) * 0.7;
        return Math.max(0, Math.min(10, result));
    }
    public updateRemainingTargetsFixed(remaining: any, fertilizer: any, concentration: number, volumeLiters: number): void {
        if (!fertilizer.composition) return;
        const comp = fertilizer.composition;
        remaining.nitrogen = Math.max(0, remaining.nitrogen - (comp.nitrogen * concentration * 10));
        remaining.phosphorus = Math.max(0, remaining.phosphorus - (comp.phosphorus * concentration * 10));
        remaining.potassium = Math.max(0, remaining.potassium - (comp.potassium * concentration * 10));
        remaining.calcium = Math.max(0, remaining.calcium - ((comp.calcium || 0) * concentration * 10));
        remaining.magnesium = Math.max(0, remaining.magnesium - ((comp.magnesium || 0) * concentration * 10));
    }
    public targetsAreSufficientFixed(remaining: any, original: any): boolean {
        const threshold = 0.3;
        const nMet = (original.nitrogen - remaining.nitrogen) / original.nitrogen >= (1 - threshold);
        const pMet = (original.phosphorus - remaining.phosphorus) / original.phosphorus >= (1 - threshold);
        const kMet = (original.potassium - remaining.potassium) / original.potassium >= (1 - threshold);
        return nMet && pMet && kMet;
    }
    /**
  * Calculate nutrient contribution from fertilizer (in grams)
  * Updated to work with new fertilizer data structure
  */
    private calculateNutrientContribution(fertilizer: any, dosageGPerL: number, volumeLiters: number): any {
        if (!fertilizer) {
            return { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0, Fe: 0, Mn: 0, Zn: 0, Cu: 0, B: 0, Mo: 0 };
        }

        const totalGrams = dosageGPerL * volumeLiters;

        // Helper function to get nutrient value
        const getNutrientValue = (nutrientKey: string): number => {
            const value = fertilizer[nutrientKey] || 0;

            // If value is in ppm (> 1000), convert to percentage
            if (value > 1000) {
                return (value / 10000); // Convert ppm to percentage
            }

            return value;
        };

        return {
            N: (getNutrientValue('n') * totalGrams) / 100,
            P: (getNutrientValue('p') * totalGrams) / 100,
            K: (getNutrientValue('k') * totalGrams) / 100,
            Ca: (getNutrientValue('ca') * totalGrams) / 100,
            Mg: (getNutrientValue('mg') * totalGrams) / 100,
            S: (getNutrientValue('s') * totalGrams) / 100,
            Fe: (getNutrientValue('fe') * totalGrams) / 100,
            Mn: (getNutrientValue('mn') * totalGrams) / 100,
            Zn: (getNutrientValue('zn') * totalGrams) / 100,
            Cu: (getNutrientValue('cu') * totalGrams) / 100,
            B: (getNutrientValue('b') * totalGrams) / 100,
            Mo: (getNutrientValue('mo') * totalGrams) / 100
        };
    }
    public generateEnhancedFormulationResults(recipe: FormulationRecipe, waterSource: WaterChemistry): any[] {
        let achievedN = waterSource.no3 || 0;
        let achievedP = waterSource.h2po4 || 0;
        let achievedK = waterSource.k || 0;
        let achievedCa = waterSource.ca || 0;
        let achievedMg = waterSource.mg || 0;
        recipe.fertilizers.forEach(rf => {
            if (rf.fertilizer?.composition && rf.concentration > 0) {
                const factor = rf.concentration / 10;
                achievedN += (rf.fertilizer.composition.nitrogen || 0) * factor;
                achievedP += (rf.fertilizer.composition.phosphorus || 0) * factor;
                achievedK += (rf.fertilizer.composition.potassium || 0) * factor;
                achievedCa += (rf.fertilizer.composition.calcium || 0) * factor;
                achievedMg += (rf.fertilizer.composition.magnesium || 0) * factor;
            }
        });
        const estimatedPh = this.estimatePh(waterSource, recipe.fertilizers);
        const estimatedEc = this.estimateEc(waterSource, recipe.fertilizers);
        return [

            {
                parameter: 'pH',
                target: recipe.targetPh,
                achieved: estimatedPh,
                unit: '',
                difference: Math.round((estimatedPh - recipe.targetPh) * 10) / 10,
                status: this.getStatus(estimatedPh, recipe.targetPh, 3)
            },
            {
                parameter: 'EC',
                target: recipe.targetEc,
                achieved: estimatedEc,
                unit: 'dS/m',
                difference: Math.round((estimatedEc - recipe.targetEc) * 100) / 100,
                status: this.getStatus(estimatedEc, recipe.targetEc, 2)
            }
        ];
    }
    public estimatePh(waterSource: WaterChemistry, fertilizers: RecipeFertilizer[]): number {
        let estimatedPh = waterSource.ph || 7.0;
        fertilizers.forEach(rf => {
            const chemistry = this.fertilizerChemistries.find(c => c.fertilizerId === rf.fertilizerId);
            if (chemistry) {
                const effect = -0.1;
                const strength = (rf.concentration / 100);
                estimatedPh += effect * strength;
            }
        });
        return Math.max(5.5, Math.min(8.5, Math.round(estimatedPh * 10) / 10));
    }
    public estimateEc(waterSource: WaterChemistry, fertilizers: RecipeFertilizer[]): number {
        let estimatedEc = waterSource.ec || 0.3;
        fertilizers.forEach(rf => {
            const ecContribution = rf.concentration * 0.0015;
            estimatedEc += ecContribution;
        });
        return Math.round(estimatedEc * 100) / 100;
    }
    public getStatus(achieved: number, target: number, tolerance: number): string {
        const difference = Math.abs(achieved - target);
        if (difference <= tolerance * 0.5) return 'optimal';
        if (difference <= tolerance) return 'acceptable';
        return 'critical';
    }
    saveToLocalStorage(): void {
        try {
            this.currentRecipe!.id = Date.now() + 1000000;
            this.savedRecipes.push(this.currentRecipe!);
            this.saveSavedRecipes();
            this.Message = 'Receta guardada localmente (sin conexión)';
        } catch (error) {
            console.error('Error saving recipe to localStorage:', error);
            this.errorMessage = 'Error al guardar la receta localmente';
        } finally {
            this.isLoading = false;
        }
    }
    loadFromLocalStorage(): void {
        try {
            const data = localStorage.getItem('nutrient_recipes');
            if (data) {
                this.savedRecipes = JSON.parse(data);
            } else {
                this.savedRecipes = [];
            }
        } catch (error) {
            console.error('Error loading recipes from localStorage:', error);
            this.savedRecipes = [];
        }
        this.isLoading = false;
    }
    deleteFromLocalStorage(recipeId: number): void {
        try {
            this.savedRecipes = this.savedRecipes.filter(recipe => recipe.id !== recipeId);
            this.saveSavedRecipes();
            this.Message = 'Receta eliminada localmente';
        } catch (error) {
            console.error('Error deleting recipe from localStorage:', error);
            this.errorMessage = 'Error al eliminar la receta localmente';
        } finally {
            this.isLoading = false;
        }
    }
    getLast2CharsToInt(value: string): number {
        if (!value || value.length < 2) return 0;
        const last2Chars = value.slice(-2);
        const intValue = parseInt(last2Chars, 10);
        console.log(`Extracted integer from last 2 chars of "${value}":`, intValue);
        return isNaN(intValue) ? 0 : intValue;
    }
    public saveRecipe(result: SimpleFormulationResult | any): void {
        console.log('💾 Saving recipe to database...', result);
        console.log('cropPhases:', this.cropPhases);

        // Defensive checks
        if (!result) {
            console.error('❌ No result provided to saveRecipe');
            alert('Error: No recipe data to save.');
            return;
        } else {
            console.log('Result to save:', result);
        }

        const phaseId = this.getLast2CharsToInt(result.data_sources.requirements_api);
        const matchedCropId = this.cropPhases.find(phase => phase.id === phaseId)?.cropId;

        console.log('Derived matchedCropId from requirements_api:', matchedCropId);

        let cropId = matchedCropId;
        if (!cropId || isNaN(Number(cropId))) {
            console.error('❌ Invalid cropId:', cropId);
            alert('Error: Invalid crop selection. Please select a valid crop.');
            return;
        }
        cropId = Number(cropId);

        // Determine cropPhaseId - ensure it's a valid integer
        const cropPhaseId = this.cropPhases.find(phase => phase.id === phaseId)?.id;
        if (!cropPhaseId || isNaN(Number(cropPhaseId))) {
            console.error('❌ Invalid cropPhaseId:', cropPhaseId);
            alert('Error: Invalid crop phase selection. Please select a valid crop phase.');
            return;
        }

        // Map fertilizers with proper structure
        const fertilizers = (result.fertilizers || []).map((fert: any, index: number) => {
            const matchedFertilizer = this.fertilizers?.find(f =>
                f.name?.trim().toLowerCase() === fert.fertilizerName?.trim().toLowerCase()
            );

            return {
                fertilizerId: matchedFertilizer?.id || 0,
                concentrationGramsPerLiter: Number(fert.concentration) || 0,
                totalGrams: Number(fert.totalAmount) || 0,
                totalKilograms: fert.totalAmount ? Number(fert.totalAmount) / 1000 : null,
                nitrogenContribution: Number(fert.npkContribution?.nitrogen) || 0,
                phosphorusContribution: Number(fert.npkContribution?.phosphorus) || 0,
                potassiumContribution: Number(fert.npkContribution?.potassium) || 0,
                calciumContribution: Number(fert.realComposition?.calcium) || 0,
                magnesiumContribution: Number(fert.realComposition?.magnesium) || 0,
                sulfurContribution: Number(fert.realComposition?.sulfur) || 0,
                percentageOfN: Number(fert.realComposition?.nitrogen) || 0,
                percentageOfP: Number(fert.realComposition?.phosphorus) || 0,
                percentageOfK: Number(fert.realComposition?.potassium) || 0,
                costPerUnit: (fert.totalAmount || 1) !== 0 ? (Number(fert.cost) || 0) / (Number(fert.totalAmount) || 1) : 0,
                totalCost: Number(fert.cost) || 0,
                costPortion: Number(fert.cost) || 0,
                applicationOrder: index + 1,
                applicationNotes: null
            };
        });

        // Build the command object matching CreateNutrientRecipeCommand
        const command = {
            name: result.recipeName || `Recipe ${new Date().toLocaleDateString()}`,
            description: `Nutrient recipe for ${this.getCropName(cropId)} - ${this.getCropPhaseName(cropPhaseId)}`,
            cropId: cropId,
            cropPhaseId: cropPhaseId,
            waterSourceId: null,
            catalogId: 1,
            targetPh: Number(result.targetPh) || 0,
            targetEc: Number(result.targetEc) || 0,
            volumeLiters: Number(result.volumeLiters) || 0,
            targetNitrogen: Number(result.nutrientBalance?.nitrogen?.target) || 0,
            targetPhosphorus: Number(result.nutrientBalance?.phosphorus?.target) || 0,
            targetPotassium: Number(result.nutrientBalance?.potassium?.target) || 0,
            targetCalcium: result.nutrientBalance?.calcium?.target ? Number(result.nutrientBalance.calcium.target) : null,
            targetMagnesium: result.nutrientBalance?.magnesium?.target ? Number(result.nutrientBalance.magnesium.target) : null,
            targetSulfur: result.nutrientBalance?.sulfur?.target ? Number(result.nutrientBalance.sulfur.target) : null,
            targetIron: result.nutrientBalance?.iron?.target ? Number(result.nutrientBalance.iron.target) : null,
            achievedNitrogen: result.nutrientBalance?.nitrogen?.achieved ? Number(result.nutrientBalance.nitrogen.achieved) : null,
            achievedPhosphorus: result.nutrientBalance?.phosphorus?.achieved ? Number(result.nutrientBalance.phosphorus.achieved) : null,
            achievedPotassium: result.nutrientBalance?.potassium?.achieved ? Number(result.nutrientBalance.potassium.achieved) : null,
            achievedCalcium: result.nutrientBalance?.calcium?.achieved ? Number(result.nutrientBalance.calcium.achieved) : null,
            achievedMagnesium: result.nutrientBalance?.magnesium?.achieved ? Number(result.nutrientBalance.magnesium.achieved) : null,
            achievedSulfur: result.nutrientBalance?.sulfur?.achieved ? Number(result.nutrientBalance.sulfur.achieved) : null,
            achievedIron: result.nutrientBalance?.iron?.achieved ? Number(result.nutrientBalance.iron.achieved) : null,
            totalCost: result.totalCost ? Number(result.totalCost) : null,
            costPerLiter: result.volumeLiters ? (Number(result.totalCost) || 0) / Number(result.volumeLiters) : null,
            recipeType: this.isSimpleFormulationActive() ? 'Simple' : 'Advanced',
            instructions: JSON.stringify(result.instructions || []),
            warnings: JSON.stringify(result.warnings || []),
            notes: result.notes || null,
            fertilizers: fertilizers
        };

        console.log('📦 Command prepared for API:', command);

        // Send the command directly (not wrapped)
        this.nutrientRecipeService.create(command).subscribe({
            next: (response) => {
                console.log('✅ Recipe saved to database:', response);
                alert(`Recipe "${command.name}" saved successfully!`);
                this.loadSavedRecipes();
            },
            error: (error) => {
                console.error('❌ Error saving recipe:', error);

                // Enhanced error messaging
                let errorMessage = 'Error saving recipe. ';
                if (error.originalError?.error?.errors) {
                    const errors = error.originalError.error.errors;
                    const errorMessages = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`);
                    errorMessage += errorMessages.join('; ');
                } else if (error.message) {
                    errorMessage += error.message;
                }

                alert(errorMessage);
            }
        });
    }
    public saveRecipeDetails(recipeId: number, catalogId: number): void {
        if (!this.currentRecipe) return;
        const basicData = {
            id: recipeId,
            name: this.currentRecipe.name,
            waterSourceId: this.currentRecipe.waterSourceId,
            cropId: this.currentRecipe.cropId,
            cropPhaseId: this.currentRecipe.cropPhaseId,
            targetPh: this.currentRecipe.targetPh,
            targetEc: this.currentRecipe.targetEc,
            volumeLiters: this.currentRecipe.volumeLiters,
            totalCost: this.currentRecipe.totalCost
        };
        const nutrientData = {
            targetNitrogen: this.currentRecipe.targetNitrogen,
            targetPhosphorus: this.currentRecipe.targetPhosphorus,
            targetPotassium: this.currentRecipe.targetPotassium,
            targetCalcium: this.currentRecipe.targetCalcium,
            targetMagnesium: this.currentRecipe.targetMagnesium,
            targetSulfur: this.currentRecipe.targetSulfur,
            targetIron: this.currentRecipe.targetIron
        };
        const basicDataRecord = {
            catalogId: catalogId,
            name: `RECIPE_DATA_${recipeId}`,
            description: JSON.stringify(basicData).substring(0, 120),
            script: 'RECIPE_BASIC',
            entityType: 999,
            active: true
        };
        const nutrientDataRecord = {
            catalogId: catalogId,
            name: `RECIPE_NUTRIENTS_${recipeId}`,
            description: JSON.stringify(nutrientData).substring(0, 120),
            script: 'RECIPE_NUTRIENTS',
            entityType: 999,
            active: true
        };
        console.log('🔥 Saving basic recipe data to server:', basicDataRecord);
        this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, basicDataRecord).pipe(
            catchError((error) => {
                console.error('Failed to save basic recipe data', error);
                return of({ success: false });
            })
        ).subscribe({
            next: (basicResponse: any) => {
                if (basicResponse) {
                    console.log('🔥 Basic recipe data saved successfully:', basicResponse);
                    this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, nutrientDataRecord).subscribe({
                        next: (nutrientResponse) => {
                            console.log('🔥 Nutrient recipe data saved successfully:', nutrientResponse);
                            if (nutrientResponse) {
                                this.saveRecipeFertilizers(recipeId, catalogId);
                            } else {
                                console.error('Failed to save nutrient recipe data');
                                this.handleSaveComplete('Receta guardada parcialmente');
                            }
                        },
                        error: (error) => console.error('Failed to save nutrient recipe data', error)
                    });
                } else {
                    console.error('Failed to save basic recipe data');
                    this.handleSaveComplete('Receta guardada como resumen únicamente');
                }
            }
        });
    }
    public saveRecipeFertilizers(recipeId: number, catalogId: number): void {
        if (!this.currentRecipe || !this.currentRecipe.fertilizers.length) {
            console.error('No fertilizers to save for recipe', this.currentRecipe);
            return;
        }
        const fertilizerPromises = this.currentRecipe.fertilizers.map((fert: { fertilizerId: any; concentration: any; percentageOfN: any; percentageOfP: any; percentageOfK: any; costPortion: any; }, index: any) => {
            const fertRecord = {
                catalogId: catalogId,
                name: `RECIPE_FERT_${recipeId}_${index}`,
                description: `F:${fert.fertilizerId}|C:${fert.concentration}|N:${fert.percentageOfN}|P:${fert.percentageOfP}|K:${fert.percentageOfK}|$:${fert.costPortion}`,
                script: 'RECIPE_FERTILIZER',
                entityType: 999,
                active: true
            };
            console.log('🔥 Saving fertilizer record to server:', fertRecord);
            return this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, fertRecord).pipe(
                catchError((error) => {
                    console.error('Failed to save fertilizer data', error);
                    return of({ success: false });
                })
            ).toPromise();
        });
        Promise.all(fertilizerPromises).then(() => {
            console.log('🔥 All fertilizer records processed');
            this.handleSaveComplete('Receta guardada exitosamente en el servidor');
        });
    }
    public handleSaveComplete(message: string): void {
        this.Message = message;
        this.isLoading = false;
        this.loadSavedRecipes();
    }
    public parseFertilizerRecord(description: string): any | null {
        try {
            const parts = description.split('|');
            const data: any = {};
            parts.forEach(part => {
                const [key, value] = part.split(':');
                data[key] = value;
            });
            if (!data.F) return null;
            const fertilizer = this.fertilizers.find(f => f.id === parseInt(data.F));
            return {
                fertilizerId: parseInt(data.F),
                fertilizer: fertilizer,
                concentration: parseFloat(data.C || '0'),
                percentageOfN: parseFloat(data.N || '0'),
                percentageOfP: parseFloat(data.P || '0'),
                percentageOfK: parseFloat(data.K || '0'),
                costPortion: parseFloat(data.CP || '0')
            };
        } catch (error) {
            console.error('Error parsing fertilizer record:', error);
            return null;
        }
    }
    public deleteRecipe(recipeId: number, event?: Event): void {
        // Prevent card click event from firing
        if (event) {
            event.stopPropagation();
        }

        if (!confirm('¿Está seguro de que desea eliminar esta receta?')) {
            return;
        }

        this.nutrientRecipeService.delete(recipeId).subscribe({
            next: () => {
                console.log('✅ Recipe deleted');
                this.successMessage = 'Receta eliminada exitosamente';
                this.loadSavedRecipes(); // Reload recipes
                this.filterAllRecipes(); // Refresh filtered list
            },
            error: (error) => {
                console.error('❌ Error deleting recipe:', error);
                this.errorMessage = 'Error al eliminar la receta. Por favor intente nuevamente.';
            }
        });
    }
    public deleteRecipeFromBackend(recipeId: number): void {
        this.apiService.get(this.ANALYTICAL_ENTITY_ENDPOINT).pipe(
            catchError(() => of({ success: false }))
        ).subscribe({
            next: (response: any) => {
                if (response && response) {
                    const entities = response.result?.analyticalEntities || response.result || [];
                    const relatedRecords = entities.filter((entity: any) =>
                        entity.id === recipeId ||
                        entity.name === `RECIPE_DATA_${recipeId}` ||
                        entity.name === `RECIPE_NUTRIENTS_${recipeId}` ||
                        entity.name.startsWith(`RECIPE_FERT_${recipeId}_`)
                    );
                    const deletePromises = relatedRecords.map((record: any) =>
                        this.apiService.delete(`${this.ANALYTICAL_ENTITY_ENDPOINT}/${record.id}`).pipe(
                            catchError(() => of({ success: false }))
                        ).toPromise()
                    );
                    Promise.all(deletePromises).then(() => {
                        this.savedRecipes = this.savedRecipes.filter(r => r.id !== recipeId);
                        this.Message = 'Receta eliminada exitosamente';
                        this.isLoading = false;
                    });
                } else {
                    this.deleteFromLocalStorage(recipeId);
                }
            },
            error: () => {
                this.deleteFromLocalStorage(recipeId);
            }
        });
    }
    public calculateOptimizationScore(fertilizer: Fertilizer, requirements: any): number {
        if (!fertilizer.composition || !requirements) {
            return 0;
        }
        const composition = fertilizer.composition;
        let score = 0;
        let factors = 0;
        if (requirements.nitrogen && composition.nitrogen) {
            score += Math.min(composition.nitrogen / requirements.nitrogen, 1) * 0.4;
            factors++;
        }
        if (requirements.phosphorus && composition.phosphorus) {
            score += Math.min(composition.phosphorus / requirements.phosphorus, 1) * 0.3;
            factors++;
        }
        if (requirements.potassium && composition.potassium) {
            score += Math.min(composition.potassium / requirements.potassium, 1) * 0.3;
            factors++;
        }
        return factors > 0 ? (score / factors) * 100 : 0;
    }
    calculateFormulationWithDebug(): void {
        if (this.fertilizers.length > 0) {
        }
        const fertilizersWithNutrients = this.fertilizers.filter(f =>
            f.composition && (f.composition.nitrogen > 0 || f.composition.phosphorus > 0 || f.composition.potassium > 0)
        );
        this.calculateFormulation();
    }
    public loadInitialData(): void {
        this.isLoading = true;
        this.errorMessage = '';
        const waterSources$ = this.waterChemistryService.getAll().pipe(
            map((data: any) => {
                if (data && Array.isArray(data.waterChemistries)) {
                    return data;
                } else if (Array.isArray(data)) {
                    return { waterChemistries: data };
                } else {
                    return { waterChemistries: [] };
                }
            }),
            catchError(error => {
                console.error('Error loading water sources:', error);
                return of({ waterChemistries: [] });
            })
        );
        const clientId = this.authService.getCurrentUserId();
        this.catalogService.getAll(clientId).subscribe({
            next: (response: any) => {
                console.log('Loaded catalogs:', response);
                const firstCatalogId = response.catalogs && response.catalogs.length > 0 ? response.catalogs[0].id : null;
                if (!firstCatalogId) {
                    this.errorMessage = 'No catalog found';
                    this.isLoading = false;
                    return;
                }
                const crops$ = this.cropService.getAll().pipe(
                    catchError(error => {
                        console.error('Error loading crops:', error);
                        return of([]);
                    })
                );
                const cropPhases$ = this.apiService.get('/CropPhase').pipe(
                    map(response => {
                        if (response && typeof response === 'object' && 'cropPhases' in response && Array.isArray((response as any).cropPhases)) {
                            return (response as any).cropPhases;
                        }
                        if (Array.isArray(response)) {
                            return response;
                        }
                        return [];
                    }),
                    catchError(error => {
                        console.error('Error loading crop phases:', error);
                        return of([]);
                    })
                );
                const fertilizerChemistries$ = this.apiService.get('/FertilizerChemistry').pipe(
                    map(response => Array.isArray(response) ? response : []),
                    catchError(error => {
                        console.error('Error loading fertilizer chemistries:', error);
                        return of([]);
                    })
                );
                const solutionRequirements$ = this.loadCropPhaseSolutionRequirements().pipe(
                    catchError(error => {
                        console.error('Error loading solution requirements:', error);
                        return of([]);
                    })
                );
                forkJoin({
                    waterSources: waterSources$,
                    crops: crops$,
                    cropPhases: cropPhases$,
                    fertilizerChemistries: fertilizerChemistries$,
                    solutionRequirements: solutionRequirements$
                }).subscribe({
                    next: (data) => {
                        console.log(" 🌞 full data: ", data)
                        this.waterSources = Array.isArray(data.waterSources.waterChemistries) ? data.waterSources.waterChemistries : [];
                        this.crops = Array.isArray(data.crops) ? data.crops : [];
                        this.cropPhases = Array.isArray(data.cropPhases) ? data.cropPhases : [];
                        this.fertilizerChemistries = Array.isArray(data.fertilizerChemistries) ? data.fertilizerChemistries : [];
                        this.loadOptimizedFertilizers();
                        console.log('this.fertilizers:', this.fertilizers);

                        for (const phase of this.cropPhases) {
                            // get name of crop by phase.cropId
                            const crop = this.crops.find(c => c.id === phase.cropId);
                            phase.cropName = crop ? crop.name : 'Unknown';
                        }
                        console.log('Loaded crop phases:', this.cropPhases);
                    },
                    error: (error) => {
                        this.errorMessage = 'Error al cargar los datos básicos';
                        this.isLoading = false;
                        console.error('Error loading initial data:', error);
                    }
                });
            }
        });
    }
    public createRecipeFromForm(formValue: any, waterSource: WaterChemistry, crop: Crop, phase?: CropPhase): FormulationRecipe {
        const solutionReq = this.cropPhaseSolutionRequirements.find(req => req.phaseId === formValue.cropPhaseId);
        const recipeName = formValue.recipeName || `${crop.name}${phase ? ' - ' + phase.name : ''}`;
        console.log("solutionReq: ", solutionReq)
        const targets = {
            nitrogen: solutionReq?.no3 || 200,
            phosphorus: solutionReq?.h2po4 || 50,
            potassium: solutionReq?.k || 300,
            calcium: solutionReq?.ca || 150,
            magnesium: solutionReq?.mg || 50,
            sulfur: solutionReq?.so4 || 100,
            iron: solutionReq?.fe || 3
        };
        const selectedFertilizers = this.selectOptimalFertilizersForRecipe(targets, formValue.volumeLiters);
        const totalCost = selectedFertilizers.reduce((sum, fert) => sum + fert.costPortion, 0);
        return {
            name: recipeName,
            waterSourceId: formValue.waterSourceId,
            cropId: formValue.cropId,
            cropPhaseId: formValue.cropPhaseId,
            targetPh: formValue.targetPh,
            targetEc: formValue.targetEc,
            targetNitrogen: targets.nitrogen,
            targetPhosphorus: targets.phosphorus,
            targetPotassium: targets.potassium,
            targetCalcium: targets.calcium,
            targetMagnesium: targets.magnesium,
            targetSulfur: targets.sulfur,
            targetIron: targets.iron,
            volumeLiters: formValue.volumeLiters,
            totalCost: totalCost,
            fertilizers: selectedFertilizers,
            createdAt: new Date()
        };
    }
    public selectOptimalFertilizersForRecipe(targets: any, volumeLiters: number): RecipeFertilizer[] {
        const selectedFertilizers: RecipeFertilizer[] = [];
        const availableFertilizers = this.fertilizers;
        if (availableFertilizers.length === 0) {
            console.warn('No active fertilizers with composition available');
            return [];
        }
        const scoredFertilizers = availableFertilizers.map(fert => ({
            ...fert,
            score: this.calculateFertilizerEffectivenessScore(fert, targets)
        })).sort((a, b) => b.score - a.score);
        const remaining = { ...targets };
        const maxFertilizers = 4;
        const usedFertilizerIds = new Set<number>();
        const nitrogenSource = this.findBestNutrientSource(scoredFertilizers, 'nitrogen', remaining.nitrogen, usedFertilizerIds);
        const phosphorusSource = this.findBestNutrientSource(scoredFertilizers, 'phosphorus', remaining.phosphorus, usedFertilizerIds);
        const potassiumSource = this.findBestNutrientSource(scoredFertilizers, 'potassium', remaining.potassium, usedFertilizerIds);
        [nitrogenSource, phosphorusSource, potassiumSource].forEach(source => {
            if (source && selectedFertilizers.length < maxFertilizers) {
                const concentration = this.calculateOptimalConcentrationForFertilizer(source, remaining, volumeLiters);
                if (concentration > 0) {
                    const recipeFertilizer = this.createRecipeFertilizer(source, concentration, targets, volumeLiters);
                    selectedFertilizers.push(recipeFertilizer);
                    usedFertilizerIds.add(source.id);
                    this.updateRemainingTargets(remaining, source, concentration);
                }
            }
        });
        if (selectedFertilizers.length < maxFertilizers && this.needsAdditionalFertilizer(remaining, targets)) {
            const balancedSource = scoredFertilizers.find(f =>
                !usedFertilizerIds.has(f.id) &&
                f.composition &&
                this.isBalancedFertilizer(f.composition)
            );
            if (balancedSource) {
                const concentration = this.calculateOptimalConcentrationForFertilizer(balancedSource, remaining, volumeLiters);
                if (concentration > 0) {
                    const recipeFertilizer = this.createRecipeFertilizer(balancedSource, concentration, targets, volumeLiters);
                    selectedFertilizers.push(recipeFertilizer);
                }
            }
        }
        return selectedFertilizers;
    }
    public calculateOptimalConcentrationForFertilizer(fertilizer: any, remaining: any, volumeLiters: number): number {
        if (!fertilizer.composition) return 0;
        const comp = fertilizer.composition;
        const concentrations: number[] = [];
        if (remaining.nitrogen > 0 && comp.nitrogen > 0) {
            const needed = (remaining.nitrogen * volumeLiters) / (comp.nitrogen * 10);
            concentrations.push(needed / 1000);
        }
        if (remaining.phosphorus > 0 && comp.phosphorus > 0) {
            const needed = (remaining.phosphorus * volumeLiters) / (comp.phosphorus * 10);
            concentrations.push(needed / 1000);
        }
        if (remaining.potassium > 0 && comp.potassium > 0) {
            const needed = (remaining.potassium * volumeLiters) / (comp.potassium * 10);
            concentrations.push(needed / 1000);
        }
        if (concentrations.length === 0) return 0;
        let concentration = Math.min(...concentrations) * 0.8;
        concentration = Math.max(0.1, Math.min(8.0, concentration));
        return Math.round(concentration * 100) / 100;
    }
    public createRecipeFertilizer(fertilizer: any, concentration: number, targets: any, volumeLiters: number): RecipeFertilizer {
        const costPortion = (concentration * volumeLiters * (fertilizer.pricePerUnit || 0)) / 1000;
        return {
            fertilizerId: fertilizer.id,
            fertilizer: fertilizer,
            concentration: concentration,
            percentageOfN: this.calculateNutrientPercentage(fertilizer, concentration, 'nitrogen', targets.nitrogen),
            percentageOfP: this.calculateNutrientPercentage(fertilizer, concentration, 'phosphorus', targets.phosphorus),
            percentageOfK: this.calculateNutrientPercentage(fertilizer, concentration, 'potassium', targets.potassium),
            costPortion: Math.round(costPortion * 100) / 100
        };
    }
    public calculateNutrientPercentage(fertilizer: any, concentration: number, nutrient: string, target: number): number {
        if (!fertilizer.composition || target === 0) return 0;
        const nutrientContent = fertilizer.composition[nutrient] || 0;
        const provided = (nutrientContent * concentration) / 10;
        return Math.min(100, Math.round((provided / target) * 100));
    }
    public updateRemainingTargets(remaining: any, fertilizer: any, concentration: number): void {
        if (!fertilizer.composition) return;
        const comp = fertilizer.composition;
        const factor = concentration / 10;
        remaining.nitrogen = Math.max(0, remaining.nitrogen - (comp.nitrogen || 0) * factor);
        remaining.phosphorus = Math.max(0, remaining.phosphorus - (comp.phosphorus || 0) * factor);
        remaining.potassium = Math.max(0, remaining.potassium - (comp.potassium || 0) * factor);
        remaining.calcium = Math.max(0, remaining.calcium - (comp.calcium || 0) * factor);
        remaining.magnesium = Math.max(0, remaining.magnesium - (comp.magnesium || 0) * factor);
    }
    public needsAdditionalFertilizer(remaining: any, original: any): boolean {
        const threshold = 0.4;
        const nRemaining = remaining.nitrogen / original.nitrogen;
        const pRemaining = remaining.phosphorus / original.phosphorus;
        const kRemaining = remaining.potassium / original.potassium;
        return nRemaining > threshold || pRemaining > threshold || kRemaining > threshold;
    }
    public isBalancedFertilizer(composition: any): boolean {
        const n = composition.nitrogen || 0;
        const p = composition.phosphorus || 0;
        const k = composition.potassium || 0;
        const nutrientCount = [n, p, k].filter(val => val >= 5).length;
        return nutrientCount >= 2;
    }
    public findBestNutrientSource(fertilizers: any[], nutrient: string, targetValue: number, usedIds: Set<number>): any | null {
        if (targetValue <= 0) {
            return null;
        }
        const candidates = fertilizers.filter(f => {
            const hasComposition = f.composition !== null && f.composition !== undefined;
            const notUsed = !usedIds.has(f.id);
            const hasNutrient = hasComposition && f.composition[nutrient] !== undefined && f.composition[nutrient] !== null;
            const hasMinimumContent = hasNutrient && Number(f.composition[nutrient]) > 0;
            return hasComposition && notUsed && hasNutrient && hasMinimumContent;
        });
        const sorted = candidates.sort((a, b) => {
            const aContent = Number(a.composition[nutrient]) || 0;
            const bContent = Number(b.composition[nutrient]) || 0;
            return bContent - aContent;
        });
        const selected = sorted[0] || null;
        return selected;
    }
    public calculateFertilizerEffectivenessScore(fertilizer: Fertilizer, targets: any): number {
        if (!fertilizer.composition) {
            return 0;
        }
        const comp = fertilizer.composition;
        let score = 0;
        let scoreBreakdown = [];
        if (targets.nitrogen > 0 && comp.nitrogen && Number(comp.nitrogen) > 0) {
            const nScore = Math.min(40, (Number(comp.nitrogen) / 30) * 40);
            score += nScore;
            scoreBreakdown.push(`N: ${nScore.toFixed(1)}`);
        }
        if (targets.phosphorus > 0 && comp.phosphorus && Number(comp.phosphorus) > 0) {
            const pScore = Math.min(25, (Number(comp.phosphorus) / 20) * 25);
            score += pScore;
            scoreBreakdown.push(`P: ${pScore.toFixed(1)}`);
        }
        if (targets.potassium > 0 && comp.potassium && Number(comp.potassium) > 0) {
            const kScore = Math.min(25, (Number(comp.potassium) / 40) * 25);
            score += kScore;
            scoreBreakdown.push(`K: ${kScore.toFixed(1)}`);
        }
        if (targets.calcium > 0 && comp.calcium && Number(comp.calcium) > 0) {
            const caScore = Math.min(5, (Number(comp.calcium) / 20) * 5);
            score += caScore;
            scoreBreakdown.push(`Ca: ${caScore.toFixed(1)}`);
        }
        if (targets.magnesium > 0 && comp.magnesium && Number(comp.magnesium) > 0) {
            const mgScore = Math.min(5, (Number(comp.magnesium) / 10) * 5);
            score += mgScore;
            scoreBreakdown.push(`Mg: ${mgScore.toFixed(1)}`);
        }
        const costFactor = Math.max(0, 10 - (fertilizer.pricePerUnit || 0));
        score += costFactor;
        scoreBreakdown.push(`Cost: ${costFactor.toFixed(1)}`);
        return score;
    }
    public getFertilizerCompositionByName(fertilizerName?: string): FertilizerComposition | null {
        if (!fertilizerName) return null;
        const name = fertilizerName.toLowerCase().trim();
        const compositionMap: { [key: string]: FertilizerComposition } = {
            'acido nitrico': { nitrogen: 15, phosphorus: 0, potassium: 0, micronutrients: undefined },
            'acido nítrico': { nitrogen: 15, phosphorus: 0, potassium: 0, micronutrients: undefined },
            'acido nitrico dac': { nitrogen: 15, phosphorus: 0, potassium: 0, micronutrients: undefined },
            'acido fosfórico': { nitrogen: 0, phosphorus: 54, potassium: 0, micronutrients: undefined },
            'acido fosforico': { nitrogen: 0, phosphorus: 54, potassium: 0, micronutrients: undefined },
            'phosphoric acid': { nitrogen: 0, phosphorus: 54, potassium: 0, micronutrients: undefined },
            'acido sulfurico': { nitrogen: 0, phosphorus: 0, potassium: 0, sulfur: 98, micronutrients: undefined },
            'nitrato de calcio': { nitrogen: 15.5, phosphorus: 0, potassium: 0, calcium: 19, micronutrients: undefined },
            'calcium nitrate': { nitrogen: 15.5, phosphorus: 0, potassium: 0, calcium: 19, micronutrients: undefined },
            'nitrato de calcio amoniacal': { nitrogen: 15.5, phosphorus: 0, potassium: 0, calcium: 19, micronutrients: undefined },
            'nitrato de potasio': { nitrogen: 13, phosphorus: 0, potassium: 44, micronutrients: undefined },
            'potassium nitrate': { nitrogen: 13, phosphorus: 0, potassium: 44, micronutrients: undefined },
            'nitrato de amonio': { nitrogen: 34, phosphorus: 0, potassium: 0, micronutrients: undefined },
            'ammonium nitrate': { nitrogen: 34, phosphorus: 0, potassium: 0, micronutrients: undefined },
            'nitrato de magnesio': { nitrogen: 11, phosphorus: 0, potassium: 0, magnesium: 9, micronutrients: undefined },
            'sulfato de amonio': { nitrogen: 21, phosphorus: 0, potassium: 0, sulfur: 24, micronutrients: undefined },
            'ammonium sulfate': { nitrogen: 21, phosphorus: 0, potassium: 0, sulfur: 24, micronutrients: undefined },
            'sulfato de potasio': { nitrogen: 0, phosphorus: 0, potassium: 50, sulfur: 18, micronutrients: undefined },
            'potassium sulfate': { nitrogen: 0, phosphorus: 0, potassium: 50, sulfur: 18, micronutrients: undefined },
            'sulfato de magnesio': { nitrogen: 0, phosphorus: 0, potassium: 0, magnesium: 10, sulfur: 13, micronutrients: undefined },
            'magnesium sulfate': { nitrogen: 0, phosphorus: 0, potassium: 0, magnesium: 10, sulfur: 13, micronutrients: undefined },
            'fosfato monoamonico': { nitrogen: 12, phosphorus: 61, potassium: 0, micronutrients: undefined },
            'fosfato monoamonico (map)': { nitrogen: 12, phosphorus: 61, potassium: 0, micronutrients: undefined },
            'map': { nitrogen: 12, phosphorus: 61, potassium: 0, micronutrients: undefined },
            'fosfato diamónico': { nitrogen: 18, phosphorus: 46, potassium: 0, micronutrients: undefined },
            'fosfato diamónico (dap)': { nitrogen: 18, phosphorus: 46, potassium: 0, micronutrients: undefined },
            'dap': { nitrogen: 18, phosphorus: 46, potassium: 0, micronutrients: undefined },
            'fosfato monopotásico': { nitrogen: 0, phosphorus: 52, potassium: 34, micronutrients: undefined },
            'fosfato monopotasico': { nitrogen: 0, phosphorus: 52, potassium: 34, micronutrients: undefined },
            'mkp': { nitrogen: 0, phosphorus: 52, potassium: 34, micronutrients: undefined },
            'fosfato bipotásico': { nitrogen: 0, phosphorus: 40, potassium: 53, micronutrients: undefined },
            'fosfato bipotasico': { nitrogen: 0, phosphorus: 40, potassium: 53, micronutrients: undefined },
            'triple superfosfato': { nitrogen: 0, phosphorus: 46, potassium: 0, micronutrients: undefined },
            'cloruro de potasio': { nitrogen: 0, phosphorus: 0, potassium: 60, micronutrients: 'Cl: 47%' },
            'potassium chloride': { nitrogen: 0, phosphorus: 0, potassium: 60, micronutrients: 'Cl: 47%' },
            'cloruro de calcio': { nitrogen: 0, phosphorus: 0, potassium: 0, calcium: 36, micronutrients: 'Cl: 64%' },
            'cloruro de magnesio': { nitrogen: 0, phosphorus: 0, potassium: 0, magnesium: 12, micronutrients: 'Cl: 74%' },
            'urea': { nitrogen: 46, phosphorus: 0, potassium: 0, micronutrients: undefined },
            '20-20-20': { nitrogen: 20, phosphorus: 20, potassium: 20, micronutrients: undefined },
            '15-15-15': { nitrogen: 15, phosphorus: 15, potassium: 15, micronutrients: undefined },
            '10-10-10': { nitrogen: 10, phosphorus: 10, potassium: 10, micronutrients: undefined },

            // Added missing micronutrient and salt fertilizers:
            'cloruro de sodio': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Na: 39%, Cl: 61%' },
            'sulfato de hierro': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Fe: 20%' },
            'cloruro de hierro': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Fe: 24%' },
            'sulfato de cobre (acidif)': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Cu: 25%' },
            'sulfato de manganeso': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Mn: 32%' },
            'sulfato de zinc': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Zn: 35%' },
            'acido bórico': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'B: 17%' },
            'acido borico': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'B: 17%' },
            'solucion al 35% molibdato de sodio': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Mo: 35%' },
            'quelato de hierro': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Fe: 6%' },
            'quelato de cobre': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Cu: 14%' },
            'quelato de manganeso': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Mn: 13%' },
            'quelato de zinc': { nitrogen: 0, phosphorus: 0, potassium: 0, micronutrients: 'Zn: 14%' }
        };
        if (compositionMap[name]) {
            return compositionMap[name];
        }
        for (const [key, composition] of Object.entries(compositionMap)) {
            if (name.includes(key) || key.includes(name)) {
                return composition;
            }
        }
        const npkMatch = name.match(/(\d+)-(\d+)-(\d+)/);
        if (npkMatch) {
            return {
                nitrogen: parseInt(npkMatch[1]),
                phosphorus: parseInt(npkMatch[2]),
                potassium: parseInt(npkMatch[3]),
                micronutrients: undefined
            };
        }
        return null;
    }
    public loadOptimizedFertilizers(): void {
        const cropPhaseIds = [...new Set(this.cropPhases.map(phase => phase.id))];
        if (cropPhaseIds.length === 0) {
            console.error('No crop phases available to load optimized fertilizers');
            this.loadBasicFertilizers();
            return;
        }
        const fertilizerObservables = cropPhaseIds.map(cropPhaseId =>
            this.fertilizerService.getFertilizersWithOptimalComposition(
                cropPhaseId,
                { onlyActive: true }
            ).pipe(
                map((response: any) => {
                    console.log(`Received fertilizers for crop phase ${cropPhaseId}:`, response);
                    // let fertilizers: any[] = [];
                    const fertilizers = response;
                    // if (Array.isArray(response)) {
                    // } else if (response && typeof response === 'object') {
                    //     if (Array.isArray(response.fertilizers)) {
                    //         fertilizers = response.fertilizers;
                    //     } else if (Array.isArray(response.result)) {
                    //         fertilizers = response.result;
                    //     } else if (Array.isArray(response.data)) {
                    //         fertilizers = response.data;
                    //     } else if (Array.isArray(response.items)) {
                    //         fertilizers = response.items;
                    //     } else {
                    //         console.warn(`Unexpected response format for crop phase ${cropPhaseId}:`, response);
                    //         fertilizers = [];
                    //     }
                    // } else {
                    //     console.warn(`Invalid response for crop phase ${cropPhaseId}:`, response);
                    //     fertilizers = [];
                    // }
                    return { cropPhaseId, fertilizers };
                }),
                catchError(error => {
                    console.error(`Error loading fertilizers for crop phase ${cropPhaseId}:`, error);
                    return of({ cropPhaseId, fertilizers: [] });
                })
            )
        );
        forkJoin(fertilizerObservables).subscribe({
            next: (results) => {
                const allFertilizers = new Map<number, any>();
                results.forEach(result => {
                    result.fertilizers.forEach((fertilizer: { id: number; optimizationScore: number; }) => {
                        if (!allFertilizers.has(fertilizer.id)) {
                            allFertilizers.set(fertilizer.id, fertilizer);
                        } else {
                            const existing = allFertilizers.get(fertilizer.id);
                            const existingScore = existing.optimizationScore || 0;
                            const newScore = fertilizer.optimizationScore || 0;
                            if (newScore > existingScore) {
                                allFertilizers.set(fertilizer.id, fertilizer);
                            }
                        }
                    });
                });
                console.log('Consolidated fertilizers from all crop phases:', Array.from(allFertilizers.values()));
                const transformedFertilizers = this.transformFertilizersData({
                    fertilizers: Array.from(allFertilizers.values())
                });
                console.log('Consolidated optimized fertilizers:', transformedFertilizers);
                this.fertilizers = transformedFertilizers;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading optimized fertilizers:', error);
                this.loadBasicFertilizers();
            }
        });
    }
    public loadBasicFertilizers(): void {
        this.fertilizerService.getAll({ onlyActive: true }).subscribe({
            next: (response) => {
                let fertilizers: any[] = [];
                if (Array.isArray(response)) {
                    fertilizers = response;
                } else if (response && typeof (response as any) === 'object' && Array.isArray((response as any).fertilizers)) {
                    fertilizers = (response as any).fertilizers;
                } else if (response && typeof response === 'object' && Array.isArray((response as any).result)) {
                    fertilizers = (response as any).result;
                } else {
                    console.warn('Unexpected basic fertilizers response format:', response);
                    fertilizers = [];
                }
                const allFertilizers = this.transformFertilizersData({ fertilizers });
                console.log('Loaded basic fertilizers:', allFertilizers);
                this.fertilizers = allFertilizers;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading basic fertilizers:', error);
                this.fertilizers = [];
                this.errorMessage = 'Error al cargar fertilizantes';
                this.isLoading = false;
            }
        });
    }
    public transformFertilizersData(fertilizersData: any): Fertilizer[] {
        console.log('Transforming fertilizers data:', fertilizersData);
        if (!Array.isArray(fertilizersData.fertilizers)) {
            console.warn('Fertilizers data is not an array, using empty array');
            return [];
        }
        return fertilizersData.fertilizers.map((f: any) => {
            let composition: FertilizerComposition;
            if (f.composition && typeof f.composition === 'object') {
                composition = {
                    nitrogen: Number(f.composition.nitrogen) || 0,
                    phosphorus: Number(f.composition.phosphorus) || 0,
                    potassium: Number(f.composition.potassium) || 0,
                    calcium: Number(f.composition.calcium) || 0,
                    magnesium: Number(f.composition.magnesium) || 0,
                    sulfur: Number(f.composition.sulfur) || 0
                };
            } else {
                composition = {
                    nitrogen: Number(f.nitrogen) || Number(f.nitrogenPercentage) || 0,
                    phosphorus: Number(f.phosphorus) || Number(f.phosphorusPercentage) || 0,
                    potassium: Number(f.potassium) || Number(f.potassiumPercentage) || 0,
                    calcium: Number(f.calcium) || 0,
                    magnesium: Number(f.magnesium) || 0,
                    sulfur: Number(f.sulfur) || 0
                };
            }
            if (composition.nitrogen === 0 && composition.phosphorus === 0 && composition.potassium === 0) {
                const nameBasedComposition = this.getFertilizerCompositionByName(f.name);
                if (nameBasedComposition) {
                    composition = { ...composition, ...nameBasedComposition };
                } else {
                    console.warn(`No composition found for ${f.name}, using zeros`);
                }
            }
            const transformedFertilizer = {
                id: f.id || 0,
                name: f.name || 'Fertilizante sin nombre',
                brand: f.brand,
                description: f.description,
                type: f.type || 'unknown',
                formulation: f.formulation,
                concentration: f.concentration,
                concentrationUnit: f.concentrationUnit,
                applicationMethod: f.applicationMethod,
                nitrogenPercentage: f.nitrogenPercentage,
                phosphorusPercentage: f.phosphorusPercentage,
                potassiumPercentage: f.potassiumPercentage,
                micronutrients: f.micronutrients,
                currentStock: f.currentStock,
                minimumStock: f.minimumStock,
                stockUnit: f.stockUnit || f.unit || 'kg',
                pricePerUnit: Number(f.pricePerUnit) || Number(f.costPerUnit) || 1,
                supplier: f.supplier,
                expirationDate: f.expirationDate ? new Date(f.expirationDate) : undefined,
                storageInstructions: f.storageInstructions,
                applicationInstructions: f.applicationInstructions,
                isActive: f.isActive ?? true,
                createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
                updatedAt: f.updatedAt ? new Date(f.updatedAt) : undefined,
                composition: composition,
                optimizationScore: f.optimizationScore
            };
            console.log('Transformed fertilizer:', transformedFertilizer);
            return transformedFertilizer;
        });
    }
    public loadSavedRecipes(): void {
        this.nutrientRecipeService.getAll().subscribe({
            next: (recipes) => {
                console.log('📦 Loaded recipes from database:', recipes);
                this.savedRecipes = recipes;
            },
            error: (error) => {
                console.error('❌ Error loading recipes:', error);
            }
        });
    }

    // Convert database recipe format to local format
    private convertDatabaseRecipeToLocal(dbRecipe: NutrientRecipe): any {
        return {
            id: dbRecipe.id,
            name: dbRecipe.name,
            cropId: dbRecipe.cropId,
            cropPhaseId: dbRecipe.cropPhaseId,
            volumeLiters: dbRecipe.volumeLiters,
            targetPh: dbRecipe.targetPh,
            targetEc: dbRecipe.targetEc,
            totalCost: dbRecipe.totalCost || 0,
            fertilizers: dbRecipe.fertilizers?.map(f => ({
                fertilizerId: f.fertilizerId,
                fertilizerName: f.fertilizerName,
                concentration: f.concentrationGramsPerLiter,
                totalGrams: f.totalGrams,
                cost: f.totalCost,
                percentageOfN: f.percentageOfN,
                percentageOfP: f.percentageOfP,
                percentageOfK: f.percentageOfK,
                costPortion: f.costPortion
            })) || [],
            nutrientProfile: {
                nitrogen: dbRecipe.achievedNitrogen || 0,
                phosphorus: dbRecipe.achievedPhosphorus || 0,
                potassium: dbRecipe.achievedPotassium || 0,
                calcium: dbRecipe.achievedCalcium || 0,
                magnesium: dbRecipe.achievedMagnesium || 0
            },
            instructions: dbRecipe.instructions ? JSON.parse(dbRecipe.instructions) : [],
            warnings: dbRecipe.warnings ? JSON.parse(dbRecipe.warnings) : [],
            createdAt: dbRecipe.dateCreated
        };
    }

    public reconstructRecipes(allEntities: any[], summaries: any[]): void {
        this.savedRecipes = [];

        summaries.forEach(summary => {
            try {
                // Extract recipe ID from the main recipe entry
                const recipeId = summary.id;

                // Find related data entities
                const basicData = allEntities.find(e =>
                    e.script === 'RECIPE_BASIC' &&
                    e.name === `RECIPE_DATA_${recipeId}`
                );

                const nutrientData = allEntities.find(e =>
                    e.script === 'RECIPE_NUTRIENTS' &&
                    e.name === `RECIPE_NUTRIENTS_${recipeId}`
                );

                const fertilizerRecords = allEntities.filter(e =>
                    e.script === 'RECIPE_FERTILIZER' &&
                    e.name.startsWith(`RECIPE_FERT_${recipeId}_`)
                );

                // Create base recipe from summary
                let recipe: any = {
                    id: recipeId,
                    name: this.extractRecipeNameFromSummary(summary.description || summary.name),
                    fertilizers: [],
                    createdAt: new Date(summary.dateCreated || Date.now())
                };

                // Add basic data if available
                if (basicData) {
                    try {
                        const parsed = JSON.parse(basicData.description);
                        Object.assign(recipe, parsed);
                    } catch (e) {
                        console.error('Could not parse basic data for recipe', recipeId);
                    }
                }

                // Add nutrient data if available  
                if (nutrientData) {
                    try {
                        const parsed = JSON.parse(nutrientData.description);
                        Object.assign(recipe, parsed);
                    } catch (e) {
                        console.error('Could not parse nutrient data for recipe', recipeId);
                    }
                }

                // Add fertilizer data
                fertilizerRecords.forEach(fertRecord => {
                    const fertilizer = this.parseFertilizerRecord(fertRecord.description);
                    if (fertilizer) {
                        recipe.fertilizers.push(fertilizer);
                    }
                });

                // Set default values for missing fields
                recipe.targetPh = recipe.targetPh || 6.5;
                recipe.targetEc = recipe.targetEc || 1.5;
                recipe.volumeLiters = recipe.volumeLiters || 1000;
                recipe.totalCost = recipe.totalCost || 0;
                recipe.targetCalcium = recipe.targetCalcium || 150;
                recipe.targetMagnesium = recipe.targetMagnesium || 50;
                recipe.targetSulfur = recipe.targetSulfur || 100;
                recipe.targetIron = recipe.targetIron || 3;

                this.savedRecipes.push(recipe);
                console.log('🔥 Reconstructed recipe:', recipe.name, 'with', recipe.fertilizers.length, 'fertilizers');

            } catch (error) {
                console.error('Error reconstructing recipe:', error);
            }
        });

        console.log('🔥 Total reconstructed recipes:', this.savedRecipes.length);
    }

    public extractRecipeNameFromSummary(description: string): string {
        // Handle both description format "Recipe:Name|Cost:X" and direct name
        if (description.includes('Recipe:')) {
            const match = description.match(/Recipe:([^|]+)/);
            return match ? match[1].trim() : 'Receta sin nombre';
        } else if (description.startsWith('RECIPE_')) {
            return description.replace('RECIPE_', '').replace(/_/g, ' ');
        } else {
            return description || 'Receta sin nombre';
        }
    }



    public loadFormData(): void {
        this.isLoading = true;

        forkJoin({
            catalogs: this.loadCatalogs(),
            waterSources: this.loadWaterSources(),
            cropPhases: this.loadCropPhases()
        }).pipe(
            catchError(error => {
                console.error('Error loading form data:', error);
                this.errorMessage = 'Error al cargar los datos del formulario';
                return of({ catalogs: [], waterSources: [], cropPhases: [] });
            })
        ).subscribe({
            next: (data: any) => {
                console.log('Form data loaded:', data);
                this.catalogs = data.catalogs.catalogs;
                this.waterSources = data.waterSources.waterChemistries;
                this.cropPhases = data.cropPhases.cropPhases;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error in loadFormData:', error);
                this.errorMessage = 'Error al cargar los datos del formulario';
                this.isLoading = false;
            }
        });
    }

    formatDate(isoDateString: any) {
        const date = new Date(isoDateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return "Invalid Date"; // Or throw an error, depending on desired behavior
        }

        // Example 1: Human-readable date string (locale-specific)
        // return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Example 2: Custom format (e.g., YYYY-MM-DD)
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;

        // Example 3: Full locale-specific date and time string
        // return date.toLocaleString();
    }

    public loadCatalogs(): Observable<Catalog[]> {
        // Use your existing catalog service or API service
        return this.catalogService?.getAll()
    }

    public loadWaterSources(): Observable<WaterChemistry[]> {
        return this.waterChemistryService.getAll();
    }

    public loadCropPhases(): Observable<CropPhase[]> {
        return this.apiService.get<CropPhase[]>('/CropPhase') || of([
            { id: 1, cropId: 1, catalogId: 1, name: 'Fase de Crecimiento', active: true }
        ]);
    }

    public processResults(): void {
        if (!this.calculationResults) return;

        // Process fertilizer dosages for chart
        const fertilizerDosages = this.calculationResults.calculation_results.fertilizer_dosages;
        this.fertilizerChartData = Object.entries(fertilizerDosages)
            .filter(([name, dosage]) => dosage.dosage_g_per_L > 0)
            .map(([name, dosage]) => ({
                name: name,
                dosage_g_per_L: dosage.dosage_g_per_L,
                dosage_ml_per_L: dosage.dosage_ml_per_L
            }))
            .sort((a, b) => b.dosage_g_per_L - a.dosage_g_per_L);

        // Process achieved vs target concentrations for chart
        const achievedConc = this.calculationResults.calculation_results.achieved_concentrations;
        const verificationResults = this.calculationResults.calculation_results.verification_results;

        this.nutrientChartData = verificationResults.map(result => ({
            parameter: result.parameter,
            target: result.target_value,
            actual: result.actual_value,
            deviation: this.calculateDeviation(result.actual_value.toString(), result.target_value.toString()), // MODIFIED
            status: result.status
        }));

        // Process cost breakdown for chart
        const costBreakdown = this.calculationResults.cost_analysis.fertilizer_costs;
        this.costChartData = Object.entries(costBreakdown)
            .filter(([name, cost]) => cost > 0)
            .map(([name, cost]) => ({
                name: name,
                cost: cost,
                percentage: this.calculationResults!.cost_analysis.cost_percentages[name] || 0
            }))
            .sort((a, b) => b.cost - a.cost);

        // NEW: Process enhanced fertilizer usage data
        this.processFertilizerUsageData();

        // NEW: Process enhanced cost analysis
        this.processEnhancedCostAnalysis();
        console.log("finished processEnhancedCostAnalysis")

        // NEW: Process water analysis display
        this.processWaterAnalysis();
        console.log("finished processWaterAnalysis")

        // NEW: Process performance metrics (rounded to 2 decimals)
        this.processPerformanceMetrics();
        console.log("finished processPerformanceMetrics")

        // NEW: Process optimization summary (rounded to 2 decimals)
        this.processOptimizationSummary();
        console.log("finished processOptimizationSummary")

        this.renderFertilizerCharts();
        console.log("finished renderFertilizerCharts")
    }


    /**
     * Process fertilizer usage data from api_fertilizers_raw
     */
    private processFertilizerUsageData(): void {
        if (!this.calculationResults?.calculation_data_used?.api_fertilizers_raw) {
            this.fertilizerUsageData = [];
            return;
        }

        const rawFertilizers = this.calculationResults.calculation_data_used.api_fertilizers_raw;
        const dosages = this.calculationResults.calculation_results.fertilizer_dosages;
        const costs = this.calculationResults.cost_analysis.fertilizer_costs;
        const costPercentages = this.calculationResults.cost_analysis.cost_percentages;
        const volumeLiters = this.calculationResults.calculation_data_used.volume_liters || 1000;
        this.fertilizerUsageData = Object.entries(dosages)
            .filter(([name, dosage]) => dosage.dosage_g_per_L > 0)
            .map(([name, dosage]) => {
                const rawFert = rawFertilizers.find((f: any) => f.name === name);
                const cost = costs[name] || 0;
                const costPercentage = costPercentages[name] || 0;

                // Calculate nutrient contribution
                const nutrientContribution = this.calculateNutrientContribution(
                    rawFert,
                    dosage.dosage_g_per_L,
                    volumeLiters
                );

                return {
                    name,
                    dosage_g_per_L: dosage.dosage_g_per_L,
                    dosage_ml_per_L: dosage.dosage_ml_per_L,
                    cost_crc: cost,
                    cost_percentage: costPercentage,
                    nutrient_contribution: nutrientContribution,
                    raw_fertilizer: rawFert
                };
            })
            .sort((a, b) => b.cost_crc - a.cost_crc);

        console.log("this.fertilizerUsageData: ", this.fertilizerUsageData);
    }
    private getRandomValue(): number {
        return parseFloat((Math.random() * 24 + 1).toFixed(2));
    }

    /**
     * Process enhanced cost analysis
     */
    private processEnhancedCostAnalysis(): void {
        if (!this.calculationResults?.cost_analysis) {
            this.enhancedCostAnalysis = null;
            return;
        }

        const costAnalysis = this.calculationResults.cost_analysis;

        this.enhancedCostAnalysis = {
            total_cost_crc: costAnalysis.total_cost_crc,
            cost_per_liter_concentrated: costAnalysis.cost_per_liter_crc,
            cost_per_liter_diluted: costAnalysis.cost_per_liter_crc,
            cost_per_m3_diluted: costAnalysis.cost_per_m3_crc,
            cost_per_fertilizer: costAnalysis.fertilizer_costs,
            api_price_coverage_percent: costAnalysis.api_price_coverage_percent
        };
    }

    /**
     * Process water analysis for display
     */
    private processWaterAnalysis(): void {
        if (!this.calculationResults?.calculation_data_used?.water_analysis) {
            this.waterAnalysisDisplay = null;
            return;
        }

        const waterAnalysis = this.calculationResults.calculation_data_used.water_analysis;

        this.waterAnalysisDisplay = {
            Ca: waterAnalysis.Ca || 0,
            K: waterAnalysis.K || 0,
            N: waterAnalysis.N || 0,
            P: waterAnalysis.P || 0,
            Mg: waterAnalysis.Mg || 0,
            S: waterAnalysis.S || 0,
            Fe: waterAnalysis.Fe || 0,
            Mn: waterAnalysis.Mn || 0,
            Zn: waterAnalysis.Zn || 0,
            Cu: waterAnalysis.Cu || 0,
            B: waterAnalysis.B || 0,
            Mo: waterAnalysis.Mo || 0
        };
    }

    /**
     * Process performance metrics with rounding to 2 decimals
     */
    private processPerformanceMetrics(): void {
        if (!this.calculationResults?.performance_metrics) {
            this.performanceMetricsDisplay = null;
            return;
        }

        const metrics = this.calculationResults.performance_metrics;

        this.performanceMetricsDisplay = {
            fertilizers_fetched: metrics.fertilizers_fetched,
            fertilizers_processed: metrics.fertilizers_processed,
            fertilizers_matched: metrics.fertilizers_matched,
            active_dosages: metrics.active_dosages,
            micronutrients_auto_added: metrics.micronutrients_auto_added,
            optimization_method: metrics.optimization_method,
            micronutrient_coverage: metrics.micronutrient_coverage,
            safety_status: metrics.safety_status,
            precision_achieved: metrics.precision_achieved
        };
    }

    /**
     * Process optimization summary with rounding to 2 decimals
     */
    private processOptimizationSummary(): void {
        if (!this.calculationResults?.optimization_summary) {
            this.optimizationSummaryDisplay = null;
            return;
        }

        const summary = this.calculationResults.optimization_summary;

        this.optimizationSummaryDisplay = {
            method: summary.method,
            status: summary.status,
            active_fertilizers: summary.active_fertilizers,
            total_dosage_g_per_L: this.roundToDecimals(summary.total_dosage_g_per_L, 2),
            average_deviation_percent: this.roundToDecimals(summary.average_deviation_percent, 2),
            solver_time_seconds: this.roundToDecimals(summary.solver_time_seconds, 2),
            ionic_balance_error: this.roundToDecimals(summary.ionic_balance_error, 2),
            success_rate_percent: this.roundToDecimals(summary.success_rate_percent, 2)
        };
    }

    ngAfterViewInit(): void {
        // This lifecycle hook ensures the view is fully initialized
        // Charts will be rendered here if data is already available
        if (this.fertilizerUsageData.length > 0) {
            this.initializeCharts();
        }
    }


    private destroyCharts(): void {
        if (this.dosageChart) {
            this.dosageChart.destroy();
            this.dosageChart = null;
        }
        if (this.costDistributionChart) {
            this.costDistributionChart.destroy();
            this.costDistributionChart = null;
        }
    }

    // Call this method whenever you need to render/update charts
    // For example, after receiving API data
    private initializeCharts(): void {
        // Destroy existing charts to prevent memory leaks
        this.destroyCharts();

        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.renderDosageChart();
                setTimeout(() => {
                    this.renderCostDistributionChart();
                    this.ngZone.run(() => this.cdr.detectChanges());
                }, 50);
            }, 0);
        });
    }

    /**
 * Render fertilizer usage charts
 */
    private renderFertilizerCharts(): void {
        if (!this.fertilizerUsageData || this.fertilizerUsageData.length === 0) {
            return;
        }

        // Destroy existing charts if they exist
        if (this.dosageChart) {
            this.dosageChart.destroy();
        }
        if (this.costDistributionChart) {
            this.costDistributionChart.destroy();
        }

        // Wait for DOM to be ready
        console.log("Rendering fertilizer charts...");
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.renderDosageChart();
                console.log("Dosage chart rendered.");
                setTimeout(() => {
                    this.renderCostDistributionChart();
                    console.log("Cost distribution chart rendered.");
                    this.ngZone.run(() => this.cdr.detectChanges());
                }, 50);
            }, 0);
        });
    }

    /**
     * Render dosage distribution chart
     */
    private renderDosageChart(): void {
        const canvas = document.getElementById('dosageChart') as HTMLCanvasElement;
        if (!canvas) {
            console.warn('Dosage chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const labels = this.fertilizerUsageData.map(f => f.name);
        const dataGPerL = this.fertilizerUsageData.map(f => f.dosage_g_per_L);
        const dataMlPerL = this.fertilizerUsageData.map(f => f.dosage_ml_per_L);

        this.dosageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Dosificación (g/L)',
                        data: dataGPerL,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Dosificación (mL/L)',
                        data: dataMlPerL,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'g/L'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'mL/L'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(3);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Render cost distribution chart
     */
    private renderCostDistributionChart(): void {
        const canvas = document.getElementById('costDistributionChart') as HTMLCanvasElement;
        if (!canvas) {
            console.warn('Cost distribution chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const labels = this.fertilizerUsageData.map(f => f.name);
        const costs = this.fertilizerUsageData.map(f => f.cost_crc);
        const percentages = this.fertilizerUsageData.map(f => f.cost_percentage);

        // Generate colors dynamically
        const colors = this.generateChartColors(labels.length);

        this.costDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Costo (₡)',
                    data: costs,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 2
                }]
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = percentages[context.dataIndex];
                                return `${label}: ₡${value.toFixed(2)} (${percentage.toFixed(1)}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Generate colors for charts
     */
    private generateChartColors(count: number): { background: string[], border: string[] } {
        const baseColors = [
            { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' },
            { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },
            { bg: 'rgba(255, 206, 86, 0.6)', border: 'rgba(255, 206, 86, 1)' },
            { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },
            { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' },
            { bg: 'rgba(255, 159, 64, 0.6)', border: 'rgba(255, 159, 64, 1)' },
            { bg: 'rgba(199, 199, 199, 0.6)', border: 'rgba(199, 199, 199, 1)' },
            { bg: 'rgba(83, 102, 255, 0.6)', border: 'rgba(83, 102, 255, 1)' },
            { bg: 'rgba(255, 102, 196, 0.6)', border: 'rgba(255, 102, 196, 1)' },
            { bg: 'rgba(102, 255, 178, 0.6)', border: 'rgba(102, 255, 178, 1)' }
        ];

        const background: string[] = [];
        const border: string[] = [];

        for (let i = 0; i < count; i++) {
            const color = baseColors[i % baseColors.length];
            background.push(color.bg);
            border.push(color.border);
        }

        return { background, border };
    }

    /**
     * Round number to specified decimals
     */
    private roundToDecimals(value: number, decimals: number): number {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    public markFormGroupTouched(): void {
        Object.keys(this.calculationForm.controls).forEach(key => {
            const control = this.calculationForm.get(key);
            control?.markAsTouched();
        });
    }

    // Helper methods for templates
    getActiveFertilizers(): Array<{ name: string, dosage: FertilizerDosage }> {
        if (!this.calculationResults) return [];

        const dosages = this.calculationResults.calculation_results.fertilizer_dosages;
        return Object.entries(dosages)
            .filter(([name, dosage]) => dosage.dosage_g_per_L > 0)
            .map(([name, dosage]) => ({ name, dosage }));
    }

    getExcellentNutrients(): VerificationResult[] {
        if (!this.calculationResults) return [];
        return this.calculationResults.calculation_results.verification_results
            .filter(result => result.status === 'Excellent');
    }

    getDeviationNutrients(): VerificationResult[] {
        if (!this.calculationResults) return [];
        return this.calculationResults.calculation_results.verification_results
            .filter(result => result.status !== 'Excellent');
    }

    getTotalCostFormatted(): string {
        if (!this.calculationResults) return '0';
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC'
        }).format(this.calculationResults.cost_analysis.total_cost_crc);
    }

    getCostPerLiterFormatted(): string {
        if (!this.calculationResults) return '0';
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC'
        }).format(this.calculationResults.cost_analysis.cost_per_liter_crc);
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC'
        }).format(value);
    }

    formatNumber(value: number, decimals: number = 2): string {
        return value.toFixed(decimals);
    }

    formatPercent(value: number): string {
        return `${(Math.abs(value) * 100).toFixed(4)}%`;
    }

    resetForm(): void {
        this.calculationForm.reset({
            user_id: 1,
            catalog_id: 1,
            phase_id: 1,
            water_id: 1,
            volume_liters: 1000,
            use_ml: true,
            apply_safety_caps: true,
            strict_caps: true
        });
        this.calculationResults = null;
        this.showResults = false;
        this.errorMessage = '';
        this.successMessage = '';
    }

    // Alias for template compatibility
    resetCalculation(): void {
        this.resetForm();
    }

    navigateBack(): void {
        this.router.navigate(['/dashboard']);
    }

    // Export functionality
    exportResults(): void {
        if (!this.calculationResults) return;

        const dataStr = JSON.stringify(this.calculationResults, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `nutrient-calculation-${Date.now()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    printResults(): void {
        window.print();
    }

    // Add these properties to your component
    recipeSearchTerm: string = '';
    recipeSortBy: string = 'name';
    recipeFilter: string = 'all';
    filteredAllRecipes: FormulationRecipe[] = [];
    totalRecipesCount: number = 0;
    selectedRecipesForExport: FormulationRecipe[] = [];



    public initializeModalData(): void {
        this.totalRecipesCount = this.savedRecipes.length;
        this.filteredAllRecipes = [...this.savedRecipes];
        this.recipeSearchTerm = '';
        this.recipeSortBy = 'name';
        this.recipeFilter = 'all';
        this.selectedRecipesForExport = [];
    }

    filterAllRecipes(): void {
        let filtered = [...this.savedRecipes];

        // Apply search filter
        if (this.recipeSearchTerm.trim()) {
            const searchTerm = this.recipeSearchTerm.toLowerCase();
            filtered = filtered.filter(recipe =>
                recipe.name.toLowerCase().includes(searchTerm) ||
                this.getCropName(recipe.cropId).toLowerCase().includes(searchTerm) ||
                (recipe.cropPhaseId && this.getCropPhaseName(recipe.cropPhaseId).toLowerCase().includes(searchTerm))
            );
        }

        // Apply category filter
        if (this.recipeFilter !== 'all') {
            filtered = this.applyCategoryFilter(filtered, this.recipeFilter);
        }

        this.filteredAllRecipes = filtered;
        this.sortAllRecipes();
    }

    public applyCategoryFilter(recipes: FormulationRecipe[], filter: string): FormulationRecipe[] {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (filter) {
            case 'recent':
                return recipes.filter(recipe =>
                    recipe.createdAt && new Date(recipe.createdAt) > oneWeekAgo
                );
            case 'lowcost':
                return recipes.filter(recipe =>
                    (recipe.totalCost / recipe.volumeLiters) < 100
                );
            case 'highcost':
                return recipes.filter(recipe =>
                    (recipe.totalCost / recipe.volumeLiters) >= 150
                );
            default:
                // Check if filter matches a crop name
                const cropName = filter.toLowerCase();
                return recipes.filter(recipe => {
                    const recipeCropName = this.getCropName(recipe.cropId).toLowerCase();
                    return recipeCropName.includes(cropName);
                });
        }
    }

    setRecipeFilter(filter: string): void {
        this.recipeFilter = filter;
        this.filterAllRecipes();
    }

    sortAllRecipes(): void {
        this.filteredAllRecipes.sort((a, b) => {
            switch (this.recipeSortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA; // Most recent first
                case 'cost':
                    const costA = a.totalCost / a.volumeLiters;
                    const costB = b.totalCost / b.volumeLiters;
                    return costA - costB; // Lowest cost first
                case 'crop':
                    const cropA = this.getCropName(a.cropId);
                    const cropB = this.getCropName(b.cropId);
                    return cropA.localeCompare(cropB);
                default:
                    return 0;
            }
        });
    }

    getUniqueCrops(): string[] {
        const cropNames = new Set<string>();
        this.savedRecipes.forEach(recipe => {
            const cropName = this.getCropName(recipe.cropId);
            if (cropName && cropName !== 'Cultivo desconocido') {
                cropNames.add(cropName);
            }
        });
        return Array.from(cropNames).slice(0, 5); // Limit to 5 most common crops
    }

    getRecipeStatus(recipe: FormulationRecipe): string {
        const costPerLiter = recipe.totalCost / recipe.volumeLiters;
        if (costPerLiter < 80) return 'Económico';
        if (costPerLiter > 180) return 'Premium';
        if (recipe.fertilizers && recipe.fertilizers.length <= 3) return 'Óptimo';
        return 'Estándar';
    }

    getRecipeStatusBadge(recipe: FormulationRecipe): string {
        const status = this.getRecipeStatus(recipe);
        switch (status) {
            case 'Económico': return 'bg-success';
            case 'Premium': return 'bg-warning';
            case 'Óptimo': return 'bg-success';
            default: return 'bg-secondary';
        }
    }

    getFertilizerNames(fertilizers: RecipeFertilizer[]): string[] {
        return fertilizers
            .map(rf => rf.fertilizer?.name || 'Fertilizante desconocido')
            .slice(0, 3); // Show only first 3 fertilizers
    }

    loadRecipeFromModal(recipe: FormulationRecipe, event: Event): void {
        event.stopPropagation();
        this.loadRecipe(recipe);
        this.closeModal('allRecipesModal');
    }

    copyRecipe(recipe: FormulationRecipe, event: Event): void {
        event.stopPropagation();

        const copiedRecipe: FormulationRecipe = {
            ...recipe,
            id: undefined, // Remove ID so it gets a new one when saved
            name: `${recipe.name} (Copia)`,
            createdAt: new Date(),
            fertilizers: [...recipe.fertilizers] // Deep copy fertilizers array
        };

        this.currentRecipe = copiedRecipe;
        this.formulationResults = this.generateFormulationResults(copiedRecipe);

        this.successMessage = `Receta "${recipe.name}" duplicada exitosamente`;
        setTimeout(() => this.successMessage = '', 3000);
    }

    exportSingleRecipe(recipe: FormulationRecipe, event: Event): void {
        event.stopPropagation();

        const data = JSON.stringify(recipe, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receta-${recipe.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.successMessage = `Receta "${recipe.name}" exportada exitosamente`;
        setTimeout(() => this.successMessage = '', 3000);
    }
    exportSelectedRecipes(): void {
        if (this.selectedRecipesForExport.length === 0) {
            this.errorMessage = 'No hay recetas seleccionadas para exportar';
            return;
        }

        const data = JSON.stringify(this.selectedRecipesForExport, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recetas-seleccionadas-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.successMessage = `${this.selectedRecipesForExport.length} recetas exportadas exitosamente`;
        setTimeout(() => this.successMessage = '', 3000);
    }

    openAllRecipesModal(): void {
        this.initializeModalData();
        this.filterAllRecipes();

        setTimeout(() => {
            const modalElement = document.getElementById('savedRecipesModal');
            if (modalElement) {
                const modal = new (window as any).bootstrap.Modal(modalElement);
                modal.show();

                // Remove backdrop after modal is shown
                modalElement.addEventListener('shown.bs.modal', () => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                }, { once: true });
            }
        }, 50);
    }

    // Improved closeModal method
    public closeModal(modalId: string): void {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // Fallback: manually hide the modal
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');

                // Remove backdrop
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }

                // Restore body scroll
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }
        }
    }
 


    /**
     * Calculate simple formulation using ONLY real database data
     * Requires actual CropPhaseSolutionRequirement and Fertilizer data
     */
    calculateSimpleFormulation(): void {
        // if (this.formulationForm.invalid) {
        //     const invalidFields = Object.keys(this.formulationForm.controls).filter(key => this.formulationForm.get(key)?.invalid);
        //     console.error('Formulario inválido, campos faltantes o incorrectos:', invalidFields);
        //     this.errorMessage = 'Por favor complete todos los campos requeridos';
        //     return;
        // }

        this.isCalculatingSimple = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.simpleFormulationResult = null;

        const formValue = this.formulationForm.value;

        // Get REAL crop phase requirements from database
        const realRequirements = this.getRealCropPhaseRequirements(formValue.cropPhaseId);
        if (!realRequirements) {
            this.errorMessage = 'No se encontraron requerimientos nutricionales reales en la base de datos para esta fase del cultivo';
            this.isCalculatingSimple = false;
            return;
        }

        // Get REAL fertilizers with compositions from database
        const realFertilizers = this.getRealFertilizersWithCompositions();
        if (realFertilizers.length === 0) {
            this.errorMessage = 'No hay fertilizantes con composiciones reales disponibles en la base de datos';
            this.isCalculatingSimple = false;
            return;
        }

        // Create request with real data
        const request = {
            cropId: formValue.cropId,
            cropPhaseId: formValue.cropPhaseId,
            volumeLiters: formValue.volumeLiters,
            waterSourceId: formValue.waterSourceId,
            targetPh: formValue.targetPh,
            targetEc: formValue.targetEc
        };

        // Calculate using ONLY real data
        this.realDataFormulationService.calculateSimpleFormulation(
            request,
            realRequirements,
            realFertilizers
        ).subscribe({
            next: (result) => {
                this.simpleFormulationResult = result;
                // ✅ NUEVO: Generar resultados mejorados
                const recipe = this.convertSimpleResultToRecipe(result);
                console.log('Recipe generated from simple result:', recipe);
                const waterSource = this.waterSources.find(w => w.id === formValue.waterSourceId);
                if (waterSource) {
                    this.enhancedFormulationResults = this.generateEnhancedFormulationResults(recipe, waterSource);
                    console.log('Enhanced results generated:', this.enhancedFormulationResults);
                }

                this.currentRecipe = this.convertSimpleResultToRecipe(result);
                this.successMessage = 'Formulación calculada exitosamente';
                this.isCalculatingSimple = false;
            },
            error: (error) => {
                console.error('Error calculating simple formulation:', error);
                this.errorMessage = error.message || 'Error al calcular la formulación';
                this.isCalculatingSimple = false;
            }
        });
    }

    /**
     * Get REAL crop phase requirements from database ONLY
     * Returns null if no real data exists - NO FALLBACKS
     */
    public getRealCropPhaseRequirements(cropPhaseId: number | string): any | null {
        if (!cropPhaseId || (!this.cropPhaseSolutionRequirements || this.cropPhaseSolutionRequirements.length === 0)) {
            return null;
        }

        // Convert to number if string
        const phaseId = typeof cropPhaseId === 'string' ? parseInt(cropPhaseId, 10) : cropPhaseId;

        if (isNaN(phaseId)) {
            console.warn('Invalid cropPhaseId provided:', cropPhaseId);
            return null;
        }

        // Try multiple possible matching strategies since the data structure might vary
        let realRequirement = this.cropPhaseSolutionRequirements.find(r =>
            r.cropPhaseId === phaseId || r.phaseId === phaseId || r.id === phaseId
        );

        if (!realRequirement) {
            return null;
        }


        // Validate that the requirement has actual nutrient data
        // Check both lowercase and uppercase property names
        const hasRealNutrients = (realRequirement.no3 && realRequirement.no3 > 0) ||
            (realRequirement.nO3 && realRequirement.nO3 > 0) ||
            (realRequirement.nh4 && realRequirement.nh4 > 0) ||
            (realRequirement.nH4 && realRequirement.nH4 > 0) ||
            (realRequirement.h2po4 && realRequirement.h2po4 > 0) ||
            (realRequirement.h2PO4 && realRequirement.h2PO4 > 0) ||
            (realRequirement.k && realRequirement.k > 0);

        if (!hasRealNutrients) {
            console.warn(`Requirements found but no real nutrient data for cropPhaseId: ${phaseId}`, realRequirement);
            return null;
        }

        // Normalize the property names to match what your code expects
        const normalizedRequirement = {
            ...realRequirement,
            no3: realRequirement.no3 || realRequirement.nO3 || 0,
            nh4: realRequirement.nh4 || realRequirement.nH4 || 0,
            h2po4: realRequirement.h2po4 || realRequirement.h2PO4 || 0,
            k: realRequirement.k || 0,
            ca: realRequirement.ca || 0,
            mg: realRequirement.mg || 0,
            so4: realRequirement.so4 || realRequirement.sO4 || 0,
            fe: realRequirement.fe || 0,
            ph: realRequirement.ph || realRequirement.pH || null,
            ec: realRequirement.ec || null
        };

        // console.log('Normalized requirement:', normalizedRequirement);
        return normalizedRequirement;
    }

    /**
     * Helper method for template - more reliable than calling getRealCropPhaseRequirements directly
     */
    public hasRealRequirementsForPhase(cropPhaseId: number | string): boolean {
        return this.getRealCropPhaseRequirements(cropPhaseId) !== null;
    }

    /**
     * Get display data for a crop phase requirement
     */
    public getRequirementDisplayData(cropPhaseId: number | string): any | null {
        const req = this.getRealCropPhaseRequirements(cropPhaseId);
        if (!req) return null;

        return {
            nitrogen: (req.no3 || 0) + (req.nh4 || 0),
            phosphorus: req.h2po4 || 0,
            potassium: req.k || 0,
            calcium: req.ca || 0,
            magnesium: req.mg || 0,
            sulfur: req.so4 || 0,
            iron: req.fe || 0,
            ph: req.ph || 'N/A',
            ec: req.ec || 'N/A'
        };
    }

    /**
     * Check if fertilizer has REAL composition data from database
     */
    public hasRealCompositionData(fertilizer: any): boolean {
        // Check composition object from database
        if (fertilizer.composition) {
            const comp = fertilizer.composition;
            if ((comp.nitrogen && comp.nitrogen > 0) ||
                (comp.phosphorus && comp.phosphorus > 0) ||
                (comp.potassium && comp.potassium > 0)) {
                return true;
            }
        }

        // Check percentage fields from database
        if ((fertilizer.nitrogenPercentage && fertilizer.nitrogenPercentage > 0) ||
            (fertilizer.phosphorusPercentage && fertilizer.phosphorusPercentage > 0) ||
            (fertilizer.potassiumPercentage && fertilizer.potassiumPercentage > 0)) {
            return true;
        }

        return false;
    }

    /**
     * Load real crop phase requirements from API
     * This should be called during component initialization
     */
    public loadRealCropPhaseRequirements(): void {
        // Use your existing API service to load requirements
        this.apiService.get<any>('/CropPhaseSolutionRequirement').subscribe({
            next: (response) => {
                console.log('CropPhaseSolutionRequirement API response:', response);
                this.cropPhaseSolutionRequirements = response.cropPhaseRequirements
                console.log(`Loaded ${this.cropPhaseSolutionRequirements.length} real crop phase requirements`);
            },
            error: (error) => {
                console.error('Error loading real crop phase requirements:', error);
                this.cropPhaseSolutionRequirements = [];
            }
        });
    }

    /**
     * Validate that all required real data is available before showing Simple Formulation
     */
    isSimpleFormulationAvailable(): boolean {
        const hasRealRequirements = this.cropPhaseSolutionRequirements && this.cropPhaseSolutionRequirements.length > 0;
        const hasRealFertilizers = this.getRealFertilizersWithCompositions().length > 0;

        return hasRealRequirements && hasRealFertilizers;
    }

    /**
     * Get validation message for missing real data
     */
    getSimpleFormulationValidationMessage(): string {
        const hasRealRequirements = this.cropPhaseSolutionRequirements && this.cropPhaseSolutionRequirements.length > 0;
        const hasRealFertilizers = this.getRealFertilizersWithCompositions().length > 0;

        if (!hasRealRequirements && !hasRealFertilizers) {
            return 'Se requieren requerimientos nutricionales y fertilizantes con composiciones en la base de datos';
        } else if (!hasRealRequirements) {
            return 'Se requieren requerimientos nutricionales reales en la tabla CropPhaseSolutionRequirement';
        } else if (!hasRealFertilizers) {
            return 'Se requieren fertilizantes con composiciones reales en la base de datos';
        }

        return '';
    }


    /**
     * Convert simple result to recipe format (same as before)
     */
    public convertSimpleResultToRecipe(result: SimpleFormulationResult): any {
        return {
            name: result.recipeName,
            cropId: result.cropId,
            cropPhaseId: result.cropPhaseId,
            waterSourceId: 0,
            volumeLiters: result.volumeLiters,
            targetPh: result.targetPh,
            targetEc: result.targetEc,
            fertilizers: result.fertilizers.map(f => ({
                fertilizerId: f.fertilizerId,
                fertilizerName: f.fertilizerName,
                concentration: f.concentration,
                cost: f.cost,
                quantity: f.totalGrams,
                percentageOfN: 0,
                percentageOfP: 0,
                percentageOfK: 0,
                costPortion: f.cost || 0
            })),
            totalCost: result.totalCost,
            nutrientProfile: {
                nitrogen: result.nutrientBalance.nitrogen.achieved,
                phosphorus: result.nutrientBalance.phosphorus.achieved,
                potassium: result.nutrientBalance.potassium.achieved,
                calcium: result.nutrientBalance.calcium?.achieved || 0,
                magnesium: result.nutrientBalance.magnesium?.achieved || 0
            },
            instructions: result.instructions,
            warnings: result.warnings,
            createdAt: new Date()
        };
    }

    /**
     * Main calculate method - updated to route to correct calculation
     */
    calculateFormulation(): void {
        if (this.isSimpleFormulationActive()) {
            this.calculateSimpleFormulation();
        } else {
            // Keep existing advanced calculation logic
            this.calculateAdvancedFormulation();
            console.log("finished advanced calculation")
        }
    }

    // Alias for template compatibility
    calculate(): void {
        this.calculateFormulation();
        console.log("calculation triggered")
    }

    /**
     * Check if we should use simple calculation (when in Simple Formulation tab)
     */
    isSimpleFormulationActive(): boolean {
        const activeTab = document.querySelector('#simple-tab');
        return activeTab?.classList.contains('active') || false;
    }

    /**
     * Existing advanced calculation (renamed for clarity)
     */
    public calculateAdvancedFormulation(): void {
        if (this.calculationForm.invalid) {
            const invalidFields = Object.keys(this.calculationForm.controls)
                .filter(key => this.calculationForm.get(key)?.invalid);
            console.warn('Advanced form invalid:', invalidFields);
            this.errorMessage = 'Por favor complete todos los campos requeridos';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const formValue = this.calculationForm.value;
        const cropPhaseId = formValue.cropPhaseId;

        // Get requirements for selected crop phase
        const requirements = this.getRealCropPhaseRequirements(cropPhaseId);

        if (!requirements) {
            this.errorMessage = 'No se encontraron requerimientos nutricionales';
            this.isLoading = false;
            return;
        }

        // Map to API format (maintains backward compatibility)
        const requestBody = {
            user_id: formValue.user_id || 1,
            catalog_id: formValue.catalogId, // Map cropId to catalog_id
            phase_id: cropPhaseId,
            water_id: formValue.waterPhaseId,
            volume_liters: formValue.volume_liters,
            use_ml: formValue.use_ml || false,
            apply_safety_caps: formValue.apply_safety_caps !== false,
            strict_caps: formValue.strict_caps || false,
            requirements: {
                EC: requirements.ec || 2.0,
                HCO3: requirements.hco3 || 0,
                NO3: requirements.no3 || 0,
                H2PO4: requirements.h2po4 || 0,
                SO4: requirements.so4 || 0,
                Cl: requirements.cl || 0,
                NH4: requirements.nh4 || 0,
                K: requirements.k || 0,
                Ca: requirements.ca || 0,
                Mg: requirements.mg || 0,
                Na: requirements.na || 0,
                Fe: requirements.fe || 0,
                Mn: requirements.mn || 0,
                Zn: requirements.zn || 0,
                Cu: requirements.cu || 0,
                B: requirements.b || 0,
                Mo: requirements.mo || 0
            }
        };

        console.log('Advanced Calculator Request:', requestBody);

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.showResults = false;

        const formData = this.calculationForm.value;
        console.log('Form Data:', formData);
        console.log('Current User:', this.authService.getCurrentUser());
        formData.user_id = this.authService.getCurrentUserId() || 6;

        // Build the API URL with query parameters
        const apiUrl = environment.calculatorApi + '/swagger-integrated-calculation';

        let params = new HttpParams()
            .set('user_id', formData.user_id.toString())
            .set('catalog_id', formData.catalogId.toString())
            .set('phase_id', formData.cropPhaseId.toString())
            .set('water_id', formData.waterSourceId.toString())
            .set('volume_liters', formData.volume_liters.toString())
            .set('use_ml', formData.use_ml.toString())
            .set('apply_safety_caps', formData.apply_safety_caps.toString())
            .set('strict_caps', formData.strict_caps.toString());

        console.log('calling API URL: ', apiUrl + '?' + params.toString());

        this.http.get<CalculationResponse>(apiUrl, { params }).pipe(
            tap(response => {
                console.log('API Response:', response);
            }),
            catchError(error => {
                console.error('API Error:', error);
                this.errorMessage = `Error en la calculadora de nutrientes: ${error.message || 'Error desconocido'}`;
                return of(null);
            })
        ).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                if (response) {
                    console.log('Calculation successful:', response);
                    const verification_results = this.buildVerificationResults(response);
                    this.calculationResults = {
                        ...response,
                        calculation_results: {
                            ...response.calculation_results,
                            verification_results: verification_results
                        }
                    };
                    this.currentRecipe = this.convertAdvancedResultToRecipe(response);
                    // Después de recibir calculationResults
                    console.log("currentRecipe", this.currentRecipe)
                    if (this.calculationResults && this.currentRecipe) {
                        console.log("this.calculationResults && this.currentRecipe", this.calculationResults, this.currentRecipe)
                        const waterSource = this.waterSources.find(w => w?.id?.toString() === this.currentRecipe.waterSourceId.toString());
                        if (waterSource) {
                            console.log("waterSource", waterSource)
                            this.enhancedFormulationResults = this.generateEnhancedFormulationResults(
                                this.currentRecipe,
                                waterSource
                            );
                        }
                    }
                    this.processResults();

                    // 🆕 Capture diagnostics
                    if (response.nutrient_diagnostics) {
                        this.nutrientDiagnostics = response.nutrient_diagnostics;
                        console.log('📊 Diagnostics:', this.nutrientDiagnostics);
                    }
                    setTimeout(() => this.initializeTooltips(), 100);

                    this.showResults = true;
                    this.successMessage = 'Cálculo completado exitosamente';
                    console.log(this.successMessage)
                }
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Subscription Error:', error);
                this.errorMessage = `Error inesperado: ${error.message}`;
            }
        });
    }

    public convertAdvancedResultToRecipe(response: CalculationResponse): FormulationRecipe {
        // Extract form values
        const formValue = this.calculationForm.value;

        // Get crop and phase names
        const selectedCrop = this.crops.find(c => c.id === formValue.cropId);
        const selectedPhase = this.cropPhases.find(p => p.id === formValue.cropPhaseId);

        // Extract target concentrations from calculation_data_used
        const targets = response.calculation_data_used?.target_concentrations || {};

        // Extract achieved concentrations from calculation_results
        const achieved = response.calculation_results?.achieved_concentrations || {};

        // Build fertilizers array from active fertilizers
        const fertilizers: RecipeFertilizer[] = [];

        if (response.calculation_results?.fertilizer_dosages) {
            Object.entries(response.calculation_results.fertilizer_dosages).forEach(([name, dosage]) => {
                if (dosage.dosage_g_per_L > 0) {
                    // Find the fertilizer in the raw data
                    const rawFert = response.calculation_data_used?.api_fertilizers_raw?.find(
                        (f: any) => f.name === name
                    );

                    // Find the fertilizer in the component's fertilizers array
                    const fertilizer = this.fertilizers.find(f => f.name === name);

                    if (fertilizer) {
                        // Calculate cost for this fertilizer
                        const fertilizerCost = response.cost_analysis?.fertilizer_costs?.[name] || 0;
                        const costPercentage = response.cost_analysis?.cost_percentages?.[name] || 0;

                        fertilizers.push({
                            fertilizerId: fertilizer.id,
                            fertilizer: fertilizer,
                            concentration: dosage.dosage_g_per_L,
                            percentageOfN: this.calculateNutrientPercentage2(rawFert, 'N', response, name),
                            percentageOfP: this.calculateNutrientPercentage2(rawFert, 'P', response, name),
                            percentageOfK: this.calculateNutrientPercentage2(rawFert, 'K', response, name),
                            costPortion: fertilizerCost,
                            fertilizerName: name,
                            concentrationGramsPerLiter: dosage.dosage_g_per_L,
                            totalGrams: dosage.dosage_g_per_L * (formValue.volumeLiters || 1000),
                            totalCost: fertilizerCost
                        });
                    }
                }
            });
        }

        // Create the recipe object
        const recipe: FormulationRecipe = {
            name: `Receta Avanzada - ${selectedCrop?.name || 'Cultivo'} - ${selectedPhase?.name || 'Fase'}`,
            description: `Calculada con ${response.optimization_method} el ${new Date().toLocaleDateString()}`,
            waterSourceId: formValue.waterSourceId || 0,
            cropId: formValue.cropId,
            cropPhaseId: formValue.cropPhaseId,
            cropName: selectedCrop?.name,
            cropPhaseName: selectedPhase?.name,
            volumeLiters: formValue.volumeLiters || 1000,

            // pH and EC targets
            targetPh: formValue.targetPh || 6.5,
            targetEc: formValue.targetEc || 1.5,

            // Primary nutrients - from target_concentrations or form values
            targetNitrogen: targets.N || formValue.targetNitrogen || 200,
            targetPhosphorus: targets.P || formValue.targetPhosphorus || 50,
            targetPotassium: targets.K || formValue.targetPotassium || 250,

            // Secondary nutrients - from target_concentrations or defaults
            targetCalcium: targets.Ca || formValue.targetCalcium || 150,
            targetMagnesium: targets.Mg || formValue.targetMagnesium || 50,
            targetSulfur: targets.S || formValue.targetSulfur || 100,
            targetIron: targets.Fe || formValue.targetIron || 3,

            // Fertilizers array
            fertilizers: fertilizers,

            // Cost information
            totalCost: response.cost_analysis?.total_cost_crc || 0,
            costPerLiter: response.cost_analysis?.cost_per_liter_crc || 0,

            // Nutrient profile - achieved values
            nutrientProfile: {
                nitrogen: achieved['N'] || 0,
                phosphorus: achieved['P'] || 0,
                potassium: achieved['K'] || 0,
                calcium: achieved['Ca'] || 0,
                magnesium: achieved['Mg'] || 0
            },

            // Instructions (optional)
            instructions: this.generateInstructionsFromAdvanced(response),

            // Warnings (optional)
            warnings: response.calculation_results?.calculation_status?.warnings || [],

            // Recipe metadata
            recipeType: 'Advanced',
            dateCreated: new Date()
        };

        return recipe;
    }


    /**
     * Helper method to calculate nutrient percentage contribution
     */
    private calculateNutrientPercentage2(
        rawFert: any,
        nutrient: string,
        response: CalculationResponse,
        fertilizerName: string
    ): number {
        if (!rawFert || !response.calculation_results) return 0;

        const dosage = response.calculation_results.fertilizer_dosages[fertilizerName];
        if (!dosage) return 0;

        const volumeLiters = response.calculation_data_used?.volume_liters || 1000;
        const nutrientContribution = this.calculateNutrientContribution(
            rawFert,
            dosage.dosage_g_per_L,
            volumeLiters
        );

        const totalNutrient = response.calculation_results.achieved_concentrations[nutrient] || 1;

        if (totalNutrient === 0) return 0;

        return (nutrientContribution[nutrient] / totalNutrient) * 100;
    }


    /**
     * Generate instructions from advanced calculation response
     */
    private generateInstructionsFromAdvanced(response: CalculationResponse): string[] {
        const instructions: string[] = [];
        const volumeLiters = response.calculation_data_used?.volume_liters || 1000;

        instructions.push(`Preparación para ${volumeLiters}L de solución nutritiva:`);
        instructions.push('');
        instructions.push('Orden de mezcla recomendado:');

        if (response.calculation_results?.fertilizer_dosages) {
            let order = 1;
            Object.entries(response.calculation_results.fertilizer_dosages)
                .filter(([_, dosage]) => dosage.dosage_g_per_L > 0)
                .forEach(([name, dosage]) => {
                    const totalGrams = dosage.dosage_g_per_L * volumeLiters;
                    instructions.push(
                        `${order}. Agregar ${totalGrams.toFixed(2)}g de ${name} (${dosage.dosage_g_per_L.toFixed(3)} g/L)`
                    );
                    order++;
                });
        }

        instructions.push('');
        instructions.push('Notas importantes:');
        instructions.push('- Disolver cada fertilizante completamente antes de agregar el siguiente');
        instructions.push('- Ajustar pH después de disolver todos los fertilizantes');
        instructions.push(`- Verificar que la EC final esté cerca de ${response.calculation_data_used?.target_concentrations?.EC || 1.5} dS/m`);

        // Add optimization method info
        if (response.optimization_method) {
            instructions.push(`- Formulación optimizada con: ${response.optimization_method}`);
        }

        return instructions;
    }


    /**
     * Reset simple formulation results
     */
    resetSimpleFormulation(): void {
        this.simpleFormulationResult = null;
        this.currentRecipe = null;
        this.errorMessage = '';
        this.successMessage = '';
    }

    /**
     * Display methods for UI
     */
    getSimpleFormulationSummary(): string {
        if (!this.simpleFormulationResult) return '';

        const result = this.simpleFormulationResult;
        const balance = result.nutrientBalance;

        return `N: ${balance.nitrogen.achieved.toFixed(0)}ppm (${(balance.nitrogen.ratio * 100).toFixed(0)}%) | ` +
            `P: ${balance.phosphorus.achieved.toFixed(0)}ppm (${(balance.phosphorus.ratio * 100).toFixed(0)}%) | ` +
            `K: ${balance.potassium.achieved.toFixed(0)}ppm (${(balance.potassium.ratio * 100).toFixed(0)}%)`;
    }

    getSimpleFertilizerCount(): number {
        return this.simpleFormulationResult?.fertilizers.length || 0;
    }

    hasSimpleWarnings(): boolean {
        return (this.simpleFormulationResult?.warnings.length || 0) > 0;
    }

    getNutrientBalanceColor(nutrient: 'nitrogen' | 'phosphorus' | 'potassium'): string {
        if (!this.simpleFormulationResult) return 'text-muted';

        const ratio = this.simpleFormulationResult.nutrientBalance[nutrient].ratio;

        if (ratio < 0.85) return 'text-warning';
        if (ratio > 1.15) return 'text-danger';
        return 'text-success';
    }

    /**
     * Export and save methods
     */
    exportSimpleFormulation(): void {
        if (!this.simpleFormulationResult) return;

        const result = this.simpleFormulationResult;
        const exportData = {
            recipe: result.recipeName,
            crop: this.getCropName(result.cropId),
            phase: this.getCropPhaseName(result.cropPhaseId),
            volume: `${result.volumeLiters}L`,
            targetPh: result.targetPh,
            targetEc: result.targetEc,
            fertilizers: result.fertilizers.map(f => ({
                name: f.fertilizerName,
                concentration: `${f.concentration.toFixed(2)}g/L`,
                total: `${f.totalGrams.toFixed(1)}g`,
                cost: `₡${f.cost.toFixed(2)}`
            })),
            totalCost: `₡${result.totalCost.toFixed(2)}`,
            nutrients: {
                nitrogen: `${result.nutrientBalance.nitrogen.achieved.toFixed(0)}ppm`,
                phosphorus: `${result.nutrientBalance.phosphorus.achieved.toFixed(0)}ppm`,
                potassium: `${result.nutrientBalance.potassium.achieved.toFixed(0)}ppm`
            },
            instructions: result.instructions,
            warnings: result.warnings,
            generatedAt: new Date().toLocaleString(),
            dataSource: 'Real database data - no fallbacks used'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `formulacion-simple-real-${result.recipeName.replace(/\s+/g, '-')}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.successMessage = 'Formulación exportada exitosamente';
    }

    saveSimpleFormulation(): void {
        if (!this.simpleFormulationResult) return;

        const recipe = this.convertSimpleResultToRecipe(this.simpleFormulationResult);

        this.savedRecipes.unshift(recipe);

        if (this.savedRecipes.length > 50) {
            this.savedRecipes = this.savedRecipes.slice(0, 50);
        }

        try {
            localStorage.setItem('saved-recipes', JSON.stringify(this.savedRecipes));
            this.successMessage = 'Receta guardada exitosamente';
        } catch (error) {
            console.error('Error saving recipe:', error);
            this.errorMessage = 'Error al guardar la receta';
        }
    }

    loadSimpleRecipe(recipe: FormulationRecipe): void {
        this.formulationForm.patchValue({
            recipeName: recipe.name,
            cropId: recipe.cropId,
            cropPhaseId: recipe.cropPhaseId,
            waterSourceId: recipe.waterSourceId,
            volumeLiters: recipe.volumeLiters,
            targetPh: recipe.targetPh,
            targetEc: recipe.targetEc
        });

        this.currentRecipe = recipe;
        this.simpleFormulationResult = this.convertRecipeToSimpleResult(recipe);
        this.successMessage = 'Receta cargada exitosamente';
    }

    public convertRecipeToSimpleResult(recipe: FormulationRecipe): SimpleFormulationResult {
        return {
            recipeName: recipe.name,
            cropId: recipe.cropId,
            cropPhaseId: recipe.cropPhaseId,
            volumeLiters: recipe.volumeLiters,
            targetPh: recipe.targetPh,
            targetEc: recipe.targetEc,
            fertilizers: recipe.fertilizers.map(f => ({
                fertilizerId: f.fertilizerId,
                fertilizerName: f.fertilizer?.name || 'Fertilizante desconocido',
                concentration: f.concentration,
                totalGrams: f.concentration * recipe.volumeLiters,
                cost: f.costPortion || 0,
                nutrientContribution: {
                    nitrogen: 0,
                    phosphorus: 0,
                    potassium: 0
                }
            })),
            totalCost: recipe.totalCost,
            nutrientBalance: {
                nitrogen: { target: 0, achieved: recipe.nutrientProfile?.nitrogen || 0, ratio: 1 },
                phosphorus: { target: 0, achieved: recipe.nutrientProfile?.phosphorus || 0, ratio: 1 },
                potassium: { target: 0, achieved: recipe.nutrientProfile?.potassium || 0, ratio: 1 }
            },
            instructions: recipe.instructions || [],
            warnings: recipe.warnings || []
        };
    }







    /**
 * Debug method - call this in your component after data loads to see what's happening
 */
    public debugCropPhaseRequirements(): void {
        console.log('=== CROP PHASE REQUIREMENTS DEBUG ===');
        console.log('Total requirements loaded:', this.cropPhaseSolutionRequirements?.length || 0);

        if (this.cropPhaseSolutionRequirements && this.cropPhaseSolutionRequirements.length > 0) {
            console.log('All requirements:');
            this.cropPhaseSolutionRequirements.forEach((req, index) => {
                console.log(`${index + 1}. ID: ${req.id}, CropPhaseId: ${req.cropPhaseId}, PhaseId: ${req.phaseId}`);
                console.log(`   Name: ${req.cropPhaseId}`);
                console.log(`   Nutrients: N(NO3): ${req.nO3 || req.no3}, N(NH4): ${req.nH4 || req.nh4}, P: ${req.h2PO4 || req.h2po4}, K: ${req.k}`);
            });
        }

        // console.log('\nCrop Phases:');
        // if (this.cropPhases && this.cropPhases.length > 0) {
        //     this.cropPhases.forEach((phase, index) => {
        //         const hasReq = this.hasRealRequirementsForPhase(phase.id);
        //         console.log(`${index + 1}. ID: ${phase.id}, Name: ${phase.name}, Has Requirements: ${hasReq}`);
        //     });
        // }

        console.log('=== END DEBUG ===');
    }

    /**
     * Call this method when the form value changes to see real-time what's happening
     */
    public debugFormValue(): void {
        const cropPhaseId = this.formulationForm.get('cropPhaseId')?.value;
        console.log(`Current form cropPhaseId: ${cropPhaseId} (type: ${typeof cropPhaseId})`);

        if (cropPhaseId) {
            const hasReq = this.hasRealRequirementsForPhase(cropPhaseId);
            const reqData = this.getRealCropPhaseRequirements(cropPhaseId);
            console.log(`Has requirements: ${hasReq}`);
            console.log('Requirement data:', reqData);
        }
    }

    /**
     * Enhanced method to get real fertilizers with better composition detection
     */
    public getRealFertilizersWithCompositions(): any[] {
        if (!this.fertilizers || this.fertilizers.length === 0) {
            // console.warn('No fertilizers loaded from database');
            return [];
        }

        const realFertilizers = this.fertilizers.filter(fertilizer => {
            // Must be active
            if (!fertilizer.isActive) {
                // console.log(`Fertilizer ${fertilizer.name} - excluded: not active`);
                return false;
            }

            // Must have real composition data from database
            const hasRealComposition = this.hasEnhancedCompositionData(fertilizer);

            if (!hasRealComposition) {
                // console.log(`Fertilizer ${fertilizer.name} - excluded: no real composition data`);
                // console.log('Available fields:', Object.keys(fertilizer));
            } else {
                // console.log(`Fertilizer ${fertilizer.name} - included: has composition data`);
            }

            return hasRealComposition;
        });

        // Log composition details for debugging
        // realFertilizers.forEach(f => {
        //     console.log(`${f.name} composition details:`, {
        //         composition: f.composition,
        //         percentages: {
        //             N: f.nitrogenPercentage,
        //             P: f.phosphorusPercentage,
        //             K: f.potassiumPercentage
        //         },
        //         chemical: {
        //             N: f.n || f.N,
        //             P: f.p || f.P,
        //             K: f.k || f.K
        //         }
        //     });
        // });

        return realFertilizers;
    }

    /**
     * Enhanced composition detection method
     */
    public hasEnhancedCompositionData(fertilizer: any): boolean {
        // Strategy 1: Check composition object from database
        if (fertilizer.composition) {
            const comp = fertilizer.composition;
            if ((comp.nitrogen && comp.nitrogen > 0) ||
                (comp.phosphorus && comp.phosphorus > 0) ||
                (comp.potassium && comp.potassium > 0)) {
                return true;
            }
        }

        // Strategy 2: Check percentage fields from database
        if ((fertilizer.nitrogenPercentage && fertilizer.nitrogenPercentage > 0) ||
            (fertilizer.phosphorusPercentage && fertilizer.phosphorusPercentage > 0) ||
            (fertilizer.potassiumPercentage && fertilizer.potassiumPercentage > 0)) {
            return true;
        }

        // Strategy 3: Check direct chemical analysis fields
        if ((fertilizer.n && fertilizer.n > 0) || (fertilizer.N && fertilizer.N > 0) ||
            (fertilizer.p && fertilizer.p > 0) || (fertilizer.P && fertilizer.P > 0) ||
            (fertilizer.k && fertilizer.k > 0) || (fertilizer.K && fertilizer.K > 0) ||
            (fertilizer.h2po4 && fertilizer.h2po4 > 0) || (fertilizer.H2PO4 && fertilizer.H2PO4 > 0)) {
            return true;
        }

        // Strategy 4: Check if name/description contains NPK ratios
        const npkPattern = /(\d+)-(\d+)-(\d+)/;
        if ((fertilizer.name && npkPattern.test(fertilizer.name)) ||
            (fertilizer.description && npkPattern.test(fertilizer.description))) {
            return true;
        }

        return false;
    }

    /**
     * Enhanced requirement display with better data extraction
     */
    public getEnhancedRequirementDisplayData(cropPhaseId: number | string): any | null {
        const req = this.getRealCropPhaseRequirements(cropPhaseId);
        if (!req) return null;

        const displayData = {
            nitrogen: (req.no3 || 0) + (req.nh4 || 0),
            phosphorus: req.h2po4 || req.H2PO4 || 0,
            potassium: req.k || req.K || 0,
            calcium: req.ca || req.Ca || 0,
            magnesium: req.mg || req.Mg || 0,
            sulfur: req.so4 || req.SO4 || 0,
            iron: req.fe || req.Fe || 0,
            ph: req.ph || req.pH || 'N/A',
            ec: req.ec || req.EC || 'N/A'
        };

        console.log('Enhanced requirement display data:', displayData);
        return displayData;
    }

    /**
     * Debugging helper to log all available fertilizer properties
     */
    public debugFertilizerProperties(): void {
        if (!this.fertilizers || this.fertilizers.length === 0) return;

        console.log('=== FERTILIZER PROPERTIES DEBUG ===');
        this.fertilizers.slice(0, 3).forEach((fertilizer, index) => {
            console.log(`\nFertilizer ${index + 1}: ${fertilizer.name}`);
            console.log('All properties:', Object.keys(fertilizer).sort());

            // Check for any property that might contain composition data
            const compositionProps = Object.keys(fertilizer).filter(key =>
                key.toLowerCase().includes('nitrogen') ||
                key.toLowerCase().includes('phosphorus') ||
                key.toLowerCase().includes('potassium') ||
                key.toLowerCase().includes('percentage') ||
                key.toLowerCase().includes('composition') ||
                key === 'n' || key === 'N' ||
                key === 'p' || key === 'P' ||
                key === 'k' || key === 'K' ||
                key === 'npk' || key === 'NPK'
            );

            console.log('Potential composition properties:', compositionProps);
            compositionProps.forEach(prop => {
                console.log(`  ${prop}: ${fertilizer[prop]}`);
            });
        });
    }


    /**
     * Enhanced validation method for simple formulation availability
     */
    isEnhancedSimpleFormulationAvailable(): boolean {
        // Check if we have crop phase requirements loaded
        const hasRequirements = this.cropPhaseSolutionRequirements &&
            this.cropPhaseSolutionRequirements.length > 0;

        // Check if we have fertilizers with compositions loaded
        const validFertilizers = this.getRealFertilizersWithCompositions();
        const hasFertilizers = validFertilizers.length > 0;

        // Check if we have water sources loaded
        const hasWaterSources = this.waterSources && this.waterSources.length > 0;

        // Check if we have crops loaded
        const hasCrops = this.crops && this.crops.length > 0;

        const isAvailable = hasRequirements && hasFertilizers && hasWaterSources && hasCrops;

        console.log('Simple Formulation Availability Check:', {
            hasRequirements: hasRequirements,
            requirementsCount: this.cropPhaseSolutionRequirements?.length || 0,
            hasFertilizers: hasFertilizers,
            fertilizersCount: validFertilizers.length,
            hasWaterSources: hasWaterSources,
            waterSourcesCount: this.waterSources?.length || 0,
            hasCrops: hasCrops,
            cropsCount: this.crops?.length || 0,
            isAvailable: isAvailable
        });

        return isAvailable;
    }

    /**
     * Method to display detailed formulation results with better formatting
     */
    getDetailedFormulationSummary(): string {
        if (!this.simpleFormulationResult) return '';

        const result = this.simpleFormulationResult;
        const balance = result.nutrientBalance;

        const formatRatio = (ratio: number): string => {
            const percentage = ratio * 100;
            if (percentage >= 90) return `${percentage.toFixed(0)}% ✅`;
            if (percentage >= 70) return `${percentage.toFixed(0)}% ⚠️`;
            return `${percentage.toFixed(0)}% ❌`;
        };

        return [
            `Nitrógeno: ${balance.nitrogen.achieved.toFixed(1)}/${balance.nitrogen.target} ppm (${formatRatio(balance.nitrogen.ratio)})`,
            `Fósforo: ${balance.phosphorus.achieved.toFixed(1)}/${balance.phosphorus.target} ppm (${formatRatio(balance.phosphorus.ratio)})`,
            `Potasio: ${balance.potassium.achieved.toFixed(1)}/${balance.potassium.target} ppm (${formatRatio(balance.potassium.ratio)})`,
            `Fertilizantes: ${result.fertilizers.length}`,
            `Costo total: ₡${result.totalCost.toFixed(2)}`
        ].join(' | ');
    }

    /**
     * Get color class for nutrient achievement status
     */
    getNutrientAchievementColor(nutrient: 'nitrogen' | 'phosphorus' | 'potassium'): string {
        if (!this.simpleFormulationResult) return 'text-muted';

        const ratio = this.simpleFormulationResult.nutrientBalance[nutrient].ratio;

        if (ratio >= 0.9) return 'text-success'; // Green for 90%+ achievement
        if (ratio >= 0.7) return 'text-warning'; // Yellow for 70-89% achievement
        return 'text-danger'; // Red for <70% achievement
    }

    /**
     * Check if formulation meets minimum quality standards
     */
    isFormulationAcceptable(): boolean {
        if (!this.simpleFormulationResult) return false;

        const balance = this.simpleFormulationResult.nutrientBalance;

        // Require at least 70% achievement for primary nutrients
        return balance.nitrogen.ratio >= 0.7 &&
            balance.phosphorus.ratio >= 0.7 &&
            balance.potassium.ratio >= 0.7;
    }

    /**
     * Generate recommendation text for improving formulation
     */
    getFormulationRecommendations(): string[] {
        if (!this.simpleFormulationResult) return [];

        const recommendations: string[] = [];
        const balance = this.simpleFormulationResult.nutrientBalance;

        if (balance.nitrogen.ratio < 0.7) {
            recommendations.push('Considerar fertilizantes con mayor contenido de nitrógeno');
        }
        if (balance.phosphorus.ratio < 0.7) {
            recommendations.push('Considerar fertilizantes con mayor contenido de fósforo');
        }
        if (balance.potassium.ratio < 0.7) {
            recommendations.push('Considerar fertilizantes con mayor contenido de potasio');
        }
        if (this.simpleFormulationResult.fertilizers.length > 4) {
            recommendations.push('Simplificar formulación usando menos fertilizantes');
        }

        return recommendations;
    }


    /**
     * 1. Handle crop change in Advanced Calculator
     */
    onAdvancedCropChange(): void {
        const cropId = this.calculationForm.get('cropId')?.value;
        console.log('Advanced crop changed to:', cropId);

        this.calculationForm.patchValue({
            cropPhaseId: null
        });
    }

    /**
     * 2. Get filtered crop phases for Advanced Calculator
     */
    getAdvancedFilteredCropPhases(): any[] {
        const selectedCropId = this.calculationForm?.get('cropId')?.value;

        if (!selectedCropId || !this.cropPhases || this.cropPhases.length === 0) {
            return [];
        }

        const filtered = this.cropPhases.filter((phase: any) => {
            const matchesCrop = phase.cropId === parseInt(selectedCropId);
            const hasRequirements = this.getRealCropPhaseRequirements(phase.id) !== null;
            return matchesCrop && hasRequirements;
        });

        console.log(`Found ${filtered.length} phases with requirements for crop ${selectedCropId}`);
        return filtered;
    }

    /**
     * 3. Reset Advanced Calculator form
     */
    resetAdvancedForm(): void {
        this.calculationForm.reset({
            user_id: 1,
            cropId: null,
            cropPhaseId: null,
            water_id: null,
            volume_liters: 1000,
            use_ml: true,
            apply_safety_caps: true,
            strict_caps: false
        });
        this.calculationResults = null;
        this.showResults = false;
        this.errorMessage = '';
    }


    // Load recipes by crop phase
    public loadRecipesByCropPhase(cropId: number, phaseId: number): void {
        this.nutrientRecipeService.getByCropPhase(cropId, phaseId).subscribe({
            next: (recipes) => {
                console.log('📦 Loaded recipes for crop phase:', recipes);
                this.savedRecipes = recipes.map(recipe => this.convertDatabaseRecipeToLocal(recipe));
                this.filterAllRecipes();
            },
            error: (error) => {
                console.error('❌ Error loading recipes:', error);
            }
        });
    }

    // Delete a recipe
    public deleteRecipeFromDatabase(recipeId: number): void {
        if (!confirm('Are you sure you want to delete this recipe?')) {
            return;
        }

        this.nutrientRecipeService.delete(recipeId).subscribe({
            next: () => {
                console.log('✅ Recipe deleted');
                alert('Recipe deleted successfully!');
                this.loadSavedRecipes(); // Reload recipes
            },
            error: (error) => {
                console.error('❌ Error deleting recipe:', error);
                alert('Error deleting recipe. Please try again.');
            }
        });
    }

    // Note: currentRecipe property already declared earlier in the component

    /**
     * Loads a recipe when selected from the saved recipes modal
     * This method should be called when a recipe is selected from loadSavedRecipes()
     */
    public onRecipeSelected(recipe: any): void {
        console.log('📋 Recipe selected from database:', recipe);

        // Map the database recipe structure to currentRecipe
        this.currentRecipe = {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description || `Receta para ${this.getCropName(recipe.cropId)} - ${this.getCropPhaseName(recipe.cropPhaseId)}`,
            cropId: recipe.cropId,
            cropName: recipe.cropName || this.getCropName(recipe.cropId),
            cropPhaseId: recipe.cropPhaseId,
            cropPhaseName: recipe.cropPhaseName || this.getCropPhaseName(recipe.cropPhaseId),
            volumeLiters: recipe.volumeLiters,
            targetPh: recipe.targetPh,
            targetEc: recipe.targetEc,
            totalCost: recipe.totalCost || 0,
            costPerLiter: recipe.costPerLiter || (recipe.totalCost / recipe.volumeLiters),
            dateCreated: recipe.dateCreated,
            recipeType: recipe.recipeType || 'Simple',
            fertilizers: recipe.fertilizers?.map((f: any) => ({
                fertilizerId: f.fertilizerId,
                fertilizerName: f.fertilizerName,
                concentrationGramsPerLiter: f.concentrationGramsPerLiter,
                totalGrams: f.totalGrams,
                totalCost: f.totalCost,
                percentageOfN: f.percentageOfN,
                percentageOfP: f.percentageOfP,
                percentageOfK: f.percentageOfK
            })) || []
        };

        // Clear any existing calculation results to show only the loaded recipe
        this.simpleFormulationResult = null;
        this.calculationResults = null;

        this.successMessage = `Receta "${recipe.name}" cargada exitosamente`;

        // Close the modal if it's open
        const modalElement = document.getElementById('savedRecipesModal');
        if (modalElement) {
            const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }

        // Scroll to the loaded recipe section
        setTimeout(() => {
            const recipeSection = document.querySelector('.border-info');
            if (recipeSection) {
                recipeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }

    /**
     * Uses the currently loaded recipe to populate the form
     */
    public useLoadedRecipe(): void {
        if (!this.currentRecipe) return;

        // Populate the form with recipe data
        this.formulationForm.patchValue({
            recipeName: this.currentRecipe.name,
            cropId: this.currentRecipe.cropId,
            cropPhaseId: this.currentRecipe.cropPhaseId,
            volumeLiters: this.currentRecipe.volumeLiters,
            targetPh: this.currentRecipe.targetPh,
            targetEc: this.currentRecipe.targetEc
        });

        this.successMessage = `Receta "${this.currentRecipe.name}" cargada en el formulario`;

        // Scroll to form
        setTimeout(() => {
            const formElement = document.querySelector('.card-header');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    /**
     * Exports the currently loaded recipe as JSON
     */
    public exportLoadedRecipe(): void {
        if (!this.currentRecipe) return;

        const exportData = {
            ...this.currentRecipe,
            exportedAt: new Date().toISOString(),
            exportedBy: 'AgriSmart System'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const fileName = `receta-${this.currentRecipe.name.replace(/\s+/g, '-')}-${Date.now()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();

        this.successMessage = 'Receta exportada exitosamente';
    }

    /**
     * Clears the currently loaded recipe from view
     */
    public clearLoadedRecipe(): void {
        this.currentRecipe = null;
        this.successMessage = 'Vista de receta cerrada';
    }

    /**
     * Duplicates the current recipe with a new name
     */
    public duplicateRecipe(): void {
        if (!this.currentRecipe) return;

        const newRecipe = {
            ...this.currentRecipe,
            id: 0, // New ID will be assigned by database
            name: `${this.currentRecipe.name} (Copia)`,
            dateCreated: new Date().toISOString()
        };

        // Populate form with duplicated recipe data
        this.formulationForm.patchValue({
            recipeName: newRecipe.name,
            cropId: newRecipe.cropId,
            cropPhaseId: newRecipe.cropPhaseId,
            volumeLiters: newRecipe.volumeLiters,
            targetPh: newRecipe.targetPh,
            targetEc: newRecipe.targetEc
        });

        this.successMessage = `Receta duplicada como "${newRecipe.name}". Modifique y guarde para crear una nueva.`;
        this.clearLoadedRecipe();
    }

    /**
     * Prints the loaded recipe details
     */
    public printLoadedRecipe(): void {
        if (!this.currentRecipe) return;

        // Create a printable version
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.errorMessage = 'No se pudo abrir la ventana de impresión';
            return;
        }

        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receta: ${this.currentRecipe.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #007bff; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
                h2 { color: #28a745; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
                .info-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .info-label { font-weight: bold; color: #6c757d; font-size: 12px; }
                .info-value { font-size: 18px; color: #212529; margin-top: 5px; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #6c757d; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>Receta de Formulación Nutricional</h1>
            <p><strong>Nombre:</strong> ${this.currentRecipe.name}</p>
            <p><strong>Descripción:</strong> ${this.currentRecipe.description || 'N/A'}</p>
            <p><strong>Cultivo:</strong> ${this.currentRecipe.cropName || this.getCropName(this.currentRecipe.cropId)}</p>
            <p><strong>Fase:</strong> ${this.currentRecipe.cropPhaseName || this.getCropPhaseName(this.currentRecipe.cropPhaseId)}</p>
            <p><strong>Tipo:</strong> ${this.currentRecipe.recipeType || 'Simple'}</p>
            <p><strong>Fecha de Creación:</strong> ${new Date(this.currentRecipe.dateCreated).toLocaleString()}</p>

            <h2>Parámetros Objetivo</h2>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Volumen</div>
                    <div class="info-value">${this.currentRecipe.volumeLiters} L</div>
                </div>
                <div class="info-box">
                    <div class="info-label">pH Objetivo</div>
                    <div class="info-value">${this.currentRecipe.targetPh}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">EC Objetivo</div>
                    <div class="info-value">${this.currentRecipe.targetEc} dS/m</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Costo Total</div>
                    <div class="info-value">₡${this.currentRecipe.totalCost?.toFixed(2)}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Costo por Litro</div>
                    <div class="info-value">₡${this.currentRecipe.costPerLiter?.toFixed(2)}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Fertilizantes</div>
                    <div class="info-value">${this.currentRecipe.fertilizers?.length || 0}</div>
                </div>
            </div>

            <h2>Detalle de Fertilizantes</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Fertilizante</th>
                        <th>NPK</th>
                        <th>Concentración (g/L)</th>
                        <th>Total (g)</th>
                        <th>Costo Total</th>
                        <th>% Costo</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.currentRecipe.fertilizers?.map((fert: { fertilizerName: any; percentageOfN: any; percentageOfP: any; percentageOfK: any; concentrationGramsPerLiter: number; totalGrams: number; totalCost: number; }, index: number) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${fert.fertilizerName}</td>
                            <td>${fert.percentageOfN || 0}-${fert.percentageOfP || 0}-${fert.percentageOfK || 0}</td>
                            <td>${fert.concentrationGramsPerLiter?.toFixed(3)}</td>
                            <td>${fert.totalGrams?.toFixed(2)}</td>
                            <td>₡${fert.totalCost?.toFixed(2)}</td>
                            <td>${((fert.totalCost / this.currentRecipe.totalCost) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('') || '<tr><td colspan="7">No hay fertilizantes</td></tr>'}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" style="text-align: right;"><strong>TOTAL:</strong></td>
                        <td><strong>₡${this.currentRecipe.totalCost?.toFixed(2)}</strong></td>
                        <td><strong>100%</strong></td>
                    </tr>
                </tfoot>
            </table>

            <div class="footer">
                <p>Documento generado por AgriSmart System</p>
                <p>Fecha de impresión: ${new Date().toLocaleString()}</p>
            </div>

            <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 20px 0;">
                Imprimir
            </button>
        </body>
        </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
    }

    // Note: selectRecipeFromModal() already exists earlier in the component

    /**
     * Checks if a loaded recipe is currently being displayed
     */
    public hasLoadedRecipe(): boolean {
        return this.currentRecipe !== null;
    }

    /**
     * Gets the total number of fertilizers in the loaded recipe
     */
    public getLoadedRecipeFertilizerCount(): number {
        return this.currentRecipe?.fertilizers?.length || 0;
    }

    /**
     * Calculates cost percentage for a fertilizer in the loaded recipe
     */
    public getFertilizerCostPercentage(fertilizer: any): number {
        if (!this.currentRecipe || !this.currentRecipe.totalCost) return 0;
        return (fertilizer.totalCost / this.currentRecipe.totalCost) * 100;
    }

    // Add this property
    isRecipesModalOpen = false;

    // Replace openAllRecipesModal with this
    openRecipesModal(): void {
        this.initializeModalData();
        this.filterAllRecipes();
        this.isRecipesModalOpen = true;
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    // Replace closeModal with this
    closeRecipesModal(): void {
        this.isRecipesModalOpen = false;
        document.body.style.overflow = ''; // Restore body scroll
    }

    // Update selectRecipeFromModal
    selectRecipeFromModal(recipe: FormulationRecipe): void {
        this.loadRecipe(recipe);
        this.closeRecipesModal();
    }

    /**
    * Get deviation class for styling based on percentage
        */
    getDeviationClass(target: any, actual: any): string {
        const targetNum = parseFloat(target);
        const actualNum = parseFloat(actual);
        if (isNaN(targetNum) || isNaN(actualNum) || targetNum === 0) {
            return 'text-muted'; // or some default class
        }
        const deviation = ((actualNum - targetNum) / targetNum) * 100;
        if (Math.abs(deviation) <= 5) {
            return 'text-success'; // Green
        } else if (Math.abs(deviation) <= 15) {
            return 'text-warning'; // Yellow
        } else {
            return 'text-danger'; // Red
        }
    }

    calculateDeviation(target: any, actual: any): string {
        const targetNum = parseFloat(target);
        const actualNum = parseFloat(actual);
        if (isNaN(targetNum) || isNaN(actualNum) || targetNum === 0) {
            return 'N/A';
        }
        const deviation = ((actualNum - targetNum) / targetNum) * 100;
        return deviation.toFixed(2);
    }

    /**
     * Get water analysis keys for iteration
     */
    getWaterAnalysisKeys(): string[] {
        return ['Ca', 'K', 'N', 'P', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo'];
    }

    private buildVerificationResults(response: CalculationResponse): VerificationResult[] {
        const calc_results = response.calculation_results;
        const target_concentrations = response.calculation_data_used?.target_concentrations || {};
        const achieved_concentrations = calc_results?.achieved_concentrations || {};
        const deviations_percent = calc_results?.deviations_percent || {};

        const verificationResults: VerificationResult[] = [];

        // Process all nutrients that appear in achieved_concentrations
        for (const param in achieved_concentrations) {
            // Skip non-nutrient parameters unless they're in targets
            if (!(param in target_concentrations)) {
                continue;
            }

            const target_value = target_concentrations[param] || 0;
            const actual_value = achieved_concentrations[param];
            const percentage_deviation = deviations_percent[param] || 0;

            // Determine status based on deviation
            let status = 'Low';
            if (Math.abs(percentage_deviation) <= 5) {
                status = 'Excellent';
            } else if (Math.abs(percentage_deviation) <= 15) {
                status = 'Good';
            } else if (Math.abs(percentage_deviation) <= 30) {
                status = 'Acceptable';
            }

            verificationResults.push({
                parameter: param,
                target_value: target_value,
                actual_value: actual_value,
                percentage_deviation: percentage_deviation,
                status: status
            });
        }

        return verificationResults;
    }


    hasNutrientDiscrepancy(nutrient: string): boolean {
        const diagnostic = this.nutrientDiagnostics[nutrient];
        return diagnostic && diagnostic.has_discrepancy === true;
    }

    getNutrientDiagnosticSeverity(nutrient: string): string {
        const diagnostic = this.nutrientDiagnostics[nutrient];
        return diagnostic?.has_discrepancy ? diagnostic.severity : 'none';
    }

    getNutrientDiagnosticMessage(nutrient: string): string {
        const diagnostic = this.nutrientDiagnostics[nutrient];

        if (!diagnostic?.has_discrepancy) {
            return 'Concentración óptima alcanzada';
        }

        let html = `<div class="diagnostic-tooltip">`;
        html += `<strong>${nutrient}</strong><br>`;
        html += `<span class="badge bg-${this.getSeverityBadgeClass(diagnostic.severity)}">${diagnostic.severity.toUpperCase()}</span><br><br>`;
        html += `<strong>Mensaje:</strong> ${diagnostic.message}<br>`;

        if (diagnostic.reasons?.length > 0) {
            html += `<br><strong>Razones:</strong><ul class="mb-0 ps-3">`;
            diagnostic.reasons.forEach(r => html += `<li>${r.description}</li>`);
            html += `</ul>`;
        }

        if (diagnostic.supplying_fertilizers?.length > 0) {
            html += `<br><strong>Fertilizantes:</strong><br>`;
            html += `<small>${diagnostic.supplying_fertilizers.join(', ')}</small>`;
        }

        html += `</div>`;
        return html;
    }

    private getSeverityBadgeClass(severity: string): string {
        switch (severity) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'secondary';
        }
    }

    private initializeTooltips(): void {
        if (typeof (window as any).bootstrap !== 'undefined') {
            const tooltipTriggerList = Array.from(
                document.querySelectorAll('[data-bs-toggle="tooltip"]')
            );
            tooltipTriggerList.forEach((el) => {
                new (window as any).bootstrap.Tooltip(el, { html: true, trigger: 'hover' });
            });
        }
    }

    getNutrientDiagnosticsSummary(): { high: number; medium: number; low: number; total: number } {
        const summary = { high: 0, medium: 0, low: 0, total: 0 };
        Object.values(this.nutrientDiagnostics).forEach(d => {
            if (d.has_discrepancy) {
                summary.total++;
                if (d.severity === 'high') summary.high++;
                else if (d.severity === 'medium') summary.medium++;
                else if (d.severity === 'low') summary.low++;
            }
        });
        return summary;
    }

    ngOnDestroy(): void {
        // Cleanup tooltips
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
            const tooltip = (window as any).bootstrap.Tooltip.getInstance(el);
            tooltip?.dispose();
        });

        // Clean up any open modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal);
            if (modalInstance) {
                modalInstance.dispose();
            }
        });

        // Remove any remaining backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        // Restore body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    // ==========================================================================
    // SOIL MODE METHODS
    // ==========================================================================

    /**
     * Toggle between hydroponics and soil modes
     */
    switchFormulationMode(mode: 'hydroponics' | 'soil'): void {
        this.formulationMode = mode;

        if (mode === 'soil' && this.soilAnalysisList.length === 0) {
            this.loadSoilAnalyses();
        }

        // Reset results when switching modes
        this.calculationResults = null;
        this.soilFertigationResult = null;
    }

    /**
     * Load soil analyses for selected crop production
     */
    loadSoilAnalyses(): void {
        const cropPhaseId = this.formulationForm.get('cropPhaseId')?.value;
        if (!cropPhaseId) {
            this.errorMessage = 'No se encontró la producción de cultivo para la fase seleccionada';
            return;
        }

        this.isLoading = true;

        console.log('Loading soil analyses for crop production:', cropPhaseId);
        this.soilAnalysisService.getByCropProduction(cropPhaseId, false)
            .subscribe({
                next: (analyses: any) => {
                    this.soilAnalysisList = analyses.soilAnalyses;

                    // Auto-select most recent analysis
                    if (analyses.length > 0) {
                        this.selectedSoilAnalysis = analyses[0];
                    }

                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading soil analyses:', error);
                    this.errorMessage = 'Error al cargar análisis de suelo';
                    this.isLoading = false;
                }
            });
    }

    /**
     * Select soil analysis for calculations
     */
    onSoilAnalysisSelected(analysisId: number): void {
        const analysis = this.soilAnalysisList.find(a => a.id === analysisId);
        if (analysis) {
            this.selectedSoilAnalysis = analysis;

            // Recalculate if there's already a result
            if (this.soilFertigationResult) {
                this.calculateSoilFormulation();
            }
        }
    }

    /**
     * Calculate soil-based fertigation
     */
    calculateSoilFormulation(): void {
        if (!this.selectedSoilAnalysis) {
            this.errorMessage = 'Por favor seleccione un análisis de suelo';
            return;
        }

        if (!this.fertilizers || this.fertilizers.length === 0) {
            this.errorMessage = 'Por favor seleccione al menos un fertilizante';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.soilFertigationResult = null;

        // Build input for soil calculation
        const input: SoilFertigationInput = {
            targetConcentrations: this.getTargetConcentrations(),
            soilAnalysis: this.selectedSoilAnalysis,
            waterAnalysis: this.getWaterAnalysisData(),
            irrigationVolume: this.soilIrrigationVolume,
            irrigationsPerWeek: this.soilIrrigationsPerWeek,
            leachingFraction: this.soilLeachingFraction / 100,
            applicationEfficiency: this.soilApplicationEfficiency / 100,
            cropArea: 1000, // Default crop area
            rootingDepth: this.soilRootingDepth,
            fertilizers: this.fertilizers
        };

        // Step 1: Calculate adjusted targets
        this.soilFertigationCalc.calculateSoilFertigation(input)
            .subscribe({
                next: (soilResult) => {
                    this.soilFertigationResult = soilResult;
                    this.adjustedTargets = soilResult.adjustedTargets;

                    // Step 2: Call Python API with adjusted targets
                    this.callPythonAPIWithAdjustedTargets(soilResult);
                },
                error: (error) => {
                    console.error('Soil fertigation calculation error:', error);
                    this.errorMessage = 'Error al calcular fertirriego para suelo';
                    this.isLoading = false;
                }
            });
    }

    /**
     * Call Python API with adjusted targets from soil calculation
     */
    private callPythonAPIWithAdjustedTargets(soilResult: SoilFertigationOutput): void {
        // Build adjusted target concentrations
        const adjustedConcentrations: any = {};
        soilResult.adjustedTargets.forEach(target => {
            adjustedConcentrations[target.nutrient] = target.adjustedTarget;
        });

        // Prepare request for Python API (similar structure to existing API calls)
        const requestBody = {
            fertilizers: this.mapFertilizersForAPI(this.fertilizers),
            target_concentrations: adjustedConcentrations,
            water_analysis: this.getWaterAnalysisData(),
            calculation_settings: {
                volume_liters: this.soilIrrigationVolume,
                precision: 3,
                units: 'mg/L',
                leaching_fraction: this.soilLeachingFraction / 100
            }
        };

        // Use the existing Python API endpoint
        const apiUrl = `${environment.calculatorApi}/calculate-advanced?method=deterministic`;

        // Make API call
        this.http.post<any>(apiUrl, requestBody)
            .subscribe({
                next: (response) => {
                    // Store the Python API response
                    if (this.soilFertigationResult) {
                        this.soilFertigationResult.fertilizerRecommendations = response;
                    }

                    this.calculationResults = response;
                    this.isLoading = false;

                    console.log('Soil fertigation calculation complete:', response);
                },
                error: (error) => {
                    console.error('Python API error:', error);
                    this.errorMessage = 'Error al calcular formulación con API de Python';
                    this.isLoading = false;
                }
            });
    }

    /**
     * Get target concentrations from selected crop phase
     */
    private getTargetConcentrations(): any {
        // This should get the nutrient targets from the selected crop phase
        // For now, using default values - should be replaced with actual crop phase requirements
        return {
            N: 150,
            P: 40,
            K: 200,
            Ca: 180,
            Mg: 50,
            S: 80
        };
    }

    /**
     * Get water analysis data
     */
    private getWaterAnalysisData(): any {
        const selectedWaterSource = this.waterSources.find(w => w.id === this.formulationForm.get('waterSourceId')?.value);

        if (!selectedWaterSource) {
            return {
                N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0,
                Fe: 0, Mn: 0, Zn: 0, Cu: 0, B: 0, Mo: 0
            };
        }

        return {
            N: selectedWaterSource.no3 || selectedWaterSource.nO3 || 0,
            P: selectedWaterSource.po4 || 0,
            K: selectedWaterSource.k || 0,
            Ca: selectedWaterSource.ca || 0,
            Mg: selectedWaterSource.mg || 0,
            S: selectedWaterSource.sul || 0,
            Fe: selectedWaterSource.fe || 0,
            Mn: selectedWaterSource.mn || 0,
            Zn: selectedWaterSource.zn || 0,
            Cu: selectedWaterSource.cu || 0,
            B: selectedWaterSource.b || 0,
            Mo: selectedWaterSource.mo || 0
        };
    }

    /**
     * Map fertilizers for API
     */
    private mapFertilizersForAPI(fertilizers: any[]): any[] {
        return fertilizers.map(f => ({
            id: f.id,
            name: f.name,
            composition: f.composition || {}
        }));
    }

    /**
     * Toggle soil vs hydroponic comparison view
     */
    toggleSoilComparison(): void {
        this.showSoilComparison = !this.showSoilComparison;
    }

    /**
     * Navigate to soil analysis form to create new analysis
     */
    createNewSoilAnalysis(): void {
        this.router.navigate(['/soil-analysis']);
    }

    // Helper methods for display

    /**
     * Get soil pH interpretation
     */
    getSoilPhInterpretation(ph: number | undefined): string {
        if (!ph) return 'No disponible';

        if (ph < 5.5) return 'Ácido (< 5.5)';
        if (ph >= 5.5 && ph < 6.5) return 'Ligeramente ácido (5.5-6.5)';
        if (ph >= 6.5 && ph < 7.5) return 'Neutro (6.5-7.5)';
        if (ph >= 7.5 && ph < 8.5) return 'Ligeramente alcalino (7.5-8.5)';
        return 'Alcalino (> 8.5)';
    }

    /**
     * Get soil pH color class
     */
    getSoilPhColorClass(ph: number | undefined): string {
        if (!ph) return 'text-muted';

        if (ph < 5.5 || ph > 8.5) return 'text-danger';
        if ((ph >= 5.5 && ph < 6.0) || (ph > 8.0 && ph <= 8.5)) return 'text-warning';
        return 'text-success';
    }

    /**
     * Get soil texture description
     */
    getSoilTextureDescription(): string {
        if (!this.selectedSoilAnalysis) return '';

        const textureInfo = this.selectedSoilAnalysis.textureInfo;
        if (textureInfo) {
            return textureInfo.description || textureInfo.textureClassName;
        }

        return this.selectedSoilAnalysis.textureClass || 'No especificado';
    }

    /**
     * Format nutrient availability percentage
     */
    formatAvailability(factor: number): string {
        return `${(factor * 100).toFixed(0)}%`;
    }

    /**
     * Get availability color class
     */
    getAvailabilityColorClass(factor: number): string {
        if (factor >= 0.7) return 'text-success';
        if (factor >= 0.4) return 'text-warning';
        return 'text-danger';
    }

    /**
     * Calculate total nutrient reduction from soil
     */
    getTotalSoilContribution(): number {
        if (!this.adjustedTargets || this.adjustedTargets.length === 0) return 0;

        const totalOriginal = this.adjustedTargets.reduce((sum, t) => sum + t.originalTarget, 0);
        const totalAdjusted = this.adjustedTargets.reduce((sum, t) => sum + t.adjustedTarget, 0);

        if (totalOriginal === 0) return 0;

        return ((totalOriginal - totalAdjusted) / totalOriginal) * 100;
    }

    /**
     * Get formatted date from soil analysis
     */
    formatSoilAnalysisDate(analysis: SoilAnalysisResponse): string {
        const date = new Date(analysis.sampleDate);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Check if soil analysis is recent (< 6 months)
     */
    isSoilAnalysisRecent(analysis: SoilAnalysisResponse): boolean {
        const analysisDate = new Date(analysis.sampleDate);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        return analysisDate >= sixMonthsAgo;
    }
}