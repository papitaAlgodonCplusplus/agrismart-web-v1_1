# 📘 **DETAILED IMPLEMENTATION GUIDE: Task 1.1 - Substrate Curve Visualization Component**

---

## 🎯 **OBJECTIVE**
Build a reusable, interactive component that visualizes the air:water release curve for growing substrates (like the one shown in PDF Page 21-22), enabling agronomists to understand substrate water-holding characteristics and calculate optimal irrigation volumes.

---

## 📁 **FILE STRUCTURE**

```
src/app/features/irrigation-engineering-design/
├── components/
│   └── substrate-curve-analyzer/
│       ├── substrate-curve-analyzer.component.ts
│       ├── substrate-curve-analyzer.component.html
│       ├── substrate-curve-analyzer.component.css
│       └── substrate-curve-analyzer.component.spec.ts
├── services/
│   └── substrate-analysis.service.ts          # NEW
├── models/
│   └── substrate-analysis.models.ts            # NEW
└── irrigation-engineering-design.component.ts  # MODIFIED (add new tab)
```

---

## 📋 **STEP-BY-STEP IMPLEMENTATION**

---

### **STEP 1: Create Data Models** (15 minutes)

**File**: `src/app/features/irrigation-engineering-design/models/substrate-analysis.models.ts`

```typescript
// ============================================================================
// SUBSTRATE ANALYSIS DATA MODELS
// ============================================================================

/**
 * Represents a point on the substrate release curve
 * Maps matric potential (kPa) to volumetric water content (%)
 */
export interface SubstrateCurvePoint {
  matricPotential: number;        // kPa (0-10 range typical)
  volumetricWaterContent: number; // % (0-100)
  airContent: number;             // % (0-100)
  label?: string;                 // e.g., "Saturated", "Container Capacity"
}

/**
 * Complete substrate release curve with key characteristic points
 */
export interface SubstrateReleaseCurve {
  // Raw data points for plotting (typically 20-50 points for smooth curve)
  dataPoints: SubstrateCurvePoint[];
  
  // Key characteristic points (from PDF Page 21)
  characteristicPoints: {
    saturated: SubstrateCurvePoint;           // 0 kPa
    containerCapacity: SubstrateCurvePoint;   // 1 kPa
    fiveKpa: SubstrateCurvePoint;             // 5 kPa (field capacity equivalent)
    tenKpa: SubstrateCurvePoint;              // 10 kPa
    permanentWiltingPoint?: SubstrateCurvePoint; // 15 kPa (if available)
  };
  
  // Calculated water zones (as shown in PDF graphic)
  waterZones: {
    totalAvailableWater: number;    // % (Container Capacity - PWP)
    easilyAvailableWater: number;   // % (1 kPa - 5 kPa)
    reserveWater: number;           // % (5 kPa - 10 kPa)
  };
  
  // Substrate identification
  growingMediumId: number;
  growingMediumName: string;
  containerVolume: number;          // Liters
}

/**
 * Input data required to generate substrate curve
 * Maps to existing GrowingMedium + Container entities
 */
export interface SubstrateAnalysisInput {
  // From GrowingMedium entity (YOUR EXISTING DATA)
  growingMediumId: number;
  growingMediumName: string;
  containerCapacityPercentage: number;      // θ at 1 kPa
  permanentWiltingPoint: number;            // θ at ~15 kPa
  easelyAvailableWaterPercentage: number;   // Difference between 1-5 kPa
  reserveWaterPercentage: number;           // Difference between 5-10 kPa
  totalAvailableWaterPercentage: number;    // Total ATD
  
  // From Container entity (YOUR EXISTING DATA)
  containerId: number;
  containerVolume: number;                  // Liters
  
  // Optional: if you have lab-measured curve points
  labMeasuredPoints?: SubstrateCurvePoint[];
}

/**
 * Visualization configuration options
 */
export interface SubstrateCurveChartConfig {
  // Chart dimensions
  width?: number;
  height?: number;
  
  // Display options
  showAirContent: boolean;          // Show air percentage line
  showWaterZones: boolean;          // Show colored zones
  showCharacteristicPoints: boolean; // Mark key points
  showGridLines: boolean;
  
  // Calculation options
  curveResolution: number;          // Number of interpolated points (default: 50)
  maxMatricPotential: number;       // Max kPa to display (default: 10)
  
  // Color scheme
  colors: {
    waterLine: string;
    airLine: string;
    saturatedZone: string;
    containerCapacityZone: string;
    easilyAvailableZone: string;
    reserveZone: string;
  };
}
```

---

### **STEP 2: Create Substrate Analysis Service** (45 minutes)

**File**: `src/app/features/irrigation-engineering-design/services/substrate-analysis.service.ts`

```typescript
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
   * 
   * Mathematical model: θ(ψ) = θ_r + (θ_s - θ_r) / (1 + α|ψ|^n)^m
   * Simplified van Genuchten equation for substrate curves
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
      containerCapacityPercentage: growingMedium.containerCapacityPercentage || 75,
      permanentWiltingPoint: growingMedium.permanentWiltingPoint || 20,
      easelyAvailableWaterPercentage: growingMedium.easelyAvailableWaterPercentage || 25,
      reserveWaterPercentage: growingMedium.reserveWaterPercentage || 10,
      totalAvailableWaterPercentage: growingMedium.totalAvailableWaterPercentage || 35,
      containerId: container.id,
      containerVolume: container.volume || 10
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
```

---

### **STEP 3: Create Angular Component** (1 hour)

**File**: `src/app/features/irrigation-engineering-design/components/substrate-curve-analyzer/substrate-curve-analyzer.component.ts`

```typescript
  /**
   * Create annotations for characteristic points
   */
  private createAnnotations(curve: SubstrateReleaseCurve): any {
    const annotations: any = {};
    const points = curve.characteristicPoints;
    
    // Mark container capacity (1 kPa)
    annotations.containerCapacity = {
      type: 'line',
      xMin: 1,
      xMax: 1,
      borderColor: '#2c3e50',
      borderWidth: 2,
      borderDash: [8, 4],
      label: {
        display: true,
        content: 'CC (1 kPa)',
        position: 'start',
        backgroundColor: 'rgba(44, 62, 80, 0.8)',
        color: 'white',
        font: { size: 11, weight: 'bold' }
      }
    };
    
    // Mark 5 kPa point
    annotations.fiveKpa = {
      type: 'line',
      xMin: 5,
      xMax: 5,
      borderColor: '#27ae60',
      borderWidth: 2,
      borderDash: [8, 4],
      label: {
        display: true,
        content: '5 kPa',
        position: 'start',
        backgroundColor: 'rgba(39, 174, 96, 0.8)',
        color: 'white',
        font: { size: 11, weight: 'bold' }
      }
    };
    
    // Mark 10 kPa point
    annotations.tenKpa = {
      type: 'line',
      xMin: 10,
      xMax: 10,
      borderColor: '#e74c3c',
      borderWidth: 2,
      borderDash: [8, 4],
      label: {
        display: true,
        content: '10 kPa',
        position: 'start',
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        color: 'white',
        font: { size: 11, weight: 'bold' }
      }
    };
    
    return annotations;
  }

  /**
   * Get descriptive text for a point on the curve
   */
  private getPointDescription(psi: number, curve: SubstrateReleaseCurve): string {
    if (psi === 0) return 'Saturado - Máxima capacidad de agua';
    if (psi === 1) return 'Capacidad de Contenedor - Balance aire/agua óptimo';
    if (psi === 5) return 'Límite de agua fácilmente disponible';
    if (psi === 10) return 'Inicio de estrés hídrico';
    if (psi >= 15) return 'Punto de Marchitez Permanente';
    
    if (psi > 0 && psi < 1) return 'Zona de saturación';
    if (psi > 1 && psi < 5) return 'Agua fácilmente disponible';
    if (psi > 5 && psi < 10) return 'Agua de reserva';
    if (psi > 10) return 'Agua difícilmente disponible';
    
    return '';
  }

  /**
   * Destroy chart instance
   */
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
    // Could auto-select recommended container if available
    const selectedId = this.selectionForm.get('growingMediumId')?.value;
    const selectedMedium = this.growingMedia.find(m => m.id === selectedId);
    
    if (selectedMedium) {
      // You could add logic to suggest appropriate container size
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
}
```

---

### **STEP 4: Create Component Template** (45 minutes)

**File**: `src/app/features/irrigation-engineering-design/components/substrate-curve-analyzer/substrate-curve-analyzer.component.html`

```html
<!-- ============================================================================
     SUBSTRATE CURVE ANALYZER COMPONENT TEMPLATE
     ============================================================================ -->

<div class="substrate-curve-analyzer">

  <!-- ==================== HEADER ==================== -->
  <div class="analyzer-header">
    <div class="header-content">
      <h3 class="header-title">
        <i class="bi bi-graph-up"></i>
        Análisis de Curva de Liberación de Sustrato
      </h3>
      <p class="header-subtitle">
        Visualice las características de retención de agua del medio de cultivo
      </p>
    </div>
  </div>

  <!-- ==================== SUBSTRATE SELECTOR ==================== -->
  <div class="selector-section" *ngIf="showSelector">
    <form [formGroup]="selectionForm" class="selection-form">
      <div class="row g-3">
        
        <!-- Growing Medium Selector -->
        <div class="col-md-6">
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-flower1 text-success"></i>
              Medio de Cultivo
            </label>
            <select 
              formControlName="growingMediumId" 
              class="form-select"
              (change)="onGrowingMediumChange()"
              [class.is-invalid]="selectionForm.get('growingMediumId')?.invalid && selectionForm.get('growingMediumId')?.touched">
              <option [value]="null" disabled>Seleccione medio de cultivo</option>
              <option *ngFor="let medium of growingMedia" [value]="medium.id">
                {{ medium.name }}
              </option>
            </select>
            <div class="invalid-feedback" *ngIf="selectionForm.get('growingMediumId')?.invalid">
              Por favor seleccione un medio de cultivo
            </div>
            
            <!-- Quick info about selected medium -->
            <div class="medium-info" *ngIf="selectedGrowingMedium">
              <small class="text-muted">
                <i class="bi bi-info-circle"></i>
                ATD: {{ selectedGrowingMedium.totalAvailableWaterPercentage }}% | 
                CC: {{ selectedGrowingMedium.containerCapacityPercentage }}%
              </small>
            </div>
          </div>
        </div>

        <!-- Container Selector -->
        <div class="col-md-6">
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-box text-primary"></i>
              Contenedor
            </label>
            <select 
              formControlName="containerId" 
              class="form-select"
              [class.is-invalid]="selectionForm.get('containerId')?.invalid && selectionForm.get('containerId')?.touched">
              <option [value]="null" disabled>Seleccione contenedor</option>
              <option *ngFor="let container of containers" [value]="container.id">
                {{ container.name }} ({{ container.volume }}L)
              </option>
            </select>
            <div class="invalid-feedback" *ngIf="selectionForm.get('containerId')?.invalid">
              Por favor seleccione un contenedor
            </div>
            
            <!-- Quick info about selected container -->
            <div class="container-info" *ngIf="selectedContainer">
              <small class="text-muted">
                <i class="bi bi-info-circle"></i>
                Volumen: {{ selectedContainer.volume }}L | 
                Dimensiones: {{ selectedContainer.height }}×{{ selectedContainer.width }}×{{ selectedContainer.length }}cm
              </small>
            </div>
          </div>
        </div>

      </div>

      <!-- Generate Button -->
      <div class="row mt-3">
        <div class="col-12">
          <button 
            type="button" 
            class="btn btn-primary btn-generate"
            (click)="generateCurve()"
            [disabled]="selectionForm.invalid || isLoading">
            <i class="bi" [ngClass]="isLoading ? 'bi-hourglass-split' : 'bi-graph-up-arrow'"></i>
            {{ isLoading ? 'Generando...' : 'Generar Curva' }}
          </button>
        </div>
      </div>
    </form>
  </div>

  <!-- ==================== ERROR MESSAGE ==================== -->
  <div class="alert alert-danger" *ngIf="errorMessage">
    <i class="bi bi-exclamation-triangle"></i>
    {{ errorMessage }}
  </div>

  <!-- ==================== LOADING STATE ==================== -->
  <div class="loading-container" *ngIf="isLoading">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Cargando...</span>
    </div>
    <p class="loading-text">Generando curva de liberación...</p>
  </div>

  <!-- ==================== CURVE VISUALIZATION ==================== -->
  <div class="curve-visualization" *ngIf="currentCurve && !isLoading">
    
    <!-- Chart Controls -->
    <div class="chart-controls">
      <div class="control-group">
        <label class="control-label">Opciones de Visualización:</label>
        <div class="btn-group btn-group-sm" role="group">
          <button 
            type="button" 
            class="btn"
            [class.btn-primary]="chartConfig.showAirContent"
            [class.btn-outline-primary]="!chartConfig.showAirContent"
            (click)="toggleAirContent()"
            title="Mostrar/ocultar contenido de aire">
            <i class="bi bi-wind"></i>
            Aire
          </button>
          <button 
            type="button" 
            class="btn"
            [class.btn-success]="chartConfig.showWaterZones"
            [class.btn-outline-success]="!chartConfig.showWaterZones"
            (click)="toggleWaterZones()"
            title="Mostrar/ocultar zonas de agua">
            <i class="bi bi-droplet-fill"></i>
            Zonas
          </button>
          <button 
            type="button" 
            class="btn"
            [class.btn-info]="chartConfig.showCharacteristicPoints"
            [class.btn-outline-info]="!chartConfig.showCharacteristicPoints"
            (click)="toggleCharacteristicPoints()"
            title="Mostrar/ocultar puntos característicos">
            <i class="bi bi-bullseye"></i>
            Puntos
          </button>
          <button 
            type="button" 
            class="btn btn-outline-secondary"
            (click)="exportChartAsImage()"
            title="Exportar gráfico como imagen">
            <i class="bi bi-download"></i>
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Canvas -->
    <div class="chart-container">
      <canvas #curveCanvas></canvas>
    </div>

    <!-- ==================== WATER ZONES INFO CARDS ==================== -->
    <div class="water-zones-info">
      <div class="row g-3">
        
        <!-- Total Available Water Card -->
        <div class="col-md-4">
          <div class="info-card total-water-card">
            <div class="info-card-icon">
              <i class="bi bi-droplet-fill"></i>
            </div>
            <div class="info-card-content">
              <h6 class="info-card-title">Agua Total Disponible</h6>
              <div class="info-card-value">
                <span class="value-number">{{ currentCurve.waterZones.totalAvailableWater | number:'1.1-1' }}</span>
                <span class="value-unit">%</span>
              </div>
              <div class="info-card-secondary" *ngIf="waterVolumes">
                <span class="value-number">{{ waterVolumes.totalAvailableWaterLiters | number:'1.2-2' }}</span>
                <span class="value-unit">L</span>
              </div>
              <p class="info-card-description">
                Agua entre capacidad de contenedor (1 kPa) y punto de marchitez permanente
              </p>
            </div>
          </div>
        </div>

        <!-- Easily Available Water Card -->
        <div class="col-md-4">
          <div class="info-card easily-available-card">
            <div class="info-card-icon">
              <i class="bi bi-droplet-half"></i>
            </div>
            <div class="info-card-content">
              <h6 class="info-card-title">Agua Fácilmente Disponible</h6>
              <div class="info-card-value">
                <span class="value-number">{{ currentCurve.waterZones.easilyAvailableWater | number:'1.1-1' }}</span>
                <span class="value-unit">%</span>
              </div>
              <div class="info-card-secondary" *ngIf="waterVolumes">
                <span class="value-number">{{ waterVolumes.easilyAvailableWaterLiters | number:'1.2-2' }}</span>
                <span class="value-unit">L</span>
              </div>
              <p class="info-card-description">
                Agua disponible sin estrés (1-5 kPa) - Rango óptimo de riego
              </p>
            </div>
          </div>
        </div>

        <!-- Reserve Water Card -->
        <div class="col-md-4">
          <div class="info-card reserve-water-card">
            <div class="info-card-icon">
              <i class="bi bi-droplet"></i>
            </div>
            <div class="info-card-content">
              <h6 class="info-card-title">Agua de Reserva</h6>
              <div class="info-card-value">
                <span class="value-number">{{ currentCurve.waterZones.reserveWater | number:'1.1-1' }}</span>
                <span class="value-unit">%</span>
              </div>
              <div class="info-card-secondary" *ngIf="waterVolumes">
                <span class="value-number">{{ waterVolumes.reserveWaterLiters | number:'1.2-2' }}</span>
                <span class="value-unit">L</span>
              </div>
              <p class="info-card-description">
                Agua de emergencia (5-10 kPa) - Evitar alcanzar este nivel
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== CHARACTERISTIC POINTS TABLE ==================== -->
    <div class="characteristic-points-section">
      <h5 class="section-title">
        <i class="bi bi-table"></i>
        Puntos Característicos de la Curva
      </h5>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Potencial Mátrico (kPa)</th>
              <th>Contenido de Agua (%)</th>
              <th>Contenido de Aire (%)</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr class="point-saturated">
              <td>{{ currentCurve.characteristicPoints.saturated.matricPotential }}</td>
              <td>{{ currentCurve.characteristicPoints.saturated.volumetricWaterContent | number:'1.1-1' }}</td>
              <td>{{ currentCurve.characteristicPoints.saturated.airContent | number:'1.1-1' }}</td>
              <td>
                <span class="badge bg-dark">Saturado</span>
                Máxima capacidad de retención
              </td>
            </tr>
            <tr class="point-container-capacity">
              <td>{{ currentCurve.characteristicPoints.containerCapacity.matricPotential }}</td>
              <td><strong>{{ currentCurve.characteristicPoints.containerCapacity.volumetricWaterContent | number:'1.1-1' }}</strong></td>
              <td>{{ currentCurve.characteristicPoints.containerCapacity.airContent | number:'1.1-1' }}</td>
              <td>
                <span class="badge bg-primary">Capacidad de Contenedor</span>
                Balance óptimo aire/agua
              </td>
            </tr>
            <tr class="point-five-kpa">
              <td>{{ currentCurve.characteristicPoints.fiveKpa.matricPotential }}</td>
              <td>{{ currentCurve.characteristicPoints.fiveKpa.volumetricWaterContent | number:'1.1-1' }}</td>
              <td>{{ currentCurve.characteristicPoints.fiveKpa.airContent | number:'1.1-1' }}</td>
              <td>
                <span class="badge bg-success">5 kPa</span>
                Límite de agua fácilmente disponible
              </td>
            </tr>
            <tr class="point-ten-kpa">
              <td>{{ currentCurve.characteristicPoints.tenKpa.matricPotential }}</td>
              <td>{{ currentCurve.characteristicPoints.tenKpa.volumetricWaterContent | number:'1.1-1' }}</td>
              <td>{{ currentCurve.characteristicPoints.tenKpa.airContent | number:'1.1-1' }}</td>
              <td>
                <span class="badge bg-warning">10 kPa</span>
                Inicio de estrés hídrico
              </td>
            </tr>
            <tr class="point-pwp" *ngIf="currentCurve.characteristicPoints.permanentWiltingPoint">
              <td>{{ currentCurve.characteristicPoints.permanentWiltingPoint.matricPotential }}</td>
              <td>{{ currentCurve.characteristicPoints.permanentWiltingPoint.volumetricWaterContent | number:'1.1-1' }}</td>
              <td>{{ currentCurve.characteristicPoints.permanentWiltingPoint.airContent | number:'1.1-1' }}</td>
              <td>
                <span class="badge bg-danger">Punto de Marchitez Permanente</span>
                Agua no disponible para la planta
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== INTERPRETATION GUIDE ==================== -->
    <div class="interpretation-guide">
      <h5 class="section-title">
        <i class="bi bi-lightbulb"></i>
        Guía de Interpretación
      </h5>
      <div class="guide-content">
        <div class="row g-3">
          
          <div class="col-md-6">
            <div class="guide-card">
              <h6 class="guide-card-title">
                <i class="bi bi-check-circle text-success"></i>
                Manejo Óptimo
              </h6>
              <ul class="guide-list">
                <li>
                  <strong>Regar antes de alcanzar 5 kPa:</strong> 
                  Mantener la humedad en la zona de agua fácilmente disponible (1-5 kPa)
                </li>
                <li>
                  <strong>% Agotamiento ideal: 30-40%:</strong>
                  Para un sustrato con 25% ATD, regar cuando se consuma 7.5-10% del volumen
                </li>
                <li>
                  <strong>Volumen de riego:</strong>
                  Reponer el agua consumida + 15-20% de drenaje para lixiviación
                </li>
              </ul>
            </div>
          </div>

          <div class="col-md-6">
            <div class="guide-card">
              <h6 class="guide-card-title">
                <i class="bi bi-exclamation-triangle text-warning"></i>
                Situaciones a Evitar
              </h6>
              <ul class="guide-list">
                <li>
                  <strong>Sobresaturación (< 0.5 kPa):</strong>
                  Exceso de agua, deficiencia de oxígeno en raíces
                </li>
                <li>
                  <strong>Estrés hídrico (> 7 kPa):</strong>
                  Agua difícilmente disponible, reduce crecimiento
                </li>
                <li>
                  <strong>Agotamiento > 60%:</strong>
                  Riesgo de marchitez y pérdida de producción
                </li>
              </ul>
            </div>
          </div>

        </div>

        <!-- Practical Example -->
        <div class="practical-example" *ngIf="waterVolumes">
          <h6 class="example-title">
            <i class="bi bi-calculator"></i>
            Ejemplo Práctico - Contenedor de {{ currentCurve.containerVolume }}L
          </h6>
          <div class="example-content">
            <p>
              <strong>Escenario:</strong> Regar con 30% de agotamiento del agua fácilmente disponible
            </p>
            <div class="calculation-steps">
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-text">
                  Agua fácilmente disponible = {{ waterVolumes.easilyAvailableWaterLiters | number:'1.2-2' }} L
                </span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span class="step-text">
                  30% de agotamiento = {{ (waterVolumes.easilyAvailableWaterLiters * 0.3) | number:'1.2-2' }} L consumidos
                </span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span class="step-text">
                  Volumen a regar = {{ (waterVolumes.easilyAvailableWaterLiters * 0.3) | number:'1.2-2' }} L + 20% drenaje 
                  = <strong class="text-primary">{{ (waterVolumes.easilyAvailableWaterLiters * 0.3 * 1.2) | number:'1.2-2' }} L</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- ==================== EMPTY STATE ==================== -->
  <div class="empty-state" *ngIf="!currentCurve && !isLoading">
    <div class="empty-state-icon">
      <i class="bi bi-graph-up"></i>
    </div>
    <h4 class="empty-state-title">Sin Curva Generada</h4>
    <p class="empty-state-text">
      Seleccione un medio de cultivo y un contenedor, luego haga clic en "Generar Curva" 
      para visualizar las características de retención de agua.
    </p>
  </div>

</div>
```

---

### **STEP 5: Create Component Styles** (30 minutes)

**File**: `src/app/features/irrigation-engineering-design/components/substrate-curve-analyzer/substrate-curve-analyzer.component.css`

.....