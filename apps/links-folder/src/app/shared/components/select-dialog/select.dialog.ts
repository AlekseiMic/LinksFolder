import { Component, EventEmitter, Inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-dialog',
  templateUrl: 'select.dialog.html',
})
export class SelectDialog<T> {
  formControl = this.formBuilder.group({
    variant: new FormControl(null, {
      validators: [Validators.required],
    }),
  });

  onChange = new EventEmitter<T>();

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      submit?: string;
      label?: string;
      title?: string;
      variants: { label: string; value: T }[];
    }
  ) {
    this.formControl.controls['variant'].reset(data.variants[0].value);
  }

  onSubmit() {
    const value = this.formControl.controls['variant'].value;
    if (!this.formControl.valid || !value) return;
    this.onChange.emit(value);
  }
}
