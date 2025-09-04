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
    auth: {
      login: '/Authentication/Login',                    // Fixed: removed /api prefix
      refresh: '/Authentication/Refresh',               // Fixed: removed /api prefix  
      refreshToken: '/Authentication/RefreshToken'      // Fixed: removed /api prefix
    },
    // Based on your backend controllers, these should also be updated:
    companies: '/Company',                              // Fixed: removed /api prefix
    farms: '/Farm',                                     // Fixed: removed /api prefix
    crops: '/Crop',                                     // Fixed: removed /api prefix
    devices: '/Device',                                 // Fixed: removed /api prefix
    cropProductions: '/CropProduction',                 // Fixed: removed /api prefix
    clients: '/Client',                                 // Fixed: removed /api prefix
    users: '/User',                                     // Fixed: removed /api prefix
    profiles: '/Profile',                               // Fixed: removed /api prefix
    productionUnits: '/ProductionUnit',                 // Fixed: removed /api prefix
    productionUnitTypes: '/ProductionUnitType',         // Fixed: removed /api prefix
    cropPhases: '/CropPhase',                           // Fixed: removed /api prefix
    containers: '/Container',                           // Fixed: removed /api prefix
    growingMediums: '/GrowingMedium',                   // Fixed: removed /api prefix
    sensors: '/Sensor',                                 // Fixed: removed /api prefix
    cropProductionDevices: '/CropProductionDevice',     // Fixed: removed /api prefix
    cropProductionIrrigationSectors: '/CropProductionIrrigationSector', // Fixed: removed /api prefix
    droppers: '/Dropper',                               // Fixed: removed /api prefix
    catalogs: '/Catalog',                               // Fixed: removed /api prefix
    userFarms: '/UserFarm',                             // Fixed: removed /api prefix
    fertilizers: '/Fertilizer',                         // Fixed: removed /api prefix
    fertilizerChemistry: '/FertilizerChemistry',        // Fixed: removed /api prefix
    fertilizerInputs: '/FertilizerInput',               // Fixed: removed /api prefix
    water: '/Water',                                    // Fixed: removed /api prefix
    waterChemistry: '/WaterChemistry',                  // Fixed: removed /api prefix
    calculationSettings: '/CalculationSetting',        // Fixed: removed /api prefix
    cropPhaseOptimals: '/CropPhaseOptimal',             // Fixed: removed /api prefix
    relayModules: '/RelayModule',                       // Fixed: removed /api prefix
    measurementVariables: '/MeasurementVariable',       // Fixed: removed /api prefix
    timeZones: '/TimeZone',                             // Fixed: removed /api prefix
    containerTypes: '/ContainerType',                   // Fixed: removed /api prefix
    measurementVariableStandards: '/MeasurementVariableStandard', // Fixed: removed /api prefix
    measurementUnits: '/MeasurementUnit',               // Fixed: removed /api prefix
    licenses: '/License'                                // Fixed: removed /api prefix
  };

  // Helper method to build full URL
  getFullUrl(endpoint: string): string {
    return `${this.agronomicApiUrl}${endpoint}`;
  }

  // Helper method to get authentication URL
  getAuthUrl(authEndpoint: keyof typeof this.endpoints.auth): string {
    return this.getFullUrl(this.endpoints.auth[authEndpoint]);
  }
}