import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthEmitter } from '../../emitters/AuthEmitter';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  public signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.signupForm = this.formBuilder.group({
      login: '',
      password: '',
    });
  }

  ngOnInit() {}

  async submit() {
    AuthEmitter.emit(false);
    const username = this.signupForm.value.login;
    const password = this.signupForm.value.password;
    if (!username || !password) return;
    if (await this.authService.signup(username, password)) {
      this.dialog.closeAll();
    }
  }
}
