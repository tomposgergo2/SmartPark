import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  public readonly user$ = this._user$.asObservable();

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem('sp_user');
    if (raw) {
      this._user$.next(JSON.parse(raw));
    }
  }

  get currentUserValue(): User | null {
    return this._user$.value;
  }

  private api(path: string) {
    const base = environment.apiBaseUrl ? environment.apiBaseUrl.replace(/\/$/, '') + '/api' : '/api';
    return base + path;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<any>(this.api('/auth/login'), { email, password })
      .pipe(map(res => {
        // backend may return access_token or token depending on implementation
        const token = res.access_token || res.token || res.token_plain || res.tokenValue;
        const user = res.user;
        localStorage.setItem('sp_token', token);
        localStorage.setItem('sp_user', JSON.stringify(user));
        this._user$.next(user);
        return user;
      }));
  }

  register(name: string, email: string, password: string, password_confirmation: string): Observable<User> {
    return this.http.post<any>(this.api('/auth/register'), { name, email, password, password_confirmation })
      .pipe(map(res => {
        const token = res.access_token || res.token || res.token_plain || res.tokenValue;
        const user = res.user;
        localStorage.setItem('sp_token', token);
        localStorage.setItem('sp_user', JSON.stringify(user));
        this._user$.next(user);
        return user;
      }));
  }

  logout() {
    // Optionally call backend logout endpoint
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_user');
    this._user$.next(null);
  }
}
