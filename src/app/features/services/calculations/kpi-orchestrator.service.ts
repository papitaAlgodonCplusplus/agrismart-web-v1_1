// src/app/features/dashboard/services/calculations/kpi-orchestrator.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Services
import { ClimateCalculationsService, ClimateData, ClimateKPIs, LocationData } from './climate-calculations.service';
import { IrrigationCalculationsService, IrrigationMetric } from '../../services/irrigation-calculations.service';
import { CropCalculationsService, CropProductionData, CropProductionKPIs, GrowingMediumData, GrowingMediumKPIs } from './crop-calculations.service';
import { IrrigationSectorService } from '../../services/irrigation-sector.service';
import { CropService } from '../../crops/services/crop.service';
import { CropProductionSpecsService, CropProductionSpecs } from '../../crop-production-specs/services/crop-production-specs.service';
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
    private cropProductionService: CropService,
    private cropProductionSpecsService: CropProductionSpecsService,
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
      // 1. Fetch all required data
      const [rawData, cropProduction, cropProductionSpecs, growingMedium, farm, crop] = await Promise.all([
        this.fetchRawSensorData(input),
        this.fetchCropProductionData(input.cropProductionId),
        this.fetchCropProductionSpecs(),
        this.fetchGrowingMedium(),
        this.fetchFarmData(input.cropProductionId),
        this.fetchCropData(input.cropProductionId)
      ]);

      // 2. Transform raw data into structured format
      const transformedData = this.transformRawData(rawData);

      // 3. Calculate crop production KPIs (these are constant for the period)
      const cropKPIs = this.calculateCropKPIs(cropProduction, cropProductionSpecs);

      // 4. Calculate growing medium KPIs (these are constant for the period)
      const growingMediumKPIs = this.calculateGrowingMediumKPIs(cropProduction, growingMedium);

      // 5. Generate daily KPIs
      const dailyKPIs = this.generateDailyKPIs(
        input,
        transformedData,
        cropProduction,
        cropKPIs,
        growingMediumKPIs,
        farm,
        crop
      );

      return dailyKPIs;

    } catch (error) {
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
  private async fetchRawSensorData(input: KPICalculationInput): Promise<any[]> {
    const startDate = input.startDate.toISOString();
    const endDate = input.endDate.toISOString();

    const rawData = await this.irrigationService
      .getDeviceRawData(
        input.deviceIds ? input.deviceIds[0] : undefined,
        startDate,
        endDate,
        undefined,
        1,
        10000
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
  private async fetchGrowingMedium(): Promise<GrowingMedium | null> {
    const response = await this.growingMediumService
      .getAll(false)
      .toPromise();

    // Extract growing medium array from response
    let growingMedia = [];
    if (Array.isArray(response)) {
      growingMedia = response;
    } else if (response && Array.isArray(response.growingMedia)) {
      growingMedia = response.growingMedia;
    } else if (response && response.result && Array.isArray(response.result.growingMedia)) {
      growingMedia = response.result.growingMedia;
    }

    // Return the first active growing medium if available
    return growingMedia.length > 0 ? growingMedia[0] : null;
  }

  /**
   * Fetch farm data from crop production
   */
  private async fetchFarmData(cropProductionId: number): Promise<Farm> {
    const cropProduction = await this.cropProductionService
      .getById(cropProductionId)
      .toPromise();

    if (!cropProduction) {
      console.error('CropProduction not found');
      throw new Error('CropProduction not found for the given ID');
    }

    const farmId = (cropProduction as any).farmId;
    if (!farmId) {
      console.error('CropProduction missing farmId - cannot fetch farm data');
      throw new Error('CropProduction farmId is required for location data');
    }

    const farm = await this.farmService
      .getById(farmId)
      .toPromise();

    if (!farm) {
      console.error('Farm not found');
      throw new Error('Farm not found for the given farmId');
    }

    // Validate required fields
    if (!farm.latitude) {
      console.error('Farm missing latitude coordinate');
      throw new Error('Farm latitude is required for KPI calculation');
    }

    if (!farm.longitude) {
      console.error('Farm missing longitude coordinate');
      throw new Error('Farm longitude is required for KPI calculation');
    }

    return farm;
  }

  /**
   * Fetch crop data from crop production
   */
  private async fetchCropData(cropProductionId: number): Promise<any> {
    const cropProduction = await this.cropProductionService
      .getById(cropProductionId)
      .toPromise();

    if (!cropProduction) {
      console.error('CropProduction not found');
      throw new Error('CropProduction not found for the given ID');
    }

    const cropId = (cropProduction as any).cropId;
    if (!cropId) {
      console.error('CropProduction missing cropId - cannot fetch crop data');
      throw new Error('CropProduction cropId is required for crop base temperature');
    }

    const crop = await this.cropProductionService
      .getById(cropId)
      .toPromise();

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
  private transformRawData(rawData: any[]): TransformedSensorData {
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

    // Process each day
    dataByDate.forEach((dayData, dateStr) => {
      const date = new Date(dateStr);

      // Extract temperature data
      const temps = dayData
        .filter(d => ['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(d.sensor))
        .map(d => parseFloat(d.payload));

      // Extract humidity data
      const humidities = dayData
        .filter(d => ['HUM', 'Hum_SHT2x'].includes(d.sensor))
        .map(d => parseFloat(d.payload));

      const humidityMax = humidities.length > 0 ? Math.max(...humidities) : 0;
      const humidityMin = humidities.length > 0 ? Math.min(...humidities) : 0;
      const humidityAvg = humidities.length > 0
        ? humidities.reduce((a, b) => a + b, 0) / humidities.length
        : 0;

      // Extract wind speed data
      const windSpeeds = dayData
        .filter(d => ['wind_speed', 'wind_speed_level'].includes(d.sensor))
        .map(d => parseFloat(d.payload));

      const windSpeed = windSpeeds.length > 0
        ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
        : 0; // Default fallback (m/s)

      // Extract solar radiation data
      const radiationReadings = dayData
        .filter(d => ['illumination', 'PAR', 'TSR'].includes(d.sensor))
        .map(d => parseFloat(d.payload));

      const solarRadiation = radiationReadings.length > 0
        ? radiationReadings.reduce((a, b) => a + b, 0) / radiationReadings.length
        : 20; // Default fallback (MJ/m²/day)

      // Extract rainfall
      const rainfall = dayData
        .filter(d => d.sensor === 'rain_gauge')
        .reduce((sum, d) => sum + parseFloat(d.payload), 0);

      if (temps.length > 0) {
        climateData.push({
          date: date,
          tempMax: Math.max(...temps),
          tempMin: Math.min(...temps),
          tempAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
          relativeHumidityMax: humidityMax,
          relativeHumidityMin: humidityMin,
          relativeHumidityAvg: humidityAvg,
          windSpeed: windSpeed,
          solarRadiation: solarRadiation,
          rainfall: rainfall
        });
      }

      // Extract irrigation data (flow meters)
      const flowData = dayData.filter(d => d.sensor === 'Water_flow_value');
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
      betweenRowDistance: cropProductionSpecs.betweenRowDistance,
      betweenPlantDistance: cropProductionSpecs.betweenPlantDistance,
      betweenContainerDistance: cropProductionSpecs.betweenContainerDistance,
      latitude: cropProduction.latitude,
    };

    return this.cropCalc.calculateCropProductionKPIs(cropData);
  }

  /**
   * Calculate growing medium KPIs using real growing medium data
   */
  private calculateGrowingMediumKPIs(cropProduction: any, growingMedium: GrowingMedium | null): GrowingMediumKPIs {
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
    crop: any
  ): DailyKPIOutput[] {
    const dailyKPIs: DailyKPIOutput[] = [];

    // Convert farm coordinates to degrees and minutes format
    const latitudeDegMin = this.decimalToDegreeMinutes(farm.latitude);

    // Use real location data from farm
    const locationData: LocationData = {
      latitude: farm.latitude,
      latitudeGrades: latitudeDegMin.degrees,
      latitudeMinutes: latitudeDegMin.minutes,
      altitude: 1000, // TODO: Add altitude field to Farm entity
      windSpeedMeasurementHeight: 2 // Standard measurement height
    };

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
        // TODO: Calculate actual irrigation metrics
        // For now, aggregate flow data
        totalVolume = dayIrrigation.flowData.reduce(
          (sum: number, d: any) => sum + parseFloat(d.payload), 
          0
        );
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
}