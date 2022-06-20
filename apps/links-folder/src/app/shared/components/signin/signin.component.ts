import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthEmitter } from '../../emitters/AuthEmitter';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  public loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      login: '',
      password: '',
    });
  }

  ngOnInit() {}

  submit() {
    AuthEmitter.emit(false);
    const username = this.loginForm.value.login;
    const password = this.loginForm.value.password;
    if (!username || !password) return;
    this.authService.login(username, password);
  }
}
