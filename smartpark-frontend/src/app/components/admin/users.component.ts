import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-users',
  template: `
  <div class="admin-users">
    <div class="card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0">Felhasználók kezelése</h5>
          <div class="small text-muted">Itt módosíthatod a szerepköröket</div>
        </div>
        <div><button class="btn btn-sm btn-outline-secondary" (click)="load()">Frissít</button></div>
      </div>
    </div>

    <div *ngIf="loading" class="text-center p-3"><div class="spinner-border text-primary"></div></div>

    <div *ngIf="!loading">
      <table class="table table-striped">
        <thead>
          <tr><th>Id</th><th>Név</th><th>Email</th><th>Szerep</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td>{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select class="form-select form-select-sm" [(ngModel)]="u.role">
                <option value="USER">USER</option>
                <option value="PARKING_OFFICER">PARKING_OFFICER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-primary" (click)="saveRole(u)">Mentés</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() {
    this.loading = true;
    this.api.getUsers().subscribe({ next: (r:any) => { this.users = r || []; this.loading = false; }, error: () => { this.loading = false; } });
  }
  saveRole(u: any) {
    const payload = { role: u.role };
    this.api.updateUser(u.id, payload).subscribe({ next: () => { alert('Mentve'); }, error: (e:any) => { console.error(e); alert('Hiba mentéskor'); } });
  }
}
