// src/app/features/dashboard/services/calculations/climate-calculations.service.ts
import { Injectable } from '@angular/core';

// ============================================================================
// CONSTANTS (from CalculationsClimate.cs)
// ============================================================================
const SOLAR_CONSTANT = 0.082 * (24 * 60 / Math.PI);
const ALBEDO_CONSTANT = 0.23;
const STEFANBOLTZMANN_CONSTANT = 0.000000004903;
const EARTH_SUN_INVERSE_DISTANCE_CONSTANT = 0.033;
const REFERENCE_CROP_SURFACE_RESISTANCE_CONSTANT = 70;
const SPECIFIC_HEAT_AT_CONSTANT_PRESSURE_CONSTANT = 0.001013;
const MOLECULAR_WEIGHT_RATIO_OF_WATER_VAPOR_DRY_AIR = 0.622;

// ============================================================================
// INTERFACES
// ============================================================================
export interface ClimateData {
  date: Date;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  relativeHumidityMax: number;
  relativeHumidityMin: number;
  relativeHumidityAvg: number;
  windSpeed: number;
  solarRadiation?: number; // Optional - can be calculated if missing
  rainfall?: number;
}

export interface ClimateKPIs {
  date: Date;
  // Vapor Pressure
  saturationVaporPressure: number;
  realVaporPressure: number;
  vaporPressureDeficit: number;
  avgRealVaporPressure: number; // Batch 2

  // Solar Radiation
  extraterrestrialRadiation: number;
  clearSkySolarRadiation: number;
  netSolarRadiation: number;
  netLongwaveRadiation: number;
  netRadiation: number;
  earthSunInverseDistance: number; // Batch 2
  latitudeRadians: number; // Batch 2
  solarInclination: number; // Batch 2
  solarSunsetAngle: number; // Batch 2
  extraterrestrialSolarRadiationTerm: number; // Batch 2

  // Batch 3: Longwave Radiation Components
  isothermalLongwaveRadiationFactor: number;
  humidityFactor: number;
  cloudFactor: number;

  // Evapotranspiration
  referenceET: number; // FAO-56 Penman-Monteith
  referenceETMin?: number; // Batch 3: Minimum ET across period

  // Additional
  degreesDay: number;
  psychrometricConstant: number;
  slopeVaporPressureCurve: number;
  windSpeedMtsPerSecond: number; // Batch 2
  slopeVaporPressureCurveCalc: number; // Batch 2
  latentHeatEvaporation: number; // Batch 2
  psychrometricConstantCalc: number; // Batch 2

  // Batch 3: Light Integrals
  parLightIntegral?: number; // mol/m²/day
  globalLightIntegral?: number; // MJ/m²/day
}

export interface LocationData {
  latitude: number;
  latitudeGrades: number;
  latitudeMinutes: number;
  altitude: number;
  windSpeedMeasurementHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClimateCalculationsService {

  constructor() { }

  // ============================================================================
  // MAIN CALCULATION METHOD
  // ============================================================================
  
  /**
   * Calculate all climate KPIs for a given date
   */
  calculate(
    climateData: ClimateData,
    locationData: LocationData,
    cropBaseTemperature: number = 10
  ): ClimateKPIs {
    
    // Vapor Pressure calculations
    const saturationVaporPressure = this.getSaturationVaporPressure(climateData.tempAvg);
    const realVaporPressure = this.getAvgRealVaporPressure(
      climateData.tempMin,
      climateData.relativeHumidityMax,
      climateData.tempMax,
      climateData.relativeHumidityMin
    );
    const vaporPressureDeficit = saturationVaporPressure - realVaporPressure;

    // Solar Radiation calculations
    const extraterrestrialRadiation = this.getExtraterrestrialSolarRadiation(
      climateData.date,
      locationData.latitudeGrades,
      locationData.latitudeMinutes
    );
    
    const clearSkySolarRadiation = this.getClearSkySolarRadiation(
      locationData.altitude,
      extraterrestrialRadiation
    );
    
    const solarRadiation = climateData.solarRadiation || 
      (extraterrestrialRadiation * 0.5); // Estimate if missing
    
    const netSolarRadiation = this.getNetSolarRadiation(solarRadiation);
    
    const isothermalLongwave = this.getIsothermalLongwaveRadiationFactor(
      climateData.tempMax,
      climateData.tempMin
    );
    
    const humidityFactor = this.getHumidityFactor(realVaporPressure);
    
    const cloudFactor = this.getCloudFactor(solarRadiation / clearSkySolarRadiation);
    
    const netLongwaveRadiation = isothermalLongwave * humidityFactor * cloudFactor;
    
    const netRadiation = netSolarRadiation - netLongwaveRadiation;

    // ET calculation components
    const windSpeedAdj = this.getWindSpeedAsMtsPerSecond(
      climateData.windSpeed,
      locationData.windSpeedMeasurementHeight
    );
    
    const slopeVaporPressureCurve = this.getSlopeVaporPressureCurve(climateData.tempAvg);
    const latentHeat = this.getLatentHeatEvaporation(climateData.tempAvg);
    const psychrometricConstant = this.getPsychrometricConstant(
      locationData.altitude,
      climateData.tempAvg
    );

    // FAO-56 Penman-Monteith ET
    const referenceET = this.calculateReferenceET(
      netRadiation,
      climateData.tempAvg,
      windSpeedAdj,
      saturationVaporPressure,
      realVaporPressure,
      slopeVaporPressureCurve,
      psychrometricConstant,
      latentHeat
    );

    // Degrees Day
    const degreesDay = this.getDegreesDay(
      climateData.tempMax,
      climateData.tempMin,
      cropBaseTemperature
    );

    // Batch 2 calculations
    const avgRealVaporPressure = this.getAvgRealVaporPressure(
      climateData.tempMax,
      climateData.tempMin,
      climateData.relativeHumidityMax,
      climateData.relativeHumidityMin
    );
    const earthSunInverseDistance = this.getEarthSunInverseDistance(climateData.date);
    const latitudeRadians = this.getLatitudeInRadians(
      locationData.latitudeGrades,
      locationData.latitudeMinutes
    );
    const solarInclination = this.getSolarInclination(climateData.date);
    const solarSunsetAngle = this.getSolarSunsetAngle(
      climateData.date,
      locationData.latitudeGrades,
      locationData.latitudeMinutes
    );
    const extraterrestrialSolarRadiationTerm = this.getExtraterrestrialSolarRadiationTerm(
      climateData.date,
      locationData.latitudeGrades,
      locationData.latitudeMinutes
    );
    const windSpeedMtsPerSecond = this.getWindSpeedAsMtsPerSecond(
      climateData.windSpeed,
      locationData.windSpeedMeasurementHeight
    );
    const slopeVaporPressureCurveCalc = this.getSlopeVaporPressureCurve(climateData.tempAvg);
    const latentHeatEvaporation = this.getLatentHeatEvaporation(climateData.tempAvg);
    const psychrometricConstantCalc = this.getPsychrometricConstant(
      locationData.altitude,
      climateData.tempAvg
    );

    return {
      date: climateData.date,
      saturationVaporPressure,
      realVaporPressure,
      vaporPressureDeficit,
      avgRealVaporPressure,
      extraterrestrialRadiation,
      clearSkySolarRadiation,
      netSolarRadiation,
      netLongwaveRadiation,
      netRadiation,
      earthSunInverseDistance,
      latitudeRadians,
      solarInclination,
      solarSunsetAngle,
      extraterrestrialSolarRadiationTerm,
      // Batch 3: Longwave radiation components
      isothermalLongwaveRadiationFactor: isothermalLongwave,
      humidityFactor,
      cloudFactor,
      referenceET,
      degreesDay,
      psychrometricConstant,
      slopeVaporPressureCurve,
      windSpeedMtsPerSecond,
      slopeVaporPressureCurveCalc,
      latentHeatEvaporation,
      psychrometricConstantCalc
    };
  }

  // ============================================================================
  // VAPOR PRESSURE FUNCTIONS
  // ============================================================================

  /**
   * Calculate saturation vapor pressure from temperature (kPa)
   */
  getSaturationVaporPressure(temp: number): number {
    return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  }

  /**
   * Calculate real vapor pressure from temperature and relative humidity
   */
  getRealVaporPressure(temp: number, relativeHumidity: number): number {
    return this.getSaturationVaporPressure(temp) * relativeHumidity / 100;
  }

  /**
   * Calculate average real vapor pressure
   */
  getAvgRealVaporPressure(
    tempMin: number,
    relativeHumidityMax: number,
    tempMax: number,
    relativeHumidityMin: number
  ): number {
    return (
      this.getRealVaporPressure(tempMin, relativeHumidityMax) +
      this.getRealVaporPressure(tempMax, relativeHumidityMin)
    ) / 2;
  }

  // ============================================================================
  // SOLAR RADIATION FUNCTIONS
  // ============================================================================

  /**
   * Get number of days in year (accounting for leap years)
   */
  getNDays(date: Date): number {
    const year = date.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return isLeapYear ? 366 : 365;
  }

  /**
   * Calculate Earth-Sun inverse distance
   */
  getEarthSunInverseDistance(date: Date): number {
    const dayOfYear = this.getDayOfYear(date);
    return 1 + EARTH_SUN_INVERSE_DISTANCE_CONSTANT * 
           Math.cos((2 * Math.PI / this.getNDays(date)) * dayOfYear);
  }

  /**
   * Convert latitude to radians
   */
  getLatitudeInRadians(latitudeGrades: number, latitudeMinutes: number): number {
    return (Math.PI / 180) * (latitudeGrades + latitudeMinutes / 60);
  }

  /**
   * Calculate solar declination
   */
  getSolarInclination(date: Date): number {
    const dayOfYear = this.getDayOfYear(date);
    return 0.409 * Math.sin((2 * Math.PI / this.getNDays(date)) * dayOfYear - 1.39);
  }

  /**
   * Calculate sunset hour angle
   */
  getSolarSunsetAngle(date: Date, latitudeGrades: number, latitudeMinutes: number): number {
    return Math.acos(
      Math.tan(this.getLatitudeInRadians(latitudeGrades, latitudeMinutes) * -1) *
      Math.tan(this.getSolarInclination(date))
    );
  }

  /**
   * Calculate extraterrestrial solar radiation term
   */
  getExtraterrestrialSolarRadiationTerm(
    date: Date,
    latitudeGrades: number,
    latitudeMinutes: number
  ): number {
    const sunsetAngle = this.getSolarSunsetAngle(date, latitudeGrades, latitudeMinutes);
    const latInRad = this.getLatitudeInRadians(latitudeGrades, latitudeMinutes);
    const solarInc = this.getSolarInclination(date);

    return sunsetAngle * Math.sin(latInRad) * Math.sin(solarInc) +
           Math.cos(latInRad) * Math.cos(solarInc) * Math.sin(sunsetAngle);
  }

  /**
   * Calculate extraterrestrial solar radiation (MJ/m²/day)
   */
  getExtraterrestrialSolarRadiation(
    date: Date,
    latitudeGrades: number,
    latitudeMinutes: number
  ): number {
    return SOLAR_CONSTANT *
           this.getEarthSunInverseDistance(date) *
           this.getExtraterrestrialSolarRadiationTerm(date, latitudeGrades, latitudeMinutes);
  }

  /**
   * Calculate clear sky solar radiation
   */
  getClearSkySolarRadiation(altitude: number, extraterrestrialRadiation: number): number {
    return (0.75 + 2 * Math.pow(10, -5) * altitude) * extraterrestrialRadiation;
  }

  /**
   * Calculate net solar radiation
   */
  getNetSolarRadiation(solarRadiation: number): number {
    return (1 - ALBEDO_CONSTANT) * solarRadiation;
  }

  // ============================================================================
  // LONGWAVE RADIATION FUNCTIONS
  // ============================================================================

  /**
   * Calculate isothermal longwave radiation factor
   */
  getIsothermalLongwaveRadiationFactor(tempMax: number, tempMin: number): number {
    return STEFANBOLTZMANN_CONSTANT *
           ((Math.pow(tempMax + 273.16, 4) + Math.pow(tempMin + 273.16, 4)) / 2);
  }

  /**
   * Calculate humidity factor for longwave radiation
   */
  getHumidityFactor(realVaporPressureAtAvgRelativeHumidity: number): number {
    return 0.34 - 0.14 * Math.sqrt(realVaporPressureAtAvgRelativeHumidity);
  }

  /**
   * Calculate cloud factor
   */
  getCloudFactor(relraIrsO: number): number {
    return 1.35 * relraIrsO - 0.35;
  }

  // ============================================================================
  // WIND AND ATMOSPHERIC FUNCTIONS
  // ============================================================================

  /**
   * Adjust wind speed to standard measurement height (2m)
   */
  getWindSpeedAsMtsPerSecond(
    windSpeed: number,
    windSpeedMeasurementHeight: number
  ): number {
    return windSpeed * (1000.0 / 3600.0) * 
           (4.87 / Math.log(67.8 * windSpeedMeasurementHeight - 5.42));
  }

  /**
   * Calculate slope of saturation vapor pressure curve
   */
  getSlopeVaporPressureCurve(tempAvg: number): number {
    return (4098 * this.getSaturationVaporPressure(tempAvg)) / 
           Math.pow(tempAvg + 237.3, 2);
  }

  /**
   * Calculate latent heat of evaporation
   */
  getLatentHeatEvaporation(tempAvg: number): number {
    return 2.501 - 2.361 * Math.pow(10, -3) * tempAvg;
  }

  /**
   * Calculate psychrometric constant
   */
  getPsychrometricConstant(height: number, tempAverage: number): number {
    const p = 101.3 * Math.pow((293 - 0.0065 * height) / 293, 5.26);
    return p * (SPECIFIC_HEAT_AT_CONSTANT_PRESSURE_CONSTANT /
           (MOLECULAR_WEIGHT_RATIO_OF_WATER_VAPOR_DRY_AIR * 
            this.getLatentHeatEvaporation(tempAverage)));
  }

  // ============================================================================
  // EVAPOTRANSPIRATION FUNCTIONS
  // ============================================================================

  /**
   * Calculate reference evapotranspiration using FAO-56 Penman-Monteith
   */
  calculateReferenceET(
    netRadiation: number,
    tempAvg: number,
    windSpeed: number,
    saturationVaporPressure: number,
    realVaporPressure: number,
    slopeVaporPressureCurve: number,
    psychrometricConstant: number,
    latentHeat: number
  ): number {
    const numerator = 
      0.408 * slopeVaporPressureCurve * netRadiation +
      psychrometricConstant * (900 / (tempAvg + 273)) * windSpeed *
      (saturationVaporPressure - realVaporPressure);

    const denominator = 
      slopeVaporPressureCurve + psychrometricConstant * (1 + 0.34 * windSpeed);

    return numerator / denominator;
  }

  // ============================================================================
  // CROP FUNCTIONS
  // ============================================================================

  /**
   * Calculate degrees day (thermal time)
   */
  getDegreesDay(
    tempMax: number,
    tempMin: number,
    cropBaseTemperature: number
  ): number {
    return (tempMax + tempMin) / 2 - cropBaseTemperature;
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get day of year (1-365/366)
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}