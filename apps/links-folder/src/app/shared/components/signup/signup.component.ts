import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { SigninComponent } from '../signin/signin.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit {
  public signupForm: FormGroup;
  public isSubmitting = false;
  public badLogins = ['admin', 'moderator'];

  constructor(
    public dialogRef: MatDialogRef<SignupComponent>,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.signupForm = this.formBuilder.group({
      login: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          this.badLoginsValidator(),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  badLoginsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.badLogins.includes(control.value.trim())) {
        return { 'Bad login': { value: control.value } };
      }
      return null;
    };
  }

  ngOnInit() {}

  onSignin() {
    this.dialogRef.close();
    this.dialog.open(SigninComponent, {});
  }

  async submit() {
    if (!this.signupForm.valid) return;
    const username = this.signupForm.value.login.trim();
    const password = this.signupForm.value.password.trim();

    if (!username || !password) return;

    this.isSubmitting = true;

    const result = await this.authService.signup(username, password);

    this.isSubmitting = false;
    if (result.success === true) {
      this.dialogRef.close();
    }
    if (result.code === 'NOT_UNIQUE_LOGIN') {
      this.signupForm.controls['login'].setErrors({
        'Bad Login': { value: username },
      });
      this.badLogins.push(username);
    }
  }
}
