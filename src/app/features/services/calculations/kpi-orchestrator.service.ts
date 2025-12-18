// src/app/features/dashboard/services/calculations/kpi-orchestrator.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Services
import { ClimateCalculationsService, ClimateData, ClimateKPIs, LocationData } from './climate-calculations.service';
import { IrrigationCalculationsService, IrrigationMetric, Volume, VolumeMeasure } from '../../services/irrigation-calculations.service';
import { CropCalculationsService, CropProductionData, CropProductionKPIs, GrowingMediumData, GrowingMediumKPIs } from './crop-calculations.service';
import { IrrigationSectorService } from '../../services/irrigation-sector.service';
import { CropProductionSpecsService, CropProductionSpecs } from '../../crop-production-specs/services/crop-production-specs.service';
import { CropService } from '../../crops/services/crop.service';
import { CropProductionService } from '../../services/crop-production.service';
import { GrowingMediumService, GrowingMedium } from '../../growing-medium/services/growing-medium.service';
import { FarmService } from '../../farms/services/farm.service';
import { Farm } from '../../../core/models/models';

// ============================================================================
// INTERFACES
// ============================================================================
export interface KPICalculationInput {
  cropProductionId: number;
  startDate: Date;
  endDate: Date;
  deviceIds?: string[];
}

export interface DailyKPIOutput {
  date: Date;
  cropProductionId: number;
  climate: ClimateKPIs;
  irrigation: {
    metrics: IrrigationMetric[];
    totalVolume: number;
    totalDuration: number;
    averageDrainPercentage: number;
    // Batch 3: Irrigation statistics
    irrigationSpan?: number; // Required time span in minutes
    intervalStats?: { min: number; max: number; avg: number; sum: number };
    lengthStats?: { min: number; max: number; avg: number; sum: number };
    volumeStats?: { min: number; max: number; avg: number; sum: number };
  };
  crop: CropProductionKPIs;
  growingMedium: GrowingMediumKPIs;
  cropEvapoTranspiration?: number;
}

export interface TransformedSensorData {
  climate: ClimateData[];
  irrigation: any[];
  soilMoisture: any[];
  rawData: any[];
}

@Injectable({
  providedIn: 'root'
})
export class KPIOrchestatorService {

  constructor(
    private climateCalc: ClimateCalculationsService,
    private irrigationCalc: IrrigationCalculationsService,
    private cropCalc: CropCalculationsService,
    private irrigationService: IrrigationSectorService,
    private cropProductionService: CropProductionService,
    private cropProductionSpecsService: CropProductionSpecsService,
    private cropService: CropService,
    private growingMediumService: GrowingMediumService,
    private farmService: FarmService
  ) { }

  // ============================================================================
  // MAIN ORCHESTRATION METHOD
  // ============================================================================

  /**
   * Calculate and return KPIs for date range
   */
  async calculateKPIs(input: KPICalculationInput): Promise<DailyKPIOutput[]> {
    try {
      console.log(`\n=== KPI Calculation Started at ${new Date().toISOString()} ===`);
      console.log('Input:', input);

      // 1. Fetch all required data
      const [rawData, cropProduction, cropProductionSpecs, growingMedium, farm, crop] = await Promise.all([
        this.fetchRawSensorData(input),
        this.fetchCropProductionData(input.cropProductionId),
        this.fetchCropProductionSpecs(),
        this.fetchGrowingMedium(),
        this.fetchFarmData(input.cropProductionId),
        this.fetchCropData(input.cropProductionId)
      ]);

      console.log(`Fetched raw sensor data (${rawData.length} records)`);
      console.log('Fetched crop production data:', cropProduction);
      console.log('Fetched crop production specs:', cropProductionSpecs);
      console.log('Fetched growing medium data:', growingMedium);
      console.log('Fetched farm data:', farm);
      console.log('Fetched crop data:', crop);

      console.log('Distinct sensors in raw data:', Array.from(new Set(rawData.map(d => d.sensor))));
      console.log('First and last date where Water_flow_value sensor is present in raw data:');
      const flowData = rawData.filter(d => d.sensor === 'Water_flow_value');
      if (flowData.length > 0) {
        const sortedFlowData = flowData.sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
        console.log(`  First: ${sortedFlowData[0].recordDate}, Last: ${sortedFlowData[sortedFlowData.length - 1].recordDate}`);
        // payloads
        console.log(`  First payload: ${sortedFlowData[0].payload}, Last payload: ${sortedFlowData[sortedFlowData.length - 1].payload}`);
      } else {
        console.log('  No Water_flow_value sensor data found in raw data');
      }
      // 2. Transform raw data into structured format (includes temperature capping)
      const deviceId = input.deviceIds && input.deviceIds.length > 0 ? input.deviceIds[0] : undefined;
      if (deviceId) {
        console.log(`🔧 Filtering flow data by device ID: ${deviceId}`);
      } else {
        console.warn('⚠️ No device ID specified - will use all flow sensors (may cause data mixing!)');
      }
      const transformedData = this.transformRawData(rawData, deviceId);
      console.log(`Transformed data - Climate: ${transformedData.climate.length}, Irrigation: ${transformedData.irrigation.length}, Soil Moisture: ${transformedData.soilMoisture.length}`);

      console.log('Min and Max temperatures from transformed climate data:');
      transformedData.climate.forEach(cd => {
        console.log(`Date: ${cd.date.toISOString().split('T')[0]}, TempMin: ${cd.tempMin}, TempMax: ${cd.tempMax}`);
      });

      // log the first and last payload and date of transformeddata irrigation flow data
      transformedData.irrigation.forEach((irrigationDay, index) => {
        if (irrigationDay.flowData.length > 0) {
          const first = irrigationDay.flowData[0];
          const last = irrigationDay.flowData[irrigationDay.flowData.length - 1];
          console.log(`Irrigation Day ${index + 1} (${irrigationDay.date.toISOString().split('T')[0]}): First Flow - ${first.payload} L at ${first.recordDate}, Last Flow - ${last.payload} L at ${last.recordDate}`);
        }
      });


      // 3. Calculate crop production KPIs
      const cropKPIs = this.calculateCropKPIs(cropProduction.cropProduction, cropProductionSpecs);
      console.log('Calculated crop KPIs:', cropKPIs);

      // 4. Calculate growing medium KPIs
      const growingMediumKPIs = this.calculateGrowingMediumKPIs(growingMedium);
      console.log('Calculated growing medium KPIs:', growingMediumKPIs);

      // 5. Generate daily KPIs
      const dailyKPIs = this.generateDailyKPIs(
        input,
        transformedData,
        cropProduction.cropProduction,
        cropKPIs,
        growingMediumKPIs,
        farm,
        crop,
        cropProductionSpecs
      );

      console.log(`Generated ${dailyKPIs.length} daily KPI records`);
      console.log('Daily KPIs:', dailyKPIs);
      console.log(`\n=== KPI Calculation Completed Successfully ===`);

      return dailyKPIs;

    } catch (error) {
      console.error(`\n=== ERROR at ${new Date().toISOString()} ===`);
      console.error('Error calculating KPIs:', error);
      throw error;
    }
  }

  // ============================================================================
  // DATA FETCHING METHODS
  // ============================================================================

  /**
   * Fetch raw sensor data from IoT API
   */

  // TODO: get daily, weekly or monthly depending on range of dates
  private async fetchRawSensorData(input: KPICalculationInput): Promise<any[]> {
    const startDate = input.startDate.toISOString();
    const endDate = input.endDate.toISOString();

    const rawData = await this.irrigationService
      .getDeviceRawData(
        undefined,
        startDate,
        endDate,
        undefined,
        undefined,
        1000000
      )
      .toPromise();

    return rawData || [];
  }

  /**
   * Fetch crop production metadata
   */
  private async fetchCropProductionData(cropProductionId: number): Promise<any> {
    const cropProduction = await this.cropProductionService
      .getById(cropProductionId)
      .toPromise();

    return cropProduction;
  }

  /**
   * Fetch active crop production specs
   */
  private async fetchCropProductionSpecs(): Promise<CropProductionSpecs | null> {
    const response = await this.cropProductionSpecsService
      .getAll(false)
      .toPromise();

    // Extract crop production specs array from response
    let specs = [];
    if (Array.isArray(response)) {
      specs = response;
    } else if (response && Array.isArray(response.cropProductionSpecs)) {
      specs = response.cropProductionSpecs;
    } else if (response && response.result && Array.isArray(response.result.cropProductionSpecs)) {
      specs = response.result.cropProductionSpecs;
    }

    // Return the first active spec if available
    return specs.length > 0 ? specs[0] : null;
  }

  /**
   * Fetch active growing medium data
   */
  private async fetchGrowingMedium(): Promise<any | null> {
    const response = await this.growingMediumService
      .getAll(true)
      .toPromise();

    console.log('Fetched growing medium response:', response);

    // Return the first active growing medium if available
    return response.growingMediums.length > 0 ? response.growingMediums[0] : null;
  }

  /**
   * Fetch farm data from crop production
   */
  private async fetchFarmData(cropProductionId: number): Promise<Farm> {
    const cropProduction = await this.cropProductionService
      .getById(cropProductionId)
      .toPromise();

    if (!cropProduction.cropProduction) {
      console.error('CropProduction not found');
      throw new Error('CropProduction not found for the given ID');
    }

    console.log('CropProduction data:', cropProduction.cropProduction);

    // Validate required fields
    if (!cropProduction.cropProduction.latitude) {
      console.error('CropProduction missing latitude - cannot fetch farm data');
      throw new Error('CropProduction latitude is required for farm data');
    }

    if (!cropProduction.cropProduction.longitude) {
      console.error('CropProduction missing longitude - cannot fetch farm data');
      throw new Error('CropProduction longitude is required for farm data');
    }

    return cropProduction.cropProduction;
  }

  /**
   * Fetch crop data from crop production
   */
  private async fetchCropData(cropProductionId: number): Promise<any> {
    const cropProduction = await this.cropProductionService
      .getById(cropProductionId)
      .toPromise();

    console.log('Cro  ch:', cropProduction);
    console.log('CropProduction cropProduction property:', cropProduction.cropProduction);

    if (!cropProduction.cropProduction) {
      console.error('CropProduction not found');
      throw new Error('CropProduction not found for the given ID');
    }

    const cropId = (cropProduction.cropProduction as any).cropId;
    if (!cropId) {
      console.error('CropProduction missing cropId - cannot fetch crop data');
      throw new Error('CropProduction cropId is required for crop base temperature');
    }

    const crop = await this.cropService
      .getById(cropId)
      .toPromise();

    console.log('Fetched crop data:', crop);

    if (!crop) {
      console.error('Crop not found');
      throw new Error('Crop not found for the given cropId');
    }

    if (!crop.cropBaseTemperature && crop.cropBaseTemperature !== 0) {
      console.error('Crop missing cropBaseTemperature');
      throw new Error('Crop cropBaseTemperature is required for KPI calculation');
    }

    return crop;
  }

  // ============================================================================
  // DATA TRANSFORMATION METHODS
  // ============================================================================

  /**
   * Transform raw sensor data into structured climate and irrigation data
   */
  private transformRawData(rawData: any[], deviceId?: string): TransformedSensorData {
    const climateData: ClimateData[] = [];
    const irrigationData: any[] = [];
    const soilMoistureData: any[] = [];

    // Group by date
    const dataByDate = new Map<string, any[]>();

    rawData.forEach(item => {
      const date = new Date(item.recordDate).toISOString().split('T')[0];
      if (!dataByDate.has(date)) {
        dataByDate.set(date, []);
      }
      dataByDate.get(date)!.push(item);
    });

    console.log(`Transforming raw data grouped by date (${dataByDate.size} days)`);
    console.log('Distinct sensors in raw data:', Array.from(new Set(Array.from(dataByDate.values()).flat().map(d => d.sensor))));
    console.log('Sample raw data records:', Array.from(dataByDate.entries()).slice(0, 5));
    console.log('Sample raw data records (last 5):', Array.from(dataByDate.entries()).slice(-5));

    // Collect ALL raw temperature values across all days for capping logic
    const allRawTemps: number[] = [];
    rawData.forEach(item => {
      if (['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(item.sensor)) {
        const temp = parseFloat(item.payload);
        if (!isNaN(temp)) {
          allRawTemps.push(temp);
        }
      }
    });

    // Pre-calculate capping values from ALL raw temperature data
    const validMaxTemps = allRawTemps.filter(t => t <= 43);
    const capMaxValue = validMaxTemps.length > 0 ? Math.max(...validMaxTemps) : null;

    const validMinTemps = allRawTemps.filter(t => t > 0);
    const capMinValue = validMinTemps.length > 0 ? Math.min(...validMinTemps) : null;

    if (allRawTemps.some(t => t > 43)) {
      if (capMaxValue !== null) {
        console.warn(`Warning: Some raw temperature values exceed 43°C - will cap to ${capMaxValue}°C`);
      } else {
        console.warn('Warning: All raw temperature values exceed 43°C - cannot adjust, keeping original values');
      }
    }

    if (allRawTemps.some(t => t === 0)) {
      if (capMinValue !== null) {
        console.warn(`Warning: Some raw temperature values are 0°C - will cap to ${capMinValue}°C`);
      } else {
        console.warn('Warning: All raw temperature values are 0°C - cannot adjust, keeping original values');
      }
    }

    // Process each day
    dataByDate.forEach((dayData, dateStr) => {
      const date = new Date(dateStr);

      // Extract temperature data
      const temps = dayData
        .filter(d => ['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(d.sensor))
        .map(d => parseFloat(d.payload));

      // Extract humidity data with validation
      const humidities = dayData
        .filter(d => ['HUM', 'Hum_SHT2x'].includes(d.sensor))
        .map(d => parseFloat(d.payload))
        .filter(h => !isNaN(h) && h >= 0 && h <= 100); // Validate humidity range

      const humidityMax = humidities.length > 0 ? Math.max(...humidities) : 0;
      const humidityMin = humidities.length > 0 ? Math.min(...humidities) : 0;
      const humidityAvg = humidities.length > 0
        ? humidities.reduce((a, b) => a + b, 0) / humidities.length
        : 0;

      if (humidities.length === 0) {
        console.warn(`No valid humidity data for ${dateStr}, setting to 0`);
      }

      // Extract wind speed data with validation
      const windSpeeds = dayData
        .filter(d => ['wind_speed', 'wind_speed_level'].includes(d.sensor))
        .map(d => parseFloat(d.payload))
        .filter(w => !isNaN(w) && w >= 0 && w <= 20); // Validate wind speed range

      const windSpeed = windSpeeds.length > 0
        ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
        : 0;

      if (windSpeeds.length === 0) {
        console.warn(`No valid wind speed data for ${dateStr}, setting to 0`);
      }

      // Extract solar radiation data with validation
      const radiationReadings = dayData
        .filter(d => ['illumination', 'PAR', 'TSR'].includes(d.sensor))
        .map(d => parseFloat(d.payload))
        .filter(r => !isNaN(r) && r >= 0 && r <= 40); // Validate radiation range

      const solarRadiation = radiationReadings.length > 0
        ? radiationReadings.reduce((a, b) => a + b, 0) / radiationReadings.length
        : 0;

      if (radiationReadings.length === 0) {
        console.warn(`No valid solar radiation data for ${dateStr}, setting to 0`);
      }

      // Extract rainfall
      const rainfall = dayData
        .filter(d => d.sensor === 'rain_gauge')
        .reduce((sum, d) => sum + parseFloat(d.payload), 0);

      if (temps.length > 0) {
        // Apply capping to individual temperature readings before calculating daily max/min
        const cappedTemps = temps.map(t => {
          let cappedTemp = t;
          // Cap max temperature
          if (t > 43 && capMaxValue !== null) {
            cappedTemp = capMaxValue;
          }
          // Cap min temperature (only if original temp was 0)
          if (t === 0 && capMinValue !== null) {
            cappedTemp = capMinValue;
          }
          return cappedTemp;
        });

        climateData.push({
          date: date,
          tempMax: Math.max(...cappedTemps),
          tempMin: Math.min(...cappedTemps),
          tempAvg: cappedTemps.reduce((a, b) => a + b, 0) / cappedTemps.length,
          relativeHumidityMax: humidityMax,
          relativeHumidityMin: humidityMin,
          relativeHumidityAvg: humidityAvg,
          windSpeed: windSpeed,
          solarRadiation: solarRadiation,
          rainfall: rainfall
        });
      }

      // Extract irrigation data (flow meters)
      // CRITICAL: Filter by deviceId to avoid mixing data from multiple sensors
      let flowData = dayData.filter(d => d.sensor === 'Water_flow_value');
 

      // If deviceId is specified, filter to only that device
      if (deviceId) {
        flowData = flowData.filter(d => d.deviceId === deviceId);
        if (flowData.length === 0) {
          console.warn(`No flow data for device ${deviceId} on ${dateStr}`);
        }
      } else if (flowData.length > 0) {
        // If no deviceId specified, check if we have multiple devices (data corruption risk)
        const uniqueDevices = new Set(flowData.map(d => d.deviceId));
        if (uniqueDevices.size > 1) {
          console.error(`⚠️ WARNING: Multiple devices (${uniqueDevices.size}) found for Water_flow_value sensor on ${dateStr}. This will cause incorrect volume calculations! Devices: ${Array.from(uniqueDevices).join(', ')}`);
        }
      }

      if (flowData.length > 0) {
        irrigationData.push({
          date: date,
          flowData: flowData
        });
      }

      // Extract soil moisture
      const moistureData = dayData.filter(d =>
        ['water_SOIL', 'water_SOIL_original'].includes(d.sensor)
      );
      if (moistureData.length > 0) {
        soilMoistureData.push({
          date: date,
          moistureData: moistureData
        });
      }
    });

    return {
      climate: climateData,
      irrigation: irrigationData,
      soilMoisture: soilMoistureData,
      rawData: rawData
    };
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate crop production KPIs using real crop production specs data
   */
  private calculateCropKPIs(cropProduction: any, cropProductionSpecs: CropProductionSpecs | null): CropProductionKPIs {
    console.log('Calculating crop KPIs with:', cropProduction, cropProductionSpecs);

    // Validate crop production specs availability
    if (!cropProductionSpecs) {
      console.error('CropProductionSpecs not found - cannot calculate crop KPIs accurately');
      throw new Error('CropProductionSpecs data is required for KPI calculation');
    }

    // Validate crop production data
    if (!cropProduction.length || !cropProduction.width) {
      console.error('CropProduction missing length or width - cannot calculate crop KPIs');
      throw new Error('CropProduction length and width are required for KPI calculation');
    }

    if (!cropProduction.latitude) {
      console.error('CropProduction missing latitude - cannot calculate crop KPIs');
      throw new Error('CropProduction latitude is required for KPI calculation');
    }

    const cropData: CropProductionData = {
      length: cropProduction.length,
      width: cropProduction.width,
      betweenRowDistance: cropProductionSpecs.betweenRowDistance / 100, // Convert cm to m
      betweenPlantDistance: cropProductionSpecs.betweenPlantDistance / 100, // Convert cm to m
      betweenContainerDistance: cropProductionSpecs.betweenContainerDistance / 100, // Convert cm to m
      latitude: cropProduction.latitude,
    };

    return this.cropCalc.calculateCropProductionKPIs(cropData);
  }

  /**
   * Calculate growing medium KPIs using real growing medium data
   */
  private calculateGrowingMediumKPIs(growingMedium: GrowingMedium | null): GrowingMediumKPIs {
    // Validate growing medium availability
    if (!growingMedium) {
      console.error('GrowingMedium not found - cannot calculate growing medium KPIs accurately');
      throw new Error('GrowingMedium data is required for KPI calculation');
    }

    // Validate required fields
    if (!growingMedium.containerCapacityPercentage) {
      console.error('GrowingMedium missing containerCapacityPercentage');
      throw new Error('GrowingMedium containerCapacityPercentage is required for KPI calculation');
    }

    if (!growingMedium.permanentWiltingPoint) {
      console.error('GrowingMedium missing permanentWiltingPoint');
      throw new Error('GrowingMedium permanentWiltingPoint is required for KPI calculation');
    }

    if (!growingMedium.fiveKpaHumidity) {
      console.error('GrowingMedium missing fiveKpaHumidity');
      throw new Error('GrowingMedium fiveKpaHumidity is required for KPI calculation');
    }

    const mediumData: GrowingMediumData = {
      containerCapacityPercentage: growingMedium.containerCapacityPercentage,
      permanentWiltingPoint: growingMedium.permanentWiltingPoint,
      fiveKpaHumidity: growingMedium.fiveKpaHumidity
    };

    return this.cropCalc.calculateGrowingMediumKPIs(mediumData);
  }

  /**
   * Generate daily KPI outputs
   */
  private generateDailyKPIs(
    input: KPICalculationInput,
    transformedData: TransformedSensorData,
    cropProduction: any,
    cropKPIs: CropProductionKPIs,
    growingMediumKPIs: GrowingMediumKPIs,
    farm: Farm,
    crop: any,
    cropProductionSpecs?: any
  ): DailyKPIOutput[] {
    const dailyKPIs: DailyKPIOutput[] = [];

    // Convert farm coordinates to degrees and minutes format
    const latitudeDegMin = this.decimalToDegreeMinutes(farm.latitude);

    // Use real location data from farm
    const locationData: LocationData = {
      latitude: farm.latitude,
      latitudeGrades: latitudeDegMin.degrees,
      latitudeMinutes: latitudeDegMin.minutes,
      altitude: (farm as any).altitude || 0, // Use farm altitude if available, otherwise 0
      windSpeedMeasurementHeight: 2 // Standard measurement height
    };

    if (!(farm as any).altitude) {
      console.warn('Farm altitude not available, using 0m - this may affect atmospheric pressure calculations');
    }

    transformedData.climate.forEach(climateData => {
      // Calculate climate KPIs using real crop base temperature
      const climateKPIs = this.climateCalc.calculate(
        climateData,
        locationData,
        crop.cropBaseTemperature
      );

      // Calculate irrigation metrics for this day
      const dayIrrigation = transformedData.irrigation.find(
        i => i.date.toISOString() === climateData.date.toISOString()
      );

      let irrigationMetrics: IrrigationMetric[] = [];
      let totalVolume = 0;
      let totalDuration = 0;
      let averageDrainPercentage = 0;

      if (dayIrrigation && dayIrrigation.flowData.length > 0) {
        console.log(`\n🚿 Processing irrigation for date: ${climateData.date.toISOString().split('T')[0]}`);
        console.log(`  Flow data points: ${dayIrrigation.flowData.length}`);

        // Group flow data by device to avoid mixing data from multiple sensors
        const flowDataByDevice = new Map<string, any[]>();
        dayIrrigation.flowData.forEach((reading: any) => {
          const deviceId = reading.deviceId;
          if (!flowDataByDevice.has(deviceId)) {
            flowDataByDevice.set(deviceId, []);
          }
          flowDataByDevice.get(deviceId)!.push(reading);
        });

        console.log(`  Found ${flowDataByDevice.size} flow sensor device(s): ${Array.from(flowDataByDevice.keys()).join(', ')}`);

        // Detect irrigation events from each device separately
        const irrigationEvents: any[] = [];
        flowDataByDevice.forEach((deviceFlowData, deviceId) => {
          console.log(`  Processing device ${deviceId} with ${deviceFlowData.length} readings`);
          const deviceEvents = this.detectIrrigationEventsFromFlow(
            deviceFlowData,
            cropProduction
          );
          console.log(`    Detected ${deviceEvents.length} events for device ${deviceId}`);
          irrigationEvents.push(...deviceEvents);
        });

        console.log(`  Total detected ${irrigationEvents.length} irrigation events across all devices`);

        // Calculate metrics directly from events (dashboard approach)
        // Don't use irrigationCalc service - volumes already calculated from flow changes
        irrigationMetrics = irrigationEvents.map((event: any, index: number) => {
          const previousEvent = index > 0 ? irrigationEvents[index - 1] : null;

          // Calculate duration in milliseconds
          const lengthMs = event.dateTimeEnd.getTime() - event.dateTimeStart.getTime();
          const lengthHours = lengthMs / (1000 * 60 * 60);

          // Calculate interval from previous event (in milliseconds)
          const intervalMs = previousEvent
            ? event.dateTimeStart.getTime() - previousEvent.dateTimeEnd.getTime()
            : 0;

          // Volume already calculated from Water_flow_value changes
          const totalVolume = event.irrigationVolume || 0; // in Liters

          // Calculate derived volumes using crop production KPIs
          const area = cropKPIs.area || 1; // Avoid division by zero
          const totalPlants = cropKPIs.totalPlants || 1; // Avoid division by zero

          const volumePerM2 = totalVolume / area;
          const volumePerPlant = totalVolume / totalPlants;

          // Calculate flow rate (L/h)
          const flowRate = lengthHours > 0 ? totalVolume / lengthHours : 0;

          // Calculate precipitation (mm) - volume per area
          // 1 L/m² = 1 mm
          const precipitation = volumePerM2;

          // Drain data not available from flow meter alone
          const drainPercentage = 0;

          return {
            date: event.dateTimeStart,
            irrigationInterval: intervalMs, // milliseconds
            irrigationLength: lengthMs, // milliseconds
            irrigationVolumenTotal: new Volume(totalVolume, VolumeMeasure.toLitre),
            irrigationVolumenM2: new Volume(volumePerM2, VolumeMeasure.toLitre),
            irrigationVolumenPerPlant: new Volume(volumePerPlant, VolumeMeasure.toLitre),
            drainVolumenM2: new Volume(0, VolumeMeasure.toLitre),
            drainVolumenPerPlant: new Volume(0, VolumeMeasure.toLitre),
            drainPercentage: drainPercentage,
            irrigationFlow: new Volume(flowRate, VolumeMeasure.toLitre),
            irrigationPrecipitation: new Volume(precipitation, VolumeMeasure.toLitre),
            cropProductionId: cropProduction.id
          };
        });

        // Aggregate totals for the day
        totalVolume = irrigationMetrics.reduce(
          (sum, m) => sum + m.irrigationVolumenTotal.value,
          0
        );
        totalDuration = irrigationMetrics.reduce(
          (sum, m) => sum + m.irrigationLength,
          0
        );
        averageDrainPercentage = irrigationMetrics.length > 0
          ? irrigationMetrics.reduce((sum, m) => sum + m.drainPercentage, 0) / irrigationMetrics.length
          : 0;

        console.log(`  📈 Day totals - Volume: ${totalVolume.toFixed(2)} L, Duration: ${(totalDuration / (1000 * 60)).toFixed(2)} min, Events: ${irrigationMetrics.length}`);
      } else {
        console.log(`\n🚿 No irrigation data for date: ${climateData.date.toISOString().split('T')[0]}`);
      }

      dailyKPIs.push({
        date: climateData.date,
        cropProductionId: input.cropProductionId,
        climate: climateKPIs,
        irrigation: {
          metrics: irrigationMetrics,
          totalVolume: totalVolume,
          totalDuration: totalDuration,
          averageDrainPercentage: averageDrainPercentage
        },
        crop: cropKPIs,
        growingMedium: growingMediumKPIs
      });
    });

    return dailyKPIs;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Convert decimal degrees to degrees and minutes
   * @param decimal - Decimal degrees (e.g., 10.123456)
   * @returns Object with degrees and minutes
   */
  private decimalToDegreeMinutes(decimal: number): { degrees: number; minutes: number } {
    const absoluteValue = Math.abs(decimal);
    const degrees = Math.floor(absoluteValue);
    const minutes = (absoluteValue - degrees) * 60;

    return {
      degrees: decimal < 0 ? -degrees : degrees,
      minutes: minutes
    };
  }

  /**
   * Calculate volume from Water_flow_value sensor changes
   * Volume is the sum of all positive flow value increases
   */
  private calculateVolumeFromWaterFlowChanges(waterFlowData: any[]): number {
    if (!waterFlowData || waterFlowData.length < 2) {
      return 0;
    }

    // Sort by date
    const sorted = [...waterFlowData].sort(
      (a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
    );

    console.log(`      📊 Calculating volume from ${sorted.length} flow readings`);

    // Check if all readings are from the same device
    const deviceIds = new Set(sorted.map(r => r.deviceId));
    if (deviceIds.size > 1) {
      console.error(`        ⚠️ ERROR: Readings from ${deviceIds.size} different devices! Device IDs: ${Array.from(deviceIds).join(', ')}`);
    } else if (deviceIds.size === 1) {
      console.log(`        Device: ${Array.from(deviceIds)[0]}`);
    }

    console.log(`        First reading: ${parseFloat(sorted[0].payload).toFixed(2)} L at ${sorted[0].recordDate}`);
    console.log(`        Last reading: ${parseFloat(sorted[sorted.length - 1].payload).toFixed(2)} L at ${sorted[sorted.length - 1].recordDate}`);

    // Calculate total volume as sum of all positive changes
    let totalVolume = 0;
    let changeCount = 0;
    const changes: string[] = [];

    for (let i = 1; i < sorted.length; i++) {
      const current = parseFloat(sorted[i].payload);
      const previous = parseFloat(sorted[i - 1].payload);
      const change = current - previous;

      // Only count positive changes (water flowing)
      if (change > 0) {
        totalVolume += change;
        changeCount++;
        // Log first 5 and last 5 changes for debugging
        if (changeCount <= 5 || i >= sorted.length - 5) {
          changes.push(`${previous.toFixed(2)} → ${current.toFixed(2)} = +${change.toFixed(2)}L`);
        } else if (changeCount === 6) {
          changes.push(`... (${sorted.length - 10} more changes) ...`);
        }
      }
    }

    console.log(`        Changes: ${changes.join(', ')}`);
    console.log(`        Total volume: ${totalVolume.toFixed(2)} L from ${changeCount} positive changes`);
    return totalVolume;
  }

  /**
   * Detect irrigation events from Water_flow_value sensor data
   * Dashboard approach: each payload change is an event
   */
  private detectIrrigationEventsFromFlow(
    flowData: any[],
    cropProduction: any
  ): any[] {
    const events: any[] = [];

    if (!flowData || flowData.length < 2) {
      return events;
    }

    // Sort by date
    const sorted = [...flowData].sort(
      (a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
    );

    // Debug: Show first few readings
    console.log(`    📋 Sample readings (first 5):`);
    for (let i = 0; i < Math.min(5, sorted.length); i++) {
      console.log(`      [${i}] ${sorted[i].recordDate}: ${sorted[i].payload}`);
    }

    // Detect each payload change as an event (dashboard approach)
    for (let i = 1; i < sorted.length; i++) {
      const currentReading = sorted[i];
      const previousReading = sorted[i - 1];

      const currentPayload = parseFloat(currentReading.payload);
      const previousPayload = parseFloat(previousReading.payload);

      // Check if there was a change in payload
      if (currentPayload !== previousPayload) {
        const currentTime = new Date(currentReading.recordDate);
        const previousTime = new Date(previousReading.recordDate);
        const volumeChange = currentPayload - previousPayload;

        // Only count positive changes (water flowing)
        if (volumeChange > 0) {
          events.push({
            recordDateTime: previousTime,
            dateTimeStart: previousTime,
            dateTimeEnd: currentTime,
            cropProductionId: cropProduction.id,
            irrigationVolume: volumeChange,
            drainVolume: 0,
            flowReadings: [previousReading, currentReading],
            irrigationMeasurements: [
              { measurementVariableId: 1, recordValue: volumeChange },
              { measurementVariableId: 2, recordValue: 0 }
            ]
          });
        }
      } else {
        // console.log(`      No change between ${previousReading.recordDate} (${previousPayload}) and ${currentReading.recordDate} (${currentPayload})`);
      }
    }

    return events;
  }
}