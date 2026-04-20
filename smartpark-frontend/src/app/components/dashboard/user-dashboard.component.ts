import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { PaymentService } from '../../services/payment.service';
import { Subscription } from 'rxjs';

function isActiveTicket(t: any) {
  if (!t || !t.expires_at) return false;
  return new Date(t.expires_at).getTime() > Date.now();
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html'
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  counts = { vehicles: 0, activeTickets: 0, fines: 0 } as any;
  vehicles: any[] = [];
  tickets: any[] = [];
  fines: any[] = [];
  recentTickets: any[] = [];
  activeTicket: any = null;
  countdown = '';
  finesTotal = 0;
  earliestFineDue: Date | null = null;

  private intervalId: any;
  private userSub: Subscription | null = null;

  constructor(private auth: AuthService, private router: Router, private api: ApiService, private paymentService: PaymentService, private theme: ThemeService) { }

  toggleTheme() { this.theme.toggle(); }
  isDark(): boolean { return this.theme.isDark(); }

  ngOnInit(): void {
    // subscribe to auth user state and react when user becomes available
    this.userSub = this.auth.user$.subscribe(u => {
      console.debug('[UserDashboard] auth.user$ ->', u);
      this.user = u;
      if (u) {
        // only start data loading and countdown when we have a user
        this.loadAll();
        if (!this.intervalId) this.intervalId = setInterval(() => this.updateCountdown(), 1000);
      } else {
        // if logged out, clear data and interval
        this.vehicles = [];
        this.tickets = [];
        this.recentTickets = [];
        this.activeTicket = null;
        if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.userSub) this.userSub.unsubscribe();
  }

  go(path: string) { this.router.navigate([path]); }

  loadAll() {
    // Load vehicles first so we can attach plate numbers to tickets
    this.api.getVehicles().subscribe({ next: (v:any) => {
      this.vehicles = v || [];
      this.counts.vehicles = this.vehicles.length;

      // once vehicles loaded, fetch tickets and enrich them
      this.api.getTickets().subscribe({ next: (t:any) => {
        this.tickets = (t || []).map((tk: any) => {
          // attach vehicle plate if available from vehicles list
          const vid = tk.vehicle_id || tk.vehicle?.id || null;
          if (vid) {
            const found = this.vehicles.find(x => Number(x.id) === Number(vid));
            if (found) tk.vehicle = tk.vehicle || {};
            if (found && found.plate_number) tk.vehicle.plate_number = found.plate_number;
          }
          // compute minutes from start_time/end_time if not provided
          if (tk.minutes == null) {
            try {
              const s = tk.start_time || tk.start_time || tk.created_at;
              const e = tk.end_time || tk.expires_at || tk.end_time;
              if (s && e) {
                const diff = Math.abs(new Date(e).getTime() - new Date(s).getTime());
                tk.minutes = Math.round(diff / 60000);
              }
            } catch (err) { tk.minutes = tk.minutes || 0; }
          }
          // normalize expires_at for compatibility with earlier helpers
          if (!tk.expires_at && tk.end_time) tk.expires_at = tk.end_time;
          return tk;
        });

  this.counts.activeTickets = (this.tickets || []).filter(isActiveTicket).length;
  this.recentTickets = (this.tickets || []).slice(0,4);
        this.activeTicket = (this.tickets || []).find(isActiveTicket) || null;
        this.updateCountdown();
      }, error: ()=>{} });

    }, error: ()=>{} });
    this.api.getFines().subscribe({ next: (f:any) => {
      this.fines = f || [];
      // Consider only unpaid fines for dashboard counts/totals so the UI reflects outstanding obligations
      const unpaid = (this.fines || []).filter((x: any) => !(x.paid || x.paid_at || (x.status && x.status.toUpperCase() === 'PAID')));
      this.counts.fines = unpaid.length;
      this.finesTotal = unpaid.reduce((s: any, x: any) => s + (x.amount || 0), 0);
      // earliestFineDue should be the oldest unpaid fine (minimum created_at)
      if (unpaid.length) {
        const dates = unpaid.map((x: any) => new Date(x.created_at).getTime()).filter(Boolean);
        const min = Math.min(...dates);
        this.earliestFineDue = isFinite(min) ? new Date(min) : null;
      } else {
        this.earliestFineDue = null;
      }
    }, error: ()=>{} });
  }

  isActiveTicket(t: any) { return isActiveTicket(t); }

  updateCountdown() {
    if (!this.activeTicket || !this.activeTicket.expires_at) { this.countdown = ''; return; }
    const diff = new Date(this.activeTicket.expires_at).getTime() - Date.now();
    if (diff <= 0) { this.countdown = 'Lejárt'; return; }
    const sec = Math.floor(diff/1000) % 60;
    const min = Math.floor(diff/60000) % 60;
    const hrs = Math.floor(diff/3600000);
    this.countdown = `${hrs}h ${min}m ${sec}s`;
  }

  quickAddVehicle() {
    const plate = prompt('Plate number');
    if (!plate) return;
    this.api.createVehicle({ plate_number: plate }).subscribe({ next: () => this.loadAll(), error: e => console.error(e) });
  }

  startParking() {
    this.router.navigate(['/user/tickets']);
  }

  quickPay() {
    // try to find an unpaid fine for the user and open the payment modal
    const unpaid = (this.fines || []).find((f: any) => !(f.paid || f.paid_at || f.status === 'PAID' || f.status === 'paid'));
    if (unpaid) {
      this.paymentService.open(unpaid).subscribe((payload) => {
        if (!payload) return; // cancelled
        this.api.payFine(unpaid.id, payload).subscribe({ next: () => this.loadAll(), error: (e)=> { console.error(e); this.loadAll(); } });
      });
    } else {
      this.router.navigate(['/user/fines']);
    }
  }

  extendActive() {
    if (!this.activeTicket) return;
    const minutes = Number(prompt('Extend minutes', '30')) || 0;
    if (!minutes) return;
    // use payment modal to collect card info and simulate payment for extension
    const payload = { amount: null, reason: 'Ticket extension', details: `${minutes} minutes` };
    this.paymentService.open(payload).subscribe((p) => {
      if (!p) return; // cancelled
      const body: any = { minutes };
      if (p.method) body.method = p.method;
      this.api.extendTicket(this.activeTicket.id, body).subscribe({ next: () => this.loadAll(), error: () => this.loadAll() });
    });
  }

  stopActive() {
    if (!this.activeTicket) return;
    if (!confirm('Stop current parking?')) return;
    this.api.createTicket({ vehicle_id: this.activeTicket.vehicle_id, zone_id: this.activeTicket.zone_id, minutes: 0 }).subscribe({ next: () => this.loadAll(), error: ()=> this.loadAll() });
  }
}
