import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-field-wrapper',
  templateUrl: 'field-wrapper.component.html',
})
export class FieldWrapperComponent {
  @Input('name') name: string;

  @Input('label') label: string;

  @Input('faq') faq: string;

  @Input('required') required: boolean;

  @Input('roundedLeft') roundedLeft?: number = 4;

  @Input('roundedRight') roundedRight?: number = 4;

  @Input('errors') errors: [string, any][] = [];

  @Input('errorMapper') mapper: Record<string, string>;
}
