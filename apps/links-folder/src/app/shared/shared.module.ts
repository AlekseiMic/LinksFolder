import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './components/signin/signin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { SignupComponent } from './components/signup/signup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DynamicDialogComponent } from './dialogs/DynamicDialog/dynamic.dialog.component';

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    DynamicDialogComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  providers: [
    AuthService,
    JwtService,
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
  ],
  exports: [SigninComponent],
})
export class SharedModule {}
