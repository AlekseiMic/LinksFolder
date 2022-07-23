import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AuthEmitter } from '../../emitters/AuthEmitter';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  public loginForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private auth: AuthService,
    private dialog: MatDialog
  ) {
    this.loginForm = this.formBuilder.group({
      login: '',
      password: '',
    });
  }

  ngOnInit() {}

  async submit() {
    AuthEmitter.emit(false);
    const username = this.loginForm.value.login;
    const password = this.loginForm.value.password;
    if (!username || !password) return;
    if (await this.auth.login(username, password)) {
      this.dialog.closeAll();
    }
  }
}
