// src/app/app.routes.ts (Updated)
import { Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { ProcessKPIsComponent } from './features/process-kpis/process-kpis.component';

// Layout
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

// Auth Components
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

// Admin
import { AdminComponent } from './features/admin/admin.component';

// Feature Components
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CompanyListComponent } from './features/companies/company-list/company-list.component';
import { CompanyFormComponent } from './features/companies/company-form/company-form.component';
import { FarmListComponent } from './features/farms/farm-list/farm-list.component';
import { FarmFormComponent } from './features/farms/farm-form/farm-form.component';

import { SoilAnalysisManagerComponent } from './features/soil-analysis/components/soil-analysis-manager/soil-analysis-manager.component';

// NEW: Import the new components
import { CropListComponent } from './features/crops/crop-list/crop-list.component';
import { CropFormComponent } from './features/crops/crop-form/crop-form.component';
import { CropPhaseComponent } from './features/crop-phases/crop-phase/crop-phase.component';
import { PhaseRequirementsComponent } from './features/crop-phases/phase-requirements/phase-requirements.component';

import { DeviceListComponent } from './features/devices/device-list/device-list.component';
import { DeviceFormComponent } from './features/devices/device-form/device-form.component';

// Production & Irrigation
import { ProductionUnitListComponent } from './features/production-units/production-unit-list/production-unit-list.component';
import { CropProductionListComponent } from './features/crop-production/crop-production-list/crop-production-list.component';
import { OnDemandIrrigationComponent } from './features/irrigation/on-demand-irrigation.component';
import { NutrientFormulationComponent } from './features/nutrient-formulation/nutrient-formulation.component';

// shiny-dashboard
import { ShinyDashboardComponent } from './features/dashboard/shiny/shiny-dashboard.component';

// Fertilizers & Inputs
import { FertilizerListComponent } from './features/fertilizers/fertilizer-list/fertilizer-list.component';
import { FertilizerInputListComponent } from './features/fertilizer-inputs/fertilizer-input-list/fertilizer-input-list.component';
import { WaterChemistryComponent } from './features/water/water-chemistry.component'
import { IrrigationEngineeringDesignComponent } from './features/irrigation-engineering-design/irrigation-engineering-design.component';

// Users & Administration
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  // Public routes (no authentication required)
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },

  // Admin routes (special authentication + admin role required)
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
    data: {
      title: 'Panel de Administración',
      adminOnly: true
    }
  },
  {
    path: 'nutrient-formulation',
    component: NutrientFormulationComponent,
    data: { title: 'Formulación Nutritiva' }
  },
  // Protected routes (authentication required)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },

      // Company Management
      {
        path: 'companies',
        component: CompanyListComponent,
        data: { title: 'Empresas' }
      },
      {
        path: 'companies/new',
        component: CompanyFormComponent,
        data: { title: 'Nueva Empresa' }
      },
      {
        path: 'companies/:id/edit',
        component: CompanyFormComponent,
        data: { title: 'Editar Empresa' }
      },

      // Farm Management
      {
        path: 'farms',
        component: FarmListComponent,
        data: { title: 'Fincas' }
      },
      {
        path: 'farms/new',
        component: FarmFormComponent,
        data: { title: 'Nueva Finca' }
      },
      {
        path: 'farms/:id/edit',
        component: FarmFormComponent,
        data: { title: 'Editar Finca' }
      },

      // Inside the MainLayoutComponent children array:
      {
        path: 'process-kpis',
        component: ProcessKPIsComponent,
        canActivate: [AuthGuard],
        data: { title: 'Process KPIs' }
      },
      {
        path: 'soil-analysis',
        component: SoilAnalysisManagerComponent,
        data: { title: 'Análisis de Suelo' }
      },
      {
        path: 'crops',
        component: CropListComponent,
        data: { title: 'Catálogo de Cultivos' }
      },
      {
        path: 'crops/new',
        component: CropFormComponent,
        data: { title: 'Nuevo Cultivo' }
      },
      {
        path: 'crops/:id/edit',
        component: CropFormComponent,
        data: { title: 'Editar Cultivo' }
      },

      // NEW: Crop Phase Management Routes
      {
        path: 'crop-phases',
        component: CropPhaseComponent,
        data: { title: 'Fases de Cultivo' }
      },

      // NEW: Phase Requirements Management Routes
      {
        path: 'phase-requirements',
        component: PhaseRequirementsComponent,
        data: { title: 'Requerimientos Nutricionales por Fase' }
      },

      // Device Management
      {
        path: 'devices',
        component: DeviceListComponent,
        data: { title: 'Dispositivos' }
      },
      {
        path: 'devices/new',
        component: DeviceFormComponent,
        data: { title: 'Nuevo Dispositivo' }
      },
      {
        path: 'devices/:id/edit',
        component: DeviceFormComponent,
        data: { title: 'Editar Dispositivo' }
      },

      // Production Units Management
      {
        path: 'production-units',
        component: ProductionUnitListComponent,
        data: { title: 'Unidades de Producción' }
      },

      // Shiny Dashboard
      {
        path: 'shiny-dashboard',
        component: ShinyDashboardComponent,
        data: { title: 'Dashboard Avanzado' }
      },

      // Crop Production Management
      {
        path: 'crop-production',
        component: CropProductionListComponent,
        data: { title: 'Producción de Cultivos' }
      },

      // Irrigation Management
      {
        path: 'irrigation-on-demand',
        component: OnDemandIrrigationComponent,
        data: { title: 'Riego Bajo Demanda' }
      },
      // Fertilizers Management
      {
        path: 'water-chemistry',
        component: WaterChemistryComponent
      },
      {
        path: 'irrigation-engineering-design',
        component: IrrigationEngineeringDesignComponent
      },

      // Fertilizers Management
      {
        path: 'fertilizers',
        component: FertilizerListComponent,
        data: { title: 'Fertilizantes' }
      },

      // Fertilizer Inputs Management
      {
        path: 'fertilizer-inputs',
        component: FertilizerInputListComponent,
        data: { title: 'Aportes de Fertilizante' }
      },

      // User Profile
      {
        path: 'profile',
        component: ProfileComponent,
        data: { title: 'Perfil de Usuario' }
      }
    ]
  },

  // Catch all redirect
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

// Route configuration for title and breadcrumbs
export interface RouteData {
  title?: string;
  breadcrumb?: string;
  adminOnly?: boolean;
  roles?: string[];
}