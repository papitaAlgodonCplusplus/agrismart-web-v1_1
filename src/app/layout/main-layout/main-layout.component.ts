// src/app/layout/main-layout/main-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Observable } from 'rxjs';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  template: `
    <!-- Main container without height restrictions -->
    <div class="main-wrapper">
      <!-- Header (fixed or normal) -->
      <app-header class="header-wrapper"></app-header>
      
      <!-- Content area with proper overflow -->
      <div class="content-wrapper">
        <!-- Sidebar (optional - commented out for now) -->
        <!-- <app-sidebar class="sidebar-wrapper"></app-sidebar> -->
        
        <!-- Main content area -->
        <main class="main-content">
          <div class="container-fluid">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
    }
    
    .header-wrapper {
      flex-shrink: 0;
      z-index: 1000;
    }
    
    .content-wrapper {
      flex: 1;
      display: flex;
      overflow: hidden; /* Prevent layout issues */
    }
    
    .sidebar-wrapper {
      flex-shrink: 0;
      width: 280px;
      background: white;
      box-shadow: 2px 0 4px rgba(0,0,0,0.1);
      z-index: 999;
    }
    
    .main-content {
      flex: 1;
      overflow-y: auto; /* Enable vertical scrolling */
      overflow-x: hidden; /* Prevent horizontal scroll */
      height: calc(100vh - 70px); /* Account for header height */
      padding: 0;
    }
    
    .container-fluid {
      padding: 1.5rem;
      min-height: 100%;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .main-content {
        height: calc(100vh - 60px); /* Smaller header on mobile */
      }
      
      .container-fluid {
        padding: 1rem;
      }
    }
    
    /* Smooth scrolling */
    .main-content {
      scroll-behavior: smooth;
    }
    
    /* Custom scrollbar for webkit browsers */
    .main-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .main-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .main-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    .main-content::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1;
    }
  `],
  imports: [CommonModule, RouterModule, RouterOutlet, HeaderComponent]
})
export class MainLayoutComponent implements OnInit {
  currentUser$: Observable<any> | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }
}