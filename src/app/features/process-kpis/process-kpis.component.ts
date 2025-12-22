// src/app/features/dashboard/process-kpis/process-kpis.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart } from 'chart.js';

// Services
import { KPIOrchestatorService, DailyKPIOutput, KPICalculationInput } from '../services/calculations/kpi-orchestrator.service';
import { CropService } from '../crops/services/crop.service';
import { DeviceService } from '../devices/services/device.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
import { KpiAggregatorService } from './services/kpi-aggregator.service';
import { GrowthStageCalculatorService } from './services/growth-stage-calculator.service';

// Models
import {
  AggregationDataset,
  AggregationChartConfig
} from './models/aggregation.models';

@Component({
  selector: 'app-process-kpis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './process-kpis.component.html',
  styleUrls: ['./process-kpis.component.css']
})
export class ProcessKPIsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Form
  filterForm!: FormGroup;

  // Data
  cropProductions: any[] = [];
  devices: any[] = [];
  kpiData: DailyKPIOutput[] = [];
  selectedDayKPI: DailyKPIOutput | null = null;

  // UI State
  isLoading = false;
  isCalculating = false;
  error: string | null = null;
  showDetailModal = false;
  activeTab: 'overview' | 'climate' | 'irrigation' | 'crop' | 'events' | 'planning' | 'aggregation' = 'overview';

  // Aggregation properties
  weeklyAggregation: AggregationDataset | null = null;
  stageAggregation: AggregationDataset | null = null;
  aggregationChartConfig!: AggregationChartConfig;
  currentAggregationView: 'weekly' | 'stage' = 'weekly';
  plantingDate: Date = new Date();

  // Chart references
  @ViewChild('weeklyChart', { static: false }) weeklyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stageChart', { static: false }) stageChartCanvas!: ElementRef<HTMLCanvasElement>;
  private weeklyChart: Chart | null = null;
  private stageChart: Chart | null = null;

  // Demo data for event detection and planning
  demoIrrigationEvents: any[] = [];
  demoIrrigationPlan: any = null;

  // Helper properties for templates (Angular doesn't allow 'new Date()' directly in templates)
  get currentDate(): Date {
    return new Date();
  }

  // Helper to expose Math for templates
  Math = Math;

  // Helper to format time from minutes
  formatTimeFromMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins < 10 ? '0' + mins : mins}`;
  }

  // Helper to get a Date object for day index (0=Monday in 2025-01-06 week)
  getDayDate(dayIndex: number): Date {
    // January 6, 2025 is a Monday
    return new Date(2025, 0, 6 + dayIndex);
  }


  constructor(
    private fb: FormBuilder,
    private kpiOrchestrator: KPIOrchestatorService,
    private cropService: CropService,
    private deviceService: DeviceService,
    private irrigationService: IrrigationSectorService,
    private kpiAggregator: KpiAggregatorService,
    private growthStageService: GrowthStageCalculatorService
  ) {
    this.initializeForm();
    this.aggregationChartConfig = this.kpiAggregator.getDefaultChartConfig();
  }

  goToDashboard(): void {
    window.location.href = '/dashboard';
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.generateDemoData();
  }

  // ============================================================================
  // DEMO DATA GENERATION FOR NEW FUNCTIONS
  // ============================================================================

  private generateDemoData(): void {
    // Generate demo pressure readings for irrigation event detection
    const demoPressureReadings = this.generateDemoPressureData();

    // Detect irrigation events using the new function
    this.demoIrrigationEvents = this.getCropProductionIrrigationEvents(
      1, // cropProductionId
      demoPressureReadings,
      0.5 // deltaPressureThreshold
    );

    // Generate demo irrigation plan
    this.demoIrrigationPlan = {
      daysMask: 127, // All days enabled (binary: 1111111)
      entries: [
        {
          active: true,
          duration: 30,
          startTime: 360, // 6:00 AM
          windowStart: null,
          windowEnd: null,
          repeatInterval: null
        },
        {
          active: true,
          duration: 20,
          startTime: null,
          windowStart: 480, // 8:00 AM
          windowEnd: 1080, // 6:00 PM
          repeatInterval: 120 // Every 2 hours
        }
      ]
    };

    console.log('Demo irrigation events detected:', this.demoIrrigationEvents);
    console.log('Demo irrigation plan:', this.demoIrrigationPlan);
  }

  private generateDemoPressureData(): Array<{ sensorId: number; recordDate: Date; recordValue: number }> {
    const readings: Array<{ sensorId: number; recordDate: Date; recordValue: number }> = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    // Simulate 3 irrigation events throughout the day
    const events = [
      { start: 6 * 60, duration: 30, basePressure: 2.0, maxPressure: 3.5 },   // 6:00 AM
      { start: 12 * 60, duration: 25, basePressure: 1.9, maxPressure: 3.6 },  // 12:00 PM
      { start: 18 * 60, duration: 35, basePressure: 2.1, maxPressure: 3.7 }   // 6:00 PM
    ];

    let currentMinute = 0;
    const sensorId = 1;

    for (const event of events) {
      // Before irrigation (low pressure)
      while (currentMinute < event.start) {
        const reading = {
          sensorId: sensorId,
          recordDate: new Date(baseDate.getTime() + currentMinute * 60 * 1000),
          recordValue: event.basePressure + (Math.random() * 0.1 - 0.05)
        };
        readings.push(reading);
        currentMinute += 5; // Reading every 5 minutes
      }

      // Pressure increase at start
      readings.push({
        sensorId: sensorId,
        recordDate: new Date(baseDate.getTime() + currentMinute * 60 * 1000),
        recordValue: event.maxPressure
      });
      currentMinute += 1;

      // During irrigation (high pressure)
      const endMinute = event.start + event.duration;
      while (currentMinute < endMinute) {
        readings.push({
          sensorId: sensorId,
          recordDate: new Date(baseDate.getTime() + currentMinute * 60 * 1000),
          recordValue: event.maxPressure + (Math.random() * 0.2 - 0.1)
        });
        currentMinute += 5;
      }

      // Pressure drop at end
      readings.push({
        sensorId: sensorId,
        recordDate: new Date(baseDate.getTime() + currentMinute * 60 * 1000),
        recordValue: event.basePressure
      });
      currentMinute += 1;
    }

    return readings;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeForm(): void {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.filterForm = this.fb.group({
      cropProductionId: [null, Validators.required],
      startDate: [sevenDaysAgo.toISOString().split('T')[0], Validators.required],
      endDate: [today.toISOString().split('T')[0], Validators.required],
      deviceIds: [[]]
    });
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;

    try {
      const [cropProductions, devices] = await Promise.all([
        firstValueFrom(this.cropService.getAll()),
        firstValueFrom(this.deviceService.getAll())
      ]);

      console.log('Loaded Crop Productions:', cropProductions);
      console.log('Loaded Devices:', devices);

      // Ensure we always assign arrays
      this.cropProductions = Array.isArray(cropProductions) ? cropProductions : [];
      this.devices = Array.isArray(devices) ? devices : [];

      // Auto-select first crop production if available
      if (this.cropProductions.length > 0) {
        this.filterForm.patchValue({
          cropProductionId: this.cropProductions[0].id
        });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.error = 'Error al cargar datos iniciales';
      this.cropProductions = [];
      this.devices = [];
    } finally {
      this.isLoading = false;
    }
  }

  // ============================================================================
  // KPI CALCULATION
  // ============================================================================

  async calculateKPIs(): Promise<void> {
    if (this.filterForm.invalid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.isCalculating = true;
    this.error = null;
    this.kpiData = [];

    try {
      const formValue = this.filterForm.value;
      const input: KPICalculationInput = {
        cropProductionId: formValue.cropProductionId,
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        deviceIds: formValue.deviceIds && formValue.deviceIds.length > 0
          ? formValue.deviceIds
          : undefined
      };

      console.log('Calculating KPIs with input:', input);

      this.kpiData = await this.kpiOrchestrator.calculateKPIs(input);
      console.log('Calculated KPI Data:', this.kpiData);
      
      if (this.kpiData.length === 0) {
        this.error = 'No se encontraron datos para el período seleccionado';
      } else {
        // Calculate aggregations after KPIs are loaded
        this.calculateAggregations();
      }

    } catch (error: any) {
      console.error('Error calculating KPIs:', error);
      this.error = error.message || 'Error al calcular KPIs';
    } finally {
      this.isCalculating = false;
    }
  }

  // ============================================================================
  // UI INTERACTIONS
  // ============================================================================

  setActiveTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  exportDayToJSON(kpi: DailyKPIOutput): void {
    const dataStr = JSON.stringify(kpi, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi-day-${kpi.date.toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  viewDayDetails(kpi: DailyKPIOutput): void {
    this.selectedDayKPI = kpi;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDayKPI = null;
  }

  exportToCSV(): void {
    if (this.kpiData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = [
      'Date',
      'Reference ET (mm/day)',
      'VPD (kPa)',
      'Degrees Day',
      'Net Radiation (MJ/m²/day)',
      'Irrigation Volume (L)',
      'Crop ET (mm/day)',
      'Area (m²)',
      'Plant Density (plants/m²)',
      'Total Plants'
    ];

    const rows = this.kpiData.map(kpi => [
      kpi.date.toISOString().split('T')[0],
      kpi.climate.referenceET.toFixed(2),
      kpi.climate.vaporPressureDeficit.toFixed(2),
      kpi.climate.degreesDay.toFixed(2),
      kpi.climate.netRadiation.toFixed(2),
      kpi.irrigation.totalVolume.toFixed(2),
      kpi.cropEvapoTranspiration?.toFixed(2) || 'N/A',
      kpi.crop.area.toFixed(2),
      kpi.crop.densityPlant.toFixed(2),
      kpi.crop.totalPlants.toFixed(0)
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  getAverageET(): number {
    if (this.kpiData.length === 0) return 0;
    const sum = this.kpiData.reduce((acc, kpi) => acc + kpi.climate.referenceET, 0);
    return sum / this.kpiData.length;
  }

  getAverageVPD(): number {
    if (this.kpiData.length === 0) return 0;
    const sum = this.kpiData.reduce((acc, kpi) => acc + kpi.climate.vaporPressureDeficit, 0);
    return sum / this.kpiData.length;
  }

  getTotalDegreesDay(): number {
    return this.kpiData.reduce((acc, kpi) => acc + kpi.climate.degreesDay, 0);
  }

  getTotalIrrigationVolume(): number {
    return this.kpiData.reduce((acc, kpi) => acc + kpi.irrigation.totalVolume, 0);
  }

  // BATCH 3: Irrigation Statistics Helper Methods
  // ============================================================================

  /**
   * Get total number of irrigation events across all days
   */
  getTotalIrrigationEvents(): number {
    return this.kpiData.reduce((acc, kpi) => acc + kpi.irrigation.metrics.length, 0);
  }

  /**
   * Get number of days with irrigation
   */
  getDaysWithIrrigation(): number {
    return this.kpiData.filter(kpi => kpi.irrigation.metrics.length > 0).length;
  }

  /**
   * Get average volume PER EVENT (not per day)
   */
  getAverageIrrigationVolume(): number {
    const totalEvents = this.getTotalIrrigationEvents();
    if (totalEvents === 0) return 0;

    const totalVolume = this.getTotalIrrigationVolume();
    return totalVolume / totalEvents;
  }

  /**
   * Get minimum volume PER EVENT across all events
   */
  getMinIrrigationVolume(): number {
    const allEventVolumes: number[] = [];
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        allEventVolumes.push(metric.irrigationVolumenTotal.value);
      });
    });
    return allEventVolumes.length > 0 ? Math.min(...allEventVolumes) : 0;
  }

  /**
   * Get maximum volume PER EVENT across all events
   */
  getMaxIrrigationVolume(): number {
    const allEventVolumes: number[] = [];
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        allEventVolumes.push(metric.irrigationVolumenTotal.value);
      });
    });
    return allEventVolumes.length > 0 ? Math.max(...allEventVolumes) : 0;
  }

  getTotalDuration(): number {
    const milliseconds = this.kpiData.reduce((sum, kpi) => sum + kpi.irrigation.totalDuration, 0);
    return milliseconds / (1000 * 60); // Convert milliseconds to minutes
  }

  getAverageDuration(): number {
    // Get durations from ALL individual events, not days
    const allEventDurations: number[] = [];
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        const durationMinutes = metric.irrigationLength / (1000 * 60); // Convert ms to minutes
        allEventDurations.push(durationMinutes);
      });
    });

    if (allEventDurations.length === 0) return 0;
    const stats = this.getIrrigationLengthStats(allEventDurations);
    return stats.avg;
  }

  getMinDuration(): number {
    // Get durations from ALL individual events, not days
    const allEventDurations: number[] = [];
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        const durationMinutes = metric.irrigationLength / (1000 * 60); // Convert ms to minutes
        allEventDurations.push(durationMinutes);
      });
    });

    if (allEventDurations.length === 0) return 0;
    const stats = this.getIrrigationLengthStats(allEventDurations);
    return stats.min;
  }

  getMaxDuration(): number {
    // Get durations from ALL individual events, not days
    const allEventDurations: number[] = [];
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        const durationMinutes = metric.irrigationLength / (1000 * 60); // Convert ms to minutes
        allEventDurations.push(durationMinutes);
      });
    });

    if (allEventDurations.length === 0) return 0;
    const stats = this.getIrrigationLengthStats(allEventDurations);
    return stats.max;
  }

  getAverageInterval(): number {
    // Calculate intervals between ALL individual irrigation events across all days
    const allEvents: { date: Date; metrics: any[] }[] = [];

    // Flatten all events from all days
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        allEvents.push({ date: metric.date, metrics: kpi.irrigation.metrics });
      });
    });

    // Sort events by date
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    const intervals: number[] = [];
    for (let i = 1; i < allEvents.length; i++) {
      const timeDiff = allEvents[i].date.getTime() - allEvents[i - 1].date.getTime();
      intervals.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
    }

    if (intervals.length === 0) return 0;
    const stats = this.getIrrigationIntervalStats(intervals);
    return stats.avg;
  }

  getMinInterval(): number {
    // Calculate intervals between ALL individual irrigation events across all days
    const allEvents: { date: Date; metrics: any[] }[] = [];

    // Flatten all events from all days
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        allEvents.push({ date: metric.date, metrics: kpi.irrigation.metrics });
      });
    });

    // Sort events by date
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    const intervals: number[] = [];
    for (let i = 1; i < allEvents.length; i++) {
      const timeDiff = allEvents[i].date.getTime() - allEvents[i - 1].date.getTime();
      intervals.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
    }

    if (intervals.length === 0) return 0;
    const stats = this.getIrrigationIntervalStats(intervals);
    return stats.min;
  }

  getMaxInterval(): number {
    // Calculate intervals between ALL individual irrigation events across all days
    const allEvents: { date: Date; metrics: any[] }[] = [];

    // Flatten all events from all days
    this.kpiData.forEach(kpi => {
      kpi.irrigation.metrics.forEach(metric => {
        allEvents.push({ date: metric.date, metrics: kpi.irrigation.metrics });
      });
    });

    // Sort events by date
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    const intervals: number[] = [];
    for (let i = 1; i < allEvents.length; i++) {
      const timeDiff = allEvents[i].date.getTime() - allEvents[i - 1].date.getTime();
      intervals.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
    }

    if (intervals.length === 0) return 0;
    const stats = this.getIrrigationIntervalStats(intervals);
    return stats.max;
  }

  // Helper method to display days in year (uses getNDays internally)
  getDaysInYear(date: Date | string): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return this.getNDays(dateObj);
  }

  // ============================================================================
  // IMPLEMENTED CALCULUS FUNCTIONS - BATCH 1 (14 functions)
  // These functions are now integrated into KPI calculations and displayed in tabs
  // ============================================================================

  // CONTAINER FUNCTIONS (1/1) - BATCH 1
  // ============================================================================

  /**
   * Calculates container volume based on container type (conical, cubic, or cylinder)
   * @param containerType - Type of container (1=conical, 2=cylinder, 3=cubic)
   * @param height - Height in cm
   * @param width - Width in cm
   * @param length - Length in cm
   * @param lowerDiameter - Lower diameter in cm (for conical)
   * @param upperDiameter - Upper diameter in cm (for conical/cylinder)
   * @param measureType - Volume measure type (0=none, 1=litre, 2=cubic metre)
   * @returns Volume in specified units
   */
  getVolume(
    containerType: number,
    height: number,
    width: number,
    length: number,
    lowerDiameter: number,
    upperDiameter: number,
    measureType: number = 1
  ): { value: number; volumeMeasureType: number } {
    let value = 0;

    switch (containerType) {
      case 1: // Conical container
        const lowerArea = Math.pow(lowerDiameter, 2) * Math.PI;
        const upperArea = Math.pow(upperDiameter, 2) * Math.PI;
        value = (1 / 3) * (lowerArea + upperArea + Math.sqrt(lowerArea * upperArea)) * height;
        break;
      case 3: // Cubic container
        value = height * length * width;
        break;
      case 2: // Cylinder container
        value = Math.PI * Math.pow(upperDiameter / 2, 2) * height;
        break;
    }

    return {
      value: this.convertVolume(value, measureType),
      volumeMeasureType: measureType
    };
  }

  /**
   * BATCH 2: Converts volume value based on measurement type (now public)
   * @param value - Volume value in cm³
   * @param measureType - Conversion type (0=none, 1=litre, 2=cubic metre)
   * @returns Converted volume
   */
  convertVolume(value: number, measureType: number): number {
    switch (measureType) {
      case 0: return value;
      case 1: return value / 1000; // cm³ to litres
      case 2: return value / 1000000; // cm³ to cubic metres
      default: return 0;
    }
  }
  
  // Helper methods for template usage (avoids arrow functions in templates which Angular disallows)
  getWeeklyTotalEvents(weeklyAggregation: any): number {
    if (!weeklyAggregation || !Array.isArray(weeklyAggregation.periods)) {
      return 0;
    }
    return weeklyAggregation.periods.reduce((acc: number, p: any) => acc + (p?.irrigation?.numberOfEvents || 0), 0);
  }

  getWeeklyTotalDays(weeklyAggregation: any): number {
    if (!weeklyAggregation || !Array.isArray(weeklyAggregation.periods)) {
      return 0;
    }
    return weeklyAggregation.periods.reduce((acc: number, p: any) => acc + (p?.daysInPeriod || 0), 0);
  }

  // CROP PRODUCTION FUNCTIONS (7/7) - BATCH 1: 4, BATCH 2: 3
  // ============================================================================

  /**
   * BATCH 1: Calculates crop production area by multiplying length and width
   * @param length - Length in meters
   * @param width - Width in meters
   * @returns Area in square meters
   */
  getArea(length: number, width: number): number {
    return length * width;
  }

  /**
   * BATCH 1: Calculates plant density based on row and plant distances
   * @param betweenRowDistance - Distance between rows in meters
   * @param betweenPlantDistance - Distance between plants in meters
   * @returns Plant density (plants per square meter)
   */
  getDensityPlant(betweenRowDistance: number, betweenPlantDistance: number): number {
    return 1 / (betweenRowDistance * betweenPlantDistance);
  }

  /**
   * BATCH 1: Calculates total number of plants using density and area
   * @param densityPlant - Plant density (plants/m²)
   * @param area - Total area in m²
   * @returns Total number of plants
   */
  getTotalPlants(densityPlant: number, area: number): number {
    return densityPlant * area;
  }

  /**
   * BATCH 1: Calculates number of rows based on width and row distance
   * @param width - Width in meters
   * @param betweenRowDistance - Distance between rows in meters
   * @returns Number of rows (rounded)
   */
  getNumberOfRows(width: number, betweenRowDistance: number): number {
    return Math.round(width / betweenRowDistance);
  }

  /**
   * BATCH 2: Returns number of plants per row
   * @param length - Row length in meters
   * @param betweenPlantDistance - Distance between plants in meters
   * @returns Number of plants per row (rounded)
   */
  getNumberOfPlantsPerRow(length: number, betweenPlantDistance: number): number {
    return Math.round(length / betweenPlantDistance);
  }

  /**
   * BATCH 2: Extracts integer degrees from latitude coordinate
   * @param latitude - Latitude in decimal degrees (e.g., 40.7128)
   * @returns Integer degrees portion
   */
  getLatitudeGrades(latitude: number): number {
    return Math.floor(Math.abs(latitude));
  }

  /**
   * BATCH 2: Extracts minutes from latitude coordinate
   * @param latitude - Latitude in decimal degrees (e.g., 40.7128)
   * @returns Minutes portion (0-60)
   */
  getLatitudeMinutes(latitude: number): number {
    const decimal = Math.abs(latitude) - Math.floor(Math.abs(latitude));
    return Math.round(decimal * 60);
  }

  // GROWING MEDIUM FUNCTIONS (3/3)
  // ============================================================================

  /**
   * Calculates total available water percentage from container capacity and wilting point
   * @param containerCapacityPercentage - Container capacity (%)
   * @param permanentWiltingPoint - Permanent wilting point (%)
   * @returns Total available water (%)
   */
  getTotalAvailableWaterPercentage(
    containerCapacityPercentage: number,
    permanentWiltingPoint: number
  ): number {
    return containerCapacityPercentage - permanentWiltingPoint;
  }

  /**
   * Calculates easily available water percentage from container capacity and 5kpa humidity
   * @param containerCapacityPercentage - Container capacity (%)
   * @param fiveKpaHumidity - Humidity at 5kPa (%)
   * @returns Easily available water (%)
   */
  getEaselyAvailableWaterPercentage(
    containerCapacityPercentage: number,
    fiveKpaHumidity: number
  ): number {
    return containerCapacityPercentage - fiveKpaHumidity;
  }

  /**
   * Calculates reserve water percentage from easily available water and wilting point
   * @param easelyAvailableWaterPercentage - Easily available water (%)
   * @param permanentWiltingPoint - Permanent wilting point (%)
   * @returns Reserve water (%)
   */
  getReserveWaterPercentage(
    easelyAvailableWaterPercentage: number,
    permanentWiltingPoint: number
  ): number {
    return easelyAvailableWaterPercentage - permanentWiltingPoint;
  }

  // CLIMATE FUNCTIONS (14/24) - BATCH 1: 4, BATCH 2: 10
  // ============================================================================

  /**
   * BATCH 1: Calculates saturation vapor pressure at given temperature using FAO-56 equation
   * @param temp - Temperature in °C
   * @returns Saturation vapor pressure in kPa
   */
  getSaturationVaporPressure(temp: number): number {
    return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  }

  /**
   * BATCH 1: Calculates real vapor pressure from temperature and relative humidity
   * @param temp - Temperature in °C
   * @param relativeHumidity - Relative humidity (%)
   * @returns Real vapor pressure in kPa
   */
  getRealVaporPressure(temp: number, relativeHumidity: number): number {
    return this.getSaturationVaporPressure(temp) * relativeHumidity / 100;
  }

  /**
   * BATCH 2: Calculates average real vapor pressure from min/max temperatures and humidities
   * @param tempMax - Maximum temperature in °C
   * @param tempMin - Minimum temperature in °C
   * @param humidityMax - Maximum relative humidity (%)
   * @param humidityMin - Minimum relative humidity (%)
   * @returns Average real vapor pressure in kPa
   */
  getAvgRealVaporPressure(tempMax: number, tempMin: number, humidityMax: number, humidityMin: number): number {
    const eaTmax = this.getRealVaporPressure(tempMax, humidityMax);
    const eaTmin = this.getRealVaporPressure(tempMin, humidityMin);
    return (eaTmax + eaTmin) / 2;
  }

  /**
   * BATCH 1: Calculates growing degree days (thermal time) above crop base temperature
   * @param tempMax - Maximum temperature in °C
   * @param tempMin - Minimum temperature in °C
   * @param cropBaseTemperature - Crop base temperature in °C
   * @returns Degree days (°C·day)
   */
  getDegreesDay(tempMax: number, tempMin: number, cropBaseTemperature: number): number {
    return (tempMax + tempMin) / 2 - cropBaseTemperature;
  }

  /**
   * BATCH 1: Returns number of days in year (365 or 366 for leap year)
   * @param date - Date to check
   * @returns Number of days in year
   */
  getNDays(date: Date): number {
    const year = date.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return isLeapYear ? 366 : 365;
  }

  /**
   * BATCH 2: Calculates Earth-Sun inverse distance for given date
   * @param date - Date to calculate for
   * @returns Inverse relative distance Earth-Sun (dimensionless)
   */
  getEarthSunInverseDistance(date: Date): number {
    const J = this.getDayOfYear(date);
    return 1 + 0.033 * Math.cos((2 * Math.PI / 365) * J);
  }

  /**
   * BATCH 2: Converts latitude from degrees/minutes to radians
   * @param latitudeGrades - Latitude degrees
   * @param latitudeMinutes - Latitude minutes
   * @returns Latitude in radians
   */
  getLatitudeInRadians(latitudeGrades: number, latitudeMinutes: number): number {
    const decimalDegrees = latitudeGrades + (latitudeMinutes / 60);
    return (Math.PI / 180) * decimalDegrees;
  }

  /**
   * BATCH 2: Calculates solar inclination (declination) for given date
   * @param date - Date to calculate for
   * @returns Solar declination in radians
   */
  getSolarInclination(date: Date): number {
    const J = this.getDayOfYear(date);
    return 0.409 * Math.sin(((2 * Math.PI / 365) * J) - 1.39);
  }

  /**
   * BATCH 2: Calculates solar sunset angle for given date and latitude
   * @param date - Date to calculate for
   * @param latitudeRadians - Latitude in radians
   * @returns Sunset hour angle in radians
   */
  getSolarSunsetAngle(date: Date, latitudeRadians: number): number {
    const solarDeclination = this.getSolarInclination(date);
    return Math.acos(-Math.tan(latitudeRadians) * Math.tan(solarDeclination));
  }

  /**
   * BATCH 2: Calculates extraterrestrial solar radiation term component
   * @param date - Date to calculate for
   * @param latitudeRadians - Latitude in radians
   * @returns Extraterrestrial radiation term
   */
  getExtraterrestrialSolarRadiationTerm(date: Date, latitudeRadians: number): number {
    const dr = this.getEarthSunInverseDistance(date);
    const delta = this.getSolarInclination(date);
    const ws = this.getSolarSunsetAngle(date, latitudeRadians);
    return ws * Math.sin(latitudeRadians) * Math.sin(delta) +
      Math.cos(latitudeRadians) * Math.cos(delta) * Math.sin(ws);
  }

  /**
   * BATCH 2: Converts wind speed to meters per second with height adjustment to 2m standard
   * @param windSpeed - Wind speed in km/h
   * @param measurementHeight - Height of measurement in meters (default: 10m)
   * @returns Wind speed at 2m height in m/s
   */
  getWindSpeedAsMtsPerSecond(windSpeed: number, measurementHeight: number = 10): number {
    // Convert km/h to m/s
    const windSpeedMs = windSpeed / 3.6;
    // Adjust to 2m standard height using logarithmic wind profile
    const windSpeed2m = windSpeedMs * (4.87 / Math.log(67.8 * measurementHeight - 5.42));
    return windSpeed2m;
  }

  /**
   * BATCH 2: Calculates slope of vapor pressure curve at air temperature
   * @param temp - Air temperature in °C
   * @returns Slope of saturation vapor pressure curve (kPa/°C)
   */
  getSlopeVaporPressureCurve(temp: number): number {
    return (4098 * this.getSaturationVaporPressure(temp)) / Math.pow(temp + 237.3, 2);
  }

  /**
   * BATCH 2: Calculates latent heat of evaporation (λ) at given temperature
   * @param temp - Temperature in °C
   * @returns Latent heat of evaporation in MJ/kg
   */
  getLatentHeatEvaporation(temp: number): number {
    return 2.501 - (0.002361 * temp);
  }

  /**
   * BATCH 2: Calculates psychrometric constant based on altitude and temperature
   * @param altitude - Altitude in meters above sea level
   * @param temp - Temperature in °C
   * @returns Psychrometric constant (kPa/°C)
   */
  getPsychrometricConstant(altitude: number, temp: number): number {
    const atmosphericPressure = 101.3 * Math.pow((293 - 0.0065 * altitude) / 293, 5.26);
    const lambda = this.getLatentHeatEvaporation(temp);
    return 0.000665 * atmosphericPressure / lambda;
  }

  // Helper function: Get day of year (1-365/366)
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // IRRIGATION FUNCTIONS (1/22)
  // ============================================================================

  /**
   * Calculates container and plant density for irrigation calculations
   * @param betweenRowDistance - Distance between rows in meters
   * @param betweenContainerDistance - Distance between containers in meters
   * @param betweenPlantDistance - Distance between plants in meters
   * @returns Object with container and plant densities
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

  // BATCH 3: CLIMATE FUNCTIONS (Already exist in service, adding for reference)
  // ============================================================================

  /**
   * BATCH 3: Calculates isothermal longwave radiation factor
   * @param tempMax - Maximum temperature in °C
   * @param tempMin - Minimum temperature in °C
   * @returns Isothermal longwave radiation factor
   */
  getIsothermalLongwaveRadiationFactor(tempMax: number, tempMin: number): number {
    const stefanBoltzmann = 0.000000004903;
    return stefanBoltzmann * ((Math.pow(tempMax + 273.16, 4) + Math.pow(tempMin + 273.16, 4)) / 2);
  }

  /**
   * BATCH 3: Calculates humidity factor for longwave radiation
   * @param realVaporPressure - Real vapor pressure in kPa
   * @returns Humidity factor
   */
  getHumidityFactor(realVaporPressure: number): number {
    return 0.34 - 0.14 * Math.sqrt(realVaporPressure);
  }

  /**
   * BATCH 3: Calculates cloud factor from relative radiation
   * @param relativeRadiation - Ratio of actual to clear sky solar radiation
   * @returns Cloud factor
   */
  getCloudFactor(relativeRadiation: number): number {
    return 1.35 * relativeRadiation - 0.35;
  }

  // BATCH 3: IRRIGATION STATISTICS FUNCTIONS
  // ============================================================================

  /**
   * BATCH 3: Calculates required irrigation time span
   * @param containerVolume - Container volume in liters
   * @param flowRate - Flow rate in L/h
   * @param availableWater - Available water percentage
   * @param drainThreshold - Drain threshold percentage
   * @returns Required irrigation time in minutes
   */
  getIrrigationSpan(
    containerVolume: number,
    flowRate: number,
    availableWater: number,
    drainThreshold: number
  ): number {
    if (flowRate <= 0) return 0;
    const volumeToApply = (containerVolume * availableWater * (1 + drainThreshold / 100)) / 100;
    return (volumeToApply / flowRate) * 60; // Convert hours to minutes
  }

  /**
   * BATCH 3: Calculates statistical metrics for irrigation intervals
   * @param intervals - Array of irrigation interval values in hours
   * @returns Object with min, max, avg, and sum statistics
   */
  getIrrigationIntervalStats(intervals: number[]): { min: number; max: number; avg: number; sum: number } {
    if (!intervals || intervals.length === 0) {
      return { min: 0, max: 0, avg: 0, sum: 0 };
    }
    const sum = intervals.reduce((a, b) => a + b, 0);
    return {
      min: Math.min(...intervals),
      max: Math.max(...intervals),
      avg: sum / intervals.length,
      sum: sum
    };
  }

  /**
   * BATCH 3: Calculates statistical metrics for irrigation duration
   * @param lengths - Array of irrigation duration values in minutes
   * @returns Object with min, max, avg, and sum statistics
   */
  getIrrigationLengthStats(lengths: number[]): { min: number; max: number; avg: number; sum: number } {
    if (!lengths || lengths.length === 0) {
      return { min: 0, max: 0, avg: 0, sum: 0 };
    }
    const sum = lengths.reduce((a, b) => a + b, 0);
    return {
      min: Math.min(...lengths),
      max: Math.max(...lengths),
      avg: sum / lengths.length,
      sum: sum
    };
  }

  /**
   * BATCH 3: Sums total irrigation volume
   * @param volumes - Array of irrigation volumes in liters
   * @returns Total volume sum
   */
  getIrrigationVolumenSum(volumes: number[]): number {
    if (!volumes || volumes.length === 0) return 0;
    return volumes.reduce((a, b) => a + b, 0);
  }

  /**
   * BATCH 3: Finds minimum irrigation volume
   * @param volumes - Array of irrigation volumes in liters
   * @returns Minimum volume
   */
  getIrrigationVolumenMin(volumes: number[]): number {
    if (!volumes || volumes.length === 0) return 0;
    return Math.min(...volumes);
  }

  /**
   * BATCH 3: Finds maximum irrigation volume
   * @param volumes - Array of irrigation volumes in liters
   * @returns Maximum volume
   */
  getIrrigationVolumenMax(volumes: number[]): number {
    if (!volumes || volumes.length === 0) return 0;
    return Math.max(...volumes);
  }

  /**
   * BATCH 3: Calculates average irrigation volume
   * @param volumes - Array of irrigation volumes in liters
   * @returns Average volume
   */
  getIrrigationVolumenAvg(volumes: number[]): number {
    if (!volumes || volumes.length === 0) return 0;
    const sum = volumes.reduce((a, b) => a + b, 0);
    return sum / volumes.length;
  }

  /**
   * BATCH 3: Finds minimum Penman-Monteith evapotranspiration
   * @param etValues - Array of ET values in mm/day
   * @returns Minimum ET value
   */
  getEvapotranspirationReferencePenmanMontiehtFAO56Min(etValues: number[]): number {
    if (!etValues || etValues.length === 0) return 0;
    return Math.min(...etValues);
  }

  /**
   * BATCH 3: Computes light integral values from radiation data
   * @param parRadiation - PAR radiation in μmol/m²/s
   * @param globalRadiation - Global radiation in W/m²
   * @returns Object with PAR and global light integrals
   */
  computeLightIntegrals(parRadiation: number, globalRadiation: number): { parIntegral: number; globalIntegral: number } {
    // Convert to daily integrals (assuming values are averages over measurement period)
    // PAR: μmol/m²/s * seconds in day / 1,000,000 = mol/m²/day
    // Global: W/m² * 3600 * 24 / 1,000,000 = MJ/m²/day
    return {
      parIntegral: (parRadiation * 86400) / 1000000, // mol/m²/day
      globalIntegral: (globalRadiation * 86.4) / 1000 // MJ/m²/day
    };
  }

  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * BATCH 3: Converts value to nullable, handling NaN
   * @param value - Value to convert
   * @returns Value or null if NaN
   */
  toNullable(value: number): number | null {
    return isNaN(value) || !isFinite(value) ? null : value;
  }

  /**
   * Generator function that yields dates in a range with specified interval
   * @param start - Start date
   * @param end - End date
   * @param intervalDays - Interval in days (default: 1)
   * @yields Date objects in the range
   */
  *dateRange(start: Date, end: Date, intervalDays: number = 1): Generator<Date> {
    const current = new Date(start);
    while (current <= end) {
      yield new Date(current);
      current.setDate(current.getDate() + intervalDays);
    }
  }

  // ============================================================================
  // BATCH 4: MISSING IRRIGATION EVENT DETECTION FUNCTIONS (2/2)
  // ============================================================================

  /**
   * Detects irrigation events from pressure sensor data by analyzing pressure deltas
   * @param cropProductionId - ID of the crop production
   * @param readings - Array of pressure sensor readings with recordDate, recordValue
   * @param deltaPressureThreshold - Threshold for pressure change to detect irrigation start/stop
   * @param initialPressureVariableId - Variable ID for initial pressure measurement
   * @param maximumPressureVariableId - Variable ID for maximum pressure measurement
   * @returns Array of detected irrigation events
   */
  getCropProductionIrrigationEvents(
    cropProductionId: number,
    readings: Array<{ sensorId: number; recordDate: Date; recordValue: number }>,
    deltaPressureThreshold: number = 0.5,
    initialPressureVariableId: number = 1,
    maximumPressureVariableId: number = 2
  ): Array<{
    id: number;
    cropProductionId: number;
    dateTimeStart: Date;
    dateTimeEnd: Date;
    recordDateTime: Date;
    irrigationEventMeasurements: Array<{ measurementVariableId: number; recordValue: number }>;
  }> {
    if (!readings || readings.length < 2) {
      return [];
    }

    const result: Array<any> = [];
    let isPumpOn = false;
    let maxPressure = 0;
    let currentEvent: any = null;

    // Sort readings by date
    const orderedReadings = [...readings].sort((a, b) =>
      a.recordDate.getTime() - b.recordDate.getTime()
    );

    for (let i = 1; i < orderedReadings.length; i++) {
      const previous = orderedReadings[i - 1].recordValue;
      const current = orderedReadings[i].recordValue;
      const delta = current - previous;

      // Detect irrigation start (pressure increase)
      if (!isPumpOn && delta >= deltaPressureThreshold) {
        currentEvent = {
          id: 0,
          cropProductionId: cropProductionId,
          dateTimeStart: orderedReadings[i].recordDate,
          dateTimeEnd: new Date(0),
          recordDateTime: orderedReadings[i].recordDate,
          irrigationEventMeasurements: [
            {
              measurementVariableId: initialPressureVariableId,
              recordValue: current
            }
          ]
        };

        isPumpOn = true;
        maxPressure = current;
        result.push(currentEvent);
      }
      // Detect irrigation end (pressure decrease)
      else if (isPumpOn && delta <= -deltaPressureThreshold && currentEvent) {
        currentEvent.dateTimeEnd = orderedReadings[i].recordDate;
        currentEvent.irrigationEventMeasurements.push({
          measurementVariableId: maximumPressureVariableId,
          recordValue: maxPressure
        });

        isPumpOn = false;
        currentEvent = null;
        maxPressure = 0;
      }

      // Track maximum pressure during irrigation
      if (isPumpOn && current > maxPressure) {
        maxPressure = current;
      }
    }

    return result;
  }

  /**
   * Calculates irrigation and drain volumes for detected events by analyzing water input and drain sensor data
   * @param irrigationEvents - Array of irrigation events
   * @param waterInputs - Water input sensor readings (flow meter, etc.)
   * @param waterDrains - Drain sensor readings
   * @param irrigationVolumeVariableId - Variable ID for irrigation volume
   * @param drainVolumeVariableId - Variable ID for drain volume
   * @param localTime - Current local time for in-progress events
   * @returns Irrigation events with calculated volumes
   */
  getIrrigationEventsVolumes(
    irrigationEvents: Array<any>,
    waterInputs: Array<{ sensorId: number; recordDate: Date; recordValue: number }>,
    waterDrains: Array<{ sensorId: number; recordDate: Date; recordValue: number }>,
    irrigationVolumeVariableId: number,
    drainVolumeVariableId: number,
    localTime: Date = new Date()
  ): Array<any> {
    const orderedEvents = [...irrigationEvents].sort((a, b) =>
      a.dateTimeStart.getTime() - b.dateTimeStart.getTime()
    );

    for (let i = 0; i < orderedEvents.length; i++) {
      const event = orderedEvents[i];
      let limitDateTime = event.dateTimeEnd;

      // For in-progress events, use current time
      if (event.dateTimeEnd.getTime() === new Date(0).getTime()) {
        limitDateTime = localTime;
      }

      // Calculate irrigation volume from water inputs
      const eventWaterInputs = waterInputs.filter(x =>
        x.recordDate >= event.dateTimeStart && x.recordDate <= limitDateTime
      );

      // Group by sensor and calculate delta for each sensor
      const irrigatedPerSensor: Record<number, number[]> = {};
      eventWaterInputs.forEach(reading => {
        if (!irrigatedPerSensor[reading.sensorId]) {
          irrigatedPerSensor[reading.sensorId] = [];
        }
        irrigatedPerSensor[reading.sensorId].push(reading.recordValue);
      });

      const sensorTotals = Object.values(irrigatedPerSensor).map(values => {
        if (values.length === 0) return 0;
        return Math.max(...values) - Math.min(...values);
      });

      const irrigationVolume = sensorTotals.length > 0
        ? sensorTotals.reduce((a, b) => a + b, 0) / sensorTotals.length
        : 0;

      event.irrigationEventMeasurements.push({
        measurementVariableId: irrigationVolumeVariableId,
        recordValue: irrigationVolume
      });

      // Calculate drain volume
      let drainLimitDateTime = localTime;
      if ((i + 1) < orderedEvents.length) {
        drainLimitDateTime = new Date(orderedEvents[i + 1].dateTimeStart.getTime() - 60000);
      }

      const eventDrains = waterDrains.filter(x =>
        x.recordDate >= event.dateTimeStart && x.recordDate <= drainLimitDateTime
      );

      const drainPerSensor: Record<number, number[]> = {};
      eventDrains.forEach(reading => {
        if (!drainPerSensor[reading.sensorId]) {
          drainPerSensor[reading.sensorId] = [];
        }
        drainPerSensor[reading.sensorId].push(reading.recordValue);
      });

      const drainTotals = Object.values(drainPerSensor).map(values => {
        if (values.length === 0) return 0;
        return Math.max(...values) - Math.min(...values);
      });

      const drainedVolume = drainTotals.length > 0
        ? drainTotals.reduce((a, b) => a + b, 0) / drainTotals.length
        : 0;

      event.irrigationEventMeasurements.push({
        measurementVariableId: drainVolumeVariableId,
        recordValue: drainedVolume
      });
    }

    return orderedEvents;
  }

  // ============================================================================
  // BATCH 4: MISSING IRRIGATION CALCULATION FUNCTIONS (11/11)
  // ============================================================================

  /**
   * Extracts measurement value from irrigation event by variable ID
   * @param event - Irrigation event object
   * @param measurementVariableId - Variable ID to extract
   * @returns Measurement value or 0 if not found
   */
  getMeasurementValue(
    event: { irrigationEventMeasurements: Array<{ measurementVariableId: number; recordValue: number }> },
    measurementVariableId: number
  ): number {
    const measurement = event.irrigationEventMeasurements.find(
      m => m.measurementVariableId === measurementVariableId
    );
    return measurement ? measurement.recordValue : 0;
  }

  /**
   * Calculates and returns irrigation interval measurement entity
   * @param currentEvent - Current irrigation event
   * @param previousEvent - Previous irrigation event
   * @param measurementVariableId - Variable ID for interval
   * @returns Irrigation measurement entity with interval in minutes
   */
  addIrrigationIntervalMeasurement(
    currentEvent: { dateTimeStart: Date },
    previousEvent: { dateTimeStart: Date } | null,
    measurementVariableId: number
  ): { measurementVariableId: number; recordValue: number } {
    if (!previousEvent) {
      return { measurementVariableId, recordValue: 0 };
    }

    const intervalMs = currentEvent.dateTimeStart.getTime() - previousEvent.dateTimeStart.getTime();
    const intervalMinutes = intervalMs / (1000 * 60);

    return { measurementVariableId, recordValue: intervalMinutes };
  }

  /**
   * Calculates and returns irrigation duration measurement entity
   * @param event - Irrigation event
   * @param measurementVariableId - Variable ID for duration
   * @returns Irrigation measurement entity with duration in minutes
   */
  addIrrigationLengthMeasurement(
    event: { dateTimeStart: Date; dateTimeEnd: Date },
    measurementVariableId: number
  ): { measurementVariableId: number; recordValue: number } {
    const durationMs = event.dateTimeEnd.getTime() - event.dateTimeStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    return { measurementVariableId, recordValue: Math.max(0, durationMinutes) };
  }

  /**
   * Calculates irrigation volumes per m2, per plant, and total
   * @param irrigationVolume - Total irrigation volume in liters
   * @param area - Area in m²
   * @param densityPlant - Plant density (plants/m²)
   * @param densityContainer - Container density (containers/m²)
   * @returns Object with volume per m2, per plant, and per container
   */
  addIrrigationVolumes(
    irrigationVolume: number,
    area: number,
    densityPlant: number,
    densityContainer: number
  ): { volumePerM2: number; volumePerPlant: number; volumePerContainer: number } {
    const volumePerM2 = area > 0 ? irrigationVolume / area : 0;
    const volumePerPlant = densityPlant > 0 ? volumePerM2 / densityPlant : 0;
    const volumePerContainer = densityContainer > 0 ? volumePerM2 / densityContainer : 0;

    return {
      volumePerM2,
      volumePerPlant,
      volumePerContainer
    };
  }

  /**
   * Calculates drain volumes per m2, per plant, and drain percentage
   * @param drainVolume - Total drain volume in liters
   * @param irrigationVolume - Total irrigation volume in liters
   * @param area - Area in m²
   * @param densityPlant - Plant density (plants/m²)
   * @param densityContainer - Container density (containers/m²)
   * @returns Object with drain volumes and percentage
   */
  addDrainVolumes(
    drainVolume: number,
    irrigationVolume: number,
    area: number,
    densityPlant: number,
    densityContainer: number
  ): { drainPerM2: number; drainPerPlant: number; drainPerContainer: number; drainPercentage: number } {
    const drainPerM2 = area > 0 ? drainVolume / area : 0;
    const drainPerPlant = densityPlant > 0 ? drainPerM2 / densityPlant : 0;
    const drainPerContainer = densityContainer > 0 ? drainPerM2 / densityContainer : 0;
    const drainPercentage = irrigationVolume > 0 ? (drainVolume / irrigationVolume) * 100 : 0;

    return {
      drainPerM2,
      drainPerPlant,
      drainPerContainer,
      drainPercentage
    };
  }

  /**
   * Calculates irrigation flow rate
   * @param irrigationVolume - Volume in liters
   * @param durationMinutes - Duration in minutes
   * @returns Flow rate in L/h
   */
  addIrrigationFlow(irrigationVolume: number, durationMinutes: number): number {
    if (durationMinutes <= 0) return 0;
    return (irrigationVolume / durationMinutes) * 60; // Convert to L/h
  }

  /**
   * Calculates irrigation precipitation rate
   * @param irrigationVolume - Volume in liters
   * @param area - Area in m²
   * @param durationMinutes - Duration in minutes
   * @returns Precipitation rate in mm/h
   */
  addIrrigationPrecipitation(irrigationVolume: number, area: number, durationMinutes: number): number {
    if (durationMinutes <= 0 || area <= 0) return 0;
    const volumePerM2 = irrigationVolume / area;
    const mmPerM2 = volumePerM2; // 1 liter per m² = 1 mm
    const mmPerHour = (mmPerM2 / durationMinutes) * 60;
    return mmPerHour;
  }

  /**
   * Sets irrigation metrics for an irrigation event
   * @param event - Irrigation event
   * @param previousEvent - Previous event for interval calculation
   * @param cropData - Crop production data
   * @param settings - Measurement variable settings
   * @returns Updated event with all metrics
   */
  setIrrigationMetrics(
    event: any,
    previousEvent: any | null,
    cropData: { area: number; densityPlant: number; densityContainer: number },
    settings: Record<string, number>
  ): any {
    // Get basic values
    const irrigationVolume = this.getMeasurementValue(event, settings['IrrigationVolume'] || 1);
    const drainVolume = this.getMeasurementValue(event, settings['DrainVolume'] || 2);

    // Calculate interval
    const intervalMeasurement = this.addIrrigationIntervalMeasurement(
      event,
      previousEvent,
      settings['IrrigationInterval'] || 3
    );
    event.irrigationEventMeasurements.push(intervalMeasurement);

    // Calculate duration
    const lengthMeasurement = this.addIrrigationLengthMeasurement(
      event,
      settings['IrrigationLength'] || 4
    );
    event.irrigationEventMeasurements.push(lengthMeasurement);

    // Calculate volumes
    const volumes = this.addIrrigationVolumes(
      irrigationVolume,
      cropData.area,
      cropData.densityPlant,
      cropData.densityContainer
    );

    event.irrigationEventMeasurements.push(
      { measurementVariableId: settings['VolumePerM2'] || 5, recordValue: volumes.volumePerM2 },
      { measurementVariableId: settings['VolumePerPlant'] || 6, recordValue: volumes.volumePerPlant },
      { measurementVariableId: settings['VolumePerContainer'] || 7, recordValue: volumes.volumePerContainer }
    );

    // Calculate drains
    const drains = this.addDrainVolumes(
      drainVolume,
      irrigationVolume,
      cropData.area,
      cropData.densityPlant,
      cropData.densityContainer
    );

    event.irrigationEventMeasurements.push(
      { measurementVariableId: settings['DrainPerM2'] || 8, recordValue: drains.drainPerM2 },
      { measurementVariableId: settings['DrainPerPlant'] || 9, recordValue: drains.drainPerPlant },
      { measurementVariableId: settings['DrainPerContainer'] || 10, recordValue: drains.drainPerContainer },
      { measurementVariableId: settings['DrainPercentage'] || 11, recordValue: drains.drainPercentage }
    );

    // Calculate flow rate
    const flowRate = this.addIrrigationFlow(irrigationVolume, lengthMeasurement.recordValue);
    event.irrigationEventMeasurements.push(
      { measurementVariableId: settings['FlowRate'] || 12, recordValue: flowRate }
    );

    // Calculate precipitation
    const precipitation = this.addIrrigationPrecipitation(
      irrigationVolume,
      cropData.area,
      lengthMeasurement.recordValue
    );
    event.irrigationEventMeasurements.push(
      { measurementVariableId: settings['Precipitation'] || 13, recordValue: precipitation }
    );

    return event;
  }

  /**
   * Calculates complete irrigation metrics including interval, length, volumes, drain %, flow, and precipitation
   * This is a wrapper that calls all individual calculation functions
   * @param events - Array of irrigation events
   * @param cropData - Crop production data
   * @param settings - Measurement variable ID mappings
   * @returns Events with complete metrics
   */
  calculateIrrigationCalculationOutput(
    events: Array<any>,
    cropData: { area: number; densityPlant: number; densityContainer: number },
    settings: Record<string, number>
  ): Array<any> {
    const processedEvents: Array<any> = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const previousEvent = i > 0 ? events[i - 1] : null;

      const processedEvent = this.setIrrigationMetrics(event, previousEvent, cropData, settings);
      processedEvents.push(processedEvent);
    }

    return processedEvents;
  }

  // ============================================================================
  // BATCH 4: IRRIGATION PLANNING/SCHEDULING FUNCTIONS (8/8)
  // ============================================================================

  /**
   * Converts day of week to bit position for day mask
   * @param day - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   * @returns Bit position for day
   */
  getBitForDay(day: number): number {
    // Convert JS day (0=Sunday) to bit position (Monday=bit0)
    return 1 << ((day + 6) % 7);
  }

  /**
   * Checks if given day is enabled in day mask
   * @param daysMask - Bitmask for enabled days
   * @param date - Date to check
   * @returns True if day is enabled
   */
  isDayEnabled(daysMask: number, date: Date): boolean {
    const bit = this.getBitForDay(date.getDay());
    return (daysMask & bit) !== 0;
  }

  /**
   * Normalizes timespan to 24-hour range (0-1439 minutes)
   * @param totalMinutes - Total minutes (can be negative or > 1440)
   * @returns Normalized minutes in 24-hour range
   */
  normalizeTimeSpanTo24h(totalMinutes: number): number {
    let normalized = totalMinutes % (24 * 60);
    if (normalized < 0) {
      normalized += 24 * 60;
    }
    return normalized;
  }

  /**
   * Checks if time is in range considering midnight crossover
   * @param valueMinutes - Time to check (minutes from midnight)
   * @param startMinutes - Range start (minutes from midnight)
   * @param endMinutes - Range end (minutes from midnight)
   * @returns True if time is in range
   */
  isTimeInRangeConsideringMidnight(
    valueMinutes: number,
    startMinutes: number,
    endMinutes: number
  ): boolean {
    const s = this.normalizeTimeSpanTo24h(startMinutes);
    const e = this.normalizeTimeSpanTo24h(endMinutes);
    const v = this.normalizeTimeSpanTo24h(valueMinutes);

    if (s <= e) {
      // Normal range (doesn't cross midnight)
      return v >= s && v <= e;
    } else {
      // Range crosses midnight
      return v >= s || v <= e;
    }
  }

  /**
   * Simple time range check without midnight consideration
   * @param valueMinutes - Time to check
   * @param startMinutes - Range start
   * @param endMinutes - Range end
   * @returns True if time is in range
   */
  isTimeInRange(valueMinutes: number, startMinutes: number, endMinutes: number): boolean {
    return valueMinutes >= startMinutes && valueMinutes <= endMinutes;
  }

  /**
   * Composes occurrence date-time for fixed start time entries
   * @param baseDate - Base date
   * @param startTimeMinutes - Start time in minutes from midnight
   * @returns Composed date-time
   */
  composeOccurrenceDateTime(baseDate: Date, startTimeMinutes: number): Date {
    const result = new Date(baseDate);
    result.setHours(0, 0, 0, 0);
    result.setMinutes(startTimeMinutes);
    return result;
  }

  /**
   * Composes occurrence date-time for repeating window entries considering midnight
   * @param baseDate - Base date
   * @param windowStart - Window start in minutes from midnight
   * @param occurrenceIndex - Index of occurrence within window
   * @param repeatInterval - Repeat interval in minutes
   * @returns Composed date-time
   */
  composeOccurrenceDateTimeConsideringMidnight(
    baseDate: Date,
    windowStart: number,
    occurrenceIndex: number,
    repeatInterval: number
  ): Date {
    const totalMinutes = windowStart + (occurrenceIndex * repeatInterval);
    const normalized = this.normalizeTimeSpanTo24h(totalMinutes);

    const result = new Date(baseDate);
    result.setHours(0, 0, 0, 0);
    result.setMinutes(normalized);

    // If time wrapped around midnight, add a day
    if (totalMinutes >= 24 * 60) {
      result.setDate(result.getDate() + 1);
    }

    return result;
  }

  /**
   * Determines if irrigation should occur based on plan schedule
   * Supports fixed start times and repeating windows with midnight crossover
   * @param plan - Irrigation plan with daysMask and entries
   * @param currentDate - Current date/time
   * @param toleranceMinutes - Tolerance for matching time (default: 1 minute)
   * @returns Object indicating if irrigation should occur and duration
   */
  getIrrigationRequest(
    plan: {
      daysMask: number;
      entries: Array<{
        active: boolean;
        duration: number | null;
        startTime: number | null;
        windowStart: number | null;
        windowEnd: number | null;
        repeatInterval: number | null;
      }>;
    },
    currentDate: Date,
    toleranceMinutes: number = 1.0
  ): { irrigate: boolean; irrigationTime: number } {
    const result = { irrigate: false, irrigationTime: 0 };

    if (!plan || !plan.entries || plan.entries.length === 0) {
      return result;
    }

    // Check if today is enabled
    if (!this.isDayEnabled(plan.daysMask, currentDate)) {
      return result;
    }

    const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

    // Process entries in order
    const activeEntries = plan.entries.filter(e => e && e.active && e.duration && e.duration > 0);

    for (const entry of activeEntries) {
      // Fixed time irrigation
      if (entry.startTime !== null) {
        const start = entry.startTime;
        const startWindow = start - toleranceMinutes;
        const endWindow = start + toleranceMinutes;

        if (this.isTimeInRangeConsideringMidnight(nowMinutes, startWindow, endWindow)) {
          result.irrigate = true;
          result.irrigationTime = entry.duration!;
          return result;
        }
      }

      // Repeating irrigation within window
      if (entry.windowStart !== null && entry.windowEnd !== null && entry.repeatInterval !== null) {
        const wStart = entry.windowStart;
        const wEnd = entry.windowEnd;
        const interval = entry.repeatInterval;

        if (interval <= 0) continue;

        const crossesMidnight = wEnd <= wStart;
        const windowEffectiveStart = wStart - toleranceMinutes;
        const windowEffectiveEnd = wEnd + toleranceMinutes;

        // Quick reject if outside window
        let nowOutsideQuickReject: boolean;
        if (!crossesMidnight) {
          nowOutsideQuickReject = nowMinutes < windowEffectiveStart || nowMinutes > windowEffectiveEnd;
        } else {
          nowOutsideQuickReject = !(nowMinutes >= windowEffectiveStart || nowMinutes <= windowEffectiveEnd);
        }

        if (nowOutsideQuickReject) continue;

        // Calculate minutes since window start
        let minutesSinceWindowStart: number;
        if (!crossesMidnight) {
          minutesSinceWindowStart = nowMinutes - wStart;
        } else {
          if (nowMinutes >= wStart) {
            minutesSinceWindowStart = nowMinutes - wStart;
          } else {
            minutesSinceWindowStart = nowMinutes + (24 * 60) - wStart;
          }
        }

        if (minutesSinceWindowStart < -toleranceMinutes) {
          minutesSinceWindowStart = 0;
        }

        const nCandidate = Math.floor(minutesSinceWindowStart / interval);

        // Check candidate occurrences (n-1, n, n+1)
        for (const n of [nCandidate - 1, nCandidate, nCandidate + 1]) {
          if (n < 0) continue;

          const occurrenceStartMinutes = wStart + (n * interval);
          const occurrenceStartNormalized = this.normalizeTimeSpanTo24h(occurrenceStartMinutes);

          // Check if occurrence is beyond window
          let occurrenceBeyondWindow: boolean;
          if (!crossesMidnight) {
            occurrenceBeyondWindow = occurrenceStartNormalized > wEnd;
          } else {
            const minutesFromWStart = n * interval;
            const totalWindowMinutes = wEnd + (24 * 60) - wStart;
            occurrenceBeyondWindow = minutesFromWStart > totalWindowMinutes;
          }

          if (occurrenceBeyondWindow) continue;

          const occStartWindow = occurrenceStartNormalized - toleranceMinutes;
          const occEndWindow = occurrenceStartNormalized + toleranceMinutes;

          if (this.isTimeInRangeConsideringMidnight(nowMinutes, occStartWindow, occEndWindow)) {
            result.irrigate = true;
            result.irrigationTime = entry.duration!;
            return result;
          }
        }
      }
    }

    return result;
  }

  // ==========================================================================
  // AGGREGATION METHODS (Task 1.4)
  // ==========================================================================

  /**
   * Calculate aggregations for weekly and growth stage views
   */
  calculateAggregations(): void {
    if (this.kpiData.length === 0) {
      console.warn('No KPI data available for aggregation');
      return;
    }

    // Get planting date from first KPI or estimate
    this.plantingDate = this.estimatePlantingDate();

    // Calculate weekly aggregation
    this.weeklyAggregation = this.kpiAggregator.aggregateByWeek(
      this.kpiData,
      this.plantingDate
    );

    // Get cropId from the first KPI if available
    const cropId = this.kpiData.length > 0 ? this.kpiData[0].cropProductionId : undefined;

    // Calculate growth stage aggregation (now returns Observable)
    this.kpiAggregator.aggregateByGrowthStage(
      this.kpiData,
      this.plantingDate,
      cropId
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stageAggregation) => {
          this.stageAggregation = stageAggregation;

          if (!stageAggregation || stageAggregation.periods.length === 0) {
            console.warn('No growth stage data available - crop phases may not be configured for this crop');
          }

          console.log('Weekly aggregation:', this.weeklyAggregation);
          console.log('Stage aggregation:', this.stageAggregation);

          // Render charts after stage aggregation is loaded
          this.renderAggregationCharts();
        },
        error: (error) => {
          console.error('Error calculating stage aggregation:', error);
          this.stageAggregation = null;
          this.error = 'Error loading growth stages. Please ensure crop phases are configured for this crop.';
          // Still render weekly chart even if stage aggregation fails
          this.renderAggregationCharts();
        }
      });
  }

  /**
   * Estimate planting date from data
   */
  private estimatePlantingDate(): Date {
    if (this.kpiData.length === 0) return new Date();

    // Assume first KPI date is approximately 14 days after planting
    const firstKPIDate = this.kpiData[0].date;
    const estimatedPlanting = new Date(firstKPIDate);
    estimatedPlanting.setDate(estimatedPlanting.getDate() - 14);

    return estimatedPlanting;
  }

  /**
   * Render aggregation charts
   */
  renderAggregationCharts(): void {
    // Destroy existing charts
    if (this.weeklyChart) {
      this.weeklyChart.destroy();
      this.weeklyChart = null;
    }
    if (this.stageChart) {
      this.stageChart.destroy();
      this.stageChart = null;
    }

    // Wait for canvases to be available
    setTimeout(() => {
      if (this.weeklyAggregation && this.weeklyChartCanvas) {
        this.renderWeeklyChart();
      }
      if (this.stageAggregation && this.stageChartCanvas) {
        this.renderStageChart();
      }
    }, 100);
  }

  /**
   * Render weekly aggregation chart
   */
  private renderWeeklyChart(): void {
    if (!this.weeklyAggregation || !this.weeklyChartCanvas) return;

    const ctx = this.weeklyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.weeklyAggregation;
    const labels = data.periods.map(p => p.periodLabel);

    this.weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Riego (L/m²)',
            data: data.periods.map(p => p.irrigation.totalVolumePerM2),
            backgroundColor: this.aggregationChartConfig.colors.irrigation,
            borderColor: this.aggregationChartConfig.colors.irrigation,
            borderWidth: 2
          },
          {
            label: 'Drenaje (L/m²)',
            data: data.periods.map(p => p.drainage.totalVolumePerM2),
            backgroundColor: this.aggregationChartConfig.colors.drainage,
            borderColor: this.aggregationChartConfig.colors.drainage,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Riego y Drenaje Acumulado por Semana',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const index = items[0].dataIndex;
                const period = data.periods[index];
                return `Eventos: ${period.irrigation.numberOfEvents}\nDrenaje: ${period.drainage.averageDrainPercentage.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Semana',
              font: { size: 14, weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Volumen (L/m²)',
              font: { size: 14, weight: 'bold' }
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Render growth stage aggregation chart
   */
  private renderStageChart(): void {
    if (!this.stageAggregation || !this.stageChartCanvas) return;

    const ctx = this.stageChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.stageAggregation;
    const labels = data.periods.map(p => p.periodLabel);
    const colors = data.periods.map(p => p.growthStage?.color || '#6c757d');

    this.stageChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Riego Total (L)',
            data: data.periods.map(p => p.irrigation.totalVolume),
            backgroundColor: colors.map(c => c + 'CC'),
            borderColor: colors,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Riego Acumulado por Etapa de Crecimiento',
            font: { size: 18, weight: 'bold' }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const index = items[0].dataIndex;
                const period = data.periods[index];
                return `Días: ${period.daysInPeriod}\nPromedio diario: ${period.irrigation.averageDailyVolume.toFixed(1)} L\nEventos: ${period.irrigation.numberOfEvents}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Etapa de Crecimiento',
              font: { size: 14, weight: 'bold' }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Volumen Total (L)',
              font: { size: 14, weight: 'bold' }
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Switch aggregation view
   */
  switchAggregationView(view: 'weekly' | 'stage'): void {
    this.currentAggregationView = view;
  }

  /**
   * Toggle chart data series
   */
  toggleChartSeries(series: 'irrigation' | 'drainage' | 'et'): void {
    switch (series) {
      case 'irrigation':
        this.aggregationChartConfig.showIrrigation = !this.aggregationChartConfig.showIrrigation;
        break;
      case 'drainage':
        this.aggregationChartConfig.showDrainage = !this.aggregationChartConfig.showDrainage;
        break;
      case 'et':
        this.aggregationChartConfig.showET = !this.aggregationChartConfig.showET;
        break;
    }
    this.renderAggregationCharts();
  }
}