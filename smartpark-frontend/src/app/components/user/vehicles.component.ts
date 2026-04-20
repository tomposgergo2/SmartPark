import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  template: `
  <div>
    <h3>Vehicles</h3>

    <div class="card mb-3">
      <div class="card-body">
        <form (ngSubmit)="add()" #vehicleForm="ngForm" class="row g-2 align-items-end">
          <div class="col-sm-4">
            <label class="form-label">Rendszám <span class="text-danger">*</span></label>
            <input class="form-control" [(ngModel)]="form.plate_number" name="plate" required #plate="ngModel" data-cy="vehicle-plate-input" />
            <div *ngIf="plate.invalid && (plate.dirty || plate.touched)" class="invalid-feedback d-block">
              Rendszám megadása kötelező.
            </div>
          </div>
          <div class="col-sm-3">
            <label class="form-label">Make</label>
            <input class="form-control" [(ngModel)]="form.make" name="make" data-cy="vehicle-make-input" />
          </div>
          <div class="col-sm-3">
            <label class="form-label">Model</label>
            <input class="form-control" [(ngModel)]="form.model" name="model" data-cy="vehicle-model-input" />
          </div>
          <div class="col-sm-2 text-end">
            <button class="btn btn-primary" type="submit" data-cy="vehicle-add-submit" [disabled]="adding || vehicleForm.invalid">Hozzáad</button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="loading" class="text-muted">Loading...</div>

    <table *ngIf="!loading" class="table table-striped">
      <thead>
        <tr>
          <th>Plate</th>
          <th>Make</th>
          <th>Model</th>
          <th class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let v of vehicles">
          <td>{{ v.plate_number }}</td>
          <td>{{ v.make }}</td>
          <td>{{ v.model }}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary me-2" (click)="edit(v)">Edit</button>
            <button class="btn btn-sm btn-danger" (click)="remove(v)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  loading = false;
  adding = false;
  editingId: number | null = null;
  form: Vehicle = { plate_number: '', make: '', model: '' };

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getVehicles().subscribe({ next: (res: any) => { this.vehicles = res; this.loading = false; }, error: () => { this.loading = false; } });
  }

  add() {
    if (!this.form.plate_number) return;
    this.adding = true;
    // if editingId is set, update existing vehicle
    if (this.editingId) {
      this.api.updateVehicle(this.editingId, this.form).subscribe({ next: () => { this.form = { plate_number: '', make: '', model: '' }; this.editingId = null; this.adding = false; this.load(); }, error: () => { this.adding = false; } });
      return;
    }

    // otherwise create new
    this.api.createVehicle(this.form).subscribe({ next: (res: any) => { this.form = { plate_number: '', make: '', model: '' }; this.adding = false; this.load(); }, error: () => { this.adding = false; } });
  }

  edit(v: Vehicle) {
    // Populate the top form for editing instead of prompts
    this.editingId = v.id as number;
    this.form = { plate_number: v.plate_number || '', make: v.make || '', model: v.model || '' };
    // focus UX: scroll to top of page so user sees the form (simple)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingId = null;
    this.form = { plate_number: '', make: '', model: '' };
  }

  remove(v: Vehicle) {
    if (!confirm(`Delete vehicle ${v.plate_number}?`)) return;
    this.api.deleteVehicle(v.id as number).subscribe({ next: () => this.load() });
  }
}
