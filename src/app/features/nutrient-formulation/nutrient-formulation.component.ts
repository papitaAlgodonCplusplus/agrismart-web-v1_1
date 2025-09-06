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

    // Data
    waterSources: WaterChemistry[] = [];
    fertilizers: Fertilizer[] = [];
    crops: Crop[] = [];
    cropPhases: any[] = [];
    cropPhaseOptimals: CropPhaseOptimal[] = [];

    // Current formulation
    currentRecipe: FormulationRecipe | null = null;
    formulationResults: any[] = [];

    // UI State
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    showAdvancedOptions = false;

    // Mock saved recipes
    savedRecipes: FormulationRecipe[] = [];

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
        this.loadInitialData();
        this.generateMockRecipes();
    }

    private createForm(): FormGroup {
        return this.fb.group({
            recipeName: ['Nueva Receta', Validators.required],
            waterSourceId: [null, Validators.required],
            cropId: [null, Validators.required],
            cropPhaseId: [null],
            volumeLiters: [1000, [Validators.required, Validators.min(1)]],
            targetPh: [6.5, [Validators.required, Validators.min(4), Validators.max(8)]],
            targetEc: [1.5, [Validators.required, Validators.min(0.5), Validators.max(4)]],
            maxBudgetPerLiter: [0.10, [Validators.min(0)]],
            preferOrganic: [false],
            optimizeFor: ['cost']
        });
    }

    private loadInitialData(): void {
        this.isLoading = true;
        this.errorMessage = '';
        console.log('Loading initial data for formulation...');

        // Create individual observables with proper error handling and data extraction
        const waterSources$ = this.waterChemistryService.getAll({ onlyActive: true }).pipe(
            map(response => {
                // Handle the wrapped response structure
                if (response && typeof response === 'object' && 'result' in response) {
                    return (response as any).result?.waterChemistries || [];
                }
                return Array.isArray(response) ? response : [];
            }),
            catchError(error => {
                console.error('Error loading water sources:', error);
                return of([]);
            })
        );

        console.log('Fetching fertilizers...', this.authService.getCurrentUser());

        // http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid
        const primarySid = this.authService.getCurrentUser()?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid"];

        console.log('Current user primary SID:', primarySid);
        let catalogs: { id: number | undefined; }[] = [];

        this.catalogService.getAll(primarySid).subscribe({
            next: (response: any) => {
                 catalogs = response.catalogs;
                console.log('Fetched catalogs:', catalogs);
            },
            error: (error) => {
                console.error('Error fetching catalogs:', error);
            }
        });

        const firstCatalog = catalogs.at(0);
        const fertilizers$ = firstCatalog && firstCatalog.id !== undefined
            ? this.fertilizerService.getFertilizersWithCatalogId(firstCatalog.id).pipe(
                map(response => {
                    // Handle the wrapped response structure
                    if (response && typeof response === 'object' && 'result' in response) {
                        return (response as any).result?.fertilizers || [];
                    }
                    return Array.isArray(response) ? response : [];
                }),
                catchError(error => {
                    console.error('Error loading fertilizers:', error);
                    // Return mock fertilizers if service fails
                    return of(this.getMockFertilizers());
                })
            )
            : of(this.getMockFertilizers());

        const crops$ = this.cropService.getAll(true).pipe(
            map(response => {
                // Handle the wrapped response structure
                if (response && typeof response === 'object' && 'result' in response) {
                    return (response as any).result?.crops || [];
                }
                return Array.isArray(response) ? response : [];
            }),
            catchError(error => {
                console.error('Error loading crops:', error);
                return of([]);
            })
        );

        const cropPhases$ = this.apiService.get<any>('/CropPhase').pipe(
            map(response => {
                // Handle the wrapped response structure
                if (response && typeof response === 'object' && 'result' in response) {
                    return (response as any).result?.cropPhases || [];
                }
                if (response && typeof response === 'object' && 'cropPhases' in response) {
                    return (response as any).cropPhases || [];
                }
                return Array.isArray(response) ? response : [];
            }),
            catchError(error => {
                console.error('Error loading crop phases:', error);
                return of([]);
            })
        );

        const cropPhaseOptimals$ = this.apiService.get<any>('/CropPhaseOptimal').pipe(
            map(response => {
                // Handle the wrapped response structure
                if (response && typeof response === 'object' && 'result' in response) {
                    return (response as any).result?.cropPhaseOptimals || [];
                }
                if (response && typeof response === 'object' && 'cropPhaseOptimals' in response) {
                    return (response as any).cropPhaseOptimals || [];
                }
                return Array.isArray(response) ? response : [];
            }),
            catchError(error => {
                console.error('Error loading crop phase optimals:', error);
                return of([]);
            })
        );

        // Use forkJoin to load all required data in parallel
        forkJoin({
            waterSources: waterSources$,
            fertilizers: fertilizers$,
            crops: crops$,
            cropPhases: cropPhases$,
            cropPhaseOptimals: cropPhaseOptimals$
        }).subscribe({
            next: (data) => {
                console.log('Raw loaded data:', data);

                // Ensure all data are arrays
                this.waterSources = Array.isArray(data.waterSources) ? data.waterSources : [];
                this.crops = Array.isArray(data.crops) ? data.crops : [];
                this.cropPhases = Array.isArray(data.cropPhases) ? data.cropPhases : [];
                this.cropPhaseOptimals = Array.isArray(data.cropPhaseOptimals) ? data.cropPhaseOptimals : [];

                // Transform fertilizers data to match expected interface
                this.fertilizers = this.transformFertilizersData(data.fertilizers);

                this.isLoading = false;
                console.log('Processed formulation data:', {
                    waterSources: this.waterSources.length,
                    fertilizers: this.fertilizers.length,
                    crops: this.crops.length,
                    cropPhases: this.cropPhases.length,
                    cropPhaseOptimals: this.cropPhaseOptimals.length
                });
            },
            error: (error) => {
                this.errorMessage = 'Error al cargar los datos básicos';
                this.isLoading = false;
                console.error('Error loading initial data:', error);
            }
        });
    }

    private transformFertilizersData(fertilizersData: any[]): Fertilizer[] {
        if (!Array.isArray(fertilizersData)) {
            console.warn('Fertilizers data is not an array, using mock data');
            return this.getMockFertilizers();
        }

        return fertilizersData.map((f: any) => ({
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

    private getMockFertilizers(): Fertilizer[] {
        return [
            {
                id: 1,
                name: 'Nitrato de Calcio',
                type: 'solid',
                composition: {
                    nitrogen: 15.5,
                    phosphorus: 0,
                    potassium: 0,
                    calcium: 19
                },
                costPerUnit: 2.50,
                unit: 'kg',
                isOrganic: false,
                isActive: true
            },
            {
                id: 2,
                name: 'Fosfato Monopotásico',
                type: 'solid',
                composition: {
                    nitrogen: 0,
                    phosphorus: 52,
                    potassium: 34
                },
                costPerUnit: 3.20,
                unit: 'kg',
                isOrganic: false,
                isActive: true
            },
            {
                id: 3,
                name: 'Sulfato de Potasio',
                type: 'solid',
                composition: {
                    nitrogen: 0,
                    phosphorus: 0,
                    potassium: 50,
                    sulfur: 18
                },
                costPerUnit: 2.80,
                unit: 'kg',
                isOrganic: false,
                isActive: true
            }
        ];
    }

    onCropChange(): void {
        const cropId = this.formulationForm.get('cropId')?.value;
        if (cropId) {
            // Filter phases for selected crop
            const filteredPhases = this.cropPhases.filter(phase => phase.cropId === cropId);
            console.log('Filtered phases for crop', cropId, ':', filteredPhases);
            
            // Reset crop phase selection
            this.formulationForm.patchValue({ cropPhaseId: null });
            
            // Auto-set nutritional targets if phase is selected
            this.updateNutritionalTargets();
        }
    }

    onCropPhaseChange(): void {
        this.updateNutritionalTargets();
    }

    private updateNutritionalTargets(): void {
        const cropPhaseId = this.formulationForm.get('cropPhaseId')?.value;
        if (cropPhaseId) {
            const optimal = this.cropPhaseOptimals.find(o => o.cropPhaseId === cropPhaseId);
            if (optimal) {
                this.formulationForm.patchValue({
                    targetPh: optimal.phOptimal || 6.5,
                    targetEc: optimal.ecOptimal || 1.5
                });
            }
        }
    }

    // Get filtered crop phases for selected crop
    getFilteredCropPhases(): any[] {
        const cropId = this.formulationForm.get('cropId')?.value;
        if (!cropId) return [];
        
        return this.cropPhases.filter(phase => phase.cropId === parseInt(cropId));
    }

    calculateFormulation(): void {
        if (this.formulationForm.invalid) {
            this.errorMessage = 'Por favor completa todos los campos requeridos';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        // Mock calculation - replace with actual optimization service
        setTimeout(() => {
            this.currentRecipe = this.generateMockRecipe();
            this.formulationResults = this.generateMockResults();
            this.isLoading = false;
            this.successMessage = 'Formulación calculada exitosamente';
        }, 2000);
    }

    private generateMockRecipe(): FormulationRecipe {
        const formValue = this.formulationForm.value;
        const selectedFertilizers = this.fertilizers.slice(0, 3); // Use first 3 fertilizers

        return {
            name: formValue.recipeName,
            waterSourceId: formValue.waterSourceId,
            cropId: formValue.cropId,
            cropPhaseId: formValue.cropPhaseId,
            targetPh: formValue.targetPh,
            targetEc: formValue.targetEc,
            targetNitrogen: 200, // Mock values
            targetPhosphorus: 50,
            targetPotassium: 300,
            volumeLiters: formValue.volumeLiters,
            totalCost: 75.50,
            fertilizers: selectedFertilizers.map((fert, index) => ({
                fertilizerId: fert.id,
                fertilizer: fert,
                concentration: [2.5, 1.2, 3.1][index],
                percentageOfN: [40, 30, 30][index],
                percentageOfP: [20, 60, 20][index],
                percentageOfK: [35, 15, 50][index],
                costPortion: [35.20, 22.10, 18.20][index]
            })),
            createdAt: new Date()
        };
    }

    private generateMockResults(): any[] {
        return [
            {
                parameter: 'Nitrógeno Total',
                target: 200,
                achieved: 198.5,
                unit: 'ppm',
                difference: -1.5,
                status: 'optimal'
            },
            {
                parameter: 'Fósforo',
                target: 50,
                achieved: 52.1,
                unit: 'ppm',
                difference: 2.1,
                status: 'acceptable'
            },
            {
                parameter: 'Potasio',
                target: 300,
                achieved: 305.8,
                unit: 'ppm',
                difference: 5.8,
                status: 'optimal'
            },
            {
                parameter: 'pH',
                target: 6.5,
                achieved: 6.4,
                unit: '',
                difference: -0.1,
                status: 'optimal'
            },
            {
                parameter: 'EC',
                target: 1.5,
                achieved: 1.52,
                unit: 'dS/m',
                difference: 0.02,
                status: 'optimal'
            }
        ];
    }

    private generateMockRecipes(): void {
        this.savedRecipes = [
            {
                id: 1,
                name: 'Tomate Crecimiento Vegetativo',
                waterSourceId: 1,
                cropId: 1,
                cropPhaseId: 1,
                targetPh: 6.2,
                targetEc: 1.8,
                targetNitrogen: 220,
                targetPhosphorus: 45,
                targetPotassium: 280,
                volumeLiters: 1000,
                totalCost: 82.30,
                fertilizers: [],
                createdAt: new Date('2025-01-01')
            },
            {
                id: 2,
                name: 'Lechuga Inicio',
                waterSourceId: 1,
                cropId: 2,
                cropPhaseId: 2,
                targetPh: 6.0,
                targetEc: 1.2,
                targetNitrogen: 150,
                targetPhosphorus: 35,
                targetPotassium: 200,
                volumeLiters: 500,
                totalCost: 38.50,
                fertilizers: [],
                createdAt: new Date('2025-01-15')
            }
        ];
    }

    saveRecipe(): void {
        if (!this.currentRecipe) return;

        // Mock save - replace with actual API call
        this.currentRecipe.id = this.savedRecipes.length + 1;
        this.savedRecipes.unshift({ ...this.currentRecipe });
        this.successMessage = 'Receta guardada exitosamente';
    }

    loadRecipe(recipe: FormulationRecipe): void {
        this.currentRecipe = recipe;
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
        this.formulationResults = this.generateMockResults();
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
        this.successMessage = '';
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
}