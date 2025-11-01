// src/app/app.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';

declare var bootstrap: any; // For Bootstrap 5 JavaScript components

interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AgriSmart';
  
  // Application state
  isInitializing = true;
  isOnline = navigator.onLine;
  showConnectionStatus = false;
  
  // PWA features
  updateAvailable = false;
  showPwaPrompt = false;
  private deferredPrompt: PWAInstallPromptEvent | null = null;
  
  // Global progress
  showGlobalProgress = false;
  globalProgressValue = 0;
  
  // Cleanup subscription
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('AppComponent constructor - Initial URL:', this.router.url);
    this.setupPWAEventListeners();
    // Don't call initializeApp() here - the router hasn't processed the URL yet
  }

  ngOnInit(): void {
    console.log('AppComponent ngOnInit - Current URL:', this.router.url);
    console.log('AppComponent ngOnInit - Is Authenticated:', this.authService.isAuthenticated());

    this.setupConnectionStatusMonitoring();
    this.setupKeyboardShortcuts();
    this.checkForUpdates();

    // Subscribe to router events to log all navigations
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      console.log('Navigation completed to:', event.urlAfterRedirects);
    });

    // Initialize application after a brief delay to show loading screen
    setTimeout(() => {
      this.isInitializing = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the application
   */
  private initializeApp(): void {
    // Removed automatic redirection logic
    // The router configuration and AuthGuard handle routing properly
    // This prevents conflicts with public routes like /register
  }

  /**
   * Connection Status Monitoring
   */
  private setupConnectionStatusMonitoring(): void {
    // Show connection status initially if offline
    if (!this.isOnline) {
      this.showConnectionStatus = true;
    }

    // Monitor online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showConnectionStatus = true;
      this.showToast('success', 'Conexión restablecida', 'La conexión a internet ha sido restablecida.');
      
      // Hide after 3 seconds
      setTimeout(() => {
        this.showConnectionStatus = false;
      }, 3000);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showConnectionStatus = true;
      this.showToast('warning', 'Sin conexión', 'No hay conexión a internet. Algunos datos pueden no estar actualizados.');
    });
  }

  getConnectionStatusClass(): string {
    return this.isOnline ? 'connection-online' : 'connection-offline';
  }

  getConnectionIcon(): string {
    return this.isOnline ? 'bi-wifi' : 'bi-wifi-off';
  }

  getConnectionStatusText(): string {
    return this.isOnline ? 'En línea' : 'Sin conexión';
  }

  /**
   * Global Toast Notification System
   */
  showToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    const toastElement = document.getElementById(`${type}Toast`);
    const toastBody = document.getElementById(`${type}ToastBody`);
    
    if (toastElement && toastBody) {
      toastBody.textContent = message;
      
      const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: type === 'error' ? 8000 : 5000 // Errors show longer
      });
      
      toast.show();
    }
  }

  /**
   * Global Progress Bar
   */
  showProgress(value: number = 0): void {
    this.showGlobalProgress = true;
    this.globalProgressValue = value;
  }

  updateProgress(value: number): void {
    this.globalProgressValue = Math.min(100, Math.max(0, value));
    
    if (value >= 100) {
      setTimeout(() => {
        this.hideProgress();
      }, 500);
    }
  }

  hideProgress(): void {
    this.showGlobalProgress = false;
    this.globalProgressValue = 0;
  }

  /**
   * Keyboard Shortcuts
   */
  private setupKeyboardShortcuts(): void {
    // Global keyboard shortcuts will be handled here
    // Individual components can also handle their own shortcuts
  }

  private focusSearchInput(): void {
    // Find and focus the search input if it exists
    const searchInput = document.querySelector('input[placeholder*="Buscar"], input[placeholder*="buscar"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  private showShortcutsModal(): void {
    const modalElement = document.getElementById('shortcutsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private closeModalsAndOverlays(): void {
    // Close any open modals
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    });

    // Close any open dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('show');
    });
  }

  /**
   * PWA (Progressive Web App) Features
   */
  private setupPWAEventListeners(): void {
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPromptEvent;
      
      // Show install prompt after a delay
      setTimeout(() => {
        this.showPwaPrompt = true;
      }, 10000); // Show after 10 seconds
    });

    // Listen for PWA install success
    window.addEventListener('appinstalled', () => {
      this.showPwaPrompt = false;
      this.showToast('success', 'Aplicación instalada', 'AgriSmart se ha instalado correctamente en tu dispositivo.');
      this.deferredPrompt = null;
    });
  }

  installPwa(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó instalar la PWA');
        } else {
          console.log('Usuario rechazó instalar la PWA');
        }
        this.deferredPrompt = null;
        this.showPwaPrompt = false;
      });
    }
  }

  dismissPwaPrompt(): void {
    this.showPwaPrompt = false;
    
    // Don't show again for 30 days
    localStorage.setItem('pwa-prompt-dismissed', new Date().getTime().toString());
  }

  /**
   * App Updates
   */
  private checkForUpdates(): void {
    // This would integrate with Angular Service Worker for update detection
    // For now, we'll simulate update availability
    
    // Check if user dismissed update recently
    const updateDismissed = localStorage.getItem('update-dismissed');
    if (updateDismissed) {
      const dismissTime = parseInt(updateDismissed);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissTime < oneDayInMs) {
        return; // Don't show update prompt again today
      }
    }

    // Simulate update check (replace with actual Service Worker integration)
    setTimeout(() => {
      const hasUpdate = Math.random() > 0.8; // 20% chance of update
      if (hasUpdate) {
        this.updateAvailable = true;
      }
    }, 5000);
  }

  installUpdate(): void {
    this.showProgress(0);
    
    // Simulate update installation progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      this.updateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        this.updateAvailable = false;
        this.showToast('success', 'Actualización completada', 'AgriSmart se ha actualizado correctamente.');
        
        // Reload the page after update (in real implementation)
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }, 300);
  }

  dismissUpdate(): void {
    this.updateAvailable = false;
    localStorage.setItem('update-dismissed', new Date().getTime().toString());
  }

  /**
   * Error Handling
   */
  @HostListener('window:error', ['$event'])
  handleGlobalError(event: ErrorEvent): void {
    console.error('Global error caught:', event.error);
    this.showToast('error', 'Error de aplicación', 'Ha ocurrido un error inesperado. Por favor, recarga la página.');
  }

  @HostListener('window:unhandledrejection', ['$event'])
  handleUnhandledPromiseRejection(event: PromiseRejectionEvent): void {
    console.error('Unhandled promise rejection:', event.reason);
    this.showToast('error', 'Error de conexión', 'Problema de conectividad. Verifica tu conexión a internet.');
  }
}