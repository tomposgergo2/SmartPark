import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
  <div class="container">
    <ng-container *ngIf="showHeader">
      <nav class="navbar navbar-expand-md py-2">
        <div class="container-fluid px-0">
          <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/dashboard">
            <div class="logo-placeholder">SP</div>
            <div>
              <div class="h6 mb-0">SmartPark</div>
              <div class="small text-muted">Park smarter</div>
            </div>
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#spNav" aria-controls="spNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="spNav">
            <ul class="navbar-nav ms-auto align-items-center">
              <li class="nav-item" *ngIf="!user">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">Bejelentkezés</a>
              </li>

              <ng-container *ngIf="user">
                <ng-container *ngIf="user.role === 'USER'">
                  <li class="nav-item"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Vezérlőpult</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/user/vehicles" routerLinkActive="active"><i class="bi bi-car-front-fill"></i> Járművek</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/user/zones" routerLinkActive="active"><i class="bi bi-geo-alt-fill"></i> Zónák</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/user/tickets" routerLinkActive="active"><i class="bi bi-ticket-fill"></i> Jegyek</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/user/fines" routerLinkActive="active"><i class="bi bi-exclamation-triangle-fill"></i> Bírságok</a></li>
                </ng-container>

                <ng-container *ngIf="user && (user.role === 'OFFICER' || user.role === 'PARKING_OFFICER' || user.role === 'ADMIN')">
                  <li class="nav-item"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Vezérlőpult</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/officer/lookup" routerLinkActive="active">Keresés</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/officer/fines" routerLinkActive="active">Bírságok</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/officer/inspections" routerLinkActive="active">Ellenőrzések</a></li>
                </ng-container>

                <ng-container *ngIf="user.role === 'ADMIN'">
                  <li class="nav-item"><a class="nav-link" routerLink="/admin/users" routerLinkActive="active">Users</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/admin/zones" routerLinkActive="active">Zones</a></li>
                  <li class="nav-item"><a class="nav-link" routerLink="/admin/monitoring" routerLinkActive="active">Monitoring</a></li>
                </ng-container>

                <li class="nav-item dropdown ms-2">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">{{ user.name }}</a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#changePasswordModal">Jelszó módosítása</a></li>
                    <li><a class="dropdown-item" (click)="logout()">Kijelentkezés</a></li>
                  </ul>
                </li>
              </ng-container>
            </ul>
          </div>
        </div>
      </nav>
    </ng-container>

  <router-outlet></router-outlet>
  <app-change-password></app-change-password>
  <app-payment-host></app-payment-host>
    <ng-container *ngIf="showHeader">
      <footer class="app-footer mt-4">
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between py-3">
          <div class="d-flex align-items-center gap-3">
            <a class="footer-brand d-flex align-items-center gap-2" routerLink="/dashboard">
              <div class="logo-placeholder small">SP</div>
              <div>
                <div class="fw-bold">SmartPark</div>
              </div>
            </a>
          </div>
          <div class="small text-muted mt-2 mt-md-0">© {{ today | date:'yyyy-MM-dd HH:mm' }}
            <span *ngIf="tokenLast6"> — {{ '...' + tokenLast6 }}</span>
            SmartPark — Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </ng-container>
  </div>
  `
})
export class AppComponent {
  user = this.auth.currentUserValue;
  showHeader = true;
  today = new Date();
  constructor(private auth: AuthService, private router: Router) {
    this.auth.user$.subscribe(u => this.user = u);
    // Hide the top header on the login/register page
    this.showHeader = !this.router.url.startsWith('/login');
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.showHeader = !url.startsWith('/login');
    });
  }

  get tokenLast6(): string {
    try {
      const t = localStorage.getItem('sp_token');
      return t ? t.slice(-6) : '';
    } catch (e) {
      return '';
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
