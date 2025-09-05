// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import routes
import { routes } from './app/app.routes';

// Import auth interceptor function (you'll need to convert the class to a function)
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // Router
    provideRouter(routes),
    
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    
    // Animations
    provideAnimations(),
    
    // Forms
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule
    )
  ]
}).catch(err => console.error(err));

import 'zone.js';