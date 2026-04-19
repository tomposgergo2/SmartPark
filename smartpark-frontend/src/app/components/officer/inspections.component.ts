import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

function isActiveTicket(t: any) {
  if (!t || !t.expires_at) return false;
  return new Date(t.expires_at).getTime() > Date.now();
}

@Component({
  selector: 'app-officer-inspections',
  template: `
  <div class="container py-3">
    <h4>Ellenőrzési lista</h4>

    <div class="row g-2 mb-3">
      <div class="col-3"><input class="form-control" placeholder="Rendszám szűrés" [(ngModel)]="filter.plate" /></div>
      <div class="col-3">
        <select class="form-select" [(ngModel)]="filter.zone_id">
          <option [ngValue]="null">Összes zóna</option>
          <option *ngFor="let z of zones" [ngValue]="z.id">{{ z.name }} ({{ z.code }})</option>
        </select>
      </div>
      <div class="col-2 d-flex align-items-center"><label class="form-check-label ms-2"><input type="checkbox" class="form-check-input me-2" [(ngModel)]="filter.onlyActive" />Csak aktív</label></div>
      <div class="col-4 text-end"><button class="btn btn-secondary" (click)="load()">Frissít</button></div>
    </div>

    <div *ngIf="loading" class="text-center"><div class="spinner-border text-primary" role="status"></div></div>

    <div *ngIf="!loading">
      <div *ngIf="tickets && tickets.length; else none">
        <div class="list-group">
          <div *ngFor="let t of filteredTickets()" class="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <div class="fw-semibold">{{ t.vehicle?.plate_number || t.vehicle_id }} — {{ t.zone?.name || t.zone_id }}</div>
              <div class="small text-muted">{{ t.minutes }} perc — {{ t.created_at | date:'yyyy-MM-dd HH:mm' }}</div>
            </div>
            <div class="text-end">
              <div class="small mb-1">{{ isActiveTicket(t) ? 'Érvényes' : 'Lejárt' }}</div>
              <div class="d-flex gap-2 justify-content-end">
                <button *ngIf="!isActiveTicket(t)" class="btn btn-sm btn-danger" (click)="issueFineForTicket(t)">Bírság</button>
                <button class="btn btn-sm btn-outline-primary" (click)="viewTicket(t)">Megtekintés</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #none>
        <div class="text-muted">Nincs jegy a kiválasztott szűrőkkel.</div>
      </ng-template>
    </div>
  </div>
  `
})
export class OfficerInspectionsComponent implements OnInit {
  tickets: any[] = [];
  zones: any[] = [];
  loading = false;
  filter: any = { plate: '', zone_id: null, onlyActive: false };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadZones();
    this.load();
  }

  loadZones() {
    this.api.getZones().subscribe({ next: (z:any) => this.zones = z || [], error: () => {} });
  }

  load() {
    this.loading = true;
    this.api.getTickets().subscribe({ next: (t:any) => { this.tickets = (t || []); this.loading = false; }, error: () => { this.loading = false; } });
  }

  filteredTickets() {
    return (this.tickets || []).filter((t:any) => {
      if (this.filter.plate) {
        const p = (t.vehicle?.plate_number || t.vehicle_id || '').toString().toLowerCase();
        if (!p.includes(this.filter.plate.toLowerCase())) return false;
      }
      if (this.filter.zone_id) {
        if ((t.zone?.id || t.zone_id) != this.filter.zone_id) return false;
      }
      if (this.filter.onlyActive) {
        if (!isActiveTicket(t)) return false;
      }
      return true;
    });
  }

  isActiveTicket(t:any) { return isActiveTicket(t); }

  issueFineForTicket(t: any) {
    if (!t || !t.vehicle) return alert('Nincs jármű adat a jegyhez.');
    const amount = t.zone?.fine_amount ?? 5000;
    if (!confirm(`Bírság kiállítása a ${t.vehicle.plate_number || t.vehicle_id} járműre (${amount} Ft)?`)) return;
    const payload = { vehicle_id: t.vehicle.id || t.vehicle_id, zone_id: t.zone?.id || t.zone_id, amount, reason: 'NO_VALID_TICKET', note: `Issued from inspection for ticket ${t.id}` };
    this.api.issueFine(payload).subscribe({ next: () => { alert('Bírság kiállítva'); this.load(); }, error: (e) => { console.error(e); alert('Hiba'); } });
  }

  viewTicket(t:any) {
    // simple inspection: open ticket details in a new tab or show alert for now
    alert(`Jegy ${t.id} — ${t.vehicle?.plate_number || t.vehicle_id}\nZóna: ${t.zone?.name || t.zone_id}\nIdőtartam: ${t.minutes} perc\nLejár: ${t.expires_at}`);
  }
}
