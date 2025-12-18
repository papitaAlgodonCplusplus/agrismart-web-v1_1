import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { IrrigationSectorService, GrowingMedium, Container } from '../../services/irrigation-sector.service';
import {
  SubstrateReleaseCurve,
  SubstrateCurvePoint,
  SubstrateAnalysisInput,
  SubstrateCurveChartConfig
} from '../models/substrate-analysis.models';

@Injectable({
  providedIn: 'root'
})
export class SubstrateAnalysisService {

  constructor(
    private irrigationService: IrrigationSectorService
  ) { }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Generate complete substrate release curve from existing database data
   * This is your MAIN entry point
   */
  generateSubstrateCurve(input: SubstrateAnalysisInput): SubstrateReleaseCurve {

    // STEP 1: Create characteristic points from your database values
    const characteristicPoints = this.createCharacteristicPoints(input);

    // STEP 2: Interpolate smooth curve between characteristic points
    const dataPoints = this.interpolateCurve(characteristicPoints, 50);

    // STEP 3: Calculate water zones
    const waterZones = {
      totalAvailableWater: input.totalAvailableWaterPercentage,
      easilyAvailableWater: input.easelyAvailableWaterPercentage,
      reserveWater: input.reserveWaterPercentage
    };

    return {
      dataPoints,
      characteristicPoints,
      waterZones,
      growingMediumId: input.growingMediumId,
      growingMediumName: input.growingMediumName,
      containerVolume: input.containerVolume
    };
  }

  /**
   * Load substrate data from existing APIs and generate curve
   * This combines GrowingMedium + Container data
   */
  loadAndGenerateCurve(
    growingMediumId: number,
    containerId: number
  ): Observable<SubstrateReleaseCurve> {

    return forkJoin({
      growingMedium: this.irrigationService.getGrowingMediumById(growingMediumId),
      container: this.irrigationService.getContainerById(containerId)
    }).pipe(
      map(({ growingMedium, container }) => {
        const input = this.mapToAnalysisInput(growingMedium, container);
        return this.generateSubstrateCurve(input);
      })
    );
  }

  /**
   * Get default chart configuration
   */
  getDefaultChartConfig(): SubstrateCurveChartConfig {
    return {
      width: 800,
      height: 500,
      showAirContent: true,
      showWaterZones: true,
      showCharacteristicPoints: true,
      showGridLines: true,
      curveResolution: 50,
      maxMatricPotential: 10,
      colors: {
        waterLine: '#3498db',        // Blue
        airLine: '#e74c3c',          // Red
        saturatedZone: '#001f3f',    // Dark blue
        containerCapacityZone: '#0074D9', // Blue
        easilyAvailableZone: '#7FDBFF',   // Light blue
        reserveZone: '#DDDDDD'       // Light gray
      }
    };
  }

  // ==========================================================================
  // PRIVATE CALCULATION METHODS
  // ==========================================================================

  /**
   * Create characteristic points from database values
   * Based on typical substrate water retention curve shape
   */
  private createCharacteristicPoints(input: SubstrateAnalysisInput): {
    saturated: SubstrateCurvePoint;
    containerCapacity: SubstrateCurvePoint;
    fiveKpa: SubstrateCurvePoint;
    tenKpa: SubstrateCurvePoint;
    permanentWiltingPoint?: SubstrateCurvePoint;
  } {

    // POINT 1: Saturated (0 kPa) - ~93-95% water, minimal air
    const saturated: SubstrateCurvePoint = {
      matricPotential: 0,
      volumetricWaterContent: this.estimateSaturatedWaterContent(input),
      airContent: this.estimateSaturatedAirContent(input),
      label: 'Saturado (0 kPa)'
    };

    // POINT 2: Container Capacity (1 kPa) - YOUR DATABASE VALUE
    const containerCapacity: SubstrateCurvePoint = {
      matricPotential: 1,
      volumetricWaterContent: input.containerCapacityPercentage,
      airContent: 100 - input.containerCapacityPercentage,
      label: 'Capacidad de Contenedor (1 kPa)'
    };

    // POINT 3: 5 kPa - Calculate from easily available water
    // If θ_1kPa = 78% and easilyAvailable = 24%, then θ_5kPa = 78 - 24 = 54%
    const fiveKpa: SubstrateCurvePoint = {
      matricPotential: 5,
      volumetricWaterContent: input.containerCapacityPercentage - input.easelyAvailableWaterPercentage,
      airContent: 100 - (input.containerCapacityPercentage - input.easelyAvailableWaterPercentage),
      label: '5 kPa'
    };

    // POINT 4: 10 kPa - Calculate from reserve water
    // θ_10kPa = θ_5kPa - reserve water
    const tenKpa: SubstrateCurvePoint = {
      matricPotential: 10,
      volumetricWaterContent: fiveKpa.volumetricWaterContent - input.reserveWaterPercentage,
      airContent: 100 - (fiveKpa.volumetricWaterContent - input.reserveWaterPercentage),
      label: '10 kPa'
    };

    // POINT 5: Permanent Wilting Point (~15 kPa) - YOUR DATABASE VALUE
    const permanentWiltingPoint: SubstrateCurvePoint | undefined =
      input.permanentWiltingPoint ? {
        matricPotential: 15,
        volumetricWaterContent: input.permanentWiltingPoint,
        airContent: 100 - input.permanentWiltingPoint,
        label: 'Punto de Marchitez Permanente (15 kPa)'
      } : undefined;

    return {
      saturated,
      containerCapacity,
      fiveKpa,
      tenKpa,
      permanentWiltingPoint
    };
  }

  /**
   * Estimate saturated water content
   * Typical substrates: 85-95% water at saturation
   * Use porosity if available, otherwise estimate
   */
  private estimateSaturatedWaterContent(input: SubstrateAnalysisInput): number {
    // Typical assumption: saturated content ≈ container capacity + 10-15%
    // But never exceed 95% (some air always remains)
    const estimated = Math.min(
      input.containerCapacityPercentage + 12,
      95
    );
    return estimated;
  }

  /**
   * Estimate saturated air content (inverse of water content)
   */
  private estimateSaturatedAirContent(input: SubstrateAnalysisInput): number {
    return 100 - this.estimateSaturatedWaterContent(input);
  }

  /**
   * Interpolate smooth curve between characteristic points
   * Uses exponential decay function typical of substrate retention curves
   */
  private interpolateCurve(
    characteristicPoints: any,
    resolution: number
  ): SubstrateCurvePoint[] {

    const points: SubstrateCurvePoint[] = [];
    const maxPotential = characteristicPoints.permanentWiltingPoint
      ? 15
      : 10;

    // Create array of matric potential values to calculate
    const potentials = this.linspace(0, maxPotential, resolution);

    // Key points for interpolation
    const keyPoints = [
      characteristicPoints.saturated,
      characteristicPoints.containerCapacity,
      characteristicPoints.fiveKpa,
      characteristicPoints.tenKpa
    ];

    if (characteristicPoints.permanentWiltingPoint) {
      keyPoints.push(characteristicPoints.permanentWiltingPoint);
    }

    // Interpolate using piecewise linear or exponential function
    potentials.forEach(psi => {
      const waterContent = this.interpolateWaterContent(psi, keyPoints);
      points.push({
        matricPotential: psi,
        volumetricWaterContent: waterContent,
        airContent: 100 - waterContent
      });
    });

    return points;
  }

  /**
   * Interpolate water content at given matric potential
   * Uses piecewise linear interpolation between known points
   */
  private interpolateWaterContent(
    psi: number,
    keyPoints: SubstrateCurvePoint[]
  ): number {

    // Find bracketing points
    let lowerPoint = keyPoints[0];
    let upperPoint = keyPoints[keyPoints.length - 1];

    for (let i = 0; i < keyPoints.length - 1; i++) {
      if (psi >= keyPoints[i].matricPotential &&
          psi <= keyPoints[i + 1].matricPotential) {
        lowerPoint = keyPoints[i];
        upperPoint = keyPoints[i + 1];
        break;
      }
    }

    // Linear interpolation
    const psiRange = upperPoint.matricPotential - lowerPoint.matricPotential;
    const thetaRange = upperPoint.volumetricWaterContent - lowerPoint.volumetricWaterContent;

    if (psiRange === 0) return lowerPoint.volumetricWaterContent;

    const fraction = (psi - lowerPoint.matricPotential) / psiRange;
    return lowerPoint.volumetricWaterContent + (fraction * thetaRange);
  }

  /**
   * Create linearly spaced array (like numpy.linspace)
   */
  private linspace(start: number, end: number, num: number): number[] {
    const step = (end - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + (step * i));
  }

  /**
   * Map existing database entities to SubstrateAnalysisInput
   */
  private mapToAnalysisInput(
    growingMedium: GrowingMedium,
    container: Container
  ): SubstrateAnalysisInput {
    return {
      growingMediumId: growingMedium.id,
      growingMediumName: growingMedium.name,
      containerCapacityPercentage: growingMedium.containerCapacityPercentage || 0,
      permanentWiltingPoint: growingMedium.permanentWiltingPoint || 0,
      easelyAvailableWaterPercentage: growingMedium.easelyAvailableWaterPercentage || 0,
      reserveWaterPercentage: growingMedium.reserveWaterPercentage || 0,
      totalAvailableWaterPercentage: growingMedium.totalAvailableWaterPercentage || 0,
      containerId: container.id,
      containerVolume: container.volume || 0
    };
  }

  // ==========================================================================
  // UTILITY METHODS FOR COMPONENT USE
  // ==========================================================================

  /**
   * Calculate volume of water in each zone (in Liters)
   */
  calculateWaterVolumes(curve: SubstrateReleaseCurve): {
    totalAvailableWaterLiters: number;
    easilyAvailableWaterLiters: number;
    reserveWaterLiters: number;
  } {
    const containerVolume = curve.containerVolume;

    return {
      totalAvailableWaterLiters: (curve.waterZones.totalAvailableWater / 100) * containerVolume,
      easilyAvailableWaterLiters: (curve.waterZones.easilyAvailableWater / 100) * containerVolume,
      reserveWaterLiters: (curve.waterZones.reserveWater / 100) * containerVolume
    };
  }

  /**
   * Get formatted text description of substrate characteristics
   */
  getSubstrateDescription(curve: SubstrateReleaseCurve): string {
    const volumes = this.calculateWaterVolumes(curve);

    return `
      ${curve.growingMediumName} en contenedor de ${curve.containerVolume}L:
      - Agua Total Disponible: ${curve.waterZones.totalAvailableWater.toFixed(1)}% (${volumes.totalAvailableWaterLiters.toFixed(2)}L)
      - Agua Fácilmente Disponible: ${curve.waterZones.easilyAvailableWater.toFixed(1)}% (${volumes.easilyAvailableWaterLiters.toFixed(2)}L)
      - Agua de Reserva: ${curve.waterZones.reserveWater.toFixed(1)}% (${volumes.reserveWaterLiters.toFixed(2)}L)
    `.trim();
  }
}
