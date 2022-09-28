import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class GuestService {
  get cookieSettings() {
    return {
      path: '/',
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 3600 * 60,
    };
  }

  setCookie(cookies: Response['cookie'], token: string) {
    cookies('tokenzy', token, this.cookieSettings);
  }

  removeCookie(res: Response) {
    res.clearCookie('tokenzy', this.cookieSettings);
  }
}