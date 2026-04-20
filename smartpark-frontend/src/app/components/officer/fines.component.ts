import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-officer-fines',
  template: `
  <div class="container py-3">
  <h4>Bírságok kezelése</h4>
    <div *ngIf="loading" class="mb-3"><div class="spinner-border text-primary" role="status"></div></div>

    <div *ngIf="!loading">
      <div *ngIf="fines && fines.length; else empty">
        <div class="list-group">
          <div *ngFor="let f of fines" class="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-semibold">{{ f.vehicle?.plate_number || f.vehicle_id }} — {{ f.zone?.name || '' }}</div>
              <div class="small text-muted">{{ f.reason }} — {{ f.created_at | date:'yyyy-MM-dd HH:mm' }}</div>
              <div class="small mt-1">{{ f.note }}</div>
            </div>
            <div class="text-end">
              <div class="fw-bold">{{ f.amount }} Ft</div>
              <div class="mt-2"><span class="badge" [ngClass]="(f.status && f.status.toUpperCase()!=='PAID') ? 'bg-danger' : 'bg-success'">{{ (f.status && f.status.toUpperCase()==='PAID') ? 'Fizetve' : 'Kifizetetlen' }}</span></div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="text-muted">Nincsenek bírságok.</div>
      </ng-template>
    </div>
  </div>
  `
})
export class OfficerFinesComponent implements OnInit {
  fines: any[] = [];
  loading = false;
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getOfficerFines().subscribe({ next: (f:any) => { this.fines = f || []; this.loading = false; }, error: (e) => { console.error(e); this.loading = false; } });
  }
}
