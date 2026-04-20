import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-change-password',
  template: `
  <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Jelszó módosítása</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div *ngIf="message" class="alert" [ngClass]="{'alert-success': success, 'alert-danger': !success}">{{ message }}</div>

          <div class="mb-2">
            <label class="form-label">Jelenlegi jelszó</label>
            <input type="password" class="form-control" [(ngModel)]="current_password" name="current_password" />
          </div>

          <div class="mb-2">
            <label class="form-label">Új jelszó</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password" />
          </div>

          <div class="mb-2">
            <label class="form-label">Új jelszó (ismét)</label>
            <input type="password" class="form-control" [(ngModel)]="password_confirmation" name="password_confirmation" />
          </div>

          <div *ngIf="error" class="small text-danger">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Mégse</button>
          <button class="btn btn-primary" type="button" [disabled]="submitting" (click)="submit()">{{ submitting ? 'Feldolgozás...' : 'Módosítás' }}</button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ChangePasswordComponent {
  current_password = '';
  password = '';
  password_confirmation = '';
  submitting = false;
  error = '';
  message = '';
  success = false;

  constructor(private api: ApiService) {}

  private closeModal() {
    try {
      // try to use Bootstrap modal API if available
      const el = document.getElementById('changePasswordModal');
      // @ts-ignore
      const bs = (window as any).bootstrap?.Modal?.getInstance(el);
      if (bs && typeof bs.hide === 'function') { bs.hide(); return; }
      // fallback: click any dismiss button
      const btn = el?.querySelector('[data-bs-dismiss="modal"]') as HTMLElement | null;
      if (btn) btn.click();
    } catch (e) { /* ignore */ }
  }

  submit() {
    this.error = '';
    this.message = '';
    if (!this.current_password) { this.error = 'Add meg a jelenlegi jelszót.'; return; }
    if (!this.password) { this.error = 'Add meg az új jelszót.'; return; }
    if (this.password !== this.password_confirmation) { this.error = 'Az új jelszavak nem egyeznek.'; return; }

    this.submitting = true;
    this.api.changePassword(this.current_password, this.password, this.password_confirmation).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.success = true;
        this.message = (res && res.message) ? res.message : 'Jelszó sikeresen módosítva.';
        // clear inputs
        this.current_password = this.password = this.password_confirmation = '';
        // close modal after a short delay to show success message
        setTimeout(() => this.closeModal(), 800);
      },
      error: (err: any) => {
        this.submitting = false;
        this.success = false;
        if (err?.error?.message) this.error = err.error.message;
        else if (err?.message) this.error = err.message;
        else this.error = 'Hiba történt a kérés során.';
      }
    });
  }
}
