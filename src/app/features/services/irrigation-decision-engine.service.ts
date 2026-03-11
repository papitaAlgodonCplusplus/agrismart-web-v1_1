// src/app/features/services/irrigation-decision-engine.service.ts
// TODO: UNMOCK - Weather forecast integration needed for production use

import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Services
import { IrrigationSectorService } from './irrigation-sector.service';
import { CropProductionService } from '../crop-production/services/crop-production.service';
import { KPIOrchestatorService, DailyKPIOutput } from './calculations/kpi-orchestrator.service';
import { IrrigationCalculationsService, IrrigationMetric } from './irrigation-calculations.service';
import { GrowingMediumService, GrowingMedium as GrowingMediumEntity } from '../growing-medium/services/growing-medium.service';
import { ContainerService } from './container.service';
import { CropPhaseService, CropPhase } from '../crop-phases/services/crop-phase.service';

// Models
import {
  IrrigationRecommendation,
  IrrigationCalculationBreakdown,
  IrrigationDecisionFactors,
  IrrigationRule,
  RuleEvaluation,
  RuleEvaluationDisplay,
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
const MIN_DEPLETION_FOR_VPD_TRIGGER = 15; // % - VPD alone cannot trigger below this depletion
const MAX_REASONABLE_CONTAINER_VOLUME = 500; // L - above this likely indicates a data entry error

// Time of day preferences (24-hour format)
const OPTIMAL_IRRIGATION_HOURS = {
  morning: { start: 6, end: 10 },
  lateAfternoon: { start: 16, end: 18 }
};
const AVOID_IRRIGATION_HOURS = { start: 11, end: 14 }; // midday


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
    private containerService: ContainerService,
    private cropPhaseService: CropPhaseService
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
    return this.cropProductionService.getById(cropProductionId).pipe(
      switchMap((cropProductionResponse: any) => {
        const cropProduction = cropProductionResponse?.cropProduction ?? cropProductionResponse;
        console.log('Crop production data:', cropProduction);

        // Calculate area from length and width if area is not directly available
        if (!cropProduction.area && cropProduction.length && cropProduction.width) {
          cropProduction.area = cropProduction.length * cropProduction.width;
          console.log(`Calculated area from length (${cropProduction.length}) * width (${cropProduction.width}) = ${cropProduction.area} m²`);
        }

        const containerId: number | undefined =
          cropProduction?.containerId ??
          cropProductionResponse?.result?.cropProduction?.containerId ??
          cropProductionResponse?.result?.containerId;

        const container$: Observable<Container> = containerId
          ? this.containerService.getById(containerId).pipe(
            map((res: any) => res?.result?.container ?? res?.container ?? res)
          )
          : throwError(() => new Error(`CropProduction (ID: ${cropProductionId}) has no containerId`));

        const cropPhase$: Observable<CropPhase | null> = cropProduction.cropId
          ? this.cropPhaseService.getAll({ cropId: cropProduction.cropId }).pipe(
            map(phases => this.resolveCurrentPhase(phases, cropProduction)),
            catchError(() => of(null))
          )
          : of(null);

        const dropperId: number | undefined = cropProduction?.dropperId;
        const dropper$ = dropperId && dropperId > 0
          ? this.irrigationService.getDropperById(dropperId).pipe(
            catchError(() => of(null))
          )
          : of(null);
        return forkJoin({
          soilMoisture: this.getSoilMoisture(cropProductionId),
          substrate: this.getSubstrateProperties(cropProductionId),
          climate: this.getCurrentClimate(cropProductionId),
          history: this.getRecentIrrigationHistory(cropProductionId),
          container: container$,
          cropPhase: cropPhase$,
          dropper: dropper$
        }).pipe(
          map(data => {
            const factors = this.buildDecisionFactors({ ...data, cropProduction });
            const ruleResults = this.evaluateRules(factors);
            return this.generateRecommendation(
              factors,
              ruleResults,
              cropProduction,
              data.substrate,
              data.container,
              data.dropper
            );
          })
        );
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
          ['water_SOIL'].includes(d.sensor)
        );

        if (moistureReadings.length === 0) {
          console.error('Sin datos de sensor de humedad de suelo (water_SOIL, water_SOIL_original, conduct_SOIL)');
          throw new Error('Sin datos de sensor de humedad de suelo');
        } else {
          console.log('Últimos datos de humedad de suelo:', moistureReadings.slice(5));
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
        // rawData comes asc, sort desc to get latest readings first
        rawData.sort((a: any, b: any) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());

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

        if (humidityReadings.length === 0) {
          console.warn('Sin datos de sensor de humedad relativa (HUM, Hum_SHT2x) — VPD no disponible');
        } else {
          console.log('Últimos datos de humedad relativa:', humidityReadings.slice(5));
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

  private areLast30PayloadsAllEqual(readings: any[]): boolean {
    if (readings.length < 30) {
      return false; // Not enough data to determine
    }
    const last30 = readings.slice(-30);
    const firstPayload = last30[0].payload;
    return last30.every((r: any) => r.payload === firstPayload);
  }

  /**
   * Get recent irrigation history from Water_flow_value and Total_pulse sensors
   */
  private getRecentIrrigationHistory(cropProductionId: number): Observable<any> {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    return this.irrigationService.getDeviceRawData(
      undefined,
      tenDaysAgo.toISOString(),
      now.toISOString()
    ).pipe(
      map(rawData => {
        // Detect flow events using the same logic as dashboard
        const flowEvents = this.detectFlowEvents(rawData);

        if (flowEvents.length === 0) {
          console.error('Sin eventos de flujo de riego en los últimos 10 días (Water_flow_value, Total_pulse)');
          throw new Error('Sin historial de eventos de riego');
        }

        // Get the most recent flow event
        const sortedEvents = flowEvents.sort((a, b) =>
          b.changeDetectedAt.getTime() - a.changeDetectedAt.getTime()
        );
        const lastEvent = sortedEvents[0];

        // Calculate average daily volume (total volume / days)
        var totalVolume = flowEvents.reduce((sum, event) =>
          sum + (event.volumeOfWater || 0), 0
        );
        // ml to L
        totalVolume = totalVolume / 1000;

        const daysCovered = (now.getTime() - tenDaysAgo.getTime()) / (1000 * 60 * 60 * 24);
        const averageDailyVolume = totalVolume / daysCovered;

        // Calculate drainage percentage from drain sensors
        const drainReadings = rawData.filter((d: any) =>
          d.sensor && typeof d.sensor === 'string' && d.sensor.toLowerCase().includes('gauge')
        ); // 11218691

        let recentDrainagePercentage = 0;

        if (drainReadings.length > 0 && totalVolume > 0) {
          // Sum up drain volumes
          var totalDrainVolume = 0;
          console.log('Drainage sensor readings found:', drainReadings);
          if (!this.areLast30PayloadsAllEqual(drainReadings)) {
            // abs(current payload - last distinct payload)
            const currentPayload = parseFloat(drainReadings[drainReadings.length - 1].payload);
            const lastDistinctPayload = parseFloat(drainReadings[drainReadings.length - 30].payload);
            totalDrainVolume = Math.abs(currentPayload - lastDistinctPayload);
          }

          totalDrainVolume = totalDrainVolume / 1000; // ml to L
          const daysCovered = (now.getTime() - tenDaysAgo.getTime()) / (1000 * 60 * 60 * 24);
          const averageDailyDrain = totalDrainVolume / daysCovered;

          console.log(`Total irrigation volume in last 5 days: ${totalVolume.toFixed(2)} L, Total drainage volume: ${totalDrainVolume.toFixed(2)} L`);

          // Calculate drainage as percentage of irrigation volume
          recentDrainagePercentage = (averageDailyDrain / averageDailyVolume) * 100;

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
    console.log(`Current soil moisture: ${currentMoisture}, Container capacity: ${containerCapacity}`);

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
      growthStage: data.cropPhase?.name ?? undefined,
      cropWaterStress: Math.max(0, depletionPercentage - 30),
      ...this.derivePhaseConfig(data.cropPhase)
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
    container: Container,
    dropper: any | null = null
  ): IrrigationRecommendation {
    // Determine if we should irrigate
    const triggeringRules = ruleResults.filter(r => r.shouldTrigger);
    const shouldIrrigate = triggeringRules.length > 0;
    // dropper
    console.log('Dropper data:', dropper);
    console.log("container:", container);
    // if container volume is unreasonably high, then it is in ml, convert to L and log a warning
    if (container.volume && container.volume > MAX_REASONABLE_CONTAINER_VOLUME) {
      container.volume = container.volume / 1000;
      console.warn(`Volumen del contenedor (${container.volume} L) parecía incorrecto, se ha convertido de ml a L. Verificar datos en la base de datos para containerId ${container.id}`);
    }

    if (!shouldIrrigate) {
      return {
        shouldIrrigate: false,
        recommendedVolume: null,
        recommendedDuration: null,
        totalVolume: null,
        confidence: 85,
        reasoning: ['Los niveles de humedad del suelo son adecuados', 'No se detectaron condiciones urgentes'],
        urgency: 'low',
        nextRecommendedCheck: new Date(Date.now() + 2 * 60 * 60 * 1000),
        decisionFactors: factors,
        ruleEvaluations: ruleResults
      };
    }

    // Collect missing configuration data — shown as HTML errors in the UI
    const missingData: string[] = [];
    const validContainerVolume = container.volume && container.volume <= MAX_REASONABLE_CONTAINER_VOLUME;
    if (!container.volume) {
      missingData.push('Volumen del contenedor no configurado');
    } else if (container.volume > MAX_REASONABLE_CONTAINER_VOLUME) {
      missingData.push(`Volumen del contenedor (${container.volume} L) parece incorrecto — verificar datos en la base de datos`);
    }
    if (!substrate.totalAvailableWaterPercentage) missingData.push('Agua total disponible del sustrato (TAW%) no configurada');
    if (!dropper) missingData.push('Gotero (dropperId) no asignado a esta producción de cultivo — necesario para calcular duración');
    else if (!dropper.flowRate) missingData.push('Caudal del gotero no configurado');
    if (!cropProduction.numberOfDroppersPerContainer) missingData.push('Número de goteros por contenedor no configurado — necesario para calcular duración');
    if (!cropProduction.area) missingData.push('Área de la producción no configurada — necesario para calcular volumen total');
    if (!cropProduction.betweenRowDistance) missingData.push('Distancia entre filas (betweenRowDistance) no configurada — necesario para calcular volumen total');
    if (!cropProduction.betweenContainerDistance) missingData.push('Distancia entre contenedores (betweenContainerDistance) no configurada — necesario para calcular volumen total');

    // Volume per container: requires valid container volume + TAW
    const canCalculateVolume = !!(validContainerVolume && substrate.totalAvailableWaterPercentage);
    // Duration: additionally requires dropper flow rate + count per container
    const canCalculateDuration = !!(canCalculateVolume && dropper?.flowRate && cropProduction.numberOfDroppersPerContainer);
    // Total field volume: additionally requires area + row/container spacing
    const canCalculateTotal = !!(cropProduction.area && cropProduction.betweenRowDistance && cropProduction.betweenContainerDistance);

    let recommendedVolume: number | null = null;
    let recommendedDuration: number | null = null;
    let totalVolume: number | null = null;

    // Breakdown intermediates
    let baseVolume: number | null = null;
    let volumeMultiplier = 1.0;
    let flowRateLPerMin: number | null = null;
    let totalContainersCalc: number | null = null;

    if (canCalculateVolume) {
      baseVolume = this.calculateIrrigationVolume(factors, substrate, container);

      // Apply volume adjustments only from triggered rules
      ruleResults.forEach(result => {
        if (result.shouldTrigger && result.volumeAdjustment) {
          volumeMultiplier *= result.volumeAdjustment;
        }
      });

      recommendedVolume = baseVolume * volumeMultiplier;

      if (canCalculateDuration) {
        // flowRate (L/h per dropper) × count / 60 = L/min for the container
        flowRateLPerMin = (dropper!.flowRate * cropProduction.numberOfDroppersPerContainer) / 60;
        recommendedDuration = Math.ceil(recommendedVolume / flowRateLPerMin);
      }

      if (canCalculateTotal) {
        const containersPerM2 = 1 / (cropProduction.betweenRowDistance * cropProduction.betweenContainerDistance);
        totalContainersCalc = Math.ceil(cropProduction.area * containersPerM2);
        totalVolume = recommendedVolume * totalContainersCalc;
      }
    }

    const calculationBreakdown: IrrigationCalculationBreakdown = {
      containerVolumeLiters: container.volume ?? null,
      tawPercentage: substrate.totalAvailableWaterPercentage ?? null,
      depletionFraction: factors.depletionPercentage != null ? factors.depletionPercentage / 100 : null,
      baseVolumeLiters: baseVolume,
      volumeMultiplier,
      dropperFlowRateLH: dropper?.flowRate ?? null,
      droppersPerContainer: cropProduction.numberOfDroppersPerContainer ?? null,
      flowRateLPerMin,
      totalContainers: totalContainersCalc,
    };

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
      ruleEvaluations: ruleResults,
      missingData: missingData.length > 0 ? missingData : undefined,
      calculationBreakdown
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

        const depletionThreshold = factors.phaseDepletionThreshold ?? DEFAULT_DEPLETION_THRESHOLD;

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
          if (factors.depletionPercentage < MIN_DEPLETION_FOR_VPD_TRIGGER) {
            return {
              shouldTrigger: false,
              confidence: 75,
              reason: `VPD elevado (${factors.currentVPD.toFixed(2)} kPa) pero sustrato bien hidratado (depleción: ${factors.depletionPercentage.toFixed(1)}%) — sin necesidad de riego`,
              volumeAdjustment: 1.05 // ligero ajuste para el próximo riego si se activa por depleción
            };
          }
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
   * Rule 5: Growth stage considerations.
   * Uses CropPhase-derived sensitivity and depletion threshold — no hardcoded stages.
   */
  private growthStageRule(): IrrigationRule {
    return {
      name: 'Etapa de Crecimiento',
      priority: 8,
      evaluate: (factors: IrrigationDecisionFactors): RuleEvaluation => {
        if (!factors.growthStage || !factors.phaseWaterStressSensitivity) {
          return { shouldTrigger: false, confidence: 50, reason: 'Etapa de crecimiento no determinada' };
        }

        const phaseName = factors.growthStage;
        const sensitivity = factors.phaseWaterStressSensitivity;
        const stress = factors.cropWaterStress ?? 0;

        if (sensitivity === 'high' && stress > 20) {
          return {
            shouldTrigger: true,
            confidence: 80,
            reason: `Etapa "${phaseName}" es muy sensible al estrés hídrico (estrés actual: ${stress.toFixed(1)}%)`,
            urgency: 'high'
          };
        }

        if (sensitivity === 'medium' && stress > 35) {
          return {
            shouldTrigger: true,
            confidence: 65,
            reason: `Etapa "${phaseName}" con sensibilidad media — estrés hídrico elevado (${stress.toFixed(1)}%)`,
            urgency: 'medium'
          };
        }

        return {
          shouldTrigger: false,
          confidence: 70,
          reason: `Etapa "${phaseName}" (sensibilidad: ${sensitivity}) — sin estrés hídrico crítico`
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
    console.log(`Calculando VPD con temperatura ${tempC}°C y humedad relativa ${relativeHumidity}%`);
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
   * Find the currently active CropPhase for a crop production.
   *
   * Strategy (in order):
   * 1. If phases have meaningful week ranges, use weeks-since-startDate to match.
   * 2. If no week ranges are set (all 0), fall back to sequence order.
   * 3. If startDate is missing or in the future, fall back to sequence order.
   * In all sequence-order fallbacks, return the phase with the lowest sequence number.
   */
  private resolveCurrentPhase(phases: CropPhase[], cropProduction: any): CropPhase | null {
    if (!phases || phases.length === 0) {
      console.warn('Sin fases de cultivo definidas — etapa de crecimiento no determinada');
      return null;
    }

    const activePhases = phases.filter(p => p.active);
    if (activePhases.length === 0) {
      console.warn('No hay fases de cultivo activas');
      return null;
    }

    // Sort by sequence ascending for fallbacks
    const bySequence = [...activePhases].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

    // Check if any phase has meaningful week ranges (non-zero startingWeek or endingWeek)
    const hasWeekRanges = activePhases.some(
      p => (p.startingWeek != null && p.startingWeek > 0) || (p.endingWeek != null && p.endingWeek > 0)
    );

    if (!hasWeekRanges) {
      const fallback = bySequence[0];
      console.log(`Fases sin rangos de semana configurados — usando fase de menor secuencia: "${fallback.name}"`);
      return fallback;
    }

    const startDate = cropProduction.startDate ? new Date(cropProduction.startDate) : null;
    if (!startDate || isNaN(startDate.getTime())) {
      const fallback = bySequence[0];
      console.warn(`startDate no configurada — usando fase de menor secuencia: "${fallback.name}"`);
      return fallback;
    }

    const now = new Date();
    const weeksSincePlanting = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );

    if (weeksSincePlanting < 0) {
      // startDate is in the future — crop hasn't started yet, use first phase
      const fallback = bySequence[0];
      console.warn(`startDate es futura (semana ${weeksSincePlanting}) — usando primera fase: "${fallback.name}"`);
      return fallback;
    }

    // Try exact week-range match
    const exactMatch = activePhases.find(p =>
      p.startingWeek != null && p.endingWeek != null &&
      p.endingWeek > 0 &&
      weeksSincePlanting >= p.startingWeek &&
      weeksSincePlanting <= p.endingWeek
    );
    if (exactMatch) {
      console.log(`Etapa de cultivo resuelta: "${exactMatch.name}" (semana ${weeksSincePlanting} desde inicio)`);
      return exactMatch;
    }

    // Fall back to the phase with the highest startingWeek that we've already passed
    const pastPhases = activePhases
      .filter(p => p.startingWeek != null && weeksSincePlanting >= p.startingWeek)
      .sort((a, b) => (b.startingWeek ?? 0) - (a.startingWeek ?? 0));

    if (pastPhases.length > 0) {
      console.log(`Etapa de cultivo aproximada: "${pastPhases[0].name}" (semana ${weeksSincePlanting} desde inicio)`);
      return pastPhases[0];
    }

    // All phases are still in the future — use the first by sequence
    const fallback = bySequence[0];
    console.warn(`Semana ${weeksSincePlanting} anterior a todas las fases — usando primera fase: "${fallback.name}"`);
    return fallback;
  }

  /**
   * Derive water-stress sensitivity and depletion threshold directly from a CropPhase.
   *
   * Logic (no hardcoded stage names):
   * - criticalNotes set → high sensitivity (grower explicitly flagged this phase)
   * - sequence 1 OR startingWeek < 4 → high sensitivity (very early / establishment phase)
   * - sequence 2-3 OR startingWeek < 10 → medium sensitivity
   * - otherwise → low sensitivity (late / finishing phase)
   */
  private derivePhaseConfig(phase: CropPhase | null): {
    phaseWaterStressSensitivity: 'low' | 'medium' | 'high' | undefined;
    phaseDepletionThreshold: number | undefined;
  } {
    if (!phase) {
      return { phaseWaterStressSensitivity: undefined, phaseDepletionThreshold: undefined };
    }

    const hasCriticalNotes = phase.criticalNotes != null && phase.criticalNotes !== '';
    const seq = phase.sequence ?? 99;
    const startWeek = phase.startingWeek ?? 99;

    let sensitivity: 'low' | 'medium' | 'high';
    let depletionThreshold: number;

    if (hasCriticalNotes || seq <= 1 || startWeek < 4) {
      sensitivity = 'high';
      depletionThreshold = 20;
    } else if (seq <= 3 || startWeek < 10) {
      sensitivity = 'medium';
      depletionThreshold = 30;
    } else {
      sensitivity = 'low';
      depletionThreshold = DEFAULT_DEPLETION_THRESHOLD;
    }

    console.log(`CropPhase "${phase.name}" (seq=${seq}, startWeek=${startWeek}, criticalNotes=${hasCriticalNotes}) → sensitivity=${sensitivity}, depletionThreshold=${depletionThreshold}%`);

    return { phaseWaterStressSensitivity: sensitivity, phaseDepletionThreshold: depletionThreshold };
  }

  /**
   * Calculate irrigation volume based on depletion and substrate properties
   */
  private calculateIrrigationVolume(
    factors: IrrigationDecisionFactors,
    substrate: GrowingMedium,
    container: Container
  ): number {
    const containerVolume = container.volume!;
    const availableWater = substrate.totalAvailableWaterPercentage! / 100;
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
