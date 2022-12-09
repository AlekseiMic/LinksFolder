import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable()
export class NotifyService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string) {
    this.snackBar.open(message, undefined, this.getConfig('success'));
  }

  error(message: string) {
    this.snackBar.open(message, undefined, this.getConfig('error'));
  }

  warning(message: string) {
    this.snackBar.open(message, undefined, this.getConfig('warning'));
  }

  private getConfig(panelClass: string): MatSnackBarConfig {
    return {
      panelClass,
      duration: 5000,
      verticalPosition: 'top',
    };
  }
}
