import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SimpleLink } from '../../types';

@Component({
  selector: 'app-simple-link-form',
  templateUrl: 'simple-link-form.component.html',
})
export class SimpleLinkForm {
  @Input('hasLinks') hasLinks: boolean;

  @Input('directory') directory: number;

  @Output() onSubmit: EventEmitter<{ dir: number; links: SimpleLink[] }> =
    new EventEmitter();

  public raiseOnSubmit(links: SimpleLink[]) {
    this.onSubmit.emit({ dir: this.directory, links });
  }
}
