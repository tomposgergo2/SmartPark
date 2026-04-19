import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

function isActiveTicket(t: any) {
  if (!t || !t.expires_at) return false;
  return new Date(t.expires_at).getTime() > Date.now();
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="p-3">
      <p>Redirecting to your role dashboard...</p>
    </div>
  `
})
export class DashboardComponent {
  user = null as any;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    // wait for auth state (handles refresh scenarios)
    this.auth.user$.pipe(take(1)).subscribe((u: any) => {
      console.debug('[Dashboard redirect] auth.user$ ->', u);
      if (!u) {
        this.router.navigate(['/login']);
        return;
      }
      this.user = u;
      const role = (u.role || '').toUpperCase();
      if (role === 'ADMIN') this.router.navigate(['/dashboard/admin']);
      else if (role === 'PARKING_OFFICER' || role === 'OFFICER') this.router.navigate(['/dashboard/officer']);
      else this.router.navigate(['/dashboard/user']);
    });
  }
}
