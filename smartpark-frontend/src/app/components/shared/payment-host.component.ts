import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PaymentService, PaymentRequest } from '../../services/payment.service';

@Component({
  selector: 'app-payment-host',
  template: `
    <app-payment-modal *ngIf="show" [fine]="fine" (cancelled)="onCancel()" (paid)="onPaid($event)"></app-payment-modal>
  `
})
export class PaymentHostComponent implements OnDestroy {
  show = false;
  fine: any = null;
  sub: Subscription | null = null;
  currentReq: PaymentRequest | null = null;

  constructor(private ps: PaymentService) {
    this.sub = this.ps.requests.subscribe((r) => {
      // if a modal is already open, respond with null to the previous one
      if (this.currentReq) {
        try { this.currentReq.resp.next(null); this.currentReq.resp.complete(); } catch (e) {}
        this.currentReq = null;
      }
      this.currentReq = r;
      this.fine = r.fine;
      this.show = true;
    });
  }

  onCancel() {
    if (this.currentReq) {
      this.currentReq.resp.next(null);
      this.currentReq.resp.complete();
      this.currentReq = null;
    }
    this.close();
  }

  onPaid(payload: any) {
    if (this.currentReq) {
      this.currentReq.resp.next(payload);
      this.currentReq.resp.complete();
      this.currentReq = null;
    }
    this.close();
  }

  close() {
    this.show = false;
    this.fine = null;
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
