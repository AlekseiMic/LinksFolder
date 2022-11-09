import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SigninComponent } from '../signin/signin.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  isLogged: boolean | undefined;

  theme: 'light' | 'dark' = 'light';

  private authSub: Subscription;

  private themeSub: Subscription;

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
    public dialog: MatDialog
  ) {
    this.authSub = this.auth.isAuth$.subscribe((v) => {
      this.isLogged = v;
    });
    this.themeSub = this.themeService.theme$.subscribe((v) => {
      this.theme = v;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.themeSub.unsubscribe();
  }

  onLogout() {
    this.auth.logout();
  }

  onToggleTheme() {
    this.themeService.toggleTheme();
  }

  onSignin() {
    this.dialog.open(SigninComponent, {});
  }
}
