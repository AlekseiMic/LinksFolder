import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthEmitter } from '../../emitters/AuthEmitter';
import { AuthService } from '../../services/auth.service';
import { SigninComponent } from '../signin/signin.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {
  public signupForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<SignupComponent>,
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.signupForm = this.formBuilder.group({
      login: new FormControl('', {
        validators: [Validators.required, Validators.minLength(4)],
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });
  }

  ngOnInit() {}

  onSignin() {
    this.dialogRef.close();
    this.dialog.open(SigninComponent, {});
  }

  async submit() {
    if (!this.signupForm.valid) return;
    AuthEmitter.emit(false);
    const username = this.signupForm.value.login;
    const password = this.signupForm.value.password;
    if (!username || !password) return;
    if (await this.authService.signup(username, password)) {
      this.dialogRef.close();
    }
  }
}
