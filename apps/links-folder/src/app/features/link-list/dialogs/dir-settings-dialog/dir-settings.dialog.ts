import { Component, Inject } from '@angular/core';
import { FormControl, UntypedFormBuilder } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LinkService, List } from '../../services/link.service';
import { DirAccessDialog } from '../dir-access.dialog/dir-access.dialog';

@Component({
  selector: 'dir-settings-dialog',
  templateUrl: 'dir-settings.dialog.html',
  styleUrls: ['dir-settings.dialog.scss'],
})
export class DirSettingsDialog {
  public dir: List;

  editNameForm = this.formBuilder.group({
    name: new FormControl(''),
  });

  get codes() {
    return this.dir?.codes ?? [];
  }

  constructor(
    public dialogRef: MatDialogRef<DirSettingsDialog>,
    private linkService: LinkService,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dir: number;
    },
    private dialog: MatDialog
  ) {
    const list = this.linkService.list$.getValue();
    const dir = list?.[data.dir];
    if (!dir) {
      this.dialogRef.close();
      return;
    }
    this.dir = dir;
    this.editNameForm.controls['name'].reset(dir.name);
  }

  onEditName() {
    this.dir.name = this.editNameForm.value.name;
  }

  editAccessRule(id: number) {}

  addAccessRule() {
    const dialogRef = this.dialog.open(DirAccessDialog, {
      data: {
        onSubmit: (values: {
          code?: string;
          username?: string;
          expiresIn: Date;
        }) => {
          this.linkService
            .addAccessRule(this.dir.id, values)
            .subscribe((result) => {
              dialogRef.close();
              if (result === false) return;
              console.log(result);
            });
        },
      },
    });
  }
}
