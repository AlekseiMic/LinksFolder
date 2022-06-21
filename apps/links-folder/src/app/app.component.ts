import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SigninComponent } from './shared/components/signin/signin.component';
import { SignupComponent } from './shared/components/signup/signup.component';
import { DynamicDialogComponent } from './shared/dialogs/DynamicDialog/dynamic.dialog.component';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'links-folder';
  isLogged = false;

  constructor(private auth: AuthService, public dialog: MatDialog) {
    this.auth.isLoggedSubject.subscribe((v) => {
      this.isLogged = v;
    });
  }

  onLogout() {
    this.auth.logout();
  }

  openSigninDialog() {
    this.dialog.open(DynamicDialogComponent, {
      width: '400px',
      data: { component: SigninComponent }
    });
  }

  openSignupDialog() {
    this.dialog.open(DynamicDialogComponent, {
      width: '400px',
      data: { component: SignupComponent },
    });
  }

  ngOnInit(): void {
    this.auth.dRefreshToken();
  }
}
