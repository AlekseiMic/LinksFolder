import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dialog-signin',
  templateUrl: 'signin.dialog.component.html',
})
export class SigninDialogComponent {
  constructor(public dialogRef: MatDialogRef<SigninDialogComponent>) {}
}
