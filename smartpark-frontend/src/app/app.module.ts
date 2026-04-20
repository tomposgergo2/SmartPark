import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserDashboardComponent } from './components/dashboard/user-dashboard.component';
import { OfficerDashboardComponent } from './components/dashboard/officer-dashboard.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';

import { VehiclesComponent } from './components/user/vehicles.component';
import { ZonesComponent } from './components/user/zones.component';
import { TicketsComponent } from './components/user/tickets.component';
import { FinesComponent } from './components/user/fines.component';
import { PaymentModalComponent } from './components/shared/payment-modal.component';
import { PaymentHostComponent } from './components/shared/payment-host.component';
import { ChangePasswordComponent } from './components/shared/change-password.component';

import { OfficerLookupComponent } from './components/officer/lookup.component';
import { OfficerFinesComponent } from './components/officer/fines.component';
import { OfficerInspectionsComponent } from './components/officer/inspections.component';

import { AdminUsersComponent } from './components/admin/users.component';
import { AdminZonesComponent } from './components/admin/zones.component';
import { AdminMonitoringComponent } from './components/admin/monitoring.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
  UserDashboardComponent,
  OfficerDashboardComponent,
  AdminDashboardComponent,
    VehiclesComponent,
    ZonesComponent,
    TicketsComponent,
    FinesComponent,
  PaymentModalComponent,
  PaymentHostComponent,
  ChangePasswordComponent,
    OfficerLookupComponent,
    OfficerFinesComponent,
  OfficerInspectionsComponent,
    AdminUsersComponent,
    AdminZonesComponent,
    AdminMonitoringComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
