import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const roles: string[] = route.data['roles'] || [];

    return this.auth.user$.pipe(
      take(1),
      map(user => {
        console.debug('[RoleGuard] current user:', user, 'required roles:', roles);
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        if (roles.length === 0) return true;

        // Accept role aliasing: map possible backend role names to simpler tokens
        const role = (user.role || '').toUpperCase();
        const normalized = (r: string) => r.toUpperCase();

        // direct match
        if (roles.map(normalized).includes(role)) return true;

  // No legacy OFFICER aliasing - only explicit roles are accepted (PARKING_OFFICER or ADMIN etc.)

        // Not authorized
        this.router.navigate(['/dashboard']);
        return false;
      })
    );
  }
}
