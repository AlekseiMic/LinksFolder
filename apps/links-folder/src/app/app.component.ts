import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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

  ngOnInit(): void {
    this.auth.dRefreshToken();
  }
}
