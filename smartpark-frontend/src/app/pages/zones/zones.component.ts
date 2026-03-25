import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { Zone } from '../../models';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zones.component.html'
})
export class ZonesComponent {
  zones = this.storage.getZones();
  editingId: string | null = null;
  form = { name: '', pricePerHour: '', description: '', capacity: '' };

  constructor(private storage: StorageService) {}

  saveZone(): void {
    if (!this.form.name || !this.form.pricePerHour || !this.form.capacity) return;
    const zoneData = {
      name: this.form.name,
      pricePerHour: +this.form.pricePerHour,
      description: this.form.description,
      capacity: +this.form.capacity,
      occupied: this.editingId ? (this.zones.find(z => z.id === this.editingId)?.occupied ?? 0) : 0,
    };

    if (this.editingId) {
      this.zones = this.zones.map(zone => zone.id === this.editingId ? { id: zone.id, ...zoneData } : zone);
    } else {
      this.zones = [...this.zones, { id: Date.now().toString(), ...zoneData } as Zone];
    }
    this.storage.saveZones(this.zones);
    this.reset();
  }

  editZone(zone: Zone): void {
    this.editingId = zone.id;
    this.form = {
      name: zone.name,
      pricePerHour: String(zone.pricePerHour),
      description: zone.description,
      capacity: String(zone.capacity)
    };
  }

  reset(): void {
    this.editingId = null;
    this.form = { name: '', pricePerHour: '', description: '', capacity: '' };
  }

  get totalCapacity(): number {
    return this.zones.reduce((sum, zone) => sum + zone.capacity, 0);
  }

  get averagePrice(): string {
    if (!this.zones.length) return '0.00';
    const total = this.zones.reduce((sum, zone) => sum + zone.pricePerHour, 0);
    return (total / this.zones.length).toFixed(2);
  }

  occupancy(zone: Zone): number { return (zone.occupied / zone.capacity) * 100; }
}
