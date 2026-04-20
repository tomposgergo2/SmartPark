import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Prefer token from localStorage for now (AuthService also stores it there)
    const token = localStorage.getItem('sp_token');
    let cloned = req;
    if (token) {
      cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // auto-logout on 401 and redirect to login
          try { this.auth.logout(); } catch (e) {}
          try { this.router.navigate(['/login']); } catch (e) {}
        }
        return throwError(() => err);
      })
    );
  }
}
