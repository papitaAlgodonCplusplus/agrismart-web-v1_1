// src/app/features/services/calculation-settings.service.ts
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CalculationSettingService } from '../dashboard/services/calculation-setting.service';

export interface MeasurementVariableIds {
  irrigationVolume: number;
  drainVolume: number;
  pipelinePressure: number;
  initialPressure: number;
  maximumPressure: number;
  irrigationInterval: number;
  irrigationLength: number;
  irrigationVolumenM2: number;
  irrigationVolumenPerPlant: number;
  irrigationVolumenTotal: number;
  irrigationFlow: number;
  drainVolumenM2: number;
  drainVolumenPerPlant: number;
  drainPercentage: number;
  drainDelay: number;
  drainLength: number;
  growingMediumVolumetricWaterContent: number;
  minVolumetricHumedityAtStart: number;
  maxVolumetricHumedityAtEnd: number;
  electroConductivity: number;
  minEcAtStart: number;
  maxEcAtEnd: number;
}

/** Fallback defaults — mirrors the hardcoded values previously scattered across services */
const DEFAULTS: Record<string, number> = {
  PressureDeltaThreshold: 0.002,
  IrrigationPressureThreshold: 0.1,
  MaxVolumetricWaterContentLastReadingDelayMinutes: 30,
  MaxElectroConductivityLastReadingDelayMinutes: 30,
  IrrigationVolume: 1,
  DrainVolume: 2,
  PipelinePressureMeasurementVariableId: 3,
  InitialPressureMeasurementVariableId: 4,
  MaximumPressureMeasurementVariableId: 5,
  IrrigationIntervalMeasurementVariableId: 6,
  IrrigationLengthMeasurementVariableId: 7,
  IrrigationVolumenM2MeasurementVariableId: 8,
  IrrigationVolumenPerPlantMeasurementVariableId: 9,
  IrrigationVolumenTotalMeasurementVariableId: 10,
  IrrigationFlowMeasurementVariableId: 11,
  DrainVolumenM2MeasurementVariableId: 12,
  DrainVolumenPerPlantMeasurementVariableId: 13,
  DrainPercentageMeasurementVariableId: 14,
  DrainDelayMeasurementVariableId: 15,
  DrainLengthMeasurementVariableId: 16,
  GrowingMediumVolumetricWaterContentMeasurementVariableId: 17,
  MinVolumetricHumedityAtIrrigationStartMeasurementVariableId: 18,
  MaxVolumetricHumedityAtIrrigationEndMeasurementVariableId: 19,
  ElectroCondutivityMeasurementVariableId: 20,
  MinElectroConductivityAtIrrigationStartMeasurementVariableId: 21,
  MaxElectroConductivityAtIrrigationEndMeasurementVariableId: 22,
};

@Injectable({
  providedIn: 'root'
})
export class CalculationSettingsService {

  private _cache: Map<string, number> | null = null;
  private _loadPromise: Promise<void> | null = null;

  constructor(private settingService: CalculationSettingService) { }

  /** Loads settings from the API once; subsequent calls return the cached map. */
  async ensureLoaded(): Promise<void> {
    if (this._cache) return;
    if (this._loadPromise) return this._loadPromise;

    this._loadPromise = firstValueFrom(this.settingService.getAll())
      .then(settings => {
        this._cache = new Map<string, number>();
        for (const s of settings) {
          const num = parseFloat(s.value as any);
          if (!isNaN(num)) {
            this._cache.set(s.name, num);
          }
        }
      })
      .catch(err => {
        console.warn('[CalculationSettingsService] Could not load settings from API, using defaults.', err);
        this._cache = new Map<string, number>();
      });

    return this._loadPromise;
  }

  /**
   * Returns the numeric value for a setting by name.
   * Falls back to the provided default (or the hard-coded default) if the key is absent.
   */
  getNumber(name: string, fallback?: number): number {
    if (this._cache?.has(name)) {
      return this._cache.get(name)!;
    }
    if (fallback !== undefined) return fallback;
    if (name in DEFAULTS) return DEFAULTS[name];
    return 0;
  }

  /**
   * Convenience method — returns all measurement variable ID mappings in a
   * typed object so callers don't need to use magic strings.
   */
  getMeasurementVariableIds(): MeasurementVariableIds {
    return {
      irrigationVolume:            this.getNumber('IrrigationVolume'),
      drainVolume:                 this.getNumber('DrainVolume'),
      pipelinePressure:            this.getNumber('PipelinePressureMeasurementVariableId'),
      initialPressure:             this.getNumber('InitialPressureMeasurementVariableId'),
      maximumPressure:             this.getNumber('MaximumPressureMeasurementVariableId'),
      irrigationInterval:          this.getNumber('IrrigationIntervalMeasurementVariableId'),
      irrigationLength:            this.getNumber('IrrigationLengthMeasurementVariableId'),
      irrigationVolumenM2:         this.getNumber('IrrigationVolumenM2MeasurementVariableId'),
      irrigationVolumenPerPlant:   this.getNumber('IrrigationVolumenPerPlantMeasurementVariableId'),
      irrigationVolumenTotal:      this.getNumber('IrrigationVolumenTotalMeasurementVariableId'),
      irrigationFlow:              this.getNumber('IrrigationFlowMeasurementVariableId'),
      drainVolumenM2:              this.getNumber('DrainVolumenM2MeasurementVariableId'),
      drainVolumenPerPlant:        this.getNumber('DrainVolumenPerPlantMeasurementVariableId'),
      drainPercentage:             this.getNumber('DrainPercentageMeasurementVariableId'),
      drainDelay:                  this.getNumber('DrainDelayMeasurementVariableId'),
      drainLength:                 this.getNumber('DrainLengthMeasurementVariableId'),
      growingMediumVolumetricWaterContent: this.getNumber('GrowingMediumVolumetricWaterContentMeasurementVariableId'),
      minVolumetricHumedityAtStart: this.getNumber('MinVolumetricHumedityAtIrrigationStartMeasurementVariableId'),
      maxVolumetricHumedityAtEnd:   this.getNumber('MaxVolumetricHumedityAtIrrigationEndMeasurementVariableId'),
      electroConductivity:          this.getNumber('ElectroCondutivityMeasurementVariableId'),
      minEcAtStart:                 this.getNumber('MinElectroConductivityAtIrrigationStartMeasurementVariableId'),
      maxEcAtEnd:                   this.getNumber('MaxElectroConductivityAtIrrigationEndMeasurementVariableId'),
    };
  }
}
