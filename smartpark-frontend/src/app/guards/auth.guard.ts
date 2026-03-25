import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const roles = route.data['roles'] as UserRole[] | undefined;
  if (roles && !roles.includes(user.role)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user() ? router.createUrlTree(['/dashboard']) : true;
};
