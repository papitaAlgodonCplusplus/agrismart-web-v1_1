import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import {
  IrrigationSectorService,
  ProcessedDeviceData
} from '../../services/irrigation-sector.service';
import { DeviceService } from '../../devices/services/device.service';
import { catchError, map, Observable, of } from 'rxjs';
import { CropService } from '../../crops/services/crop.service';

// ============= INTERFACES =============
interface ThermostatReading {
  deviceId: string;
  sensorType: string; // 'TEMP_SOIL', 'temp_DS18B20', 'temp_SOIL', 'TempC_DS18B20'
  currentTemp: number;
  max: number;
  min: number;
  mean: number;
  tMinOpt: number;
  tMaxOpt: number;
  isWithinNormal: boolean;
  normalRange: { min: number; max: number };
  lastUpdate: string;
  color: string;
}


// 1.1 ADD INTERFACE (after TSRChartData interface, around line 43)
interface PARDataPoint {
  timestamp: string;
  parInstantaneous: number; // μmol/m²/s
  dlipAccumulated: number; // mol/m²/period
  deviceId: string;
}

interface PARChartData {
  dataPoints: PARDataPoint[];
  dlipTotal: number;
  parMax: number;
  parMean: number;
  parMin: number;
  timeRange: { start: string; end: string };
}


// 1. ADD INTERFACE (after ThermostatReading interface)
interface TSRDataPoint {
  timestamp: string;
  tsrMax: number;
  tsrMean: number;
  tsrMin: number;
  deviceId: string;
}

interface TSRChartData {
  dataPoints: TSRDataPoint[];
  dligMax: number;
  dligMean: number;
  dligMin: number;
  timeRange: { start: string; end: string };
}
interface CropTemperatureData {
  cropName: string;
  baseTemperature: number;
}

interface RawDeviceData {
  id: number;
  recordDate: string;
  clientId: string;
  userId: string;
  deviceId: string;
  sensor: string;
  payload: string;
}

interface DeviceReading {
  value: number | null;
  timestamp: string;
  rawValue: string;
}

interface DeviceData {
  deviceId: string;
  lastUpdate: string;
  readings: { [sensor: string]: DeviceReading };
  isActive: boolean; // New property to track if device is sending data
  registeredDevice?: any; // Reference to the registered device info
}

interface DeviceStatusSummary {
  online: number;
  warning: number;
  offline: number;
  inactive: number; // New status for devices not sending data
}

interface HistoricalData {
  sensor: string;
  values: { timestamp: string; value: number; deviceId: string }[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    deviceId: string;
  }[];
}

@Component({
  selector: 'app-shiny-dashboard',
  templateUrl: './shiny-dashboard.component.html',
  styleUrls: ['./shiny-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ShinyDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  rawData: RawDeviceData[] = [];
  allRegisteredDevices: any[] = []; // All devices from deviceService
  processedData: ProcessedDeviceData[] = [];
  isLoading = true;
  error: string | null = null;
  showCharts = false;
  selectedChartType = 'flow';
  private windRoseChartInstance: any = null;
  windRoseData: any[] = [];
  tsrChartData: TSRChartData = {
    dataPoints: [],
    dligMax: 0,
    dligMean: 0,
    dligMin: 0,
    timeRange: { start: '', end: '' }
  };

  tsrChartConfig = {
    width: 1200,
    height: 600,
    padding: { top: 40, right: 80, bottom: 80, left: 80 },
    flameColors: {
      max: { start: '#ff4500', end: '#ff8c00' },
      mean: { start: '#ffa500', end: '#ffd700' },
      min: { start: '#ffb347', end: '#ffe4b5' }
    }
  };


  // 1.2 ADD PROPERTIES (after tsrChartData property, around line 150)
  parChartData: PARChartData = {
    dataPoints: [],
    dlipTotal: 0,
    parMax: 0,
    parMean: 0,
    parMin: 0,
    timeRange: { start: '', end: '' }
  };

  parChartConfig = {
    width: 1200,
    height: 600,
    padding: { top: 40, right: 100, bottom: 80, left: 80 }
  };

  hoveredPARPoint: PARDataPoint | null = null;
  hoveredPARIndex: number = -1;
  hoveredTSRPoint: TSRDataPoint | null = null;
  hoveredTSRIndex: number = -1;

  // 3. ADD METHOD to
  // Chart instances for cleanup
  private chartInstances: { [key: string]: Chart } = {};

  // NEW PROPERTY - Add this one!
  readonly directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

  // NEW CACHE PROPERTIES - Add these too!
  private _gridCircles: { radius: number; percentage: number }[] | null = null;
  private _directionLabelPositions: Map<string, { x: number, y: number }> = new Map();

  // Grouped data for display (now includes inactive devices)
  flowDevices: DeviceData[] = [];
  soilDevices: DeviceData[] = [];
  climateDevices: DeviceData[] = [];
  pressureDevices: DeviceData[] = [];
  phDevices: DeviceData[] = [];

  hoveredSegment: string | null = null;
  windRoseSegments: any[] = [];
  windRoseConfig = {
    size: 600,
    center: 300,
    maxRadius: 220,
    innerRadius: 30
  };

  // Historical data for charts
  historicalData: { [key: string]: HistoricalData[] } = {};

  // Chart data
  chartData: { [key: string]: { [sensor: string]: ChartData } } = {};

  // Device activity tracking
  activeDeviceIds: Set<string> = new Set();
  inactiveDevices: DeviceData[] = [];
  windDataLoaded = false;

  // Collapse state properties (collapsed by default)
  isChartsCollapsed = true;
  isWindRoseCollapsed = true;
  isThermostatCollapsed = true;
  isTSRChartCollapsed = true;
  isPARChartCollapsed = true;
  isFlowDevicesCollapsed = true;
  isSoilDevicesCollapsed = true;
  isPhDevicesCollapsed = true;
  isPressureDevicesCollapsed = true;
  isClimateDevicesCollapsed = true;

  // Sensor units mapping
  private sensorUnits: { [key: string]: string } = {
    // pH sensors
    'PH1_SOIL': 'pH',
    'PH_SOIL': 'pH',

    // Temperature sensors
    'temp_DS18B20': '°C',
    'TEMP_SOIL': '°C',
    'TEM': '°C',

    // Humidity and moisture
    'HUM': '%',
    'Hum_SHT2x': '%',
    'water_SOIL': '%',

    // Pressure sensors
    'pressure': 'hPa',
    'Water_pressure_MPa': 'MPa',
    'IDC_intput_mA': 'mA',
    'VDC_intput_V': 'V',

    // Flow sensors
    'Water_flow_value': 'L',
    'MOD': 'L/min',
    'Total_pulse': 'pulses',

    // Weather sensors
    'wind_speed': 'm/s',
    'wind_direction_angle': '°',
    'rain_gauge': 'mm',
    'PAR': 'μmol/m²/s',
    'illumination': 'lux',

    // Electrical sensors
    'Bat': 'V',

    // Conductivity
    'conduct_SOIL': 'mS/cm'
  };

  // Color palette for charts
  private colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#16a085', '#c0392b'
  ];

  constructor(
    private irrigationService: IrrigationSectorService,
    private deviceService: DeviceService,
    private cdr: ChangeDetectorRef,
    private cropService: CropService, // ADD THIS
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDeviceData();

  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  ngOnDestroy(): void {

    // Clean up Chart.js instances
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  loadDeviceData(): void {
    this.isLoading = true;

    // Load both registered devices and raw data
    Promise.all([
      this.deviceService.getAll().toPromise(),
      this.irrigationService.getDeviceRawData().toPromise()
    ]).then(([registeredDevices, rawData]: [any[] | undefined, any[] | undefined]) => {
      console.log('Registered devices loaded:', registeredDevices);
      console.log('Raw device data loaded:', rawData);

      this.allRegisteredDevices = registeredDevices || [];
      this.rawData = rawData || [];
      this.prepareWindRoseData();

      // Track which devices are sending data
      this.activeDeviceIds = new Set(rawData?.map(item => item.deviceId));

      this.processRawData();
      this.processHistoricalData();
      this.prepareThermostatData();
      this.prepareTSRData();
      this.preparePARData();
      this.createInactiveDevices();
      this.isLoading = false;

      if (this.showCharts) {
        setTimeout(() => this.initializeCharts(), 100);
      }
    }).catch((error) => {
      this.error = 'Error al cargar los datos de los dispositivos';
      this.isLoading = false;
      console.error('Error loading device data:', error);
    });
  }

  createInactiveDevices(): void {
    this.inactiveDevices = this.allRegisteredDevices
      .filter(device => !this.activeDeviceIds.has(device.deviceId))
      .map(device => ({
        deviceId: device.deviceId,
        lastUpdate: new Date().toISOString(),
        readings: {},
        isActive: false,
        registeredDevice: device
      }));
  }

  extractNumericValue(payload: string): number | null {
    if (!payload) return null;

    // Handle special cases
    if (payload.toLowerCase() === 'false') return 0;
    if (payload.toLowerCase() === 'true') return 1;
    if (payload.toLowerCase() === 'low') return 0;
    if (payload.toLowerCase() === 'high') return 1;

    // Remove any non-numeric characters except decimal point and minus sign
    const numericString = payload.replace(/[^\d.-]/g, '');

    // Try to parse as float
    const numericValue = parseFloat(numericString);

    // Return null if not a valid number
    return isNaN(numericValue) ? null : numericValue;
  }

  processRawData(): void {
    // Group by device type (including inactive devices)
    this.flowDevices = this.groupByDeviceType('flujo');
    this.soilDevices = this.groupByDeviceType('suelo');
    this.climateDevices = this.groupByDeviceType('estacion-metereologica');
    this.pressureDevices = this.groupByDeviceType('presion');
    this.phDevices = this.groupByDeviceType('ph-suelo');
  }

  groupByDeviceType(deviceType: string): DeviceData[] {
    // Get active devices with data
    const activeDevices = this.rawData.filter(item =>
      item.deviceId.includes(deviceType)
    );

    // Group by specific device ID
    const deviceGroups: { [key: string]: DeviceData } = {};

    activeDevices.forEach(item => {
      if (!deviceGroups[item.deviceId]) {
        const registeredDevice = this.allRegisteredDevices.find(d => d.deviceId === item.deviceId);
        deviceGroups[item.deviceId] = {
          deviceId: item.deviceId,
          lastUpdate: item.recordDate,
          readings: {},
          isActive: true,
          registeredDevice
        };
      }

      const numericValue = this.extractNumericValue(item.payload);

      // Always store the latest reading for each sensor
      if (!deviceGroups[item.deviceId].readings[item.sensor] ||
        new Date(item.recordDate) > new Date(deviceGroups[item.deviceId].readings[item.sensor].timestamp)) {
        deviceGroups[item.deviceId].readings[item.sensor] = {
          value: numericValue,
          rawValue: item.payload,
          timestamp: item.recordDate
        };
      }

      // Update last update time if this reading is newer
      if (new Date(item.recordDate) > new Date(deviceGroups[item.deviceId].lastUpdate)) {
        deviceGroups[item.deviceId].lastUpdate = item.recordDate;
      }
    });

    // Add inactive devices of this type
    const inactiveDevicesOfType = this.allRegisteredDevices
      .filter(device => device.deviceId.includes(deviceType) && !this.activeDeviceIds.has(device.deviceId))
      .map(device => ({
        deviceId: device.deviceId,
        lastUpdate: new Date().toISOString(),
        readings: {},
        isActive: false,
        registeredDevice: device
      }));

    return [...Object.values(deviceGroups), ...inactiveDevicesOfType];
  }

  processHistoricalData(): void {
    // Map device types to their identifiers
    const deviceTypeMap: { [key: string]: string } = {
      'flow': 'flujo',
      'ph': 'ph-suelo',
      'climate': 'estacion-metereologica',
      'pressure': 'presion',
      'soil': 'suelo'
    };

    Object.keys(deviceTypeMap).forEach(key => {
      const deviceType = deviceTypeMap[key];
      const typeData = this.rawData.filter(item => item.deviceId.includes(deviceType));

      // Group by sensor type
      const sensorGroups: { [key: string]: any[] } = {};

      typeData.forEach(item => {
        const numericValue = this.extractNumericValue(item.payload);
        if (numericValue !== null) {
          if (!sensorGroups[item.sensor]) {
            sensorGroups[item.sensor] = [];
          }

          sensorGroups[item.sensor].push({
            timestamp: item.recordDate,
            value: numericValue,
            deviceId: item.deviceId
          });
        }
      });

      // Sort by timestamp and create historical data structure
      Object.keys(sensorGroups).forEach(sensor => {
        sensorGroups[sensor].sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      this.historicalData[key] = Object.keys(sensorGroups).map(sensor => ({
        sensor,
        values: sensorGroups[sensor]
      }));
    });

    // Prepare chart data
    this.prepareChartData();
  }

  prepareChartData(): void {
    Object.keys(this.historicalData).forEach(deviceType => {
      const data = this.historicalData[deviceType];

      if (data && data.length > 0) {
        const chartDataMap: { [key: string]: ChartData } = {};

        data.forEach((sensorData) => {
          if (sensorData.values.length > 0) {
            // Get the most recent readings for charting
            const recentValues = sensorData.values.slice(-8000);

            // Create unique timestamps
            const uniqueTimestamps = [...new Set(recentValues.map(v => v.timestamp))];
            const labels = uniqueTimestamps.map(timestamp => {
              const date = new Date(timestamp);
              const adjustedDate = new Date(date.getTime() - (6 * 60 * 60 * 1000));
              return adjustedDate.toLocaleTimeString();
            });

            // Group by device for multiple series
            const deviceGroups: { [key: string]: any[] } = {};
            recentValues.forEach(value => {
              if (!deviceGroups[value.deviceId]) {
                deviceGroups[value.deviceId] = [];
              }
              deviceGroups[value.deviceId].push(value);
            });

            // Create datasets for each device
            const datasets = Object.keys(deviceGroups).map((deviceId, index) => {
              const deviceData = deviceGroups[deviceId];
              // Align data with labels
              const alignedData = labels.map(label => {
                const timestamp = uniqueTimestamps[labels.indexOf(label)];
                const dataPoint = deviceData.find(d => d.timestamp === timestamp);
                return dataPoint ? dataPoint.value : null;
              });

              return {
                label: deviceId,
                data: alignedData,
                borderColor: this.colors[index % this.colors.length],
                backgroundColor: this.colors[index % this.colors.length] + '20',
                deviceId: deviceId,
                fill: false,
                tension: 0.1
              };
            });

            chartDataMap[sensorData.sensor] = {
              labels: labels,
              datasets: datasets
            };
          }
        });

        this.chartData[deviceType] = chartDataMap;
      }
    });
  }

  initializeCharts(): void {
    // Destroy existing charts
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.chartInstances = {};

    // Create new charts
    const chartsForType = this.getChartsForType(this.selectedChartType);

    chartsForType.forEach(chartType => {
      const canvasId = `chart-${this.selectedChartType}-${chartType}`;
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

      if (canvas && this.chartData[this.selectedChartType] && this.chartData[this.selectedChartType][chartType]) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const chartData = this.chartData[this.selectedChartType][chartType];

          this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
              labels: chartData.labels,
              datasets: chartData.datasets.map(dataset => ({
                ...dataset,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
              }))
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: `${chartType} ${this.getSensorUnit(chartType) ? '(' + this.getSensorUnit(chartType) + ')' : ''}`
                },
                legend: {
                  display: true,
                  position: 'top'
                }
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Tiempo'
                  }
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: this.getSensorUnit(chartType) || 'Valor'
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }
          });
        }
      }
    });
  }

  getReadingValue(device: DeviceData, sensor: string): string {
    const reading = device.readings[sensor];
    if (!reading || reading.value === null) return 'N/A';

    // Get unit from mapping
    const unit = this.sensorUnits[sensor] || '';

    // Format based on sensor type
    let formattedValue: string;

    if (sensor.includes('temp') || sensor.includes('TEM') || sensor.includes('TEMP')) {
      formattedValue = reading.value.toFixed(1);
    } else if (sensor.includes('PH') || sensor.includes('ph')) {
      formattedValue = reading.value.toFixed(2);
    } else if (sensor.includes('mA') || sensor.includes('pressure')) {
      formattedValue = reading.value.toFixed(3);
    } else if (sensor.includes('pulse') || sensor.includes('Total')) {
      formattedValue = reading.value.toFixed(0);
    } else {
      formattedValue = reading.value.toFixed(1);
    }

    return unit ? `${formattedValue} ${unit}` : formattedValue;
  }

  getRawReadingValue(device: DeviceData, sensor: string): string {
    const reading = device.readings[sensor];
    return reading?.rawValue || 'N/A';
  }

  hasNumericReading(device: DeviceData, sensor: string): boolean {
    const reading = device.readings[sensor];
    return reading?.value !== null && reading?.value !== undefined;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Subtract 6 hours (6 * 60 * 60 * 1000 milliseconds)
    const adjustedDate = new Date(date.getTime() - (6 * 60 * 60 * 1000));
    return adjustedDate.toLocaleString();
  }

  getDeviceStatus(device: DeviceData): string {
    if (!device.isActive) return 'inactive';

    return 'online';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'online': return 'status-online';
      case 'warning': return 'status-warning';
      case 'offline': return 'status-offline';
      case 'inactive': return 'status-inactive';
      default: return 'status-unknown';
    }
  }

  refreshData(): void {
    this.loadDeviceData();
  }

  toggleCharts(): void {
    this.showCharts = !this.showCharts;
    if (this.showCharts) {
      // Initialize charts after DOM updates
      setTimeout(() => this.initializeCharts(), 100);
    } else {
      // Clean up charts when hiding
      Object.values(this.chartInstances).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
      this.chartInstances = {};
    }
  }

  selectChartType(type: string): void {
    this.selectedChartType = type;
    // Reinitialize charts for the new type
    setTimeout(() => this.initializeCharts(), 100);
  }

  getAvailableChartTypes(): string[] {
    return Object.keys(this.chartData);
  }

  getChartsForType(type: string): string[] {
    return this.chartData[type] ? Object.keys(this.chartData[type]) : [];
  }

  getDeviceTypeSummary(devices: DeviceData[]): DeviceStatusSummary {
    const summary: DeviceStatusSummary = { online: 0, warning: 0, offline: 0, inactive: 0 };
    devices.forEach(device => {
      const status = this.getDeviceStatus(device);
      summary[status as keyof DeviceStatusSummary]++;
    });
    return summary;
  }

  getSensorUnit(sensor: string): string {
    return this.sensorUnits[sensor] || '';
  }

  // Additional properties for raw data analysis
  showRawData = false;

  // Classification methods...
  getPhClass(value: number | null): string {
    if (value === null) return '';
    if (value < 6.0) return 'ph-acidic';
    if (value > 8.0) return 'ph-alkaline';
    return 'ph-neutral';
  }

  getBatteryClass(value: number | null): string {
    if (value === null) return '';
    if (value < 3.0) return 'battery-low';
    if (value < 3.5) return 'battery-medium';
    return 'battery-high';
  }

  getTempClass(value: number | null): string {
    if (value === null) return '';
    if (value < 10) return 'temp-cold';
    if (value > 35) return 'temp-hot';
    return 'temp-normal';
  }

  getHumidityClass(value: number | null): string {
    if (value === null) return '';
    if (value < 30) return 'humidity-low';
    if (value > 80) return 'humidity-high';
    return 'humidity-normal';
  }

  getWindClass(value: number | null): string {
    if (value === null) return '';
    if (value < 5) return 'wind-calm';
    if (value > 15) return 'wind-strong';
    return 'wind-moderate';
  }

  getRainClass(value: number | null): string {
    if (value === null) return '';
    if (value === 0) return 'rain-none';
    if (value > 10) return 'rain-heavy';
    return 'rain-light';
  }

  // Raw data analysis methods
  getUniqueDevicesCount(): number {
    const uniqueDevices = new Set(this.rawData.map(item => item.deviceId));
    return uniqueDevices.size;
  }

  getUniqueSensorsCount(): number {
    const uniqueSensors = new Set(this.rawData.map(item => item.sensor));
    return uniqueSensors.size;
  }

  getDeviceTypes(): string[] {
    const deviceTypes = new Set<string>();
    this.rawData.forEach(item => {
      const type = item.deviceId.split('-')[0];
      deviceTypes.add(type);
    });
    return Array.from(deviceTypes);
  }

  getSensorsForDeviceType(deviceType: string): string[] {
    const sensors = new Set<string>();
    this.rawData
      .filter(item => item.deviceId.includes(deviceType))
      .forEach(item => sensors.add(item.sensor));
    return Array.from(sensors);
  }

  getSensorCountForDeviceType(deviceType: string, sensor: string): number {
    return this.rawData.filter(item =>
      item.deviceId.includes(deviceType) && item.sensor === sensor
    ).length;
  }

  getChartTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'flow': 'Medidores de Flujo',
      'ph': 'Sensores de pH',
      'climate': 'Estación Climática',
      'pressure': 'Sensores de Presión',
      'soil': 'Sensores de Suelo'
    };
    return labels[type] || type;
  }

  getDataTimeRange(): string {
    if (this.rawData.length === 0) return 'Sin datos';

    const dates = this.rawData.map(item => new Date(item.recordDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const diffMinutes = (maxDate.getTime() - minDate.getTime()) / (1000 * 60);

    if (diffMinutes < 60) {
      return `${diffMinutes.toFixed(0)} minutos`;
    } else if (diffMinutes < 1440) {
      return `${(diffMinutes / 60).toFixed(1)} horas`;
    } else {
      return `${(diffMinutes / 1440).toFixed(1)} días`;
    }
  }

  // New methods for device activity tracking
  getTotalRegisteredDevices(): number {
    return this.allRegisteredDevices.length;
  }

  getTotalActiveDevices(): number {
    return this.activeDeviceIds.size;
  }

  getTotalInactiveDevices(): number {
    return this.allRegisteredDevices.length - this.activeDeviceIds.size;
  }

  getDeviceActivityPercentage(): number {
    if (this.allRegisteredDevices.length === 0) return 0;
    return (this.activeDeviceIds.size / this.allRegisteredDevices.length) * 100;
  }

  getInactiveDevicesByType(deviceType: string): DeviceData[] {
    return this.inactiveDevices.filter(device => device.deviceId.includes(deviceType));
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }


  // Aggregate wind data into directional bins
  private aggregateWindRoseData(windData: { direction: number; speed: number }[]): any[] {
    console.log("windData: ", windData)

    // Handle empty dataset
    if (windData.length === 0) {
      console.warn("No valid wind data points to aggregate");
      return [];
    }

    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const directionAngles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5,
      180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];

    // Speed categories (Beaufort scale in m/s) - FIXED: inclusive upper bounds
    const speedRanges = [
      { label: '0-2 m/s (Calma)', min: 0, max: 2, color: '#4ecdc4' },
      { label: '2-5 m/s (Ligero)', min: 2, max: 5, color: '#45b7d1' },
      { label: '5-8 m/s (Moderado)', min: 5, max: 8, color: '#f7b731' },
      { label: '8-11 m/s (Fuerte)', min: 8, max: 11, color: '#fd9644' },
      { label: '>11 m/s (Muy Fuerte)', min: 11, max: Infinity, color: '#e74c3c' }
    ];

    // Initialize frequency counts
    const frequencyMatrix: number[][] = [];
    directions.forEach(() => {
      frequencyMatrix.push(new Array(speedRanges.length).fill(0));
    });

    // Categorize each wind reading
    windData.forEach(({ direction, speed }) => {
      // Find closest direction bin
      let closestDirIndex = 0;
      let minDiff = Math.abs(direction - directionAngles[0]);

      directionAngles.forEach((angle, index) => {
        const diff = Math.min(
          Math.abs(direction - angle),
          Math.abs(direction - angle + 360),
          Math.abs(direction - angle - 360)
        );
        if (diff < minDiff) {
          minDiff = diff;
          closestDirIndex = index;
        }
      });

      // Find speed range - FIXED: use <= for upper bound to be inclusive
      let speedIndex = -1;
      for (let i = 0; i < speedRanges.length; i++) {
        if (speed >= speedRanges[i].min && speed <= speedRanges[i].max) {
          speedIndex = i;
          break;
        }
      }

      if (speedIndex !== -1) {
        frequencyMatrix[closestDirIndex][speedIndex]++;
      } else {
        console.warn(`Speed ${speed} m/s did not fall into any category`);
      }
    });

    // Convert to percentage
    const total = windData.length || 1;
    const percentageMatrix = frequencyMatrix.map(row =>
      row.map(count => (count / total) * 100)
    );

    console.log("Frequency matrix (before percentage):", frequencyMatrix);
    console.log("Percentage matrix:", percentageMatrix);

    // Prepare data for Plotly
    const traces: any[] = [];
    speedRanges.forEach((range, speedIndex) => {
      traces.push({
        type: 'barpolar',
        name: range.label,
        r: percentageMatrix.map(row => row[speedIndex]),
        theta: directions,
        marker: {
          color: range.color,
          line: {
            color: 'white',
            width: 1
          }
        },
        hovertemplate: '<b>%{theta}</b><br>' +
          'Frecuencia: %{r:.1f}%<br>' +
          '<extra></extra>'
      });
    });

    console.log("Wind rose traces prepared: ", traces);
    return traces;
  }

  getMaxFrequency(): number {
    if (!this.windRoseData || this.windRoseData.length === 0) {
      return 0;
    }

    const allFrequencies = this.windRoseData.flatMap(trace => trace.r || []);
    return allFrequencies.length > 0 ? Math.max(...allFrequencies) : 0;
  }

  prepareWindRoseData(): void {
    const windData: { direction: number; speed: number }[] = [];

    console.log("=== WIND ROSE DEBUG START ===");
    console.log("Total rawData count:", this.rawData.length);

    const windRawData = this.rawData.filter(item =>
      item.sensor === 'wind_speed' ||
      item.sensor === 'wind_speed_level' ||
      item.sensor === 'wind_direction_angle'
    );
    console.log("Filtered wind raw data count:", windRawData.length);

    const sensorCounts = windRawData.reduce((acc, item) => {
      acc[item.sensor] = (acc[item.sensor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("Sensor counts:", sensorCounts);

    const dataMap = new Map<string, Map<string, RawDeviceData>>();

    windRawData.forEach(item => {
      const key = `${item.deviceId}_${item.recordDate}`;
      if (!dataMap.has(key)) {
        dataMap.set(key, new Map());
      }
      dataMap.get(key)!.set(item.sensor, item);
    });

    console.log("Unique device+time combinations:", dataMap.size);

    let validDataCount = 0;
    let zeroSpeedCount = 0;
    let nosensorCount = 0;

    dataMap.forEach((sensors, key) => {
      let windSpeed = 0;
      let windDirection = 0;

      const speedReading = sensors.get('wind_speed');
      const isValidSpeed = speedReading?.payload &&
        speedReading.payload !== 'Nosensor' &&
        speedReading.payload !== 'null' &&
        !isNaN(parseFloat(speedReading.payload));

      if (speedReading?.payload === 'Nosensor') nosensorCount++;

      if (!isValidSpeed || parseFloat(speedReading!.payload) === 0) {
        const levelReading = sensors.get('wind_speed_level');
        const isValidLevel = levelReading?.payload &&
          levelReading.payload !== 'Nosensor' &&
          levelReading.payload !== 'null' &&
          !isNaN(parseFloat(levelReading.payload));

        windSpeed = isValidLevel ? parseFloat(levelReading!.payload) : 0;
      } else {
        windSpeed = parseFloat(speedReading!.payload);
      }

      const directionReading = sensors.get('wind_direction_angle');
      const isValidDirection = directionReading?.payload &&
        directionReading.payload !== 'Nosensor' &&
        directionReading.payload !== 'null' &&
        !isNaN(parseFloat(directionReading.payload));

      windDirection = isValidDirection ? parseFloat(directionReading!.payload) : -1;

      if (windSpeed === 0) zeroSpeedCount++;

      if (windSpeed >= 0 && windDirection >= 0 && windDirection <= 360 && isValidDirection) {
        windData.push({
          direction: windDirection,
          speed: windSpeed
        });
        validDataCount++;
      }
    });

    console.log("Processing summary:");
    console.log("  - Valid data points:", validDataCount);
    console.log("  - Zero speed readings:", zeroSpeedCount);
    console.log("  - 'Nosensor' readings:", nosensorCount);

    this.windRoseData = this.aggregateWindRoseData(windData);
    this.generateWindRoseSegments(); // Generate SVG segments
    this.windDataLoaded = true;

    console.log("=== WIND ROSE DEBUG END ===");
  }

  // ADD these NEW trackBy methods (they don't exist yet)
  trackBySegmentId(index: number, segment: any): string {
    return segment.segmentId;
  }

  trackByCircleRadius(index: number, circle: any): number {
    return circle.radius;
  }

  trackByDirection(index: number, direction: string): string {
    return direction;
  }

  trackByTrace(index: number, trace: any): string {
    return trace.name;
  }

  // REPLACE existing onSegmentHover method
  onSegmentHover(segmentId: string | null) {
    this.hoveredSegment = segmentId;
  }

  getDirectionLabelPosition(direction: string): { x: number, y: number } {
    if (this._directionLabelPositions.has(direction)) {
      return this._directionLabelPositions.get(direction)!;
    }
    const dirIndex = this.directions.indexOf(direction);
    const angleStep = (2 * Math.PI) / 16;
    const angle = -Math.PI / 2 + dirIndex * angleStep;
    const radius = this.windRoseConfig.maxRadius + 20;
    const x = this.windRoseConfig.center + radius * Math.cos(angle);
    const y = this.windRoseConfig.center + radius * Math.sin(angle);
    const position = { x, y };
    this._directionLabelPositions.set(direction, position);
    return position;
  }

  getGridCircles(): { radius: number; percentage: number }[] {
    if (this._gridCircles) {
      return this._gridCircles;
    }
    const maxFrequency = this.getMaxFrequency();
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      const percentage = (i / 5) * 100;
      const radius = (percentage / 100) * this.windRoseConfig.maxRadius;
      circles.push({ radius, percentage });
    }
    this._gridCircles = circles;
    return circles;
  }

  // REPLACE existing generateWindRoseSegments method
  generateWindRoseSegments(): void {
    if (!this.windRoseData || this.windRoseData.length === 0) {
      this.windRoseSegments = [];
      return;
    }

    // Clear position cache when regenerating
    this._directionLabelPositions.clear();

    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

    // Calculate totals for each direction
    const totals = new Array(16).fill(0);
    this.windRoseData.forEach(trace => {
      trace.r.forEach((freq: number, idx: number) => {
        totals[idx] += freq;
      });
    });

    const maxTotal = Math.max(...totals);
    const angleStep = (2 * Math.PI) / 16;
    const startAngle = -Math.PI / 2;

    const { size, center, maxRadius, innerRadius } = this.windRoseConfig;

    const polarToCartesian = (angle: number, radius: number) => {
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    };

    const createSegmentPath = (directionIndex: number, innerR: number, outerR: number) => {
      const angle1 = startAngle + directionIndex * angleStep - angleStep / 2;
      const angle2 = startAngle + directionIndex * angleStep + angleStep / 2;

      const p1 = polarToCartesian(angle1, innerR);
      const p2 = polarToCartesian(angle2, innerR);
      const p3 = polarToCartesian(angle2, outerR);
      const p4 = polarToCartesian(angle1, outerR);

      return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
    };

    this.windRoseSegments = [];

    directions.forEach((direction, dirIdx) => {
      let currentRadius = innerRadius;

      this.windRoseData.forEach((trace, rangeIdx) => {
        const frequency = trace.r[dirIdx];
        if (frequency > 0) {
          const segmentHeight = (frequency / maxTotal) * maxRadius;
          const outerRadius = currentRadius + segmentHeight;

          this.windRoseSegments.push({
            path: createSegmentPath(dirIdx, currentRadius, outerRadius),
            color: trace.marker.color,
            direction: direction,
            speedRange: trace.name,
            frequency: frequency,
            segmentId: `${dirIdx}-${rangeIdx}`
          });

          currentRadius = outerRadius;
        }
      });
    });

    console.log("Generated", this.windRoseSegments.length, "wind rose segments");
  }




  // Add to shiny-dashboard.component.ts

  // ============= THERMOSTAT CARD PROPERTIES =============
  thermostatData: ThermostatReading[] = [];
  thermostatConfig = {
    size: 700,
    center: 350,
    outerRadius: 280,
    innerRadius: 180,
    minTemp: -10,
    maxTemp: 50,
    startAngle: -135, // degrees
    endAngle: 135 // degrees
  };

  normalTemperatureRanges: Record<string, { min: number; max: number }> = {
    enero: { min: 17, max: 27 },
    febrero: { min: 17, max: 28 },
    marzo: { min: 18, max: 29 },
    abril: { min: 19, max: 30 },
    mayo: { min: 19, max: 29 },
    junio: { min: 19, max: 28 },
    julio: { min: 18, max: 28 },
    agosto: { min: 18, max: 28 },
    septiembre: { min: 18, max: 28 },
    octubre: { min: 18, max: 28 },
    noviembre: { min: 18, max: 27 },
    diciembre: { min: 17, max: 27 }
  };



  // ============= TEMPERATURE DATA PREPARATION =============
  prepareThermostatData(): void {
    console.log("=== THERMOSTAT DATA PREPARATION START ===");

    // Temperature sensor types to track
    const tempSensors = ['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL', 'temp_DS18B20'];

    // Filter temperature data from rawData
    const tempRawData = this.rawData.filter(item =>
      tempSensors.includes(item.sensor)
    );

    console.log("Temperature readings found:", tempRawData.length);

    // Get current month for normal range
    const currentMonth = this.getCurrentMonthName();
    const normalRange = this.normalTemperatureRanges[currentMonth];

    // Get crop temperature data
    this.getCropTemperatureData().subscribe({
      next: (cropData: any) => {
        // Group by device and sensor
        const dataMap = new Map<string, RawDeviceData[]>();

        tempRawData.forEach(item => {
          const key = `${item.deviceId}_${item.sensor}`;
          if (!dataMap.has(key)) {
            dataMap.set(key, []);
          }
          dataMap.get(key)!.push(item);
        });

        // Process each sensor group
        this.thermostatData = [];
        const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
        let colorIndex = 0;

        dataMap.forEach((readings, key) => {
          const [deviceId, sensorType] = key.split('_').slice(0, 2);
          const fullSensorType = key.split('_').slice(1).join('_');

          // Extract valid temperature values
          const temps = readings
            .map(r => this.extractNumericValue(r.payload))
            .filter(v => v !== null && v > -50 && v < 100) as number[];

          if (temps.length === 0) return;

          // Calculate statistics
          const currentTemp = temps[temps.length - 1];
          const max = Math.max(...temps);
          const min = Math.min(...temps);
          const mean = temps.reduce((a, b) => a + b, 0) / temps.length;

          // Calculate optimal temperatures from crops
          const tMinOpt = cropData.length > 0
            ? cropData.reduce((sum: number, c: { baseTemperature: number; }) => sum + (c.baseTemperature - 5), 0) / cropData.length
            : 15;
          const tMaxOpt = cropData.length > 0
            ? cropData.reduce((sum: any, c: { baseTemperature: number; }) => sum + (c.baseTemperature + 10), 0) / cropData.length
            : 30;

          // Check if within normal range
          const isWithinNormal = currentTemp >= normalRange.min && currentTemp <= normalRange.max;

          // Get last update timestamp
          const lastUpdate = readings[readings.length - 1].recordDate;

          this.thermostatData.push({
            deviceId: deviceId,
            sensorType: fullSensorType,
            currentTemp: parseFloat(currentTemp.toFixed(1)),
            max: parseFloat(max.toFixed(1)),
            min: parseFloat(min.toFixed(1)),
            mean: parseFloat(mean.toFixed(1)),
            tMinOpt: parseFloat(tMinOpt.toFixed(1)),
            tMaxOpt: parseFloat(tMaxOpt.toFixed(1)),
            isWithinNormal,
            normalRange,
            lastUpdate,
            color: colors[colorIndex % colors.length]
          });

          colorIndex++;
        });

        console.log("Thermostat data prepared:", this.thermostatData);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error getting crop temperature data:", err);
        // Continue with default values if crop service fails
        this.cdr.detectChanges();
      }
    });
  }

  getCropTemperatureData(): Observable<CropTemperatureData[]> {
    return this.cropService.getAll(true).pipe(
      map((crops: any[]) => {
        return crops
          .filter(c => c.cropBaseTemperature && c.cropBaseTemperature > 0)
          .map(c => ({
            cropName: c.name,
            baseTemperature: c.cropBaseTemperature
          }));
      }),
      catchError(err => {
        console.error('Error fetching crop data:', err);
        return of([]);
      })
    );
  }

  getCurrentMonthName(): string {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return months[new Date().getMonth()];
  }

  // ============= THERMOSTAT VISUALIZATION HELPERS =============
  getThermostatArcPath(reading: ThermostatReading): string {
    const { center, outerRadius, innerRadius, minTemp, maxTemp, startAngle, endAngle } = this.thermostatConfig;

    // Calculate angle for current temperature
    const tempRange = maxTemp - minTemp;
    const angleRange = endAngle - startAngle;
    const angle = startAngle + ((reading.currentTemp - minTemp) / tempRange) * angleRange;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (angle * Math.PI) / 180;

    // Calculate arc coordinates
    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} 
          A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
          L ${x3} ${y3}
          A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
          Z`;
  }

  getThermostatTickMarks(): Array<{ x1: number, y1: number, x2: number, y2: number, label: string }> {
    const { center, outerRadius, minTemp, maxTemp, startAngle, endAngle } = this.thermostatConfig;
    const marks = [];
    const tempStep = 10;

    for (let temp = minTemp; temp <= maxTemp; temp += tempStep) {
      const tempRange = maxTemp - minTemp;
      const angleRange = endAngle - startAngle;
      const angle = startAngle + ((temp - minTemp) / tempRange) * angleRange;
      const rad = (angle * Math.PI) / 180;

      const x1 = center + (outerRadius - 15) * Math.cos(rad);
      const y1 = center + (outerRadius - 15) * Math.sin(rad);
      const x2 = center + outerRadius * Math.cos(rad);
      const y2 = center + outerRadius * Math.sin(rad);

      marks.push({ x1, y1, x2, y2, label: `${temp}°` });
    }

    return marks;
  }

  getThermostatNeedlePosition(temp: number): { x: number, y: number, angle: number } {
    const { center, innerRadius, outerRadius, minTemp, maxTemp, startAngle, endAngle } = this.thermostatConfig;

    const tempRange = maxTemp - minTemp;
    const angleRange = endAngle - startAngle;
    const angle = startAngle + ((temp - minTemp) / tempRange) * angleRange;
    const rad = (angle * Math.PI) / 180;

    const needleLength = (outerRadius + innerRadius) / 2;
    const x = center + needleLength * Math.cos(rad);
    const y = center + needleLength * Math.sin(rad);

    return { x, y, angle: angle + 90 };
  }

  getThermostatRangeIndicator(minTemp: number, maxTemp: number, color: string): string {
    const { center, outerRadius, minTemp: configMin, maxTemp: configMax, startAngle, endAngle } = this.thermostatConfig;

    const tempRange = configMax - configMin;
    const angleRange = endAngle - startAngle;

    const startAngleCalc = startAngle + ((minTemp - configMin) / tempRange) * angleRange;
    const endAngleCalc = startAngle + ((maxTemp - configMin) / tempRange) * angleRange;

    const startRad = (startAngleCalc * Math.PI) / 180;
    const endRad = (endAngleCalc * Math.PI) / 180;

    const indicatorRadius = outerRadius + 20;

    const x1 = center + indicatorRadius * Math.cos(startRad);
    const y1 = center + indicatorRadius * Math.sin(startRad);
    const x2 = center + indicatorRadius * Math.cos(endRad);
    const y2 = center + indicatorRadius * Math.sin(endRad);

    const largeArcFlag = endAngleCalc - startAngleCalc > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${indicatorRadius} ${indicatorRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  }

  getTempStatusClass(reading: ThermostatReading): string {
    if (reading.currentTemp < reading.tMinOpt) return 'temp-cold';
    if (reading.currentTemp > reading.tMaxOpt) return 'temp-hot';
    if (!reading.isWithinNormal) return 'temp-warning';
    return 'temp-optimal';
  }

  getTempStatusText(reading: ThermostatReading): string {
    if (reading.currentTemp < reading.tMinOpt) return 'Bajo Óptimo';
    if (reading.currentTemp > reading.tMaxOpt) return 'Sobre Óptimo';
    if (!reading.isWithinNormal) return 'Fuera de Rango Normal';
    return 'Temperatura Óptima';
  }

  // TrackBy functions for performance
  trackByThermostatId(index: number, item: ThermostatReading): string {
    return `${item.deviceId}_${item.sensorType}`;
  }

  trackByTickIndex(index: number): number {
    return index;
  }



  private calculateDLIg(radiationValues: number[]): number {
    // DLIg = (Sum of hourly radiation in W/m²) / 1000 × 3.6
    const sum = radiationValues.reduce((acc, val) => acc + val, 0);
    return (sum / 1000) * 3.6;
  }

  // 4. ADD METHOD to prepare TSR data (call this in loadDeviceData after prepareThermostatData)
  prepareTSRData(): void {
    console.log("=== TSR DATA PREPARATION START ===");

    // TSR sensor types to track - based on your system
    const tsrSensors = [
      'TSR',
      'TotalSolarRadiation',
      'TotalSolarRadiationMin',
      'TotalSolarRadiationMax',
      'TotalSolarRadiationAvg',
      'solar_radiation',
      'PAR'
    ];

    // Filter TSR data from rawData - only from climate/meteorological devices
    const tsrRawData = this.rawData.filter(item =>
      item.deviceId.includes('estacion-metereologica') &&
      tsrSensors.some(sensor => item.sensor.includes(sensor) || item.sensor.toLowerCase().includes('radiation'))
    );

    console.log("TSR readings found:", tsrRawData.length);
    console.log("TSR sensors detected:", [...new Set(tsrRawData.map(d => d.sensor))]);

    if (tsrRawData.length === 0) {
      console.warn("No TSR data found");
      return;
    }

    // Group by timestamp (hour) to get max, mean, min
    const timeGroups = new Map<string, { values: number[]; deviceId: string }>();

    tsrRawData.forEach(item => {
      const timestamp = new Date(item.recordDate);
      // Round to nearest hour for grouping
      timestamp.setMinutes(0, 0, 0);
      const hourKey = timestamp.toISOString();

      const value = this.extractNumericValue(item.payload);
      if (value !== null && value >= 0) { // Only valid positive values
        if (!timeGroups.has(hourKey)) {
          timeGroups.set(hourKey, { values: [], deviceId: item.deviceId });
        }
        timeGroups.get(hourKey)!.values.push(value);
      }
    });

    console.log("TSR time groups:", timeGroups.size);

    // Calculate max, mean, min for each hour
    const dataPoints: TSRDataPoint[] = [];

    timeGroups.forEach((group, timestamp) => {
      const values = group.values;
      if (values.length > 0) {
        dataPoints.push({
          timestamp: timestamp,
          tsrMax: Math.max(...values),
          tsrMean: values.reduce((a, b) => a + b, 0) / values.length,
          tsrMin: Math.min(...values),
          deviceId: group.deviceId
        });
      }
    });

    // Sort by timestamp
    dataPoints.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log("TSR data points created:", dataPoints.length);

    // Calculate DLIg values
    const dligMax = this.calculateDLIg(dataPoints.map(d => d.tsrMax));
    const dligMean = this.calculateDLIg(dataPoints.map(d => d.tsrMean));
    const dligMin = this.calculateDLIg(dataPoints.map(d => d.tsrMin));

    // Get time range
    const timeRange = dataPoints.length > 0 ? {
      start: dataPoints[0].timestamp,
      end: dataPoints[dataPoints.length - 1].timestamp
    } : { start: '', end: '' };

    this.tsrChartData = {
      dataPoints,
      dligMax,
      dligMean,
      dligMin,
      timeRange
    };

    console.log("TSR Chart Data prepared:", {
      dataPoints: this.tsrChartData.dataPoints.length,
      dligMax: this.tsrChartData.dligMax.toFixed(2),
      dligMean: this.tsrChartData.dligMean.toFixed(2),
      dligMin: this.tsrChartData.dligMin.toFixed(2)
    });
  }

  // 5. ADD SVG HELPER METHODS for TSR chart
  getTSRChartDimensions() {
    return {
      chartWidth: this.tsrChartConfig.width - this.tsrChartConfig.padding.left - this.tsrChartConfig.padding.right,
      chartHeight: this.tsrChartConfig.height - this.tsrChartConfig.padding.top - this.tsrChartConfig.padding.bottom
    };
  }

  getTSRMaxValue(): number {
    if (this.tsrChartData.dataPoints.length === 0) return 1000;
    return Math.max(
      ...this.tsrChartData.dataPoints.flatMap(d => [d.tsrMax, d.tsrMean, d.tsrMin])
    );
  }

  getTSRXScale(index: number): number {
    const { chartWidth } = this.getTSRChartDimensions();
    const length = this.tsrChartData.dataPoints.length;
    if (length <= 1) return 0;
    return (index / (length - 1)) * chartWidth;
  }

  getTSRYScale(value: number): number {
    const { chartHeight } = this.getTSRChartDimensions();
    const maxValue = this.getTSRMaxValue();
    return chartHeight - (value / maxValue) * chartHeight;
  }

  // Generate SVG path for area chart
  generateTSRAreaPath(dataKey: 'tsrMin' | 'tsrMean' | 'tsrMax'): string {
    if (this.tsrChartData.dataPoints.length === 0) return '';

    const { chartWidth, chartHeight } = this.getTSRChartDimensions();
    const pad = this.tsrChartConfig.padding;
    const points = this.tsrChartData.dataPoints.map((d, i) => ({
      x: this.getTSRXScale(i),
      y: this.getTSRYScale(d[dataKey])
    }));

    let path = `M ${pad.left} ${pad.top + chartHeight} `;
    path += `L ${pad.left + points[0].x} ${pad.top + points[0].y} `;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      const cpx = (prevPoint.x + currPoint.x) / 2;

      path += `Q ${pad.left + cpx} ${pad.top + prevPoint.y}, `;
      path += `${pad.left + currPoint.x} ${pad.top + currPoint.y} `;
    }

    path += `L ${pad.left + points[points.length - 1].x} ${pad.top + chartHeight} Z`;

    return path;
  }

  // Generate SVG path for line
  generateTSRLinePath(dataKey: 'tsrMin' | 'tsrMean' | 'tsrMax'): string {
    if (this.tsrChartData.dataPoints.length === 0) return '';

    const pad = this.tsrChartConfig.padding;
    const points = this.tsrChartData.dataPoints.map((d, i) => ({
      x: this.getTSRXScale(i),
      y: this.getTSRYScale(d[dataKey])
    }));

    let path = `M ${pad.left + points[0].x} ${pad.top + points[0].y} `;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      const cpx = (prevPoint.x + currPoint.x) / 2;

      path += `Q ${pad.left + cpx} ${pad.top + prevPoint.y}, `;
      path += `${pad.left + currPoint.x} ${pad.top + currPoint.y} `;
    }

    return path;
  }

  // Get grid circles for Y-axis
  getTSRGridLines(): { y: number; label: string }[] {
    const { chartHeight } = this.getTSRChartDimensions();
    const maxValue = this.getTSRMaxValue();
    const pad = this.tsrChartConfig.padding;

    return [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
      y: pad.top + chartHeight * ratio,
      label: (maxValue * (1 - ratio)).toFixed(0)
    }));
  }

  // Get X-axis labels (show every 4th point)
  getTSRXAxisLabels(): { x: number; label: string; dataPoint: TSRDataPoint }[] {
    return this.tsrChartData.dataPoints
      .filter((_, i) => i % 4 === 0)
      .map((d, i) => {
        const index = i * 4;
        return {
          x: this.tsrChartConfig.padding.left + this.getTSRXScale(index),
          label: this.formatTSRTime(d.timestamp),
          dataPoint: d
        };
      });
  }

  // Format time for display
  formatTSRTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  // Format date for display
  formatTSRDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }

  // Handle TSR chart hover
  onTSRChartHover(event: MouseEvent, svgElement: SVGSVGElement): void {
    if (this.tsrChartData.dataPoints.length === 0) return;

    const rect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - this.tsrChartConfig.padding.left;

    const { chartWidth } = this.getTSRChartDimensions();

    if (mouseX < 0 || mouseX > chartWidth) {
      this.hoveredTSRPoint = null;
      this.hoveredTSRIndex = -1;
      return;
    }

    const index = Math.round((mouseX / chartWidth) * (this.tsrChartData.dataPoints.length - 1));
    this.hoveredTSRIndex = index;
    this.hoveredTSRPoint = this.tsrChartData.dataPoints[index];
  }

  onTSRChartLeave(): void {
    this.hoveredTSRPoint = null;
    this.hoveredTSRIndex = -1;
  }

  // Get tooltip position
  getTSRTooltipX(): number {
    if (this.hoveredTSRIndex < 0) return 0;
    return this.tsrChartConfig.padding.left + this.getTSRXScale(this.hoveredTSRIndex) + 15;
  }

  getTSRTooltipY(): number {
    return this.tsrChartConfig.padding.top + 20;
  }

  // TrackBy for performance
  trackByTSRIndex(index: number): number {
    return index;
  }





  // 1.4 ADD PREPARATION METHOD (after prepareTSRData() method, around line 450)
  preparePARData(): void {
    console.log("=== PAR DATA PREPARATION START ===");

    // PAR sensor types to track
    const parSensors = [
      'PAR',
      'PhotosyntheticallyActiveRadiation',
      'PARAvg',
      'PARMin',
      'PARMax',
      'par',
      'illumination' // Some systems use illumination for PAR
    ];

    // Filter PAR data from rawData - from climate/meteorological devices
    const parRawData = this.rawData.filter(item =>
      parSensors.some(sensor =>
        item.sensor.includes(sensor) ||
        item.sensor.toLowerCase().includes('par')
      )
    );

    console.log("PAR readings found:", parRawData.length);
    console.log("PAR sensors detected:", [...new Set(parRawData.map(d => d.sensor))]);

    if (parRawData.length === 0) {
      console.warn("No PAR data found");
      return;
    }

    // Group by timestamp (hour) for processing
    const timeGroups = new Map<string, { values: number[]; deviceId: string }>();

    parRawData.forEach(item => {
      const timestamp = new Date(item.recordDate);
      // Round to nearest hour for grouping
      timestamp.setMinutes(0, 0, 0);
      const hourKey = timestamp.toISOString();

      const value = this.extractNumericValue(item.payload);
      if (value !== null && value >= 0) { // Only valid positive values
        if (!timeGroups.has(hourKey)) {
          timeGroups.set(hourKey, { values: [], deviceId: item.deviceId });
        }
        timeGroups.get(hourKey)!.values.push(value);
      }
    });

    console.log("PAR time groups:", timeGroups.size);

    // Calculate instantaneous PAR and accumulated DLIp
    const dataPoints: PARDataPoint[] = [];
    let accumulatedDLIp = 0;

    // Sort time groups by timestamp
    const sortedTimeGroups = Array.from(timeGroups.entries()).sort((a, b) =>
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    sortedTimeGroups.forEach(([timestamp, group]) => {
      const values = group.values;
      if (values.length > 0) {
        // Calculate mean PAR for this hour
        const parInstantaneous = values.reduce((a, b) => a + b, 0) / values.length;

        // Calculate DLIp increment for this hour
        // Formula: PAR (μmol/m²/s) × 3600 seconds / 1,000,000 = mol/m²/hour
        const dlipIncrement = (parInstantaneous * 3600) / 1000000;
        accumulatedDLIp += dlipIncrement;

        dataPoints.push({
          timestamp: timestamp,
          parInstantaneous: parInstantaneous,
          dlipAccumulated: accumulatedDLIp,
          deviceId: group.deviceId
        });
      }
    });

    console.log("PAR data points created:", dataPoints.length);

    // Calculate statistics
    const parValues = dataPoints.map(d => d.parInstantaneous);
    const parMax = parValues.length > 0 ? Math.max(...parValues) : 0;
    const parMean = parValues.length > 0 ? parValues.reduce((a, b) => a + b, 0) / parValues.length : 0;
    const parMin = parValues.length > 0 ? Math.min(...parValues) : 0;

    // Get time range
    const timeRange = dataPoints.length > 0 ? {
      start: dataPoints[0].timestamp,
      end: dataPoints[dataPoints.length - 1].timestamp
    } : { start: '', end: '' };

    this.parChartData = {
      dataPoints,
      dlipTotal: accumulatedDLIp,
      parMax,
      parMean,
      parMin,
      timeRange
    };

    console.log("PAR Chart Data prepared:", {
      dataPoints: this.parChartData.dataPoints.length,
      dlipTotal: this.parChartData.dlipTotal.toFixed(2),
      parMax: this.parChartData.parMax.toFixed(1),
      parMean: this.parChartData.parMean.toFixed(1),
      parMin: this.parChartData.parMin.toFixed(1)
    });
  }

  // 1.5 ADD SVG HELPER METHODS for PAR chart (after TSR helper methods, around line 550)
  getPARChartDimensions() {
    return {
      chartWidth: this.parChartConfig.width - this.parChartConfig.padding.left - this.parChartConfig.padding.right,
      chartHeight: this.parChartConfig.height - this.parChartConfig.padding.top - this.parChartConfig.padding.bottom
    };
  }

  getPARMaxValue(): number {
    if (this.parChartData.dataPoints.length === 0) return 2000;
    return Math.max(...this.parChartData.dataPoints.map(d => d.parInstantaneous)) * 1.1;
  }

  getDLIpMaxValue(): number {
    if (this.parChartData.dataPoints.length === 0) return 60;
    return Math.max(...this.parChartData.dataPoints.map(d => d.dlipAccumulated)) * 1.1;
  }

  getPARXScale(index: number): number {
    const { chartWidth } = this.getPARChartDimensions();
    const length = this.parChartData.dataPoints.length;
    if (length <= 1) return 0;
    return (index / (length - 1)) * chartWidth;
  }

  getPARYScale(value: number): number {
    const { chartHeight } = this.getPARChartDimensions();
    const maxValue = this.getPARMaxValue();
    return chartHeight - (value / maxValue) * chartHeight;
  }

  getDLIpYScale(value: number): number {
    const { chartHeight } = this.getPARChartDimensions();
    const maxValue = this.getDLIpMaxValue();
    return chartHeight - (value / maxValue) * chartHeight;
  }

  // Generate SVG path for PAR area chart
  generatePARAreaPath(): string {
    if (this.parChartData.dataPoints.length === 0) return '';

    const { chartWidth, chartHeight } = this.getPARChartDimensions();
    const pad = this.parChartConfig.padding;
    const points = this.parChartData.dataPoints.map((d, i) => ({
      x: this.getPARXScale(i),
      y: this.getPARYScale(d.parInstantaneous)
    }));

    let path = `M ${pad.left} ${pad.top + chartHeight} `;
    path += `L ${pad.left + points[0].x} ${pad.top + points[0].y} `;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      const cpx = (prevPoint.x + currPoint.x) / 2;

      path += `Q ${pad.left + cpx} ${pad.top + prevPoint.y}, `;
      path += `${pad.left + currPoint.x} ${pad.top + currPoint.y} `;
    }

    path += `L ${pad.left + points[points.length - 1].x} ${pad.top + chartHeight} Z`;

    return path;
  }

  // Generate SVG path for PAR line
  generatePARLinePath(): string {
    if (this.parChartData.dataPoints.length === 0) return '';

    const pad = this.parChartConfig.padding;
    const points = this.parChartData.dataPoints.map((d, i) => ({
      x: this.getPARXScale(i),
      y: this.getPARYScale(d.parInstantaneous)
    }));

    let path = `M ${pad.left + points[0].x} ${pad.top + points[0].y} `;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      const cpx = (prevPoint.x + currPoint.x) / 2;

      path += `Q ${pad.left + cpx} ${pad.top + prevPoint.y}, `;
      path += `${pad.left + currPoint.x} ${pad.top + currPoint.y} `;
    }

    return path;
  }

  // Generate SVG path for DLIp line
  generateDLIpLinePath(): string {
    if (this.parChartData.dataPoints.length === 0) return '';

    const pad = this.parChartConfig.padding;
    const points = this.parChartData.dataPoints.map((d, i) => ({
      x: this.getPARXScale(i),
      y: this.getDLIpYScale(d.dlipAccumulated)
    }));

    let path = `M ${pad.left + points[0].x} ${pad.top + points[0].y} `;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      const cpx = (prevPoint.x + currPoint.x) / 2;

      path += `Q ${pad.left + cpx} ${pad.top + prevPoint.y}, `;
      path += `${pad.left + currPoint.x} ${pad.top + currPoint.y} `;
    }

    return path;
  }

  // Get grid lines for PAR Y-axis (left)
  getPARGridLines(): { y: number; label: string }[] {
    const { chartHeight } = this.getPARChartDimensions();
    const maxValue = this.getPARMaxValue();
    const pad = this.parChartConfig.padding;

    return [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
      y: pad.top + chartHeight * ratio,
      label: Math.round(maxValue * (1 - ratio)).toString()
    }));
  }

  // Get grid labels for DLIp Y-axis (right)
  getDLIpGridLines(): { y: number; label: string }[] {
    const { chartHeight } = this.getPARChartDimensions();
    const maxValue = this.getDLIpMaxValue();
    const pad = this.parChartConfig.padding;

    return [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
      y: pad.top + chartHeight * ratio,
      label: (maxValue * (1 - ratio)).toFixed(1)
    }));
  }

  // Get X-axis labels (show every 4th point)
  getPARXAxisLabels(): { x: number; label: string }[] {
    return this.parChartData.dataPoints
      .filter((_, i) => i % 4 === 0)
      .map((d, i) => {
        const index = i * 4;
        const date = new Date(d.timestamp);
        return {
          x: this.parChartConfig.padding.left + this.getPARXScale(index),
          label: date.getHours().toString().padStart(2, '0') + ':00'
        };
      });
  }

  // Format time for PAR tooltip
  formatPARTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }

  // Format date for PAR tooltip
  formatPARDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-CR', { month: 'short', day: 'numeric' });
  }

  // Handle PAR chart hover
  onPARChartHover(event: MouseEvent): void {
    const svg = event.currentTarget as SVGElement;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left - this.parChartConfig.padding.left;
    const { chartWidth } = this.getPARChartDimensions();

    const index = Math.round((x / chartWidth) * (this.parChartData.dataPoints.length - 1));

    if (index >= 0 && index < this.parChartData.dataPoints.length) {
      this.hoveredPARPoint = this.parChartData.dataPoints[index];
      this.hoveredPARIndex = index;
    }
  }

  onPARChartLeave(): void {
    this.hoveredPARPoint = null;
    this.hoveredPARIndex = -1;
  }

  getPARTooltipX(): number {
    if (this.hoveredPARIndex < 0) return 0;
    const x = this.parChartConfig.padding.left + this.getPARXScale(this.hoveredPARIndex);
    const { chartWidth } = this.getPARChartDimensions();
    return x > chartWidth / 2 ? x - 210 : x + 10;
  }

  getPARTooltipY(): number {
    return this.parChartConfig.padding.top + 20;
  }

  // Track by function for PAR
  trackByPARIndex(index: number, item: any): number {
    return index;
  }

  // Toggle methods for collapsible sections
  toggleHistoricalCharts(): void {
    this.isChartsCollapsed = !this.isChartsCollapsed;
  }

  toggleWindRose(): void {
    this.isWindRoseCollapsed = !this.isWindRoseCollapsed;
  }

  toggleThermostat(): void {
    this.isThermostatCollapsed = !this.isThermostatCollapsed;
  }

  toggleTSRChart(): void {
    this.isTSRChartCollapsed = !this.isTSRChartCollapsed;
  }

  togglePARChart(): void {
    this.isPARChartCollapsed = !this.isPARChartCollapsed;
  }

  toggleFlowDevices(): void {
    this.isFlowDevicesCollapsed = !this.isFlowDevicesCollapsed;
  }

  toggleSoilDevices(): void {
    this.isSoilDevicesCollapsed = !this.isSoilDevicesCollapsed;
  }

  togglePhDevices(): void {
    this.isPhDevicesCollapsed = !this.isPhDevicesCollapsed;
  }

  togglePressureDevices(): void {
    this.isPressureDevicesCollapsed = !this.isPressureDevicesCollapsed;
  }

  toggleClimateDevices(): void {
    this.isClimateDevicesCollapsed = !this.isClimateDevicesCollapsed;
  }

}