// src/app/core/services/api-config.service.ts - UPDATED WITH NEW IoT ENDPOINTS
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
    
    // Measurement and irrigation endpoints
    irrigationEvent: '/IrrigationEvent',
    irrigationMeasurement: '/IrrigationMeasurement',
    measurement: '/Measurement',
    measurementBase: '/MeasurementBase',
    measurementKPI: '/MeasurementKPI',
    
    // IoT API endpoints - UPDATED WITH NEW ENDPOINTS
    iot: {
      // Device Raw Data endpoints
      deviceRawData: '/DeviceRawData',
      deviceRawDataMqtt: '/DeviceRawData/Mqtt',
      processRawData: '/DeviceRawData/ProcessRawData',
      
      // Device Sensor endpoints - NEW
      deviceSensorDevices: '/DeviceSensor/devices',
      deviceSensorSensors: '/DeviceSensor/sensors',
      
      // Security endpoints
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

  /**
   * Safe IoT URL getter - returns null if URL cannot be constructed
   */
  safeGetIotUrl(endpoint: string): string | null {
    try {
      return this.getIotUrl(endpoint);
    } catch (error) {
      console.warn(`Cannot construct IoT URL for '${endpoint}':`, error);
      return null;
    }
  }

  /**
   * Build query parameters for device raw data API
   */
  buildDeviceRawDataParams(params: {
    deviceId?: string;
    startDate?: string;
    endDate?: string;
    sensor?: string;
    pageNumber?: number;
    pageSize?: number;
  }): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    if (params.deviceId) searchParams.append('DeviceId', params.deviceId);
    if (params.startDate) searchParams.append('StartDate', params.startDate);
    if (params.endDate) searchParams.append('EndDate', params.endDate);
    if (params.sensor) searchParams.append('Sensor', params.sensor);
    if (params.pageNumber) searchParams.append('PageNumber', params.pageNumber.toString());
    if (params.pageSize) searchParams.append('PageSize', params.pageSize.toString());
    
    return searchParams;
  }

  /**
   * Build query parameters for agronomic device API
   */
  buildDeviceParams(params: {
    clientId?: number;
    companyId?: number;
    cropProductionId?: number;
    includeInactives?: boolean;
  }): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    if (params.clientId) searchParams.append('ClientId', params.clientId.toString());
    if (params.companyId) searchParams.append('CompanyId', params.companyId.toString());
    if (params.cropProductionId) searchParams.append('CropProductionId', params.cropProductionId.toString());
    if (params.includeInactives !== undefined) searchParams.append('IncludeInactives', params.includeInactives.toString());
    
    return searchParams;
  }

  /**
   * Build query parameters for crop production device API
   */
  buildCropProductionDeviceParams(params: {
    cropProductionId?: number;
  }): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    if (params.cropProductionId) searchParams.append('CropProductionId', params.cropProductionId.toString());
    
    return searchParams;
  }

  /**
   * Get complete IoT device data URL with parameters
   */
  getDeviceRawDataUrl(params?: {
    deviceId?: string;
    startDate?: string;
    endDate?: string;
    sensor?: string;
    pageNumber?: number;
    pageSize?: number;
  }): string {
    const baseUrl = this.getIotUrl(this.endpoints.iot.deviceRawData);
    
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }
    
    const searchParams = this.buildDeviceRawDataParams(params);
    return `${baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Get complete agronomic device URL with parameters
   */
  getAgronomicDeviceUrl(params?: {
    clientId?: number;
    companyId?: number;
    cropProductionId?: number;
    includeInactives?: boolean;
  }): string {
    const baseUrl = this.getAgronomicUrl(this.endpoints.device);
    
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }
    
    const searchParams = this.buildDeviceParams(params);
    return `${baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Get complete crop production device URL with parameters
   */
  getCropProductionDeviceUrl(params?: {
    cropProductionId?: number;
  }): string {
    const baseUrl = this.getAgronomicUrl(this.endpoints.cropProductionDevice);
    
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }
    
    const searchParams = this.buildCropProductionDeviceParams(params);
    return `${baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Validate API configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check base URLs
    if (!this.agronomicApiUrl) {
      errors.push('Agronomic API URL not configured');
    }
    
    if (!this.iotApiUrl) {
      errors.push('IoT API URL not configured');
    }
    
    // Check if URLs are valid
    try {
      new URL(this.agronomicApiUrl);
    } catch (error) {
      errors.push('Invalid Agronomic API URL format');
    }
    
    try {
      new URL(this.iotApiUrl);
    } catch (error) {
      errors.push('Invalid IoT API URL format');
    }
    
    // Check critical endpoints
    const criticalEndpoints = ['device', 'cropProductionDevice'];
    criticalEndpoints.forEach(endpoint => {
      if (!this.hasEndpoint(endpoint)) {
        errors.push(`Critical endpoint '${endpoint}' not configured`);
      }
    });
    
    const criticalIotEndpoints = ['deviceRawData', 'deviceSensorDevices'];
    criticalIotEndpoints.forEach(endpoint => {
      if (!this.hasIotEndpoint(endpoint)) {
        errors.push(`Critical IoT endpoint '${endpoint}' not configured`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigurationSummary(): {
    agronomicApiUrl: string;
    iotApiUrl: string;
    endpointCount: number;
    iotEndpointCount: number;
    availableEndpoints: string[];
    availableIotEndpoints: string[];
  } {
    return {
      agronomicApiUrl: this.agronomicApiUrl,
      iotApiUrl: this.iotApiUrl,
      endpointCount: this.getAvailableEndpoints().length,
      iotEndpointCount: this.getAvailableIotEndpoints().length,
      availableEndpoints: this.getAvailableEndpoints(),
      availableIotEndpoints: this.getAvailableIotEndpoints()
    };
  }
}