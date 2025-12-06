import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export interface SimpleFormulationRequest {
  recipeName: string;
  volumeLiters: number;
  cropId: number;
  cropPhaseId: number;
  waterSourceId: number;
  targetPh?: number;
  targetEc?: number;
}

export interface FertilizerRecommendation {
totalGrams: any;
nutrientContribution: any;
  fertilizerName: string;
  concentration: number; // g/L
  totalAmount: number; // grams for total volume
  cost: number;
  npkContribution: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  realComposition?: any; // Store actual composition used
}

export interface NutrientBalance {
  nitrogen: { target: number; achieved: number; ratio: number };
  phosphorus: { target: number; achieved: number; ratio: number };
  potassium: { target: number; achieved: number; ratio: number };
  calcium?: { target: number; achieved: number; ratio: number };
  magnesium?: { target: number; achieved: number; ratio: number };
  sulfur?: { target: number; achieved: number; ratio: number };
}

export interface SimpleFormulationResult {
  recipeName: string;
  cropId: number;
  cropPhaseId: number;
  volumeLiters: number;
  targetPh: number;
  targetEc: number;
  fertilizers: any[];
  totalCost: number;
  nutrientBalance: NutrientBalance;
  instructions: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RealDataSimpleFormulationService {

  constructor() {}

  /**
   * Calculate simple formulation using ONLY real data from database
   */
  calculateSimpleFormulation(
    request: any,
    realRequirements: any,
    realFertilizers: any[]
  ): Observable<SimpleFormulationResult> {
    
    console.log('=== STARTING FORMULATION CALCULATION ===');
    console.log('Requirements:', realRequirements);
    console.log('Fertilizers:', realFertilizers);

    // Validate inputs
    if (!realRequirements) {
      const error = 'Se requieren datos reales de requerimientos nutricionales de la base de datos';
      console.error(error);
      return throwError(() => new Error(error));
    }

    // Filter and validate fertilizers
    const validFertilizers = realFertilizers.filter(f => this.isValidFertilizer(f));
    console.log(`Valid fertilizers: ${validFertilizers.length} out of ${realFertilizers.length}`);
    
    if (validFertilizers.length === 0) {
      const error = 'Se requieren fertilizantes con composiciones reales de la base de datos';
      console.error(error);
      return throwError(() => new Error(error));
    }

    try {
      const formulation = this.calculateWithRealData(request, realRequirements, validFertilizers);
      console.log('=== FORMULATION RESULT ===');
      console.log('Total fertilizers recommended:', formulation.fertilizers.length);
      console.log('Nutrient balance:', formulation.nutrientBalance);
      
      return of(formulation);
      
    } catch (error) {
      console.error('Error in calculateSimpleFormulation:', error);
      return throwError(() => error);
    }
  }

  /**
   * Validate requirement data from database
   */
  private isValidRequirement(req: any): boolean {
    const isValid = req && 
           req.cropPhaseId &&
           (req.no3 > 0 || req.nh4 > 0 || req.h2po4 > 0 || req.k > 0) &&
           typeof req.no3 === 'number' &&
           typeof req.h2po4 === 'number' &&
           typeof req.k === 'number';
    
    console.log('Requirement validation:', isValid, req);
    return isValid;
  }

  /**
   * Validate fertilizer has real composition data
   */
  private isValidFertilizer(fert: any): boolean {
    if (!fert || !fert.isActive) {
      console.log(`Fertilizer ${fert?.name || 'unknown'} - not active`);
      return false;
    }
    
    // Extract composition to validate
    const composition = this.extractRealComposition(fert);
    const isValid = composition !== null;
    
    console.log(`Fertilizer ${fert.name} - valid: ${isValid}`, composition);
    return isValid;
  }

  /**
   * Extract real composition with comprehensive fallback logic
   */
  private extractRealComposition(fertilizer: any): any {
    console.log(`\n--- Extracting composition for: ${fertilizer.name} ---`);
    console.log('Full fertilizer object:', fertilizer);

    let composition = null;

    // Strategy 1: Try composition object first
    if (fertilizer.composition) {
      const comp = fertilizer.composition;
      console.log('Found composition object:', comp);
      
      if ((comp.nitrogen && comp.nitrogen > 0) ||
          (comp.phosphorus && comp.phosphorus > 0) ||
          (comp.potassium && comp.potassium > 0)) {
        composition = {
          nitrogen: comp.nitrogen || 0,
          phosphorus: comp.phosphorus || 0,
          potassium: comp.potassium || 0,
          calcium: comp.calcium || 0,
          magnesium: comp.magnesium || 0,
          sulfur: comp.sulfur || 0
        };
        console.log('Using composition object:', composition);
        return composition;
      }
    }

    // Strategy 2: Try percentage fields
    if ((fertilizer.nitrogenPercentage && fertilizer.nitrogenPercentage > 0) ||
        (fertilizer.phosphorusPercentage && fertilizer.phosphorusPercentage > 0) ||
        (fertilizer.potassiumPercentage && fertilizer.potassiumPercentage > 0)) {
      
      composition = {
        nitrogen: fertilizer.nitrogenPercentage || 0,
        phosphorus: fertilizer.phosphorusPercentage || 0,
        potassium: fertilizer.potassiumPercentage || 0,
        calcium: fertilizer.calciumPercentage || 0,
        magnesium: fertilizer.magnesiumPercentage || 0,
        sulfur: fertilizer.sulfurPercentage || 0
      };
      console.log('Using percentage fields:', composition);
      return composition;
    }

    // Strategy 3: Try direct chemical analysis fields from database
    const chemicalFields = {
      nitrogen: fertilizer.n || fertilizer.N || 0,
      phosphorus: fertilizer.p || fertilizer.P || (fertilizer.h2po4 || fertilizer.H2PO4 || 0) * 0.32, // Convert H2PO4 to P
      potassium: fertilizer.k || fertilizer.K || 0,
      calcium: fertilizer.ca || fertilizer.Ca || 0,
      magnesium: fertilizer.mg || fertilizer.Mg || 0,
      sulfur: fertilizer.s || fertilizer.S || (fertilizer.so4 || fertilizer.SO4 || 0) * 0.33 // Convert SO4 to S
    };

    if (chemicalFields.nitrogen > 0 || chemicalFields.phosphorus > 0 || chemicalFields.potassium > 0) {
      composition = chemicalFields;
      console.log('Using chemical analysis fields:', composition);
      return composition;
    }

    // Strategy 4: Try to parse from name/description if it contains NPK ratios
    const npkPattern = /(\d+)-(\d+)-(\d+)/;
    const nameMatch = fertilizer.name?.match(npkPattern);
    const descMatch = fertilizer.description?.match(npkPattern);
    
    if (nameMatch || descMatch) {
      const match = nameMatch || descMatch;
      composition = {
        nitrogen: parseFloat(match[1]) || 0,
        phosphorus: parseFloat(match[2]) || 0,
        potassium: parseFloat(match[3]) || 0,
        calcium: 0,
        magnesium: 0,
        sulfur: 0
      };
      console.log('Using NPK pattern from name/description:', composition);
      return composition;
    }

    console.log('No valid composition found');
    return null;
  }

  /**
   * Calculate formulation using real database data
   */
  private calculateWithRealData(
    request: SimpleFormulationRequest,
    requirements: any,
    fertilizers: any[]
  ): SimpleFormulationResult {

    console.log('\n=== CALCULATING WITH REAL DATA ===');

    // Extract nutrient targets from requirements
    const targets = {
      nitrogen: (requirements.no3 || 0) + (requirements.nh4 || 0),
      phosphorus: requirements.h2po4 || 0,
      potassium: requirements.k || 0,
      calcium: requirements.ca || 0,
      magnesium: requirements.mg || 0,
      sulfur: requirements.so4 || 0
    };

    console.log('Nutrient targets:', targets);

    // Score and sort fertilizers
    const scoredFertilizers = fertilizers
      .map(f => {
        const realComposition = this.extractRealComposition(f);
        const score = realComposition ? this.calculateFertilizerScore(realComposition, targets, { nitrogen: 0, phosphorus: 0, potassium: 0 }) : 0;
        
        return {
          ...f,
          realComposition,
          score
        };
      })
      .filter(f => f.realComposition && f.score > 0)
      .sort((a, b) => b.score - a.score);

    console.log('Scored fertilizers:', scoredFertilizers.map(f => ({ name: f.name, score: f.score, composition: f.realComposition })));

    if (scoredFertilizers.length === 0) {
      throw new Error('No hay fertilizantes válidos con composiciones reales');
    }

    // Calculate recommendations
    const recommendations: any[] = [];
    const achieved = { nitrogen: 0, phosphorus: 0, potassium: 0, calcium: 0, magnesium: 0, sulfur: 0 };
    let totalCost = 0;
    
    // Iterative fertilizer selection
    const maxIterations = Math.min(5, scoredFertilizers.length);
    
    for (let i = 0; i < maxIterations; i++) {
      // Find best fertilizer for current gaps
      const currentGaps = {
        nitrogen: Math.max(0, targets.nitrogen - achieved.nitrogen),
        phosphorus: Math.max(0, targets.phosphorus - achieved.phosphorus),
        potassium: Math.max(0, targets.potassium - achieved.potassium)
      };

      console.log(`\nIteration ${i + 1}, current gaps:`, currentGaps);

      if (currentGaps.nitrogen <= 1 && currentGaps.phosphorus <= 1 && currentGaps.potassium <= 1) {
        console.log('Targets achieved, stopping iteration');
        break;
      }

      // Re-score fertilizers based on current gaps
      const bestFertilizer = scoredFertilizers
        .filter(f => !recommendations.find(r => r.fertilizerName === f.name)) // Don't reuse fertilizers
        .map(f => ({
          ...f,
          currentScore: this.calculateFertilizerScore(f.realComposition, targets, achieved)
        }))
        .sort((a, b) => b.currentScore - a.currentScore)[0];

      if (!bestFertilizer || bestFertilizer.currentScore <= 0) {
        console.log('No more beneficial fertilizers found');
        break;
      }

      console.log(`Selected fertilizer: ${bestFertilizer.name} (score: ${bestFertilizer.currentScore})`);

      // Calculate optimal concentration for this fertilizer
      const concentration = this.calculateOptimalConcentration(bestFertilizer.realComposition, currentGaps);
      
      if (concentration <= 0) {
        console.log('Calculated concentration is zero, skipping');
        continue;
      }

      console.log(`Calculated concentration: ${concentration} g/L`);

      // Calculate nutrient contributions
      const contributions = this.calculateNutrientContribution(bestFertilizer.realComposition, concentration);
      console.log('Nutrient contributions:', contributions);

      // Calculate costs
      const totalAmount = concentration * request.volumeLiters;
      const cost = totalAmount * (bestFertilizer.pricePerUnit || 0.001); // Fallback price if missing

      // Create recommendation
      const recommendation = {
        fertilizerName: bestFertilizer.name,
        concentration: concentration,
        totalAmount: totalAmount,
        cost: cost,
        npkContribution: {
          nitrogen: contributions.nitrogen,
          phosphorus: contributions.phosphorus,
          potassium: contributions.potassium
        },
        realComposition: bestFertilizer.realComposition
      };

      recommendations.push(recommendation);

      // Update achieved nutrients
      achieved.nitrogen += contributions.nitrogen;
      achieved.phosphorus += contributions.phosphorus;
      achieved.potassium += contributions.potassium;
      achieved.calcium += contributions.calcium || 0;
      achieved.magnesium += contributions.magnesium || 0;
      achieved.sulfur += contributions.sulfur || 0;

      totalCost += cost;

      console.log('Updated achieved nutrients:', achieved);
    }

    // Build final nutrient balance
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

    // Add optional nutrients if they have targets
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

    // Generate instructions and warnings
    const instructions = this.generateInstructions(recommendations, request.volumeLiters);
    const warnings = this.generateWarnings(nutrientBalance, recommendations);

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
   * Calculate fertilizer score based on how well it addresses current nutrient gaps
   */
  private calculateFertilizerScore(composition: any, targets: any, achieved: any): number {
    const gaps = {
      nitrogen: Math.max(0, targets.nitrogen - achieved.nitrogen),
      phosphorus: Math.max(0, targets.phosphorus - achieved.phosphorus),
      potassium: Math.max(0, targets.potassium - achieved.potassium)
    };

    let score = 0;

    // Score based on ability to fill gaps efficiently
    if (gaps.nitrogen > 0 && composition.nitrogen > 0) {
      score += Math.min(gaps.nitrogen, composition.nitrogen * 3); // Weight nitrogen highly
    }
    if (gaps.phosphorus > 0 && composition.phosphorus > 0) {
      score += Math.min(gaps.phosphorus, composition.phosphorus * 3); // Weight phosphorus highly
    }
    if (gaps.potassium > 0 && composition.potassium > 0) {
      score += Math.min(gaps.potassium, composition.potassium * 2); // Weight potassium moderately
    }

    // Bonus for balanced fertilizers that address multiple gaps
    const addressedNutrients = [
      gaps.nitrogen > 0 && composition.nitrogen > 0,
      gaps.phosphorus > 0 && composition.phosphorus > 0,
      gaps.potassium > 0 && composition.potassium > 0
    ].filter(Boolean).length;

    if (addressedNutrients > 1) {
      score *= 1.2; // 20% bonus for multi-nutrient fertilizers
    }

    return score;
  }

  /**
   * Calculate optimal concentration to address nutrient gaps without over-fertilization
   */
  private calculateOptimalConcentration(composition: any, gaps: any): number {
    const concentrations: number[] = [];

    // Calculate needed concentration for each nutrient
    if (gaps.nitrogen > 0 && composition.nitrogen > 0) {
      // Convert percentage to ppm: 1% = 10,000 ppm at 1g/L
      const neededConc = gaps.nitrogen / (composition.nitrogen * 100); // composition is in %, convert to decimal
      concentrations.push(neededConc);
    }

    if (gaps.phosphorus > 0 && composition.phosphorus > 0) {
      const neededConc = gaps.phosphorus / (composition.phosphorus * 100);
      concentrations.push(neededConc);
    }

    if (gaps.potassium > 0 && composition.potassium > 0) {
      const neededConc = gaps.potassium / (composition.potassium * 100);
      concentrations.push(neededConc);
    }

    // Use minimum to avoid over-fertilization, but ensure reasonable concentration
    let optimalConc = concentrations.length > 0 ? Math.min(...concentrations) : 0;
    
    // Apply practical limits
    optimalConc = Math.max(0.1, Math.min(optimalConc, 50)); // Between 0.1 and 50 g/L
    
    return optimalConc;
  }

  /**
   * Calculate actual nutrient contribution from composition and concentration
   */
  private calculateNutrientContribution(composition: any, concentration: number): any {
    // concentration is in g/L, composition percentages need to be converted to decimal
    // 1% at 1g/L = 100 ppm
    return {
      nitrogen: (concentration * composition.nitrogen * 100) / 10, // Convert to ppm, then to practical units
      phosphorus: (concentration * composition.phosphorus * 100) / 10,
      potassium: (concentration * composition.potassium * 100) / 10,
      calcium: composition.calcium ? (concentration * composition.calcium * 100) / 10 : 0,
      magnesium: composition.magnesium ? (concentration * composition.magnesium * 100) / 10 : 0,
      sulfur: composition.sulfur ? (concentration * composition.sulfur * 100) / 10 : 0
    };
  }

  /**
   * Generate preparation instructions
   */
  private generateInstructions(recommendations: FertilizerRecommendation[], volumeLiters: number): string[] {
    const instructions: string[] = [
      `Preparación para ${volumeLiters}L de solución nutritiva:`,
      '',
      'Orden de mezcla:'
    ];

    recommendations.forEach((rec, index) => {
      instructions.push(
        `${index + 1}. ${rec.fertilizerName}: ${rec.totalAmount.toFixed(1)}g (${rec.concentration.toFixed(2)}g/L)`
      );
    });

    instructions.push('');
    instructions.push('Procedimiento:');
    instructions.push('• Disolver cada fertilizante completamente antes del siguiente');
    instructions.push('• Verificar pH y EC finales');
    instructions.push('• Ajustar si es necesario');

    return instructions;
  }

  /**
   * Generate warnings based on formulation results
   */
  private generateWarnings(nutrientBalance: NutrientBalance, recommendations: FertilizerRecommendation[]): string[] {
    const warnings: string[] = [];

    // Check nutrient achievement
    if (nutrientBalance.nitrogen.ratio < 0.8) {
      warnings.push('⚠️ Nitrógeno por debajo del objetivo');
    }
    if (nutrientBalance.phosphorus.ratio < 0.8) {
      warnings.push('⚠️ Fósforo por debajo del objetivo');
    }
    if (nutrientBalance.potassium.ratio < 0.8) {
      warnings.push('⚠️ Potasio por debajo del objetivo');
    }

    // Check over-fertilization
    if (nutrientBalance.nitrogen.ratio > 1.2) {
      warnings.push('⚠️ Exceso de nitrógeno - reducir concentraciones');
    }
    if (nutrientBalance.phosphorus.ratio > 1.2) {
      warnings.push('⚠️ Exceso de fósforo - reducir concentraciones');
    }
    if (nutrientBalance.potassium.ratio > 1.2) {
      warnings.push('⚠️ Exceso de potasio - reducir concentraciones');
    }

    // Check fertilizer count
    if (recommendations.length > 4) {
      warnings.push('⚠️ Formulación requiere muchos fertilizantes');
    }

    // Check for very low concentrations
    const lowConcFertilizers = recommendations.filter(r => r.concentration < 0.5);
    if (lowConcFertilizers.length > 0) {
      warnings.push('⚠️ Algunas concentraciones son muy bajas - verificar efectividad');
    }

    return warnings;
  }
}