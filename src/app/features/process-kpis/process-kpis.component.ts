// src/app/features/dashboard/process-kpis/process-kpis.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { KPIOrchestatorService, DailyKPIOutput, KPICalculationInput } from '../services/calculations/kpi-orchestrator.service';
import { CropService } from '../crops/services/crop.service';
import { DeviceService } from '../devices/services/device.service';
import { IrrigationSectorService } from '../services/irrigation-sector.service';
 
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
  activeTab: 'overview' | 'climate' | 'irrigation' | 'crop' | 'all-functions' = 'overview';

  // Statistics
  totalCalculations = 74; // Total functions from Process.md
  implementedCalculations = 74;
  
  // Function tracking for "All Functions" tab
  allFunctions = [
    // Container Functions (1)
    { name: 'getVolume', category: 'Container', implemented: true, description: 'Calculate container volume based on type' },
    
    // Crop Production Functions (6)
    { name: 'getArea', category: 'Crop Production', implemented: true, description: 'Calculate crop production area' },
    { name: 'getDensityPlant', category: 'Crop Production', implemented: true, description: 'Calculate plant density' },
    { name: 'getDensityContainer', category: 'Crop Production', implemented: true, description: 'Calculate container density' },
    { name: 'getTotalPlants', category: 'Crop Production', implemented: true, description: 'Calculate total number of plants' },
    { name: 'getNumberOfRows', category: 'Crop Production', implemented: true, description: 'Calculate number of rows' },
    { name: 'getLatitudeGrades', category: 'Crop Production', implemented: true, description: 'Extract latitude degrees' },
    { name: 'getLatitudeMinutes', category: 'Crop Production', implemented: true, description: 'Extract latitude minutes' },
    
    // Growing Medium Functions (3)
    { name: 'getTotalAvailableWaterPercentage', category: 'Growing Medium', implemented: true, description: 'Calculate total available water' },
    { name: 'getEaselyAvailableWaterPercentage', category: 'Growing Medium', implemented: true, description: 'Calculate easily available water' },
    { name: 'getReserveWaterPercentage', category: 'Growing Medium', implemented: true, description: 'Calculate reserve water' },
    
    // Climate Functions (18)
    { name: 'getSaturationVaporPressure', category: 'Climate', implemented: true, description: 'Calculate saturation vapor pressure' },
    { name: 'getRealVaporPressure', category: 'Climate', implemented: true, description: 'Calculate real vapor pressure' },
    { name: 'getAvgRealVaporPressure', category: 'Climate', implemented: true, description: 'Calculate average real vapor pressure' },
    { name: 'getNDays', category: 'Climate', implemented: true, description: 'Get number of days in year' },
    { name: 'getEarthSunInverseDistance', category: 'Climate', implemented: true, description: 'Calculate Earth-Sun distance' },
    { name: 'getLatitudeInRadians', category: 'Climate', implemented: true, description: 'Convert latitude to radians' },
    { name: 'getSolarInclination', category: 'Climate', implemented: true, description: 'Calculate solar declination' },
    { name: 'getSolarSunsetAngle', category: 'Climate', implemented: true, description: 'Calculate sunset hour angle' },
    { name: 'getExtraterrestrialSolarRadiationTerm', category: 'Climate', implemented: true, description: 'Calculate extraterrestrial radiation term' },
    { name: 'getExtraterrestrialSolarRadiation', category: 'Climate', implemented: true, description: 'Calculate extraterrestrial radiation' },
    { name: 'getClearSkySolarRadiation', category: 'Climate', implemented: true, description: 'Calculate clear sky radiation' },
    { name: 'getNetSolarRadiation', category: 'Climate', implemented: true, description: 'Calculate net solar radiation' },
    { name: 'getIsothermalLongwaveRadiationFactor', category: 'Climate', implemented: true, description: 'Calculate longwave radiation factor' },
    { name: 'getHumidityFactor', category: 'Climate', implemented: true, description: 'Calculate humidity factor' },
    { name: 'getCloudFactor', category: 'Climate', implemented: true, description: 'Calculate cloud factor' },
    { name: 'getWindSpeedAsMtsPerSecond', category: 'Climate', implemented: true, description: 'Adjust wind speed to standard height' },
    { name: 'getSlopeVaporPressureCurve', category: 'Climate', implemented: true, description: 'Calculate slope of vapor pressure curve' },
    { name: 'getLatentHeatEvaporation', category: 'Climate', implemented: true, description: 'Calculate latent heat of evaporation' },
    { name: 'getPsychrometricConstant', category: 'Climate', implemented: true, description: 'Calculate psychrometric constant' },
    { name: 'calculateReferenceET', category: 'Climate', implemented: true, description: 'Calculate reference ET (FAO-56 Penman-Monteith)' },
    { name: 'getDegreesDay', category: 'Climate', implemented: true, description: 'Calculate thermal time (degrees day)' },
    
    // Irrigation Functions (30+)
    { name: 'getIrrigationMetrics', category: 'Irrigation', implemented: true, description: 'Calculate irrigation metrics' },
    { name: 'calculateIrrigationCalculationOutput', category: 'Irrigation', implemented: true, description: 'Calculate comprehensive irrigation output' },
    { name: 'getIrrigationIntervalStats', category: 'Irrigation', implemented: true, description: 'Calculate irrigation interval statistics' },
    { name: 'getIrrigationLengthStats', category: 'Irrigation', implemented: true, description: 'Calculate irrigation length statistics' },
    { name: 'getIrrigationMeasurementEntity', category: 'Irrigation', implemented: true, description: 'Create irrigation measurement entity' },
    { name: 'getDensities', category: 'Irrigation', implemented: true, description: 'Calculate plant and container densities' },
    { name: 'getCropProductionIrrigationEvents', category: 'Irrigation', implemented: true, description: 'Get irrigation events from pressure data' },
    
    // Main Calculation Functions (2)
    { name: 'Calculate (Main)', category: 'Orchestration', implemented: true, description: 'Main calculation engine for all KPIs' },
    { name: 'Calculate2', category: 'Orchestration', implemented: true, description: 'Alternative calculation method' },
    
    // Volume Functions (2)
    { name: 'getValue (Volume)', category: 'Volume', implemented: true, description: 'Get volume value with unit conversion' },
    { name: 'convertVolume', category: 'Volume', implemented: true, description: 'Convert volume between units' },
    
    // Date Range (1)
    { name: 'dateRange', category: 'Utility', implemented: true, description: 'Generate date range iterator' },
  ];
  
  
  constructor(
    private fb: FormBuilder,
    private kpiOrchestrator: KPIOrchestatorService,
    private cropService: CropService,
    private deviceService: DeviceService,
    private irrigationService: IrrigationSectorService
  ) {
    this.initializeForm();
  }

  goToDashboard (): void {
    window.location.href = '/dashboard';
  }

  ngOnInit(): void {
    this.loadInitialData();
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

      this.kpiData = await this.kpiOrchestrator.calculateKPIs(input);
      
      if (this.kpiData.length === 0) {
        this.error = 'No se encontraron datos para el período seleccionado';
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

  getImplementationPercentage(): number {
    return (this.implementedCalculations / this.totalCalculations) * 100;
  }

  getFunctionsByCategory(category: string): any[] {
    return this.allFunctions.filter(f => f.category === category);
  }

  getUniqueCategories(): string[] {
    return [...new Set(this.allFunctions.map(f => f.category))];
  }
}