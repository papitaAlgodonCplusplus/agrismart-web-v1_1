import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SimpleFormulationRequest {
  cropId: number;
  cropPhaseId: number;
  volumeLiters: number;
  waterSourceId?: number;
  targetPh?: number;
  targetEc?: number;
}

export interface SimpleFormulationResult {
  recipeName: string;
  cropId: number;
  cropPhaseId: number;
  volumeLiters: number;
  targetPh: number;
  targetEc: number;
  fertilizers: FertilizerRecommendation[];
  totalCost: number;
  nutrientBalance: NutrientBalance;
  instructions: string[];
  warnings: string[];
}

export interface FertilizerRecommendation {
  fertilizerId: number;
  fertilizerName: string;
  concentration: number; // grams per liter
  totalGrams: number; // total grams for volume
  cost: number;
  nutrientContribution: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium?: number;
    magnesium?: number;
    sulfur?: number;
  };
}

export interface NutrientBalance {
  nitrogen: { target: number; achieved: number; ratio: number };
  phosphorus: { target: number; achieved: number; ratio: number };
  potassium: { target: number; achieved: number; ratio: number };
  calcium?: { target: number; achieved: number; ratio: number };
  magnesium?: { target: number; achieved: number; ratio: number };
  sulfur?: { target: number; achieved: number; ratio: number };
}

@Injectable({
  providedIn: 'root'
})
export class RealDataSimpleFormulationService {

  constructor() {}

  /**
   * Calculate simple formulation using ONLY real data from CropPhaseSolutionRequirement
   * and actual fertilizer compositions from the database
   */
  calculateSimpleFormulation(
    request: SimpleFormulationRequest,
    realRequirements: any, // Must come from CropPhaseSolutionRequirement API
    realFertilizers: any[] // Must come from Fertilizer API with real compositions
  ): Observable<SimpleFormulationResult> {
    
    // Validate that we have real requirements data
    if (!realRequirements || !this.isValidRequirement(realRequirements)) {
      return throwError(() => new Error('Se requieren datos reales de requerimientos nutricionales de la base de datos'));
    }

    // Validate that we have real fertilizers with compositions
    const validFertilizers = realFertilizers.filter(f => this.isValidFertilizer(f));
    if (validFertilizers.length === 0) {
      return throwError(() => new Error('Se requieren fertilizantes con composiciones reales de la base de datos'));
    }

    try {
      // Calculate using real data only
      const formulation = this.calculateWithRealData(
        request,
        realRequirements,
        validFertilizers
      );

      return of(formulation);
      
    } catch (error) {
      console.error('Error in calculateSimpleFormulation:', error);
      return throwError(() => error);
    }
  }

  /**
   * Validate that requirement data is real (from database)
   */
  private isValidRequirement(req: any): boolean {
    return req && 
           req.cropPhaseId &&
           (req.no3 > 0 || req.nh4 > 0 || req.h2po4 > 0 || req.k > 0) &&
           typeof req.no3 === 'number' &&
           typeof req.h2po4 === 'number' &&
           typeof req.k === 'number';
  }

  /**
   * Validate that fertilizer data is real (from database with composition)
   */
  private isValidFertilizer(fert: any): boolean {
    if (!fert || !fert.isActive) return false;
    
    // Check if has real composition data
    const hasComposition = fert.composition && (
      (fert.composition.nitrogen > 0) ||
      (fert.composition.phosphorus > 0) ||
      (fert.composition.potassium > 0)
    );

    // Or has percentage data
    const hasPercentages = (
      (fert.nitrogenPercentage > 0) ||
      (fert.phosphorusPercentage > 0) ||
      (fert.potassiumPercentage > 0)
    );

    return hasComposition || hasPercentages;
  }

  /**
   * Calculate formulation using ONLY real database data
   */
  private calculateWithRealData(
    request: SimpleFormulationRequest,
    requirements: any,
    fertilizers: any[]
  ): SimpleFormulationResult {

    // Extract real nutrient targets from database
    const targets = {
      nitrogen: (requirements.no3 || 0) + (requirements.nh4 || 0),
      phosphorus: requirements.h2po4 || 0,
      potassium: requirements.k || 0,
      calcium: requirements.ca || 0,
      magnesium: requirements.mg || 0,
      sulfur: requirements.so4 || 0
    };

    // Score fertilizers based on real data
    const scoredFertilizers = fertilizers
      .map(f => ({
        ...f,
        realComposition: this.extractRealComposition(f),
        score: this.calculateRealScore(f, targets)
      }))
      .filter(f => f.realComposition && f.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredFertilizers.length === 0) {
      throw new Error('No hay fertilizantes válidos con composiciones reales');
    }

    // Calculate recommendations using real compositions
    const recommendations: FertilizerRecommendation[] = [];
    const achieved = { nitrogen: 0, phosphorus: 0, potassium: 0, calcium: 0, magnesium: 0, sulfur: 0 };
    
    let totalCost = 0;
    let iteration = 0;
    const maxIterations = 5; // Limit to prevent infinite loops

    // Select fertilizers to meet real targets
    while (iteration < maxIterations && this.hasSignificantGap(achieved, targets)) {
      
      const bestFertilizer = this.selectBestFertilizerForRealGap(
        scoredFertilizers,
        achieved,
        targets,
        recommendations
      );

      if (!bestFertilizer) break;

      // Calculate real concentration needed
      const concentration = this.calculateRealConcentration(
        bestFertilizer,
        achieved,
        targets
      );

      if (concentration > 0) {
        const totalGrams = concentration * request.volumeLiters;
        const cost = (totalGrams / 1000) * (bestFertilizer.pricePerUnit || 0);

        // Calculate real nutrient contribution
        const contribution = this.calculateRealNutrientContribution(
          bestFertilizer.realComposition,
          concentration
        );

        recommendations.push({
          fertilizerId: bestFertilizer.id,
          fertilizerName: bestFertilizer.name,
          concentration,
          totalGrams,
          cost,
          nutrientContribution: contribution
        });

        // Update achieved nutrients with real contributions
        achieved.nitrogen += contribution.nitrogen;
        achieved.phosphorus += contribution.phosphorus;
        achieved.potassium += contribution.potassium;
        achieved.calcium += contribution.calcium || 0;
        achieved.magnesium += contribution.magnesium || 0;
        achieved.sulfur += contribution.sulfur || 0;

        totalCost += cost;
      }

      iteration++;
    }

    // Validate we have viable recommendations
    if (recommendations.length === 0) {
      throw new Error('No se pudo generar una formulación viable con los datos reales disponibles');
    }

    // Build nutrient balance from real calculations
    const nutrientBalance: NutrientBalance = {
      nitrogen: {
        target: targets.nitrogen,
        achieved: achieved.nitrogen,
        ratio: targets.nitrogen > 0 ? achieved.nitrogen / targets.nitrogen : 0
      },
      phosphorus: {
        target: targets.phosphorus,
        achieved: achieved.phosphorus,
        ratio: targets.phosphorus > 0 ? achieved.phosphorus / targets.phosphorus : 0
      },
      potassium: {
        target: targets.potassium,
        achieved: achieved.potassium,
        ratio: targets.potassium > 0 ? achieved.potassium / targets.potassium : 0
      }
    };

    if (targets.calcium > 0) {
      nutrientBalance.calcium = {
        target: targets.calcium,
        achieved: achieved.calcium,
        ratio: achieved.calcium / targets.calcium
      };
    }

    if (targets.magnesium > 0) {
      nutrientBalance.magnesium = {
        target: targets.magnesium,
        achieved: achieved.magnesium,
        ratio: achieved.magnesium / targets.magnesium
      };
    }

    // Generate real instructions and warnings
    const instructions = this.generateRealInstructions(recommendations, request.volumeLiters);
    const warnings = this.generateRealWarnings(nutrientBalance, recommendations);

    return {
      recipeName: `Formulación ${new Date().toLocaleDateString()}`,
      cropId: request.cropId,
      cropPhaseId: request.cropPhaseId,
      volumeLiters: request.volumeLiters,
      targetPh: request.targetPh || requirements.ph || 6.5,
      targetEc: request.targetEc || requirements.ec || 2.0,
      fertilizers: recommendations,
      totalCost,
      nutrientBalance,
      instructions,
      warnings
    };
  }

  /**
   * Extract real composition from fertilizer database record
   */
  private extractRealComposition(fertilizer: any): any {
    // Try composition object first
    if (fertilizer.composition) {
      const comp = fertilizer.composition;
      if (comp.nitrogen > 0 || comp.phosphorus > 0 || comp.potassium > 0) {
        return comp;
      }
    }

    // Try percentage fields
    if (fertilizer.nitrogenPercentage > 0 || fertilizer.phosphorusPercentage > 0 || fertilizer.potassiumPercentage > 0) {
      return {
        nitrogen: fertilizer.nitrogenPercentage || 0,
        phosphorus: fertilizer.phosphorusPercentage || 0,
        potassium: fertilizer.potassiumPercentage || 0,
        calcium: fertilizer.calciumPercentage || 0,
        magnesium: fertilizer.magnesiumPercentage || 0,
        sulfur: fertilizer.sulfurPercentage || 0
      };
    }

    return null; // No real composition data available
  }

  /**
   * Calculate score based on real composition and targets
   */
  private calculateRealScore(fertilizer: any, targets: any): number {
    const comp = this.extractRealComposition(fertilizer);
    if (!comp) return 0;

    let score = 0;

    // Score based on nutrient match to real targets
    if (targets.nitrogen > 0 && comp.nitrogen > 0) {
      score += Math.min(40, (comp.nitrogen / 30) * 40);
    }
    if (targets.phosphorus > 0 && comp.phosphorus > 0) {
      score += Math.min(25, (comp.phosphorus / 20) * 25);
    }
    if (targets.potassium > 0 && comp.potassium > 0) {
      score += Math.min(25, (comp.potassium / 40) * 25);
    }

    // Cost efficiency (only if real price available)
    if (fertilizer.pricePerUnit && fertilizer.pricePerUnit > 0) {
      const costFactor = Math.max(0, 10 - fertilizer.pricePerUnit);
      score += costFactor;
    }

    return score;
  }

  /**
   * Check if there are significant gaps using real targets
   */
  private hasSignificantGap(achieved: any, targets: any): boolean {
    const nitrogenGap = Math.max(0, targets.nitrogen - achieved.nitrogen);
    const phosphorusGap = Math.max(0, targets.phosphorus - achieved.phosphorus);
    const potassiumGap = Math.max(0, targets.potassium - achieved.potassium);
    
    return nitrogenGap > 10 || phosphorusGap > 5 || potassiumGap > 10;
  }

  /**
   * Select best fertilizer for current real gaps
   */
  private selectBestFertilizerForRealGap(
    fertilizers: any[],
    achieved: any,
    targets: any,
    alreadyUsed: FertilizerRecommendation[]
  ): any {

    const usedIds = new Set(alreadyUsed.map(r => r.fertilizerId));
    const availableFertilizers = fertilizers.filter(f => !usedIds.has(f.id));

    if (availableFertilizers.length === 0) {
      return null; // No more fertilizers available
    }

    // Calculate gap-filling potential using real compositions
    let bestFertilizer: any = null;
    let bestGapScore = -1;

    for (const fertilizer of availableFertilizers) {
      const gapScore = this.calculateRealGapFillingScore(fertilizer, achieved, targets);
      if (gapScore > bestGapScore) {
        bestGapScore = gapScore;
        bestFertilizer = fertilizer;
      }
    }

    return bestFertilizer;
  }

  /**
   * Calculate gap filling score using real composition
   */
  private calculateRealGapFillingScore(fertilizer: any, achieved: any, targets: any): number {
    const comp = fertilizer.realComposition;
    if (!comp) return 0;

    let score = 0;

    const nitrogenGap = Math.max(0, targets.nitrogen - achieved.nitrogen);
    const phosphorusGap = Math.max(0, targets.phosphorus - achieved.phosphorus);
    const potassiumGap = Math.max(0, targets.potassium - achieved.potassium);

    if (nitrogenGap > 0 && comp.nitrogen > 0) {
      score += Math.min(nitrogenGap, comp.nitrogen * 2);
    }
    if (phosphorusGap > 0 && comp.phosphorus > 0) {
      score += Math.min(phosphorusGap, comp.phosphorus * 2);
    }
    if (potassiumGap > 0 && comp.potassium > 0) {
      score += Math.min(potassiumGap, comp.potassium * 2);
    }

    return score;
  }

  /**
   * Calculate concentration using real composition and targets
   */
  private calculateRealConcentration(fertilizer: any, achieved: any, targets: any): number {
    const comp = fertilizer.realComposition;
    if (!comp) return 0;
    
    const concentrations: number[] = [];

    // Calculate needed concentrations for each nutrient using real gaps
    const nitrogenGap = Math.max(0, targets.nitrogen - achieved.nitrogen);
    if (nitrogenGap > 0 && comp.nitrogen > 0) {
      const neededConc = nitrogenGap / (comp.nitrogen * 10); // Convert % to ppm contribution
      concentrations.push(neededConc);
    }

    const phosphorusGap = Math.max(0, targets.phosphorus - achieved.phosphorus);
    if (phosphorusGap > 0 && comp.phosphorus > 0) {
      const neededConc = phosphorusGap / (comp.phosphorus * 10);
      concentrations.push(neededConc);
    }

    const potassiumGap = Math.max(0, targets.potassium - achieved.potassium);
    if (potassiumGap > 0 && comp.potassium > 0) {
      const neededConc = potassiumGap / (comp.potassium * 10);
      concentrations.push(neededConc);
    }

    // Use minimum to avoid over-fertilization
    return concentrations.length > 0 ? Math.min(...concentrations, 50) : 0; // Cap at 50g/L
  }

  /**
   * Calculate real nutrient contribution from composition and concentration
   */
  private calculateRealNutrientContribution(composition: any, concentration: number): any {
    return {
      nitrogen: (concentration * composition.nitrogen * 10) / 1000, // Convert to ppm
      phosphorus: (concentration * composition.phosphorus * 10) / 1000,
      potassium: (concentration * composition.potassium * 10) / 1000,
      calcium: composition.calcium ? (concentration * composition.calcium * 10) / 1000 : 0,
      magnesium: composition.magnesium ? (concentration * composition.magnesium * 10) / 1000 : 0,
      sulfur: composition.sulfur ? (concentration * composition.sulfur * 10) / 1000 : 0
    };
  }

  /**
   * Generate instructions based on real recommendations
   */
  private generateRealInstructions(recommendations: FertilizerRecommendation[], volumeLiters: number): string[] {
    const instructions: string[] = [
      `Preparación para ${volumeLiters}L de solución nutritiva:`,
      '',
      'Orden de mezcla:'
    ];

    recommendations.forEach((rec, index) => {
      instructions.push(
        `${index + 1}. ${rec.fertilizerName}: ${rec.totalGrams.toFixed(1)}g (${rec.concentration.toFixed(2)}g/L)`
      );
    });

    instructions.push(
      '',
      'Procedimiento:',
      '• Disolver cada fertilizante completamente antes del siguiente',
      '• Verificar pH y EC finales',
      '• Ajustar si es necesario'
    );

    return instructions;
  }

  /**
   * Generate warnings based on real nutrient balance
   */
  private generateRealWarnings(balance: NutrientBalance, recommendations: FertilizerRecommendation[]): string[] {
    const warnings: string[] = [];

    // Check real nutrient ratios
    if (balance.nitrogen.ratio < 0.85) {
      warnings.push('⚠️ Nitrógeno por debajo del objetivo');
    }
    if (balance.nitrogen.ratio > 1.15) {
      warnings.push('⚠️ Exceso de nitrógeno');
    }

    if (balance.phosphorus.ratio < 0.85) {
      warnings.push('⚠️ Fósforo por debajo del objetivo');
    }
    if (balance.phosphorus.ratio > 1.15) {
      warnings.push('⚠️ Exceso de fósforo');
    }

    if (balance.potassium.ratio < 0.85) {
      warnings.push('⚠️ Potasio por debajo del objetivo');
    }
    if (balance.potassium.ratio > 1.15) {
      warnings.push('⚠️ Exceso de potasio');
    }

    // Check if too many fertilizers needed
    if (recommendations.length > 4) {
      warnings.push('⚠️ Formulación requiere muchos fertilizantes');
    }

    return warnings;
  }
}