// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom, ErrorHandler, Injectable } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import routes
import { routes } from './app/app.routes';

// Import auth interceptor function
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

// Custom Error Handler to suppress specific Angular errors
@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Check if it's one of the errors we want to suppress
    const errorMessage = error?.message || error?.toString() || '';
    const errorCode = error?.code || '';
    
    // Suppress NG0100 and NG02100 errors
    if (errorCode === 'NG0100' || 
        errorCode === 'NG02100' || 
        errorMessage.includes('NG0100') || 
        errorMessage.includes('NG02100') ||
        errorMessage.includes('ExpressionChangedAfterItHasBeenCheckedError') ||
        errorMessage.includes('Cannot find control with name')) {
      
      // Optionally log suppressed errors in development
      if (!environment.production) {
        console.warn('Suppressed Angular Error:', errorCode || errorMessage);
      }
      return;
    }
    
    // Log other errors normally
    console.error('Angular Error:', error);
  }
}

// Import environment (you may need to adjust the path)
import { environment } from './environments/environment';

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
    ),
    
    // Custom Error Handler
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler
    }
  ]
}).catch(err => {
  // Also suppress errors in the bootstrap catch block if needed
  const errorMessage = err?.message || err?.toString() || '';
  if (!errorMessage.includes('NG0100') && !errorMessage.includes('NG02100')) {
    console.error(err);
  }
});

import 'zone.js';