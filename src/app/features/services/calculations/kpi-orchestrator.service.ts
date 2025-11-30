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
    private cropProductionService: CropService
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
      const [rawData, cropProduction] = await Promise.all([
        this.fetchRawSensorData(input),
        this.fetchCropProductionData(input.cropProductionId)
      ]);

      // 2. Transform raw data into structured format
      const transformedData = this.transformRawData(rawData);

      // 3. Calculate crop production KPIs (these are constant for the period)
      const cropKPIs = this.calculateCropKPIs(cropProduction);

      // 4. Calculate growing medium KPIs (these are constant for the period)
      const growingMediumKPIs = this.calculateGrowingMediumKPIs(cropProduction);

      // 5. Generate daily KPIs
      const dailyKPIs = this.generateDailyKPIs(
        input,
        transformedData,
        cropProduction,
        cropKPIs,
        growingMediumKPIs
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

      // TODO: MOCKED - Extract humidity data (not in sample data)
      const humidityMax = 80; // MOCKED
      const humidityMin = 50; // MOCKED
      const humidityAvg = 65; // MOCKED

      // TODO: MOCKED - Extract wind speed (not in sample data)
      const windSpeed = 2.5; // MOCKED (m/s)

      // TODO: MOCKED - Solar radiation (not in sample data)
      const solarRadiation = 20; // MOCKED (MJ/m²/day)

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
   * Calculate crop production KPIs
   */
  private calculateCropKPIs(cropProduction: any): CropProductionKPIs {
    // TODO: MOCKED - These values should come from cropProduction API
    const cropData: CropProductionData = {
      length: cropProduction.length || 100, // MOCKED if not available
      width: cropProduction.width || 50, // MOCKED if not available
      betweenRowDistance: cropProduction.betweenRowDistance || 1.5, // MOCKED
      betweenPlantDistance: cropProduction.betweenPlantDistance || 0.3, // MOCKED
      betweenContainerDistance: cropProduction.betweenContainerDistance || 0.3, // MOCKED
      latitude: cropProduction.latitude || 10.0, // MOCKED - Costa Rica ~10°N
    };

    return this.cropCalc.calculateCropProductionKPIs(cropData);
  }

  /**
   * Calculate growing medium KPIs
   */
  private calculateGrowingMediumKPIs(cropProduction: any): GrowingMediumKPIs {
    // TODO: MOCKED - These values should come from GrowingMedium entity
    const mediumData: GrowingMediumData = {
      containerCapacityPercentage: 40, // MOCKED
      permanentWiltingPoint: 15, // MOCKED
      fiveKpaHumidity: 25 // MOCKED
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
    growingMediumKPIs: GrowingMediumKPIs
  ): DailyKPIOutput[] {
    const dailyKPIs: DailyKPIOutput[] = [];

    // TODO: MOCKED - Location data should come from farm/crop production
    const locationData: LocationData = {
      latitude: cropProduction.latitude || 10.0, // MOCKED
      latitudeGrades: cropKPIs.latitudeGrades,
      latitudeMinutes: cropKPIs.latitudeMinutes,
      altitude: cropProduction.altitude || 1000, // MOCKED - Costa Rica highlands
      windSpeedMeasurementHeight: 2 // MOCKED - standard 2m height
    };

    transformedData.climate.forEach(climateData => {
      // Calculate climate KPIs
      const climateKPIs = this.climateCalc.calculate(
        climateData,
        locationData,
        10 // MOCKED - crop base temperature (°C)
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
}