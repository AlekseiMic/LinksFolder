import { MatSnackBarConfig } from "@angular/material/snack-bar";

export const getSnackbarProps =  (value: boolean) => ({
  panelClass: value ? 'success' : 'error',
  duration: 5000,
  verticalPosition: 'top',
} as MatSnackBarConfig);
