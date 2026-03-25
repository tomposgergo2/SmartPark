import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-dashboard.component.html'
})
export class OfficerDashboardComponent {
  searchPlate = '';
  result: { licensePlate: string; hasActiveParking: boolean; zone: string; owner: string; fines: number; startTime: string } | null = null;

  constructor(private storage: StorageService) {}

  search(): void {
    if (!this.searchPlate.trim()) return;
    const active = this.storage.getActiveParking();
    const fines = this.storage.getFines().filter(f => f.licensePlate.toUpperCase() === this.searchPlate.toUpperCase()).length;
    this.result = {
      licensePlate: this.searchPlate.toUpperCase(),
      hasActiveParking: active?.licensePlate.toUpperCase() === this.searchPlate.toUpperCase(),
      zone: active?.zoneName ?? 'Downtown Zone A',
      owner: 'John Doe',
      fines,
      startTime: active?.startTime ?? new Date(Date.now() - 1000 * 60 * 90).toISOString()
    };
  }

  duration(startTime: string): string {
    const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }
}
