import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-officer-lookup',
  template: `
  <div class="container py-3">
  <h4>Rendszám keresés</h4>
    <div class="mb-3 d-flex gap-2">
      <input class="form-control" placeholder="Rendszám" [(ngModel)]="plate" (keyup.enter)="doLookup()" />
      <button class="btn btn-primary" (click)="doLookup()">Keresés</button>
    </div>

    <!-- Top area: only plate search per UX requirement -->

    <div *ngIf="loading" class="mb-3"><div class="spinner-border text-primary" role="status"></div></div>

  <div *ngIf="result">
      <div *ngIf="statusMessage" class="mb-3">
        <div [ngClass]="{'alert alert-success': statusKey==='VALID', 'alert alert-danger': statusKey==='EXPIRED' || statusKey==='NO_VEHICLE' || statusKey==='NO_TICKET', 'alert alert-secondary': statusKey==='NO_TICKET_TODAY' || statusKey==='UNKNOWN'}">
          {{ statusMessage }}
        </div>
      </div>
      <h5>Találat</h5>
      <div class="card p-3 mb-3">
        <div><strong>Rendszám:</strong> {{ result.plate || result.vehicle?.plate_number || result.ticket?.vehicle?.plate_number || result.ticket?.vehicle_id }}</div>
        <div *ngIf="result.vehicle"><strong>Tulajdonos:</strong> {{ result.vehicle.user?.name || result.vehicle.user_id }}</div>
        <div *ngIf="!result.vehicle && result.ticket"><strong>Tulajdonos:</strong> {{ result.ticket.user?.name || result.ticket.user_id || (result.ticket.vehicle_id ? result.ticket.vehicle_id : '') }}</div>
        <div *ngIf="result.tickets && result.tickets.length">
          <h6 class="mt-2">Jegyek</h6>
          <ul class="list-unstyled small">
            <li *ngFor="let t of result.tickets">{{ t.zone?.name || t.zone_id }} — {{ t.minutes }} perc — {{ t.created_at | date:'yyyy-MM-dd HH:mm' }}</li>
          </ul>
        </div>
      </div>

      <div class="card p-3" *ngIf="result && (result.vehicle || result.ticket)">
          <h6>Új bírság kiállítása</h6>
          <div class="row g-2">
            <div class="col-3"><input class="form-control" placeholder="Összeg (Ft)" type="number" [(ngModel)]="fine.amount" /></div>
            <div class="col-3">
              <select class="form-select" aria-label="Zóna" [(ngModel)]="fine.zone_id" (ngModelChange)="onZoneSelect($event)">
                <option [ngValue]="null" disabled>Zóna</option>
                <option *ngFor="let z of zones" [ngValue]="z.id">{{ z.name }}</option>
              </select>
            </div>
            <div class="col-3"><select class="form-select" [(ngModel)]="fine.reason"><option [value]="'NO_VALID_TICKET'">Nincs jegy</option><option [value]="'EXPIRED'">Lejárt</option><option [value]="'OTHER'">Egyéb</option></select></div>
            <div class="col-3"><input class="form-control" placeholder="Megjegyzés" [(ngModel)]="fine.note" /></div>
          </div>
          <div class="mt-3 text-end">
            <button class="btn btn-danger" (click)="issueFine()" [disabled]="!canIssue" [title]="canIssue ? '' : (statusMessage || 'Nem kiadható')">Bírság kiállítása</button>
          </div>

          <div *ngIf="recentFines && recentFines.length" class="mt-3">
            <h6>Legutóbbi kiállított bírságok</h6>
            <ul class="list-unstyled small">
              <li *ngFor="let rf of recentFines">{{ rf.id ? ('#'+rf.id+' ') : '' }}{{ rf.vehicle?.plate_number || rf.vehicle_id }} — {{ rf.zone?.name || rf.zone_id }} — {{ rf.amount }} Ft — {{ rf.created_at | date:'yyyy-MM-dd HH:mm' }}</li>
            </ul>
          </div>
        </div>
    </div>

    <div *ngIf="!result && !loading && tried" class="text-muted">Nincs találat.</div>
  </div>
  `
})
export class OfficerLookupComponent {
  zones: any[] = [];
  selectedZoneId: any = null;
  plate = '';
  tried = false;
  loading = false;
  result: any = null;
  fine: any = { amount: null, reason: 'NO_VALID_TICKET', note: '', zone_id: null };
  recentFines: any[] = [];
  canIssue: boolean = false;
  statusKey: string | null = null;
  statusMessage: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadZones();
  }

  loadZones() {
    this.api.getZones().subscribe({ next: (z:any) => this.zones = z || [], error: () => {} });
  }

  private queriesKey() {
    const d = new Date(); return `officer_queries_${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  private incrementQueryCounter() {
    const k = this.queriesKey();
    const v = parseInt(localStorage.getItem(k) || '0', 10) || 0;
    localStorage.setItem(k, String(v+1));
    try { localStorage.setItem('officer_last_search_plate', this.plate || ''); localStorage.setItem('officer_last_search_time', new Date().toISOString()); } catch(e) {}
  }

  doLookup() {
    if (!this.plate) return;
    this.incrementQueryCounter();
    this.tried = true;
    this.loading = true;
    this.result = null;
    this.statusKey = null;
    this.statusMessage = null;
    this.api.lookupPlate(this.plate).subscribe({ next: (r:any) => { this.result = r; this.loading = false; this.interpretStatus(); }, error: () => { this.loading = false; } });
  }

  onZoneSelect(zoneId: any) {
    // when a zone is selected from either the top selector or the issue-form selector
    if (!zoneId) {
      // clear selection
      this.selectedZoneId = null;
      this.fine.zone_id = null;
      // clear auto-filled amount when zone cleared
      this.fine.amount = null;
      return;
    }
    this.selectedZoneId = zoneId;
    this.fine.zone_id = zoneId;
    const z = (this.zones || []).find(z => z.id == zoneId);
    if (z && (z.fine_amount || z.fine_amount === 0)) {
      // Always set the amount to the zone's fine when a zone is selected
      this.fine.amount = z.fine_amount;
    }
  }

  interpretStatus() {
    this.statusKey = null;
    this.statusMessage = null;
    this.canIssue = false;
    if (!this.result) return;
    const now = new Date();
    const midnight = new Date(); midnight.setHours(0,0,0,0);

    if (this.result.status === 'NO_VEHICLE') {
      this.statusKey = 'NO_VEHICLE';
      this.statusMessage = 'Jármű nem található az adatbázisban, kézzel írt bírság kiadható!';
      this.canIssue = false;
      return;
    }

    // If backend explicitly returned NO_TICKET or no ticket object
    if (this.result.status === 'NO_TICKET' || !this.result.ticket) {
      this.statusKey = 'NO_TICKET';
      this.statusMessage = 'Nincs jegy';
      this.canIssue = true;
      return;
    }

    const t = this.result.ticket;
    const start = t.start_time ? new Date(t.start_time) : (t.created_at ? new Date(t.created_at) : null);
    const end = t.end_time ? new Date(t.end_time) : null;

    // If the ticket start is before today's midnight, treat as no ticket today
    if (start && start < midnight) {
      this.statusKey = 'NO_TICKET_TODAY';
      this.statusMessage = 'Nincs jegy a mai napra!';
      // allow issuing a fine because there is no ticket for today
      this.canIssue = true;
      return;
    }

    if (start && end && now >= start && now <= end) {
      this.statusKey = 'VALID';
      this.statusMessage = 'Érvényes jegy';
      this.canIssue = false;
      return;
    }

    if (end && now > end) {
      this.statusKey = 'EXPIRED';
      this.statusMessage = 'Jegy lejárt';
      this.canIssue = true;
      return;
    }

    this.statusKey = 'UNKNOWN';
    this.statusMessage = 'Ismeretlen állapot';
    this.canIssue = false;
  }

  issueFine() {
    if (!this.result || !(this.result.vehicle || this.result.ticket)) return alert('Nincs jármű kiválasztva.');
    // prefer zone from fine.zone_id, fallback to selectedZoneId
    const zoneId = (this.fine && this.fine.zone_id) ? this.fine.zone_id : (this.selectedZoneId || undefined);
    const vehicleId = this.result.vehicle?.id || this.result.ticket?.vehicle_id;
    const payload: any = { vehicle_id: vehicleId, amount: this.fine.amount || undefined, zone_id: zoneId, reason: this.fine.reason, note: this.fine.note || undefined };
    this.api.issueFine(payload).subscribe({ next: (created: any) => {
        try { if (created) { this.recentFines = this.recentFines || []; this.recentFines.unshift(created); } } catch(e) {}
        alert('Bírság kiállítva');
        this.doLookup();
      }, error: (e) => { console.error(e); alert('Hiba a bírság kiállításakor'); } });
  }
}
