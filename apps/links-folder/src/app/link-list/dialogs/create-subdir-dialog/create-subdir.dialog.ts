import { Component, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'create-subdir-dialog',
  templateUrl: 'create-subdir.dialog.html',
})
export class CreateSubdirDialog {
  constructor(public dialogRef: MatDialogRef<CreateSubdirDialog>) {}

  onChange = new EventEmitter<string>();

  async onSubmit(values: { name: string }): Promise<void> {
    this.onChange.emit(values.name);
  }
}
