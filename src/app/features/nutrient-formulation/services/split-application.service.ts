import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SplitApplicationInput,
  SplitApplicationSchedule,
  SplitApplication,
  GrowthStage,
  CalendarEvent,
  SplitStrategyComparison,
  SplitStrategyPreset,
  NutrientUptakeCurve
} from '../models/split-application.models';

@Injectable({
  providedIn: 'root'
})
export class SplitApplicationService {

  constructor() { }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Calculate split application schedule
   */
  calculateSplitSchedule(input: SplitApplicationInput): Observable<SplitApplicationSchedule> {

    // Determine distribution pattern based on strategy
    let distributionPattern: number[];

    if (input.splitStrategy === 'equal') {
      distributionPattern = this.getEqualDistribution(input.numberOfSplits);
    } else if (input.splitStrategy === 'demand-based') {
      distributionPattern = this.getDemandBasedDistribution(input.growthStages, input.numberOfSplits);
    } else {
      // Custom - would need to be provided in input
      distributionPattern = this.getEqualDistribution(input.numberOfSplits);
    }

    // Generate application dates
    const applicationDates = this.generateApplicationDates(
      input.plantingDate,
      input.totalCycleDays,
      input.numberOfSplits,
      input.minDaysBetweenApplications
    );

    // Calculate nutrients for each split
    const applications = this.generateApplications(
      input,
      distributionPattern,
      applicationDates
    );

    // Generate calendar events
    const calendar = this.generateCalendarEvents(applications, input.growthStages, input.plantingDate);

    // Calculate summary statistics
    const summary = this.calculateSummary(applications, input);

    // Assess efficiency
    const efficiency = this.assessEfficiency(input, applications);

    // Generate recommendations and warnings
    const { recommendations, warnings } = this.generateRecommendations(input, applications);

    const schedule: SplitApplicationSchedule = {
      cropName: input.cropName,
      totalArea: input.cropArea,
      cycleDuration: input.totalCycleDays,
      plantingDate: input.plantingDate,
      harvestDate: input.harvestDate,
      totalNutrients: input.totalNutrients,
      applications,
      numberOfSplits: input.numberOfSplits,
      summary,
      efficiency,
      calendar,
      recommendations,
      warnings
    };

    return of(schedule);
  }

  /**
   * Compare different split strategies
   */
  compareStrategies(input: SplitApplicationInput): Observable<SplitStrategyComparison[]> {
    const comparisons: SplitStrategyComparison[] = [];

    // Test different numbers of splits (2, 3, 4, 6)
    const splitOptions = [2, 3, 4, 6];

    splitOptions.forEach(numberOfSplits => {
      const testInput = { ...input, numberOfSplits };

      // Calculate schedule for this option
      this.calculateSplitSchedule(testInput).subscribe(schedule => {
        const comparison = this.evaluateStrategy(schedule, numberOfSplits, input);
        comparisons.push(comparison);
      });
    });

    return of(comparisons);
  }

  /**
   * Get preset strategies from API
   * TODO: Replace with actual API endpoint when available
   */
  getStrategyPresets(): Observable<SplitStrategyPreset[]> {
    console.warn('Strategy presets API not configured - returning empty array');
    return of([]);
  }

  /**
   * Get strategy preset by ID from API
   * TODO: Replace with actual API endpoint when available
   */
  getStrategyPreset(id: string): Observable<SplitStrategyPreset | undefined> {
    console.warn(`Strategy preset ${id} API not configured - returning undefined`);
    return of(undefined);
  }

  /**
   * Generate nutrient uptake curve for crop
   */
  generateUptakeCurve(
    nutrient: string,
    growthStages: GrowthStage[],
    totalUptake: number
  ): Observable<NutrientUptakeCurve> {

    const dataPoints: any[] = [];
    let cumulativeUptake = 0;

    // Generate data points for each day of crop cycle
    growthStages.forEach(stage => {
      for (let day = stage.startDay; day <= stage.endDay; day++) {
        const demandFactor = this.getNutrientDemandFactor(nutrient, stage);
        const dailyUptake = (totalUptake / growthStages[growthStages.length - 1].endDay) * demandFactor * 1.5;

        cumulativeUptake += dailyUptake;

        dataPoints.push({
          daysAfterPlanting: day,
          cumulativeUptake: Math.min(cumulativeUptake, totalUptake),
          dailyUptakeRate: dailyUptake,
          percentOfTotal: (cumulativeUptake / totalUptake) * 100
        });
      }
    });

    return of({
      nutrient,
      dataPoints
    });
  }

  // ==========================================================================
  // PRIVATE CALCULATION METHODS
  // ==========================================================================

  /**
   * Get equal distribution pattern
   */
  private getEqualDistribution(numberOfSplits: number): number[] {
    const percentage = 100 / numberOfSplits;
    return Array(numberOfSplits).fill(percentage);
  }

  /**
   * Get demand-based distribution pattern
   */
  private getDemandBasedDistribution(growthStages: GrowthStage[], numberOfSplits: number): number[] {
    // Calculate total demand across all stages
    const totalDemand = growthStages.reduce((sum, stage) => {
      const avgDemand = (stage.nitrogenDemand + stage.phosphorusDemand + stage.potassiumDemand) / 3;
      return sum + (avgDemand * stage.durationDays);
    }, 0);

    // Allocate splits proportionally to demand
    const distribution: number[] = [];
    const splitInterval = growthStages[growthStages.length - 1].endDay / numberOfSplits;

    for (let i = 0; i < numberOfSplits; i++) {
      const splitDay = Math.floor(splitInterval * (i + 0.5));
      const stage = this.getStageAtDay(growthStages, splitDay);

      if (stage) {
        const stageDemand = (stage.nitrogenDemand + stage.phosphorusDemand + stage.potassiumDemand) / 3;
        const percentage = (stageDemand * splitInterval / totalDemand) * 100;
        distribution.push(percentage);
      } else {
        distribution.push(100 / numberOfSplits); // Fallback to equal
      }
    }

    // Normalize to sum to 100%
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(p => (p / sum) * 100);
  }

  /**
   * Generate application dates
   */
  private generateApplicationDates(
    plantingDate: Date,
    totalDays: number,
    numberOfSplits: number,
    minDaysBetween: number
  ): Date[] {
    const dates: Date[] = [];
    const interval = Math.max(totalDays / numberOfSplits, minDaysBetween);

    for (let i = 0; i < numberOfSplits; i++) {
      const daysAfterPlanting = Math.floor(interval * i);
      const date = new Date(plantingDate);
      date.setDate(date.getDate() + daysAfterPlanting);
      dates.push(date);
    }

    return dates;
  }

  /**
   * Generate individual applications
   */
  private generateApplications(
    input: SplitApplicationInput,
    distributionPattern: number[],
    applicationDates: Date[]
  ): SplitApplication[] {

    const applications: SplitApplication[] = [];

    distributionPattern.forEach((percentage, index) => {
      const date = applicationDates[index];
      const daysAfterPlanting = Math.floor((date.getTime() - input.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
      const stage = this.getStageAtDay(input.growthStages, daysAfterPlanting);

      // Calculate nutrient amounts for this split
      const nutrients: any = {};
      const percentOfTotal: any = {};

      Object.keys(input.totalNutrients).forEach(nutrient => {
        const total = (input.totalNutrients as any)[nutrient];
        const amount = (total * percentage) / 100;
        nutrients[nutrient] = amount;
        percentOfTotal[nutrient] = percentage;
      });

      // Adjust based on stage demand if demand-based strategy
      if (input.splitStrategy === 'demand-based' && stage) {
        nutrients.N *= stage.nitrogenDemand;
        nutrients.P *= stage.phosphorusDemand;
        nutrients.K *= stage.potassiumDemand;
      }

      // Check for warnings
      const warnings: string[] = [];
      if (nutrients.N > input.maxNPerApplication) {
        warnings.push(`⚠️ Cantidad de N (${nutrients.N.toFixed(1)} kg/ha) excede máximo recomendado (${input.maxNPerApplication} kg/ha)`);
      }

      // Generate rationale
      const rationale = this.generateRationale(stage, percentage, daysAfterPlanting, input);

      // Determine priority
      const priority = stage?.criticalPeriod ? 'critical' :
                      percentage > 30 ? 'high' :
                      percentage > 20 ? 'medium' : 'low';

      // Generate instructions
      const instructions = this.generateInstructions(input.applicationMethod, nutrients, input.cropArea);

      applications.push({
        applicationNumber: index + 1,
        applicationDate: date,
        daysAfterPlanting,
        growthStage: stage?.name || 'Unknown',
        nutrients,
        percentOfTotal,
        rationale,
        priority,
        warnings,
        instructions
      });
    });

    return applications;
  }

  /**
   * Get growth stage at specific day
   */
  private getStageAtDay(stages: GrowthStage[], day: number): GrowthStage | undefined {
    return stages.find(stage => day >= stage.startDay && day <= stage.endDay);
  }

  /**
   * Get nutrient demand factor for specific nutrient and stage
   */
  private getNutrientDemandFactor(nutrient: string, stage: GrowthStage): number {
    switch (nutrient.toUpperCase()) {
      case 'N': return stage.nitrogenDemand;
      case 'P': return stage.phosphorusDemand;
      case 'K': return stage.potassiumDemand;
      case 'CA': return stage.calciumDemand;
      case 'MG': return stage.magnesiumDemand;
      default: return 0.5;
    }
  }

  /**
   * Generate rationale for application
   */
  private generateRationale(
    stage: GrowthStage | undefined,
    percentage: number,
    daysAfterPlanting: number,
    input: SplitApplicationInput
  ): string {
    if (!stage) {
      return `Aplicación ${percentage.toFixed(0)}% del total en día ${daysAfterPlanting}`;
    }

    let rationale = `${percentage.toFixed(0)}% del total durante fase de ${stage.name}. `;

    if (stage.criticalPeriod) {
      rationale += 'PERÍODO CRÍTICO para desarrollo del cultivo. ';
    }

    if (stage.growthRate === 'rapid') {
      rationale += 'Alta tasa de crecimiento requiere nutrición abundante.';
    } else if (stage.growthRate === 'slow') {
      rationale += 'Crecimiento lento, menor demanda nutricional.';
    }

    return rationale;
  }

  /**
   * Generate application instructions
   */
  private generateInstructions(
    method: string,
    nutrients: any,
    area: number
  ): string {
    const totalN = nutrients.N;
    const totalP = nutrients.P;
    const totalK = nutrients.K;

    let instructions = '';

    switch (method) {
      case 'fertigation':
        instructions = `Aplicar mediante fertirriego: N=${totalN.toFixed(1)}, P=${totalP.toFixed(1)}, K=${totalK.toFixed(1)} kg/ha. `;
        instructions += `Diluir en agua de riego y aplicar uniformemente sobre ${area} ha.`;
        break;

      case 'foliar':
        instructions = `Aplicación foliar: Preparar solución con concentraciones proporcionales. `;
        instructions += `Aplicar en horas frescas (temprano en la mañana o tarde). Volumen: 300-500 L/ha.`;
        break;

      case 'soil-broadcast':
        instructions = `Aplicación al voleo: Distribuir uniformemente sobre ${area} ha. `;
        instructions += `Incorporar ligeramente al suelo mediante rastrillo o cultivador. Regar después de aplicar.`;
        break;

      case 'soil-banded':
        instructions = `Aplicación en banda: Colocar fertilizante en bandas a 5-10 cm del tallo. `;
        instructions += `Profundidad: 5-8 cm. Cubrir con suelo y regar.`;
        break;

      default:
        instructions = 'Seguir método de aplicación recomendado para el cultivo.';
    }

    return instructions;
  }

  /**
   * Generate calendar events
   */
  private generateCalendarEvents(
    applications: SplitApplication[],
    growthStages: GrowthStage[],
    plantingDate: Date
  ): CalendarEvent[] {

    const events: CalendarEvent[] = [];

    // Add application events
    applications.forEach(app => {
      events.push({
        date: app.applicationDate,
        title: `Aplicación ${app.applicationNumber} - ${app.growthStage}`,
        description: app.rationale,
        type: 'application',
        nutrients: Object.keys(app.nutrients).map(n => `${n}: ${(app.nutrients as any)[n].toFixed(1)} kg/ha`),
        priority: app.priority
      });
    });

    // Add stage change events
    growthStages.forEach(stage => {
      const stageDate = new Date(plantingDate);
      stageDate.setDate(stageDate.getDate() + stage.startDay);

      events.push({
        date: stageDate,
        title: `Inicio: ${stage.name}`,
        description: stage.description,
        type: 'stage-change',
        priority: stage.criticalPeriod ? 'critical' : 'medium'
      });
    });

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(applications: SplitApplication[], input: SplitApplicationInput): any {
    const daysBetween: number[] = [];

    for (let i = 1; i < applications.length; i++) {
      const days = applications[i].daysAfterPlanting - applications[i - 1].daysAfterPlanting;
      daysBetween.push(days);
    }

    const avgDaysBetween = daysBetween.length > 0
      ? daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length
      : 0;

    const maxN = Math.max(...applications.map(a => a.nutrients.N));

    // Estimate labor hours (30 min per ha per application for fertigation, 1 hour for manual)
    const hoursPerApplication = input.applicationMethod === 'fertigation' ? 0.5 : 1.0;
    const totalLaborHours = applications.length * input.cropArea * hoursPerApplication;

    return {
      averageDaysBetweenApplications: avgDaysBetween,
      maxSingleApplicationN: maxN,
      totalApplicationEvents: applications.length,
      estimatedLaborHours: totalLaborHours
    };
  }

  /**
   * Assess efficiency of split strategy
   */
  private assessEfficiency(input: SplitApplicationInput, applications: SplitApplication[]): any {
    // Simple efficiency scoring
    let nutrientEfficiency = 60; // Base score

    // More splits generally = higher efficiency (up to a point)
    if (input.numberOfSplits >= 4) nutrientEfficiency += 20;
    else if (input.numberOfSplits === 3) nutrientEfficiency += 15;
    else if (input.numberOfSplits === 2) nutrientEfficiency += 5;

    // Demand-based strategy is more efficient
    if (input.splitStrategy === 'demand-based') nutrientEfficiency += 10;

    // Fertigation is more efficient
    if (input.applicationMethod === 'fertigation') nutrientEfficiency += 10;

    // Assess leaching risk
    let leachingRisk: 'low' | 'medium' | 'high' = 'medium';
    const maxN = Math.max(...applications.map(a => a.nutrients.N));

    if (maxN < 50 && input.numberOfSplits >= 4) leachingRisk = 'low';
    else if (maxN > 100 || input.numberOfSplits <= 2) leachingRisk = 'high';

    // Sandy soil increases leaching risk
    if (input.soilType === 'sandy') {
      if (leachingRisk === 'low') leachingRisk = 'medium';
      else if (leachingRisk === 'medium') leachingRisk = 'high';
    }

    // Cost effectiveness
    const costEffectiveness =
      input.numberOfSplits <= 3 && nutrientEfficiency > 70 ? 'excellent' :
      input.numberOfSplits <= 4 && nutrientEfficiency > 65 ? 'good' :
      nutrientEfficiency > 60 ? 'fair' : 'poor';

    return {
      nutrientUseEfficiency: Math.min(nutrientEfficiency, 100),
      leachingRisk,
      costEffectiveness
    };
  }

  /**
   * Generate recommendations and warnings
   */
  private generateRecommendations(
    input: SplitApplicationInput,
    applications: SplitApplication[]
  ): { recommendations: string[]; warnings: string[] } {

    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Check number of splits
    if (input.numberOfSplits < 3 && input.totalCycleDays > 90) {
      recommendations.push('Para ciclos largos (>90 días), considere aumentar a 3-4 aplicaciones para mejor eficiencia');
    }

    // Check max N per application
    const maxN = Math.max(...applications.map(a => a.nutrients.N));
    if (maxN > 80) {
      warnings.push(`⚠️ Aplicación máxima de N (${maxN.toFixed(1)} kg/ha) es alta. Riesgo de quemadura de raíces y lixiviación`);
      recommendations.push('Considere dividir en más aplicaciones para reducir cantidad por aplicación');
    }

    // Soil type recommendations
    if (input.soilType === 'sandy') {
      recommendations.push('Suelo arenoso: Aplicaciones frecuentes en dosis bajas son más eficientes (mayor retención)');
      if (input.numberOfSplits < 4) {
        recommendations.push('Para suelos arenosos, se recomienda mínimo 4 aplicaciones');
      }
    } else if (input.soilType === 'clay') {
      recommendations.push('Suelo arcilloso: Puede usar aplicaciones menos frecuentes (mejor retención de nutrientes)');
    }

    // Rainy season
    if (input.rainySeasonAdjustment) {
      recommendations.push('Época lluviosa: Aumente frecuencia de aplicaciones y reduzca dosis por aplicación (menor lixiviación)');
      recommendations.push('Monitoree pronóstico del tiempo y evite aplicar antes de lluvias fuertes');
    }

    // Application method
    if (input.applicationMethod === 'fertigation') {
      recommendations.push('Fertirriego: Verifique pH y EC de solución antes de cada aplicación');
      recommendations.push('Limpie filtros del sistema de riego regularmente para evitar obstrucciones');
    }

    // Labor considerations
    const totalLaborHours = applications.length * input.cropArea *
      (input.applicationMethod === 'fertigation' ? 0.5 : 1.0);

    if (totalLaborHours > 40) {
      warnings.push(`⚠️ Tiempo estimado de mano de obra: ${totalLaborHours.toFixed(0)} horas. Considere disponibilidad de personal`);
    }

    // Critical periods
    const criticalApplications = applications.filter(a => a.priority === 'critical');
    if (criticalApplications.length > 0) {
      recommendations.push(`IMPORTANTE: ${criticalApplications.length} aplicación(es) en períodos críticos. No omitir ni retrasar.`);
    }

    return { recommendations, warnings };
  }

  /**
   * Evaluate strategy for comparison
   */
  private evaluateStrategy(
    schedule: SplitApplicationSchedule,
    numberOfSplits: number,
    input: SplitApplicationInput
  ): SplitStrategyComparison {

    // Calculate efficiency scores
    const nutrientEff = schedule.efficiency.nutrientUseEfficiency;
    const laborEff = Math.max(0, 100 - (numberOfSplits * 8)); // More splits = more labor
    const costEff = laborEff * 0.6 + nutrientEff * 0.4;
    const overallScore = (nutrientEff + laborEff + costEff) / 3;

    // Risk assessment
    const leachingRiskScore =
      schedule.efficiency.leachingRisk === 'low' ? 20 :
      schedule.efficiency.leachingRisk === 'medium' ? 50 : 80;

    const deficiencyRisk = Math.max(0, 80 - (numberOfSplits * 15));

    // Complexity
    const complexity =
      numberOfSplits <= 2 ? 'simple' :
      numberOfSplits <= 4 ? 'moderate' : 'complex';

    // Suitable for
    const suitableFor: string[] = [];
    if (numberOfSplits <= 3) suitableFor.push('Pequeñas fincas');
    if (numberOfSplits >= 3 && numberOfSplits <= 5) suitableFor.push('Cultivos de alto valor');
    if (numberOfSplits >= 6) suitableFor.push('Sistemas automatizados de fertirriego');

    return {
      strategyName: `${numberOfSplits} Aplicaciones`,
      numberOfSplits,
      nutrientEfficiency: nutrientEff,
      laborEfficiency: laborEff,
      costEfficiency: costEff,
      overallScore,
      leachingRisk: leachingRiskScore,
      deficiencyRisk,
      complexity,
      suitableFor,
      advantages: schedule.recommendations.slice(0, 3),
      disadvantages: schedule.warnings.slice(0, 2)
    };
  }
}
