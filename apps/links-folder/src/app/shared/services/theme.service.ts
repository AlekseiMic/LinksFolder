import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public theme$ = new BehaviorSubject<'light' | 'dark'>('light');

  constructor() {
    this.loadTheme();

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        const theme = event.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle(this.theme$.value, false);
        this.set(theme);
      });
  }

  isPrefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  getPreferedTheme() {
    if (this.isPrefersDark()) return 'dark';
    return 'light';
  }

  loadTheme() {
    const savedTheme = window.localStorage.getItem('theme') as 'light' | 'dark';
    const theme = savedTheme ?? this.getPreferedTheme();
    this.set(theme);
  }

  set(theme: 'light' | 'dark') {
    window.localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle(theme, true);
    this.theme$.next(theme);
  }

  toggleTheme() {
    const oldTheme = this.theme$.getValue();
    const theme = oldTheme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle(oldTheme, false);
    this.set(theme);
  }
}
