import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SensorService, Sensor } from './sensor.service';

/**
 * Canonical sensor type keys used across the app.
 * These are the values stored in Sensor.SensorType in the DB.
 */
export const SENSOR_TYPES = {
  DISCARD:              'Discard',
  WATER_FLOW:           'Water Flow Sensor',
  PULSE_COUNTER:        'Pulse Counter',
  RAIN_GAUGE:           'Rain Gauge',
  SOIL_TEMPERATURE:     'Soil Temperature',
  SOIL_HUMIDITY:        'Soil Humidity',
  AIR_TEMPERATURE:      'Air Temperature',
  AIR_HUMIDITY:         'Air Humidity',
  SOLAR_RADIATION:      'Solar Radiation',
  ATMOSPHERIC_PRESSURE: 'Atmospheric Pressure',
  WIND_SPEED:           'Wind Speed',
  WIND_DIRECTION:       'Wind Direction',
  BATTERY:              'Battery',
  SOIL_PH:              'Soil pH',
  WATER_PRESSURE:       'Water Pressure',
  SOIL_CONDUCTIVITY:    'Soil Conductivity',
} as const;

export type SensorTypeName = typeof SENSOR_TYPES[keyof typeof SENSOR_TYPES];

/**
 * Fallback sensor label arrays used when no sensors are configured in the DB.
 * This keeps existing installations working before sensors are assigned types.
 */
const FALLBACK_LABELS: Record<string, string[]> = {
  [SENSOR_TYPES.DISCARD]:              ['Discard'],
  [SENSOR_TYPES.WATER_FLOW]:           ['Water_flow_value'],
  [SENSOR_TYPES.PULSE_COUNTER]:        ['Total_pulse'],
  [SENSOR_TYPES.RAIN_GAUGE]:           ['rain_gauge', 'rain_gauge_ml', 'Rain_gauge'],
  [SENSOR_TYPES.SOIL_TEMPERATURE]:     ['TEMP_SOIL', 'temp_SOIL', 'temp_DS18B20', 'TempC_DS18B20'],
  [SENSOR_TYPES.SOIL_HUMIDITY]:        ['water_SOIL', 'water_SOIL_original', 'Hum_SHT2x'],
  [SENSOR_TYPES.AIR_TEMPERATURE]:      ['TEM'],
  [SENSOR_TYPES.AIR_HUMIDITY]:         ['HUM'],
  [SENSOR_TYPES.SOLAR_RADIATION]:      ['illumination', 'PAR', 'TSR'],
  [SENSOR_TYPES.ATMOSPHERIC_PRESSURE]: ['pressure'],
  [SENSOR_TYPES.WIND_SPEED]:           ['wind_speed'],
  [SENSOR_TYPES.WIND_DIRECTION]:       ['wind_direction_angle'],
  [SENSOR_TYPES.BATTERY]:              ['BAT', 'Bat', 'Bat_V', 'BatV'],
  [SENSOR_TYPES.SOIL_PH]:              ['PH1_SOIL'],
  [SENSOR_TYPES.WATER_PRESSURE]:       ['Water_pressure_MPa'],
  [SENSOR_TYPES.SOIL_CONDUCTIVITY]:    ['conduct_SOIL'],
};

@Injectable({ providedIn: 'root' })
export class SensorConfigService {
  private sensors: Sensor[] = [];
  private loaded = false;
  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private sensorService: SensorService) {
    this.load();
  }

  /** Reload sensor configuration from backend. */
  load(): void {
    this.sensorService.getAll().subscribe({
      next: (sensors) => {
        this.sensors = sensors;
        this.loaded = true;
        this.loaded$.next(true);
      },
      error: (err) => {
        console.warn('SensorConfigService: could not load sensors, using fallback defaults.', err);
        this.loaded = true;
        this.loaded$.next(true);
      }
    });
  }

  /**
   * Returns all SensorLabel values whose SensorType matches the given type.
   * Falls back to hardcoded defaults if no DB sensors are configured for that type.
   */
  getSensorLabelsByType(type: string): string[] {
    const configured = this.sensors
      .filter(s => s.sensorType === type && s.sensorLabel)
      .map(s => s.sensorLabel as string);

    return configured.length > 0 ? configured : (FALLBACK_LABELS[type] ?? []);
  }

  /**
   * Returns true if the given sensor name belongs to the specified type.
   */
  isSensorOfType(sensorName: string, type: string): boolean {
    return this.getSensorLabelsByType(type).includes(sensorName);
  }

  /** Returns all loaded sensors (all types). */
  getAllSensors(): Sensor[] {
    return this.sensors;
  }

  /** Returns sensors for a specific DB device id. */
  getSensorsForDevice(deviceDbId: number): Sensor[] {
    return this.sensors.filter(s => s.deviceId === deviceDbId);
  }

  /** All available sensor type options for select boxes. */
  getSensorTypeOptions(): { value: string; label: string }[] {
    return [
      { value: SENSOR_TYPES.DISCARD,           label: 'Sensor no aplicable' },
      { value: SENSOR_TYPES.WATER_FLOW,           label: 'Sensor de Flujo de Agua' },
      { value: SENSOR_TYPES.PULSE_COUNTER,         label: 'Contador de Pulsos' },
      { value: SENSOR_TYPES.RAIN_GAUGE,            label: 'Pluviómetro' },
      { value: SENSOR_TYPES.SOIL_TEMPERATURE,      label: 'Temperatura del Suelo' },
      { value: SENSOR_TYPES.SOIL_HUMIDITY,         label: 'Humedad del Suelo' },
      { value: SENSOR_TYPES.AIR_TEMPERATURE,       label: 'Temperatura del Aire' },
      { value: SENSOR_TYPES.AIR_HUMIDITY,          label: 'Humedad del Aire' },
      { value: SENSOR_TYPES.SOLAR_RADIATION,       label: 'Radiación Solar' },
      { value: SENSOR_TYPES.ATMOSPHERIC_PRESSURE,  label: 'Presión Atmosférica' },
      { value: SENSOR_TYPES.WIND_SPEED,            label: 'Velocidad del Viento' },
      { value: SENSOR_TYPES.WIND_DIRECTION,        label: 'Dirección del Viento' },
      { value: SENSOR_TYPES.BATTERY,               label: 'Batería' },
      { value: SENSOR_TYPES.SOIL_PH,               label: 'pH del Suelo' },
      { value: SENSOR_TYPES.WATER_PRESSURE,        label: 'Presión del Agua' },
      { value: SENSOR_TYPES.SOIL_CONDUCTIVITY,     label: 'Conductividad del Suelo' },
    ];
  }
}
