// services/irrigation-calculations.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SensorConfigService, SENSOR_TYPES } from '../sensors/services/sensor-config.service';
import { CalculationSettingsService } from './calculation-settings.service';
// models/irrigation-metrics.models.ts
export interface DeviceRawDataPoint {
  id: number;
  recordDate: Date;
  clientId: string;
  userId: string;
  deviceId: string;
  sensor: string;
  payload: number | string;
  summarized: number;
}

export interface IrrigationMeasurement {
  measurementVariableId: number;
  recordValue: number;
}

export interface IrrigationEventEntity {
  id?: number;
  recordDateTime: Date;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  cropProductionId: number;
  irrigationMeasurements: IrrigationMeasurement[];
  // Simplified volume properties
  irrigationVolume?: number; // Liters
  drainVolume?: number; // Liters
}

export interface CropProductionEntity {
  id: number;
  betweenRowDistance: number;
  betweenContainerDistance: number;
  betweenPlantDistance: number;
  area: number;
  containerVolume?: number;
  availableWaterPercentage?: number;
  numberOfDroppersPerContainer?: number;
  dropper?: {
    flowRate?: number;
  };
}

export interface MeasurementVariable {
  id: number;
  measurementVariableStandardId: number;
  name: string;
}

export enum VolumeMeasure {
  toLitre = 'toLitre',
  none = 'none'
}

export class Volume {
  constructor(
    public value: number,
    public measure: VolumeMeasure
  ) { }
}

export interface IrrigationMetric {
  date: Date;
  irrigationInterval?: number; // milliseconds
  irrigationLength: number; // milliseconds
  irrigationVolumenM2: Volume;
  irrigationVolumenPerPlant: Volume;
  irrigationVolumenTotal: Volume;
  drainVolumenM2: Volume;
  drainVolumenPerPlant: Volume;
  drainPercentage: number;
  irrigationFlow: Volume;
  irrigationPrecipitation: Volume;
  cropProductionId: number;
}

export interface IrrigationMonitorResponse {
  irrigate: boolean;
  irrigationTime: number; // minutes
  reason?: string;
}
@Injectable({
  providedIn: 'root'
})
export class IrrigationCalculationsService {

  constructor(
    private sensorConfig: SensorConfigService,
    private calcSettings: CalculationSettingsService
  ) { }

  // ============================================================================
  // 1. CalculateIrrigationCalculationOutput
  // ============================================================================
  calculateIrrigationMetrics(
    inputs: IrrigationEventEntity[],
    cropProduction: CropProductionEntity
  ): IrrigationMetric {

    const output: IrrigationMetric = {} as IrrigationMetric;

    // Set date from current irrigation event
    output.date = inputs[0].recordDateTime;
    output.cropProductionId = inputs[0].cropProductionId;

    // Calculate irrigation interval (time since last irrigation)
    if (inputs.length > 1) {
      output.irrigationInterval =
        inputs[0].dateTimeStart.getTime() - inputs[1].dateTimeEnd.getTime();
    }

    // Calculate irrigation length (duration)
    output.irrigationLength =
      inputs[0].dateTimeEnd.getTime() - inputs[0].dateTimeStart.getTime();

    //

    // Calculate densities (containers and plants per m²)
    const densityContainer =
      1 / (cropProduction.betweenRowDistance * cropProduction.betweenContainerDistance);
    const densityPlant =
      1 / (cropProduction.betweenRowDistance * cropProduction.betweenPlantDistance);

    //

    // Use simplified volume properties
    const irrigationVolumeTotal = inputs[0].irrigationVolume || 0;
    const drainVolumeTotal = inputs[0].drainVolume || 0;

    const irrigationVolumeM2 = irrigationVolumeTotal * densityContainer;
    const irrigationVolumePerPlant = irrigationVolumeM2 / densityPlant;

    output.irrigationVolumenM2 = new Volume(irrigationVolumeM2, VolumeMeasure.toLitre);
    output.irrigationVolumenPerPlant = new Volume(irrigationVolumePerPlant, VolumeMeasure.toLitre);
    output.irrigationVolumenTotal = new Volume(irrigationVolumeTotal, VolumeMeasure.toLitre);

    //

    // Calculate drain volumes

    const drainVolumeM2 = drainVolumeTotal * densityContainer;
    const drainVolumePerPlant = drainVolumeM2 / densityPlant;

    output.drainVolumenM2 = new Volume(drainVolumeM2, VolumeMeasure.toLitre);
    output.drainVolumenPerPlant = new Volume(drainVolumePerPlant, VolumeMeasure.toLitre);
    // Calculate drain percentage
    output.drainPercentage = irrigationVolumeTotal > 0
      ? (drainVolumeTotal / irrigationVolumeTotal) * 100
      : 0;
    //
    // Calculate irrigation flow (L/hour)
    const irrigationLengthHours = output.irrigationLength / (1000 * 60 * 60);
    const flowRate = irrigationLengthHours > 0
      ? irrigationVolumeTotal / irrigationLengthHours
      : 0;
    output.irrigationFlow = new Volume(flowRate, VolumeMeasure.toLitre);
    //
    // Calculate precipitation rate (L/m²/hour)
    const precipitationRate = irrigationLengthHours > 0
      ? irrigationVolumeM2 / irrigationLengthHours
      : 0;
    output.irrigationPrecipitation = new Volume(precipitationRate, VolumeMeasure.toLitre);
    //
    return output;
  }

  // ============================================================================
  // 2. GetCropProductionIrrigationEvents - Detect irrigation events from pressure
  // ============================================================================
  getCropProductionIrrigationEvents(
    cropProduction: CropProductionEntity,
    pressureReadings: DeviceRawDataPoint[],
    pressureDeltaThreshold?: number, // MPa — defaults to CalculationSettings 'PressureDeltaThreshold'
    inProgressEvent?: IrrigationEventEntity
  ): IrrigationEventEntity[] {

    const threshold = pressureDeltaThreshold ?? this.calcSettings.getNumber('PressureDeltaThreshold', 0.002);
    const events: IrrigationEventEntity[] = [];

    // Sort readings by date
    const sortedReadings = [...pressureReadings].sort(
      (a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
    );

    let previousPressure: number | null = null;
    let eventStart: Date | null = null;

    for (const reading of sortedReadings) {
      const currentPressure = typeof reading.payload === 'number'
        ? reading.payload
        : parseFloat(reading.payload as string);

      if (previousPressure !== null) {
        const pressureChange = currentPressure - previousPressure;

        // Detect pump ON (pressure increase)
        if (pressureChange >= threshold && eventStart === null) {
          eventStart = new Date(reading.recordDate);
        }
        // Detect pump OFF (pressure decrease)
        else if (pressureChange <= -threshold && eventStart !== null) {
          const event: IrrigationEventEntity = {
            recordDateTime: eventStart,
            dateTimeStart: eventStart,
            dateTimeEnd: new Date(reading.recordDate),
            cropProductionId: cropProduction.id,
            irrigationMeasurements: [] // Will be filled by getIrrigationEventsVolumes
          };
          events.push(event);
          eventStart = null;
        }
      }

      previousPressure = currentPressure;
    }

    // Handle in-progress event
    if (eventStart !== null) {
      const event: IrrigationEventEntity = {
        recordDateTime: eventStart,
        dateTimeStart: eventStart,
        dateTimeEnd: new Date(), // Ongoing
        cropProductionId: cropProduction.id,
        irrigationMeasurements: [] // Will be filled by getIrrigationEventsVolumes
      };
      events.push(event);
    }

    
    return events;
  }

  // ============================================================================
  // 3. GetIrrigationEventsVolumes - Calculate volumes for detected events
  // ============================================================================
  getIrrigationEventsVolumes(
    irrigationEvents: IrrigationEventEntity[],
    waterInputReadings: DeviceRawDataPoint[],
    waterDrainReadings: DeviceRawDataPoint[]
  ): IrrigationEventEntity[] {

    return irrigationEvents.map((event, idx) => {
      //console.log.*
      //console.log.*

      // Filter readings within event time window
      const inputsInWindow = waterInputReadings.filter(r => {
        const rDate = new Date(r.recordDate);
        return rDate >= event.dateTimeStart && rDate <= event.dateTimeEnd;
      });

      // console.log("Inputs in window for event", idx, ":", inputsInWindow);

      const drainsInWindow = waterDrainReadings.filter(r => {
        const rDate = new Date(r.recordDate);
        return rDate >= event.dateTimeStart && rDate <= event.dateTimeEnd;
      });

      //console.log.*
      //console.log.*

      if (inputsInWindow.length > 0) {
        const firstPulse = Number(inputsInWindow[0].payload);
        const lastPulse = Number(inputsInWindow[inputsInWindow.length - 1].payload);
        //console.log.*
      }

      // Calculate volumes
      const irrigationVolume = this.calculateVolumeFromFlowReadings(inputsInWindow);
      if (irrigationVolume > 0)
        console.log("Calculated irrigation volume for event", idx, ":", irrigationVolume);

      const drainVolume = this.calculateVolumeFromFlowReadings(drainsInWindow);
      if (drainVolume > 0)
        console.log("Calculated drain volume for event", idx, ":", drainVolume);

      // //console.log.*

      // Set simple volume properties
      event.irrigationVolume = irrigationVolume;
      event.drainVolume = drainVolume;

      // Populate measurement variable IDs from settings (no longer hardcoded)
      const varIds = this.calcSettings.getMeasurementVariableIds();
      event.irrigationMeasurements = [
        {
          measurementVariableId: varIds.irrigationVolume,
          recordValue: irrigationVolume
        },
        {
          measurementVariableId: varIds.drainVolume,
          recordValue: drainVolume
        }
      ];

      return event;
    });
  }

  /**
   * Calculate volume from WATER_FLOW sensor readings only.
   */
  calculateVolumeFromFlowReadings(flowReadings: DeviceRawDataPoint[]): number {
    if (flowReadings.length === 0) {
      return 0;
    }

    const waterFlowLabels = this.sensorConfig.getSensorLabelsByType(SENSOR_TYPES.WATER_FLOW);
    const hasWaterFlowValue = flowReadings.some(r => waterFlowLabels.includes(r.sensor));
    const hasRainFlowValue  = flowReadings.some(r => r.sensor.includes('rain'));

    if (hasWaterFlowValue) {
      // Use instantaneous flow rate values
      const flowRateReadings = flowReadings.filter(r => waterFlowLabels.includes(r.sensor));

      // Sum all flow values (assuming they're already in liters or similar)
      const totalFlow = flowRateReadings.reduce((sum, r) => {
        const value = typeof r.payload === 'number' ? r.payload : parseFloat(r.payload as string);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      // If these are cumulative values, take difference
      if (flowRateReadings.length >= 2) {
        const firstValue = Number(flowRateReadings[0].payload);
        const lastValue = Number(flowRateReadings[flowRateReadings.length - 1].payload);

        if (isNaN(firstValue) || isNaN(lastValue)) {
          return 0;
        }

        return Math.max(0, Math.abs(lastValue - firstValue));
      }

      return totalFlow;
    }

    if (hasRainFlowValue) {
      // Use instantaneous flow rate values
      const flowRateReadings = flowReadings.filter(r => r.sensor.includes('rain'));
      // Sum all flow values (assuming they're already in liters or similar)
      const totalFlow = flowRateReadings.reduce((sum, r) => {
        const value = typeof r.payload === 'number' ? r.payload : parseFloat(r.payload as string);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      // If these are cumulative values, take difference
      if (flowRateReadings.length >= 2) {
        const firstValue = Number(flowRateReadings[0].payload);
        const lastValue = Number(flowRateReadings[flowRateReadings.length - 1].payload); 
        if (isNaN(firstValue) || isNaN(lastValue)) {
          
          return 0;
        }
        return Math.max(0, Math.abs(lastValue - firstValue));
      }
      return totalFlow;
    }

    
    return 0;
  }

  // ============================================================================
  // 4. ToIrrigate - Determine if irrigation is needed
  // ============================================================================
  toIrrigate(
    cropProduction: CropProductionEntity,
    currentSoilMoisture: number, // Volumetric water content (%)
    targetMoisture: number = 80, // % of container capacity
    depletionThreshold: number = 50, // retained for backward compatibility
    drainTargetPercentage: number = 20 // Target drain %
  ): IrrigationMonitorResponse {

    const containerCapacity = cropProduction.containerVolume || 10; // liters
    const availableWater = (cropProduction.availableWaterPercentage || 50) / 100;

    // Calculate setpoint (target moisture)
    const setpointHumidity = targetMoisture;

    // Calculate depletion percentage
    const depletionPercentage = setpointHumidity > 0
      ? ((setpointHumidity - currentSoilMoisture) / setpointHumidity) * 100
      : 0;

    // Determine if irrigation is needed using absolute moisture vs agronomic setpoint.
    const shouldIrrigate = currentSoilMoisture < setpointHumidity;

    if (!shouldIrrigate) {
      return {
        irrigate: false,
        irrigationTime: 0,
        reason: `Soil moisture adequate (${currentSoilMoisture.toFixed(1)}%). Depletion: ${depletionPercentage.toFixed(1)}%`
      };
    }

    // Calculate irrigation volume needed
    const volumeNeeded = containerCapacity * availableWater * (depletionPercentage / 100);

    // Add drain percentage
    const totalVolume = volumeNeeded * (1 + drainTargetPercentage / 100);

    // Calculate irrigation time from dropper flow when available; fallback keeps legacy behavior.
    const dropperFlowRate = cropProduction.dropper?.flowRate ?? 0; // L/hour per dropper
    const droppersPerContainer = cropProduction.numberOfDroppersPerContainer ?? 0;
    const flowRate = dropperFlowRate > 0 && droppersPerContainer > 0
      ? (dropperFlowRate * droppersPerContainer) / 60
      : 2; // L/min fallback
    const irrigationTimeMinutes = flowRate > 0 ? totalVolume / flowRate : 0;

    return {
      irrigate: true,
      irrigationTime: Math.ceil(irrigationTimeMinutes),
      reason: `Soil moisture low (${currentSoilMoisture.toFixed(1)}%). Setpoint: ${setpointHumidity.toFixed(1)}%. Depletion: ${depletionPercentage.toFixed(1)}%. Volume needed: ${totalVolume.toFixed(2)}L`
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  convertToDisplayFormat(metrics: IrrigationMetric): any {
    return {
      date: metrics.date,
      intervalHours: metrics.irrigationInterval
        ? (metrics.irrigationInterval / (1000 * 60 * 60)).toFixed(2)
        : null,
      lengthMinutes: (metrics.irrigationLength / (1000 * 60)).toFixed(2),
      volumePerM2: metrics.irrigationVolumenM2.value.toFixed(2),
      volumePerPlant: metrics.irrigationVolumenPerPlant.value.toFixed(2),
      totalVolume: metrics.irrigationVolumenTotal.value.toFixed(2),
      drainPercentage: metrics.drainPercentage.toFixed(2),
      flowRate: metrics.irrigationFlow.value.toFixed(2),
      precipitationRate: metrics.irrigationPrecipitation.value.toFixed(2)
    };
  }
}