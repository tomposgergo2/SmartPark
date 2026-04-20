import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
  <div class="user-dashboard">
    <ng-container *ngIf="user; else loading">
      <div class="row mb-3">
        <div class="col-12">
          <div class="card p-4 mb-3">
            <div class="d-flex align-items-center justify-content-between flex-column flex-md-row">
              <div>
                <div class="h4 mb-1"><i class="bi bi-tools me-2 text-primary"></i> 🛠 Admin (Adminisztrátor)</div>
                <div class="text-secondary">Kizárólag webes felület — rendszergazdai műveletek</div>
                <div class="h5 mt-2">Bejelentkezve: {{ user.name }} — <span class="fw-bold">{{ user.role }}</span></div>
                <div class="small text-muted">Gyors elérhetőségek az admin modulokhoz</div>
              </div>
              <div class="text-end mt-3 mt-md-0">
                <div class="small text-muted">Szolgáltatás állapota</div>
                <div class="status-badge">🟢 Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12 col-md-4">
          <div class="card p-3 stat-card">
            <div class="small text-secondary">Felhasználók</div>
            <div class="h3 mt-1">{{ stats?.users || '-' }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card p-3 stat-card">
            <div class="small text-secondary">Zónák</div>
            <div class="h3 mt-1">{{ stats?.zones || '-' }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card p-3 stat-card">
            <div class="small text-secondary">Aktív parkolások</div>
            <div class="h3 mt-1">{{ stats?.active_tickets || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3 dashboard-cards">
        <div class="col-12 col-sm-6 col-md-4" (click)="go('/admin/users')" style="cursor:pointer">
          <div class="card p-3 h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-secondary"> <i class="bi bi-people me-1"></i> Felhasználók</div>
                  <div class="display-6 mt-1 fw-bold">Kezelés</div>
                  <div class="small text-muted">Jogosultságok és felhasználói lista</div>
                </div>
                <div class="icon-muted"><i class="bi bi-people fs-2"></i></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-4" (click)="go('/admin/zones')" style="cursor:pointer">
          <div class="card p-3 h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-secondary"> <i class="bi bi-map me-1"></i> Zónák</div>
                  <div class="display-6 mt-1 fw-bold">Zóna menedzsment</div>
                  <div class="small text-muted">Létrehozás / szerkesztés</div>
                </div>
                <div class="icon-muted"><i class="bi bi-map fs-2"></i></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-4" (click)="go('/admin/monitoring')" style="cursor:pointer">
          <div class="card p-3 h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-secondary"> <i class="bi bi-graph-up me-1"></i> Monitoring</div>
                  <div class="display-6 mt-1 fw-bold">Rendszer</div>
                  <div class="small text-muted">Statisztikák és logok</div>
                </div>
                <div class="icon-muted"><i class="bi bi-graph-up fs-2"></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </ng-container>
    <ng-template #loading>
      <div class="d-flex align-items-center justify-content-center p-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <div class="mt-2 small text-muted">Betöltés…</div>
        </div>
      </div>
    </ng-template>
  </div>
  `
})
export class AdminDashboardComponent {
  user = this.auth.currentUserValue;
  constructor(private auth: AuthService, private router: Router) {}
}
