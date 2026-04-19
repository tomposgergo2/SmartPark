import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  name = '';
  password_confirmation = '';
  error = '';
  registering = false;
  submitting = false;

  constructor(private auth: AuthService, private router: Router) { }

  submit() {
    this.error = '';
    this.submitting = true;

    const finish = () => { this.submitting = false; };

    if (this.registering) {
      this.auth.register(this.name, this.email, this.password, this.password_confirmation).subscribe({
        next: user => { this.router.navigate(['/dashboard']); finish(); },
        error: err => { console.error('Register error', err); this.error = err?.error?.message || (err?.error ? JSON.stringify(err.error) : 'Registration failed'); finish(); }
      });
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: user => { this.router.navigate(['/dashboard']); finish(); },
      error: err => {
        console.error('Login error', err);
        this.error = err?.error?.message || (err?.error ? JSON.stringify(err.error) : 'Login failed');
        finish();
      }
    });
  }
}
