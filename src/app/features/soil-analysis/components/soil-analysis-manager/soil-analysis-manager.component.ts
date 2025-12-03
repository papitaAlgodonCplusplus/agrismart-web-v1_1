import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SoilAnalysisFormComponent } from '../soil-analysis-form/soil-analysis-form.component';
import { SoilAnalysisService } from '../../services/soil-analysis.service';
import { SoilAnalysisResponse } from '../../models/soil-analysis.models';

@Component({
  selector: 'app-soil-analysis-manager',
  standalone: true,
  imports: [CommonModule, SoilAnalysisFormComponent],
  templateUrl: './soil-analysis-manager.component.html',
  styleUrls: ['./soil-analysis-manager.component.css']
})
export class SoilAnalysisManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  cropProductionId: number = 456; // Default for testing
  soilAnalyses: SoilAnalysisResponse[] = [];
  selectedAnalysis?: SoilAnalysisResponse;

  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  isLoading = false;
  errorMessage = '';

  activeView: 'list' | 'form' = 'list';

  constructor(
    private route: ActivatedRoute,
    private soilAnalysisService: SoilAnalysisService
  ) { }

  ngOnInit(): void {
    // Get cropProductionId from route params if available
    // this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
    //   if (params['cropProductionId']) {
    //     this.cropProductionId = +params['cropProductionId'];
    //   }
    // });

    this.loadSoilAnalyses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // DATA LOADING
  // ==========================================================================

  loadSoilAnalyses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.soilAnalysisService.getByCropProduction(this.cropProductionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analyses: any) => {
          console.log('Soil analyses loaded:', analyses.soilAnalyses);
          this.soilAnalyses = analyses.soilAnalyses;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error al cargar análisis de suelo';
          this.isLoading = false;
        }
      });
  }

  // ==========================================================================
  // FORM ACTIONS
  // ==========================================================================

  onCreateNew(): void {
    this.selectedAnalysis = undefined;
    this.formMode = 'create';
    this.showForm = true;
    this.activeView = 'form';
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
    if (!analysis.id) return;

    if (confirm(`¿Está seguro de eliminar el análisis de suelo del ${new Date(analysis.sampleDate).toLocaleDateString()}?`)) {
      this.soilAnalysisService.delete(analysis.id)
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
}
