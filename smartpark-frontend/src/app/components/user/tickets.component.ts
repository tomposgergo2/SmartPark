import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-tickets',
  template: `
  <div>
    <h3>Tickets</h3>

    <div class="row">
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <h5>Buy ticket</h5>
            <form (ngSubmit)="buy()" class="row g-2">
              <div class="col-12">
                <label class="form-label">Vehicle</label>
                <select class="form-select" [(ngModel)]="form.vehicle_id" name="vehicle_id" required>
                  <option *ngFor="let v of vehicles" [value]="v.id">{{ v.plate_number }} - {{ v.make }} {{ v.model }}</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label">Zone</label>
                <select class="form-select" [(ngModel)]="form.zone_id" name="zone_id" required>
                  <option *ngFor="let z of zones" [value]="z.id">{{ z.name }} ({{ z.rate_per_hour ? (z.rate_per_hour + ' Ft/hr') : (z.price_per_minute ? (z.price_per_minute + ' Ft /min') : '—') }})</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label">Minutes</label>
                <input type="number" class="form-control" [(ngModel)]="form.minutes" name="minutes" required min="1" />
              </div>
              <div class="col-12 text-end">
                <button class="btn btn-primary" type="submit">Buy</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <h5>Your tickets</h5>
            <div *ngIf="loading" class="text-muted">Loading...</div>
            <ul *ngIf="!loading && tickets.length" class="list-group list-group-flush">
              <li *ngFor="let t of tickets" class="list-group-item">
                <div><strong>Zone:</strong> {{ t.zone?.name || t.zone_id }} — <strong>Minutes:</strong> {{ t.minutes }}</div>
                <div><small class="text-muted">Active: {{ t.expires_at ? (t.expires_at | date:'yyyy-MM-dd HH:mm') : '—' }}</small></div>
              </li>
            </ul>
            <div *ngIf="!loading && !tickets.length" class="small text-muted">
              <div>No tickets found to display.</div>
              <div *ngIf="rawTicketsResponse" class="mt-2"><strong>Raw response:</strong>
                <pre style="background:var(--gray-50); padding:.5rem; border-radius:6px; overflow:auto">{{ rawTicketsResponse | json }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class TicketsComponent implements OnInit {
  vehicles: any[] = [];
  zones: any[] = [];
  tickets: any[] = [];
  loading = false;
  rawTicketsResponse: any = null;
  form: any = { vehicle_id: null, zone_id: null, minutes: 60 };
  constructor(private api: ApiService, private paymentService: PaymentService) {}
  ngOnInit(): void { this.loadData(); }

  private normalizeArray(resp: any) {
    if (!resp) return [];
    // if it's already an array
    if (Array.isArray(resp)) return resp;

    // common envelope shapes: { data: [...] } or { data: { data: [...] } }
    const candidate = this.findFirstArray(resp);
    if (candidate) return candidate;

    return [];
  }

  // find the first array inside an object by exploring common nesting levels
  private findFirstArray(obj: any): any[] | null {
    if (!obj || typeof obj !== 'object') return null;
    for (const k of Object.keys(obj)) {
      if (Array.isArray(obj[k])) return obj[k];
      if (obj[k] && typeof obj[k] === 'object') {
        const nested = this.findFirstArray(obj[k]);
        if (nested) return nested;
      }
    }
    return null;
  }

  loadData() {
    this.loading = true;
    this.api.getVehicles().subscribe({ next: (v:any)=> { this.vehicles = this.normalizeArray(v); }, error: ()=>{ this.vehicles = []; } });
    this.api.getZones().subscribe({ next: (z:any)=> { this.zones = this.normalizeArray(z); }, error: ()=>{ this.zones = []; } });
    this.api.getTickets().subscribe({ next: (t:any)=> { console.log('GET /tickets raw response:', t); this.rawTicketsResponse = t; const arr = this.normalizeArray(t); this.tickets = arr.map(this.enrichTicket); this.loading = false; }, error: ()=> { this.tickets = []; this.loading = false; } });
  }

  enrichTicket(t: any) {
    // normalize start/end to Date objects when possible
    let start: Date | null = null;
    let end: Date | null = null;
    try {
      if (t.start_time) start = new Date(t.start_time);
    } catch (e) { start = null; }
    try {
      if (t.end_time) end = new Date(t.end_time);
    } catch (e) { end = null; }

    // expires_at: prefer explicit end time, otherwise compute from start + minutes
    if (end && !isNaN(end.getTime())) {
      t.expires_at = end;
    } else if (start && t.minutes) {
      t.expires_at = new Date(start.getTime() + (Number(t.minutes) * 60000));
    } else {
      t.expires_at = null;
    }

    // minutes: prefer explicit, otherwise compute from start/end
    if (!t.minutes && start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
      t.minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    // keep start_time/end_time as Date objects for any other formatting
    t.start_time = start;
    t.end_time = end;

    return t;
  }
  buy() {
    if (!this.form.vehicle_id || !this.form.zone_id || !this.form.minutes) return;
    const zone = this.zones.find((z: any) => Number(z.id) === Number(this.form.zone_id));
    const minutes = Number(this.form.minutes);
    // compute price same as backend: priceCents = ceil(rate_per_hour * (minutes/60))
    let priceCents = 0;
    try {
      const rate = zone?.rate_per_hour || 0;
      priceCents = Math.ceil(Number(rate) * (minutes / 60));
    } catch (e) { priceCents = 0; }

    const displayAmount = (priceCents && priceCents > 0) ? (priceCents / 100) : null; // show in Ft if cents

    // open global payment modal
    const modalObj: any = { amount: displayAmount, reason: 'Jegy', details: `${minutes} perc - ${zone?.name || ''}` };
    this.paymentService.open(modalObj).subscribe((payload) => {
      if (!payload) return; // cancelled
      const body: any = { ...this.form };
      if (payload.method) body.method = payload.method;
      // backend calculates price server-side; we only pass method for simulation
      this.api.createTicket(body).subscribe({ next: ()=> { this.loadData(); }, error: (e)=> console.error(e) });
    });
  }
}
