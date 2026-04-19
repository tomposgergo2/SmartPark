import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserDashboardComponent } from './components/dashboard/user-dashboard.component';
import { OfficerDashboardComponent } from './components/dashboard/officer-dashboard.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';

import { VehiclesComponent } from './components/user/vehicles.component';
import { ZonesComponent } from './components/user/zones.component';
import { TicketsComponent } from './components/user/tickets.component';
import { FinesComponent } from './components/user/fines.component';

import { OfficerLookupComponent } from './components/officer/lookup.component';
import { OfficerFinesComponent } from './components/officer/fines.component';
import { OfficerInspectionsComponent } from './components/officer/inspections.component';

import { AdminUsersComponent } from './components/admin/users.component';
import { AdminZonesComponent } from './components/admin/zones.component';
import { AdminMonitoringComponent } from './components/admin/monitoring.component';

import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'dashboard/user', component: UserDashboardComponent, canActivate: [RoleGuard], data: { roles: ['USER'] } },
  { path: 'dashboard/officer', component: OfficerDashboardComponent, canActivate: [RoleGuard], data: { roles: ['PARKING_OFFICER','ADMIN'] } },
  { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },

  // User routes
  { path: 'user/vehicles', component: VehiclesComponent, canActivate: [RoleGuard], data: { roles: ['USER'] } },
  { path: 'user/zones', component: ZonesComponent, canActivate: [RoleGuard], data: { roles: ['USER'] } },
  { path: 'user/tickets', component: TicketsComponent, canActivate: [RoleGuard], data: { roles: ['USER'] } },
  { path: 'user/fines', component: FinesComponent, canActivate: [RoleGuard], data: { roles: ['USER'] } },

  // Officer routes
  { path: 'officer/lookup', component: OfficerLookupComponent, canActivate: [RoleGuard], data: { roles: ['PARKING_OFFICER','ADMIN'] } },
  { path: 'officer/fines', component: OfficerFinesComponent, canActivate: [RoleGuard], data: { roles: ['PARKING_OFFICER','ADMIN'] } },
  { path: 'officer/inspections', component: OfficerInspectionsComponent, canActivate: [RoleGuard], data: { roles: ['PARKING_OFFICER','ADMIN'] } },

  // Admin routes
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/zones', component: AdminZonesComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/monitoring', component: AdminMonitoringComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },

  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
