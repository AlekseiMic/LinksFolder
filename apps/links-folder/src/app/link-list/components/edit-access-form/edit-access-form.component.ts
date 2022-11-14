import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-access-form',
  templateUrl: './edit-access-form.component.html',
})
export class EditAccessForm implements OnInit {
  @Input() code?: string;

  @Output() onSubmit: EventEmitter<{ code: string }> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {}

  editAccessCodeForm = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(5)]],
  });

  submit(): void {
    if (!this.editAccessCodeForm.valid) return;
    this.onSubmit.emit(this.editAccessCodeForm.value);
  }

  ngOnInit(): void {
    this.editAccessCodeForm.controls['code'].reset(this.code);
  }
}
