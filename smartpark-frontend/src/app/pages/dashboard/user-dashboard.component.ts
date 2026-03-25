import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html'
})
export class UserDashboardComponent {
  activeParking = this.storage.getActiveParking();
  tickets = this.storage.getTickets();
  fines = this.storage.getFines();
  vehicles = this.storage.getVehicles();

  constructor(public auth: AuthService, private router: Router, private storage: StorageService) {}

  duration(startTime: string): string {
    const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }

  cost(startTime: string, hourly = 5): string {
    const hours = (Date.now() - new Date(startTime).getTime()) / 3600000;
    return (hours * hourly).toFixed(2);
  }

  get unpaidFinesCount(): number {
    return this.fines.filter(fine => fine.status === 'unpaid').length;
  }

  go(path: string): void { this.router.navigate([path]); }
}
