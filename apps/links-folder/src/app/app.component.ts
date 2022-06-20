import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SigninDialogComponent } from './shared/dialogs/SigninDialog/signin.dialog.component';
import { SignupDialogComponent } from './shared/dialogs/SignupDialog/signup.dialog.component';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'links-folder';

  constructor(private auth: AuthService, public dialog: MatDialog) {}

  openSigninDialog() {
    this.dialog.open(SigninDialogComponent, {
      width: '400px',
    });
  }

  openSignupDialog() {
    this.dialog.open(SignupDialogComponent, {
      width: '400px',
    });
  }

  ngOnInit(): void {
    console.log(this.auth.dRefreshToken());
  }
}
