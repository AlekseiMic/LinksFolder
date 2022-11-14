import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-directory-form',
  templateUrl: './create-directory-form.component.html',
})
export class CreateDirectoryForm implements OnInit {
  @Output() onSubmit: EventEmitter<{ name: string }> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {}

  createSubdirForm = this.formBuilder.group({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });

  submit(): void {
    this.onSubmit.emit(this.createSubdirForm.value);
  }

  ngOnInit(): void {
    this.createSubdirForm.controls['name'].reset('');
  }
}
