import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, lastValueFrom } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

const API = environment.api;

@Injectable({ providedIn: 'root' })
export class ApiInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let url = req.url;

    if (url.startsWith('/assets') || url.startsWith('http')) {
      return next.handle(req);
    }


    if (url !== '/auth/refresh' && this.auth.shouldRefresh) {
      return from(
        this.auth
          .dRefreshToken()
          .then(() =>
            lastValueFrom(next.handle(req.clone(this.getConfig(url))))
          )
      );
    }

    return next.handle(req.clone(this.getConfig(url)));
  }

  private getConfig(url: string) {
    return {
      url: `${API}${url}`,
      withCredentials: true,
      setHeaders: {
        Authorization: this.auth.bearer,
      },
    };
  }
}
