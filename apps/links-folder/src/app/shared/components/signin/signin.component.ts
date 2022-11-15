import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
})
export class SigninComponent implements OnInit {
  public error?: string;
  public loginForm: FormGroup;
  public isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<SigninComponent>,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private dialog: MatDialog
  ) {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {}

  onSignup() {
    this.dialogRef.close();
    this.dialog.open(SignupComponent, {});
  }

  async submit() {
    this.error = '';
    if (!this.loginForm.valid) return;
    const username = this.loginForm.value.login;
    const password = this.loginForm.value.password;
    if (!username || !password) return;

    this.isSubmitting = true;
    const result = await this.auth.login(username, password);
    this.loginForm.reset();
    this.isSubmitting = false;

    if (result.success) {
      this.dialogRef.close();
    } else if (result.errors?.['common']) {
      this.error = result.errors['common'];
    }
  }
}
