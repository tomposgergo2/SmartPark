import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { ParkingSession } from '../../models';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking.component.html'
})
export class ParkingComponent {
  vehicles = this.storage.getVehicles();
  zones = this.storage.getZones();
  activeParking = this.storage.getActiveParking();
  selectedVehicleId = this.vehicles[0]?.id ?? '';
  selectedZoneId = this.zones[0]?.id ?? '';

  constructor(private storage: StorageService) {}

  startParking(): void {
    if (this.activeParking || !this.selectedVehicleId || !this.selectedZoneId) return;
    const vehicle = this.vehicles.find(v => v.id === this.selectedVehicleId);
    const zone = this.zones.find(z => z.id === this.selectedZoneId);
    if (!vehicle || !zone) return;

    const session: ParkingSession = {
      id: Date.now().toString(),
      vehicleId: vehicle.id,
      licensePlate: vehicle.licensePlate,
      zoneId: zone.id,
      zoneName: zone.name,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active',
      cost: 0
    };

    this.activeParking = session;
    this.storage.saveActiveParking(session);
  }

  stopParking(): void {
    if (!this.activeParking) return;
    const zone = this.zones.find(z => z.id === this.activeParking?.zoneId);
    const hours = (Date.now() - new Date(this.activeParking.startTime).getTime()) / 3600000;
    const completed = {
      ...this.activeParking,
      endTime: new Date().toISOString(),
      status: 'completed' as const,
      cost: +(hours * (zone?.pricePerHour ?? 5)).toFixed(2)
    };
    const tickets = [completed, ...this.storage.getTickets()];
    this.storage.saveTickets(tickets);
    this.storage.saveActiveParking(null);
    this.activeParking = null;
  }

  duration(startTime: string): string {
    const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }
}
