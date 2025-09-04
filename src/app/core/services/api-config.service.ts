// src/app/core/services/api-config.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  readonly agronomicApiUrl = environment.agronomicApiUrl;
  readonly iotApiUrl = environment.iotApiUrl;
  
  readonly endpoints = {
    // Authentication endpoints
    auth: {
      login: '/Authentication/Login',
      refresh: '/Authentication/Refresh',
      refreshToken: '/Authentication/RefreshToken'
    },
    
    // Agronomic API endpoints
    analyticalEntity: '/AnalyticalEntity',
    company: '/Company',
    crop: '/Crop',
    cropProductionDevice: '/CropProductionDevice',
    cropProductionIrrigationSector: '/CropProductionIrrigationSector',
    device: '/Device',
    farm: '/Farm',
    license: '/License',
    productionUnit: '/ProductionUnit',
    relayModuleCropProductionIrrigationSector: '/RelayModuleCropProductionIrrigationSector',
    user: '/User',
    userFarm: '/UserFarm',
    waterChemistry: '/WaterChemistry',
    
    // Extended endpoints (based on frontend services)
    client: '/Client',
    productionUnitType: '/ProductionUnitType',
    cropPhase: '/CropPhase',
    growingMedium: '/GrowingMedium',
    sensor: '/Sensor',
    measurementVariable: '/MeasurementVariable',
    measurementVariableStandard: '/MeasurementVariableStandard',
    measurementUnit: '/MeasurementUnit',
    cropProduction: '/CropProduction',
    dropper: '/Dropper',
    catalog: '/Catalog',
    container: '/Container',
    containerType: '/ContainerType',
    fertilizer: '/Fertilizer',
    fertilizerChemistry: '/FertilizerChemistry',
    fertilizerInput: '/FertilizerInput',
    water: '/Water',
    calculationSetting: '/CalculationSetting',
    cropPhaseOptimal: '/CropPhaseOptimal',
    relayModule: '/RelayModule',
    timeZone: '/TimeZone',
    profile: '/Profile',
    userStatus: '/UserStatus',
    
    // IoT API endpoints
    iot: {
      deviceRawData: '/DeviceRawData',
      deviceRawDataMqtt: '/DeviceRawData/Mqtt',
      processRawData: '/DeviceRawData/ProcessRawData',
      authenticateDevice: '/Security/AuthenticateDevice',
      authenticateMqttConnection: '/Security/AuthenticateMqttConnection'
    }
  };

  /**
   * Get the full URL for an agronomic API endpoint
   */
  getAgronomicUrl(endpoint: string): string {
    return `${this.agronomicApiUrl}${endpoint}`;
  }

  /**
   * Get the full URL for an IoT API endpoint
   */
  getIotUrl(endpoint: string): string {
    return `${this.iotApiUrl}${endpoint}`;
  }

  /**
   * Get endpoint by key with optional ID parameter
   */
  getEndpoint(key: string, id?: number | string): string {
    const endpoint = (this.endpoints as any)[key];
    if (!endpoint) {
      throw new Error(`Endpoint '${key}' not found`);
    }
    return id ? `${endpoint}/${id}` : endpoint;
  }

  /**
   * Get IoT endpoint by key with optional parameters
   */
  getIotEndpoint(key: string): string {
    const endpoint = (this.endpoints.iot as any)[key];
    if (!endpoint) {
      throw new Error(`IoT endpoint '${key}' not found`);
    }
    return endpoint;
  }
}