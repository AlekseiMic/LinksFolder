import { Component, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Code } from '../types';

@Component({
  selector: 'change-access-code-dialog',
  templateUrl: 'change-access-code.dialog.html',
})
export class ChangeAccessCodeDialog {
  public code: string;

  onChange = new EventEmitter<{ code: string }>();

  constructor(
    public dialogRef: MatDialogRef<ChangeAccessCodeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Code
  ) {
    this.code = data.code;
  }

  async onSubmit(values: { code: string }): Promise<void> {
    this.onChange.emit(values);
  }
}
