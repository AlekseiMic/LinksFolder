import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ],
})
export class CoreModule {}
