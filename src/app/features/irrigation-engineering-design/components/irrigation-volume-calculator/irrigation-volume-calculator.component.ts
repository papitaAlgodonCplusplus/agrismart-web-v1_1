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
import { CropProductionService } from '../../../crop-production/services/crop-production.service';
import { CropProduction } from '../../../../core/models/models';

@Component({
  selector: 'app-irrigation-volume-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './irrigation-volume-calculator.component.html',
  styleUrls: ['./irrigation-volume-calculator.component.scss']
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
  config!: CalculatorConfig;
  presets!: IrrigationPreset[];
  calculationResult: IrrigationVolumeOutput | null = null;
  cropProductions: CropProduction[] = [];
  selectedCropProduction: CropProduction | null = null;

  // ===== UI STATE =====
  isCalculating = false;
  showAdvancedOptions = false;
  selectedPresetId: string | null = null;
  useCropProductionData = false;
  isLoadingCropProductions = false;

  // ===== REAL-TIME SLIDER VALUE =====
  currentDepletionValue: number = 30;

  constructor(
    private fb: FormBuilder,
    private calculatorService: IrrigationVolumeCalculatorService,
    private cropProductionService: CropProductionService
  ) {
    this.config = this.calculatorService.getDefaultConfig();
    this.presets = this.calculatorService.getIrrigationPresets();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCropProductions();

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
    this.showAdvancedOptions = !this.showAdvancedOptions;
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

  // ==========================================================================
  // CROP PRODUCTION DATA INTEGRATION
  // ==========================================================================

  loadCropProductions(): void {
    this.isLoadingCropProductions = true;
    this.cropProductionService.getAll({ onlyActive: true }).subscribe({
      next: (response: any) => {
        // Handle both array response and object with result property
        if (Array.isArray(response)) {
          this.cropProductions = response;
        } else if (response && response.result && Array.isArray(response.result)) {
          this.cropProductions = response.result;
        } else if (response && Array.isArray(response.cropProductions)) {
          this.cropProductions = response.cropProductions;
        } else {
          console.warn('Unexpected crop production response format:', response);
          this.cropProductions = [];
        }
        this.isLoadingCropProductions = false;
      },
      error: (error) => {
        console.error('Error loading crop productions:', error);
        this.isLoadingCropProductions = false;
        this.cropProductions = [];
      }
    });
  }

  onCropProductionSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const cropProductionId = parseInt(selectElement.value);

    if (!cropProductionId) {
      this.selectedCropProduction = null;
      this.useCropProductionData = false;
      return;
    }

    this.selectedCropProduction = this.cropProductions.find(cp => cp.id === cropProductionId) || null;

    if (this.selectedCropProduction) {
      this.useCropProductionData = true;
      this.populateFormFromCropProduction(this.selectedCropProduction);
    }
  }

  populateFormFromCropProduction(cropProduction: any): void {
    // Calculate derived values from CropProduction data
    const totalArea = (cropProduction.width || 0) * (cropProduction.length || 0); // m²
    const plantDensity = this.calculatePlantDensity(
      cropProduction.betweenRowDistance || 1,
      cropProduction.betweenPlantDistance || 1
    ); // plants/m²
    const numberOfContainers = this.calculateNumberOfContainers(
      totalArea,
      cropProduction.betweenRowDistance || 1,
      cropProduction.betweenContainerDistance || 1
    );
    const containersPerPlant = cropProduction.plantsPerContainer ?
      1 / cropProduction.plantsPerContainer : 1;

    // Populate form with CropProduction data
    this.calculatorForm.patchValue({
      drainPercentage: cropProduction.drainThreshold || this.config.defaultDrainPercentage,
      numberOfContainers: numberOfContainers,
      containersPerPlant: containersPerPlant,
      totalArea: totalArea,
      plantDensity: plantDensity
      // Note: systemFlowRate and numberOfValves are not in CropProduction,
      // so they keep their current values
    });

    // Optionally update depletionPercentage if available
    if (cropProduction.depletionPercentage) {
      this.calculatorForm.patchValue({
        depletionPercentage: cropProduction.depletionPercentage
      });
      this.currentDepletionValue = cropProduction.depletionPercentage;
    }

    // Recalculate with new values
    this.calculate();
  }

  private calculatePlantDensity(betweenRowDistance: number, betweenPlantDistance: number): number {
    // Density = 1 / (row spacing × plant spacing)
    // Convert to plants per m²
    return 1 / (betweenRowDistance * betweenPlantDistance);
  }

  private calculateNumberOfContainers(
    totalArea: number,
    betweenRowDistance: number,
    betweenContainerDistance: number
  ): number {
    // Calculate number of containers based on area and spacing
    const containerSpacing = betweenRowDistance * betweenContainerDistance;
    return Math.floor(totalArea / containerSpacing);
  }

  toggleDataSource(): void {
    this.useCropProductionData = !this.useCropProductionData;

    if (!this.useCropProductionData) {
      // Reset to manual input mode
      this.selectedCropProduction = null;
    }
  }
}
