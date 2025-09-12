import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, catchError, tap, map } from 'rxjs';
import { WaterChemistryService, WaterChemistry } from '../water-chemistry/services/water-chemistry.service';
import { FertilizerService } from '../fertilizers/services/fertilizer.service';
import { CropService } from '../crops/services/crop.service';
import { ApiService } from '../../core/services/api.service';
import { CatalogService, Catalog } from '../catalogs/services/catalog.service';
import { AuthService } from '../../core/auth/auth.service';
interface CropPhaseOptimal {
    id: number;
    cropPhaseId: number;
    cropPhase?: any;
    nitrogenOptimal: number;
    phosphorusOptimal: number;
    potassiumOptimal: number;
    calciumOptimal?: number;
    magnesiumOptimal?: number;
    sulfurOptimal?: number;
    phOptimal?: number;
    ecOptimal?: number;
}

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
    linear_programming_analysis: LinearProgrammingAnalysis;
    data_sources: DataSources;
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
    private readonly FERTILIZER_INPUT_ENDPOINT = '/FertilizerInput';
    private readonly ANALYTICAL_ENTITY_ENDPOINT = '/AnalyticalEntity';
    waterSources: WaterChemistry[] = [];
    fertilizers: Fertilizer[] = [];
    fertilizerChemistries: FertilizerChemistry[] = [];
    crops: Crop[] = [];
    cropPhases: CropPhase[] = [];
    cropPhaseSolutionRequirements: CropPhaseSolutionRequirement[] = [];
    currentRecipe: FormulationRecipe | null = null;
    formulationResults: any[] = [];
    savedRecipes: FormulationRecipe[] = [];
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showAdvancedOptions = false;
    Message!: string;

    calculationForm!: FormGroup;

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

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router,
        private authService: AuthService,
        private waterChemistryService: WaterChemistryService,
        private fertilizerService: FertilizerService,
        private cropService: CropService,
        private catalogService: CatalogService,
        private apiService: ApiService
    ) {
        this.formulationForm = this.createForm();
        this.calculationForm = this.createCalculationForm(); // Add this line
    }

    // Add this new method to create the calculation form
    private createCalculationForm(): FormGroup {
        return this.fb.group({
            user_id: [1, [Validators.required, Validators.min(1)]],
            catalog_id: [null, Validators.required],
            phase_id: [null, Validators.required],
            water_id: [null, Validators.required],
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
    }
    private createForm(): FormGroup {
        return this.fb.group({
            recipeName: ['Nueva Receta', Validators.required],
            waterSourceId: [null, Validators.required],
            cropId: [null, Validators.required],
            cropPhaseId: [null],
            volumeLiters: [1000, [Validators.required, Validators.min(1)]],
            targetPh: [],
            targetEc: [],
            maxBudgetPerLiter: [100],
            preferOrganic: [false],
            excludeFertilizers: [[]]
        });
    }
    private loadCropPhaseSolutionRequirements(): Observable<CropPhaseSolutionRequirement[]> {
        return this.apiService.get('/CropPhase').pipe(
            map(phases => Array.isArray(phases) ? phases : []),
            map(phases => {
                return [];
            })
        );
    }
    onCropChange(): void {
        const cropId = this.formulationForm.get('cropId')?.value;
        if (cropId) {
            this.formulationForm.patchValue({ cropPhaseId: null });
        }
    }
    onCropPhaseChange(): void {
        const cropPhaseId = this.formulationForm.get('cropPhaseId')?.value;
        if (cropPhaseId) {
            this.loadPhaseRequirements(cropPhaseId);
        }
    }
    private loadPhaseRequirements(phaseId: number): void {
        const requirement = this.cropPhaseSolutionRequirements.find(req => req.phaseId === phaseId);
        if (requirement) {
            this.formulationForm.patchValue({
                targetPh: requirement.ec ? 6.5 : 6.5,
                targetEc: requirement.ec || 1.5
            });
        }
    }
    private generateFormulationResults(recipe: FormulationRecipe): any[] {
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
    private saveSavedRecipes(): void {
        try {
            localStorage.setItem('nutrient_recipes', JSON.stringify(this.savedRecipes));
        } catch (error) {
            console.error('Error saving recipes to localStorage:', error);
        }
    }
    loadRecipe(recipe: FormulationRecipe): void {
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
        const selectedCropId = this.formulationForm.get('cropId')?.value;
        if (!selectedCropId) {
            return [];
        }
        const cropIdNumber = typeof selectedCropId === 'string' ? parseInt(selectedCropId, 10) : selectedCropId;
        const filtered = this.cropPhases.filter(phase => {
            return phase.cropId === cropIdNumber;
        });
        return filtered;
    }
    getStatusClass(status: string): string {
        const classes = {
            'optimal': 'text-success',
            'acceptable': 'text-warning',
            'critical': 'text-danger'
        };
        return classes[status as keyof typeof classes] || 'text-muted';
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
    private sanitizeFormValues(formValue: any): any {
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
    private calculateWithRealDataFixed(
        formValue: any,
        waterSource: WaterChemistry,
        crop: Crop,
        phase?: CropPhase
    ): void {
        this.currentRecipe = this.createRecipeFromForm(formValue, waterSource, crop, phase);
        this.currentRecipe.fertilizers = this.calculateEnhancedFertilizerMixFixed(this.currentRecipe);
        this.formulationResults = this.generateEnhancedFormulationResults(this.currentRecipe, waterSource);
        this.saveRecipe();
        this.isLoading = false;
        this.Message = `Formulación calculada exitosamente. Fertilizantes seleccionados: ${this.currentRecipe.fertilizers.length}`;
    }
    private calculateEnhancedFertilizerMixFixed(recipe: FormulationRecipe): RecipeFertilizer[] {
        const selectedFertilizers: RecipeFertilizer[] = [];
        const availableFertilizers = this.fertilizers.filter(f => f.isActive);
        if (availableFertilizers.length === 0) {
            console.warn('No active fertilizers available');
            const allFertilizers = this.fertilizers.filter(f =>
                f.composition && (f.composition.nitrogen > 0 || f.composition.phosphorus > 0 || f.composition.potassium > 0)
            );
            if (allFertilizers.length > 0) {
                return this.calculateSimpleFertilizerMix(recipe, allFertilizers);
            }
            return [];
        }
        const fertilizersWithChemistry = availableFertilizers.map(fert => {
            const chemistry = this.fertilizerChemistries.find(c => c.fertilizerId === fert.id);
            return { ...fert, chemistry };
        });
        const targets = {
            nitrogen: Number(recipe.targetNitrogen) || 200,
            phosphorus: Number(recipe.targetPhosphorus) || 50,
            potassium: Number(recipe.targetPotassium) || 300,
            calcium: Number(recipe.targetCalcium) || 150,
            magnesium: Number(recipe.targetMagnesium) || 50
        };
        const optimalFertilizers = this.selectOptimalFertilizersFixed(fertilizersWithChemistry, targets, Number(recipe.volumeLiters));
        optimalFertilizers.forEach(fert => {
            const volumeLiters = Number(recipe.volumeLiters) || 1000;
            const costPortion = (fert.concentration * volumeLiters * (fert.pricePerUnit || 0)) / 1000;
            selectedFertilizers.push({
                fertilizerId: fert.id,
                fertilizer: fert,
                concentration: Math.round(fert.concentration * 100) / 100,
                percentageOfN: this.calculateNutrientContribution(fert, 'nitrogen', targets.nitrogen),
                percentageOfP: this.calculateNutrientContribution(fert, 'phosphorus', targets.phosphorus),
                percentageOfK: this.calculateNutrientContribution(fert, 'potassium', targets.potassium),
                costPortion: Math.round(costPortion * 100) / 100
            });
        });
        recipe.totalCost = selectedFertilizers.reduce((sum, fert) => sum + fert.costPortion, 0);
        return selectedFertilizers;
    }
    private calculateSimpleFertilizerMix(recipe: FormulationRecipe, fertilizers: Fertilizer[]): RecipeFertilizer[] {
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
    private calculateSimpleConcentration(fertilizer: Fertilizer, targetPpm: number, nutrient: keyof FertilizerComposition, volumeLiters: number): number {
        if (!fertilizer.composition) return 0;
        let nutrientPercentageRaw = fertilizer.composition[nutrient];
        const nutrientPercentage = typeof nutrientPercentageRaw === 'number' ? nutrientPercentageRaw : Number(nutrientPercentageRaw) || 0;
        if (nutrientPercentage === 0) return 0;
        const concentration = (targetPpm * volumeLiters) / (nutrientPercentage * 10);
        return Math.max(0, Math.min(5, concentration));
    }
    private selectOptimalFertilizersFixed(fertilizers: any[], targets: any, volumeLiters: number): any[] {
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
    private calculateFertilizerScoreFixed(fertilizer: any, targets: any): number {
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
    private calculateOptimalConcentrationFixed(fertilizer: any, targets: any, volumeLiters: number): number {
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
    private updateRemainingTargetsFixed(remaining: any, fertilizer: any, concentration: number, volumeLiters: number): void {
        if (!fertilizer.composition) return;
        const comp = fertilizer.composition;
        remaining.nitrogen = Math.max(0, remaining.nitrogen - (comp.nitrogen * concentration * 10));
        remaining.phosphorus = Math.max(0, remaining.phosphorus - (comp.phosphorus * concentration * 10));
        remaining.potassium = Math.max(0, remaining.potassium - (comp.potassium * concentration * 10));
        remaining.calcium = Math.max(0, remaining.calcium - ((comp.calcium || 0) * concentration * 10));
        remaining.magnesium = Math.max(0, remaining.magnesium - ((comp.magnesium || 0) * concentration * 10));
    }
    private targetsAreSufficientFixed(remaining: any, original: any): boolean {
        const threshold = 0.3;
        const nMet = (original.nitrogen - remaining.nitrogen) / original.nitrogen >= (1 - threshold);
        const pMet = (original.phosphorus - remaining.phosphorus) / original.phosphorus >= (1 - threshold);
        const kMet = (original.potassium - remaining.potassium) / original.potassium >= (1 - threshold);
        return nMet && pMet && kMet;
    }
    private calculateNutrientContribution(fertilizer: any, nutrient: string, target: number): number {
        if (!fertilizer.composition) return 0;
        const composition = fertilizer.composition[nutrient] || 0;
        const concentration = fertilizer.concentration || 0;
        if (target === 0) return 0;
        const contribution = (composition * concentration) / 1000;
        return Math.min(100, Math.round((contribution / target) * 10000) / 100);
    }
    private generateEnhancedFormulationResults(recipe: FormulationRecipe, waterSource: WaterChemistry): any[] {
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
                parameter: 'Nitrógeno Total',
                target: recipe.targetNitrogen,
                achieved: Math.round(achievedN * 10) / 10,
                unit: 'ppm',
                difference: Math.round((achievedN - recipe.targetNitrogen) * 10) / 10,
                status: this.getStatus(achievedN, recipe.targetNitrogen, 25)
            },
            {
                parameter: 'Fósforo',
                target: recipe.targetPhosphorus,
                achieved: Math.round(achievedP * 10) / 10,
                unit: 'ppm',
                difference: Math.round((achievedP - recipe.targetPhosphorus) * 10) / 10,
                status: this.getStatus(achievedP, recipe.targetPhosphorus, 15)
            },
            {
                parameter: 'Potasio',
                target: recipe.targetPotassium,
                achieved: Math.round(achievedK * 10) / 10,
                unit: 'ppm',
                difference: Math.round((achievedK - recipe.targetPotassium) * 10) / 10,
                status: this.getStatus(achievedK, recipe.targetPotassium, 35)
            },
            {
                parameter: 'Calcio',
                target: recipe.targetCalcium || 150,
                achieved: Math.round(achievedCa * 10) / 10,
                unit: 'ppm',
                difference: Math.round((achievedCa - (recipe.targetCalcium || 150)) * 10) / 10,
                status: this.getStatus(achievedCa, recipe.targetCalcium || 150, 20)
            },
            {
                parameter: 'pH',
                target: recipe.targetPh,
                achieved: estimatedPh,
                unit: '',
                difference: Math.round((estimatedPh - recipe.targetPh) * 10) / 10,
                status: this.getStatus(estimatedPh, recipe.targetPh, 0.3)
            },
            {
                parameter: 'EC',
                target: recipe.targetEc,
                achieved: estimatedEc,
                unit: 'dS/m',
                difference: Math.round((estimatedEc - recipe.targetEc) * 100) / 100,
                status: this.getStatus(estimatedEc, recipe.targetEc, 0.2)
            }
        ];
    }
    private estimatePh(waterSource: WaterChemistry, fertilizers: RecipeFertilizer[]): number {
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
    private estimateEc(waterSource: WaterChemistry, fertilizers: RecipeFertilizer[]): number {
        let estimatedEc = waterSource.ec || 0.3;
        fertilizers.forEach(rf => {
            const ecContribution = rf.concentration * 0.0015;
            estimatedEc += ecContribution;
        });
        return Math.round(estimatedEc * 100) / 100;
    }
    private getStatus(achieved: number, target: number, tolerance: number): string {
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
    saveRecipe(): void {
        if (!this.currentRecipe) return;
        this.isLoading = true;
        this.errorMessage = '';
        const currentUser = this.authService.getCurrentUser();
        const catalogId = currentUser?.catalogId || 1;
        const recipeSummary = {
            catalogId: catalogId,
            name: `RECIPE_${this.currentRecipe.name}`,
            description: `Recipe:${this.currentRecipe.name}|Cost:${this.currentRecipe.totalCost}`,
            script: 'NUTRIENT_RECIPE',
            entityType: 998,
            active: true
        };
        console.log('🔥 Saving recipe summary to server:', recipeSummary);
        this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, recipeSummary).pipe(
            catchError(error => {
                console.error('Failed to save recipe summary, using localStorage:', error);
                return of({ success: false });
            })
        ).subscribe({
            next: (summaryResponse: any) => {
                if (summaryResponse) {
                    console.log('🔥 Recipe summary saved successfully:', summaryResponse);
                    const recipeId = summaryResponse.id || Date.now();
                    this.currentRecipe!.id = recipeId;
                    this.saveRecipeDetails(recipeId, catalogId);
                } else {
                    console.error('Failed to save recipe summary, using localStorage');
                    this.saveToLocalStorage();
                }
            },
            error: (error) => {
                console.error('Error saving recipe summary:', error);
                this.saveToLocalStorage();
            }
        });
    }
    private saveRecipeDetails(recipeId: number, catalogId: number): void {
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
    private saveRecipeFertilizers(recipeId: number, catalogId: number): void {
        if (!this.currentRecipe || !this.currentRecipe.fertilizers.length) {
            console.error('No fertilizers to save for recipe', this.currentRecipe);
            return;
        }
        const fertilizerPromises = this.currentRecipe.fertilizers.map((fert, index) => {
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
    private handleSaveComplete(message: string): void {
        this.Message = message;
        this.isLoading = false;
        this.loadSavedRecipes();
    }
    private parseCompactRecipeData(description: string, baseRecipe: any): any {
        return {
            ...baseRecipe,
            targetPh: 6.5,
            targetEc: 1.5,
            volumeLiters: 1000,
            totalCost: 0
        };
    }
    private parseFertilizerRecord(description: string): any | null {
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
    deleteRecipe(recipe: FormulationRecipe): void {
        if (!confirm(`¿Está seguro de que desea eliminar la receta "${recipe.name}"?`)) {
            return;
        }
        if (!recipe.id) {
            this.errorMessage = 'No se puede eliminar una receta sin ID';
            return;
        }
        this.isLoading = true;
        if (recipe.id > 1000000) {
            this.deleteFromLocalStorage(recipe.id);
            return;
        }
        this.deleteRecipeFromBackend(recipe.id);
    }
    private deleteRecipeFromBackend(recipeId: number): void {
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
    getFertilizerChemistries(): Observable<FertilizerChemistry[]> {
        return this.apiService.get<FertilizerChemistry[]>('/FertilizerChemistry').pipe(
            map(response => {
                return Array.isArray(response) ? response : [];
            }),
            catchError(error => {
                console.error('FertilizerService.getFertilizerChemistries error:', error);
                return of([]);
            })
        );
    }
    private calculateOptimizationScore(fertilizer: Fertilizer, requirements: any): number {
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
    private loadInitialData(): void {
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
        const clientId = this.authService.getCurrentUser()['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'];
        this.catalogService.getAll(clientId).subscribe({
            next: (response: any) => {
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
                            this.cropPhases = (response as any).cropPhases || [];
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
                        this.waterSources = Array.isArray(data.waterSources.waterChemistries) ? data.waterSources.waterChemistries : [];
                        this.crops = Array.isArray(data.crops) ? data.crops : [];
                        this.cropPhases = Array.isArray(data.cropPhases) ? data.cropPhases : [];
                        this.fertilizerChemistries = Array.isArray(data.fertilizerChemistries) ? data.fertilizerChemistries : [];
                        this.cropPhaseSolutionRequirements = Array.isArray(data.solutionRequirements) ? data.solutionRequirements : [];
                        this.loadOptimizedFertilizers(firstCatalogId);
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
    private createRecipeFromForm(formValue: any, waterSource: WaterChemistry, crop: Crop, phase?: CropPhase): FormulationRecipe {
        const solutionReq = this.cropPhaseSolutionRequirements.find(req => req.phaseId === formValue.cropPhaseId);
        const recipeName = formValue.recipeName || `${crop.name}${phase ? ' - ' + phase.name : ''}`;
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
    private selectOptimalFertilizersForRecipe(targets: any, volumeLiters: number): RecipeFertilizer[] {
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
    private calculateOptimalConcentrationForFertilizer(fertilizer: any, remaining: any, volumeLiters: number): number {
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
    private createRecipeFertilizer(fertilizer: any, concentration: number, targets: any, volumeLiters: number): RecipeFertilizer {
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
    private calculateNutrientPercentage(fertilizer: any, concentration: number, nutrient: string, target: number): number {
        if (!fertilizer.composition || target === 0) return 0;
        const nutrientContent = fertilizer.composition[nutrient] || 0;
        const provided = (nutrientContent * concentration) / 10;
        return Math.min(100, Math.round((provided / target) * 100));
    }
    private updateRemainingTargets(remaining: any, fertilizer: any, concentration: number): void {
        if (!fertilizer.composition) return;
        const comp = fertilizer.composition;
        const factor = concentration / 10;
        remaining.nitrogen = Math.max(0, remaining.nitrogen - (comp.nitrogen || 0) * factor);
        remaining.phosphorus = Math.max(0, remaining.phosphorus - (comp.phosphorus || 0) * factor);
        remaining.potassium = Math.max(0, remaining.potassium - (comp.potassium || 0) * factor);
        remaining.calcium = Math.max(0, remaining.calcium - (comp.calcium || 0) * factor);
        remaining.magnesium = Math.max(0, remaining.magnesium - (comp.magnesium || 0) * factor);
    }
    private needsAdditionalFertilizer(remaining: any, original: any): boolean {
        const threshold = 0.4;
        const nRemaining = remaining.nitrogen / original.nitrogen;
        const pRemaining = remaining.phosphorus / original.phosphorus;
        const kRemaining = remaining.potassium / original.potassium;
        return nRemaining > threshold || pRemaining > threshold || kRemaining > threshold;
    }
    private isBalancedFertilizer(composition: any): boolean {
        const n = composition.nitrogen || 0;
        const p = composition.phosphorus || 0;
        const k = composition.potassium || 0;
        const nutrientCount = [n, p, k].filter(val => val >= 5).length;
        return nutrientCount >= 2;
    }
    private findBestNutrientSource(fertilizers: any[], nutrient: string, targetValue: number, usedIds: Set<number>): any | null {
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
    private calculateFertilizerEffectivenessScore(fertilizer: Fertilizer, targets: any): number {
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
    calculateFormulation(): void {
        if (this.formulationForm.invalid) {
            const invalidFields = Object.keys(this.formulationForm.controls).filter(key => this.formulationForm.get(key)?.invalid);
            console.warn('Formulario inválido, campos faltantes o incorrectos:', invalidFields);
            this.errorMessage = 'Por favor complete todos los campos requeridos';
            return;
        }
        this.isLoading = true;
        this.errorMessage = '';
        const formValue = this.sanitizeFormValues(this.formulationForm.value);
        const selectedWaterSource = this.waterSources.find(w => w.id === formValue.waterSourceId);
        const selectedCrop = this.crops.find(c => c.id === formValue.cropId);
        const selectedPhase = formValue.cropPhaseId ? this.cropPhases.find(p => p.id === formValue.cropPhaseId) : undefined;
        if (!selectedWaterSource || !selectedCrop) {
            console.error('Selected water source or crop not found: ', formValue);
            this.errorMessage = 'Error: Datos de fuente de agua o cultivo no encontrados';
            this.isLoading = false;
            return;
        }
        this.calculateWithRealDataFixed(formValue, selectedWaterSource, selectedCrop, selectedPhase);
    }
    private getFertilizerCompositionByName(fertilizerName?: string): FertilizerComposition | null {
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
            '10-10-10': { nitrogen: 10, phosphorus: 10, potassium: 10, micronutrients: undefined }
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
    private loadOptimizedFertilizers(catalogId: number): void {
        const cropPhaseIds = [...new Set(this.cropPhases.map(phase => phase.id))];
        if (cropPhaseIds.length === 0) {
            this.loadBasicFertilizers(catalogId);
            return;
        }
        const fertilizerObservables = cropPhaseIds.map(cropPhaseId =>
            this.fertilizerService.getFertilizersWithOptimalComposition(
                catalogId,
                cropPhaseId,
                { onlyActive: true }
            ).pipe(
                map((response: any) => {
                    let fertilizers: any[] = [];
                    if (Array.isArray(response)) {
                        fertilizers = response;
                    } else if (response && typeof response === 'object') {
                        if (Array.isArray(response.fertilizers)) {
                            fertilizers = response.fertilizers;
                        } else if (Array.isArray(response.result)) {
                            fertilizers = response.result;
                        } else if (Array.isArray(response.data)) {
                            fertilizers = response.data;
                        } else if (Array.isArray(response.items)) {
                            fertilizers = response.items;
                        } else {
                            console.warn(`Unexpected response format for crop phase ${cropPhaseId}:`, response);
                            fertilizers = [];
                        }
                    } else {
                        console.warn(`Invalid response for crop phase ${cropPhaseId}:`, response);
                        fertilizers = [];
                    }
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
                    result.fertilizers.forEach(fertilizer => {
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
                this.fertilizers = this.transformFertilizersData({
                    fertilizers: Array.from(allFertilizers.values())
                });
                this.verifyFertilizerData();
                this.logFertilizerSummary();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading optimized fertilizers:', error);
                this.loadBasicFertilizers(catalogId);
            }
        });
    }
    private loadBasicFertilizers(catalogId: number): void {
        this.fertilizerService.getFertilizersWithCatalogId(catalogId, { onlyActive: true }).subscribe({
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
                this.fertilizers = this.transformFertilizersData({ fertilizers });
                this.verifyFertilizerData();
                this.logFertilizerSummary();
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
    private transformFertilizersData(fertilizersData: any): Fertilizer[] {
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
            return transformedFertilizer;
        });
    }
    private verifyFertilizerData(): void {
        const withNitrogen = this.fertilizers.filter(f => f.composition?.nitrogen && f.composition.nitrogen > 0);
        const withPhosphorus = this.fertilizers.filter(f => f.composition?.phosphorus && f.composition.phosphorus > 0);
        const withPotassium = this.fertilizers.filter(f => f.composition?.potassium && f.composition.potassium > 0);
        const withoutNutrients = this.fertilizers.filter(f =>
            (!f.composition?.nitrogen || f.composition.nitrogen === 0) &&
            (!f.composition?.phosphorus || f.composition.phosphorus === 0) &&
            (!f.composition?.potassium || f.composition.potassium === 0)
        );
        if (withoutNutrients.length > 0) {
            console.warn(`Fertilizers without primary nutrients (${withoutNutrients.length}):`,
                withoutNutrients.map(f => f.name));
        }
    }
    private logFertilizerSummary(): void {
        const summary = {
            total: this.fertilizers.length,
            withNitrogen: this.fertilizers.filter(f => f.composition?.nitrogen && f.composition.nitrogen > 0).length,
            withPhosphorus: this.fertilizers.filter(f => f.composition?.phosphorus && f.composition.phosphorus > 0).length,
            withPotassium: this.fertilizers.filter(f => f.composition?.potassium && f.composition.potassium > 0).length,
            withSecondaryNutrients: this.fertilizers.filter(f =>
                (f.composition?.calcium && f.composition.calcium > 0) ||
                (f.composition?.magnesium && f.composition.magnesium > 0) ||
                (f.composition?.sulfur && f.composition.sulfur > 0)
            ).length,
            active: this.fertilizers.filter(f => f.isActive).length
        };
    }








    private loadSavedRecipes(): void {
        this.apiService.get(this.ANALYTICAL_ENTITY_ENDPOINT).pipe(
            catchError(error => {
                console.error('Backend load failed, using localStorage:', error);
                return of({ success: false });
            })
        ).subscribe({
            next: (response: any) => {
                if (response) {
                    console.log('🔥 Loaded analytical entities from server:', response);
                    console.log('🔥 Response structure:', Object.keys(response));

                    // Try multiple possible paths to access the entities array
                    let entities: any[] = [];
                    if (response.result?.analiticalEntities) {
                        entities = response.result.analiticalEntities;
                    } else if (response.result?.analyticalEntities) {
                        entities = response.result.analyticalEntities;
                    } else if (response.analiticalEntities) {
                        entities = response.analiticalEntities;
                    } else if (response.analyticalEntities) {
                        entities = response.analyticalEntities;
                    } else if (Array.isArray(response.result)) {
                        entities = response.result;
                    } else if (Array.isArray(response)) {
                        entities = response;
                    } else {
                        console.error('Could not find entities array in response:', response);
                        entities = [];
                    }

                    console.log('🔥 Entities found:', entities.length);
                    console.log('🔥 First few entities:', entities.slice(0, 3));

                    // Filter for main recipe entries
                    const recipeSummaries = entities.filter((entity: any) =>
                        entity.script === 'NUTRIENT_RECIPE' && entity.active
                    );

                    console.log('🔥 Found recipe summaries:', recipeSummaries.length);
                    console.log('🔥 Recipe summaries:', recipeSummaries.map(r => r.name));

                    this.reconstructRecipes(entities, recipeSummaries);
                } else {
                    this.loadFromLocalStorage();
                }
            },
            error: () => {
                this.loadFromLocalStorage();
            }
        });
    }

    private reconstructRecipes(allEntities: any[], summaries: any[]): void {
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
                        console.warn('Could not parse basic data for recipe', recipeId);
                        // Use fallback values
                        recipe = this.parseCompactRecipeData(basicData.description, recipe);
                    }
                }

                // Add nutrient data if available  
                if (nutrientData) {
                    try {
                        const parsed = JSON.parse(nutrientData.description);
                        Object.assign(recipe, parsed);
                    } catch (e) {
                        console.warn('Could not parse nutrient data for recipe', recipeId);
                        // Use default values
                        recipe.targetNitrogen = 200;
                        recipe.targetPhosphorus = 50;
                        recipe.targetPotassium = 300;
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

    private extractRecipeNameFromSummary(description: string): string {
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



    private loadFormData(): void {
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

    private loadCatalogs(): Observable<Catalog[]> {
        // Use your existing catalog service or API service
        return this.catalogService?.getAll()
    }

    private loadWaterSources(): Observable<WaterChemistry[]> {
        return this.waterChemistryService.getAll();
    }

    private loadCropPhases(): Observable<CropPhase[]> {
        return this.apiService.get<CropPhase[]>('/CropPhase') || of([
            { id: 1, cropId: 1, catalogId: 1, name: 'Fase de Crecimiento', active: true }
        ]);
    }

    onSubmit(): void {
        if (this.calculationForm.valid) {
            this.performCalculation();
        } else {
            this.markFormGroupTouched();
        }
    }

    private performCalculation(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.showResults = false;

        const formData = this.calculationForm.value;

        // Build the API URL with query parameters
        const apiUrl = 'https://fertilizer-calculator-api.onrender.com/swagger-integrated-calculation';

        let params = new HttpParams()
            .set('user_id', formData.user_id.toString())
            .set('catalog_id', formData.catalog_id.toString())
            .set('phase_id', formData.phase_id.toString())
            .set('water_id', formData.water_id.toString())
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
            next: (response) => {
                this.isLoading = false;
                if (response) {
                    this.calculationResults = response;
                    this.processResults();
                    this.showResults = true;
                    this.successMessage = 'Cálculo completado exitosamente';

                    // Scroll to results
                    setTimeout(() => {
                        const resultsElement = document.getElementById('calculation-results');
                        if (resultsElement) {
                            resultsElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                }
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = `Error inesperado: ${error.message}`;
            }
        });
    }

    private processResults(): void {
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
            deviation: Math.abs(result.percentage_deviation),
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
    }

    private markFormGroupTouched(): void {
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
}