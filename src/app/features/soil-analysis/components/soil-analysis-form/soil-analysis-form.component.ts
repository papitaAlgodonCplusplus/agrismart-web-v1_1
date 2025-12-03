import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoilAnalysisService } from '../../services/soil-analysis.service';
import {
  SoilAnalysis,
  SoilAnalysisResponse,
  SoilTextureInfo,
  TextureValidation
} from '../../models/soil-analysis.models';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-soil-analysis-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './soil-analysis-form.component.html',
  styleUrls: ['./soil-analysis-form.component.css']
})
export class SoilAnalysisFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() cropProductionId!: number;
  @Input() existingSoilAnalysis?: SoilAnalysisResponse;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() saved = new EventEmitter<SoilAnalysisResponse>();
  @Output() cancelled = new EventEmitter<void>();

  soilAnalysisForm!: FormGroup;
  textureClasses: SoilTextureInfo[] = [];
  textureValidation: TextureValidation | null = null;

  isSubmitting = false;
  errorMessage = '';

  // Form sections visibility
  showPhysicalProperties = true;
  showChemicalProperties = true;
  showMacronutrients = true;
  showMicronutrients = false;
  showInterpretation = true;

  // Phosphorus extraction methods
  phosphorusMethods = ['Olsen', 'Bray1', 'Bray2', 'Mehlich3', 'Other'];

  // Interpretation levels
  interpretationLevels = ['Low', 'Medium', 'High', 'Very High'];

  constructor(
    private fb: FormBuilder,
    private soilAnalysisService: SoilAnalysisService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadTextureClasses();
    this.setupTextureValidation();

    if (this.existingSoilAnalysis) {
      this.populateForm(this.existingSoilAnalysis);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private initializeForm(): void {
    this.soilAnalysisForm = this.fb.group({
      // Metadata
      sampleDate: [new Date().toISOString().split('T')[0], Validators.required],
      labReportNumber: [''],
      labName: [''],
      sampleDepth: ['0-20cm'],
      sampleLocation: [''],

      // Physical Properties - Texture
      sandPercent: [null, [Validators.min(0), Validators.max(100)]],
      siltPercent: [null, [Validators.min(0), Validators.max(100)]],
      clayPercent: [null, [Validators.min(0), Validators.max(100)]],
      textureClass: [''],
      bulkDensity: [null, [Validators.min(0), Validators.max(3)]],

      // Chemical Properties
      phSoil: [null, [Validators.min(3), Validators.max(10)]],
      electricalConductivity: [null, [Validators.min(0)]],
      organicMatterPercent: [null, [Validators.min(0), Validators.max(100)]],
      cationExchangeCapacity: [null, [Validators.min(0)]],

      // Macronutrients - Nitrogen
      nitrateNitrogen: [null, [Validators.min(0)]],
      ammoniumNitrogen: [null, [Validators.min(0)]],
      totalNitrogen: [null, [Validators.min(0)]],

      // Macronutrients - Others
      phosphorus: [null, [Validators.min(0)]],
      phosphorusMethod: ['Mehlich3'],
      potassium: [null, [Validators.min(0)]],
      calcium: [null, [Validators.min(0)]],
      magnesium: [null, [Validators.min(0)]],
      sulfur: [null, [Validators.min(0)]],

      // Secondary Nutrients
      sodium: [null, [Validators.min(0)]],
      chloride: [null, [Validators.min(0)]],

      // Micronutrients
      iron: [null, [Validators.min(0)]],
      manganese: [null, [Validators.min(0)]],
      zinc: [null, [Validators.min(0)]],
      copper: [null, [Validators.min(0)]],
      boron: [null, [Validators.min(0)]],
      molybdenum: [null, [Validators.min(0)]],

      // Interpretation
      interpretationLevel: [''],
      recommendations: [''],
      notes: ['']
    });
  }

  private loadTextureClasses(): void {
    this.soilAnalysisService.getTextureClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.textureClasses = classes;
        },
        error: (error) => {
          console.error('Error loading texture classes:', error);
        }
      });
  }

  private setupTextureValidation(): void {
    // Watch for changes in texture percentages
    const sand$ = this.soilAnalysisForm.get('sandPercent')!.valueChanges;
    const silt$ = this.soilAnalysisForm.get('siltPercent')!.valueChanges;
    const clay$ = this.soilAnalysisForm.get('clayPercent')!.valueChanges;

    // Combine all three and debounce
    sand$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.validateTexture());

    silt$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.validateTexture());

    clay$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.validateTexture());
  }

  private populateForm(soilAnalysis: SoilAnalysisResponse): void {
    // Convert date to YYYY-MM-DD format for input
    const sampleDate = new Date(soilAnalysis.sampleDate);
    const formattedDate = sampleDate.toISOString().split('T')[0];

    this.soilAnalysisForm.patchValue({
      ...soilAnalysis,
      sampleDate: formattedDate
    });
  }

  // ==========================================================================
  // TEXTURE VALIDATION
  // ==========================================================================

  private validateTexture(): void {
    const sand = this.soilAnalysisForm.get('sandPercent')?.value;
    const silt = this.soilAnalysisForm.get('siltPercent')?.value;
    const clay = this.soilAnalysisForm.get('clayPercent')?.value;

    if (sand !== null && silt !== null && clay !== null) {
      this.soilAnalysisService.validateTexture(sand, silt, clay)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (validation) => {
            this.textureValidation = validation;

            if (validation && validation.isValid && validation.textureClass) {
              // Auto-fill texture class
              this.soilAnalysisForm.patchValue({
                textureClass: validation.textureClass
              }, { emitEvent: false });
            }
          },
          error: (error) => {
            console.error('Texture validation error:', error);
          }
        });
    }
  }

  // ==========================================================================
  // FORM ACTIONS
  // ==========================================================================

  onSubmit(): void {
    if (this.soilAnalysisForm.invalid) {
      this.markFormGroupTouched(this.soilAnalysisForm);
      this.errorMessage = 'Por favor complete los campos requeridos correctamente';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const soilAnalysisData: SoilAnalysis = {
      ...this.soilAnalysisForm.value,
      cropProductionId: this.cropProductionId,
      active: true
    };

    const operation = this.mode === 'edit' && this.existingSoilAnalysis
      ? this.soilAnalysisService.update(this.existingSoilAnalysis.id!, soilAnalysisData)
      : this.soilAnalysisService.create(soilAnalysisData);

    operation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.saved.emit(result);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Error al guardar análisis de suelo';
          console.error('Save error:', error);
        }
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onReset(): void {
    this.soilAnalysisForm.reset({
      sampleDate: new Date().toISOString().split('T')[0],
      phosphorusMethod: 'Mehlich3',
      sampleDepth: '0-20cm'
    });
    this.textureValidation = null;
  }

  // ==========================================================================
  // SECTION TOGGLES
  // ==========================================================================

  toggleSection(section: string): void {
    switch (section) {
      case 'physical':
        this.showPhysicalProperties = !this.showPhysicalProperties;
        break;
      case 'chemical':
        this.showChemicalProperties = !this.showChemicalProperties;
        break;
      case 'macro':
        this.showMacronutrients = !this.showMacronutrients;
        break;
      case 'micro':
        this.showMicronutrients = !this.showMicronutrients;
        break;
      case 'interpretation':
        this.showInterpretation = !this.showInterpretation;
        break;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.soilAnalysisForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.soilAnalysisForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }

  get texturePercentageSum(): number {
    const sand = this.soilAnalysisForm.get('sandPercent')?.value || 0;
    const silt = this.soilAnalysisForm.get('siltPercent')?.value || 0;
    const clay = this.soilAnalysisForm.get('clayPercent')?.value || 0;
    return sand + silt + clay;
  }

  get isTextureSumValid(): boolean {
    const sum = this.texturePercentageSum;
    return sum === 0 || Math.abs(sum - 100) <= 2;
  }
}
