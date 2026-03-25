import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MOCK_USERS } from '../mock-data';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(this.readUser());
  private readonly loadingSignal = signal(false);

  user = computed(() => this.userSignal());
  isLoading = computed(() => this.loadingSignal());
  isAuthenticated = computed(() => !!this.userSignal());

  constructor(private router: Router) {}

  private readUser(): User | null {
    const raw = localStorage.getItem('parking_user');
    return raw ? JSON.parse(raw) as User : null;
  }

  login(email: string, _password: string): boolean {
    this.loadingSignal.set(true);
    const foundUser = MOCK_USERS.find(user => user.email === email.trim().toLowerCase()) ?? null;
    this.loadingSignal.set(false);

    if (!foundUser) return false;

    localStorage.setItem('parking_user', JSON.stringify(foundUser));
    localStorage.setItem('parking_token', 'mock-jwt-token');
    this.userSignal.set(foundUser);
    return true;
  }

  logout(): void {
    localStorage.removeItem('parking_user');
    localStorage.removeItem('parking_token');
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }
}
