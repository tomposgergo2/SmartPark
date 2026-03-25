import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  zones = this.storage.getZones();
  totalCapacity = this.zones.reduce((sum, z) => sum + z.capacity, 0);
  totalOccupied = this.zones.reduce((sum, z) => sum + z.occupied, 0);

  constructor(private storage: StorageService) {}
}
