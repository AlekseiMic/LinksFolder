import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dir-access-form',
  templateUrl: './dir-access-form.component.html',
})
export class DirAccessForm implements OnInit {
  @Input() code?: string;

  @Input() username?: string;

  @Input() expiresIn?: Date;

  @Output() onSubmit: EventEmitter<{
    code?: string;
    username?: string;
    expiresIn: Date;
  }> = new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

  dirAccessForm = this.formBuilder.group({
    code: new FormControl('', { validators: [Validators.minLength(5)] }),
    username: '',
    expiresIn: new FormControl(new Date(), {
      validators: [Validators.required],
    }),
  });

  submit(): void {
    this.onSubmit.emit(this.dirAccessForm.value);
  }

  ngOnInit(): void {
    this.dirAccessForm.controls['code'].reset(this.code);
    this.dirAccessForm.controls['username'].reset(this.username);
    this.dirAccessForm.controls['expiresIn'].reset(this.expiresIn);
  }
}
