import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SimpleLink } from '../../../types';

@Component({
  selector: 'app-guest-link-form',
  templateUrl: 'guest-link-form.component.html',
})
export class GuestLinkForm {
  @Input('hasLinks') hasLinks: boolean;

  @Input('directory') directory: number;

  @Output() onSubmit: EventEmitter<{ dir: number; links: SimpleLink[] }> =
    new EventEmitter();

  public raiseOnSubmit(links: SimpleLink[]) {
    this.onSubmit.emit({ dir: this.directory, links });
  }
}
