// src/app/features/services/irrigation-decision-engine.service.ts
// TODO: UNMOCK - Weather forecast integration needed for production use

import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

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
  RuleEvaluationDisplay,
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

    return this.irrigationService.getDeviceRawData(
      undefined,
      yesterday.toISOString(),
      now.toISOString()
    ).pipe(
      map(rawData => {
        const moistureReadings = rawData.filter((d: any) =>
          ['water_SOIL', 'water_SOIL_original', 'conduct_SOIL'].includes(d.sensor)
        );

        if (moistureReadings.length === 0) {
          console.error('Sin datos de sensor de humedad de suelo (water_SOIL, water_SOIL_original, conduct_SOIL)');
          throw new Error('Sin datos de sensor de humedad de suelo');
        }

        const sorted = moistureReadings.sort((a: any, b: any) =>
          new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
        );
        const moisture = typeof sorted[0].payload === 'number'
          ? sorted[0].payload
          : parseFloat(sorted[0].payload);

        if (isNaN(moisture)) {
          console.error('Valor de humedad de suelo inválido:', sorted[0].payload);
          throw new Error('Valor de humedad de suelo inválido');
        }

        return moisture;
      }),
      catchError(error => {
        console.error('Error al obtener humedad de suelo:', error);
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
        const growingMedia = response.growingMediums ?? [];

        if (growingMedia.length === 0) {
          console.error('No se encontró ningún medio de cultivo activo');
          throw new Error('No se encontró ningún medio de cultivo activo');
        }

        const growingMedium = growingMedia[0];

        if (!growingMedium.containerCapacityPercentage) {
          console.error('Medio de cultivo sin containerCapacityPercentage');
          throw new Error('Medio de cultivo sin containerCapacityPercentage');
        }

        if (!growingMedium.permanentWiltingPoint) {
          console.error('Medio de cultivo sin permanentWiltingPoint');
          throw new Error('Medio de cultivo sin permanentWiltingPoint');
        }

        return growingMedium as GrowingMedium;
      }),
      catchError(error => {
        console.error('Error al obtener propiedades del sustrato:', error);
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
        // print unique sensor types for debugging
        const sensorTypes = [...new Set(rawData.map((d: any) => d.sensor))];
        console.log('Unique sensor types:', sensorTypes);

        const tempReadings = rawData.filter((d: any) =>
          ['temp_SOIL', 'temp_DS18B20', 'TEMP_SOIL', 'TempC_DS18B20'].includes(d.sensor)
        );
        const humidityReadings = rawData.filter((d: any) =>
          ['HUM', 'Hum_SHT2x'].includes(d.sensor)
        );

        if (tempReadings.length === 0) {
          console.error('Sin datos de sensor de temperatura (temp_SOIL, temp_DS18B20)');
          throw new Error('Sin datos de sensor de temperatura');
        }

        const currentTemp = parseFloat(tempReadings[tempReadings.length - 1].payload);

        // Humidity sensor is optional — hardware may not include one
        const currentHumidity = humidityReadings.length > 0
          ? parseFloat(humidityReadings[humidityReadings.length - 1].payload)
          : null;

        const vpd = currentHumidity !== null
          ? this.calculateVPD(currentTemp, currentHumidity)
          : null;

        if (currentHumidity === null) {
          console.warn('Sin sensor de humedad relativa (HUM, Hum_SHT2x) — VPD no disponible');
        }

        return { temperature: currentTemp, humidity: currentHumidity, vpd, timestamp: new Date() };
      }),
      catchError(error => {
        console.error('Error al obtener datos climáticos:', error);
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
          console.error('Sin eventos de flujo de riego en los últimos 7 días (Water_flow_value, Total_pulse)');
          throw new Error('Sin historial de eventos de riego');
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
          d.sensor && typeof d.sensor === 'string' && d.sensor.toLowerCase().includes('gauge')
        ); // 11218691

        let recentDrainagePercentage = 0;

        if (drainReadings.length > 0 && totalVolume > 0) {
          // Sum up drain volumes
          const totalDrainVolume = drainReadings.reduce((sum, reading) => {
            const drainValue = typeof reading.payload === 'number'
              ? reading.payload
              : parseFloat(reading.payload);
            return sum + (isNaN(drainValue) ? 0 : drainValue);
          }, 0);

          console.log(`Total irrigation volume in last 7 days: ${totalVolume.toFixed(2)} L, Total drainage volume: ${totalDrainVolume.toFixed(2)} L`);

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
        console.error('Error al obtener historial de riego:', error);
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
        console.error('Error al obtener información del contenedor:', error);
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
    console.log('Building decision factors with data:', data);
    const containerCapacity = data.substrate.containerCapacityPercentage;
    const currentMoisture = data.soilMoisture as number;
    const depletionPercentage = Math.max(0, ((containerCapacity - currentMoisture) / containerCapacity) * 100);

    const now = new Date();
    const hoursSinceLastIrrigation = data.history.lastIrrigationTime
      ? (now.getTime() - new Date(data.history.lastIrrigationTime).getTime()) / (1000 * 60 * 60)
      : undefined;

    const currentHour = now.getHours();

    return {
      currentMoisture,
      containerCapacity,
      depletionPercentage,
      hasSoilMoistureData: true,
      currentVPD: data.climate.vpd,
      currentTemperature: data.climate.temperature,
      currentHumidity: data.climate.humidity,
      recentDrainagePercentage: data.history.recentDrainagePercentage ?? undefined,
      lastIrrigationTime: data.history.lastIrrigationTime ?? undefined,
      hoursSinceLastIrrigation,
      currentHour,
      isOptimalTime: this.isOptimalTimeToIrrigate(currentHour),
      growthStage: this.determineGrowthStage(data.cropProduction),
      cropWaterStress: Math.max(0, depletionPercentage - 30)
    };
  }

  /**
   * Evaluate all irrigation rules
   */
  private evaluateRules(factors: IrrigationDecisionFactors): RuleEvaluationDisplay[] {
    const rules: IrrigationRule[] = [
      this.moistureDepletionRule(),
      this.highVPDRule(),
      this.drainageFeedbackRule(),
      this.timeOfDayRule(),
      this.growthStageRule(),
      this.weatherForecastRule()
    ];

    return rules.map(rule => ({
      ...rule.evaluate(factors),
      ruleName: rule.name,
      rulePriority: rule.priority
    }));
  }

  /**
   * Generate final recommendation from rule results
   */
  private generateRecommendation(
    factors: IrrigationDecisionFactors,
    ruleResults: RuleEvaluationDisplay[],
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
        nextRecommendedCheck: new Date(Date.now() + 2 * 60 * 60 * 1000),
        decisionFactors: factors,
        ruleEvaluations: ruleResults
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
      nextRecommendedCheck: new Date(Date.now() + 4 * 60 * 60 * 1000),
      decisionFactors: factors,
      ruleEvaluations: ruleResults
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
      name: 'Depleción de Humedad',
      priority: 10,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (!factors.hasSoilMoistureData) {
          return {
            shouldTrigger: false,
            confidence: 0,
            reason: 'Sin datos del sensor de humedad de suelo — regla no evaluada'
          };
        }

        const depletionThreshold = factors.growthStage
          ? GROWTH_STAGE_CONFIGS[factors.growthStage]?.depletionThreshold || DEFAULT_DEPLETION_THRESHOLD
          : DEFAULT_DEPLETION_THRESHOLD;

        if (factors.depletionPercentage >= CRITICAL_DEPLETION_THRESHOLD) {
          return {
            shouldTrigger: true,
            confidence: 95,
            reason: `CRÍTICO: Depleción de humedad al ${factors.depletionPercentage.toFixed(1)}% (umbral crítico: ${CRITICAL_DEPLETION_THRESHOLD}%)`,
            urgency: 'critical',
            volumeAdjustment: 1.1
          };
        }

        if (factors.depletionPercentage >= depletionThreshold) {
          return {
            shouldTrigger: true,
            confidence: 85,
            reason: `Depleción de humedad al ${factors.depletionPercentage.toFixed(1)}% supera el umbral (${depletionThreshold}%)`,
            urgency: 'high'
          };
        }

        return {
          shouldTrigger: false,
          confidence: 90,
          reason: `Humedad del suelo adecuada (depleción: ${factors.depletionPercentage.toFixed(1)}%)`
        };
      }
    };
  }

  /**
   * Rule 2: High VPD compensation
   */
  private highVPDRule(): IrrigationRule {
    return {
      name: 'VPD Elevado',
      priority: 7,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (factors.currentVPD == null) {
          return { shouldTrigger: false, confidence: 0, reason: 'Sin datos de VPD (sensor de temperatura o humedad ausente)' };
        }

        if (factors.currentVPD > HIGH_VPD_THRESHOLD) {
          return {
            shouldTrigger: true,
            confidence: 75,
            reason: `VPD elevado detectado (${factors.currentVPD.toFixed(2)} kPa) — alta demanda de transpiración`,
            urgency: 'medium',
            volumeAdjustment: 1.15
          };
        }

        if (factors.currentVPD < LOW_VPD_THRESHOLD) {
          return {
            shouldTrigger: false,
            confidence: 70,
            reason: `VPD bajo (${factors.currentVPD.toFixed(2)} kPa) — transpiración reducida`,
            volumeAdjustment: 0.9
          };
        }

        return {
          shouldTrigger: false,
          confidence: 60,
          reason: `VPD en rango normal (${factors.currentVPD.toFixed(2)} kPa)`
        };
      }
    };
  }

  /**
   * Rule 3: Drainage feedback
   */
  private drainageFeedbackRule(): IrrigationRule {
    return {
      name: 'Retroalimentación de Drenaje',
      priority: 6,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (factors.recentDrainagePercentage == null) {
          return { shouldTrigger: false, confidence: 0, reason: 'Sin datos de drenaje (sensor de drenaje ausente)' };
        }

        const drain = factors.recentDrainagePercentage;

        if (drain > OPTIMAL_DRAIN_PERCENTAGE_MAX) {
          return {
            shouldTrigger: false,
            confidence: 70,
            reason: `Drenaje reciente alto (${drain.toFixed(1)}%) — se recomienda reducir volumen`,
            volumeAdjustment: 0.85
          };
        }

        if (drain < OPTIMAL_DRAIN_PERCENTAGE_MIN) {
          return {
            shouldTrigger: false,
            confidence: 65,
            reason: `Drenaje reciente bajo (${drain.toFixed(1)}%) — se recomienda aumentar volumen`,
            volumeAdjustment: 1.15
          };
        }

        return {
          shouldTrigger: false,
          confidence: 80,
          reason: `Drenaje en rango óptimo (${drain.toFixed(1)}%)`
        };
      }
    };
  }

  /**
   * Rule 4: Time of day optimization
   */
  private timeOfDayRule(): IrrigationRule {
    return {
      name: 'Hora del Día',
      priority: 5,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        const hour = factors.currentHour;

        if (hour >= AVOID_IRRIGATION_HOURS.start && hour <= AVOID_IRRIGATION_HOURS.end) {
          return {
            shouldTrigger: false,
            confidence: 70,
            reason: `Horario de mediodía (${hour}:00 h) — no óptimo para riego`,
            urgency: 'low'
          };
        }

        if (factors.isOptimalTime) {
          return {
            shouldTrigger: false,
            confidence: 85,
            reason: `Horario óptimo para riego (${hour}:00 h)`
          };
        }

        return {
          shouldTrigger: false,
          confidence: 60,
          reason: `Horario aceptable para riego (${hour}:00 h)`
        };
      }
    };
  }

  /**
   * Rule 5: Growth stage considerations
   */
  private growthStageRule(): IrrigationRule {
    const stageNames: Record<string, string> = {
      germination: 'Germinación',
      vegetative: 'Vegetativo',
      flowering: 'Floración',
      fruiting: 'Fructificación',
      harvest: 'Cosecha'
    };

    return {
      name: 'Etapa de Crecimiento',
      priority: 8,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (!factors.growthStage) {
          return { shouldTrigger: false, confidence: 50, reason: 'Etapa de crecimiento no determinada' };
        }

        const stageConfig = GROWTH_STAGE_CONFIGS[factors.growthStage];
        const stageName = stageNames[factors.growthStage] || factors.growthStage;

        if (stageConfig.waterStressSensitivity === 'high' && factors.cropWaterStress && factors.cropWaterStress > 20) {
          return {
            shouldTrigger: true,
            confidence: 80,
            reason: `Etapa de ${stageName} es muy sensible al estrés hídrico (estrés actual: ${factors.cropWaterStress.toFixed(1)}%)`,
            urgency: 'high'
          };
        }

        return {
          shouldTrigger: false,
          confidence: 70,
          reason: `Requerimientos hídricos de la etapa ${stageName} considerados`
        };
      }
    };
  }

  /**
   * Rule 6: Weather forecast (mocked for now)
   */
  private weatherForecastRule(): IrrigationRule {
    return {
      name: 'Pronóstico del Tiempo',
      priority: 4,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        // TODO: UNMOCK - Integrar API de clima real
        const forecastedRainfall = factors.forecastedRainfall || 0;

        if (forecastedRainfall > 5) {
          return {
            shouldTrigger: false,
            confidence: 65,
            reason: `Lluvia pronosticada (${forecastedRainfall} mm) — se recomienda postergar el riego`,
            volumeAdjustment: 0.7
          };
        }

        return {
          shouldTrigger: false,
          confidence: 50,
          reason: 'Sin lluvia significativa pronosticada (integración de clima pendiente)'
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
