import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-officer-dashboard',
  template: `
  <div class="user-dashboard">
    <ng-container *ngIf="user; else loading">
      <div class="row mb-3">
        <div class="col-12">
          <div class="card p-4 mb-3">
            <div class="d-flex align-items-center justify-content-between flex-column flex-md-row">
                <div>
                  <div class="h4 mb-1"><i class="bi bi-shield-lock me-2 text-primary"></i> Vezérlőpult</div>
                  <div class="text-secondary">Irányító felület – gyors műveletek</div>
                  <div class="h5 mt-2"><span class="fw-bold">Jogosultság: {{ roleLabel }}</span></div>
                  <div class="mt-1"><span class="status-badge">🟢 Online szolgálatban</span> <small class="text-muted ms-2">{{ currentTime }}</small></div>
                  <div class="small text-muted">Utolsó művelet: <span *ngIf="lastAction">{{ lastAction }}</span><span *ngIf="!lastAction">–</span></div>
                </div>
              </div>
          </div>
        </div>
      </div>

      <!-- Top stat cards -->
      <div class="row g-3 mb-3">
        <div class="col-12 col-md-4">
          <div class="card p-3 stat-card">
            <div class="small text-secondary">Mai bírságok</div>
            <div class="h3 mt-1">{{ todayFines }}</div>
            </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card p-3 stat-card">
            <div class="small text-secondary">Aktív ellenőrzések</div>
            <div class="h3 mt-1">{{ activeInspections }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card p-3 stat-card">
            <div class="small text-secondary">Lekérdezések (ma)</div>
            <div class="h3 mt-1">{{ queriesToday }}</div>
          </div>
        </div>
      </div>

  <div class="row g-3 mb-3 dashboard-cards">
  <div class="col-12 col-sm-6 col-md-4" (click)="plate ? doLookup() : go('/officer/lookup')" style="cursor:pointer">
          <div class="card p-3 h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-secondary"> <i class="bi bi-search me-1"></i> Keresés</div>
                  <div class="display-6 mt-1 fw-bold">Megnézés</div>
                  <div class="small text-muted">Gyors rendszám ellenőrzés és jegyinfó</div>
                </div>
              </div>
            </div>
          </div>
        </div>

  <div class="col-12 col-sm-6 col-md-4" (click)="openFineModal()" style="cursor:pointer">
          <div class="card p-3 h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-secondary"> <i class="bi bi-exclamation-triangle-fill me-1"></i> Bírságok</div>
                  <div class="display-6 mt-1 fw-bold">Kezelés</div>
                </div>
                <div class="icon-muted"><i class="bi bi-exclamation-triangle-fill fs-2 text-danger"></i></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-4 d-flex align-items-stretch">
          <div class="card p-3 h-100 actions-card">
            <div class="card-body d-flex flex-column justify-content-center">
                <div class="d-flex gap-2 flex-wrap justify-content-center align-items-center">
                  <button class="btn btn-success" (click)="openFineModal()"><i class="bi bi-plus-lg me-2"></i> Új bírság</button>
                  <button class="btn btn-outline-secondary" (click)="doLookup()"><i class="bi bi-search me-2"></i> 🔍 Gyors keresés</button>
              </div>
              <div class="text-center mt-2 small text-muted">Gyors műveletek</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inline fine modal -->
      <div *ngIf="showFineModal" style="position:fixed;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:1050;background:rgba(0,0,0,0.3);">
        <div class="card p-3" style="width:520px;max-width:95%;">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">Új bírság</h5>
            <button class="btn btn-sm btn-outline-secondary" (click)="closeFineModal()">Bezár</button>
          </div>
          <div *ngIf="fineError" class="alert alert-danger">{{ fineError }}</div>
          <div class="mb-2">
            <label class="form-label small">Rendszám</label>
            <input class="form-control" [(ngModel)]="finePlateInput" placeholder="Rendszám" />
            <div *ngIf="fineVehicle" class="small text-muted mt-1">Talált jármű: {{ fineVehicle.plate_number }} — ID: {{ fineVehicle.id }}</div>
          </div>
          <div class="mb-2">
            <label class="form-label small">Zóna (opcionális)</label>
            <select class="form-select" [(ngModel)]="selectedZoneId" (ngModelChange)="onZoneChange($event)">
              <option [ngValue]="null">-- Válassz zónát --</option>
              <option *ngFor="let z of zones" [ngValue]="z.id">{{ z.name }} — {{ z.code }} ({{ z.fine_amount || '-' }} Ft)</option>
            </select>
          </div>
          <div class="row g-2">
            <div class="col-4"><input class="form-control" type="number" [(ngModel)]="fine.amount" placeholder="Összeg (Ft)"/></div>
            <div class="col-4">
              <select class="form-select" [(ngModel)]="fine.reason">
                <option value="NO_VALID_TICKET">Nincs jegy</option>
                <option value="EXPIRED">Lejárt</option>
                <option value="OTHER">Egyéb</option>
              </select>
            </div>
            <div class="col-4 text-end">
              <button class="btn btn-danger" [disabled]="issuingFine" (click)="issueFineFromDashboard()">Kiadás</button>
            </div>
          </div>
          <div class="mt-2">
            <textarea class="form-control" rows="2" [(ngModel)]="fine.note" placeholder="Megjegyzés (opcionális)"></textarea>
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
export class OfficerDashboardComponent implements OnInit, OnDestroy {
  user = this.auth.currentUserValue;
  plate = '';
  result: any = null;
  statusKey: string | null = null;
  statusMessage: string | null = null;
  roleLabel = 'Közterület Ellenőr';
  lastAction: string | null = null;
  lastSearchedPlate: string | null = null;
  currentTime: string = '';
  todayFines = 0;
  activeInspections = 0;
  queriesToday = 0;
  lastQueries: number | null = null;
  zones: any[] = [];
  selectedZoneId: any = null;
  private statsInterval: any = null;
  private clockInterval: any = null;

  constructor(private auth: AuthService, private router: Router, private api: ApiService) {}

  go(path: string) { this.router.navigate([path]); }

  interpretStatus() {
    this.statusKey = null;
    this.statusMessage = null;
    if (!this.result) return;
    const now = new Date();
    const midnight = new Date(); midnight.setHours(0,0,0,0);

    if (this.result.status === 'NO_VEHICLE') { this.statusKey = 'NO_VEHICLE'; this.statusMessage = 'Jármű nem található'; return; }
    if (this.result.status === 'NO_TICKET' || !this.result.ticket) { this.statusKey = 'NO_TICKET'; this.statusMessage = 'Nincs jegy'; return; }

    const t = this.result.ticket;
    const start = t.start_time ? new Date(t.start_time) : (t.created_at ? new Date(t.created_at) : null);
    const end = t.end_time ? new Date(t.end_time) : null;

    if (start && start < midnight) { this.statusKey = 'NO_TICKET_TODAY'; this.statusMessage = 'Nincs jegy ma'; return; }
    if (start && end && now >= start && now <= end) { this.statusKey = 'VALID'; this.statusMessage = 'Jegy érvényes'; return; }
    if (end && now > end) { this.statusKey = 'EXPIRED'; this.statusMessage = 'Jegy lejárt'; return; }
    this.statusKey = 'UNKNOWN'; this.statusMessage = 'Ismeretlen állapot';
  }

  ngOnInit(): void {
    this.loadStats();
    // refresh stats every 30s
    this.statsInterval = setInterval(() => this.loadStats(), 30000);
    // determine role label
    const r = (this.user && this.user.role) ? this.user.role.toUpperCase() : '';
    if (r === 'PARKING_OFFICER' || r === 'OFFICER') this.roleLabel = 'Közterület Ellenőr';
    else if (r === 'ADMIN') this.roleLabel = 'Adminisztrátor';
    else this.roleLabel = this.user?.role || '—';

    // start clock
    this.currentTime = new Date().toLocaleTimeString();
    this.clockInterval = setInterval(() => { this.currentTime = new Date().toLocaleTimeString(); }, 1000);
    // load zones for fine creation
    this.loadZones();
  }

  loadZones() {
    this.api.getZones().subscribe({ next: (z:any) => { this.zones = z || []; }, error: () => {} });
  }

  ngOnDestroy(): void {
    if (this.statsInterval) clearInterval(this.statsInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private loadStats() {
    const midnight = new Date(); midnight.setHours(0,0,0,0);
    // today's fines
    this.api.getOfficerFines().subscribe({ next: (f: any) => {
      const arr = f || [];
      this.todayFines = (arr || []).filter((x: any) => new Date(x.created_at) >= midnight).length;
    }, error: () => {} });

    // active inspections (tickets)
    this.api.getTickets().subscribe({ next: (t:any) => {
      const arr = t || [];
      const now = Date.now();
      this.activeInspections = (arr || []).filter((tk:any) => tk.expires_at && new Date(tk.expires_at).getTime() > now).length;
    }, error: () => {} });

    // queries today stored in localStorage under key officer_queries_YYYY-MM-DD
    const k = this.queriesKey();
    const v = parseInt(localStorage.getItem(k) || '0', 10) || 0;
    this.queriesToday = v;
    this.lastQueries = v;
    // load last searched plate/time from localStorage (shared with lookup page)
    this.lastSearchedPlate = localStorage.getItem('officer_last_search_plate') || null;
    const t = localStorage.getItem('officer_last_search_time');
    if (t && !this.lastAction) {
      try { this.lastAction = `Lekérdezés: ${new Date(t).toLocaleTimeString()}`; } catch(e) {}
    }
  }

  private queriesKey() {
    const d = new Date(); return `officer_queries_${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  private incrementQueryCounter() {
    const k = this.queriesKey();
    const v = parseInt(localStorage.getItem(k) || '0', 10) || 0;
    localStorage.setItem(k, String(v+1));
    this.queriesToday = v+1;
    this.lastQueries = v+1;
    this.lastAction = `Lekérdezés: ${new Date().toLocaleTimeString()}`;
    this.lastSearchedPlate = this.plate;
    try { localStorage.setItem('officer_last_search_plate', this.plate || ''); } catch(e) {}
  }

  doLookup() {
    if (!this.plate) return;
    this.incrementQueryCounter();
    this.result = null;
    this.statusKey = null;
    this.statusMessage = null;
    this.api.lookupPlate(this.plate).subscribe({ next: (r:any) => { this.result = r; this.interpretStatus(); }, error: (e) => { console.error(e); } });
  }

  scanPlate() {
    alert('Rendszám szkennelés (stub) — itt lehetne kamera integráció');
  }

  // --- Inline fine-creation modal on dashboard ---
  showFineModal: boolean = false;
  fine: any = { amount: null, reason: 'NO_VALID_TICKET', note: '' };
  fineVehicle: any = null; // if lookup found a vehicle
  finePlateInput: string = '';
  issuingFine: boolean = false;
  fineError: string | null = null;

  openFineModal() {
    this.fineError = null;
    this.fine = { amount: null, reason: 'NO_VALID_TICKET', note: '' };
    this.fineVehicle = null;
    this.finePlateInput = this.plate || '';
    this.selectedZoneId = null;
    if (this.finePlateInput) {
      // try a quick lookup to prefill vehicle
      this.api.lookupPlate(this.finePlateInput).subscribe({ next: (r:any) => { if (r && r.vehicle) this.fineVehicle = r.vehicle; this.showFineModal = true; }, error: () => { this.showFineModal = true; } });
    } else {
      this.showFineModal = true;
    }
  }

  onZoneChange(zoneId: any) {
    this.selectedZoneId = zoneId;
    if (!zoneId) return;
    const z = (this.zones || []).find(z => z.id == zoneId);
    if (z && (z.fine_amount || z.fine_amount === 0)) {
      this.fine.amount = z.fine_amount;
    }
  }

  closeFineModal() { this.showFineModal = false; this.fineError = null; }

  issueFineFromDashboard() {
    if (this.issuingFine) return;
    this.fineError = null;
    // Must have amount
    if (!this.fine.amount || Number(this.fine.amount) <= 0) { this.fineError = 'Adj meg érvényes összeget.'; return; }

    const performIssue = (vehicleId: any) => {
      const payload: any = { amount: Number(this.fine.amount), reason: this.fine.reason, note: this.fine.note || undefined, vehicle_id: vehicleId };
      if (this.selectedZoneId) payload.zone_id = this.selectedZoneId;
      this.issuingFine = true;
      this.api.issueFine(payload).subscribe({ next: () => {
          this.issuingFine = false; this.showFineModal = false;
          this.lastAction = `Bírság kiállítva: ${this.finePlateInput || (this.fineVehicle && this.fineVehicle.plate_number) || ''}`;
          this.todayFines = (this.todayFines || 0) + 1;
          // refresh queries stat
          this.loadStats();
          alert('Bírság kiállítva.');
        }, error: (e:any) => { this.issuingFine = false; this.fineError = e?.error?.message || 'Hiba a bírság kiállításakor'; console.error(e); } });
    };

    if (this.fineVehicle && this.fineVehicle.id) {
      performIssue(this.fineVehicle.id);
      return;
    }

    // If we only have a plate, we must ensure vehicle exists in DB. Do a lookup and require vehicle_id.
    if (this.finePlateInput) {
      this.issuingFine = true;
      this.api.lookupPlate(this.finePlateInput).subscribe({ next: (r:any) => {
          this.issuingFine = false;
          if (r && r.vehicle && r.vehicle.id) {
            this.fineVehicle = r.vehicle;
            performIssue(r.vehicle.id);
          } else {
            this.fineError = 'A megadott rendszám nem található az adatbázisban. Előbb add hozzá a járművet.';
          }
        }, error: (e:any) => { this.issuingFine = false; this.fineError = 'Hiba a rendszám ellenőrzése során'; console.error(e); } });
      return;
    }

    this.fineError = 'Adj meg egy rendszámot vagy keress rá előbb.';
  }
}
