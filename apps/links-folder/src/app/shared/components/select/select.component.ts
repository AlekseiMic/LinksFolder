import { Component, Input, ViewChild } from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: 'select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectComponent,
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @ViewChild(FormControlDirective, { static: true })
  formControlDerictive: FormControlDirective;

  @Input('formControl') formControl: FormControl;

  @Input('formControlName') formControlName: string;

  @Input('label') label?: string;

  @Input('id') id?: string;

  @Input('roundedLeft') roundedLeft?: number;

  @Input('roundedRight') roundedRight?: number;

  @Input('height') height = 32;

  @Input('options') options?: { value: any; label: string }[] = [];

  constructor(private controlContainer: ControlContainer) {}

  writeValue(obj: any): void {
    this.formControlDerictive.valueAccessor?.writeValue(obj);
  }

  registerOnChange(fn: any): void {
    this.formControlDerictive.valueAccessor?.registerOnChange(fn);
  }

  registerOnTouched(fn: any): void {
    this.formControlDerictive.valueAccessor?.registerOnTouched(fn);
  }

  get required() {
    return this.control?.hasValidator(Validators.required) || false;
  }

  get errors() {
    if (!this.control.touched) return [];
    const result = this.control?.errors || {};
    return Object.entries(result);
  }

  get control() {
    return (
      this.formControl ||
      this.controlContainer.control?.get(this.formControlName)
    );
  }
}
