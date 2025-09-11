// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/guards/auth.guard';

// Layout
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

// Auth Components
import { LoginComponent } from './features/auth/login/login.component';

// Feature Components
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CompanyListComponent } from './features/companies/company-list/company-list.component';
import { CompanyFormComponent } from './features/companies/company-form/company-form.component';
import { FarmListComponent } from './features/farms/farm-list/farm-list.component';
import { FarmFormComponent } from './features/farms/farm-form/farm-form.component';
import { CropListComponent } from './features/crops/crop-list/crop-list.component';
import { CropFormComponent } from './features/crops/crop-form/crop-form.component';
import { DeviceListComponent } from './features/devices/device-list/device-list.component';
import { DeviceFormComponent } from './features/devices/device-form/device-form.component';

// Production & Irrigation
import { ProductionUnitListComponent } from './features/production-units/production-unit-list/production-unit-list.component';
import { CropProductionListComponent } from './features/crop-production/crop-production-list/crop-production-list.component';
import { OnDemandIrrigationComponent } from './features/irrigation/on-demand-irrigation.component';
import { WaterChemistryComponent } from './features/water/water-chemistry.component';


// Fertilizers & Inputs
import { FertilizerListComponent } from './features/fertilizers/fertilizer-list/fertilizer-list.component';
import { FertilizerInputListComponent } from './features/fertilizer-inputs/fertilizer-input-list/fertilizer-input-list.component';

// Users & Administration
// import { UserListComponent } from './features/users/user-list/user-list.component';
import { ProfileComponent } from './features/profile/profile.component';

const routes: Routes = [
  // Public routes (no authentication required)
  {
    path: 'login',
    component: LoginComponent
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
        component: DashboardComponent
      },

      // Companies Management
      {
        path: 'companies',
        component: CompanyListComponent
      },
      {
        path: 'companies/new',
        component: CompanyFormComponent
      },
      {
        path: 'companies/:id/edit',
        component: CompanyFormComponent
      },
      // Farms Management
      {
        path: 'farms',
        component: FarmListComponent
      },
      {
        path: 'farms/new',
        component: FarmFormComponent
      },
      {
        path: 'farms/:id/edit',
        component: FarmFormComponent
      },

      // Crops Management
      {
        path: 'crops',
        component: CropListComponent
      },
      {
        path: 'crops/new',
        component: CropFormComponent
      },
      {
        path: 'crops/:id/edit',
        component: CropFormComponent
      },

      // Production Units
      {
        path: 'production-units',
        component: ProductionUnitListComponent
      },

      // Crop Production
      {
        path: 'crop-production',
        component: CropProductionListComponent
      },

      // Devices & IoT
      {
        path: 'devices',
        component: DeviceListComponent
      },
      {
        path: 'devices/new',
        component: DeviceFormComponent
      },
      {
        path: 'devices/:id/edit',
        component: DeviceFormComponent
      },

      // Irrigation Management
      {
        path: 'irrigation',
        children: [
          {
            path: 'sectors',
            component: OnDemandIrrigationComponent
          },
          {
            path: '',
            redirectTo: 'sectors',
            pathMatch: 'full'
          }
        ]
      },
      // Fertilizers Management
      {
        path: 'water-chemistry',
        component: WaterChemistryComponent
      },
      // Fertilizers Management
      {
        path: 'fertilizers',
        component: FertilizerListComponent
      },
      {
        path: 'fertilizer-inputs',
        component: FertilizerInputListComponent
      },

      // User Management
      // {
      //   path: 'users',
      //   component: UserListComponent
      // },
      {
        path: 'profile',
        component: ProfileComponent
      },

      // Lazy loaded feature modules (for future expansion)
      //   {
      //     path: 'reports',
      //     loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      //   },
      //   {
      //     path: 'analytics',
      //     loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
      //   }
    ]
  },

  // Catch-all route - must be last
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Set to true for debugging
    preloadingStrategy: undefined, // You can add PreloadAllModules for lazy loading
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }