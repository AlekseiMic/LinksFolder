import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Dialog } from './custom.dialog';
import { DefaultDialogComponent } from './default-dialog/default-dialog.component';

@NgModule({
  declarations: [DefaultDialogComponent],
  imports: [MatDialogModule, DialogModule, CommonModule],
  providers: [{ provide: MatDialog, useClass: Dialog }],
  exports: [MatDialogModule, DialogModule, DefaultDialogComponent],
})
export class CustomDialogModule {}
