import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiBaseUrl ? environment.apiBaseUrl.replace(/\/$/, '') + '/api' : '/api';
  constructor(private http: HttpClient) { }

  private headers() {
    const token = localStorage.getItem('sp_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return { headers: new HttpHeaders(headers) };
  }

  // Zones
  getZones(): Observable<any> { return this.http.get(`${this.base}/zones`, this.headers()); }
  createZone(payload: any) { return this.http.post(`${this.base}/zones`, payload, this.headers()); }

  // Vehicles
  getVehicles() { return this.http.get(`${this.base}/vehicles`, this.headers()); }
  createVehicle(payload: any) { return this.http.post(`${this.base}/vehicles`, payload, this.headers()); }
  updateVehicle(id: number, payload: any) { return this.http.put(`${this.base}/vehicles/${id}`, payload, this.headers()); }
  deleteVehicle(id: number) { return this.http.delete(`${this.base}/vehicles/${id}`, this.headers()); }

  // Tickets
  getTickets() { return this.http.get(`${this.base}/tickets`, this.headers()); }
  createTicket(payload: any) { return this.http.post(`${this.base}/tickets`, payload, this.headers()); }
  extendTicket(id: number, payload: any) { return this.http.post(`${this.base}/tickets/${id}/extend`, payload, this.headers()); }

  // Fines
  getFines() { return this.http.get(`${this.base}/fines`, this.headers()); }
  getOfficerFines() { return this.http.get(`${this.base}/officer/fines`, this.headers()); }
  issueFine(payload: any) { return this.http.post(`${this.base}/officer/fines`, payload, this.headers()); }
  payFine(id: number, payload: any = {}) { return this.http.post(`${this.base}/fines/${id}/pay`, payload, this.headers()); }

  // Officer
  lookupPlate(plate: string) { return this.http.get(`${this.base}/officer/lookup?plate=${encodeURIComponent(plate)}`, this.headers()); }

  // Admin
  getUsers() { return this.http.get(`${this.base}/users`, this.headers()); }
  getAdminStats() { return this.http.get(`${this.base}/admin/stats`, this.headers()); }
  updateUser(id: number, payload: any) { return this.http.put(`${this.base}/users/${id}`, payload, this.headers()); }

  // Authenticated account actions
  changePassword(current_password: string, password: string, password_confirmation: string) {
    const payload = { current_password, password, password_confirmation };
    return this.http.post(`${this.base}/auth/change-password`, payload, this.headers());
  }

  // Zone management (update / delete)
  updateZone(id: number, payload: any) { return this.http.put(`${this.base}/zones/${id}`, payload, this.headers()); }
  deleteZone(id: number) { return this.http.delete(`${this.base}/zones/${id}`, this.headers()); }
}
