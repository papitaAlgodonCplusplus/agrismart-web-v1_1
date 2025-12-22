import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { SplitApplicationService } from '../../services/split-application.service';
import {
  SplitApplicationInput,
  SplitApplicationSchedule,
  GrowthStage,
  SplitStrategyPreset,
  SplitStrategyComparison,
  CalendarEvent
} from '../../models/split-application.models';
import { ApiService } from '../../../../core/services/api.service';
import { CropService } from '../../../crops/services/crop.service';

@Component({
  selector: 'app-split-application-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './split-application-calculator.component.html',
  styleUrls: ['./split-application-calculator.component.css']
})
export class SplitApplicationCalculatorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Form
  splitForm!: FormGroup;

  // Data
  strategyPresets: SplitStrategyPreset[] = [];
  selectedPreset: SplitStrategyPreset | null = null;
  growthStages: GrowthStage[] = [];
  crops: any[] = [];
  cropPhases: any[] = [];
  cropPhaseSolutionRequirements: any[] = [];

  // Results
  calculationResult: SplitApplicationSchedule | null = null;
  strategyComparisons: SplitStrategyComparison[] = [];

  // UI State
  isCalculating = false;
  isLoadingData = true;
  showComparison = false;
  showCalendar = false;
  activeView: 'table' | 'timeline' | 'chart' = 'table';
  errorMessage = '';

  // Removed CROP_TEMPLATES - using API data instead

  constructor(
    private fb: FormBuilder,
    private splitService: SplitApplicationService,
    private apiService: ApiService,
    private cropService: CropService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadStrategyPresets();
    this.loadDataFromAPI();
    this.setupFormListeners();
  }

  /**
   * Load data from API (crops, phases, requirements)
   */
  private loadDataFromAPI(): void {
    this.isLoadingData = true;

    forkJoin({
      crops: this.cropService.getAll().pipe(catchError(() => of([]))),
      cropPhases: this.apiService.get<any>('/CropPhase').pipe(catchError(() => of([]))),
      requirements: this.apiService.get<any>('/CropPhaseSolutionRequirement').pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.crops = Array.isArray(data.crops) ? data.crops : [];
          this.cropPhases = Array.isArray(data.cropPhases) ? data.cropPhases : [];

          // Extract crop phase requirements from response
          if (data.requirements?.cropPhaseRequirements) {
            this.cropPhaseSolutionRequirements = data.requirements.cropPhaseRequirements;
          } else if (Array.isArray(data.requirements)) {
            this.cropPhaseSolutionRequirements = data.requirements;
          }

          console.log(`Loaded ${this.crops.length} crops, ${this.cropPhases.length} phases, ${this.cropPhaseSolutionRequirements.length} requirements`);

          this.isLoadingData = false;

          // Set first crop as default if no crop is selected
          if (this.crops.length > 0 && !this.splitForm.get('cropName')?.value) {
            const defaultCrop = this.crops[0].name;
            this.splitForm.patchValue({ cropName: defaultCrop }, { emitEvent: false });
            this.loadGrowthStages(defaultCrop);
          } else {
            // Load growth stages for selected crop
            const cropName = this.splitForm.get('cropName')?.value;
            if (cropName) {
              this.loadGrowthStages(cropName);
            }
          }
        },
        error: (error) => {
          console.error('Error loading data from API:', error);
          this.isLoadingData = false;
          this.growthStages = [];
          this.errorMessage = 'Failed to load data from API. Please check your connection and try again.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private initializeForm(): void {
    this.splitForm = this.fb.group({
      // Crop information
      cropName: ['', Validators.required],  // Will be set after crops load
      cropArea: [1.0, [Validators.required, Validators.min(0.1)]],
      plantingDate: [new Date().toISOString().split('T')[0], Validators.required],
      cycleDays: [120, [Validators.required, Validators.min(30), Validators.max(365)]],

      // Total nutrients (kg/ha)
      totalN: [200, [Validators.required, Validators.min(0)]],
      totalP: [80, [Validators.required, Validators.min(0)]],
      totalK: [250, [Validators.required, Validators.min(0)]],
      totalCa: [150, [Validators.min(0)]],
      totalMg: [50, [Validators.min(0)]],
      totalS: [40, [Validators.min(0)]],

      // Split strategy
      splitStrategy: ['demand-based', Validators.required],
      numberOfSplits: [4, [Validators.required, Validators.min(2), Validators.max(12)]],
      strategyPreset: [''],

      // Application method
      applicationMethod: ['fertigation', Validators.required],

      // Constraints
      minDaysBetween: [7, [Validators.required, Validators.min(1)]],
      maxNPerApp: [80, [Validators.required, Validators.min(10)]],

      // Environmental
      soilType: ['loam', Validators.required],
      rainySeasonAdjustment: [false]
    });
  }

  private loadStrategyPresets(): void {
    this.splitService.getStrategyPresets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (presets) => {
          this.strategyPresets = presets;
        },
        error: (error) => {
          console.error('Error loading strategy presets:', error);
        }
      });
  }

  private setupFormListeners(): void {
    // Load growth stages when crop changes
    this.splitForm.get('cropName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(cropName => {
        this.loadGrowthStages(cropName);
      });

    // Apply preset when selected
    this.splitForm.get('strategyPreset')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(presetId => {
        if (presetId) {
          this.applyPreset(presetId);
        }
      });

    // Calculate harvest date when planting date or cycle days change
    this.splitForm.get('plantingDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateHarvestDate());

    this.splitForm.get('cycleDays')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateHarvestDate());

    // Load initial growth stages
    this.loadGrowthStages(this.splitForm.get('cropName')?.value);
  }

  // ==========================================================================
  // DATA LOADING
  // ==========================================================================

  private loadGrowthStages(cropName: string): void {
    // Find crop by name
    const crop = this.crops.find(c => c.name === cropName || c.scientificName === cropName);

    if (!crop) {
      console.warn(`Crop "${cropName}" not found in API data - no growth stages available`);
      this.growthStages = [];
      this.errorMessage = `Crop "${cropName}" not found. Please configure crop data in the system.`;
      return;
    }

    // Find crop phases for this crop
    const phases = this.cropPhases.filter(p => p.cropId === crop.id);

    if (phases.length === 0) {
      console.warn(`No phases found for crop "${cropName}" - no growth stages available`);
      this.growthStages = [];
      this.errorMessage = `No growth phases configured for "${cropName}". Please add crop phases in the system.`;
      return;
    }

    // Convert API phases to GrowthStage format
    this.growthStages = phases.map((phase, index) => {
      // Find solution requirements for this phase
      const requirement = this.cropPhaseSolutionRequirements.find(r =>
        r.phaseId === phase.id || r.cropPhaseId === phase.id
      );

      // Calculate nutrient demands from solution requirement (normalize to 0-1 scale)
      const getNutrientDemand = (value: number | undefined, max: number): number => {
        if (!value) return 0.5;
        return Math.min(value / max, 1.0);
      };

      const nitrogenDemand = requirement ? getNutrientDemand(requirement.nO3 + (requirement.nH4 || 0), 200) : 0.6;
      const phosphorusDemand = requirement ? getNutrientDemand(requirement.h2PO4, 100) : 0.5;
      const potassiumDemand = requirement ? getNutrientDemand(requirement.k, 300) : 0.7;
      const calciumDemand = requirement ? getNutrientDemand(requirement.ca, 200) : 0.6;
      const magnesiumDemand = requirement ? getNutrientDemand(requirement.mg, 75) : 0.5;

      // Determine growth rate based on nutrient demands
      const avgDemand = (nitrogenDemand + phosphorusDemand + potassiumDemand) / 3;
      const growthRate: 'slow' | 'moderate' | 'rapid' =
        avgDemand > 0.7 ? 'rapid' :
        avgDemand > 0.4 ? 'moderate' : 'slow';

      // Critical periods are typically high nutrient demand periods
      const criticalPeriod = avgDemand > 0.6;

      // Calculate days
      const startDay = phase.startingWeek ? (phase.startingWeek * 7) : (index === 0 ? 0 : phases[index - 1].endingWeek ? (phases[index - 1].endingWeek * 7) : 0);
      const endDay = phase.endingWeek ? (phase.endingWeek * 7) : startDay + (phase.durationWeeks ? phase.durationWeeks * 7 : 14);

      return {
        id: phase.id || index + 1,
        name: phase.name || `Fase ${index + 1}`,
        startDay,
        endDay,
        durationDays: endDay - startDay,
        description: phase.description || `Fase ${index + 1} del cultivo`,
        nitrogenDemand,
        phosphorusDemand,
        potassiumDemand,
        calciumDemand,
        magnesiumDemand,
        growthRate,
        criticalPeriod,
        notes: phase.criticalNotes
      };
    });

    // Sort by start day
    this.growthStages.sort((a, b) => a.startDay - b.startDay);

    console.log(`Loaded ${this.growthStages.length} growth stages from API for "${cropName}"`);
  }


  private updateHarvestDate(): void {
    const plantingDate = new Date(this.splitForm.get('plantingDate')?.value);
    const cycleDays = this.splitForm.get('cycleDays')?.value || 0;

    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + cycleDays);

    // Store for display (not in form)
    this.calculationResult = null; // Clear old results
  }

  // ==========================================================================
  // PRESET HANDLING
  // ==========================================================================

  private applyPreset(presetId: string): void {
    this.splitService.getStrategyPreset(presetId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preset) => {
          if (preset) {
            this.selectedPreset = preset;
            this.splitForm.patchValue({
              numberOfSplits: preset.numberOfSplits
            }, { emitEvent: false });
          }
        }
      });
  }

  // ==========================================================================
  // CALCULATION
  // ==========================================================================

  calculate(): void {
    if (this.splitForm.invalid) {
      this.markFormGroupTouched(this.splitForm);
      this.errorMessage = 'Por favor complete todos los campos requeridos correctamente';
      return;
    }

    this.isCalculating = true;
    this.errorMessage = '';
    this.calculationResult = null;

    const formValue = this.splitForm.value;

    // Build calculation input
    const input: SplitApplicationInput = {
      totalNutrients: {
        N: formValue.totalN,
        P: formValue.totalP,
        K: formValue.totalK,
        Ca: formValue.totalCa || 0,
        Mg: formValue.totalMg || 0,
        S: formValue.totalS || 0
      },
      cropName: formValue.cropName,
      cropArea: formValue.cropArea,
      plantingDate: new Date(formValue.plantingDate),
      harvestDate: this.getHarvestDate(),
      totalCycleDays: formValue.cycleDays,
      growthStages: this.growthStages,
      splitStrategy: formValue.splitStrategy,
      numberOfSplits: formValue.numberOfSplits,
      applicationMethod: formValue.applicationMethod,
      minDaysBetweenApplications: formValue.minDaysBetween,
      maxNPerApplication: formValue.maxNPerApp,
      rainySeasonAdjustment: formValue.rainySeasonAdjustment,
      soilType: formValue.soilType
    };

    // Calculate split schedule
    this.splitService.calculateSplitSchedule(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.calculationResult = result;
          this.isCalculating = false;
        },
        error: (error) => {
          console.error('Calculation error:', error);
          this.errorMessage = 'Error al calcular programa de aplicaciones';
          this.isCalculating = false;
        }
      });
  }

  compareStrategies(): void {
    if (this.splitForm.invalid) {
      this.errorMessage = 'Complete el formulario antes de comparar estrategias';
      return;
    }

    const formValue = this.splitForm.value;

    const input: SplitApplicationInput = {
      totalNutrients: {
        N: formValue.totalN,
        P: formValue.totalP,
        K: formValue.totalK,
        Ca: formValue.totalCa || 0,
        Mg: formValue.totalMg || 0,
        S: formValue.totalS || 0
      },
      cropName: formValue.cropName,
      cropArea: formValue.cropArea,
      plantingDate: new Date(formValue.plantingDate),
      harvestDate: this.getHarvestDate(),
      totalCycleDays: formValue.cycleDays,
      growthStages: this.growthStages,
      splitStrategy: 'demand-based',
      numberOfSplits: 3, // Will be overridden in comparison
      applicationMethod: formValue.applicationMethod,
      minDaysBetweenApplications: formValue.minDaysBetween,
      maxNPerApplication: formValue.maxNPerApp,
      rainySeasonAdjustment: formValue.rainySeasonAdjustment,
      soilType: formValue.soilType
    };

    this.splitService.compareStrategies(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comparisons) => {
          this.strategyComparisons = comparisons;
          this.showComparison = true;
        },
        error: (error) => {
          console.error('Comparison error:', error);
        }
      });
  }

  // ==========================================================================
  // UI ACTIONS
  // ==========================================================================

  switchView(view: 'table' | 'timeline' | 'chart'): void {
    this.activeView = view;
  }

  toggleComparison(): void {
    this.showComparison = !this.showComparison;
    if (this.showComparison && this.strategyComparisons.length === 0) {
      this.compareStrategies();
    }
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  reset(): void {
    this.splitForm.reset({
      cropName: 'Tomate',
      cropArea: 1.0,
      plantingDate: new Date().toISOString().split('T')[0],
      cycleDays: 120,
      totalN: 200,
      totalP: 80,
      totalK: 250,
      totalCa: 150,
      totalMg: 50,
      totalS: 40,
      splitStrategy: 'demand-based',
      numberOfSplits: 4,
      applicationMethod: 'fertigation',
      minDaysBetween: 7,
      maxNPerApp: 80,
      soilType: 'loam',
      rainySeasonAdjustment: false
    });

    this.calculationResult = null;
    this.strategyComparisons = [];
    this.showComparison = false;
    this.showCalendar = false;
  }

  exportToCSV(): void {
    if (!this.calculationResult) return;

    // Build CSV content
    let csv = 'Aplicación,Fecha,Días después de siembra,Fase,N (kg/ha),P (kg/ha),K (kg/ha),Ca (kg/ha),Mg (kg/ha),S (kg/ha),Prioridad,Instrucciones\n';

    this.calculationResult.applications.forEach(app => {
      const row = [
        app.applicationNumber,
        app.applicationDate.toLocaleDateString(),
        app.daysAfterPlanting,
        app.growthStage,
        app.nutrients.N.toFixed(1),
        app.nutrients.P.toFixed(1),
        app.nutrients.K.toFixed(1),
        app.nutrients.Ca.toFixed(1),
        app.nutrients.Mg.toFixed(1),
        app.nutrients.S.toFixed(1),
        app.priority,
        `"${app.instructions}"`
      ].join(',');

      csv += row + '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `programa_aplicaciones_${this.calculationResult.cropName}_${Date.now()}.csv`;
    link.click();
  }

  printSchedule(): void {
    window.print();
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private getHarvestDate(): Date {
    const plantingDate = new Date(this.splitForm.get('plantingDate')?.value);
    const cycleDays = this.splitForm.get('cycleDays')?.value || 0;
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + cycleDays);
    return harvestDate;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.splitForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.splitForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Campo requerido';
      if (field.errors['min']) return `Mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Máximo: ${field.errors['max'].max}`;
    }
    return '';
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'badge bg-danger';
      case 'high': return 'badge bg-warning';
      case 'medium': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  getEfficiencyColorClass(value: number): string {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-warning';
    return 'text-danger';
  }

  getRiskColorClass(risk: string): string {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-danger';
      default: return 'text-muted';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
