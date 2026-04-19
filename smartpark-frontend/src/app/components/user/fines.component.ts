import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-fines',
  template: `
  <div>
    <h3>Bírságok</h3>
    <div *ngIf="loading" class="text-muted">Betöltés...</div>

    <div *ngIf="!loading && fines.length" class="row g-3">
      <div *ngFor="let f of fines" class="col-12">
        <div class="card p-3 d-flex flex-row align-items-start justify-content-between" [ngClass]="{'border-danger': !isPaid(f)}">
          <div>
            <div class="fw-bold mb-1">{{ f.amount }} Ft <span class="text-muted small">— {{ f.reason }}</span></div>
            <div class="small text-muted">Kibocsátva: {{ formatDate(f.issued_at || f.created_at) }}</div>
            <div *ngIf="f.vehicle?.plate_number || f.vehicle_plate" class="mt-2"><small class="text-muted">Rendszám: {{ f.vehicle?.plate_number || f.vehicle_plate }}</small></div>
            <div *ngIf="f.zone?.name" class="mt-1"><small class="text-muted">Zóna: {{ f.zone?.name }}</small></div>
            <div *ngIf="f.note" class="mt-1"><small class="text-muted">Megjegyzés: {{ f.note }}</small></div>
            <div *ngIf="f.issuer?.name" class="mt-1"><small class="text-muted">Kibocsátó: {{ f.issuer?.name }}</small></div>
          </div>

          <div class="text-end d-flex flex-column align-items-end gap-2">
            <div *ngIf="isPaid(f)" class="badge bg-success">Fizetve</div>
            <div *ngIf="!isPaid(f)" class="d-flex flex-column align-items-end gap-2">
              <div>
                <button class="btn btn-sm btn-outline-primary" (click)="openPaymentModal(f)">Fizetés</button>
              </div>
            </div>
            <div *ngIf="paySuccess[f.id]" class="small text-success">Befizés sikeres.</div>
            <div *ngIf="payError[f.id]" class="small text-danger">Hiba: {{ payError[f.id] }}</div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!loading && !fines.length" class="small text-muted">Nincsenek bírságaid.</div>
  </div>
  `
})
export class FinesComponent implements OnInit {
  fines: any[] = [];
  loading = false;
  // track per-fine state
  paying: Record<number, boolean> = {} as any;
  paySuccess: Record<number, boolean> = {} as any;
  payError: Record<number, string> = {} as any;
  // per-fine payment form state
  payMethod: Record<number, string> = {} as any;
  payAmount: Record<number, number> = {} as any;
  constructor(private api: ApiService, private paymentService: PaymentService) {}
  ngOnInit(): void { this.load(); }
  load() { this.loading = true; this.api.getFines().subscribe({ next: (r:any)=> { this.fines = r; this.loading = false; }, error: ()=> this.loading = false }); }

  isPaid(f: any) {
    // backend may provide paid_at or status - accept either
    return !!(f.paid || f.paid_at || f.status === 'paid');
  }

  formatDate(v: any) {
    try {
      const d = v ? new Date(v) : null;
      if (!d || isNaN(d.getTime())) return '—';
      // format yyyy-MM-dd HH:mm
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) { return '—'; }
  }

  pay(f: any) {
    if (!f || !f.id) return;
    this.payError[f.id] = '';
    this.paySuccess[f.id] = false;
    this.paying[f.id] = true;
    const payload: any = {};
    if (this.payMethod[f.id]) payload.method = this.payMethod[f.id];
    const amountVal = this.payAmount[f.id] || f.amount;
    if (amountVal) payload.amount = Number(amountVal);
    this.api.payFine(f.id as number).subscribe({ next: (res:any)=> {
      this.paying[f.id] = false;
      this.paySuccess[f.id] = true;
      // optimistic update
      f.paid = true;
      f.paid_at = new Date().toISOString();
    }, error: (err:any)=> {
      this.paying[f.id] = false;
      this.payError[f.id] = err?.error?.message || err?.message || 'Fizetés sikertelen.';
    }});
  }

  openPaymentModal(f: any) {
    // request the global payment host to open the modal; receive payload or null
    this.paymentService.open(f).subscribe((payload) => {
      if (!payload) return; // user cancelled
      this.paying[f.id] = true;
      this.api.payFine(f.id as number, payload).subscribe({ next: (res:any)=> {
        this.paying[f.id] = false;
        this.paySuccess[f.id] = true;
        f.paid = true;
        f.paid_at = new Date().toISOString();
      }, error: (err:any)=> {
        this.paying[f.id] = false;
        this.payError[f.id] = err?.error?.message || err?.message || 'Fizetés sikertelen.';
      }});
    });
  }
}
