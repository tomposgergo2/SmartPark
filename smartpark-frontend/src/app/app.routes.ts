import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { ParkingComponent } from './pages/parking/parking.component';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { FinesComponent } from './pages/fines/fines.component';
import { ZonesComponent } from './pages/zones/zones.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vehicles', component: VehiclesComponent, canActivate: [authGuard], data: { roles: ['user'] } },
      { path: 'parking', component: ParkingComponent, canActivate: [authGuard], data: { roles: ['user'] } },
      { path: 'tickets', component: TicketsComponent, canActivate: [authGuard], data: { roles: ['user'] } },
      { path: 'fines', component: FinesComponent, canActivate: [authGuard], data: { roles: ['user'] } },
      { path: 'officer', component: DashboardComponent, canActivate: [authGuard], data: { roles: ['officer'] } },
      { path: 'zones', component: ZonesComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
      { path: 'statistics', component: DashboardComponent, canActivate: [authGuard], data: { roles: ['admin'] } }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
