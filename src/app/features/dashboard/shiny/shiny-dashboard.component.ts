import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import {
  IrrigationSectorService,
  ProcessedDeviceData
} from '../../services/irrigation-sector.service';
import * as Plotly from 'plotly.js-dist-min';
import { DeviceService } from '../../devices/services/device.service';

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

  // Chart instances for cleanup
  private chartInstances: { [key: string]: Chart } = {};

  // Grouped data for display (now includes inactive devices)
  flowDevices: DeviceData[] = [];
  soilDevices: DeviceData[] = [];
  climateDevices: DeviceData[] = [];
  pressureDevices: DeviceData[] = [];
  phDevices: DeviceData[] = [];

  // Historical data for charts
  historicalData: { [key: string]: HistoricalData[] } = {};

  // Chart data
  chartData: { [key: string]: { [sensor: string]: ChartData } } = {};

  // Device activity tracking
  activeDeviceIds: Set<string> = new Set();
  inactiveDevices: DeviceData[] = [];
  windDataLoaded = false;
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

    // Clean up Plotly chart
    if (this.windRoseChartInstance) {
      const chartElement = document.getElementById('windRoseChart');
      if (chartElement) {
        Plotly.purge('windRoseChart');
      }
    }
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
      if (!this.windDataLoaded) {
        this.createWindRoseChart();
      }

      // Track which devices are sending data
      this.activeDeviceIds = new Set(rawData?.map(item => item.deviceId));

      this.processRawData();
      this.processHistoricalData();
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


 // Add this method to prepare wind rose data
  prepareWindRoseData(): void {
    const windData: { direction: number; speed: number }[] = [];

    console.log("rawData for wind rose: ", this.rawData);
    const windRawData = this.rawData.filter(item =>
      item.sensor === 'wind_speed' ||
      item.sensor === 'wind_speed_level' ||
      item.sensor === 'wind_direction_angle'
    );
    console.log("Filtered wind raw data count: ", windRawData.length);
    
    // Create an efficient lookup map grouped by deviceId and recordDate
    const dataMap = new Map<string, Map<string, RawDeviceData>>();
    
     windRawData.forEach(item => {
      const key = `${item.deviceId}_${item.recordDate}`;
      if (!dataMap.has(key)) {
        dataMap.set(key, new Map());
      }
      dataMap.get(key)!.set(item.sensor, item);
    });

    console.log("dataMap size: ", dataMap.size);
    console.log("dataMap sample: ", Array.from(dataMap.entries()).slice(0,5));
    // Process each unique deviceId + recordDate combination
    dataMap.forEach((sensors, key) => {
      let windSpeed = 0;
      let windDirection = 0;

      // Try to get wind_speed (m/s) - primary data source
      const speedReading = sensors.get('wind_speed');
      console.log("speedReading: ", speedReading);

      // If wind_speed is missing or zero, fall back to wind_speed_level
      if (!speedReading || !speedReading.payload || parseFloat(speedReading.payload) === 0) {
        const levelReading = sensors.get('wind_speed_level');
        windSpeed = parseFloat(levelReading?.payload ?? '') || 0;
      } else {
        windSpeed = parseFloat(speedReading.payload) || 0;
      }

      // Get wind direction
      const directionReading = sensors.get('wind_direction_angle');
      console.log("directionReading: ", directionReading);
      windDirection = parseFloat(directionReading?.payload ?? '') || 0;

      // Only add valid data points
      if (windSpeed > 0 && windDirection >= 0 && windDirection <= 360) {
        windData.push({
          direction: windDirection,
          speed: windSpeed
        });
      }
    });

    console.log("Valid wind data points: ", windData.length);
    this.windRoseData = this.aggregateWindRoseData(windData);
    this.windDataLoaded = true;
  }

  // Aggregate wind data into directional bins
  private aggregateWindRoseData(windData: { direction: number; speed: number }[]): any[] {
    console.log("windData: ", windData)
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const directionAngles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5,
      180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];

    // Speed categories (Beaufort scale in m/s)
    const speedRanges = [
      { label: '0-2 m/s (Calm)', min: 0, max: 2, color: '#4ecdc4' },
      { label: '2-5 m/s (Light)', min: 2, max: 5, color: '#45b7d1' },
      { label: '5-8 m/s (Moderate)', min: 5, max: 8, color: '#f7b731' },
      { label: '8-11 m/s (Fresh)', min: 8, max: 11, color: '#fd9644' },
      { label: '>11 m/s (Strong)', min: 11, max: Infinity, color: '#e74c3c' }
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

      // Find speed range
      const speedIndex = speedRanges.findIndex(
        range => speed >= range.min && speed < range.max
      );
      if (speedIndex !== -1) {
        frequencyMatrix[closestDirIndex][speedIndex]++;
      }
    });

    // Convert to percentage
    const total = windData.length || 1;
    const percentageMatrix = frequencyMatrix.map(row =>
      row.map(count => (count / total) * 100)
    );

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

  // Create the wind rose chart
  createWindRoseChart(): void {
    this.prepareWindRoseData();

    const chartElement = document.getElementById('windRoseChart');
    if (!chartElement) return;

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: 'Rosa de Vientos',
        font: { size: 18, color: '#2c3e50' }
      },
      polar: {
        radialaxis: {
          title: { text: 'Frecuencia (%)' },
          angle: 90,
          ticksuffix: '%'
        },
        angularaxis: {
          direction: 'clockwise',
          rotation: 90
        }
      },
      bargap: 0,
      legend: {
        orientation: 'v',
        x: 1.1,
        y: 0.5,
        font: { size: 11 }
      },
      showlegend: true,
      hovermode: 'closest',
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      margin: { t: 80, b: 60, l: 60, r: 180 }
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      // modeBarButtonsToRemove expects a narrow union type in the typings;
      // cast to any to avoid the string[] -> ModeBarDefaultButtons[] type error
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'] as any
    };

    // Create or update the chart
    if (this.windRoseChartInstance) {
      Plotly.react('windRoseChart', this.windRoseData, layout, config);
    } else {
      Plotly.newPlot('windRoseChart', this.windRoseData, layout, config);
      this.windRoseChartInstance = true;
    }
  }
}