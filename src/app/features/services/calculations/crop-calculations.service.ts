// src/app/features/dashboard/services/calculations/crop-calculations.service.ts
import { Injectable } from '@angular/core';

// ============================================================================
// ENUMS
// ============================================================================
export enum ContainerType {
  conicalContainer = 1,
  cylinderContainer = 2,
  cubicContainer = 3
}

export enum VolumeMeasure {
  none = 0,
  toLitre = 1,
  toCubicMetre = 2
}

// ============================================================================
// INTERFACES
// ============================================================================
export interface VolumeResult {
  value: number;
  volumeMeasureType: VolumeMeasure;
}

export interface ContainerData {
  containerType: ContainerType;
  height: number;
  width: number;
  length: number;
  lowerDiameter: number;
  upperDiameter: number;
}

export interface CropProductionData {
  length: number;
  width: number;
  betweenRowDistance: number;
  betweenPlantDistance: number;
  betweenContainerDistance: number;
  latitude: number;
  container?: ContainerData;
}

export interface GrowingMediumData {
  containerCapacityPercentage: number;
  permanentWiltingPoint: number;
  fiveKpaHumidity: number;
}

export interface CropProductionKPIs {
  area: number;
  densityPlant: number;
  densityContainer: number;
  totalPlants: number;
  numberOfRows: number;
  latitudeGrades: number;
  latitudeMinutes: number;
  containerVolume?: VolumeResult;
}

export interface GrowingMediumKPIs {
  totalAvailableWaterPercentage: number;
  easelyAvailableWaterPercentage: number;
  reserveWaterPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class CropCalculationsService {

  constructor() { }

  // ============================================================================
  // CONTAINER CALCULATIONS
  // ============================================================================

  /**
   * Calculate container volume based on type
   */
  getVolume(
    containerData: ContainerData,
    measureType: VolumeMeasure = VolumeMeasure.toLitre
  ): VolumeResult {
    let value = 0;

    switch (containerData.containerType) {
      case ContainerType.conicalContainer: {
        const lowerArea = Math.pow(containerData.lowerDiameter, 2) * Math.PI;
        const upperArea = Math.pow(containerData.upperDiameter, 2) * Math.PI;
        value = (1 / 3) * (lowerArea + upperArea + 
                Math.sqrt(lowerArea * upperArea)) * containerData.height;
        break;
      }
      case ContainerType.cubicContainer: {
        value = containerData.height * containerData.length * containerData.width;
        break;
      }
      case ContainerType.cylinderContainer: {
        value = Math.PI * Math.pow(containerData.upperDiameter / 2, 2) * 
                containerData.height;
        break;
      }
    }

    return {
      value: this.convertVolume(value, measureType),
      volumeMeasureType: measureType
    };
  }

  /**
   * Convert volume to specified measure
   */
  private convertVolume(value: number, measureType: VolumeMeasure): number {
    switch (measureType) {
      case VolumeMeasure.none:
        return value;
      case VolumeMeasure.toLitre:
        return value / 1000;
      case VolumeMeasure.toCubicMetre:
        return value / 1000000;
      default:
        return 0;
    }
  }

  // ============================================================================
  // CROP PRODUCTION CALCULATIONS
  // ============================================================================

  /**
   * Calculate all crop production KPIs
   */
  calculateCropProductionKPIs(data: CropProductionData): CropProductionKPIs {
    const area = this.getArea(data.length, data.width);
    const densityPlant = this.getDensityPlant(
      data.betweenRowDistance, 
      data.betweenPlantDistance
    );
    const densityContainer = this.getDensityContainer(
      data.betweenRowDistance,
      data.betweenContainerDistance
    );
    const totalPlants = this.getTotalPlants(densityPlant, area);
    const numberOfRows = this.getNumberOfRows(data.width, data.betweenRowDistance);
    const latitudeGrades = this.getLatitudeGrades(data.latitude);
    const latitudeMinutes = this.getLatitudeMinutes(data.latitude, latitudeGrades);

    let containerVolume: VolumeResult | undefined;
    if (data.container) {
      containerVolume = this.getVolume(data.container);
    }

    return {
      area,
      densityPlant,
      densityContainer,
      totalPlants,
      numberOfRows,
      latitudeGrades,
      latitudeMinutes,
      containerVolume
    };
  }

  /**
   * Calculate area (m²)
   */
  getArea(length: number, width: number): number {
    return length * width;
  }

  /**
   * Calculate plant density (plants/m²)
   */
  getDensityPlant(betweenRowDistance: number, betweenPlantDistance: number): number {
    return 1 / (betweenRowDistance * betweenPlantDistance);
  }

  /**
   * Calculate container density (containers/m²)
   */
  getDensityContainer(betweenRowDistance: number, betweenContainerDistance: number): number {
    return 1 / (betweenRowDistance * betweenContainerDistance);
  }

  /**
   * Calculate total number of plants
   */
  getTotalPlants(densityPlant: number, area: number): number {
    return densityPlant * area;
  }

  /**
   * Calculate number of rows
   */
  getNumberOfRows(width: number, betweenRowDistance: number): number {
    return Math.round(width / betweenRowDistance);
  }

  /**
   * Extract latitude degrees (integer part)
   */
  getLatitudeGrades(latitude: number): number {
    return Math.trunc(latitude);
  }

  /**
   * Extract latitude minutes (fractional part converted to minutes)
   */
  getLatitudeMinutes(latitude: number, latitudeGrades: number): number {
    return Math.trunc((latitude - latitudeGrades) * 60);
  }

  // ============================================================================
  // GROWING MEDIUM CALCULATIONS
  // ============================================================================

  /**
   * Calculate all growing medium KPIs
   */
  calculateGrowingMediumKPIs(data: GrowingMediumData): GrowingMediumKPIs {
    const totalAvailableWaterPercentage = this.getTotalAvailableWaterPercentage(
      data.containerCapacityPercentage,
      data.permanentWiltingPoint
    );

    const easelyAvailableWaterPercentage = this.getEaselyAvailableWaterPercentage(
      data.containerCapacityPercentage,
      data.fiveKpaHumidity
    );

    const reserveWaterPercentage = this.getReserveWaterPercentage(
      easelyAvailableWaterPercentage,
      data.permanentWiltingPoint
    );

    return {
      totalAvailableWaterPercentage,
      easelyAvailableWaterPercentage,
      reserveWaterPercentage
    };
  }

  /**
   * Calculate total available water percentage
   */
  getTotalAvailableWaterPercentage(
    containerCapacityPercentage: number,
    permanentWiltingPoint: number
  ): number {
    return containerCapacityPercentage - permanentWiltingPoint;
  }

  /**
   * Calculate easily available water percentage
   */
  getEaselyAvailableWaterPercentage(
    containerCapacityPercentage: number,
    fiveKpaHumidity: number
  ): number {
    return containerCapacityPercentage - fiveKpaHumidity;
  }

  /**
   * Calculate reserve water percentage
   */
  getReserveWaterPercentage(
    easelyAvailableWaterPercentage: number,
    permanentWiltingPoint: number
  ): number {
    return easelyAvailableWaterPercentage - permanentWiltingPoint;
  }

  // ============================================================================
  // DENSITY CALCULATIONS (from CalculationsIrrigation.cs)
  // ============================================================================

  /**
   * Get both plant and container densities
   */
  getDensities(
    betweenRowDistance: number,
    betweenContainerDistance: number,
    betweenPlantDistance: number
  ): { container: number; plant: number } {
    const r = betweenRowDistance > 0 ? betweenRowDistance : 1e-9;
    const c = betweenContainerDistance > 0 ? betweenContainerDistance : 1e-9;
    const p = betweenPlantDistance > 0 ? betweenPlantDistance : 1e-9;

    return {
      container: 1 / (r * c),
      plant: 1 / (r * p)
    };
  }
}