# 📘 **DETAILED IMPLEMENTATION GUIDE: Task 1.2 - Irrigation Volume Calculator Widget**

---

## 🎯 **OBJECTIVE**
Build an interactive calculator that determines the optimal irrigation volume based on substrate depletion percentage, using the substrate curve data from Task 1.1. This implements the decision support visualization from PDF Page 23, helping users answer: **"How much water should I apply?"**

---

## 📁 **FILE STRUCTURE**

```
src/app/features/irrigation-engineering-design/
├── components/
│   ├── substrate-curve-analyzer/           # FROM TASK 1.1
│   │   └── ...
│   └── irrigation-volume-calculator/       # NEW
│       ├── irrigation-volume-calculator.component.ts
│       ├── irrigation-volume-calculator.component.html
│       ├── irrigation-volume-calculator.component.css
│       └── irrigation-volume-calculator.component.spec.ts
├── services/
│   ├── substrate-analysis.service.ts       # FROM TASK 1.1
│   └── irrigation-volume-calculator.service.ts  # NEW
├── models/
│   ├── substrate-analysis.models.ts        # FROM TASK 1.1
│   └── irrigation-calculator.models.ts     # NEW
└── irrigation-engineering-design.component.ts
```

---

## 📋 **STEP-BY-STEP IMPLEMENTATION**

---

### **STEP 1: Create Data Models** (15 minutes)

**File**: `src/app/features/irrigation-engineering-design/models/irrigation-calculator.models.ts`

```typescript
// ============================================================================
// IRRIGATION VOLUME CALCULATOR DATA MODELS
// ============================================================================

import { SubstrateReleaseCurve } from './substrate-analysis.models';

/**
 * Input parameters for irrigation volume calculation
 */
export interface IrrigationVolumeInput {
  // Substrate characteristics
  substrateCurve: SubstrateReleaseCurve;
  
  // Crop production setup
  numberOfContainers: number;
  containersPerPlant: number;        // Usually 1, but could be 2 for large plants
  totalArea: number;                 // m²
  plantDensity: number;              // plants/m²
  
  // Irrigation strategy
  depletionPercentage: number;       // % of available water to deplete before irrigating (0-100)
  targetDrainPercentage: number;     // % of applied water that should drain (typically 15-25%)
  
  // Optional: current moisture level
  currentMoisturePercentage?: number; // If measured, allows more precise calculation
}

/**
 * Calculated irrigation volumes and recommendations
 */
export interface IrrigationVolumeOutput {
  // Per container calculations
  waterDepletedPerContainer: number;      // Liters consumed since last irrigation
  volumeNeededPerContainer: number;       // Liters to restore to optimal level
  volumeWithDrainPerContainer: number;    // Liters including drain percentage
  
  // Total system calculations
  totalWaterDepleted: number;             // Liters for entire system
  totalVolumeNeeded: number;              // Liters to restore entire system
  totalVolumeWithDrain: number;           // Liters including drain for entire system
  
  // Per area calculations
  volumePerSquareMeter: number;           // L/m²
  precipitationRate: number;              // mm (same as L/m²)
  
  // Irrigation duration (if flow rate available)
  durationMinutes?: number;               // Calculated if flowRate provided
  
  // Recommendation metadata
  recommendationLevel: 'optimal' | 'acceptable' | 'caution' | 'critical';
  recommendation: string;
  reasoning: string[];
  
  // Visual zones for display
  zones: {
    optimal: { min: number; max: number };      // 20-40% depletion
    acceptable: { min: number; max: number };   // 40-60% depletion
    caution: { min: number; max: number };      // 60-80% depletion
    critical: { min: number; max: number };     // 80-100% depletion
  };
}

/**
 * Configuration for the calculator widget
 */
export interface CalculatorConfig {
  // Display options
  showPerContainer: boolean;
  showPerPlant: boolean;
  showPerArea: boolean;
  showDurationCalculator: boolean;
  
  // Calculation options
  defaultDepletionPercentage: number;     // Default: 30%
  defaultDrainPercentage: number;         // Default: 20%
  minDepletionPercentage: number;         // Min slider value: 10%
  maxDepletionPercentage: number;         // Max slider value: 100%
  
  // Flow rate for duration calculation (optional)
  systemFlowRate?: number;                // L/min
  
  // Color scheme for zones
  colors: {
    optimal: string;
    acceptable: string;
    caution: string;
    critical: string;
  };
}

/**
 * Historical irrigation event for comparison
 */
export interface IrrigationHistoryEvent {
  date: Date;
  volumeApplied: number;              // Liters
  drainageVolume: number;             // Liters
  drainPercentage: number;            // %
  depletionAtIrrigation: number;      // % depletion when irrigation started
  durationMinutes: number;
  notes?: string;
}

/**
 * Comparison between calculated and historical irrigation
 */
export interface IrrigationComparison {
  calculatedVolume: number;
  averageHistoricalVolume: number;
  difference: number;                  // Liters
  differencePercentage: number;        // %
  suggestion: string;
}

/**
 * Quick preset irrigation strategies
 */
export interface IrrigationPreset {
  id: string;
  name: string;
  description: string;
  depletionPercentage: number;
  drainPercentage: number;
  icon: string;
  suitableFor: string[];              // e.g., ["Vegetative stage", "High VPD conditions"]
}
```

---

### **STEP 2: Create Calculator Service** (45 minutes)

**File**: `src/app/features/irrigation-engineering-design/services/irrigation-volume-calculator.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { 
  IrrigationVolumeInput, 
  IrrigationVolumeOutput, 
  CalculatorConfig,
  IrrigationPreset,
  IrrigationComparison,
  IrrigationHistoryEvent
} from '../models/irrigation-calculator.models';
import { SubstrateReleaseCurve } from '../models/substrate-analysis.models';

@Injectable({
  providedIn: 'root'
})
export class IrrigationVolumeCalculatorService {

  constructor() { }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Calculate irrigation volumes based on depletion percentage
   * This is the MAIN calculation method
   */
  calculateIrrigationVolume(input: IrrigationVolumeInput): IrrigationVolumeOutput {
    
    // STEP 1: Calculate water depleted per container
    const waterDepletedPerContainer = this.calculateWaterDepleted(
      input.substrateCurve,
      input.depletionPercentage
    );
    
    // STEP 2: Add drain percentage to get total volume needed
    const volumeNeededPerContainer = waterDepletedPerContainer;
    const volumeWithDrainPerContainer = waterDepletedPerContainer * (1 + input.targetDrainPercentage / 100);
    
    // STEP 3: Scale to entire system
    const totalContainers = input.numberOfContainers;
    const totalWaterDepleted = waterDepletedPerContainer * totalContainers;
    const totalVolumeNeeded = volumeNeededPerContainer * totalContainers;
    const totalVolumeWithDrain = volumeWithDrainPerContainer * totalContainers;
    
    // STEP 4: Calculate per area values
    const volumePerSquareMeter = totalVolumeWithDrain / input.totalArea;
    const precipitationRate = volumePerSquareMeter; // 1 L/m² = 1 mm
    
    // STEP 5: Calculate duration if flow rate available
    const durationMinutes = undefined; // Will be calculated by separate method if needed
    
    // STEP 6: Generate recommendation
    const recommendationLevel = this.getRecommendationLevel(input.depletionPercentage);
    const recommendation = this.getRecommendationText(
      input.depletionPercentage,
      input.targetDrainPercentage,
      recommendationLevel
    );
    const reasoning = this.getReasoningPoints(input);
    
    // STEP 7: Define visual zones
    const zones = this.calculateZones(input.substrateCurve);
    
    return {
      waterDepletedPerContainer,
      volumeNeededPerContainer,
      volumeWithDrainPerContainer,
      totalWaterDepleted,
      totalVolumeNeeded,
      totalVolumeWithDrain,
      volumePerSquareMeter,
      precipitationRate,
      durationMinutes,
      recommendationLevel,
      recommendation,
      reasoning,
      zones
    };
  }

  /**
   * Calculate irrigation duration based on flow rate
   */
  calculateDuration(
    totalVolume: number,
    flowRateLitersPerMinute: number,
    numberOfValves: number = 1
  ): number {
    const effectiveFlowRate = flowRateLitersPerMinute * numberOfValves;
    return totalVolume / effectiveFlowRate;
  }

  /**
   * Get default calculator configuration
   */
  getDefaultConfig(): CalculatorConfig {
    return {
      showPerContainer: true,
      showPerPlant: true,
      showPerArea: true,
      showDurationCalculator: true,
      defaultDepletionPercentage: 30,
      defaultDrainPercentage: 20,
      minDepletionPercentage: 10,
      maxDepletionPercentage: 100,
      systemFlowRate: 2.0, // 2 L/min default
      colors: {
        optimal: '#28a745',      // Green
        acceptable: '#ffc107',   // Yellow
        caution: '#fd7e14',      // Orange
        critical: '#dc3545'      // Red
      }
    };
  }

  /**
   * Get predefined irrigation strategy presets
   */
  getIrrigationPresets(): IrrigationPreset[] {
    return [
      {
        id: 'conservative',
        name: 'Conservador',
        description: 'Riego frecuente con bajo agotamiento. Mantiene el sustrato siempre húmedo.',
        depletionPercentage: 20,
        drainPercentage: 15,
        icon: 'bi-shield-check',
        suitableFor: ['Plántulas', 'Trasplantes recientes', 'Alta transpiración']
      },
      {
        id: 'balanced',
        name: 'Balanceado',
        description: 'Estrategia óptima para la mayoría de situaciones. Balance entre frecuencia y volumen.',
        depletionPercentage: 30,
        drainPercentage: 20,
        icon: 'bi-brightness-high',
        suitableFor: ['Crecimiento vegetativo', 'Condiciones normales', 'Uso general']
      },
      {
        id: 'efficient',
        name: 'Eficiente',
        description: 'Mayor agotamiento entre riegos. Ahorra agua y mejora oxigenación radicular.',
        depletionPercentage: 40,
        drainPercentage: 20,
        icon: 'bi-water',
        suitableFor: ['Plantas establecidas', 'Ahorro de agua', 'Baja transpiración']
      },
      {
        id: 'stress',
        name: 'Estrés Controlado',
        description: 'Agotamiento significativo para inducir respuestas fisiológicas.',
        depletionPercentage: 50,
        drainPercentage: 25,
        icon: 'bi-exclamation-triangle',
        suitableFor: ['Endurecimiento', 'Mejora de calidad', 'Pre-cosecha']
      }
    ];
  }

  /**
   * Compare calculated volume with historical irrigation events
   */
  compareWithHistory(
    calculatedVolume: number,
    historicalEvents: IrrigationHistoryEvent[]
  ): IrrigationComparison {
    
    if (historicalEvents.length === 0) {
      return {
        calculatedVolume,
        averageHistoricalVolume: 0,
        difference: 0,
        differencePercentage: 0,
        suggestion: 'No hay datos históricos para comparar'
      };
    }
    
    const averageHistoricalVolume = historicalEvents.reduce(
      (sum, event) => sum + event.volumeApplied, 
      0
    ) / historicalEvents.length;
    
    const difference = calculatedVolume - averageHistoricalVolume;
    const differencePercentage = (difference / averageHistoricalVolume) * 100;
    
    let suggestion = '';
    if (Math.abs(differencePercentage) < 10) {
      suggestion = 'El volumen calculado es similar al histórico. Estrategia consistente.';
    } else if (differencePercentage > 10) {
      suggestion = `El volumen calculado es ${differencePercentage.toFixed(1)}% mayor que el histórico. ` +
                  'Considere si las condiciones actuales justifican más agua (mayor VPD, temperatura alta).';
    } else {
      suggestion = `El volumen calculado es ${Math.abs(differencePercentage).toFixed(1)}% menor que el histórico. ` +
                  'Podría estar aplicando demasiada agua o el drenaje es excesivo.';
    }
    
    return {
      calculatedVolume,
      averageHistoricalVolume,
      difference,
      differencePercentage,
      suggestion
    };
  }

  // ==========================================================================
  // PRIVATE CALCULATION METHODS
  // ==========================================================================

  /**
   * Calculate water depleted from container based on depletion percentage
   * 
   * Formula: Water Depleted = Container Volume × ATD% × (Depletion% / 100)
   * 
   * Example: 18.2L container, 25.99% ATD, 30% depletion
   * = 18.2 × 0.2599 × 0.30 = 1.42L depleted
   */
  private calculateWaterDepleted(
    curve: SubstrateReleaseCurve,
    depletionPercentage: number
  ): number {
    const containerVolume = curve.containerVolume;
    const totalAvailableWater = curve.waterZones.totalAvailableWater / 100; // Convert to decimal
    
    const waterDepleted = containerVolume * totalAvailableWater * (depletionPercentage / 100);
    
    return waterDepleted;
  }

  /**
   * Determine recommendation level based on depletion percentage
   */
  private getRecommendationLevel(
    depletionPercentage: number
  ): 'optimal' | 'acceptable' | 'caution' | 'critical' {
    if (depletionPercentage >= 80) return 'critical';
    if (depletionPercentage >= 60) return 'caution';
    if (depletionPercentage >= 40) return 'acceptable';
    return 'optimal';
  }

  /**
   * Generate recommendation text based on depletion level
   */
  private getRecommendationText(
    depletionPercentage: number,
    drainPercentage: number,
    level: 'optimal' | 'acceptable' | 'caution' | 'critical'
  ): string {
    const recommendations = {
      optimal: `Excelente estrategia. Con ${depletionPercentage}% de agotamiento, mantiene el sustrato ` +
               `en la zona de agua fácilmente disponible. El ${drainPercentage}% de drenaje asegura lixiviación adecuada.`,
      
      acceptable: `Estrategia aceptable. Con ${depletionPercentage}% de agotamiento, el agua aún está disponible ` +
                  `pero se acerca al límite. Monitoree las condiciones climáticas.`,
      
      caution: `⚠️ Precaución: ${depletionPercentage}% de agotamiento está en zona de estrés. ` +
               `El agua está menos disponible y la planta podría sufrir. Considere aumentar frecuencia.`,
      
      critical: `🚨 Crítico: ${depletionPercentage}% de agotamiento es muy alto. ` +
                `Riesgo de marchitez y pérdida de producción. Riegue inmediatamente.`
    };
    
    return recommendations[level];
  }

  /**
   * Generate detailed reasoning points for the recommendation
   */
  private getReasoningPoints(input: IrrigationVolumeInput): string[] {
    const points: string[] = [];
    const depletion = input.depletionPercentage;
    const curve = input.substrateCurve;
    
    // Point 1: Water availability zone
    if (depletion <= 40) {
      points.push(
        `Agua en zona fácilmente disponible (${curve.waterZones.easilyAvailableWater.toFixed(1)}% ATD)`
      );
    } else if (depletion <= 70) {
      points.push(
        `Entrando en zona de agua de reserva (${curve.waterZones.reserveWater.toFixed(1)}% del total)`
      );
    } else {
      points.push(
        `⚠️ Más allá del agua de reserva - estrés hídrico probable`
      );
    }
    
    // Point 2: Matric potential estimate
    const estimatedPsi = this.estimateMatricPotential(depletion, curve);
    points.push(`Potencial mátrico estimado: ~${estimatedPsi.toFixed(1)} kPa`);
    
    // Point 3: Drain percentage assessment
    if (input.targetDrainPercentage < 15) {
      points.push(`⚠️ Drenaje bajo (${input.targetDrainPercentage}%) - riesgo de acumulación de sales`);
    } else if (input.targetDrainPercentage > 30) {
      points.push(`Drenaje alto (${input.targetDrainPercentage}%) - posible desperdicio de agua y nutrientes`);
    } else {
      points.push(`✓ Drenaje óptimo (${input.targetDrainPercentage}%) para lixiviación`);
    }
    
    // Point 4: Irrigation frequency implication
    if (depletion <= 25) {
      points.push(`Riegos frecuentes necesarios (posiblemente múltiples por día)`);
    } else if (depletion <= 40) {
      points.push(`Frecuencia moderada (1-2 riegos por día típicamente)`);
    } else {
      points.push(`Menor frecuencia de riego pero mayor estrés entre eventos`);
    }
    
    return points;
  }

  /**
   * Estimate matric potential based on depletion percentage
   * Uses the substrate curve to interpolate psi from water content
   */
  private estimateMatricPotential(
    depletionPercentage: number,
    curve: SubstrateReleaseCurve
  ): number {
    // Calculate current water content
    const containerCapacity = curve.characteristicPoints.containerCapacity.volumetricWaterContent;
    const totalAvailableWater = curve.waterZones.totalAvailableWater;
    const waterDepleted = totalAvailableWater * (depletionPercentage / 100);
    const currentWaterContent = containerCapacity - waterDepleted;
    
    // Find corresponding psi from curve
    // Linear interpolation between known points
    const points = curve.dataPoints;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      if (currentWaterContent <= p1.volumetricWaterContent && 
          currentWaterContent >= p2.volumetricWaterContent) {
        
        // Linear interpolation
        const fraction = (p1.volumetricWaterContent - currentWaterContent) / 
                        (p1.volumetricWaterContent - p2.volumetricWaterContent);
        return p1.matricPotential + fraction * (p2.matricPotential - p1.matricPotential);
      }
    }
    
    // If not found, return estimate
    return depletionPercentage < 50 ? 3 : 8;
  }

  /**
   * Calculate visual zones for slider/display
   */
  private calculateZones(curve: SubstrateReleaseCurve): any {
    return {
      optimal: { min: 0, max: 40 },
      acceptable: { min: 40, max: 60 },
      caution: { min: 60, max: 80 },
      critical: { min: 80, max: 100 }
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Format volume for display with appropriate unit
   */
  formatVolume(liters: number): string {
    if (liters < 0.1) {
      return `${(liters * 1000).toFixed(0)} mL`;
    } else if (liters < 1) {
      return `${(liters * 1000).toFixed(0)} mL`;
    } else if (liters < 10) {
      return `${liters.toFixed(2)} L`;
    } else {
      return `${liters.toFixed(1)} L`;
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(minutes: number): string {
    if (minutes < 1) {
      return `${(minutes * 60).toFixed(0)} segundos`;
    } else if (minutes < 60) {
      return `${minutes.toFixed(1)} minutos`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}min`;
    }
  }

  /**
   * Get color for depletion level
   */
  getDepletionColor(depletionPercentage: number, config: CalculatorConfig): string {
    if (depletionPercentage >= 80) return config.colors.critical;
    if (depletionPercentage >= 60) return config.colors.caution;
    if (depletionPercentage >= 40) return config.colors.acceptable;
    return config.colors.optimal;
  }
}
```

---

### **STEP 3: Create Angular Component** (1 hour)

**File**: `src/app/features/irrigation-engineering-design/components/irrigation-volume-calculator/irrigation-volume-calculator.component.ts`

```typescript
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

// Services & Models
import { IrrigationVolumeCalculatorService } from '../../services/irrigation-volume-calculator.service';
import { SubstrateReleaseCurve } from '../../models/substrate-analysis.models';
import {
  IrrigationVolumeInput,
  IrrigationVolumeOutput,
  CalculatorConfig,
  IrrigationPreset
} from '../../models/irrigation-calculator.models';

@Component({
  selector: 'app-irrigation-volume-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './irrigation-volume-calculator.component.html',
  styleUrls: ['./irrigation-volume-calculator.component.css']
})
export class IrrigationVolumeCalculatorComponent implements OnInit, OnChanges {
  
  // ===== INPUTS =====
  @Input() substrateCurve?: SubstrateReleaseCurve;
  @Input() numberOfContainers: number = 1000;
  @Input() containersPerPlant: number = 1;
  @Input() totalArea: number = 1000;      // m²
  @Input() plantDensity: number = 2.5;    // plants/m²
  @Input() showStandalone: boolean = true; // If false, hides substrate selector
  
  // ===== OUTPUTS =====
  @Output() volumeCalculated = new EventEmitter<IrrigationVolumeOutput>();
  @Output() applyIrrigation = new EventEmitter<IrrigationVolumeOutput>();
  
  // ===== FORM =====
  calculatorForm!: FormGroup;
  
  // ===== DATA =====
  config: CalculatorConfig;
  presets: IrrigationPreset[];
  calculationResult: IrrigationVolumeOutput | null = null;
  
  // ===== UI STATE =====
  isCalculating = false;
  showAdvancedOptions = false;
  selectedPresetId: string | null = null;
  
  // ===== REAL-TIME SLIDER VALUE =====
  currentDepletionValue: number = 30;

  constructor(
    private fb: FormBuilder,
    private calculatorService: IrrigationVolumeCalculatorService
  ) {
    this.config = this.calculatorService.getDefaultConfig();
    this.presets = this.calculatorService.getIrrigationPresets();
  }

  ngOnInit(): void {
    this.initializeForm();
    
    // Auto-calculate if substrate curve provided
    if (this.substrateCurve) {
      this.calculate();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recalculate if substrate curve changes
    if (changes['substrateCurve'] && !changes['substrateCurve'].firstChange) {
      if (this.calculatorForm && this.substrateCurve) {
        this.calculate();
      }
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private initializeForm(): void {
    this.calculatorForm = this.fb.group({
      depletionPercentage: [
        this.config.defaultDepletionPercentage,
        [
          Validators.required,
          Validators.min(this.config.minDepletionPercentage),
          Validators.max(this.config.maxDepletionPercentage)
        ]
      ],
      drainPercentage: [
        this.config.defaultDrainPercentage,
        [Validators.required, Validators.min(0), Validators.max(50)]
      ],
      numberOfContainers: [this.numberOfContainers, [Validators.required, Validators.min(1)]],
      containersPerPlant: [this.containersPerPlant, [Validators.required, Validators.min(1)]],
      totalArea: [this.totalArea, [Validators.required, Validators.min(1)]],
      plantDensity: [this.plantDensity, [Validators.required, Validators.min(0.1)]],
      systemFlowRate: [this.config.systemFlowRate, [Validators.min(0.1)]],
      numberOfValves: [1, [Validators.required, Validators.min(1)]]
    });
    
    // Initialize slider value
    this.currentDepletionValue = this.config.defaultDepletionPercentage;
  }

  // ==========================================================================
  // CALCULATION
  // ==========================================================================

  calculate(): void {
    if (!this.substrateCurve) {
      console.warn('Cannot calculate: substrate curve not provided');
      return;
    }
    
    if (this.calculatorForm.invalid) {
      console.warn('Form invalid');
      return;
    }
    
    this.isCalculating = true;
    
    const formValue = this.calculatorForm.value;
    
    const input: IrrigationVolumeInput = {
      substrateCurve: this.substrateCurve,
      numberOfContainers: formValue.numberOfContainers,
      containersPerPlant: formValue.containersPerPlant,
      totalArea: formValue.totalArea,
      plantDensity: formValue.plantDensity,
      depletionPercentage: formValue.depletionPercentage,
      targetDrainPercentage: formValue.drainPercentage
    };
    
    // Perform calculation
    this.calculationResult = this.calculatorService.calculateIrrigationVolume(input);
    
    // Calculate duration if flow rate available
    if (formValue.systemFlowRate && formValue.systemFlowRate > 0) {
      this.calculationResult.durationMinutes = this.calculatorService.calculateDuration(
        this.calculationResult.totalVolumeWithDrain,
        formValue.systemFlowRate,
        formValue.numberOfValves
      );
    }
    
    // Emit result
    this.volumeCalculated.emit(this.calculationResult);
    
    this.isCalculating = false;
  }

  // ==========================================================================
  // PRESET ACTIONS
  // ==========================================================================

  applyPreset(preset: IrrigationPreset): void {
    this.selectedPresetId = preset.id;
    
    this.calculatorForm.patchValue({
      depletionPercentage: preset.depletionPercentage,
      drainPercentage: preset.drainPercentage
    });
    
    this.currentDepletionValue = preset.depletionPercentage;
    this.calculate();
  }

  // ==========================================================================
  // SLIDER INTERACTION
  // ==========================================================================

  onDepletionSliderChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.currentDepletionValue = value;
    this.calculatorForm.patchValue({ depletionPercentage: value });
    
    // Clear preset selection when manually adjusted
    this.selectedPresetId = null;
  }

  onDepletionSliderRelease(): void {
    // Calculate when user releases slider (avoids too many calculations)
    this.calculate();
  }

  // ==========================================================================
  // USER ACTIONS
  // ==========================================================================

  applyIrrigationNow(): void {
    if (this.calculationResult) {
      this.applyIrrigation.emit(this.calculationResult);
    }
  }

  resetToDefaults(): void {
    this.calculatorForm.patchValue({
      depletionPercentage: this.config.defaultDepletionPercentage,
      drainPercentage: this.config.defaultDrainPercentage
    });
    this.currentDepletionValue = this.config.defaultDepletionPercentage;
    this.selectedPresetId = null;
    this.calculate();
  }

  toggleAdvancedOptions(): void {
    this.showAdvancedOptions = !this.showAdvancedOptions

    ;
  }

  // ==========================================================================
  // HELPER GETTERS FOR TEMPLATE
  // ==========================================================================

  get depletionColor(): string {
    return this.calculatorService.getDepletionColor(this.currentDepletionValue, this.config);
  }

  get totalPlants(): number {
    return this.calculatorForm.value.numberOfContainers / this.calculatorForm.value.containersPerPlant;
  }

  formatVolume(liters: number): string {
    return this.calculatorService.formatVolume(liters);
  }

  formatDuration(minutes: number): string {
    return this.calculatorService.formatDuration(minutes);
  }

  getZoneClass(zone: 'optimal' | 'acceptable' | 'caution' | 'critical'): string {
    const zoneClasses = {
      optimal: 'zone-optimal',
      acceptable: 'zone-acceptable',
      caution: 'zone-caution',
      critical: 'zone-critical'
    };
    return zoneClasses[zone];
  }

  isDepletionInZone(zone: 'optimal' | 'acceptable' | 'caution' | 'critical'): boolean {
    if (!this.calculationResult) return false;
    const zones = this.calculationResult.zones;
    const depletion = this.currentDepletionValue;
    return depletion >= zones[zone].min && depletion < zones[zone].max;
  }
}
```

---

### **STEP 4: Create Component Template** (1 hour)

**File**: `src/app/features/irrigation-engineering-design/components/irrigation-volume-calculator/irrigation-volume-calculator.component.html`

```html
<!-- ============================================================================
     IRRIGATION VOLUME CALCULATOR COMPONENT TEMPLATE
     ============================================================================ -->

<div class="irrigation-volume-calculator">

  <!-- ==================== HEADER ==================== -->
  <div class="calculator-header">
    <div class="header-content">
      <h3 class="header-title">
        <i class="bi bi-calculator"></i>
        Calculadora de Volumen de Riego
      </h3>
      <p class="header-subtitle">
        Determine el volumen óptimo de riego basado en el agotamiento del agua disponible
      </p>
    </div>
  </div>

  <!-- ==================== NO SUBSTRATE CURVE WARNING ==================== -->
  <div class="alert alert-warning" *ngIf="!substrateCurve">
    <i class="bi bi-exclamation-triangle"></i>
    <strong>Curva de sustrato no disponible.</strong>
    Por favor seleccione un medio de cultivo y contenedor primero.
  </div>

  <!-- ==================== MAIN CALCULATOR (when substrate curve available) ==================== -->
  <div class="calculator-main" *ngIf="substrateCurve">

    <!-- ==================== QUICK PRESETS ==================== -->
    <div class="presets-section">
      <h5 class="section-title">
        <i class="bi bi-lightning"></i>
        Estrategias Rápidas
      </h5>
      <div class="presets-grid">
        <div 
          *ngFor="let preset of presets" 
          class="preset-card"
          [class.active]="selectedPresetId === preset.id"
          (click)="applyPreset(preset)">
          <div class="preset-icon">
            <i class="bi {{ preset.icon }}"></i>
          </div>
          <div class="preset-content">
            <h6 class="preset-name">{{ preset.name }}</h6>
            <p class="preset-description">{{ preset.description }}</p>
            <div class="preset-values">
              <span class="value-badge">{{ preset.depletionPercentage }}% agotamiento</span>
              <span class="value-badge">{{ preset.drainPercentage }}% drenaje</span>
            </div>
            <div class="preset-suitable">
              <small>
                <i class="bi bi-check-circle"></i>
                {{ preset.suitableFor.join(' • ') }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MANUAL CONFIGURATION ==================== -->
    <form [formGroup]="calculatorForm" class="calculator-form">

      <!-- DEPLETION SLIDER (Primary Control) -->
      <div class="form-section depletion-slider-section">
        <div class="slider-header">
          <label class="form-label">
            <i class="bi bi-sliders"></i>
            Porcentaje de Agotamiento
          </label>
          <div class="current-value" [style.color]="depletionColor">
            <span class="value-number">{{ currentDepletionValue }}</span>
            <span class="value-unit">%</span>
          </div>
        </div>

        <!-- Visual Zones Background -->
        <div class="zones-background">
          <div class="zone zone-optimal" [style.width.%]="40"></div>
          <div class="zone zone-acceptable" [style.width.%]="20"></div>
          <div class="zone zone-caution" [style.width.%]="20"></div>
          <div class="zone zone-critical" [style.width.%]="20"></div>
        </div>

        <!-- Slider Input -->
        <input 
          type="range" 
          class="form-range depletion-slider"
          [formControlName]="'depletionPercentage'"
          [min]="config.minDepletionPercentage"
          [max]="config.maxDepletionPercentage"
          [value]="currentDepletionValue"
          (input)="onDepletionSliderChange($event)"
          (change)="onDepletionSliderRelease()"
          [style.--slider-color]="depletionColor">

        <!-- Zone Labels -->
        <div class="zone-labels">
          <span class="zone-label optimal">Óptimo<br>0-40%</span>
          <span class="zone-label acceptable">Aceptable<br>40-60%</span>
          <span class="zone-label caution">Precaución<br>60-80%</span>
          <span class="zone-label critical">Crítico<br>80-100%</span>
        </div>

        <!-- Current Zone Indicator -->
        <div class="current-zone-indicator" *ngIf="calculationResult">
          <span 
            class="zone-badge"
            [ngClass]="getZoneClass(calculationResult.recommendationLevel)">
            <i class="bi bi-circle-fill"></i>
            {{ calculationResult.recommendationLevel === 'optimal' ? 'Óptimo' :
               calculationResult.recommendationLevel === 'acceptable' ? 'Aceptable' :
               calculationResult.recommendationLevel === 'caution' ? 'Precaución' : 'Crítico' }}
          </span>
        </div>
      </div>

      <!-- DRAIN PERCENTAGE -->
      <div class="form-section">
        <label class="form-label">
          <i class="bi bi-funnel"></i>
          Porcentaje de Drenaje Objetivo
          <i 
            class="bi bi-question-circle-fill text-muted ms-2" 
            title="Agua que debe drenar para lixiviar sales. Típicamente 15-25%"></i>
        </label>
        <div class="input-group">
          <input 
            type="number" 
            class="form-control"
            formControlName="drainPercentage"
            min="0"
            max="50"
            step="5"
            (change)="calculate()">
          <span class="input-group-text">%</span>
        </div>
      </div>

      <!-- ADVANCED OPTIONS TOGGLE -->
      <div class="advanced-toggle">
        <button 
          type="button" 
          class="btn btn-link"
          (click)="toggleAdvancedOptions()">
          <i class="bi" [ngClass]="showAdvancedOptions ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          {{ showAdvancedOptions ? 'Ocultar' : 'Mostrar' }} Opciones Avanzadas
        </button>
      </div>

      <!-- ADVANCED OPTIONS -->
      <div class="advanced-options" *ngIf="showAdvancedOptions">
        <div class="row g-3">
          
          <!-- Number of Containers -->
          <div class="col-md-6">
            <label class="form-label">
              <i class="bi bi-box"></i>
              Número de Contenedores
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="numberOfContainers"
              min="1"
              (change)="calculate()">
          </div>

          <!-- Containers per Plant -->
          <div class="col-md-6">
            <label class="form-label">
              <i class="bi bi-diagram-3"></i>
              Contenedores por Planta
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="containersPerPlant"
              min="1"
              (change)="calculate()">
          </div>

          <!-- Total Area -->
          <div class="col-md-6">
            <label class="form-label">
              <i class="bi bi-bounding-box"></i>
              Área Total (m²)
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="totalArea"
              min="1"
              step="0.1"
              (change)="calculate()">
          </div>

          <!-- Plant Density -->
          <div class="col-md-6">
            <label class="form-label">
              <i class="bi bi-grid"></i>
              Densidad de Plantas (plantas/m²)
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="plantDensity"
              min="0.1"
              step="0.1"
              (change)="calculate()">
          </div>

          <!-- System Flow Rate -->
          <div class="col-md-6">
            <label class="form-label">
              <i class="bi bi-water"></i>
              Caudal del Sistema (L/min)
              <i 
                class="bi bi-question-circle-fill text-muted ms-2" 
                title="Flujo de agua total disponible. Usado para calcular duración."></i>
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="systemFlowRate"
              min="0.1"
              step="0.1"
              (change)="calculate()">
          </div>

          <!-- Number of Valves -->
          <div class="col-md-6">
            <label class="form-label">
              <i class="bi bi-diagram-2"></i>
              Número de Válvulas Simultáneas
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="numberOfValves"
              min="1"
              (change)="calculate()">
          </div>

        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-primary btn-calculate"
          (click)="calculate()"
          [disabled]="calculatorForm.invalid || !substrateCurve">
          <i class="bi bi-calculator"></i>
          Calcular Volumen
        </button>
        <button 
          type="button" 
          class="btn btn-outline-secondary"
          (click)="resetToDefaults()">
          <i class="bi bi-arrow-counterclockwise"></i>
          Restablecer
        </button>
      </div>

    </form>

    <!-- ==================== CALCULATION RESULTS ==================== -->
    <div class="results-section" *ngIf="calculationResult && !isCalculating">
      
      <!-- RECOMMENDATION ALERT -->
      <div 
        class="alert recommendation-alert"
        [ngClass]="{
          'alert-success': calculationResult.recommendationLevel === 'optimal',
          'alert-warning': calculationResult.recommendationLevel === 'acceptable',
          'alert-orange': calculationResult.recommendationLevel === 'caution',
          'alert-danger': calculationResult.recommendationLevel === 'critical'
        }">
        <div class="alert-icon">
          <i class="bi" [ngClass]="{
            'bi-check-circle-fill': calculationResult.recommendationLevel === 'optimal',
            'bi-exclamation-circle-fill': calculationResult.recommendationLevel === 'acceptable',
            'bi-exclamation-triangle-fill': calculationResult.recommendationLevel === 'caution',
            'bi-x-circle-fill': calculationResult.recommendationLevel === 'critical'
          }"></i>
        </div>
        <div class="alert-content">
          <h5 class="alert-heading">{{ calculationResult.recommendation }}</h5>
          <ul class="reasoning-list">
            <li *ngFor="let reason of calculationResult.reasoning">{{ reason }}</li>
          </ul>
        </div>
      </div>

      <!-- RESULTS CARDS -->
      <div class="results-grid">
        
        <!-- Per Container Card -->
        <div class="result-card">
          <div class="card-icon">
            <i class="bi bi-box text-primary"></i>
          </div>
          <div class="card-content">
            <h6 class="card-title">Por Contenedor</h6>
            <div class="card-value">
              {{ formatVolume(calculationResult.volumeWithDrainPerContainer) }}
            </div>
            <div class="card-details">
              <small>
                Agua consumida: {{ formatVolume(calculationResult.waterDepletedPerContainer) }}<br>
                + Drenaje: {{ formatVolume(calculationResult.volumeWithDrainPerContainer - calculationResult.volumeNeededPerContainer) }}
              </small>
            </div>
          </div>
        </div>

        <!-- Total System Card -->
        <div class="result-card primary-card">
          <div class="card-icon">
            <i class="bi bi-droplet-fill text-primary"></i>
          </div>
          <div class="card-content">
            <h6 class="card-title">Volumen Total del Sistema</h6>
            <div class="card-value large">
              {{ formatVolume(calculationResult.totalVolumeWithDrain) }}
            </div>
            <div class="card-details">
              <small>
                {{ calculatorForm.value.numberOfContainers }} contenedores × 
                {{ formatVolume(calculationResult.volumeWithDrainPerContainer) }}
              </small>
            </div>
          </div>
        </div>

        <!-- Per Area Card -->
        <div class="result-card">
          <div class="card-icon">
            <i class="bi bi-grid text-success"></i>
          </div>
          <div class="card-content">
            <h6 class="card-title">Por Área</h6>
            <div class="card-value">
              {{ calculationResult.volumePerSquareMeter | number:'1.2-2' }} L/m²
            </div>
            <div class="card-details">
              <small>
                Tasa de precipitación: {{ calculationResult.precipitationRate | number:'1.2-2' }} mm
              </small>
            </div>
          </div>
        </div>

        <!-- Duration Card (if available) -->
        <div class="result-card" *ngIf="calculationResult.durationMinutes">
          <div class="card-icon">
            <i class="bi bi-clock text-info"></i>
          </div>
          <div class="card-content">
            <h6 class="card-title">Duración Estimada</h6>
            <div class="card-value">
              {{ formatDuration(calculationResult.durationMinutes) }}
            </div>
            <div class="card-details">
              <small>
                Caudal: {{ calculatorForm.value.systemFlowRate }} L/min × 
                {{ calculatorForm.value.numberOfValves }} válvula(s)
              </small>
            </div>
          </div>
        </div>

      </results-grid>

      <!-- APPLY IRRIGATION BUTTON -->
      <div class="apply-section">
        <button 
          type="button" 
          class="btn btn-lg btn-success btn-apply"
          (click)="applyIrrigationNow()">
          <i class="bi bi-play-circle-fill"></i>
          Aplicar Riego Ahora
          <span class="volume-badge">{{ formatVolume(calculationResult.totalVolumeWithDrain) }}</span>
        </button>
        <p class="apply-note">
          <i class="bi bi-info-circle"></i>
          Esta acción programará un evento de riego con el volumen calculado
        </p>
      </div>

    </div>

    <!-- ==================== LOADING STATE ==================== -->
    <div class="loading-state" *ngIf="isCalculating">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Calculando...</span>
      </div>
      <p class="loading-text">Calculando volumen óptimo...</p>
    </div>

  </div>

</div>
```

---

### **STEP 5: Create Component Styles** (45 minutes)

**File**: `src/app/features/irrigation-engineering-design/components/irrigation-volume-calculator/irrigation-volume-calculator.component.css`

```css
/* ============================================================================
   IRRIGATION VOLUME CALCULATOR STYLES
   ============================================================================ */

/* ==================== VARIABLES ==================== */
:root {
  --optimal-color: #28a745;
  --acceptable-color: #ffc107;
  --caution-color: #fd7e14;
  --critical-color: #dc3545;
  --primary-color: #007bff;
  --dark-color: #343a40;
  --light-bg: #f8f9fa;
  --border-color: #dee2e6;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* ==================== MAIN CONTAINER ==================== */
.irrigation-volume-calculator {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

/* ==================== HEADER ==================== */
.calculator-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title i {
  color: var(--primary-color);
}

.header-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

/* ==================== PRESETS SECTION ==================== */
.presets-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.preset-card {
  background: var(--light-bg);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 1rem;
}

.preset-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.preset-card.active {
  background: #e7f3ff;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.preset-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.preset-content {
  flex: 1;
}

.preset-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
}

.preset-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.preset-values {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.value-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
}

.preset-suitable {
  font-size: 0.75rem;
  color: #6c757d;
}

.preset-suitable i {
  color: var(--optimal-color);
}

/* ==================== DEPLETION SLIDER SECTION ==================== */
.depletion-slider-section {
  background: var(--light-bg);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.current-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.value-number {
  font-weight: 700;
}

.value-unit {
  font-size: 1.5rem;
  margin-left: 0.25rem;
}

/* Zones Background */
.zones-background {
  display: flex;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.zone {
  height: 100%;
  transition: all 0.3s ease;
}

.zone-optimal {
  background: linear-gradient(90deg, var(--optimal-color), #20c997);
}

.zone-acceptable {
  background: linear-gradient(90deg, #20c997, var(--acceptable-color));
}

.zone-caution {
  background: linear-gradient(90deg, var(--acceptable-color), var(--caution-color));
}

.zone-critical {
  background: linear-gradient(90deg, var(--caution-color), var(--critical-color));
}

/* Slider */
.depletion-slider {
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: transparent;
  outline: none;
  margin-bottom: 0.5rem;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.depletion-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--slider-color, var(--primary-color));
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.depletion-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.depletion-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--slider-color, var(--primary-color));
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.depletion-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Zone Labels */
.zone-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.zone-label {
  font-size: 0.75rem;
  text-align: center;
  flex: 1;
  font-weight: 600;
}

.zone-label.optimal { color: var(--optimal-color); }
.zone-label.acceptable { color: var(--acceptable-color); }
.zone-label.caution { color: var(--caution-color); }
.zone-label.critical { color: var(--critical-color); }

/* Current Zone Indicator */
.current-zone-indicator {
  text-align: center;
  margin-top: 1rem;
}

.zone-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
}

.zone-badge.zone-optimal {
  background: var(--optimal-color);
  color: white;
}

.zone-badge.zone-acceptable {
  background: var(--acceptable-color);
  color: var(--dark-color);
}

.zone-badge.zone-caution {
  background: var(--caution-color);
  color: white;
}

.zone-badge.zone-critical {
  background: var(--critical-color);
  color: white;
}

/* ==================== FORM SECTIONS ==================== */
.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-control {
  border: 2px solid var(--border-color);
  border-radius: 6px;
  padding: 0.625rem 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* ==================== ADVANCED OPTIONS ==================== */
.advanced-toggle {
  text-align: center;
  margin: 1rem 0;
}

.advanced-toggle .btn-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.advanced-toggle .btn-link:hover {
  text-decoration: underline;
}

.advanced-options {
  background: var(--light-bg);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

/* ==================== ACTION BUTTONS ==================== */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-calculate {
  flex: 1;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-calculate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 123, 255, 0.3);
}

/* ==================== RESULTS SECTION ==================== */
.results-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 3px solid var(--border-color);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Recommendation Alert */
.recommendation-alert {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  border: none;
  box-shadow: var(--shadow-sm);
}

.alert-orange {
  background-color: #fff3cd;
  border-left: 4px solid var(--caution-color);
  color: #856404;
}

.alert-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-heading {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.reasoning-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.reasoning-list li {
  padding: 0.5rem 0;
  line-height: 1.5;
}

.reasoning-list li::before {
  content: '✓ ';
  color: var(--optimal-color);
  font-weight: 700;
  margin-right: 0.5rem;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2