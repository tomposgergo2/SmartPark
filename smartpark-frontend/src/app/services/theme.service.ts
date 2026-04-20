import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'sp_theme_dark';

  isDark(): boolean {
    const stored = localStorage.getItem(this.key);
    if (stored !== null) return stored === '1';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  apply(dark: boolean) {
    try {
      document.body.classList.toggle('dark', dark);
      localStorage.setItem(this.key, dark ? '1' : '0');
    } catch (e) {
      // ignore (server-side render / restricted environments)
    }
  }

  toggle() { this.apply(!this.isDark()); }
}
