import { Component, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'create-directory-dialog',
  templateUrl: 'create-directory.dialog.html',
})
export class CreateDirectoryDialog {
  constructor(public dialogRef: MatDialogRef<CreateDirectoryDialog>) {}

  onChange = new EventEmitter<string>();

  async onSubmit(values: { name: string }): Promise<void> {
    this.onChange.emit(values.name);
  }
}
