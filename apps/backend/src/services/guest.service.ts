import { Injectable } from '@nestjs/common';
import { Response } from 'express';

const maxAge = 1000 * 3600 * 24 * 365 * 5;
@Injectable()
export class GuestService {
  get cookieSettings() {
    return {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge,
    };
  }

  setCookie(cookies: Response['cookie'], token: string) {
    cookies('tokenzy', token, this.cookieSettings);
  }

  removeCookie(res: Response) {
    res.clearCookie('tokenzy', this.cookieSettings);
  }
}
