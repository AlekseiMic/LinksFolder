import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import pDebounce from 'p-debounce';
import { BehaviorSubject, catchError, lastValueFrom, map, of } from 'rxjs';
import { JwtService } from './jwt.service';

let user: undefined | null | User;
let accessToken: undefined | null | string;
let expires: undefined | null | number;
let hasRefreshToken: undefined | boolean;

export class User {
  constructor(public id: number, public name?: string) {}
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuth$ = new BehaviorSubject<boolean | undefined>(undefined);

  onLogout$ = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient, private jwtService: JwtService) {
    const hasRefresh = window.localStorage.getItem('hasRefresh');
    if (hasRefresh === null) return;
    hasRefreshToken = !!hasRefresh;
    if (!hasRefreshToken) this.isAuth$.next(false);
  }

  subscribeToAuthChange(callback: (v: boolean | undefined) => void) {
    return this.isAuth$.subscribe(callback);
  }

  async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; errors?: Record<string, string> }> {
    const req = this.http.post<{ token: string }>(`/auth/signin`, {
      username,
      password,
    });

    try {
      const { token } = await lastValueFrom(req);
      this.processAccessToken(token);
      return { success: true };
    } catch (error: any) {
      if (error.error.code === 'USER_NOT_FOUND') {
        return {
          success: false,
          errors: { common: 'Incorrect login or password' },
        };
      }
      return {
        success: false,
        errors: { common: 'Server error, try again later' },
      };
    }
  }

  async signup(
    username: string,
    password: string
  ): Promise<{ success: boolean; code?: string }> {
    const req = this.http.post<{ token: string }>(`/auth/signup`, {
      username,
      password,
    });

    try {
      const result = await lastValueFrom(req);
      this.processAccessToken(result.token);
      return { success: true };
    } catch (error: any) {
      return { success: false, code: error.error?.code };
    }
  }

  clear() {
    expires = null;
    this.user = null;
    accessToken = null;
    hasRefreshToken = false;
    window.localStorage.setItem('hasRefresh', '');
  }

  processAccessToken(token: string) {
    const { data, isValid } = this.jwtService.parse(token);
    if (!isValid || !data || !data.exp) {
      this.clear();
      return false;
    }

    window.localStorage.setItem('hasRefresh', '1');
    hasRefreshToken = true;
    expires = data.exp;
    accessToken = token;
    this.user = new User(data.id, data.name);
    return true;
  }

  async logout(): Promise<boolean> {
    const req = this.http.post<boolean>(`/auth/logout`, {});
    await lastValueFrom(req);
    this.clear();
    this.onLogout$.next(true);
    return false;
  }

  get isLogged(): boolean {
    return this.user !== null;
  }

  public get bearer() {
    return `Bearer ${accessToken}`;
  }

  dRefreshToken = pDebounce(async () => {
    if (hasRefreshToken === false) return;
    const result = this.http.post<{ token: string }>(`/auth/refresh`, {}).pipe(
      catchError(() => {
        this.clear();
        return of(false);
      }),
      map((result) => {
        if (typeof result !== 'object') return false;
        this.processAccessToken(result.token);
        return true;
      })
    );
    return lastValueFrom(result);
  }, 500);

  get shouldRefresh() {
    if (hasRefreshToken === false) return false;
    if (hasRefreshToken === undefined) return true;
    return !(expires && expires > new Date().getTime() / 1000);
  }

  get user() {
    return user;
  }

  set user(data: undefined | null | User) {
    if (data === undefined) throw new Error('Undefined is reserved');
    const shouldNotifySubscribers =
      (user === undefined && data !== user) ||
      (data !== user && (!user || !data));
    user = data;
    if (shouldNotifySubscribers) this.isAuth$.next(!!data);
  }
}
