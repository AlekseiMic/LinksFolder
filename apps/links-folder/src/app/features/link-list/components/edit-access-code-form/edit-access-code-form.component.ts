import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-access-code-form',
  templateUrl: './edit-access-code-form.component.html',
})
export class EditAccessCodeFormComponent implements OnInit {
  @Input() code?: string;

  @Output() onSubmit: EventEmitter<{ code: string }> = new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

  editAccessCodeForm = this.formBuilder.group({
    code: new FormControl('', {validators: [Validators.required, Validators.minLength(5)]}),
  });

  submit(): void {
    this.onSubmit.emit(this.editAccessCodeForm.value);
  }

  ngOnInit(): void {
    this.editAccessCodeForm.controls['code'].reset(this.code);
  }
}
