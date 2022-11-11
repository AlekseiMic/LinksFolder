import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import pDebounce from 'p-debounce';
import { BehaviorSubject, catchError, lastValueFrom, map, of } from 'rxjs';
import { JwtService } from './jwt.service';

let user: undefined | null | User;
let accessToken: undefined | null | string;
let expires: undefined | null | number;
let hasRefreshToken: undefined | boolean;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuth$ = new BehaviorSubject<boolean | undefined>(undefined);

  onLogout$ = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient, private jwtService: JwtService) {}

  subscribeToAuthChange(callback: (v: boolean | undefined) => void) {
    return this.isAuth$.subscribe(callback);
  }

  async login(username: string, password: string): Promise<boolean> {
    const req = this.http.post<{ token: string }>(`/auth/signin`, {
      username,
      password,
    });

    const { token } = await lastValueFrom(req);
    if (token) return this.processAccessToken(token);
    return false;
  }

  async signup(username: string, password: string): Promise<boolean> {
    const req = this.http.post<{ token: string }>(`/auth/signup`, {
      username,
      password,
    });

    const { token } = await lastValueFrom(req);
    if (token) return this.processAccessToken(token);
    return false;
  }

  clear() {
    expires = null;
    this.user = null;
    accessToken = null;
    hasRefreshToken = false;
  }

  processAccessToken(token: string) {
    const { data, isValid } = this.jwtService.parse(token);
    if (!isValid || !data || !data.exp) {
      this.clear();
      return false;
    }

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
