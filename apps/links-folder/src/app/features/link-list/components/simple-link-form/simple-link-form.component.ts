import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SimpleLink } from '../../types';

@Component({
  selector: 'app-simple-link-form',
  templateUrl: 'simple-link-form.component.html',
})
export class SimpleLinkFormComponent {
  @Input('hasLinks') hasLinks: boolean;

  @Output() onSubmit: EventEmitter<SimpleLink[]> = new EventEmitter();

  public raiseOnSubmit(links: SimpleLink[]) {
    this.onSubmit.emit(links);
  }
}
