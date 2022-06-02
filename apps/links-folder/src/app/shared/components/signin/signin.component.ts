import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthEmitter } from '../../emitters/AuthEmitter';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  public loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      login: '',
      password: '',
    });
  }

  ngOnInit() {}

  submit() {
    console.log('wow');
    AuthEmitter.emit(false);
  }
}
