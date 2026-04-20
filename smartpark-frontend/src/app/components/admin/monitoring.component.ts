import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-monitoring',
  template: `
  <div class="admin-monitoring">
    <div class="card p-3 mb-3 d-flex justify-content-between align-items-center">
      <div>
        <h5 class="mb-0">Monitoring</h5>
        <div class="small text-muted">Rendszerstatisztikák és valós idejű monitor</div>
      </div>
      <div><button class="btn btn-sm btn-outline-secondary" (click)="load()">Frissít</button></div>
    </div>

    <div *ngIf="loading" class="text-center p-3"><div class="spinner-border text-primary"></div></div>

    <div *ngIf="!loading" class="row g-3">
      <div class="col-12 col-md-4">
        <div class="card p-3">
          <div class="small text-secondary">Összes felhasználó</div>
          <div class="h4 mt-1">{{ stats?.users || '-' }}</div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card p-3">
          <div class="small text-secondary">Aktív jegyek</div>
          <div class="h4 mt-1">{{ stats?.active_tickets || '-' }}</div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card p-3">
          <div class="small text-secondary">Bírságok összesen</div>
          <div class="h4 mt-1">{{ stats?.fines_total || '-' }} Ft</div>
        </div>
      </div>
      <div class="col-12">
        <div class="card p-3 mt-3">
          <h6>Nyers statisztika</h6>
          <pre style="white-space:pre-wrap">{{ stats | json }}</pre>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminMonitoringComponent implements OnInit, OnDestroy {
  stats: any = null;
  loading = false;
  private interval: any = null;
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); this.interval = setInterval(() => this.load(), 30000); }
  ngOnDestroy() { if (this.interval) clearInterval(this.interval); }
  load() { this.loading = true; this.api.getAdminStats().subscribe({ next: (r:any) => { this.stats = r || {}; this.loading = false; }, error: () => { this.loading = false; } }); }
}
