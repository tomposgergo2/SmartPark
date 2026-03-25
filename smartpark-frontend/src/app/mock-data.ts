import { Fine, ParkingSession, User, Vehicle, Zone } from './models';

export const MOCK_USERS: User[] = [
  { id: '1', email: 'user@demo.com', name: 'John Doe', role: 'user', balance: 50 },
  { id: '2', email: 'officer@demo.com', name: 'Jane Officer', role: 'officer', balance: 0 },
  { id: '3', email: 'admin@demo.com', name: 'Admin User', role: 'admin', balance: 0 }
];

export const DEFAULT_VEHICLES: Vehicle[] = [
  { id: 'v1', userId: '1', licensePlate: 'ABC-123', make: 'Toyota', model: 'Corolla', color: 'Silver' },
  { id: 'v2', userId: '1', licensePlate: 'XYZ-987', make: 'Honda', model: 'Civic', color: 'Black' }
];

export const DEFAULT_ZONES: Zone[] = [
  { id: '1', name: 'Downtown Zone A', pricePerHour: 5, description: 'City center parking', capacity: 100, occupied: 45 },
  { id: '2', name: 'Downtown Zone B', pricePerHour: 5, description: 'Near shopping district', capacity: 80, occupied: 60 },
  { id: '3', name: 'Mall Area', pricePerHour: 3, description: 'Shopping mall parking', capacity: 200, occupied: 120 },
  { id: '4', name: 'Airport Zone', pricePerHour: 8, description: 'Airport long-term parking', capacity: 500, occupied: 350 },
  { id: '5', name: 'Residential Area', pricePerHour: 2, description: 'Suburban parking', capacity: 50, occupied: 15 }
];

export const DEFAULT_TICKETS: ParkingSession[] = [
  {
    id: 't1', vehicleId: 'v1', licensePlate: 'ABC-123', zoneId: '1', zoneName: 'Downtown Zone A',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'completed', cost: 10
  },
  {
    id: 't2', vehicleId: 'v2', licensePlate: 'XYZ-987', zoneId: '3', zoneName: 'Mall Area',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'completed', cost: 6
  }
];

export const DEFAULT_FINES: Fine[] = [
  {
    id: 'f1', vehicleId: 'v1', licensePlate: 'ABC-123', officerId: '2', reason: 'Expired parking session',
    amount: 50, status: 'unpaid', issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: 'f2', vehicleId: 'v2', licensePlate: 'XYZ-987', officerId: '2', reason: 'Parking in restricted zone',
    amount: 75, status: 'paid', issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
  }
];
