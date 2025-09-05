// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { CommonModule } from '@angular/common';

// import { AppRoutingModule } from './app-routing.module';

// // Interceptors
// import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// // Layout Components (if they exist and are standalone)
// import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
// import { SidebarComponent } from './layout/sidebar/sidebar.component';
// import { HeaderComponent } from './layout/header/header.component';

// // Auth Components
// import { LoginComponent } from './features/auth/login/login.component';

// // Feature Components
// import { DashboardComponent } from './features/dashboard/dashboard.component';

// // Company Components
// import { CompanyListComponent } from './features/companies/company-list/company-list.component';
// import { CompanyFormComponent } from './features/companies/company-form/company-form.component';

// // Farm Components
// import { FarmListComponent } from './features/farms/farm-list/farm-list.component';
// import { FarmFormComponent } from './features/farms/farm-form/farm-form.component';

// // Crop Components
// import { CropListComponent } from './features/crops/crop-list/crop-list.component';
// import { CropFormComponent } from './features/crops/crop-form/crop-form.component';

// // Device Components
// import { DeviceListComponent } from './features/devices/device-list/device-list.component';
// import { DeviceFormComponent } from './features/devices/device-form/device-form.component';

// // Production Unit Components
// import { ProductionUnitListComponent } from './features/production-units/production-unit-list/production-unit-list.component';

// // Crop Production Components
// import { CropProductionListComponent } from './features/crop-production/crop-production-list/crop-production-list.component';

// // Irrigation Components
// import { IrrigationSectorListComponent } from './features/irrigation/irrigation-sector-list.component';

// // Fertilizer Components
// import { FertilizerListComponent } from './features/fertilizers/fertilizer-list/fertilizer-list.component';

// // Fertilizer Input Components
// import { FertilizerInputListComponent } from './features/fertilizer-inputs/fertilizer-input-list/fertilizer-input-list.component';

// // User Components (if they exist)
// // import { UserListComponent } from './features/users/user-list/user-list.component';
// // import { ProfileComponent } from './features/profile/profile.component';

// @NgModule({
//   declarations: [
//     // Only include non-standalone components here
//     // If UserListComponent and ProfileComponent exist and are NOT standalone, uncomment them:
//     // UserListComponent,
//     // ProfileComponent,
//   ],
//   imports: [
//     // Core Angular modules
//     BrowserModule,
//     CommonModule,
//     HttpClientModule,
//     FormsModule,
//     ReactiveFormsModule,
//     BrowserAnimationsModule,
    
//     // App routing
//     AppRoutingModule,
    
//     // Standalone components
//     MainLayoutComponent,
//     SidebarComponent,
//     HeaderComponent,
//     LoginComponent,
//     DashboardComponent,
//     CompanyListComponent,
//     CompanyFormComponent,
//     FarmListComponent,
//     FarmFormComponent,
//     CropListComponent,
//     CropFormComponent,
//     DeviceListComponent,
//     DeviceFormComponent,
//     ProductionUnitListComponent,
//     CropProductionListComponent,
//     IrrigationSectorListComponent,
//     FertilizerListComponent,
//     FertilizerInputListComponent,
//   ],
//   providers: [
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: AuthInterceptor,
//       multi: true
//     }
//   ],
//   bootstrap: [
//     // Add your root component here, typically AppComponent
//     // AppComponent
//   ]
// })
// export class AppModule { }