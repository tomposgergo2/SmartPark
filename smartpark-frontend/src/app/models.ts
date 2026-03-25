export type UserRole = 'user' | 'officer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  balance: number;
}

export interface Vehicle {
  id: string;
  userId: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
}

export interface Zone {
  id: string;
  name: string;
  pricePerHour: number;
  description: string;
  capacity: number;
  occupied: number;
}

export interface ParkingSession {
  id: string;
  vehicleId: string;
  licensePlate: string;
  zoneId: string;
  zoneName: string;
  startTime: string;
  endTime: string | null;
  status: 'active' | 'completed';
  cost: number;
}

export interface Fine {
  id: string;
  vehicleId: string;
  licensePlate: string;
  officerId: string;
  reason: string;
  amount: number;
  status: 'paid' | 'unpaid';
  issuedAt: string;
}
