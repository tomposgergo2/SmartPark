import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-zones',
  template: `
  <div>
    <h3>Zones</h3>
    <div *ngIf="loading" class="text-muted">Loading zones...</div>
    <div *ngIf="!loading" class="row">
      <div *ngFor="let z of zones" class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title mb-2">{{ z.name }}</h5>
            <div class="small text-muted mb-2">ID: {{ z.id }}</div>

            <div class="mt-2">
              <div><strong>Rate / hour:</strong> {{ z.rate_per_hour !== null && z.rate_per_hour !== undefined ? (z.rate_per_hour + ' Ft') : '—' }}</div>
              <div><strong>Min minutes:</strong> {{ z.min_minutes !== null && z.min_minutes !== undefined ? (z.min_minutes + ' perc') : '—' }}</div>
              <div><strong>Max minutes:</strong> {{ z.max_minutes !== null && z.max_minutes !== undefined ? (z.max_minutes + ' perc') : '—' }}</div>
              <div *ngIf="z.fine_amount !== null && z.fine_amount !== undefined" class="mt-2 text-danger"><strong>Fine amount:</strong> {{ z.fine_amount }} Ft</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ZonesComponent implements OnInit {
  zones: any[] = [];
  loading = false;
  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }
  load() { this.loading = true; this.api.getZones().subscribe({ next: (r:any) => { this.zones = r; this.loading = false; }, error: ()=> this.loading = false }); }

  // (kept intentionally minimal) 
}
