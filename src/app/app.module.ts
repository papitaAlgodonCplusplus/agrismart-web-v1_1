// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

// Core
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Layout
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

// Auth Components
import { LoginComponent } from './features/auth/login/login.component';

// Dashboard
import { DashboardComponent } from './features/dashboard/dashboard.component';

// Companies
import { CompanyListComponent } from './features/companies/company-list/company-list.component';
import { CompanyFormComponent } from './features/companies/company-form/company-form.component';

// Farms
import { FarmListComponent } from './features/farms/farm-list/farm-list.component';
import { FarmFormComponent } from './features/farms/farm-form/farm-form.component';

// Crops
import { CropListComponent } from './features/crops/crop-list/crop-list.component';
import { CropFormComponent } from './features/crops/crop-form/crop-form.component';

// Devices
import { DeviceListComponent } from './features/devices/device-list/device-list.component';
import { DeviceFormComponent } from './features/devices/device-form/device-form.component';

// Production Units
import { ProductionUnitListComponent } from './features/production-units/production-unit-list/production-unit-list.component';

// Crop Production
import { CropProductionListComponent } from './features/crop-production/crop-production-list/crop-production-list.component';

// Irrigation
import { IrrigationSectorListComponent } from './features/irrigation/irrigation-sector-list.component';

// Fertilizers
import { FertilizerListComponent } from './features/fertilizers/fertilizer-list/fertilizer-list.component';

// Fertilizer Inputs
import { FertilizerInputListComponent } from './features/fertilizer-inputs/fertilizer-input-list/fertilizer-input-list.component';

// Users
import { UserListComponent } from './features/users/user-list/user-list.component';

// Profile
import { ProfileComponent } from './features/profile/profile.component';

@NgModule({
  declarations: [
    // Layout Components
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    
    // Auth Components
    LoginComponent,
    
    // Dashboard
    DashboardComponent,
    
    // Companies
    CompanyListComponent,
    CompanyFormComponent,
    
    // Farms
    FarmListComponent,
    FarmFormComponent,
    
    // Crops
    CropListComponent,
    CropFormComponent,
    
    // Devices
    DeviceListComponent,
    DeviceFormComponent,
    
    // Production Units
    ProductionUnitListComponent,
    
    // Crop Production
    CropProductionListComponent,
    
    // Irrigation
    IrrigationSectorListComponent,
    
    // Fertilizers
    FertilizerListComponent,
    
    // Fertilizer Inputs
    FertilizerInputListComponent,
    
    // Users
    UserListComponent,
    
    // Profile
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }