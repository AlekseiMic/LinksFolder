import { ComponentType } from '@angular/cdk/portal';
import { ComponentRef, TemplateRef } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';

export class CustomMatDialog extends MatDialog {
  override open<T, D = any, R = any>(
    component: ComponentType<T> | TemplateRef<T>,
    config: MatDialogConfig<D>
  ): MatDialogRef<T, R> {
    return super.open(component, {
      ...config,
      panelClass: 'custom-dialog-component',
    });
  }
}
