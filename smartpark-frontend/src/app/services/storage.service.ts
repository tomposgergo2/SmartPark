import { Injectable } from '@angular/core';
import { DEFAULT_FINES, DEFAULT_TICKETS, DEFAULT_VEHICLES, DEFAULT_ZONES } from '../mock-data';
import { Fine, ParkingSession, Vehicle, Zone } from '../models';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor() {
    this.ensureSeed();
  }

  private ensureSeed(): void {
    if (!localStorage.getItem('vehicles')) localStorage.setItem('vehicles', JSON.stringify(DEFAULT_VEHICLES));
    if (!localStorage.getItem('zones')) localStorage.setItem('zones', JSON.stringify(DEFAULT_ZONES));
    if (!localStorage.getItem('tickets')) localStorage.setItem('tickets', JSON.stringify(DEFAULT_TICKETS));
    if (!localStorage.getItem('fines')) localStorage.setItem('fines', JSON.stringify(DEFAULT_FINES));
  }

  getVehicles(): Vehicle[] { return JSON.parse(localStorage.getItem('vehicles') ?? '[]'); }
  saveVehicles(data: Vehicle[]): void { localStorage.setItem('vehicles', JSON.stringify(data)); }

  getZones(): Zone[] { return JSON.parse(localStorage.getItem('zones') ?? '[]'); }
  saveZones(data: Zone[]): void { localStorage.setItem('zones', JSON.stringify(data)); }

  getTickets(): ParkingSession[] { return JSON.parse(localStorage.getItem('tickets') ?? '[]'); }
  saveTickets(data: ParkingSession[]): void { localStorage.setItem('tickets', JSON.stringify(data)); }

  getFines(): Fine[] { return JSON.parse(localStorage.getItem('fines') ?? '[]'); }
  saveFines(data: Fine[]): void { localStorage.setItem('fines', JSON.stringify(data)); }

  getActiveParking(): ParkingSession | null {
    const raw = localStorage.getItem('active_parking');
    return raw ? JSON.parse(raw) : null;
  }

  saveActiveParking(data: ParkingSession | null): void {
    if (data) localStorage.setItem('active_parking', JSON.stringify(data));
    else localStorage.removeItem('active_parking');
  }
}
