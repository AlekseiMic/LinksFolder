import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AngularSvgIconPreloaderModule } from 'angular-svg-icon-preloader';
import { environment } from '../environments/environment';
import { AuthModule } from './modules/auth/auth.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/main/main.module').then((m) => m.LinkListModule),
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
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    SharedModule,
    AuthModule,
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
