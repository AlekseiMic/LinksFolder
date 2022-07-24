import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './components/signin/signin.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { SignupComponent } from './components/signup/signup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DynamicDialogComponent } from './dialogs/DynamicDialog/dynamic.dialog.component';
import { DefaultLayoutComponent } from './components/defaultLayout/default.layout.component';
import { HeaderComponent } from './components/header/header.component';
import { AppButton } from './components/button/button.component';
import { DefaultDialogComponent } from './components/default-dialog/default-dialog.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    DynamicDialogComponent,
    DefaultLayoutComponent,
    HeaderComponent,
    AppButton,
    DefaultDialogComponent,
  ],
  imports: [
    AngularSvgIconModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatMenuModule,
  ],
  providers: [
    AuthService,
    JwtService,
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ],
  exports: [SigninComponent, DefaultLayoutComponent, DefaultDialogComponent],
})
export class SharedModule {}
