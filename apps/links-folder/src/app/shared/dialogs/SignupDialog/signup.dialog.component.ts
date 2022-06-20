import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dialog-signup',
  templateUrl: 'signup.dialog.component.html',
})
export class SignupDialogComponent {
  constructor(public dialogRef: MatDialogRef<SignupDialogComponent>) {}
}
