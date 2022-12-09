import { Component, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccessRule } from 'app/types';

@Component({
  selector: 'edit-access-dialog',
  templateUrl: 'edit-access.dialog.html',
})
export class EditAccessDialog {
  public code: string;

  onChange = new EventEmitter<{ code: string }>();

  constructor(
    public dialogRef: MatDialogRef<EditAccessDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AccessRule
  ) {
    this.code = data.code!;
  }

  async onSubmit(values: { code: string }): Promise<void> {
    this.onChange.emit(values);
  }
}
