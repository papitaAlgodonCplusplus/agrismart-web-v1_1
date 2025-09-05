// src/app/core/services/api-config.service.ts - UPDATED
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
    
    // Agronomic API endpoints - Fixed to match actual API endpoints
    analyticalEntity: '/AnalyticalEntity',
    company: '/Company',
    crop: '/Crop',
    cropProductionDevice: '/CropProductionDevice',
    cropProductionIrrigationSector: '/CropProductionIrrigationSector',
    device: '/Device',
    farm: '/Farm',
    license: '/License',
    productionUnit: '/ProductionUnit', // This should work now
    relayModuleCropProductionIrrigationSector: '/RelayModuleCropProductionIrrigationSector',
    user: '/User',
    userFarm: '/UserFarm',
    waterChemistry: '/WaterChemistry',
    
    // Extended endpoints (based on frontend services) - Ensure these exist on backend
    client: '/Client',
    productionUnitType: '/ProductionUnitType',
    cropPhase: '/CropPhase',
    growingMedium: '/GrowingMedium',
    sensor: '/Sensor', // May not exist - needs backend verification
    measurementVariable: '/MeasurementVariable',
    measurementVariableStandard: '/MeasurementVariableStandard',
    measurementUnit: '/MeasurementUnit',
    cropProduction: '/CropProduction',
    dropper: '/Dropper',
    catalog: '/Catalog',
    container: '/Container',
    containerType: '/ContainerType',
    fertilizer: '/Fertilizer', // May not exist - needs backend verification
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
    // Add null/undefined check
    if (!endpoint) {
      throw new Error('Endpoint cannot be null or undefined');
    }
    
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.agronomicApiUrl}${normalizedEndpoint}`;
    
    // Validate URL construction
    if (fullUrl.includes('undefined') || fullUrl.includes('null')) {
      throw new Error(`Invalid URL constructed: ${fullUrl}`);
    }
    
    return fullUrl;
  }

  /**
   * Get the full URL for an IoT API endpoint
   */
  getIotUrl(endpoint: string): string {
    if (!endpoint) {
      throw new Error('Endpoint cannot be null or undefined');
    }
    
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${this.iotApiUrl}${normalizedEndpoint}`;
    
    if (fullUrl.includes('undefined') || fullUrl.includes('null')) {
      throw new Error(`Invalid IoT URL constructed: ${fullUrl}`);
    }
    
    return fullUrl;
  }

  /**
   * Get endpoint by key with optional ID parameter - Enhanced error handling
   */
  getEndpoint(key: string, id?: number | string): string {
    if (!key) {
      throw new Error('Endpoint key cannot be null or undefined');
    }

    const endpoint = (this.endpoints as any)[key];
    if (!endpoint) {
      console.error(`Available endpoints:`, Object.keys(this.endpoints));
      throw new Error(`Endpoint '${key}' not found in configuration`);
    }
    
    return id ? `${endpoint}/${id}` : endpoint;
  }

  /**
   * Get IoT endpoint by key with optional parameters
   */
  getIotEndpoint(key: string): string {
    if (!key) {
      throw new Error('IoT endpoint key cannot be null or undefined');
    }

    const endpoint = (this.endpoints.iot as any)[key];
    if (!endpoint) {
      console.error(`Available IoT endpoints:`, Object.keys(this.endpoints.iot));
      throw new Error(`IoT endpoint '${key}' not found in configuration`);
    }
    return endpoint;
  }

  /**
   * Check if endpoint exists
   */
  hasEndpoint(key: string): boolean {
    return !!(this.endpoints as any)[key];
  }

  /**
   * Check if IoT endpoint exists
   */
  hasIotEndpoint(key: string): boolean {
    return !!(this.endpoints.iot as any)[key];
  }

  /**
   * Get all available endpoint keys
   */
  getAvailableEndpoints(): string[] {
    return Object.keys(this.endpoints).filter(key => key !== 'iot');
  }

  /**
   * Get all available IoT endpoint keys
   */
  getAvailableIotEndpoints(): string[] {
    return Object.keys(this.endpoints.iot);
  }

  /**
   * Safe endpoint getter - returns null if not found instead of throwing
   */
  safeGetEndpoint(key: string, id?: number | string): string | null {
    try {
      return this.getEndpoint(key, id);
    } catch (error) {
      console.warn(`Endpoint '${key}' not found:`, error);
      return null;
    }
  }

  /**
   * Safe URL getter - returns null if URL cannot be constructed
   */
  safeGetAgronomicUrl(endpoint: string): string | null {
    try {
      return this.getAgronomicUrl(endpoint);
    } catch (error) {
      console.warn(`Cannot construct agronomic URL for '${endpoint}':`, error);
      return null;
    }
  }
}