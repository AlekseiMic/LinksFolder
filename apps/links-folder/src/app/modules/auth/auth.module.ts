import { NgModule } from '@angular/core';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { CookieService } from './services/cookie.service';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [SigninComponent, SignupComponent],
  imports: [SharedModule],
  providers: [AuthService, JwtService, CookieService],
  exports: [SigninComponent, SignupComponent],
})
export class AuthModule {}
