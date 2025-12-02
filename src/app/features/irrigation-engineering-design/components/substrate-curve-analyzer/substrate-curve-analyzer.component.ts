import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Services
import { SubstrateAnalysisService } from '../../services/substrate-analysis.service';
import { IrrigationSectorService, GrowingMedium, Container } from '../../../services/irrigation-sector.service';
import { AlertService } from '../../../../core/services/alert.service';

// Models
import { SubstrateReleaseCurve, SubstrateCurveChartConfig } from '../../models/substrate-analysis.models';

// Components
import { IrrigationVolumeCalculatorComponent } from '../irrigation-volume-calculator/irrigation-volume-calculator.component';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-substrate-curve-analyzer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IrrigationVolumeCalculatorComponent],
  templateUrl: './substrate-curve-analyzer.component.html',
  styleUrl: './substrate-curve-analyzer.component.scss'
})
export class SubstrateCurveAnalyzerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('curveCanvas', { static: false }) curveCanvas!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private chart: Chart | null = null;

  // Forms
  selectionForm!: FormGroup;

  // Data
  growingMedia: GrowingMedium[] = [];
  containers: Container[] = [];
  currentCurve: SubstrateReleaseCurve | null = null;
  waterVolumes: any = null;

  // UI State
  isLoading = false;
  errorMessage = '';
  showSelector = true;

  // Chart configuration
  chartConfig!: SubstrateCurveChartConfig;

  constructor(
    private fb: FormBuilder,
    private substrateService: SubstrateAnalysisService,
    private irrigationService: IrrigationSectorService,
    private alertService: AlertService
  ) {
    this.initializeForms();
    this.chartConfig = this.substrateService.getDefaultChartConfig();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    // Chart canvas is now available
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyChart();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private initializeForms(): void {
    this.selectionForm = this.fb.group({
      growingMediumId: [null, Validators.required],
      containerId: [null, Validators.required]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load growing media and containers
    this.irrigationService.getAllGrowingMediums(true)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (media) => {
          this.growingMedia = media;
          if (this.growingMedia.length > 0) {
            this.selectionForm.patchValue({ growingMediumId: this.growingMedia[0].id });
          }
        },
        error: (error) => {
          console.error('Error loading growing media:', error);
          this.errorMessage = 'Error al cargar los medios de cultivo';
        }
      });

    this.irrigationService.getAllContainers(false)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (containers) => {
          this.containers = containers;
          if (this.containers.length > 0) {
            this.selectionForm.patchValue({ containerId: this.containers[0].id });
          }
        },
        error: (error) => {
          console.error('Error loading containers:', error);
          this.errorMessage = 'Error al cargar los contenedores';
        }
      });
  }

  // ==========================================================================
  // CURVE GENERATION
  // ==========================================================================

  generateCurve(): void {
    if (this.selectionForm.invalid) {
      this.alertService.showError('Por favor seleccione un medio de cultivo y un contenedor');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const growingMediumId = this.selectionForm.get('growingMediumId')?.value;
    const containerId = this.selectionForm.get('containerId')?.value;

    this.substrateService.loadAndGenerateCurve(growingMediumId, containerId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (curve) => {
          this.currentCurve = curve;
          this.waterVolumes = this.substrateService.calculateWaterVolumes(curve);
          this.renderChart(curve);
          this.alertService.showSuccess('Curva generada exitosamente');
        },
        error: (error) => {
          console.error('Error generating curve:', error);
          this.errorMessage = 'Error al generar la curva de liberación';
          this.alertService.showError('Error al generar la curva');
        }
      });
  }

  // ==========================================================================
  // CHART RENDERING
  // ==========================================================================

  private renderChart(curve: SubstrateReleaseCurve): void {
    if (!this.curveCanvas || !this.curveCanvas.nativeElement) {
      console.error('Canvas element not available');
      return;
    }

    // Destroy existing chart
    this.destroyChart();

    const ctx = this.curveCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Prepare datasets
    const datasets: any[] = [];

    // Water content line (main curve)
    datasets.push({
      label: 'Contenido de Agua (%)',
      data: curve.dataPoints.map(p => ({ x: p.matricPotential, y: p.volumetricWaterContent })),
      borderColor: this.chartConfig.colors.waterLine,
      backgroundColor: this.chartConfig.colors.waterLine + '20',
      borderWidth: 3,
      fill: false,
      pointRadius: 0,
      tension: 0.4
    });

    // Air content line (optional)
    if (this.chartConfig.showAirContent) {
      datasets.push({
        label: 'Contenido de Aire (%)',
        data: curve.dataPoints.map(p => ({ x: p.matricPotential, y: p.airContent })),
        borderColor: this.chartConfig.colors.airLine,
        backgroundColor: this.chartConfig.colors.airLine + '20',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        tension: 0.4
      });
    }

    // Characteristic points (optional)
    if (this.chartConfig.showCharacteristicPoints) {
      const points = [
        curve.characteristicPoints.saturated,
        curve.characteristicPoints.containerCapacity,
        curve.characteristicPoints.fiveKpa,
        curve.characteristicPoints.tenKpa
      ];

      if (curve.characteristicPoints.permanentWiltingPoint) {
        points.push(curve.characteristicPoints.permanentWiltingPoint);
      }

      datasets.push({
        label: 'Puntos Característicos',
        data: points.map(p => ({ x: p.matricPotential, y: p.volumetricWaterContent })),
        borderColor: '#2c3e50',
        backgroundColor: '#2c3e50',
        borderWidth: 0,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false
      });
    }

    // Chart configuration
    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: `Curva de Liberación - ${curve.growingMediumName}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const psi = context[0].parsed.x;
                return `Potencial Mátrico: ${psi.toFixed(1)} kPa`;
              },
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Potencial Mátrico (kPa)',
              font: { size: 14, weight: 'bold' }
            },
            grid: {
              display: this.chartConfig.showGridLines
            },
            min: 0,
            max: this.chartConfig.maxMatricPotential
          },
          y: {
            title: {
              display: true,
              text: 'Contenido Volumétrico (%)',
              font: { size: 14, weight: 'bold' }
            },
            grid: {
              display: this.chartConfig.showGridLines
            },
            min: 0,
            max: 100
          }
        }
      }
    };

    // Create chart
    this.chart = new Chart(ctx, chartConfig);
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // ==========================================================================
  // USER INTERACTIONS
  // ==========================================================================

  onGrowingMediumChange(): void {
    const selectedId = this.selectionForm.get('growingMediumId')?.value;
    const selectedMedium = this.growingMedia.find(m => m.id === selectedId);

    if (selectedMedium) {
      console.log('Selected medium:', selectedMedium.name);
    }
  }

  toggleAirContent(): void {
    this.chartConfig.showAirContent = !this.chartConfig.showAirContent;
    if (this.currentCurve) {
      this.renderChart(this.currentCurve);
    }
  }

  toggleWaterZones(): void {
    this.chartConfig.showWaterZones = !this.chartConfig.showWaterZones;
    if (this.currentCurve) {
      this.renderChart(this.currentCurve);
    }
  }

  toggleCharacteristicPoints(): void {
    this.chartConfig.showCharacteristicPoints = !this.chartConfig.showCharacteristicPoints;
    if (this.currentCurve) {
      this.renderChart(this.currentCurve);
    }
  }

  exportChartAsImage(): void {
    if (!this.chart) return;

    const link = document.createElement('a');
    link.download = `substrate-curve-${Date.now()}.png`;
    link.href = this.chart.toBase64Image();
    link.click();
  }

  // ==========================================================================
  // HELPER GETTERS FOR TEMPLATE
  // ==========================================================================

  get selectedGrowingMedium(): GrowingMedium | undefined {
    const id = this.selectionForm.get('growingMediumId')?.value;
    return this.growingMedia.find(m => m.id === id);
  }

  get selectedContainer(): Container | undefined {
    const id = this.selectionForm.get('containerId')?.value;
    return this.containers.find(c => c.id === id);
  }

  get substrateDescription(): string {
    return this.currentCurve
      ? this.substrateService.getSubstrateDescription(this.currentCurve)
      : '';
  }

  // ==========================================================================
  // IRRIGATION CALCULATOR EVENT HANDLERS
  // ==========================================================================

  onVolumeCalculated(result: any): void {
    console.log('Volume calculated:', result);
    // You can add additional logic here if needed
  }

  onApplyIrrigation(result: any): void {
    console.log('Apply irrigation requested:', result);
    this.alertService.showInfo(
      `Programando riego: ${result.totalVolumeWithDrain.toFixed(2)}L para ${result.totalVolumeWithDrain / result.volumeWithDrainPerContainer} contenedores`
    );
    // TODO: Integrate with irrigation scheduling system
  }
}
