import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-access-form',
  templateUrl: './access-form.component.html',
})
export class AccessForm implements OnInit {
  @Input() code?: string;

  @Input() username?: string;

  @Input() expiresIn?: Date;

  @Output() onSubmit: EventEmitter<{
    code?: string;
    username?: string;
    expiresIn: Date;
  }> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {}

  dirAccessForm = this.formBuilder.group({
    code: new FormControl('', { validators: [Validators.minLength(5)] }),
    username: '',
    expiresIn: new FormControl(new Date(), {
      validators: [Validators.required],
    }),
  });

  submit(): void {
    const code = this.dirAccessForm.controls.code.value;
    const username = this.dirAccessForm.controls.username.value;
    const expiresIn = this.dirAccessForm.controls.expiresIn.value;
    if (!expiresIn) return;
    this.onSubmit.emit({
      code: code || undefined,
      username: username || undefined,
      expiresIn,
    });
  }

  ngOnInit(): void {
    this.dirAccessForm.controls['code'].reset(this.code);
    this.dirAccessForm.controls['username'].reset(this.username);
    this.dirAccessForm.controls['expiresIn'].reset(this.expiresIn);
  }
}
