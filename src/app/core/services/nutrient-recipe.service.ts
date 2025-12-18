// ==================================================================
// File: src/app/core/services/nutrient-recipe.service.ts
// ==================================================================

import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';

// Interfaces
export interface NutrientRecipe {
  id?: number;
  name: string;
  description?: string;
  cropId: number;
  cropName?: string;
  cropPhaseId: number;
  cropPhaseName?: string;
  waterSourceId?: number;
  catalogId?: number;
  targetPh: number;
  targetEc: number;
  volumeLiters: number;
  targetNitrogen?: number;
  targetPhosphorus?: number;
  targetPotassium?: number;
  targetCalcium?: number;
  targetMagnesium?: number;
  targetSulfur?: number;
  targetIron?: number;
  targetManganese?: number;
  targetZinc?: number;
  targetCopper?: number;
  targetBoron?: number;
  targetMolybdenum?: number;
  achievedNitrogen?: number;
  achievedPhosphorus?: number;
  achievedPotassium?: number;
  achievedCalcium?: number;
  achievedMagnesium?: number;
  achievedSulfur?: number;
  achievedIron?: number;
  achievedManganese?: number;
  achievedZinc?: number;
  achievedCopper?: number;
  achievedBoron?: number;
  achievedMolybdenum?: number;
  totalCost?: number;
  costPerLiter?: number;
  recipeType?: string;
  instructions?: string;
  warnings?: string;
  notes?: string;
  fertilizers?: RecipeFertilizer[];
  dateCreated?: Date;
}

export interface RecipeFertilizer {
  fertilizerId: number;
  fertilizerName?: string;
  concentrationGramsPerLiter: number;
  totalGrams?: number;
  totalKilograms?: number;
  nitrogenContribution?: number;
  phosphorusContribution?: number;
  potassiumContribution?: number;
  calciumContribution?: number;
  magnesiumContribution?: number;
  sulfurContribution?: number;
  percentageOfN?: number;
  percentageOfP?: number;
  percentageOfK?: number;
  costPerUnit?: number;
  totalCost?: number;
  costPortion?: number;
  applicationOrder?: number;
  applicationNotes?: string;
}

export interface PrepInstruction {
  step: number;
  fertilizer: string;
  amount: string;
  concentration?: string;
}

export interface Warning {
  type: string;
  message: string;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  cropId: number;
  cropPhaseId: number;
  waterSourceId?: number;
  catalogId?: number;
  targetPh: number;
  targetEc: number;
  volumeLiters: number;
  targetNitrogen: number;
  targetPhosphorus: number;
  targetPotassium: number;
  targetCalcium?: number;
  targetMagnesium?: number;
  targetSulfur?: number;
  targetIron?: number;
  achievedNitrogen?: number;
  achievedPhosphorus?: number;
  achievedPotassium?: number;
  achievedCalcium?: number;
  achievedMagnesium?: number;
  achievedSulfur?: number;
  achievedIron?: number;
  totalCost?: number;
  costPerLiter?: number;
  recipeType?: string;
  instructions?: string;
  warnings?: string;
  notes?: string;
  fertilizers?: RecipeFertilizer[];
}

export interface UpdateRecipeRequest extends CreateRecipeRequest {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NutrientRecipeService {
  private baseUrl = '/NutrientRecipe';

  constructor(private apiService: ApiService) {}

  /**
   * Get all nutrient recipes with optional filters
   */
  getAll(filters?: {
    cropId?: number;
    cropPhaseId?: number;
    catalogId?: number;
    recipeType?: string;
    includeInactives?: boolean;
  }): Observable<NutrientRecipe[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.cropId) {
        params = params.set('CropId', filters.cropId.toString());
      }
      if (filters.cropPhaseId) {
        params = params.set('CropPhaseId', filters.cropPhaseId.toString());
      }
      if (filters.catalogId) {
        params = params.set('CatalogId', filters.catalogId.toString());
      }
      if (filters.recipeType) {
        params = params.set('RecipeType', filters.recipeType);
      }
      if (filters.includeInactives !== undefined) {
        params = params.set('IncludeInactives', filters.includeInactives.toString());
      }
    }

    return this.apiService.get<any>(this.baseUrl, params).pipe(
      map((response: any) => response.recipes || [])
    );
  }

  /**
   * Get a single recipe by ID
   */
  getById(id: number): Observable<NutrientRecipe> {
    return this.apiService.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((response: any) => response.recipe)
    );
  }

  /**
   * Get recipes by crop
   */
  getByCrop(cropId: number): Observable<NutrientRecipe[]> {
    return this.apiService.get<any>(`${this.baseUrl}/ByCrop/${cropId}`).pipe(
      map((response: any) => response.recipes || [])
    );
  }

  /**
   * Get recipes by crop and phase
   */
  getByCropPhase(cropId: number, phaseId: number): Observable<NutrientRecipe[]> {
    return this.apiService.get<any>(`${this.baseUrl}/ByCropPhase/${cropId}/${phaseId}`).pipe(
      map((response: any) => response.recipes || [])
    );
  }

  /**
   * Get recipes by type (Simple or Advanced)
   */
  getByType(recipeType: string): Observable<NutrientRecipe[]> {
    return this.apiService.get<any>(`${this.baseUrl}/ByType/${recipeType}`).pipe(
      map((response: any) => response.recipes || [])
    );
  }

  /**
   * Create a new recipe
   */
  create(recipe: any): Observable<any> {
    console.log('Creating recipe:', recipe);
    return this.apiService.post<any>(this.baseUrl, recipe);
  }

  /**
   * Update an existing recipe
   */
  update(recipe: UpdateRecipeRequest): Observable<any> {
    return this.apiService.put<any>(this.baseUrl, recipe);
  }

  /**
   * Delete a recipe (soft delete)
   */
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}