import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({ providedIn: 'root'})
export class ApiInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let requestUrl = req.url;
    if (requestUrl.startsWith('http')) return next.handle(req);
    return next.handle(
      req.clone({
        url: `http://localhost:3333${requestUrl}`,
        withCredentials: true,
        setHeaders: {
          Authorization: this.auth.bearer,
        },
      })
    );
  }
}
