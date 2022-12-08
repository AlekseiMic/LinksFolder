import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Link, SimpleLink } from '../../../types';

@Component({
  selector: 'change-link-dialog',
  templateUrl: 'change-link.dialog.html',
})
export class ChangeLinkDialog {
  onChange = new EventEmitter<SimpleLink>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: Link) {}

  onSubmit(values: SimpleLink) {
    this.onChange.emit(values);
  }
}
