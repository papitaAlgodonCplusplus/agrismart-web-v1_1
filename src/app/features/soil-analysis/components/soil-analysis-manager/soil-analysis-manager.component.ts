import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SoilAnalysisFormComponent } from '../soil-analysis-form/soil-analysis-form.component';
import { SoilAnalysisService } from '../../services/soil-analysis.service';
import { SoilAnalysisResponse } from '../../models/soil-analysis.models';
import { Router } from '@angular/router';
import { CropProductionService } from '../../../crop-production/services/crop-production.service';
import { CropProduction } from '../../../../core/models/models';

@Component({
  selector: 'app-soil-analysis-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, SoilAnalysisFormComponent],
  templateUrl: './soil-analysis-manager.component.html',
  styleUrls: ['./soil-analysis-manager.component.css']
})
export class SoilAnalysisManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  cropProductionId: number | null = null;
  cropProductions: CropProduction[] = [];
  soilAnalyses: SoilAnalysisResponse[] = [];
  selectedAnalysis?: SoilAnalysisResponse;

  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  isLoading = false;
  isLoadingProductions = false;
  errorMessage = '';

  activeView: 'list' | 'form' = 'list';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private soilAnalysisService: SoilAnalysisService,
    private cropProductionService: CropProductionService
  ) { }

  ngOnInit(): void {
    // Get cropProductionId from route params if available
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['cropProductionId']) {
        this.cropProductionId = +params['cropProductionId'];
        this.loadSoilAnalyses();
      }
    });

    // Load available crop productions
    this.loadCropProductions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // ==========================================================================
  // DATA LOADING
  // ==========================================================================

  loadCropProductions(): void {
    this.isLoadingProductions = true;

    this.cropProductionService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Crop productions response:', response);

          // Handle both array and wrapped response formats
          const productions = Array.isArray(response) ? response : (response.cropProductions || response.result || []);
          this.cropProductions = productions;
          this.isLoadingProductions = false;

          // Auto-select first production if none selected
          if (!this.cropProductionId && productions.length > 0) {
            this.cropProductionId = productions[0].id!;
            this.loadSoilAnalyses();
          }
        },
        error: (error) => {
          console.error('Error loading crop productions:', error);
          this.cropProductions = []; // Ensure it's always an array
          this.isLoadingProductions = false;
        }
      });
  }

  loadSoilAnalyses(): void {
    if (!this.cropProductionId) {
      this.errorMessage = 'Por favor seleccione una producción de cultivo';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.soilAnalysisService.getByCropProduction(this.cropProductionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analyses: any) => {
          console.log('Soil analyses loaded:', analyses.soilAnalyses);
          this.soilAnalyses = analyses.soilAnalyses || [];
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error al cargar análisis de suelo';
          this.isLoading = false;
        }
      });
  }

  onCropProductionChange(): void {
    this.loadSoilAnalyses();
  }

  // ==========================================================================
  // FORM ACTIONS
  // ==========================================================================

  onCreateNew(): void {
    if (!this.cropProductionId) {
      this.errorMessage = 'Por favor seleccione una producción de cultivo antes de crear un análisis de suelo';
      return;
    }

    this.selectedAnalysis = undefined;
    this.formMode = 'create';
    this.showForm = true;
    this.activeView = 'form';
    this.errorMessage = '';
  }

  onEdit(analysis: SoilAnalysisResponse): void {
    this.selectedAnalysis = analysis;
    this.formMode = 'edit';
    this.showForm = true;
    this.activeView = 'form';
  }

  onFormSaved(result: SoilAnalysisResponse): void {
    // Reload list and show success message
    this.loadSoilAnalyses();
    this.showForm = false;
    this.activeView = 'list';
    this.selectedAnalysis = undefined;

    // Show success notification (you can implement a toast service)
    alert(`Análisis de suelo ${this.formMode === 'edit' ? 'actualizado' : 'creado'} exitosamente`);
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.activeView = 'list';
    this.selectedAnalysis = undefined;
  }

  onDelete(analysis: SoilAnalysisResponse): void {
    if (!analysis.id || !this.cropProductionId) return;

    if (confirm(`¿Está seguro de eliminar el análisis de suelo del ${new Date(analysis.sampleDate).toLocaleDateString()}?`)) {
      this.soilAnalysisService.delete(this.cropProductionId, analysis.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSoilAnalyses();
            alert('Análisis eliminado exitosamente');
          },
          error: (error) => {
            alert('Error al eliminar: ' + error.message);
          }
        });
    }
  }

  // ==========================================================================
  // VIEW CONTROL
  // ==========================================================================

  switchView(view: 'list' | 'form'): void {
    this.activeView = view;
    if (view === 'list') {
      this.showForm = false;
      this.selectedAnalysis = undefined;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  getSelectedProduction(): CropProduction | undefined {
    return this.cropProductions.find(p => p.id === this.cropProductionId);
  }
}
