import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AuthEmitter } from '../../emitters/AuthEmitter';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
})
export class SigninComponent implements OnInit {
  public loginForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<SigninComponent>,
    private formBuilder: UntypedFormBuilder,
    private auth: AuthService,
    private dialog: MatDialog
  ) {
    this.loginForm = this.formBuilder.group({
      login: new FormControl('', {
        validators: [Validators.required],
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });
  }

  ngOnInit() {}

  onSignup() {
    this.dialogRef.close();
    this.dialog.open(SignupComponent, {});
  }

  async submit() {
    if (!this.loginForm.valid) return;
    AuthEmitter.emit(false);
    const username = this.loginForm.value.login;
    const password = this.loginForm.value.password;
    if (!username || !password) return;
    if (await this.auth.login(username, password)) {
      this.dialogRef.close();
    }
  }
}
