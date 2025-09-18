import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import {
  IrrigationSectorService,
  ProcessedDeviceData
} from '../../services/irrigation-sector.service';

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
  processedData: ProcessedDeviceData[] = [];
  isLoading = true;
  error: string | null = null;
  showCharts = false;
  selectedChartType = 'flow';

  // Chart instances for cleanup
  private chartInstances: { [key: string]: Chart } = {};

  // Grouped data for display
  flowDevices: DeviceData[] = [];
  soilDevices: DeviceData[] = [];
  climateDevices: DeviceData[] = [];
  pressureDevices: DeviceData[] = [];
  phDevices: DeviceData[] = [];

  // Historical data for charts
  historicalData: { [key: string]: HistoricalData[] } = {};
  
  // Chart data
  chartData: { [key: string]: { [sensor: string]: ChartData } } = {};

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

  constructor(private irrigationService: IrrigationSectorService) {}

  ngOnInit(): void {
    this.loadDeviceData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  ngOnDestroy(): void {
    // Clean up chart instances
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  loadDeviceData(): void {
    this.isLoading = true;
    this.irrigationService.getDeviceRawData().subscribe({
      next: (data: any[]) => {
        console.log('Raw device data loaded:', data);
        this.rawData = data;
        this.processRawData();
        this.processHistoricalData();
        this.isLoading = false;
        
        // Initialize charts after data is processed and view is ready
        if (this.showCharts) {
          setTimeout(() => this.initializeCharts(), 100);
        }
      },
      error: (error) => {
        this.error = 'Failed to load device data';
        this.isLoading = false;
        console.error('Error loading device data:', error);
      }
    });
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
    // Group by device type
    this.flowDevices = this.groupByDeviceType('flujo');
    this.soilDevices = this.groupByDeviceType('suelo');
    this.climateDevices = this.groupByDeviceType('estacion-metereologica');
    this.pressureDevices = this.groupByDeviceType('presion');
    this.phDevices = this.groupByDeviceType('ph-suelo');
  }

  groupByDeviceType(deviceType: string): DeviceData[] {
    const devices = this.rawData.filter(item => 
      item.deviceId.includes(deviceType)
    );

    // Group by specific device ID
    const deviceGroups: { [key: string]: DeviceData } = {};

    devices.forEach(item => {
      if (!deviceGroups[item.deviceId]) {
        deviceGroups[item.deviceId] = {
          deviceId: item.deviceId,
          lastUpdate: item.recordDate,
          readings: {}
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

    return Object.values(deviceGroups);
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
            // Get the most recent 20 readings for charting
            const recentValues = sensorData.values.slice(-20);
            
            // Create unique timestamps
            const uniqueTimestamps = [...new Set(recentValues.map(v => v.timestamp))];
            const labels = uniqueTimestamps.map(timestamp => 
              new Date(timestamp).toLocaleTimeString()
            );

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
                    text: 'Time'
                  }
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: this.getSensorUnit(chartType) || 'Value'
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

  // Existing methods with some modifications...
  
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
    return new Date(dateString).toLocaleString();
  }

  getDeviceStatus(device: DeviceData): string {
    const lastUpdate = new Date(device.lastUpdate);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    if (diffMinutes > 30) return 'offline';
    if (diffMinutes > 5) return 'warning';
    return 'online';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'online': return 'status-online';
      case 'warning': return 'status-warning';
      case 'offline': return 'status-offline';
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

  getChartTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'flow': 'Flow Meters',
      'ph': 'pH Sensors', 
      'climate': 'Climate Station',
      'pressure': 'Pressure Sensors',
      'soil': 'Soil Sensors'
    };
    return labels[type] || type;
  }

  getAvailableChartTypes(): string[] {
    return Object.keys(this.chartData);
  }

  getChartsForType(type: string): string[] {
    return this.chartData[type] ? Object.keys(this.chartData[type]) : [];
  }

  getDeviceTypeSummary(devices: DeviceData[]): { online: number; warning: number; offline: number } {
    const summary = { online: 0, warning: 0, offline: 0 };
    devices.forEach(device => {
      const status = this.getDeviceStatus(device);
      summary[status as keyof typeof summary]++;
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

  getDataTimeRange(): string {
    if (this.rawData.length === 0) return 'No data';
    
    const dates = this.rawData.map(item => new Date(item.recordDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const diffMinutes = (maxDate.getTime() - minDate.getTime()) / (1000 * 60);
    
    if (diffMinutes < 60) {
      return `${diffMinutes.toFixed(0)} minutes`;
    } else if (diffMinutes < 1440) {
      return `${(diffMinutes / 60).toFixed(1)} hours`;
    } else {
      return `${(diffMinutes / 1440).toFixed(1)} days`;
    }
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
}