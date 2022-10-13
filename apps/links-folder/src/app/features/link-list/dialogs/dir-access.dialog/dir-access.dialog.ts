import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dir-access-dialog',
  templateUrl: 'dir-access.dialog.html',
})
export class DirAccessDialog {
  constructor(
    public dialogRef: MatDialogRef<DirAccessDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      code?: string;
      expiresIn?: number;
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
