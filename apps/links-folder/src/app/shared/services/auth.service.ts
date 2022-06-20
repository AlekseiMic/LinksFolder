import { User } from '../models/user.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import pDebounce from 'p-debounce';
import { lastValueFrom } from 'rxjs';
import { JwtService } from './jwt.service';

let user: null | User = null;
let accessToken: null | string = null;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private jwtService: JwtService) {}

  async login(username: string, password: string): Promise<boolean> {
    const req = this.http.post<{ token: string }>('/auth/signin', {
      username,
      password,
    });
    const result = await lastValueFrom(req);
    if (result.token) {
      const { data, isValid } = this.jwtService.parse(result.token);
      if (!isValid || !data) {
        user = null;
        accessToken = null;
        return false;
      }
      user = new User(data.id);
      accessToken = result.token;
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
        user = null;
        accessToken = null;
        return false;
      }
      user = new User(data.id);
      accessToken = result.token;
      return true
    }
    return false;
  }

  async logout(): Promise<boolean> {
    const req = this.http.post<boolean>(
      '/auth/logout',
      {},
      { withCredentials: true, headers: { Authorization: this.bearer } }
    );
    const result = await lastValueFrom(req);
    if (result) {
      user = null;
      accessToken = null;
      return true;
    }
    return false;
  }

  isLogged(): boolean {
    return user !== null;
  }

  public async refreshToken() {
    const req = this.http.post<{ token: string }>('/auth/refresh', {});
    const result = await lastValueFrom(req);
    if (result.token) {
      const { data, isValid } = this.jwtService.parse(result.token);
      if (!isValid || !data) {
        user = null;
        accessToken = null;
        return false;
      }
      user = new User(data.id);
      accessToken = result.token;
      return true;
    }
    return false;
  }

  get bearer() {
    return `Bearer ${accessToken}`;
  }

  dRefreshToken = pDebounce(this.refreshToken, 500);

  get user() {
    return user;
  }

  set user(data: null | User) {
    user = data;
  }
}
