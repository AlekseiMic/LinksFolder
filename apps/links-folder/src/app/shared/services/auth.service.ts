import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import pDebounce from 'p-debounce';
import { BehaviorSubject, lastValueFrom, Subject } from 'rxjs';
import { JwtService } from './jwt.service';

let user: undefined | null | User;
let accessToken: undefined | null | string;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedSubject = new BehaviorSubject<boolean | undefined>(undefined);

  constructor(private http: HttpClient, private jwtService: JwtService) {}

  subscribeToAuthChange(callback: (v: boolean | undefined) => void) {
    const sub = this.isLoggedSubject.subscribe(callback);
    return sub;
  }

  async login(username: string, password: string): Promise<boolean> {
    const req = this.http.post<{ token: string }>('/auth/signin', {
      username,
      password,
    });

    const result = await lastValueFrom(req);
    if (result.token) {
      const { data, isValid } = this.jwtService.parse(result.token);
      if (!isValid || !data) {
        this.accessToken = null;
        this.user = null;
        return false;
      }
      this.accessToken = result.token;
      this.user = new User(data.id, data.name);
      return true;
    }

    return false;
  }

  async signup(username: string, password: string): Promise<boolean> {
    const req = this.http.post<{ token: string }>('/auth/signup', {
      username,
      password,
    });

    const result = await lastValueFrom(req);

    if (result.token) {
      const { data, isValid } = this.jwtService.parse(result.token);
      if (!isValid || !data) {
        this.user = null;
        this.accessToken = null;
        return false;
      }
      this.accessToken = result.token;
      this.user = new User(data.id, data.name);
      return true;
    }

    return false;
  }

  async logout(): Promise<boolean> {
    const req = this.http.post<boolean>('/auth/logout', {});
    const result = await lastValueFrom(req);
    if (result) {
      this.accessToken = null;
      this.user = null;
      return true;
    }
    return false;
  }

  get isLogged(): boolean {
    return this.user !== null;
  }

  public async refreshToken() {
    const req = this.http.post<{ token: string }>('/auth/refresh', {});
    const result = await lastValueFrom(req).catch((err) => {
      return { token: '' };
    });
    const { data, isValid } = result.token
      ? this.jwtService.parse(result.token)
      : { data: null, isValid: false };
    const ok = isValid && data;
    this.accessToken = ok ? result.token : null;
    this.user = ok ? new User(data.id, data.name) : null;
  }

  public get bearer() {
    return `Bearer ${accessToken}`;
  }

  dRefreshToken = pDebounce(this.refreshToken, 500);

  get user() {
    return user;
  }

  set accessToken(token: null | string) {
    accessToken = token;
  }

  set user(data: undefined | null | User) {
    if (data === undefined) throw new Error('Undefined is reserved');
    const shouldNotifySubscribers =
      (user === undefined && data !== user) ||
      (data !== user && (!user || !data));
    user = data;
    if (shouldNotifySubscribers) this.isLoggedSubject.next(!!data);
  }
}
