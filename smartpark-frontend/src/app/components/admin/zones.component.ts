import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-zones',
  template: `
  <div class="admin-zones">
    <div class="card p-3 mb-3 d-flex justify-content-between align-items-center">
      <div>
        <h5 class="mb-0">Parkolási zónák</h5>
        <div class="small text-muted">Létrehozás és szerkesztés</div>
      </div>
      <div><button class="btn btn-sm btn-outline-secondary" (click)="load()">Frissít</button></div>
    </div>

    <div class="card p-3 mb-3">
      <form (submit)="createZone($event)">
        <div class="row g-2 mb-2">
          <div class="col-4"><input class="form-control" placeholder="Név" [(ngModel)]="newZone.name" name="name" required /></div>
          <div class="col-3"><input class="form-control" placeholder="Kód" [(ngModel)]="newZone.code" name="code" required /></div>
          <div class="col-3"><input class="form-control" type="number" placeholder="Bírság (Ft)" [(ngModel)]="newZone.fine_amount" name="fine_amount" /></div>
        </div>
        <div class="row g-2 align-items-center">
          <div class="col-2"><input class="form-control" type="number" placeholder="Ft/óra" [(ngModel)]="newZone.rate_per_hour" name="rate_per_hour" /></div>
          <div class="col-2"><input class="form-control" type="number" placeholder="Min perc" [(ngModel)]="newZone.min_minutes" name="min_minutes" /></div>
          <div class="col-2"><input class="form-control" type="number" placeholder="Max perc" [(ngModel)]="newZone.max_minutes" name="max_minutes" /></div>
          <div class="col-2 d-flex align-items-center">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="zoneActive" [(ngModel)]="newZone.active" name="active" />
              <label class="form-check-label small ms-2" for="zoneActive">Aktív</label>
            </div>
          </div>
          <div class="col-4 text-end"><button class="btn btn-success" type="submit">Létrehoz</button></div>
        </div>
      </form>
    </div>

    <div *ngIf="loading" class="text-center p-3"><div class="spinner-border text-primary"></div></div>

    <div *ngIf="!loading">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Név</th>
            <th>Kód</th>
            <th>Ft/óra</th>
            <th>Min (perc)</th>
            <th>Max (perc)</th>
            <th>Bírság (Ft)</th>
            <th>Aktív</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let z of zones">
            <td>{{ z.id }}</td>
            <td><input class="form-control form-control-sm" [(ngModel)]="z.name" /></td>
            <td><input class="form-control form-control-sm" [(ngModel)]="z.code" /></td>
            <td><input class="form-control form-control-sm" type="number" [(ngModel)]="z.rate_per_hour" /></td>
            <td><input class="form-control form-control-sm" type="number" [(ngModel)]="z.min_minutes" /></td>
            <td><input class="form-control form-control-sm" type="number" [(ngModel)]="z.max_minutes" /></td>
            <td><input class="form-control form-control-sm" type="number" [(ngModel)]="z.fine_amount" /></td>
            <td class="text-center"><input type="checkbox" [(ngModel)]="z.active" /></td>
            <td class="align-middle" style="min-width:120px">
              <div class="d-flex flex-column gap-2 align-items-end">
                <button class="btn btn-sm btn-primary" (click)="saveZone(z)">Mentés</button>
                <button class="btn btn-sm btn-danger" (click)="removeZone(z)">Törlés</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `
})
export class AdminZonesComponent implements OnInit {
  zones: any[] = [];
  newZone: any = { name: '', code: '', fine_amount: null, rate_per_hour: null, min_minutes: null, max_minutes: null, active: true };
  loading = false;
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.api.getZones().subscribe({ next: (r:any) => { this.zones = r || []; this.loading = false; }, error: () => { this.loading = false; } }); }
  createZone(e: Event) { e.preventDefault(); this.api.createZone(this.newZone).subscribe({ next: () => { this.newZone = { name: '', code: '', fine_amount: null }; this.load(); }, error: (e:any) => { console.error(e); alert('Hiba zóna létrehozásakor'); } }); }
  saveZone(z: any) { this.api.updateZone(z.id, z).subscribe({ next: () => { alert('Mentve'); }, error: (e:any) => { console.error(e); alert('Hiba mentéskor'); } }); }
  removeZone(z: any) { if (!confirm('Biztos törlöd a zónát?')) return; this.api.deleteZone(z.id).subscribe({ next: () => this.load(), error: (e:any) => { console.error(e); alert('Hiba törléskor'); } }); }
}
