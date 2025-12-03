import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SoilAnalysisService } from '../../soil-analysis/services/soil-analysis.service';
import {
  SoilFertigationInput,
  SoilFertigationOutput,
  AdjustedNutrientTargets,
  NutrientAvailabilityFactors,
  SoilNutrientSupply
} from '../models/soil-fertigation.models';
import { SoilAnalysisResponse } from '../../soil-analysis/models/soil-analysis.models';

@Injectable({
  providedIn: 'root'
})
export class SoilFertigationCalculatorService {

  constructor(
    private soilAnalysisService: SoilAnalysisService
  ) { }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Calculate soil-based fertigation recommendations
   */
  calculateSoilFertigation(input: SoilFertigationInput): Observable<SoilFertigationOutput> {

    // Step 1: Get nutrient availability factors based on soil pH
    const availabilityFactors = this.getAvailabilityFactors(input.soilAnalysis.phSoil || 6.5);

    // Step 2: Calculate available nutrients from soil
    const soilSupply = this.calculateSoilNutrientSupply(
      input.soilAnalysis,
      availabilityFactors
    );

    // Step 3: Adjust targets based on soil + water contributions
    const adjustedTargets = this.calculateAdjustedTargets(
      input.targetConcentrations,
      soilSupply,
      input.waterAnalysis,
      availabilityFactors
    );

    // Step 4: Calculate soil buffering characteristics
    const soilBuffering = this.analyzeSoilBuffering(input.soilAnalysis);

    // Step 5: Generate warnings and recommendations
    const { warnings, recommendations } = this.generateRecommendations(
      input,
      adjustedTargets,
      soilBuffering
    );

    // Step 6: Create application schedule
    const applicationSchedule = this.createApplicationSchedule(
      adjustedTargets,
      input.irrigationVolume,
      input.irrigationsPerWeek,
      input.leachingFraction
    );

    return of({
      adjustedTargets,
      fertilizerRecommendations: null, // Will be filled by Python API call
      applicationSchedule,
      soilBuffering,
      warnings,
      recommendations
    });
  }

  /**
   * Compare soil vs hydroponic formulation
   */
  compareFormulations(
    soilTargets: any,
    hydroponicTargets: any
  ): any[] {
    const nutrients = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
    const comparisons: any[] = [];

    nutrients.forEach(nutrient => {
      const soilAmount = soilTargets[nutrient] || 0;
      const hydroAmount = hydroponicTargets[nutrient] || 0;
      const difference = soilAmount - hydroAmount;
      const percentDiff = hydroAmount > 0 ? (difference / hydroAmount) * 100 : 0;

      let reason = '';
      if (Math.abs(percentDiff) < 10) {
        reason = 'Similar to hidroponía';
      } else if (percentDiff < -10) {
        reason = 'Reducido por aporte del suelo';
      } else {
        reason = 'Aumentado para compensar fijación en suelo';
      }

      comparisons.push({
        nutrient,
        hydroponicAmount: hydroAmount,
        soilAmount,
        difference,
        percentDifference: percentDiff,
        reason
      });
    });

    return comparisons;
  }

  // ==========================================================================
  // PRIVATE CALCULATION METHODS
  // ==========================================================================

  /**
   * Get nutrient availability factors based on soil pH
   * Based on research data for different pH ranges
   */
  private getAvailabilityFactors(ph: number): NutrientAvailabilityFactors {
    // Default factors for optimal pH (6.0-7.0)
    let factors: NutrientAvailabilityFactors = {
      N: 0.75,
      P: 0.40,
      K: 0.85,
      Ca: 0.90,
      Mg: 0.75,
      S: 0.80
    };

    // Adjust based on pH ranges
    if (ph < 5.5) {
      // Acidic soil - reduced availability for most nutrients
      factors = {
        N: 0.60,
        P: 0.15,    // Very low - fixed by Fe and Al
        K: 0.70,
        Ca: 0.60,
        Mg: 0.50,
        S: 0.60,
        Fe: 0.90,   // High in acidic soils
        Mn: 0.85,
        Zn: 0.75,
        Cu: 0.70,
        B: 0.50
      };
    } else if (ph >= 5.5 && ph <= 7.0) {
      // Optimal range
      factors = {
        N: 0.75,
        P: 0.40,
        K: 0.85,
        Ca: 0.90,
        Mg: 0.75,
        S: 0.80,
        Fe: 0.60,
        Mn: 0.60,
        Zn: 0.60,
        Cu: 0.60,
        B: 0.70
      };
    } else if (ph > 7.0 && ph <= 8.0) {
      // Slightly alkaline
      factors = {
        N: 0.60,
        P: 0.25,    // Reduced - fixed by Ca
        K: 0.75,
        Ca: 0.85,
        Mg: 0.70,
        S: 0.70,
        Fe: 0.25,   // Very low - chlorosis risk
        Mn: 0.20,
        Zn: 0.25,
        Cu: 0.35,
        B: 0.60
      };
    } else {
      // Very alkaline (pH > 8)
      factors = {
        N: 0.50,
        P: 0.10,    // Very low
        K: 0.75,
        Ca: 0.85,
        Mg: 0.70,
        S: 0.60,
        Fe: 0.05,   // Severe deficiency risk
        Mn: 0.10,
        Zn: 0.15,
        Cu: 0.25,
        B: 0.50
      };
    }

    return factors;
  }

  /**
   * Calculate available nutrients from soil analysis
   */
  private calculateSoilNutrientSupply(
    soilAnalysis: SoilAnalysisResponse,
    availabilityFactors: NutrientAvailabilityFactors
  ): SoilNutrientSupply[] {
    const supplies: SoilNutrientSupply[] = [];

    // Nitrogen
    if (soilAnalysis.totalNitrogen) {
      supplies.push({
        nutrient: 'N',
        soilTestValue: soilAnalysis.totalNitrogen,
        availableAmount: soilAnalysis.totalNitrogen * availabilityFactors.N,
        supplyDuration: this.estimateSupplyDuration(
          soilAnalysis.totalNitrogen * availabilityFactors.N,
          150 // typical N requirement
        ),
        needsFertigation: (soilAnalysis.totalNitrogen * availabilityFactors.N) < 50
      });
    }

    // Phosphorus
    if (soilAnalysis.phosphorus) {
      supplies.push({
        nutrient: 'P',
        soilTestValue: soilAnalysis.phosphorus,
        availableAmount: soilAnalysis.phosphorus * availabilityFactors.P,
        supplyDuration: this.estimateSupplyDuration(
          soilAnalysis.phosphorus * availabilityFactors.P,
          40 // typical P requirement
        ),
        needsFertigation: (soilAnalysis.phosphorus * availabilityFactors.P) < 10
      });
    }

    // Potassium
    if (soilAnalysis.potassium) {
      supplies.push({
        nutrient: 'K',
        soilTestValue: soilAnalysis.potassium,
        availableAmount: soilAnalysis.potassium * availabilityFactors.K,
        supplyDuration: this.estimateSupplyDuration(
          soilAnalysis.potassium * availabilityFactors.K,
          200 // typical K requirement
        ),
        needsFertigation: (soilAnalysis.potassium * availabilityFactors.K) < 80
      });
    }

    // Calcium
    if (soilAnalysis.calcium) {
      supplies.push({
        nutrient: 'Ca',
        soilTestValue: soilAnalysis.calcium,
        availableAmount: soilAnalysis.calcium * availabilityFactors.Ca,
        supplyDuration: this.estimateSupplyDuration(
          soilAnalysis.calcium * availabilityFactors.Ca,
          180 // typical Ca requirement
        ),
        needsFertigation: (soilAnalysis.calcium * availabilityFactors.Ca) < 100
      });
    }

    // Magnesium
    if (soilAnalysis.magnesium) {
      supplies.push({
        nutrient: 'Mg',
        soilTestValue: soilAnalysis.magnesium,
        availableAmount: soilAnalysis.magnesium * availabilityFactors.Mg,
        supplyDuration: this.estimateSupplyDuration(
          soilAnalysis.magnesium * availabilityFactors.Mg,
          50 // typical Mg requirement
        ),
        needsFertigation: (soilAnalysis.magnesium * availabilityFactors.Mg) < 20
      });
    }

    // Sulfur
    if (soilAnalysis.sulfur) {
      supplies.push({
        nutrient: 'S',
        soilTestValue: soilAnalysis.sulfur,
        availableAmount: soilAnalysis.sulfur * availabilityFactors.S,
        supplyDuration: this.estimateSupplyDuration(
          soilAnalysis.sulfur * availabilityFactors.S,
          80 // typical S requirement
        ),
        needsFertigation: (soilAnalysis.sulfur * availabilityFactors.S) < 15
      });
    }

    return supplies;
  }

  /**
   * Estimate how many weeks soil can supply nutrient
   */
  private estimateSupplyDuration(availableAmount: number, weeklyDemand: number): number {
    if (weeklyDemand === 0) return 999;
    return Math.floor(availableAmount / weeklyDemand);
  }

  /**
   * Calculate adjusted nutrient targets
   * Formula: Adjusted = Target - (Soil Available + Water Contribution)
   */
  private calculateAdjustedTargets(
    targets: any,
    soilSupply: SoilNutrientSupply[],
    waterAnalysis: any,
    availabilityFactors: NutrientAvailabilityFactors
  ): AdjustedNutrientTargets[] {

    const adjustedTargets: AdjustedNutrientTargets[] = [];
    const nutrients = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];

    nutrients.forEach(nutrient => {
      const target = targets[nutrient] || 0;
      const soilData = soilSupply.find(s => s.nutrient === nutrient);
      const soilContribution = soilData ? soilData.availableAmount : 0;
      const waterContribution = waterAnalysis[nutrient] || 0;

      // Adjusted target = Target - Soil - Water (but never negative)
      let adjusted = Math.max(0, target - soilContribution - waterContribution);

      // For P in high-fixation soils, add buffer
      if (nutrient === 'P' && availabilityFactors.P < 0.30) {
        adjusted = adjusted * 1.5; // Increase by 50% to compensate fixation
      }

      // Generate reasoning
      let reasoning = '';
      if (soilContribution > target * 0.5) {
        reasoning = `Suelo aporta ${soilContribution.toFixed(1)} ppm (${((soilContribution/target)*100).toFixed(0)}% del objetivo)`;
      } else if (soilContribution > target * 0.2) {
        reasoning = `Suelo aporta parcialmente (${soilContribution.toFixed(1)} ppm)`;
      } else {
        reasoning = `Aporte del suelo bajo (${soilContribution.toFixed(1)} ppm), fertirriego necesario`;
      }

      adjustedTargets.push({
        nutrient,
        originalTarget: target,
        soilContribution,
        waterContribution,
        adjustedTarget: adjusted,
        availabilityFactor: (availabilityFactors as any)[nutrient] || 0.5,
        reasoning
      });
    });

    return adjustedTargets;
  }

  /**
   * Analyze soil buffering capacity
   */
  private analyzeSoilBuffering(soilAnalysis: SoilAnalysisResponse): any {
    const cec = soilAnalysis.cationExchangeCapacity || 10;

    let bufferingStrength: 'low' | 'medium' | 'high';
    if (cec < 10) {
      bufferingStrength = 'low';
    } else if (cec >= 10 && cec < 20) {
      bufferingStrength = 'medium';
    } else {
      bufferingStrength = 'high';
    }

    // Estimate nutrient retention by soil
    const nutrientRetention: any = {};
    if (bufferingStrength === 'low') {
      nutrientRetention.N = 10;
      nutrientRetention.P = 20;
      nutrientRetention.K = 15;
      nutrientRetention.Ca = 20;
      nutrientRetention.Mg = 15;
    } else if (bufferingStrength === 'medium') {
      nutrientRetention.N = 15;
      nutrientRetention.P = 40;
      nutrientRetention.K = 25;
      nutrientRetention.Ca = 30;
      nutrientRetention.Mg = 25;
    } else {
      nutrientRetention.N = 20;
      nutrientRetention.P = 60;
      nutrientRetention.K = 35;
      nutrientRetention.Ca = 40;
      nutrientRetention.Mg = 35;
    }

    return {
      cationExchangeCapacity: cec,
      bufferingStrength,
      nutrientRetention
    };
  }

  /**
   * Generate warnings and recommendations
   */
  private generateRecommendations(
    input: SoilFertigationInput,
    adjustedTargets: AdjustedNutrientTargets[],
    soilBuffering: any
  ): { warnings: string[]; recommendations: string[] } {

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // pH warnings
    const ph = input.soilAnalysis.phSoil || 7.0;
    if (ph < 5.5) {
      warnings.push('⚠️ pH ácido (< 5.5): Disponibilidad de P muy reducida');
      recommendations.push('Considere encalado para elevar pH a 6.0-6.5');
    } else if (ph > 8.0) {
      warnings.push('⚠️ pH alcalino (> 8.0): Riesgo de deficiencia de micronutrientes (Fe, Mn, Zn)');
      recommendations.push('Aplique quelatos de Fe y Zn. Considere azufre elemental para reducir pH');
    }

    // EC warnings
    const ec = input.soilAnalysis.electricalConductivity || 0;
    if (ec > 2.0) {
      warnings.push('⚠️ CE alta (> 2.0 dS/m): Salinidad excesiva');
      recommendations.push('Aumente fracción de lixiviación a 25-30% para reducir sales');
    }

    // Nutrient imbalances
    adjustedTargets.forEach(target => {
      if (target.availabilityFactor < 0.30) {
        warnings.push(`⚠️ ${target.nutrient}: Disponibilidad muy baja (${(target.availabilityFactor * 100).toFixed(0)}%)`);
        recommendations.push(`Aumente dosis de ${target.nutrient} en 50% para compensar baja disponibilidad`);
      }
    });

    // Buffering recommendations
    if (soilBuffering.bufferingStrength === 'high') {
      recommendations.push('CIC alto: Fertilización frecuente en dosis bajas para evitar fijación excesiva');
    } else if (soilBuffering.bufferingStrength === 'low') {
      recommendations.push('CIC bajo: Fertilización más frecuente necesaria (menor retención de nutrientes)');
    }

    // Leaching fraction
    if (input.leachingFraction < 0.15) {
      warnings.push('⚠️ Fracción de lixiviación baja (< 15%): Riesgo de acumulación de sales');
      recommendations.push('Aumente fracción de lixiviación a 15-25%');
    }

    return { warnings, recommendations };
  }

  /**
   * Create application schedule
   */
  private createApplicationSchedule(
    adjustedTargets: AdjustedNutrientTargets[],
    volumePerApplication: number,
    applicationsPerWeek: number,
    leachingFraction: number
  ): any {

    const concentrationInSolution: any = {};
    const totalFertilizerPerWeek: any = {};

    adjustedTargets.forEach(target => {
      // Account for leaching fraction
      const effectiveConcentration = target.adjustedTarget * (1 + leachingFraction);

      concentrationInSolution[target.nutrient] = effectiveConcentration;

      // Total per week = concentration × volume per application × applications per week
      totalFertilizerPerWeek[target.nutrient] =
        (effectiveConcentration * volumePerApplication * applicationsPerWeek) / 1000; // Convert to kg
    });

    return {
      volumePerApplication,
      concentrationInSolution,
      totalFertilizerPerWeek,
      applicationsPerWeek
    };
  }
}
