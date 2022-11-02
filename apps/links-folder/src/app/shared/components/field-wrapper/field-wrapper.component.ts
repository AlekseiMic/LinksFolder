import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-field-wrapper',
  templateUrl: 'field-wrapper.component.html',
})
export class FieldWrapperComponent {
  @Input('name') name: string;

  @Input('label') label: string;

  @Input('required') required: boolean;

  @Input('errors') errors: [string, any][];
}
