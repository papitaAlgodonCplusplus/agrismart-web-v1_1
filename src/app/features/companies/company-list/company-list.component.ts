// src/app/features/companies/components/company-list/company-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../services/company.service';
import { Company } from '../../../core/models/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2>Lista de Empresas</h2>
      <hr>
      
      <div class="mb-3">
        <div class="form-check">
          <input 
            class="form-check-input"
            type="checkbox"
            id="onlyActive"
            [(ngModel)]="onlyActive"
            (change)="loadCompanies()">
          <label class="form-check-label" for="onlyActive">
            Solo Activas
          </label>
        </div>
        <button class="btn btn-primary me-2" (click)="loadCompanies()">Consultar</button>
        <button class="btn btn-secondary" (click)="createNew()">Nuevo</button>
      </div>

      <div class="table-responsive" *ngIf="companies$ | async as companies">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let company of companies">
              <td>{{ company.id }}</td>
              <td>{{ company.name }}</td>
              <td>{{ company.description }}</td>
              <td>
                <span class="badge" [ngClass]="company.isActive ? 'bg-success' : 'bg-danger'">
                  {{ company.isActive ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="edit(company)">
                  Editar
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="delete(company)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CompanyListComponent implements OnInit {
  companies$: Observable<Company[]> | undefined;
  onlyActive = true;

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companies$ = this.companyService.getAll(this.onlyActive);
  }

  createNew(): void {
    // Navigate to create form or open modal
    console.log('Create new company');
  }

  edit(company: Company): void {
    // Navigate to edit form or open modal
    console.log('Edit company:', company);
  }

  delete(company: Company): void {
    if (confirm(`¿Está seguro de eliminar la empresa ${company.name}?`)) {
      this.companyService.delete(company.id).subscribe(() => {
        this.loadCompanies(); // Reload list
      });
    }
  }
}