import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserDashboardComponent } from './user-dashboard.component';
import { OfficerDashboardComponent } from './officer-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UserDashboardComponent, OfficerDashboardComponent, AdminDashboardComponent],
  template: `
    @switch (auth.user()?.role) {
      @case ('officer') { <app-officer-dashboard /> }
      @case ('admin') { <app-admin-dashboard /> }
      @default { <app-user-dashboard /> }
    }
  `
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}
}
