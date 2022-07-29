import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '../../dialogs/DynamicDialog/dynamic.dialog.component';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { SigninComponent } from '../signin/signin.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLogged = false;
  user: null | User = null;

  constructor(private auth: AuthService, public dialog: MatDialog) {
    this.auth.isLoggedSubject.subscribe((v) => {
      this.isLogged = v;
      this.user = this.auth.user;
    });
  }

  ngOnInit(): void {}

  onLogout() {
    this.auth.logout();
  }

  openSigninDialog() {
    this.dialog.open(DynamicDialogComponent, {
      data: { component: SigninComponent },
    });
  }

  openSignupDialog() {
    this.dialog.open(DynamicDialogComponent, {
      data: { component: SignupComponent },
    });
  }
}
