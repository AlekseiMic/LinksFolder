import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AngularSvgIconPreloaderModule } from 'angular-svg-icon-preloader';
import { AuthService } from './shared/services/auth.service';
import { ApiInterceptor } from './core/interceptors/api.interceptor';
import { ThemeService } from './shared/services/theme.service';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./link-list/link-list.module').then((m) => m.LinkListModule),
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    AngularSvgIconModule.forRoot(),
    AngularSvgIconPreloaderModule.forRoot({
      configUrl: environment.assets + '/icons.json',
    }),
    CoreModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    SharedModule,
  ],
  providers: [
    AuthService,
    ThemeService,
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
