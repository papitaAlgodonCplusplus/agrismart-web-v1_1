// src/app/features/services/irrigation-decision-engine.service.ts
// TODO: UNMOCK - Weather forecast integration needed for production use

import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

// Services
import { IrrigationSectorService } from './irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { KPIOrchestatorService, DailyKPIOutput } from './calculations/kpi-orchestrator.service';
import { IrrigationCalculationsService, IrrigationMetric } from './irrigation-calculations.service';
import { GrowingMediumService, GrowingMedium as GrowingMediumEntity } from '../growing-medium/services/growing-medium.service';
import { ContainerService } from './container.service';

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
    private irrigationCalc: IrrigationCalculationsService,
    private growingMediumService: GrowingMediumService,
    private containerService: ContainerService
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
        return throwError(() => error);
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
          console.error('No soil moisture data found - water_SOIL, water_SOIL_original, or conduct_SOIL sensor required');
          throw new Error('No soil moisture sensor data available');
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
        throw error;
      })
    );
  }

  /**
   * Get substrate properties (container capacity, wilting point, etc.)
   */
  private getSubstrateProperties(cropProductionId: number): Observable<GrowingMedium> {
    return this.growingMediumService.getAll(false).pipe(
      map(response => {
        console.log('Growing medium response:', response);
        // Extract growing medium array from response
        let growingMedia = [];
        growingMedia = response.growingMediums;


        if (growingMedia.length === 0) {
          console.error('No active growing medium found - GrowingMedium data is required');
          throw new Error('No active GrowingMedium found');
        }

        const growingMedium = growingMedia[0];

        // Validate required fields
        if (!growingMedium.containerCapacityPercentage) {
          console.error('GrowingMedium missing containerCapacityPercentage');
          throw new Error('GrowingMedium containerCapacityPercentage is required');
        }

        if (!growingMedium.permanentWiltingPoint) {
          console.error('GrowingMedium missing permanentWiltingPoint');
          throw new Error('GrowingMedium permanentWiltingPoint is required');
        }

        return growingMedium as GrowingMedium;
      }),
      catchError(error => {
        console.error('Error fetching growing medium properties:', error);
        throw error;
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

        if (tempReadings.length === 0) {
          console.error('No temperature data found - TEMP_SOIL, TempC_DS18B20, or temp_SOIL sensor required');
          throw new Error('No temperature sensor data available');
        }

        const currentTemp = parseFloat(tempReadings[tempReadings.length - 1].payload);

        // Get humidity readings
        const humidityReadings = rawData.filter((d: any) =>
          ['HUM', 'Hum_SHT2x'].includes(d.sensor)
        );

        if (humidityReadings.length === 0) {
          console.error('No humidity data found - HUM or Hum_SHT2x sensor required');
          throw new Error('No humidity sensor data available');
        }

        const currentHumidity = parseFloat(humidityReadings[humidityReadings.length - 1].payload);

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
        throw error;
      })
    );
  }

  /**
   * Get recent irrigation history from Water_flow_value and Total_pulse sensors
   */
  private getRecentIrrigationHistory(cropProductionId: number): Observable<any> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return this.irrigationService.getDeviceRawData(
      undefined,
      sevenDaysAgo.toISOString(),
      now.toISOString()
    ).pipe(
      map(rawData => {
        // Detect flow events using the same logic as dashboard
        const flowEvents = this.detectFlowEvents(rawData);

        if (flowEvents.length === 0) {
          console.error('No irrigation flow events detected in the last 7 days - cannot determine irrigation history');
          throw new Error('No irrigation flow events detected - Water_flow_value or Total_pulse sensor data required');
        }

        // Get the most recent flow event
        const sortedEvents = flowEvents.sort((a, b) =>
          b.changeDetectedAt.getTime() - a.changeDetectedAt.getTime()
        );
        const lastEvent = sortedEvents[0];

        // Calculate average daily volume (total volume / days)
        const totalVolume = flowEvents.reduce((sum, event) =>
          sum + (event.volumeOfWater || 0), 0
        );
        const daysCovered = (now.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24);
        const averageDailyVolume = totalVolume / daysCovered;

        // Calculate drainage percentage from drain sensors
        const drainReadings = rawData.filter((d: any) =>
          d.sensor && typeof d.sensor === 'string' && d.sensor.toLowerCase().includes('drain')
        );

        let recentDrainagePercentage = 0;

        if (drainReadings.length > 0 && totalVolume > 0) {
          // Sum up drain volumes
          const totalDrainVolume = drainReadings.reduce((sum, reading) => {
            const drainValue = typeof reading.payload === 'number'
              ? reading.payload
              : parseFloat(reading.payload);
            return sum + (isNaN(drainValue) ? 0 : drainValue);
          }, 0);

          // Calculate drainage as percentage of irrigation volume
          recentDrainagePercentage = (totalDrainVolume / totalVolume) * 100;

          // Clamp to reasonable range (0-100%)
          recentDrainagePercentage = Math.max(0, Math.min(100, recentDrainagePercentage));
        }

        return {
          lastIrrigationTime: lastEvent.changeDetectedAt,
          recentDrainagePercentage,
          averageDailyVolume
        };
      }),
      catchError(error => {
        console.error('Error fetching irrigation history:', error);
        throw error;
      })
    );
  }

  /**
   * Detect flow events based on payload changes in Water_flow_value and Total_pulse sensors
   * (Same logic as dashboard component)
   */
  private detectFlowEvents(rawDeviceData: any[]): any[] {
    const flowEvents: any[] = [];

    // Group data by deviceId and sensor
    const deviceSensorMap = new Map<string, Map<string, any[]>>();

    rawDeviceData.forEach((data: any) => {
      const sensor = data.sensor;

      // Only process Water_flow_value and Total_pulse sensors
      if (sensor !== 'Water_flow_value' && sensor !== 'Total_pulse') {
        return;
      }

      const deviceId = data.deviceId;

      if (!deviceSensorMap.has(deviceId)) {
        deviceSensorMap.set(deviceId, new Map());
      }

      const sensorMap = deviceSensorMap.get(deviceId)!;
      if (!sensorMap.has(sensor)) {
        sensorMap.set(sensor, []);
      }

      sensorMap.get(sensor)!.push(data);
    });

    // Process each device separately
    deviceSensorMap.forEach((sensorMap, deviceId) => {
      // Sort readings by time for each sensor
      sensorMap.forEach((readings, sensorType) => {
        readings.sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
      });

      // Track which timestamps already have events to avoid duplicates
      const eventTimestamps = new Set<string>();

      // Detect changes in Water_flow_value
      if (sensorMap.has('Water_flow_value')) {
        const waterFlowReadings = sensorMap.get('Water_flow_value')!;

        for (let i = 1; i < waterFlowReadings.length; i++) {
          const current = waterFlowReadings[i];
          const previous = waterFlowReadings[i - 1];

          const currentPayload = parseFloat(current.payload);
          const previousPayload = parseFloat(previous.payload);
          const currentTime = new Date(current.recordDate);
          const previousTime = new Date(previous.recordDate);

          // Check if there was a change in payload
          if (currentPayload !== previousPayload) {
            const timeDiff = currentTime.getTime() - previousTime.getTime();
            const timeKey = currentTime.toISOString();

            // Only add if not already recorded at this timestamp
            if (!eventTimestamps.has(timeKey)) {
              flowEvents.push({
                deviceId: deviceId,
                sensorType: 'Water_flow_value',
                changeDetectedAt: currentTime,
                previousPayload: previousPayload,
                currentPayload: currentPayload,
                volumeOfWater: currentPayload,
                timeDifference: timeDiff
              });
              eventTimestamps.add(timeKey);
            }
          }
        }
      }

      // Detect changes in Total_pulse (only if not already counted)
      if (sensorMap.has('Total_pulse')) {
        const totalPulseReadings = sensorMap.get('Total_pulse')!;

        for (let i = 1; i < totalPulseReadings.length; i++) {
          const current = totalPulseReadings[i];
          const previous = totalPulseReadings[i - 1];

          const currentPayload = parseFloat(current.payload);
          const previousPayload = parseFloat(previous.payload);
          const currentTime = new Date(current.recordDate);
          const previousTime = new Date(previous.recordDate);
          const timeKey = currentTime.toISOString();

          // Only add if there was a change AND it's not already recorded
          if (currentPayload !== previousPayload && !eventTimestamps.has(timeKey)) {
            const timeDiff = currentTime.getTime() - previousTime.getTime();

            flowEvents.push({
              deviceId: deviceId,
              sensorType: 'Total_pulse',
              changeDetectedAt: currentTime,
              previousPayload: previousPayload,
              currentPayload: currentPayload,
              timeDifference: timeDiff
            });
            eventTimestamps.add(timeKey);
          }
        }
      }
    });

    return flowEvents;
  }

  /**
   * Get container information
   */
  private getContainerInfo(cropProductionId: number): Observable<Container> {
    return this.cropProductionService.getById(cropProductionId).pipe(
      switchMap((cropProduction: any) => {
        console.log('Crop production for container info:', cropProduction);

        // Try different paths to extract containerId
        let containerId: number | undefined;

        if (cropProduction?.cropProduction?.containerId) {
          containerId = cropProduction.cropProduction.containerId;
        } else if (cropProduction?.containerId) {
          containerId = cropProduction.containerId;
        } else if (cropProduction?.result?.cropProduction?.containerId) {
          containerId = cropProduction.result.cropProduction.containerId;
        } else if (cropProduction?.result?.containerId) {
          containerId = cropProduction.result.containerId;
        }

        // Validate containerId
        if (!containerId || typeof containerId !== 'number' || containerId <= 0) {
          console.error('CropProduction missing valid containerId. CropProduction:', cropProduction);
          throw new Error(`CropProduction (ID: ${cropProductionId}) must have a valid containerId for container information`);
        }

        console.log('Using containerId:', containerId);

        // Fetch the actual container from the API
        return this.containerService.getById(containerId);
      }),
      map(response => {
        console.log('Container response:', response);
        // Extract container from response
        if (response && response.result && response.result.container) {
          return response.result.container;
        } else if (response && response.container) {
          return response.container;
        } else if (response && response.id) {
          return response;
        }
        throw new Error('Invalid container response format');
      }),
      catchError(error => {
        console.error('Error fetching container info:', error);
        throw error;
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
      reasoning: ['Los niveles de humedad del suelo son adecuados', 'No se detectaron condiciones urgentes'],
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

}
