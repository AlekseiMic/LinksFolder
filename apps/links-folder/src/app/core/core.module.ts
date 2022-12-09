import { NgModule } from '@angular/core';
import { MainComponent } from './layout/main/main.component';
import { HeaderComponent } from './layout/header/header.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../modules/auth/auth.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MainComponent, HeaderComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ],
  imports: [SharedModule, AuthModule, RouterModule],
  exports: [MainComponent],
})
export class CoreModule {}
