import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export class ApiInterceptor implements HttpInterceptor {
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
      })
    );
  }
}
