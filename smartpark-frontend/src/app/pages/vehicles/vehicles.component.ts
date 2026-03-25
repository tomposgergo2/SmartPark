import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { Vehicle } from '../../models';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html'
})
export class VehiclesComponent {
  vehicles = this.storage.getVehicles();
  form: Omit<Vehicle, 'id' | 'userId'> = { licensePlate: '', make: '', model: '', color: '' };

  constructor(private storage: StorageService) {}

  addVehicle(): void {
    if (!this.form.licensePlate || !this.form.make || !this.form.model || !this.form.color) return;
    this.vehicles = [
      ...this.vehicles,
      { id: Date.now().toString(), userId: '1', ...this.form }
    ];
    this.storage.saveVehicles(this.vehicles);
    this.form = { licensePlate: '', make: '', model: '', color: '' };
  }

  removeVehicle(id: string): void {
    this.vehicles = this.vehicles.filter(v => v.id !== id);
    this.storage.saveVehicles(this.vehicles);
  }
}
