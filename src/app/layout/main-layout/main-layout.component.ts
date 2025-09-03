// src/app/layout/main-layout/main-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Observable } from 'rxjs';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-main-layout',
  template: `
    <div class="container-fluid">
      <div class="row flex-nowrap">
        <!-- <app-sidebar></app-sidebar> -->
        <div class="col py-3">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  imports: [SidebarComponent]
})
export class MainLayoutComponent implements OnInit {
  constructor(private authService: AuthService) {}
  currentUser$: Observable<any> | undefined;

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;

  }
}