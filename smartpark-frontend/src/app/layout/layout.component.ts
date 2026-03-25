import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  sidebarOpen = signal(false);
  user = this.auth.user;

  navigation = [
    { name: 'Dashboard', path: '/dashboard', roles: ['user', 'officer', 'admin'] },
    { name: 'Vehicles', path: '/vehicles', roles: ['user'] },
    { name: 'Parking', path: '/parking', roles: ['user'] },
    { name: 'Tickets', path: '/tickets', roles: ['user'] },
    { name: 'Fines', path: '/fines', roles: ['user'] },
    { name: 'Officer Panel', path: '/officer', roles: ['officer'] },
    { name: 'Zones', path: '/zones', roles: ['admin'] },
    { name: 'Statistics', path: '/statistics', roles: ['admin'] }
  ];

  filteredNavigation = computed(() => {
    const user = this.auth.user();
    return this.navigation.filter(item => user && item.roles.includes(user.role));
  });

  pageTitle = computed(() => {
    const current = this.navigation.find(item => item.path === this.router.url);
    return current?.name ?? 'Dashboard';
  });

  constructor(private auth: AuthService, private router: Router) {}

  logout(): void { this.auth.logout(); }
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void { this.sidebarOpen.set(false); }
}
