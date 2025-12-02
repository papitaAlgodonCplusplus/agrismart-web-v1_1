import { Injectable } from '@angular/core';
import {
  IrrigationVolumeInput,
  IrrigationVolumeOutput,
  CalculatorConfig,
  IrrigationPreset,
  IrrigationComparison,
  IrrigationHistoryEvent
} from '../models/irrigation-calculator.models';
import { SubstrateReleaseCurve } from '../models/substrate-analysis.models';

@Injectable({
  providedIn: 'root'
})
export class IrrigationVolumeCalculatorService {

  constructor() { }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Calculate irrigation volumes based on depletion percentage
   * This is the MAIN calculation method
   */
  calculateIrrigationVolume(input: IrrigationVolumeInput): IrrigationVolumeOutput {

    // STEP 1: Calculate water depleted per container
    const waterDepletedPerContainer = this.calculateWaterDepleted(
      input.substrateCurve,
      input.depletionPercentage
    );

    // STEP 2: Add drain percentage to get total volume needed
    const volumeNeededPerContainer = waterDepletedPerContainer;
    const volumeWithDrainPerContainer = waterDepletedPerContainer * (1 + input.targetDrainPercentage / 100);

    // STEP 3: Scale to entire system
    const totalContainers = input.numberOfContainers;
    const totalWaterDepleted = waterDepletedPerContainer * totalContainers;
    const totalVolumeNeeded = volumeNeededPerContainer * totalContainers;
    const totalVolumeWithDrain = volumeWithDrainPerContainer * totalContainers;

    // STEP 4: Calculate per area values
    const volumePerSquareMeter = totalVolumeWithDrain / input.totalArea;
    const precipitationRate = volumePerSquareMeter; // 1 L/m² = 1 mm

    // STEP 5: Calculate duration if flow rate available
    const durationMinutes = undefined; // Will be calculated by separate method if needed

    // STEP 6: Generate recommendation
    const recommendationLevel = this.getRecommendationLevel(input.depletionPercentage);
    const recommendation = this.getRecommendationText(
      input.depletionPercentage,
      input.targetDrainPercentage,
      recommendationLevel
    );
    const reasoning = this.getReasoningPoints(input);

    // STEP 7: Define visual zones
    const zones = this.calculateZones(input.substrateCurve);

    return {
      waterDepletedPerContainer,
      volumeNeededPerContainer,
      volumeWithDrainPerContainer,
      totalWaterDepleted,
      totalVolumeNeeded,
      totalVolumeWithDrain,
      volumePerSquareMeter,
      precipitationRate,
      durationMinutes,
      recommendationLevel,
      recommendation,
      reasoning,
      zones
    };
  }

  /**
   * Calculate irrigation duration based on flow rate
   */
  calculateDuration(
    totalVolume: number,
    flowRateLitersPerMinute: number,
    numberOfValves: number = 1
  ): number {
    const effectiveFlowRate = flowRateLitersPerMinute * numberOfValves;
    return totalVolume / effectiveFlowRate;
  }

  /**
   * Get default calculator configuration
   */
  getDefaultConfig(): CalculatorConfig {
    return {
      showPerContainer: true,
      showPerPlant: true,
      showPerArea: true,
      showDurationCalculator: true,
      defaultDepletionPercentage: 30,
      defaultDrainPercentage: 20,
      minDepletionPercentage: 10,
      maxDepletionPercentage: 100,
      systemFlowRate: 2.0, // 2 L/min default
      colors: {
        optimal: '#28a745',      // Green
        acceptable: '#ffc107',   // Yellow
        caution: '#fd7e14',      // Orange
        critical: '#dc3545'      // Red
      }
    };
  }

  /**
   * Get predefined irrigation strategy presets
   */
  getIrrigationPresets(): IrrigationPreset[] {
    return [
      {
        id: 'conservative',
        name: 'Conservador',
        description: 'Riego frecuente con bajo agotamiento. Mantiene el sustrato siempre húmedo.',
        depletionPercentage: 20,
        drainPercentage: 15,
        icon: 'bi-shield-check',
        suitableFor: ['Plántulas', 'Trasplantes recientes', 'Alta transpiración']
      },
      {
        id: 'balanced',
        name: 'Balanceado',
        description: 'Estrategia óptima para la mayoría de situaciones. Balance entre frecuencia y volumen.',
        depletionPercentage: 30,
        drainPercentage: 20,
        icon: 'bi-brightness-high',
        suitableFor: ['Crecimiento vegetativo', 'Condiciones normales', 'Uso general']
      },
      {
        id: 'efficient',
        name: 'Eficiente',
        description: 'Mayor agotamiento entre riegos. Ahorra agua y mejora oxigenación radicular.',
        depletionPercentage: 40,
        drainPercentage: 20,
        icon: 'bi-water',
        suitableFor: ['Plantas establecidas', 'Ahorro de agua', 'Baja transpiración']
      },
      {
        id: 'stress',
        name: 'Estrés Controlado',
        description: 'Agotamiento significativo para inducir respuestas fisiológicas.',
        depletionPercentage: 50,
        drainPercentage: 25,
        icon: 'bi-exclamation-triangle',
        suitableFor: ['Endurecimiento', 'Mejora de calidad', 'Pre-cosecha']
      }
    ];
  }

  /**
   * Compare calculated volume with historical irrigation events
   */
  compareWithHistory(
    calculatedVolume: number,
    historicalEvents: IrrigationHistoryEvent[]
  ): IrrigationComparison {

    if (historicalEvents.length === 0) {
      return {
        calculatedVolume,
        averageHistoricalVolume: 0,
        difference: 0,
        differencePercentage: 0,
        suggestion: 'No hay datos históricos para comparar'
      };
    }

    const averageHistoricalVolume = historicalEvents.reduce(
      (sum, event) => sum + event.volumeApplied,
      0
    ) / historicalEvents.length;

    const difference = calculatedVolume - averageHistoricalVolume;
    const differencePercentage = (difference / averageHistoricalVolume) * 100;

    let suggestion = '';
    if (Math.abs(differencePercentage) < 10) {
      suggestion = 'El volumen calculado es similar al histórico. Estrategia consistente.';
    } else if (differencePercentage > 10) {
      suggestion = `El volumen calculado es ${differencePercentage.toFixed(1)}% mayor que el histórico. ` +
                  'Considere si las condiciones actuales justifican más agua (mayor VPD, temperatura alta).';
    } else {
      suggestion = `El volumen calculado es ${Math.abs(differencePercentage).toFixed(1)}% menor que el histórico. ` +
                  'Podría estar aplicando demasiada agua o el drenaje es excesivo.';
    }

    return {
      calculatedVolume,
      averageHistoricalVolume,
      difference,
      differencePercentage,
      suggestion
    };
  }

  // ==========================================================================
  // PRIVATE CALCULATION METHODS
  // ==========================================================================

  /**
   * Calculate water depleted from container based on depletion percentage
   *
   * Formula: Water Depleted = Container Volume × ATD% × (Depletion% / 100)
   *
   * Example: 18.2L container, 25.99% ATD, 30% depletion
   * = 18.2 × 0.2599 × 0.30 = 1.42L depleted
   */
  private calculateWaterDepleted(
    curve: SubstrateReleaseCurve,
    depletionPercentage: number
  ): number {
    const containerVolume = curve.containerVolume;
    const totalAvailableWater = curve.waterZones.totalAvailableWater / 100; // Convert to decimal

    const waterDepleted = containerVolume * totalAvailableWater * (depletionPercentage / 100);

    return waterDepleted;
  }

  /**
   * Determine recommendation level based on depletion percentage
   */
  private getRecommendationLevel(
    depletionPercentage: number
  ): 'optimal' | 'acceptable' | 'caution' | 'critical' {
    if (depletionPercentage >= 80) return 'critical';
    if (depletionPercentage >= 60) return 'caution';
    if (depletionPercentage >= 40) return 'acceptable';
    return 'optimal';
  }

  /**
   * Generate recommendation text based on depletion level
   */
  private getRecommendationText(
    depletionPercentage: number,
    drainPercentage: number,
    level: 'optimal' | 'acceptable' | 'caution' | 'critical'
  ): string {
    const recommendations = {
      optimal: `Excelente estrategia. Con ${depletionPercentage}% de agotamiento, mantiene el sustrato ` +
               `en la zona de agua fácilmente disponible. El ${drainPercentage}% de drenaje asegura lixiviación adecuada.`,

      acceptable: `Estrategia aceptable. Con ${depletionPercentage}% de agotamiento, el agua aún está disponible ` +
                  `pero se acerca al límite. Monitoree las condiciones climáticas.`,

      caution: `⚠️ Precaución: ${depletionPercentage}% de agotamiento está en zona de estrés. ` +
               `El agua está menos disponible y la planta podría sufrir. Considere aumentar frecuencia.`,

      critical: `🚨 Crítico: ${depletionPercentage}% de agotamiento es muy alto. ` +
                `Riesgo de marchitez y pérdida de producción. Riegue inmediatamente.`
    };

    return recommendations[level];
  }

  /**
   * Generate detailed reasoning points for the recommendation
   */
  private getReasoningPoints(input: IrrigationVolumeInput): string[] {
    const points: string[] = [];
    const depletion = input.depletionPercentage;
    const curve = input.substrateCurve;

    // Point 1: Water availability zone
    if (depletion <= 40) {
      points.push(
        `Agua en zona fácilmente disponible (${curve.waterZones.easilyAvailableWater.toFixed(1)}% ATD)`
      );
    } else if (depletion <= 70) {
      points.push(
        `Entrando en zona de agua de reserva (${curve.waterZones.reserveWater.toFixed(1)}% del total)`
      );
    } else {
      points.push(
        `⚠️ Más allá del agua de reserva - estrés hídrico probable`
      );
    }

    // Point 2: Matric potential estimate
    const estimatedPsi = this.estimateMatricPotential(depletion, curve);
    points.push(`Potencial mátrico estimado: ~${estimatedPsi.toFixed(1)} kPa`);

    // Point 3: Drain percentage assessment
    if (input.targetDrainPercentage < 15) {
      points.push(`⚠️ Drenaje bajo (${input.targetDrainPercentage}%) - riesgo de acumulación de sales`);
    } else if (input.targetDrainPercentage > 30) {
      points.push(`Drenaje alto (${input.targetDrainPercentage}%) - posible desperdicio de agua y nutrientes`);
    } else {
      points.push(`✓ Drenaje óptimo (${input.targetDrainPercentage}%) para lixiviación`);
    }

    // Point 4: Irrigation frequency implication
    if (depletion <= 25) {
      points.push(`Riegos frecuentes necesarios (posiblemente múltiples por día)`);
    } else if (depletion <= 40) {
      points.push(`Frecuencia moderada (1-2 riegos por día típicamente)`);
    } else {
      points.push(`Menor frecuencia de riego pero mayor estrés entre eventos`);
    }

    return points;
  }

  /**
   * Estimate matric potential based on depletion percentage
   * Uses the substrate curve to interpolate psi from water content
   */
  private estimateMatricPotential(
    depletionPercentage: number,
    curve: SubstrateReleaseCurve
  ): number {
    // Calculate current water content
    const containerCapacity = curve.characteristicPoints.containerCapacity.volumetricWaterContent;
    const totalAvailableWater = curve.waterZones.totalAvailableWater;
    const waterDepleted = totalAvailableWater * (depletionPercentage / 100);
    const currentWaterContent = containerCapacity - waterDepleted;

    // Find corresponding psi from curve
    // Linear interpolation between known points
    const points = curve.dataPoints;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (currentWaterContent <= p1.volumetricWaterContent &&
          currentWaterContent >= p2.volumetricWaterContent) {

        // Linear interpolation
        const fraction = (p1.volumetricWaterContent - currentWaterContent) /
                        (p1.volumetricWaterContent - p2.volumetricWaterContent);
        return p1.matricPotential + fraction * (p2.matricPotential - p1.matricPotential);
      }
    }

    // If not found, return estimate
    return depletionPercentage < 50 ? 3 : 8;
  }

  /**
   * Calculate visual zones for slider/display
   */
  private calculateZones(curve: SubstrateReleaseCurve): any {
    return {
      optimal: { min: 0, max: 40 },
      acceptable: { min: 40, max: 60 },
      caution: { min: 60, max: 80 },
      critical: { min: 80, max: 100 }
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Format volume for display with appropriate unit
   */
  formatVolume(liters: number): string {
    if (liters < 0.1) {
      return `${(liters * 1000).toFixed(0)} mL`;
    } else if (liters < 1) {
      return `${(liters * 1000).toFixed(0)} mL`;
    } else if (liters < 10) {
      return `${liters.toFixed(2)} L`;
    } else {
      return `${liters.toFixed(1)} L`;
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(minutes: number): string {
    if (minutes < 1) {
      return `${(minutes * 60).toFixed(0)} segundos`;
    } else if (minutes < 60) {
      return `${minutes.toFixed(1)} minutos`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}min`;
    }
  }

  /**
   * Get color for depletion level
   */
  getDepletionColor(depletionPercentage: number, config: CalculatorConfig): string {
    if (depletionPercentage >= 80) return config.colors.critical;
    if (depletionPercentage >= 60) return config.colors.caution;
    if (depletionPercentage >= 40) return config.colors.acceptable;
    return config.colors.optimal;
  }
}
