import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-payment-modal',
  template: `
  <div class="sp-modal-backdrop">
    <div class="sp-modal">
      <div class="sp-modal-header">
        <h5 class="mb-0">Fizetés</h5>
        <button type="button" class="btn-close" aria-label="Close" (click)="close()"></button>
      </div>
      <div class="sp-modal-body">
        <div *ngIf="fine" class="mb-2"><strong>{{ fine.amount }} Ft</strong> — {{ fine.reason }}</div>

        <div class="mb-2">
          <label class="form-label">Kártyabirtokos neve</label>
          <input class="form-control" [(ngModel)]="cardHolder" />
        </div>

        <div class="mb-2">
          <label class="form-label">Kártyaszám</label>
          <input class="form-control" maxlength="23" placeholder="XXXX XXXX XXXX XXXX" [ngModel]="cardNumber" (ngModelChange)="onCardInput($event)" />
          <div class="d-flex align-items-center gap-2 mt-1">
            <div class="card-brand">
              <ng-container *ngIf="cardBrand === 'Visa'">
                <!-- small Visa-like badge -->
                <svg width="56" height="20" viewBox="0 0 56 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect width="56" height="20" fill="#1A47B8" rx="3"></rect>
                  <text x="6" y="14" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="white">VISA</text>
                </svg>
              </ng-container>
              <ng-container *ngIf="cardBrand === 'Mastercard'">
                <!-- Mastercard-like overlapping circles -->
                <svg width="36" height="20" viewBox="0 0 36 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="13" cy="10" r="7" fill="#EB001B"></circle>
                  <circle cx="23" cy="10" r="7" fill="#F79E1B" opacity="0.95"></circle>
                </svg>
              </ng-container>
              <ng-container *ngIf="!cardBrand || cardBrand === 'Ismeretlen'">
                <i class="bi bi-credit-card-2-front"></i>
              </ng-container>
            </div>
            <div class="small text-muted">Típus: <strong>{{ cardBrand || 'Ismeretlen' }}</strong></div>
          </div>
          <div *ngIf="cardError" class="small text-danger">{{ cardError }}</div>
        </div>

        <div class="d-flex gap-2">
          <div class="flex-fill">
            <label class="form-label">Lejárat (MM/YY)</label>
            <input class="form-control" maxlength="5" placeholder="MM/YY" [(ngModel)]="cardExp" />
          </div>
          <div style="width:100px;">
            <label class="form-label">CVC</label>
            <input class="form-control" maxlength="4" [(ngModel)]="cardCvc" />
          </div>
        </div>

      </div>
      <div class="sp-modal-footer">
        <button class="btn btn-secondary" (click)="close()">Mégse</button>
        <button class="btn btn-primary" [disabled]="submitting" (click)="submit()">{{ submitting ? 'Feldolgozás...' : 'Fizetés' }}</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .sp-modal-backdrop { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); z-index:1050; }
    .sp-modal { background: white; width: 520px; border-radius:8px; box-shadow:0 12px 40px rgba(15,23,42,0.15); overflow:hidden; }
    .sp-modal-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #eee; }
    .sp-modal-body { padding:16px; }
    .sp-modal-footer { padding:12px 16px; display:flex; gap:8px; justify-content:flex-end; border-top:1px solid #eee; }
  `]
})
export class PaymentModalComponent {
  @Input() fine: any = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() paid = new EventEmitter<any>();

  cardHolder = '';
  // shown formatted (groups of 4), e.g. '4111 1111 1111 1111'
  cardNumber = '';
  // internal digits-only representation
  cardNumberRaw = '';
  cardExp = '';
  cardCvc = '';
  cardBrand = '';
  cardError = '';
  submitting = false;

  close() { this.cancelled.emit(); }

  onCardInput(value?: string) {
    // Accept incoming value (formatted or raw), strip non-digits, limit to 19 digits
    const incoming = (typeof value === 'string') ? value : this.cardNumber;
    const digits = (incoming || '').replace(/\D/g, '').slice(0, 19);
    this.cardNumberRaw = digits;
    this.cardBrand = this.detectBrand(digits);
    // format in groups of 4 for display
    this.cardNumber = this.formatCardNumber(digits);
  }

  formatCardNumber(digits: string) {
    if (!digits) return '';
    const parts: string[] = [];
    for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
    return parts.join(' ');
  }

  detectBrand(digits: string) {
    if (!digits) return '';
    if (/^4/.test(digits)) return 'Visa';
    if (/^(5[1-5])/.test(digits)) return 'Mastercard';
    if (/^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)/.test(digits)) return 'Mastercard';
    return 'Ismeretlen';
  }

  luhnCheck(num: string) {
    const s = (num || '').replace(/\D/g, '');
    const arr = (s + '').split('').reverse().map(x => parseInt(x, 10));
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      let val = arr[i];
      if (i % 2 === 1) { val *= 2; if (val > 9) val -= 9; }
      sum += val;
    }
    return sum % 10 === 0;
  }

  validate(): boolean {
    this.cardError = '';
  const digits = this.cardNumberRaw || this.cardNumber.replace(/\D/g, '');
  if (!this.cardHolder || !digits || digits.length < 12) { this.cardError = 'Kérlek add meg a kártyaadatokat.'; return false; }
  if (!this.luhnCheck(digits)) { this.cardError = 'Érvénytelen kártyaszám.'; return false; }
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(this.cardExp)) { this.cardError = 'Érvénytelen lejárat (MM/YY).'; return false; }
    if (!/^[0-9]{3,4}$/.test(this.cardCvc)) { this.cardError = 'Érvénytelen CVC.'; return false; }
    return true;
  }

  submit() {
    if (!this.validate()) return;
    this.submitting = true;
    // prepare minimal payload
    const digits = this.cardNumberRaw || this.cardNumber.replace(/\D/g, '');
    const payload = {
      method: 'CARD_SIM',
      amount: this.fine?.amount || null,
      card_brand: this.cardBrand,
      card_last4: digits.slice(-4),
      card_holder: this.cardHolder,
      card_exp: this.cardExp,
    };

    // emit the payload back to parent; parent will call API
    setTimeout(() => {
      this.submitting = false;
      this.paid.emit(payload);
    }, 300); // small delay to simulate
  }
}
