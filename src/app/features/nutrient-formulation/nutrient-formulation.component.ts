// src/app/features/nutrient-formulation/nutrient-formulation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Observable, of, catchError, tap, map } from 'rxjs';

// Services
import { WaterChemistryService, WaterChemistry } from '../water-chemistry/services/water-chemistry.service';
import { FertilizerService } from '../fertilizers/services/fertilizer.service';
import { CropService } from '../crops/services/crop.service';
import { ApiService } from '../../core/services/api.service';
import { CatalogService } from '../catalogs/services/catalog.service';
import { AuthService } from '../../core/auth/auth.service';

// Models
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
    // Additional properties from solution requirements
    targetCalcium?: number;
    targetMagnesium?: number;
    targetSulfur?: number;
    targetIron?: number;
}

interface Fertilizer {
    id: number;
    name: string;
    type: string;
    composition: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
        calcium?: number;
        magnesium?: number;
        sulfur?: number;
        [key: string]: number | undefined;
    };
    costPerUnit: number;
    unit: string;
    isOrganic: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface FertilizerChemistry {
    id: number;
    fertilizerId: number;
    purity: number;
    density: number;
    solubility0: number;
    solubility20: number;
    solubility40: number;
    formula: string;
    valence: number;
    isPhAdjuster: boolean;
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

@Component({
    selector: 'app-nutrient-formulation',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './nutrient-formulation.component.html',
    styleUrls: ['./nutrient-formulation.component.css']
})
export class NutrientFormulationComponent implements OnInit {
    // Form
    formulationForm: FormGroup;
    private readonly FERTILIZER_INPUT_ENDPOINT = '/FertilizerInput'; // Use for storing recipe data
    private readonly ANALYTICAL_ENTITY_ENDPOINT = '/AnalyticalEntity'; // Alternative storage

    // Data
    waterSources: WaterChemistry[] = [];
    fertilizers: Fertilizer[] = [];
    fertilizerChemistries: FertilizerChemistry[] = [];
    crops: Crop[] = [];
    cropPhases: CropPhase[] = [];
    cropPhaseSolutionRequirements: CropPhaseSolutionRequirement[] = [];

    // Current formulation
    currentRecipe: FormulationRecipe | null = null;
    formulationResults: any[] = [];

    // Real saved recipes (stored in localStorage as workaround)
    savedRecipes: FormulationRecipe[] = [];

    // UI State
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showAdvancedOptions = false;
    Message!: string;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private waterChemistryService: WaterChemistryService,
        private fertilizerService: FertilizerService,
        private cropService: CropService,
        private catalogService: CatalogService,
        private apiService: ApiService
    ) {
        this.formulationForm = this.createForm();
    }

    ngOnInit(): void {
        this.loadSavedRecipes();
        this.loadInitialData();
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
            // Advanced options
            maxBudgetPerLiter: [100],
            preferOrganic: [false],
            excludeFertilizers: [[]]
        });
    }

    private loadInitialData(): void {
        this.isLoading = true;
        this.errorMessage = '';

        // Load data from existing APIs
        const waterSources$ = this.waterChemistryService.getAll().pipe(
            map((data: any) => {
                // If data has waterChemistries property, return as is, else wrap in object
                if (data && Array.isArray(data.waterChemistries)) {
                    return data;
                } else if (Array.isArray(data)) {
                    // If the API returns an array directly, wrap it
                    return { waterChemistries: data };
                } else {
                    // Unexpected format, return empty array
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

                const filters = firstCatalogId ? { catalogId: firstCatalogId } : {};

                const fertilizers$ = this.fertilizerService.getAll(filters).pipe(
                    catchError(error => {
                        console.error('Error loading fertilizers:', error);
                        return of([]);
                    })
                );

                const crops$ = this.cropService.getAll().pipe(
                    catchError(error => {
                        console.error('Error loading crops:', error);
                        return of([]);
                    })
                );

                // Load crop phases using API
                const cropPhases$ = this.apiService.get('/CropPhase').pipe(
                    map(response => {
                        // If response is an object with cropPhases property, return that array
                        if (
                            response &&
                            typeof response === 'object' &&
                            'cropPhases' in response &&
                            Array.isArray((response as any).cropPhases)
                        ) {
                            this.cropPhases = (response as any).cropPhases || [];
                            return (response as any).cropPhases;
                        }
                        // If response is already an array, return as is
                        if (Array.isArray(response)) {
                            return response;
                        }
                        // Otherwise, return empty array
                        return [];
                    }),
                    catchError(error => {
                        console.error('Error loading crop phases:', error);
                        return of([]);
                    })
                );

                // Load fertilizer chemistry data
                const fertilizerChemistries$ = this.apiService.get('/FertilizerChemistry').pipe(
                    map(response => Array.isArray(response) ? response : []),
                    catchError(error => {
                        console.error('Error loading fertilizer chemistries:', error);
                        return of([]);
                    })
                );

                // Load crop phase solution requirements
                const solutionRequirements$ = this.loadCropPhaseSolutionRequirements().pipe(
                    catchError(error => {
                        console.error('Error loading solution requirements:', error);
                        return of([]);
                    })
                );

                // Use forkJoin to load all required data in parallel
                forkJoin({
                    waterSources: waterSources$,
                    fertilizers: fertilizers$,
                    crops: crops$,
                    cropPhases: cropPhases$,
                    fertilizerChemistries: fertilizerChemistries$,
                    solutionRequirements: solutionRequirements$
                }).subscribe({
                    next: (data) => {
                        // Process and store the data
                        this.waterSources = Array.isArray(data.waterSources.waterChemistries) ? data.waterSources.waterChemistries : [];
                        this.crops = Array.isArray(data.crops) ? data.crops : [];
                        this.cropPhases = Array.isArray(data.cropPhases) ? data.cropPhases : [];
                        this.fertilizerChemistries = Array.isArray(data.fertilizerChemistries) ? data.fertilizerChemistries : [];
                        this.cropPhaseSolutionRequirements = Array.isArray(data.solutionRequirements) ? data.solutionRequirements : [];

                        // Transform fertilizers data
                        this.fertilizers = this.transformFertilizersData(data.fertilizers);

                        this.isLoading = false;
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

    private loadCropPhaseSolutionRequirements(): Observable<CropPhaseSolutionRequirement[]> {
        // Try to load using the existing API endpoint structure
        // We'll make a request for each crop phase to get solution requirements
        return this.apiService.get('/CropPhase').pipe(
            map(phases => Array.isArray(phases) ? phases : []),
            map(phases => {
                // For now, return empty array since we don't have direct access
                // In a real scenario, we'd make individual calls for each phase
                // or implement a bulk endpoint
                return [];
            })
        );
    }

    private transformFertilizersData(fertilizersData: any): Fertilizer[] {
        if (!Array.isArray(fertilizersData.fertilizers)) {
            console.warn('Fertilizers data is not an array, using empty array');
            return [];
        }

        console.log('Transforming fertilizers data:', fertilizersData);

        return fertilizersData.fertilizers.map((f: any) => ({
            id: f.id || 0,
            name: f.name || 'Fertilizante sin nombre',
            type: f.type || 'unknown',
            composition: {
                nitrogen: f.composition?.nitrogen ?? f.nitrogen ?? 0,
                phosphorus: f.composition?.phosphorus ?? f.phosphorus ?? 0,
                potassium: f.composition?.potassium ?? f.potassium ?? 0,
                calcium: f.composition?.calcium ?? f.calcium,
                magnesium: f.composition?.magnesium ?? f.magnesium,
                sulfur: f.composition?.sulfur ?? f.sulfur
            },
            costPerUnit: f.costPerUnit ?? 0,
            unit: f.unit ?? 'kg',
            isOrganic: f.isOrganic ?? false,
            isActive: f.isActive ?? true,
            createdAt: f.createdAt ? new Date(f.createdAt) : undefined,
            updatedAt: f.updatedAt ? new Date(f.updatedAt) : undefined
        }));
    }

    onCropChange(): void {
        const cropId = this.formulationForm.get('cropId')?.value;
        if (cropId) {
            // Filter phases for selected crop
            const filteredPhases = this.cropPhases.filter(phase => phase.cropId === cropId);

            // Reset crop phase selection
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
        // Try to find existing solution requirements for this phase
        const requirement = this.cropPhaseSolutionRequirements.find(req => req.phaseId === phaseId);

        if (requirement) {
            // Update form with optimal values from database
            this.formulationForm.patchValue({
                targetPh: requirement.ec ? 6.5 : 6.5, // Default if not in requirement
                targetEc: requirement.ec || 1.5
            });
        }
    }

    private createRecipeFromForm(formValue: any, waterSource: WaterChemistry, crop: Crop, phase?: CropPhase): FormulationRecipe {
        // Find solution requirements for this phase
        const solutionReq = this.cropPhaseSolutionRequirements.find(req => req.phaseId === formValue.cropPhaseId);

        const recipeName = formValue.recipeName || `${crop.name}${phase ? ' - ' + phase.name : ''}`;

        return {
            name: recipeName,
            waterSourceId: formValue.waterSourceId,
            cropId: formValue.cropId,
            cropPhaseId: formValue.cropPhaseId,
            targetPh: formValue.targetPh,
            targetEc: formValue.targetEc,
            targetNitrogen: solutionReq?.no3 || 200,
            targetPhosphorus: solutionReq?.h2po4 || 50,
            targetPotassium: solutionReq?.k || 300,
            targetCalcium: solutionReq?.ca || 150,
            targetMagnesium: solutionReq?.mg || 50,
            targetSulfur: solutionReq?.so4 || 100,
            targetIron: solutionReq?.fe || 3,
            volumeLiters: formValue.volumeLiters,
            totalCost: 0, // Will be calculated
            fertilizers: [],
            createdAt: new Date()
        };
    }

    private calculateOptimalFertilizerMix(recipe: FormulationRecipe): RecipeFertilizer[] {
        // Simple heuristic algorithm to select fertilizers
        const selectedFertilizers: RecipeFertilizer[] = [];
        const availableFertilizers = this.fertilizers.filter(f => f.isActive);

        if (availableFertilizers.length === 0) {
            return [];
        }

        // Find best nitrogen source
        const nSources = availableFertilizers
            .filter(f => f.composition.nitrogen > 0)
            .sort((a, b) => b.composition.nitrogen - a.composition.nitrogen);

        // Find best phosphorus source
        const pSources = availableFertilizers
            .filter(f => f.composition.phosphorus > 0)
            .sort((a, b) => b.composition.phosphorus - a.composition.phosphorus);

        // Find best potassium source
        const kSources = availableFertilizers
            .filter(f => f.composition.potassium > 0)
            .sort((a, b) => b.composition.potassium - a.composition.potassium);

        // Select top fertilizers (simplified approach)
        const maxFertilizers = 3;
        const selectedIds = new Set<number>();

        // Add best N source
        if (nSources.length > 0 && selectedFertilizers.length < maxFertilizers) {
            const fert = nSources[0];
            const concentration = this.calculateConcentration(fert, recipe.targetNitrogen, 'nitrogen', recipe.volumeLiters);
            selectedFertilizers.push({
                fertilizerId: fert.id,
                fertilizer: fert,
                concentration: concentration,
                percentageOfN: 50,
                percentageOfP: 20,
                percentageOfK: 30,
                costPortion: concentration * fert.costPerUnit
            });
            selectedIds.add(fert.id);
        }

        // Add best P source (if different)
        if (pSources.length > 0 && selectedFertilizers.length < maxFertilizers) {
            const fert = pSources.find(f => !selectedIds.has(f.id)) || pSources[0];
            const concentration = this.calculateConcentration(fert, recipe.targetPhosphorus, 'phosphorus', recipe.volumeLiters);
            selectedFertilizers.push({
                fertilizerId: fert.id,
                fertilizer: fert,
                concentration: concentration,
                percentageOfN: 20,
                percentageOfP: 60,
                percentageOfK: 20,
                costPortion: concentration * fert.costPerUnit
            });
            selectedIds.add(fert.id);
        }

        // Add best K source (if different)
        if (kSources.length > 0 && selectedFertilizers.length < maxFertilizers) {
            const fert = kSources.find(f => !selectedIds.has(f.id)) || kSources[0];
            const concentration = this.calculateConcentration(fert, recipe.targetPotassium, 'potassium', recipe.volumeLiters);
            selectedFertilizers.push({
                fertilizerId: fert.id,
                fertilizer: fert,
                concentration: concentration,
                percentageOfN: 30,
                percentageOfP: 10,
                percentageOfK: 60,
                costPortion: concentration * fert.costPerUnit
            });
        }

        // Calculate total cost
        recipe.totalCost = selectedFertilizers.reduce((sum, fert) => sum + fert.costPortion, 0);

        return selectedFertilizers;
    }

    private calculateConcentration(fertilizer: Fertilizer, targetPpm: number, nutrient: keyof typeof fertilizer.composition, volumeLiters: number): number {
        const nutrientPercentage = fertilizer.composition[nutrient] || 0;
        if (nutrientPercentage === 0) return 0;

        // Simplified calculation: target ppm to grams per liter
        const targetGramsPerLiter = targetPpm / 1000;
        const requiredFertilizerGramsPerLiter = (targetGramsPerLiter * 100) / nutrientPercentage;

        return Math.round(requiredFertilizerGramsPerLiter * 100) / 100; // Round to 2 decimals
    }

    private generateFormulationResults(recipe: FormulationRecipe): any[] {
        // Calculate achieved values based on selected fertilizers
        let achievedN = 0, achievedP = 0, achievedK = 0;

        recipe.fertilizers.forEach(rf => {
            if (rf.fertilizer) {
                achievedN += (rf.concentration * rf.fertilizer.composition.nitrogen) / 100 * 10; // Convert to ppm
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
                achieved: recipe.targetPh, // Simplified - would need complex calculation
                unit: '',
                difference: 0,
                status: 'optimal'
            },
            {
                parameter: 'EC',
                target: recipe.targetEc,
                achieved: recipe.targetEc, // Simplified - would need complex calculation
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

        // Regenerate results for loaded recipe
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

    resetForm(): void {
        this.formulationForm.reset();
        this.currentRecipe = null;
        this.formulationResults = [];
        this.errorMessage = '';
        this.Message = '';

        // Reset to default values
        this.formulationForm.patchValue({
            recipeName: 'Nueva Receta',
            volumeLiters: 1000,
            targetPh: 6.5,
            targetEc: 1.5,
            maxBudgetPerLiter: 100,
            preferOrganic: false,
            excludeFertilizers: []
        });
    }

    navigateBack(): void {
        this.router.navigate(['/dashboard']);
    }

    // Utility methods
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

        // Convert to number to ensure type compatibility
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

    /**
     * Enhanced calculation using real fertilizer chemistry data
     */
    private calculateWithRealData(
        formValue: any,
        waterSource: WaterChemistry,
        crop: Crop,
        phase?: CropPhase
    ): void {
        // Create recipe from form data and database values
        this.currentRecipe = this.createRecipeFromForm(formValue, waterSource, crop, phase);

        // Enhanced fertilizer mix calculation using chemistry data
        this.currentRecipe.fertilizers = this.calculateEnhancedFertilizerMix(this.currentRecipe);

        // Generate formulation results with real calculations
        this.formulationResults = this.generateEnhancedFormulationResults(this.currentRecipe, waterSource);
        this.saveRecipe();
        this.isLoading = false;
        this.Message = 'Formulación calculada exitosamente con datos reales';
    }

    /**
     * Enhanced fertilizer mix calculation using real chemistry data
     */
    private calculateEnhancedFertilizerMix(recipe: FormulationRecipe): RecipeFertilizer[] {
        const selectedFertilizers: RecipeFertilizer[] = [];
        const availableFertilizers = this.fertilizers.filter(f => f.isActive);

        if (availableFertilizers.length === 0) {
            return [];
        }

        // Get chemistry data for better calculations
        const fertilizersWithChemistry = availableFertilizers.map(fert => {
            const chemistry = this.fertilizerChemistries.find(c => c.fertilizerId === fert.id);
            return { ...fert, chemistry };
        });

        // Enhanced nutrient targeting
        const targets = {
            nitrogen: recipe.targetNitrogen,
            phosphorus: recipe.targetPhosphorus,
            potassium: recipe.targetPotassium,
            calcium: recipe.targetCalcium || 150,
            magnesium: recipe.targetMagnesium || 50
        };

        // Improved fertilizer selection algorithm
        const optimalFertilizers = this.selectOptimalFertilizers(fertilizersWithChemistry, targets, recipe.volumeLiters);

        // Convert to RecipeFertilizer format
        optimalFertilizers.forEach(fert => {
            const costPortion = (fert.concentration * recipe.volumeLiters * fert.costPerUnit) / 1000;

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

        // Calculate total cost
        recipe.totalCost = selectedFertilizers.reduce((sum, fert) => sum + fert.costPortion, 0);

        return selectedFertilizers;
    }

    /**
     * Select optimal fertilizers using enhanced algorithm
     */
    private selectOptimalFertilizers(fertilizers: any[], targets: any, volumeLiters: number): any[] {
        const selected: any[] = [];
        const remaining = { ...targets };
        const maxFertilizers = 4;

        // Score and sort fertilizers by efficiency
        const scored = fertilizers.map(fert => ({
            ...fert,
            score: this.calculateFertilizerScore(fert, targets),
            maxSolubility: fert.chemistry?.solubility20 || 500
        })).sort((a, b) => b.score - a.score);

        for (const fertilizer of scored) {
            if (selected.length >= maxFertilizers) break;

            const concentration = this.calculateOptimalConcentration(fertilizer, remaining, volumeLiters);

            if (concentration > 0 && concentration <= fertilizer.maxSolubility * 0.8) {
                fertilizer.concentration = concentration;
                selected.push(fertilizer);

                // Update remaining targets
                this.updateRemainingTargets(remaining, fertilizer, concentration, volumeLiters);

                // Stop if targets are mostly met
                if (this.targetsAreSufficient(remaining, targets)) break;
            }
        }

        return selected;
    }

    /**
     * Calculate fertilizer efficiency score
     */
    private calculateFertilizerScore(fertilizer: any, targets: any): number {
        const comp = fertilizer.composition;
        let score = 0;

        // Nutrient density score
        if (targets.nitrogen > 0 && comp.nitrogen > 0) {
            score += (comp.nitrogen / targets.nitrogen) * 40;
        }
        if (targets.phosphorus > 0 && comp.phosphorus > 0) {
            score += (comp.phosphorus / targets.phosphorus) * 30;
        }
        if (targets.potassium > 0 && comp.potassium > 0) {
            score += (comp.potassium / targets.potassium) * 30;
        }

        // Cost efficiency (lower cost = higher score)
        const costScore = Math.max(0, 10 - fertilizer.costPerUnit) * 5;
        score += costScore;

        // Chemistry bonus (high purity, good solubility)
        if (fertilizer.chemistry) {
            const purityBonus = (fertilizer.chemistry.purity || 90) / 10;
            const solubilityBonus = Math.min((fertilizer.chemistry.solubility20 || 200) / 100, 5);
            score += purityBonus + solubilityBonus;
        }

        return score;
    }

    /**
     * Calculate optimal concentration for fertilizer
     */
    private calculateOptimalConcentration(fertilizer: any, targets: any, volumeLiters: number): number {
        const comp = fertilizer.composition;
        const concentrations: number[] = [];

        // Calculate needed concentrations for each nutrient
        if (targets.nitrogen > 0 && comp.nitrogen > 0) {
            const needed = (targets.nitrogen * volumeLiters) / 1000;
            concentrations.push((needed * 100) / comp.nitrogen);
        }
        if (targets.phosphorus > 0 && comp.phosphorus > 0) {
            const needed = (targets.phosphorus * volumeLiters) / 1000;
            concentrations.push((needed * 100) / comp.phosphorus);
        }
        if (targets.potassium > 0 && comp.potassium > 0) {
            const needed = (targets.potassium * volumeLiters) / 1000;
            concentrations.push((needed * 100) / comp.potassium);
        }

        if (concentrations.length === 0) return 0;

        // Use conservative approach - take minimum to avoid over-fertilization
        return Math.min(...concentrations) * 0.7; // 70% of theoretical max for safety
    }

    /**
     * Update remaining nutrient targets
     */
    private updateRemainingTargets(remaining: any, fertilizer: any, concentration: number, volumeLiters: number): void {
        const comp = fertilizer.composition;
        const factor = (concentration * volumeLiters) / 100000; // Conversion factor

        remaining.nitrogen = Math.max(0, remaining.nitrogen - (comp.nitrogen * factor));
        remaining.phosphorus = Math.max(0, remaining.phosphorus - (comp.phosphorus * factor));
        remaining.potassium = Math.max(0, remaining.potassium - (comp.potassium * factor));
        remaining.calcium = Math.max(0, remaining.calcium - ((comp.calcium || 0) * factor));
        remaining.magnesium = Math.max(0, remaining.magnesium - ((comp.magnesium || 0) * factor));
    }

    /**
     * Check if targets are sufficiently met
     */
    private targetsAreSufficient(remaining: any, original: any): boolean {
        const threshold = 0.15; // 85% fulfillment

        const nMet = (original.nitrogen - remaining.nitrogen) / original.nitrogen >= (1 - threshold);
        const pMet = (original.phosphorus - remaining.phosphorus) / original.phosphorus >= (1 - threshold);
        const kMet = (original.potassium - remaining.potassium) / original.potassium >= (1 - threshold);

        return nMet && pMet && kMet;
    }

    /**
     * Calculate nutrient contribution percentage
     */
    private calculateNutrientContribution(fertilizer: any, nutrient: string, target: number): number {
        const composition = fertilizer.composition[nutrient] || 0;
        const concentration = fertilizer.concentration || 0;

        if (target === 0) return 0;

        const contribution = (composition * concentration) / 1000; // Simplified calculation
        return Math.min(100, Math.round((contribution / target) * 10000) / 100);
    }

    /**
     * Enhanced formulation results with real calculations
     */
    private generateEnhancedFormulationResults(recipe: FormulationRecipe, waterSource: WaterChemistry): any[] {
        // Calculate achieved values based on selected fertilizers and water source
        let achievedN = waterSource.no3 || 0;
        let achievedP = waterSource.h2po4 || 0;
        let achievedK = waterSource.k || 0;
        let achievedCa = waterSource.ca || 0;
        let achievedMg = waterSource.mg || 0;

        // Add contributions from fertilizers
        recipe.fertilizers.forEach(rf => {
            if (rf.fertilizer && rf.concentration > 0) {
                const factor = rf.concentration / 10; // Simplified conversion to ppm
                achievedN += (rf.fertilizer.composition.nitrogen || 0) * factor;
                achievedP += (rf.fertilizer.composition.phosphorus || 0) * factor;
                achievedK += (rf.fertilizer.composition.potassium || 0) * factor;
                achievedCa += (rf.fertilizer.composition.calcium || 0) * factor;
                achievedMg += (rf.fertilizer.composition.magnesium || 0) * factor;
            }
        });

        // Estimate pH and EC
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

    /**
     * Estimate pH from water source and fertilizers
     */
    private estimatePh(waterSource: WaterChemistry, fertilizers: RecipeFertilizer[]): number {
        let estimatedPh = waterSource.ph || 7.0;

        fertilizers.forEach(rf => {
            const chemistry = this.fertilizerChemistries.find(c => c.fertilizerId === rf.fertilizerId);
            if (chemistry && chemistry.isPhAdjuster) {
                const effect = chemistry.valence < 0 ? -0.1 : 0.1;
                const strength = (rf.concentration / 100) * Math.abs(chemistry.valence);
                estimatedPh += effect * strength;
            }
        });

        return Math.max(5.5, Math.min(8.5, Math.round(estimatedPh * 10) / 10));
    }

    /**
     * Estimate EC from water source and fertilizers
     */
    private estimateEc(waterSource: WaterChemistry, fertilizers: RecipeFertilizer[]): number {
        let estimatedEc = waterSource.ec || 0.3;

        fertilizers.forEach(rf => {
            // Each g/L of fertilizer adds approximately 0.001-0.002 dS/m to EC
            const ecContribution = rf.concentration * 0.0015;
            estimatedEc += ecContribution;
        });

        return Math.round(estimatedEc * 100) / 100;
    }

    /**
     * Get status based on tolerance
     */
    private getStatus(achieved: number, target: number, tolerance: number): string {
        const difference = Math.abs(achieved - target);
        if (difference <= tolerance * 0.5) return 'optimal';
        if (difference <= tolerance) return 'acceptable';
        return 'critical';
    }


    saveToLocalStorage(): void {
        try {
            // Assign a high ID to indicate local storage
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

                console.log('Loaded recipes from localStorage:', this.savedRecipes.length);
            } else {
                this.savedRecipes = [];
                console.log('No recipes found in localStorage');
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




    /**
     * Save recipe using compact storage or multiple records
     */
    saveRecipe(): void {
        console.log('Saving recipe:', this.currentRecipe);
        if (!this.currentRecipe) return;

        this.isLoading = true;
        this.errorMessage = '';

        const currentUser = this.authService.getCurrentUser();
        const catalogId = currentUser?.catalogId || 1;

        // Create a compact summary record first
        const recipeSummary = {
            catalogId: catalogId,
            name: `RECIPE_${this.currentRecipe.name}`,
            description: `Recipe:${this.currentRecipe.name}|Cost:${this.currentRecipe.totalCost}`, // Compact info
            script: 'NUTRIENT_RECIPE',
            entityType: 998, // Recipe summary type
            active: true
        };

        // Save the summary first
        this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, recipeSummary).pipe(
            catchError(error => {
                console.error('Failed to save recipe summary, using localStorage:', error);
                return of({ success: false });
            })
        ).subscribe({
            next: (summaryResponse:any ) => {
                console.log('Recipe summary saved:', summaryResponse);
                if (summaryResponse) {
                    const recipeId = summaryResponse.id || Date.now();
                    this.currentRecipe!.id = recipeId;

                    // Now save detailed data as separate chunks
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

    /**
     * Save recipe details in chunks to avoid size limit
     */
    private saveRecipeDetails(recipeId: number, catalogId: number): void {
        if (!this.currentRecipe) return;

        // Split recipe into manageable chunks
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

        // Create detail records
        const basicDataRecord = {
            catalogId: catalogId,
            name: `RECIPE_DATA_${recipeId}`,
            description: JSON.stringify(basicData).substring(0, 120), // Ensure it fits
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

        // Save basic data
        this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, basicDataRecord).pipe(
            catchError(() => of({ success: false }))
        ).subscribe({
            next: (basicResponse:any ) => {
                console.log('Basic recipe data saved:', basicResponse);
                if (basicResponse) {
                    // Save nutrient data
                    this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, nutrientDataRecord).subscribe({
                        next: (nutrientResponse) => {
                            console.log('Nutrient recipe data saved:', nutrientResponse);
                            if (nutrientResponse && nutrientResponse) {
                                // Save fertilizer data
                                this.saveRecipeFertilizers(recipeId, catalogId);
                            } else {
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

    /**
     * Save fertilizer data for recipe
     */
    private saveRecipeFertilizers(recipeId: number, catalogId: number): void {
        if (!this.currentRecipe || !this.currentRecipe.fertilizers.length) {
            console.error('No fertilizers to save for recipe', this.currentRecipe);
            return;
        }

        // Save each fertilizer as a separate record
        const fertilizerPromises = this.currentRecipe.fertilizers.map((fert, index) => {
            const fertRecord = {
                catalogId: catalogId,
                name: `RECIPE_FERT_${recipeId}_${index}`,
                description: `F:${fert.fertilizerId}|C:${fert.concentration}|N:${fert.percentageOfN}|P:${fert.percentageOfP}|K:${fert.percentageOfK}|$:${fert.costPortion}`,
                script: 'RECIPE_FERTILIZER',
                entityType: 999,
                active: true
            };

            return this.apiService.post(this.ANALYTICAL_ENTITY_ENDPOINT, fertRecord).pipe(
                catchError((error) => {
                    console.error('Failed to save fertilizer data', error);
                    return of({ success: false });
                })
            ).toPromise();
        });

        Promise.all(fertilizerPromises).then(() => {
            this.handleSaveComplete('Receta guardada exitosamente en el servidor');
        });
    }

    /**
     * Handle save completion
     */
    private handleSaveComplete(message: string): void {
        this.Message = message;
        this.isLoading = false;
        this.loadSavedRecipes(); // Refresh the list
    }

    /**
     * Load saved recipes from multiple AnalyticalEntity records
     */
    private loadSavedRecipes(): void {
        this.apiService.get(this.ANALYTICAL_ENTITY_ENDPOINT).pipe(
            catchError(error => {
                console.warn('Backend load failed, using localStorage:', error);
                return of({ success: false });
            })
        ).subscribe({
            next: (response:any ) => {
                if (response && response) {
                    const entities = response.result?.analyticalEntities || response.result || [];

                    // Get recipe summaries
                    const recipeSummaries = entities.filter((entity: any) =>
                        entity.script === 'NUTRIENT_RECIPE' && entity.active
                    );

                    // Reconstruct recipes from multiple records
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

    /**
     * Reconstruct recipes from multiple AnalyticalEntity records
     */
    private reconstructRecipes(allEntities: any[], summaries: any[]): void {
        this.savedRecipes = [];

        summaries.forEach(summary => {
            try {
                const recipeId = summary.id;

                // Find related records
                const basicData = allEntities.find(e => e.script === 'RECIPE_BASIC' && e.name === `RECIPE_DATA_${recipeId}`);
                const nutrientData = allEntities.find(e => e.script === 'RECIPE_NUTRIENTS' && e.name === `RECIPE_NUTRIENTS_${recipeId}`);
                const fertilizerRecords = allEntities.filter(e => e.script === 'RECIPE_FERTILIZER' && e.name.startsWith(`RECIPE_FERT_${recipeId}_`));

                // Parse basic data
                let recipe: any = {
                    id: recipeId,
                    name: this.extractRecipeNameFromSummary(summary.description),
                    fertilizers: [],
                    createdAt: new Date(summary.dateCreated)
                };

                if (basicData) {
                    try {
                        const parsed = JSON.parse(basicData.description);
                        Object.assign(recipe, parsed);
                    } catch (e) {
                        // Fallback parsing from description
                        recipe = this.parseCompactRecipeData(basicData.description, recipe);
                    }
                }

                if (nutrientData) {
                    try {
                        const parsed = JSON.parse(nutrientData.description);
                        Object.assign(recipe, parsed);
                    } catch (e) {
                        // Set defaults
                        recipe.targetNitrogen = 200;
                        recipe.targetPhosphorus = 50;
                        recipe.targetPotassium = 300;
                    }
                }

                // Parse fertilizer data
                fertilizerRecords.forEach(fertRecord => {
                    const fertilizer = this.parseFertilizerRecord(fertRecord.description);
                    if (fertilizer) {
                        recipe.fertilizers.push(fertilizer);
                    }
                });

                // Set defaults for missing values
                recipe.targetPh = recipe.targetPh || 6.5;
                recipe.targetEc = recipe.targetEc || 1.5;
                recipe.volumeLiters = recipe.volumeLiters || 1000;
                recipe.totalCost = recipe.totalCost || 0;

                this.savedRecipes.push(recipe);
            } catch (error) {
                console.error('Error reconstructing recipe:', error);
            }
        });

        console.log('Reconstructed recipes from backend:', this.savedRecipes.length);
    }

    /**
     * Extract recipe name from summary description
     */
    private extractRecipeNameFromSummary(description: string): string {
        const match = description.match(/Recipe:([^|]+)/);
        return match ? match[1] : 'Receta sin nombre';
    }

    /**
     * Parse compact recipe data when JSON parsing fails
     */
    private parseCompactRecipeData(description: string, baseRecipe: any): any {
        // This is a fallback parser for when JSON is truncated
        // Extract what we can from the description string
        return {
            ...baseRecipe,
            targetPh: 6.5,
            targetEc: 1.5,
            volumeLiters: 1000,
            totalCost: 0
        };
    }

    /**
     * Parse fertilizer record from compact description
     */
    private parseFertilizerRecord(description: string): any | null {
        try {
            // Parse format: "F:1|C:2.5|N:50|P:20|K:30|$:25.50"
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
                costPortion: parseFloat(data['$'] || '0')
            };
        } catch (error) {
            console.error('Error parsing fertilizer record:', error);
            return null;
        }
    }

    /**
     * Delete recipe and all related records
     */
    deleteRecipe(recipe: FormulationRecipe): void {
        if (!confirm(`¿Está seguro de que desea eliminar la receta "${recipe.name}"?`)) {
            return;
        }

        if (!recipe.id) {
            this.errorMessage = 'No se puede eliminar una receta sin ID';
            return;
        }

        this.isLoading = true;

        // If ID is high, it's localStorage
        if (recipe.id > 1000000) {
            this.deleteFromLocalStorage(recipe.id);
            return;
        }

        // Delete from backend - we need to delete all related records
        this.deleteRecipeFromBackend(recipe.id);
    }

    /**
     * Delete recipe from backend (all related records)
     */
    private deleteRecipeFromBackend(recipeId: number): void {
        // First get all related records
        this.apiService.get(this.ANALYTICAL_ENTITY_ENDPOINT).pipe(
            catchError(() => of({ success: false }))
        ).subscribe({
            next: (response:any ) => {
                if (response && response) {
                    const entities = response.result?.analyticalEntities || response.result || [];

                    // Find all records related to this recipe
                    const relatedRecords = entities.filter((entity: any) =>
                        entity.id === recipeId || // Main summary
                        entity.name === `RECIPE_DATA_${recipeId}` ||
                        entity.name === `RECIPE_NUTRIENTS_${recipeId}` ||
                        entity.name.startsWith(`RECIPE_FERT_${recipeId}_`)
                    );

                    // Delete each related record
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

    // Add these methods to your NutrientFormulationComponent class

// 1. Add debugging method to understand what's happening
private debugFertilizerData(): void {
    console.log('=== FERTILIZER DEBUG INFO ===');
    console.log('Total fertilizers loaded:', this.fertilizers);
    console.log('Active fertilizers:', this.fertilizers.filter(f => f.isActive).length);
    console.log('Fertilizer chemistry data:', this.fertilizerChemistries.length);
    
    // Log sample fertilizer data
    if (this.fertilizers.length > 0) {
        console.log('First fertilizer sample:', this.fertilizers[0]);
        console.log('Active fertilizers sample:', this.fertilizers.filter(f => f.isActive).slice(0, 3));
    }
    
    // Check for composition data
    const fertilizersWithNutrients = this.fertilizers.filter(f => 
        f.composition && (f.composition.nitrogen > 0 || f.composition.phosphorus > 0 || f.composition.potassium > 0)
    );
    console.log('Fertilizers with nutrient data:', fertilizersWithNutrients.length);
}

// 2. Add method to properly convert form values
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

// 3. Replace your calculateFormulation method with this fixed version
calculateFormulation(): void {
    if (this.formulationForm.invalid) {
        const invalidFields = Object.keys(this.formulationForm.controls).filter(key => this.formulationForm.get(key)?.invalid);
        console.warn('Formulario inválido, campos faltantes o incorrectos:', invalidFields);
        this.errorMessage = 'Por favor complete todos los campos requeridos';
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Sanitize form values to ensure proper types
    const formValue = this.sanitizeFormValues(this.formulationForm.value);
    console.log('Sanitized form values:', formValue);

    const selectedWaterSource = this.waterSources.find(w => w.id === formValue.waterSourceId);
    const selectedCrop = this.crops.find(c => c.id === formValue.cropId);
    const selectedPhase = formValue.cropPhaseId ? this.cropPhases.find(p => p.id === formValue.cropPhaseId) : undefined;

    if (!selectedWaterSource || !selectedCrop) {
        console.error('Selected water source or crop not found: ', formValue);
        this.errorMessage = 'Error: Datos de fuente de agua o cultivo no encontrados';
        this.isLoading = false;
        return;
    }

    console.log('Found data:', {
        waterSource: selectedWaterSource.name,
        crop: selectedCrop.name,
        phase: selectedPhase?.name || 'No phase selected'
    });

    // Use enhanced calculation with real fertilizer chemistry data
    this.calculateWithRealDataFixed(formValue, selectedWaterSource, selectedCrop, selectedPhase);
}

// 4. Replace calculateWithRealData method with this fixed version
private calculateWithRealDataFixed(
    formValue: any,
    waterSource: WaterChemistry,
    crop: Crop,
    phase?: CropPhase
): void {
    console.log('=== Starting calculateWithRealDataFixed ===');
    
    // Debug fertilizer data
    this.debugFertilizerData();
    
    // Create recipe from form data and database values
    this.currentRecipe = this.createRecipeFromForm(formValue, waterSource, crop, phase);
    console.log('Created recipe:', this.currentRecipe);

    // Enhanced fertilizer mix calculation using chemistry data
    this.currentRecipe.fertilizers = this.calculateEnhancedFertilizerMixFixed(this.currentRecipe);
    console.log('Recipe after fertilizer calculation:', this.currentRecipe);

    // Generate formulation results with real calculations
    this.formulationResults = this.generateEnhancedFormulationResults(this.currentRecipe, waterSource);
    
    this.saveRecipe();
    this.isLoading = false;
    this.Message = `Formulación calculada exitosamente. Fertilizantes seleccionados: ${this.currentRecipe.fertilizers.length}`;
}

// 5. Replace calculateEnhancedFertilizerMix with this fixed version
private calculateEnhancedFertilizerMixFixed(recipe: FormulationRecipe): RecipeFertilizer[] {
    console.log('Starting calculateEnhancedFertilizerMixFixed with recipe:', recipe);
    
    const selectedFertilizers: RecipeFertilizer[] = [];
    const availableFertilizers = this.fertilizers.filter(f => f.isActive);

    console.log('Available fertilizers count:', availableFertilizers.length);
    console.log('First few fertilizers:', availableFertilizers.slice(0, 3));

    if (availableFertilizers.length === 0) {
        console.warn('No active fertilizers available');
        
        // Fallback: try using all fertilizers if none are marked as active
        const allFertilizers = this.fertilizers.filter(f => 
            f.composition && (f.composition.nitrogen > 0 || f.composition.phosphorus > 0 || f.composition.potassium > 0)
        );
        
        if (allFertilizers.length > 0) {
            console.log('Using all fertilizers as fallback:', allFertilizers.length);
            return this.calculateSimpleFertilizerMix(recipe, allFertilizers);
        }
        
        return [];
    }

    // Get chemistry data for better calculations
    const fertilizersWithChemistry = availableFertilizers.map(fert => {
        const chemistry = this.fertilizerChemistries.find(c => c.fertilizerId === fert.id);
        return { ...fert, chemistry };
    });

    console.log('Fertilizers with chemistry:', fertilizersWithChemistry.length);

    // Enhanced nutrient targeting with proper number conversion
    const targets = {
        nitrogen: Number(recipe.targetNitrogen) || 200,
        phosphorus: Number(recipe.targetPhosphorus) || 50,
        potassium: Number(recipe.targetPotassium) || 300,
        calcium: Number(recipe.targetCalcium) || 150,
        magnesium: Number(recipe.targetMagnesium) || 50
    };

    console.log('Nutrient targets:', targets);

    // Improved fertilizer selection algorithm
    const optimalFertilizers = this.selectOptimalFertilizersFixed(fertilizersWithChemistry, targets, Number(recipe.volumeLiters));

    console.log('Selected optimal fertilizers:', optimalFertilizers);

    // Convert to RecipeFertilizer format
    optimalFertilizers.forEach(fert => {
        const volumeLiters = Number(recipe.volumeLiters) || 1000;
        const costPortion = (fert.concentration * volumeLiters * fert.costPerUnit) / 1000;

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

    // Calculate total cost
    recipe.totalCost = selectedFertilizers.reduce((sum, fert) => sum + fert.costPortion, 0);

    console.log('Final selected fertilizers for recipe:', selectedFertilizers);
    return selectedFertilizers;
}

// 6. Add simple fallback fertilizer mix calculation
private calculateSimpleFertilizerMix(recipe: FormulationRecipe, fertilizers: Fertilizer[]): RecipeFertilizer[] {
    console.log('Using simple fertilizer mix calculation as fallback');
    
    const selectedFertilizers: RecipeFertilizer[] = [];
    const targets = {
        nitrogen: Number(recipe.targetNitrogen) || 200,
        phosphorus: Number(recipe.targetPhosphorus) || 50,
        potassium: Number(recipe.targetPotassium) || 300
    };
    
    // Find best fertilizers for each nutrient
    const nSource = fertilizers
        .filter(f => f.composition.nitrogen > 0)
        .sort((a, b) => b.composition.nitrogen - a.composition.nitrogen)[0];
        
    const pSource = fertilizers
        .filter(f => f.composition.phosphorus > 0)
        .sort((a, b) => b.composition.phosphorus - a.composition.phosphorus)[0];
        
    const kSource = fertilizers
        .filter(f => f.composition.potassium > 0)
        .sort((a, b) => b.composition.potassium - a.composition.potassium)[0];

    // Add fertilizers if found
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
                costPortion: concentration * nSource.costPerUnit * volumeLiters / 1000
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
                costPortion: concentration * pSource.costPerUnit * volumeLiters / 1000
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
                costPortion: concentration * kSource.costPerUnit * volumeLiters / 1000
            });
        }
    }
    
    // Calculate total cost
    recipe.totalCost = selectedFertilizers.reduce((sum, fert) => sum + fert.costPortion, 0);
    
    console.log('Simple mix result:', selectedFertilizers);
    return selectedFertilizers;
}

// 7. Add simple concentration calculation
private calculateSimpleConcentration(fertilizer: Fertilizer, targetPpm: number, nutrient: keyof typeof fertilizer.composition, volumeLiters: number): number {
    const nutrientPercentage = fertilizer.composition[nutrient] || 0;
    if (nutrientPercentage === 0) return 0;

    // Simple calculation: (target ppm * volume L) / (nutrient % * 10)
    const concentration = (targetPpm * volumeLiters) / (nutrientPercentage * 10);
    return Math.max(0, Math.min(5, concentration)); // Cap at 5 g/L for safety
}

// 8. Improved selectOptimalFertilizers method
private selectOptimalFertilizersFixed(fertilizers: any[], targets: any, volumeLiters: number): any[] {
    console.log('selectOptimalFertilizersFixed called with:', {
        fertilizersCount: fertilizers.length,
        targets,
        volumeLiters
    });

    if (fertilizers.length === 0) {
        console.warn('No fertilizers provided to selectOptimalFertilizersFixed');
        return [];
    }

    const selected: any[] = [];
    const remaining = { ...targets };
    const maxFertilizers = 4;

    // Score and sort fertilizers by efficiency
    const scored = fertilizers.map(fert => {
        const score = this.calculateFertilizerScoreFixed(fert, targets);
        const maxSolubility = fert.chemistry?.solubility20 || 500;
        
        console.log(`Fertilizer ${fert.name} scored: ${score}`);
        
        return {
            ...fert,
            score: score,
            maxSolubility: maxSolubility
        };
    }).sort((a, b) => b.score - a.score);

    console.log('Top scored fertilizers:', scored.slice(0, 3).map(f => ({ name: f.name, score: f.score })));

    for (const fertilizer of scored) {
        if (selected.length >= maxFertilizers) break;

        const concentration = this.calculateOptimalConcentrationFixed(fertilizer, remaining, volumeLiters);
        console.log(`Calculated concentration for ${fertilizer.name}: ${concentration}`);

        if (concentration > 0 && concentration <= fertilizer.maxSolubility * 0.8) {
            fertilizer.concentration = concentration;
            selected.push(fertilizer);

            console.log(`Selected fertilizer: ${fertilizer.name} at ${concentration} g/L`);

            // Update remaining targets
            this.updateRemainingTargetsFixed(remaining, fertilizer, concentration, volumeLiters);

            // Stop if targets are mostly met
            if (this.targetsAreSufficientFixed(remaining, targets)) {
                console.log('Targets sufficiently met, stopping selection');
                break;
            }
        } else {
            console.log(`Skipped fertilizer ${fertilizer.name}: concentration ${concentration} exceeds limits`);
        }
    }

    console.log(`Final selection: ${selected.length} fertilizers`);
    return selected;
}

// 9. Fixed fertilizer scoring
private calculateFertilizerScoreFixed(fertilizer: any, targets: any): number {
    const comp = fertilizer.composition;
    let score = 0;

    // Nutrient density score
    if (targets.nitrogen > 0 && comp.nitrogen > 0) {
        score += Math.min(40, (comp.nitrogen / 50) * 40); // Cap score contribution
    }
    if (targets.phosphorus > 0 && comp.phosphorus > 0) {
        score += Math.min(30, (comp.phosphorus / 20) * 30);
    }
    if (targets.potassium > 0 && comp.potassium > 0) {
        score += Math.min(30, (comp.potassium / 50) * 30);
    }

    // Cost efficiency (lower cost = higher score)
    const costScore = Math.max(0, 20 - fertilizer.costPerUnit);
    score += costScore;

    // Chemistry bonus (high purity, good solubility)
    if (fertilizer.chemistry) {
        const purityBonus = (fertilizer.chemistry.purity || 90) / 10;
        const solubilityBonus = Math.min((fertilizer.chemistry.solubility20 || 200) / 100, 5);
        score += purityBonus + solubilityBonus;
    }

    return score;
}

// 10. Fixed optimal concentration calculation
private calculateOptimalConcentrationFixed(fertilizer: any, targets: any, volumeLiters: number): number {
    const comp = fertilizer.composition;
    const concentrations: number[] = [];

    console.log(`Calculating concentration for ${fertilizer.name}:`, {
        composition: comp,
        targets,
        volumeLiters
    });

    // Calculate needed concentrations for each nutrient (improved formula)
    if (targets.nitrogen > 0 && comp.nitrogen > 0) {
        // Formula: (target_ppm * volume_L) / (nutrient_percentage * 10)
        const needed = (targets.nitrogen * volumeLiters) / (comp.nitrogen * 10);
        concentrations.push(needed / 1000); // Convert to g/L
        console.log(`  Nitrogen concentration needed: ${needed / 1000} g/L`);
    }
    if (targets.phosphorus > 0 && comp.phosphorus > 0) {
        const needed = (targets.phosphorus * volumeLiters) / (comp.phosphorus * 10);
        concentrations.push(needed / 1000);
        console.log(`  Phosphorus concentration needed: ${needed / 1000} g/L`);
    }
    if (targets.potassium > 0 && comp.potassium > 0) {
        const needed = (targets.potassium * volumeLiters) / (comp.potassium * 10);
        concentrations.push(needed / 1000);
        console.log(`  Potassium concentration needed: ${needed / 1000} g/L`);
    }

    if (concentrations.length === 0) {
        console.log(`  No valid concentrations calculated for ${fertilizer.name}`);
        return 0;
    }

    // Use conservative approach - take minimum to avoid over-fertilization
    const result = Math.min(...concentrations) * 0.7; // 70% of theoretical max for safety
    console.log(`  Final concentration for ${fertilizer.name}: ${result} g/L`);
    return Math.max(0, Math.min(10, result)); // Cap between 0 and 10 g/L
}

// 11. Fixed remaining targets update
private updateRemainingTargetsFixed(remaining: any, fertilizer: any, concentration: number, volumeLiters: number): void {
    const comp = fertilizer.composition;
    const factor = (concentration * comp.nitrogen) / 1000; // Simplified calculation

    remaining.nitrogen = Math.max(0, remaining.nitrogen - (comp.nitrogen * concentration * 10));
    remaining.phosphorus = Math.max(0, remaining.phosphorus - (comp.phosphorus * concentration * 10));
    remaining.potassium = Math.max(0, remaining.potassium - (comp.potassium * concentration * 10));
    remaining.calcium = Math.max(0, remaining.calcium - ((comp.calcium || 0) * concentration * 10));
    remaining.magnesium = Math.max(0, remaining.magnesium - ((comp.magnesium || 0) * concentration * 10));
}

// 12. Fixed targets sufficiency check
private targetsAreSufficientFixed(remaining: any, original: any): boolean {
    const threshold = 0.3; // 70% fulfillment

    const nMet = (original.nitrogen - remaining.nitrogen) / original.nitrogen >= (1 - threshold);
    const pMet = (original.phosphorus - remaining.phosphorus) / original.phosphorus >= (1 - threshold);
    const kMet = (original.potassium - remaining.potassium) / original.potassium >= (1 - threshold);

    return nMet && pMet && kMet;
}

// 13. Add debug calculation method for testing
calculateFormulationWithDebug(): void {
    console.log('=== Starting calculation with debug ===');
    
    // Add debugging
    this.debugFertilizerData();
    
    // Use the fixed calculation method
    this.calculateFormulation();
}
}