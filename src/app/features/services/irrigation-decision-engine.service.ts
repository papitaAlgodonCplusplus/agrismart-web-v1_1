// src/app/features/services/irrigation-decision-engine.service.ts
// TODO: UNMOCK - Weather forecast integration needed for production use

import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Services
import { IrrigationSectorService } from './irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { KPIOrchestatorService, DailyKPIOutput } from './calculations/kpi-orchestrator.service';
import { IrrigationCalculationsService, IrrigationMetric } from './irrigation-calculations.service';

// Models
import {
  IrrigationRecommendation,
  IrrigationDecisionFactors,
  IrrigationRule,
  RuleEvaluation,
  GrowthStageConfig,
  WeatherForecast
} from './models/irrigation-decision.models';
import { GrowingMedium, Container } from './irrigation-sector.service';

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

const DEFAULT_DEPLETION_THRESHOLD = 40; // % - trigger irrigation at 40% depletion
const HIGH_VPD_THRESHOLD = 1.2; // kPa - high transpiration demand
const LOW_VPD_THRESHOLD = 0.4; // kPa - low transpiration demand
const OPTIMAL_DRAIN_PERCENTAGE_MIN = 15; // %
const OPTIMAL_DRAIN_PERCENTAGE_MAX = 25; // %
const CRITICAL_DEPLETION_THRESHOLD = 60; // % - urgent irrigation needed

// Time of day preferences (24-hour format)
const OPTIMAL_IRRIGATION_HOURS = {
  morning: { start: 6, end: 10 },
  lateAfternoon: { start: 16, end: 18 }
};
const AVOID_IRRIGATION_HOURS = { start: 11, end: 14 }; // midday

// ============================================================================
// GROWTH STAGE CONFIGURATIONS
// ============================================================================

const GROWTH_STAGE_CONFIGS: { [key: string]: GrowthStageConfig } = {
  germination: {
    stage: 'germination',
    depletionThreshold: 20, // Keep substrate moist
    optimalMoistureRange: { min: 35, max: 40 },
    irrigationFrequency: 3,
    waterStressSensitivity: 'high'
  },
  vegetative: {
    stage: 'vegetative',
    depletionThreshold: 30,
    optimalMoistureRange: { min: 30, max: 38 },
    irrigationFrequency: 2,
    waterStressSensitivity: 'medium'
  },
  flowering: {
    stage: 'flowering',
    depletionThreshold: 25, // More sensitive during flowering
    optimalMoistureRange: { min: 32, max: 38 },
    irrigationFrequency: 2,
    waterStressSensitivity: 'high'
  },
  fruiting: {
    stage: 'fruiting',
    depletionThreshold: 30,
    optimalMoistureRange: { min: 30, max: 36 },
    irrigationFrequency: 2,
    waterStressSensitivity: 'high'
  },
  harvest: {
    stage: 'harvest',
    depletionThreshold: 40, // Can tolerate more depletion
    optimalMoistureRange: { min: 28, max: 35 },
    irrigationFrequency: 1,
    waterStressSensitivity: 'low'
  }
};

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class IrrigationDecisionEngineService {

  constructor(
    private irrigationService: IrrigationSectorService,
    private cropProductionService: CropProductionService,
    private kpiOrchestrator: KPIOrchestatorService,
    private irrigationCalc: IrrigationCalculationsService
  ) { }

  // ============================================================================
  // MAIN RECOMMENDATION METHOD
  // ============================================================================

  /**
   * Get irrigation recommendation for a crop production
   * @param cropProductionId - The crop production to evaluate
   * @returns Observable<IrrigationRecommendation>
   */
  getRecommendation(cropProductionId: number): Observable<IrrigationRecommendation> {
    return forkJoin({
      cropProduction: this.cropProductionService.getById(cropProductionId),
      soilMoisture: this.getSoilMoisture(cropProductionId),
      substrate: this.getSubstrateProperties(cropProductionId),
      climate: this.getCurrentClimate(cropProductionId),
      history: this.getRecentIrrigationHistory(cropProductionId),
      container: this.getContainerInfo(cropProductionId)
    }).pipe(
      map(data => {
        // Build decision factors
        const factors = this.buildDecisionFactors(data);

        // Evaluate all rules
        const ruleResults = this.evaluateRules(factors);

        // Generate recommendation
        const recommendation = this.generateRecommendation(
          factors,
          ruleResults,
          data.cropProduction,
          data.substrate,
          data.container
        );

        return recommendation;
      }),
      catchError(error => {
        console.error('Error getting irrigation recommendation:', error);
        return of(this.getEmergencyRecommendation(error));
      })
    );
  }

  // ============================================================================
  // DATA GATHERING METHODS
  // ============================================================================

  /**
   * Get current soil moisture from sensors
   */
  private getSoilMoisture(cropProductionId: number): Observable<number> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // TODO: Get device IDs associated with this crop production
    // For now, get all recent data and filter
    return this.irrigationService.getDeviceRawData(
      undefined,
      yesterday.toISOString(),
      now.toISOString()
    ).pipe(
      map(rawData => {
        // Filter for soil moisture sensors
        const moistureReadings = rawData.filter((d: any) =>
          ['water_SOIL', 'water_SOIL_original', 'conduct_SOIL'].includes(d.sensor)
        );

        if (moistureReadings.length === 0) {
          console.warn('No soil moisture data found');
          return 30; // Default assumption: 30% volumetric
        }

        // Get most recent reading
        const sortedReadings = moistureReadings.sort((a: any, b: any) =>
          new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
        );

        const latestReading = sortedReadings[0];
        const moisture = typeof latestReading.payload === 'number'
          ? latestReading.payload
          : parseFloat(latestReading.payload);

        return moisture;
      }),
      catchError(error => {
        console.error('Error fetching soil moisture:', error);
        return of(30); // Default fallback
      })
    );
  }

  /**
   * Get substrate properties (container capacity, wilting point, etc.)
   */
  private getSubstrateProperties(cropProductionId: number): Observable<GrowingMedium> {
    return this.cropProductionService.getById(cropProductionId).pipe(
      map(cropProduction => {
        // Get growing medium from crop production
        // TODO: Need to fetch actual GrowingMedium entity
        // For now, return default values
        return {
          id: 1,
          catalogId: 1,
          name: 'Default Growing Medium',
          containerCapacityPercentage: 40,
          permanentWiltingPoint: 15,
          easelyAvailableWaterPercentage: 60,
          reserveWaterPercentage: 25,
          totalAvailableWaterPercentage: 85,
          active: true,
          dateCreated: new Date(),
          createdBy: 1
        } as GrowingMedium;
      })
    );
  }

  /**
   * Get current climate conditions (VPD, temperature, humidity)
   */
  private getCurrentClimate(cropProductionId: number): Observable<any> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return this.irrigationService.getDeviceRawData(
      undefined,
      yesterday.toISOString(),
      now.toISOString()
    ).pipe(
      map(rawData => {
        // Get temperature readings
        const tempReadings = rawData.filter((d: any) =>
          ['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(d.sensor)
        );

        // TODO: UNMOCK - Get humidity readings from real sensors
        // Currently mocked because humidity sensors not in sample data
        const currentTemp = tempReadings.length > 0
          ? parseFloat(tempReadings[tempReadings.length - 1].payload)
          : 25;

        const currentHumidity = 65; // MOCKED

        // Calculate VPD
        const vpd = this.calculateVPD(currentTemp, currentHumidity);

        return {
          temperature: currentTemp,
          humidity: currentHumidity,
          vpd: vpd,
          timestamp: new Date()
        };
      }),
      catchError(error => {
        console.error('Error fetching climate data:', error);
        return of({
          temperature: 25,
          humidity: 65,
          vpd: 1.0,
          timestamp: new Date()
        });
      })
    );
  }

  /**
   * Get recent irrigation history
   */
  private getRecentIrrigationHistory(cropProductionId: number): Observable<any> {
    // TODO: Implement proper irrigation history fetching
    // For now, return mock data
    return of({
      lastIrrigationTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      recentDrainagePercentage: 20,
      averageDailyVolume: 5.0 // L/plant/day
    });
  }

  /**
   * Get container information
   */
  private getContainerInfo(cropProductionId: number): Observable<Container> {
    return this.cropProductionService.getById(cropProductionId).pipe(
      map(cropProduction => {
        // TODO: Get actual container from API
        // For now, return default
        return {
          id: 1,
          catalogId: 1,
          containerTypeId: 1,
          name: 'Default Container',
          volume: 10, // liters
          height: 200, // mm
          width: 250, // mm
          length: 250, // mm
          upperDiameter: 250, // mm
          lowerDiameter: 200, // mm
          material: 'Plastic',
          active: true,
          dateCreated: new Date(),
          createdBy: 1
        } as Container;
      })
    );
  }

  // ============================================================================
  // DECISION LOGIC METHODS
  // ============================================================================

  /**
   * Build decision factors from collected data
   */
  private buildDecisionFactors(data: any): IrrigationDecisionFactors {
    const currentMoisture = data.soilMoisture;
    const containerCapacity = data.substrate.containerCapacityPercentage || 40;
    const depletionPercentage = ((containerCapacity - currentMoisture) / containerCapacity) * 100;

    const now = new Date();
    const hoursSinceLastIrrigation = data.history.lastIrrigationTime
      ? (now.getTime() - new Date(data.history.lastIrrigationTime).getTime()) / (1000 * 60 * 60)
      : 24;

    const currentHour = now.getHours();
    const isOptimalTime = this.isOptimalTimeToIrrigate(currentHour);

    return {
      currentMoisture,
      containerCapacity,
      depletionPercentage,
      currentVPD: data.climate.vpd,
      currentTemperature: data.climate.temperature,
      currentHumidity: data.climate.humidity,
      recentDrainagePercentage: data.history.recentDrainagePercentage,
      lastIrrigationTime: data.history.lastIrrigationTime,
      hoursSinceLastIrrigation,
      currentHour,
      isOptimalTime,
      growthStage: this.determineGrowthStage(data.cropProduction),
      cropWaterStress: Math.max(0, depletionPercentage - 30) // Stress starts after 30% depletion
    };
  }

  /**
   * Evaluate all irrigation rules
   */
  private evaluateRules(factors: IrrigationDecisionFactors): RuleEvaluation[] {
    const rules: IrrigationRule[] = [
      this.moistureDepletionRule(),
      this.highVPDRule(),
      this.drainageFeedbackRule(),
      this.timeOfDayRule(),
      this.growthStageRule(),
      this.weatherForecastRule()
    ];

    return rules.map(rule => rule.evaluate(factors));
  }

  /**
   * Generate final recommendation from rule results
   */
  private generateRecommendation(
    factors: IrrigationDecisionFactors,
    ruleResults: RuleEvaluation[],
    cropProduction: any,
    substrate: GrowingMedium,
    container: Container
  ): IrrigationRecommendation {
    // Determine if we should irrigate
    const triggeringRules = ruleResults.filter(r => r.shouldTrigger);
    const shouldIrrigate = triggeringRules.length > 0;

    if (!shouldIrrigate) {
      return {
        shouldIrrigate: false,
        recommendedVolume: 0,
        recommendedDuration: 0,
        totalVolume: 0,
        confidence: 85,
        reasoning: ['Soil moisture levels are adequate', 'No urgent conditions detected'],
        urgency: 'low',
        nextRecommendedCheck: new Date(Date.now() + 2 * 60 * 60 * 1000) // Check again in 2 hours
      };
    }

    // Calculate recommended volume
    const baseVolume = this.calculateIrrigationVolume(factors, substrate, container);

    // Apply volume adjustments from rules
    let volumeMultiplier = 1.0;
    ruleResults.forEach(result => {
      if (result.volumeAdjustment) {
        volumeMultiplier *= result.volumeAdjustment;
      }
    });

    const recommendedVolume = baseVolume * volumeMultiplier;

    // Calculate duration (assuming 2 L/min flow rate)
    const flowRate = 2.0; // L/min - TODO: Get from system configuration
    const recommendedDuration = Math.ceil(recommendedVolume / flowRate);

    // Calculate total volume (for all containers)
    const containersPerM2 = 1 / (
      (cropProduction.betweenRowDistance || 1.5) *
      (cropProduction.betweenContainerDistance || 0.3)
    );
    const totalContainers = Math.ceil((cropProduction.area || 100) * containersPerM2);
    const totalVolume = recommendedVolume * totalContainers;

    // Determine urgency
    const urgency = this.determineUrgency(factors, ruleResults);

    // Build reasoning
    const reasoning = ruleResults
      .filter(r => r.shouldTrigger)
      .map(r => r.reason);

    // Calculate confidence
    const confidence = this.calculateConfidence(factors, ruleResults);

    // Determine best time to execute
    let bestTimeToExecute: Date | undefined;
    if (!factors.isOptimalTime && urgency !== 'critical') {
      bestTimeToExecute = this.calculateNextOptimalTime();
      reasoning.push(`Consider waiting until ${bestTimeToExecute.toLocaleTimeString()} for optimal conditions`);
    }

    return {
      shouldIrrigate,
      recommendedVolume,
      recommendedDuration,
      totalVolume,
      confidence,
      reasoning,
      urgency,
      bestTimeToExecute,
      nextRecommendedCheck: new Date(Date.now() + 4 * 60 * 60 * 1000) // Check again in 4 hours
    };
  }

  // ============================================================================
  // IRRIGATION RULES
  // ============================================================================

  /**
   * Rule 1: Soil moisture depletion
   */
  private moistureDepletionRule(): IrrigationRule {
    return {
      name: 'Moisture Depletion',
      priority: 10, // Highest priority
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        const depletionThreshold = factors.growthStage
          ? GROWTH_STAGE_CONFIGS[factors.growthStage]?.depletionThreshold || DEFAULT_DEPLETION_THRESHOLD
          : DEFAULT_DEPLETION_THRESHOLD;

        if (factors.depletionPercentage >= CRITICAL_DEPLETION_THRESHOLD) {
          return {
            shouldTrigger: true,
            confidence: 95,
            reason: `CRITICAL: Soil moisture depletion at ${factors.depletionPercentage.toFixed(1)}% (threshold: ${CRITICAL_DEPLETION_THRESHOLD}%)`,
            urgency: 'critical',
            volumeAdjustment: 1.1 // 10% more volume for recovery
          };
        }

        if (factors.depletionPercentage >= depletionThreshold) {
          return {
            shouldTrigger: true,
            confidence: 85,
            reason: `Soil moisture depletion at ${factors.depletionPercentage.toFixed(1)}% exceeds threshold (${depletionThreshold}%)`,
            urgency: 'high'
          };
        }

        return {
          shouldTrigger: false,
          confidence: 90,
          reason: `Soil moisture adequate (depletion: ${factors.depletionPercentage.toFixed(1)}%)`
        };
      }
    };
  }

  /**
   * Rule 2: High VPD compensation
   */
  private highVPDRule(): IrrigationRule {
    return {
      name: 'High VPD',
      priority: 7,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (!factors.currentVPD) {
          return { shouldTrigger: false, confidence: 50, reason: 'VPD data not available' };
        }

        if (factors.currentVPD > HIGH_VPD_THRESHOLD) {
          return {
            shouldTrigger: true,
            confidence: 75,
            reason: `High VPD detected (${factors.currentVPD.toFixed(2)} kPa) - increased transpiration demand`,
            urgency: 'medium',
            volumeAdjustment: 1.15 // 15% more volume to compensate
          };
        }

        if (factors.currentVPD < LOW_VPD_THRESHOLD) {
          return {
            shouldTrigger: false,
            confidence: 70,
            reason: `Low VPD (${factors.currentVPD.toFixed(2)} kPa) - reduced transpiration`,
            volumeAdjustment: 0.9 // 10% less volume
          };
        }

        return {
          shouldTrigger: false,
          confidence: 60,
          reason: `VPD in normal range (${factors.currentVPD.toFixed(2)} kPa)`
        };
      }
    };
  }

  /**
   * Rule 3: Drainage feedback
   */
  private drainageFeedbackRule(): IrrigationRule {
    return {
      name: 'Drainage Feedback',
      priority: 6,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (!factors.recentDrainagePercentage) {
          return { shouldTrigger: false, confidence: 50, reason: 'Drainage data not available' };
        }

        const drain = factors.recentDrainagePercentage;

        if (drain > OPTIMAL_DRAIN_PERCENTAGE_MAX) {
          return {
            shouldTrigger: false,
            confidence: 70,
            reason: `Recent drainage high (${drain.toFixed(1)}%) - reduce irrigation volume`,
            volumeAdjustment: 0.85 // 15% less volume
          };
        }

        if (drain < OPTIMAL_DRAIN_PERCENTAGE_MIN) {
          return {
            shouldTrigger: false,
            confidence: 65,
            reason: `Recent drainage low (${drain.toFixed(1)}%) - increase irrigation volume`,
            volumeAdjustment: 1.15 // 15% more volume
          };
        }

        return {
          shouldTrigger: false,
          confidence: 80,
          reason: `Drainage in optimal range (${drain.toFixed(1)}%)`
        };
      }
    };
  }

  /**
   * Rule 4: Time of day optimization
   */
  private timeOfDayRule(): IrrigationRule {
    return {
      name: 'Time of Day',
      priority: 5,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        const hour = factors.currentHour;

        // Check if midday (avoid)
        if (hour >= AVOID_IRRIGATION_HOURS.start && hour <= AVOID_IRRIGATION_HOURS.end) {
          return {
            shouldTrigger: false,
            confidence: 70,
            reason: `Midday hours (${hour}:00) - not optimal for irrigation`,
            urgency: 'low'
          };
        }

        // Check if optimal time
        if (factors.isOptimalTime) {
          return {
            shouldTrigger: false, // Doesn't trigger on its own, but supports others
            confidence: 85,
            reason: `Optimal time for irrigation (${hour}:00)`
          };
        }

        return {
          shouldTrigger: false,
          confidence: 60,
          reason: `Acceptable time for irrigation (${hour}:00)`
        };
      }
    };
  }

  /**
   * Rule 5: Growth stage considerations
   */
  private growthStageRule(): IrrigationRule {
    return {
      name: 'Growth Stage',
      priority: 8,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (!factors.growthStage) {
          return { shouldTrigger: false, confidence: 50, reason: 'Growth stage not determined' };
        }

        const stageConfig = GROWTH_STAGE_CONFIGS[factors.growthStage];

        if (stageConfig.waterStressSensitivity === 'high' && factors.cropWaterStress && factors.cropWaterStress > 20) {
          return {
            shouldTrigger: true,
            confidence: 80,
            reason: `${stageConfig.stage} stage is highly sensitive to water stress (current stress: ${factors.cropWaterStress.toFixed(1)}%)`,
            urgency: 'high'
          };
        }

        return {
          shouldTrigger: false,
          confidence: 70,
          reason: `Growth stage (${stageConfig.stage}) water requirements considered`
        };
      }
    };
  }

  /**
   * Rule 6: Weather forecast (mocked for now)
   */
  private weatherForecastRule(): IrrigationRule {
    return {
      name: 'Weather Forecast',
      priority: 4,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        // TODO: UNMOCK - Integrate real weather API
        // For now, assume no rain forecasted
        const forecastedRainfall = factors.forecastedRainfall || 0;

        if (forecastedRainfall > 5) { // mm
          return {
            shouldTrigger: false,
            confidence: 65,
            reason: `Rain forecasted (${forecastedRainfall}mm) - delay irrigation`,
            volumeAdjustment: 0.7 // Reduce volume if must irrigate
          };
        }

        return {
          shouldTrigger: false,
          confidence: 50,
          reason: 'No significant rainfall forecasted (weather data mocked)'
        };
      }
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Calculate VPD from temperature and humidity
   */
  private calculateVPD(tempC: number, relativeHumidity: number): number {
    // Saturation vapor pressure (kPa)
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));

    // Actual vapor pressure (kPa)
    const avp = (relativeHumidity / 100) * svp;

    // VPD = SVP - AVP
    return svp - avp;
  }

  /**
   * Check if current time is optimal for irrigation
   */
  private isOptimalTimeToIrrigate(hour: number): boolean {
    return (
      (hour >= OPTIMAL_IRRIGATION_HOURS.morning.start && hour <= OPTIMAL_IRRIGATION_HOURS.morning.end) ||
      (hour >= OPTIMAL_IRRIGATION_HOURS.lateAfternoon.start && hour <= OPTIMAL_IRRIGATION_HOURS.lateAfternoon.end)
    );
  }

  /**
   * Calculate next optimal irrigation time
   */
  private calculateNextOptimalTime(): Date {
    const now = new Date();
    const hour = now.getHours();
    const nextTime = new Date(now);

    // If before morning window, schedule for morning
    if (hour < OPTIMAL_IRRIGATION_HOURS.morning.start) {
      nextTime.setHours(OPTIMAL_IRRIGATION_HOURS.morning.start, 0, 0, 0);
    }
    // If between morning and afternoon, schedule for afternoon
    else if (hour < OPTIMAL_IRRIGATION_HOURS.lateAfternoon.start) {
      nextTime.setHours(OPTIMAL_IRRIGATION_HOURS.lateAfternoon.start, 0, 0, 0);
    }
    // If after afternoon window, schedule for next morning
    else {
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(OPTIMAL_IRRIGATION_HOURS.morning.start, 0, 0, 0);
    }

    return nextTime;
  }

  /**
   * Determine growth stage from crop production data
   */
  private determineGrowthStage(cropProduction: any): string {
    // TODO: Calculate from planting date
    // For now, return default
    return 'vegetative';
  }

  /**
   * Calculate irrigation volume based on depletion and substrate properties
   */
  private calculateIrrigationVolume(
    factors: IrrigationDecisionFactors,
    substrate: GrowingMedium,
    container: Container
  ): number {
    const containerVolume = container.volume || 10; // liters
    const availableWater = (substrate.totalAvailableWaterPercentage || 85) / 100;
    const depletionFraction = factors.depletionPercentage / 100;

    // Volume needed to restore to optimal moisture
    const baseVolume = containerVolume * availableWater * depletionFraction;

    // Add 20% for target drainage
    const targetDrain = 0.20;
    const totalVolume = baseVolume * (1 + targetDrain);

    return totalVolume;
  }

  /**
   * Determine urgency level from factors and rules
   */
  private determineUrgency(
    factors: IrrigationDecisionFactors,
    ruleResults: RuleEvaluation[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Check for critical urgency
    const hasCritical = ruleResults.some(r => r.urgency === 'critical');
    if (hasCritical) return 'critical';

    // Check for high urgency
    const hasHigh = ruleResults.some(r => r.urgency === 'high');
    if (hasHigh) return 'high';

    // Check depletion level
    if (factors.depletionPercentage >= 50) return 'high';
    if (factors.depletionPercentage >= 40) return 'medium';

    return 'low';
  }

  /**
   * Calculate overall confidence in recommendation
   */
  private calculateConfidence(
    factors: IrrigationDecisionFactors,
    ruleResults: RuleEvaluation[]
  ): number {
    // Average confidence from all rules
    const avgConfidence = ruleResults.reduce((sum, r) => sum + r.confidence, 0) / ruleResults.length;

    // Adjust based on data availability
    let dataQualityFactor = 1.0;

    if (!factors.currentVPD) dataQualityFactor *= 0.95;
    if (!factors.recentDrainagePercentage) dataQualityFactor *= 0.95;
    if (!factors.lastIrrigationTime) dataQualityFactor *= 0.90;

    return Math.round(avgConfidence * dataQualityFactor);
  }

  /**
   * Get emergency recommendation when errors occur
   */
  private getEmergencyRecommendation(error: any): IrrigationRecommendation {
    return {
      shouldIrrigate: false,
      recommendedVolume: 0,
      recommendedDuration: 0,
      totalVolume: 0,
      confidence: 30,
      reasoning: [
        'Unable to gather sufficient data for recommendation',
        'Manual inspection recommended',
        `Error: ${error.message || 'Unknown error'}`
      ],
      urgency: 'low',
      nextRecommendedCheck: new Date(Date.now() + 30 * 60 * 1000) // Check again in 30 minutes
    };
  }
}
