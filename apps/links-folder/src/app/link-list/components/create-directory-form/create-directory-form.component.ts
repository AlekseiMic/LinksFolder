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
    const name = this.createSubdirForm.controls.name.value;
    if (!name) return;
    this.onSubmit.emit({ name });
  }

  ngOnInit(): void {
    this.createSubdirForm.controls['name'].reset('');
  }
}
