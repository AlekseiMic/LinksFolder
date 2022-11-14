import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-access-dialog',
  templateUrl: 'access.dialog.html',
})
export class AccessDialog {
  constructor(
    public dialogRef: MatDialogRef<AccessDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      code?: string;
      expiresIn?: Date;
      username?: string;
      onSubmit: (values: {
        code?: string;
        username?: string;
        expiresIn: Date;
      }) => void;
    }
  ) {}

  onSubmit(values: { code?: string; username?: string; expiresIn: Date }) {
    this.data.onSubmit(values);
  }
}
