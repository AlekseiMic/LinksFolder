import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dir-access-dialog',
  templateUrl: 'dir-access.dialog.html',
  styleUrls: ['dir-access.dialog.scss'],
})
export class DirSettingsDialog {
  constructor(
    public dialogRef: MatDialogRef<DirSettingsDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      code?: string;
      expires?: number;
      username?: string;
    }
  ) {
  }
}
