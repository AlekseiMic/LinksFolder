import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { JwtService } from './jwt.service';

let user: null | User = null;
let accessToken: null | string = null;

Injectable();
export class AuthService {
  login(username: string, password: string): boolean {
    return false;
  }

  signup(username: string, password: string): boolean {
    return false;
  }

  logout(): boolean {
    return false;
  }

  isLogged(): boolean {
    return false;
  }

  refreshAccessToken(): boolean {
    return false;
  }

  refreshRefreshToken(): boolean {
    return false;
  }

  get user() {
    return user;
  }

  set user(data: null | User) {
    user = data;
  }
}
