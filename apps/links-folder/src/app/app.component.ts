import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'links-folder';
  isLogged: boolean | undefined = false;
  private authSub: Subscription;

  constructor(private auth: AuthService, public dialog: MatDialog) {
    this.authSub = this.auth.subscribeToAuthChange((v) => {
      this.isLogged = v;
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  ngOnInit(): void {
    this.auth.dRefreshToken();
  }
}
