import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public theme$ = new BehaviorSubject<'light' | 'dark'>('light');

  constructor() {
    this.loadTheme();
  }

  loadTheme() {
    const theme = window.localStorage.getItem('theme') ?? 'light';
    if (theme === 'dark') {
      this.theme$.next(theme);
    }
    document.documentElement.classList.toggle(theme, true);
  }

  toggleTheme() {
    const oldTheme = this.theme$.getValue();
    const theme = oldTheme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle(oldTheme, false);
    document.documentElement.classList.toggle(theme, true);
    window.localStorage.setItem('theme', theme);
    this.theme$.next(theme);
  }
}
