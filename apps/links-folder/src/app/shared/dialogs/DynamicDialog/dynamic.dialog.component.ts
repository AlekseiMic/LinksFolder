import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dynamic-dialog',
  templateUrl: 'dynamic.dialog.component.html',
})
export class DynamicDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DynamicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
