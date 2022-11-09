import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-access-code-form',
  templateUrl: './edit-access-code-form.component.html',
})
export class EditAccessCodeForm implements OnInit {
  @Input() code?: string;

  @Output() onSubmit: EventEmitter<{ code: string }> = new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

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
