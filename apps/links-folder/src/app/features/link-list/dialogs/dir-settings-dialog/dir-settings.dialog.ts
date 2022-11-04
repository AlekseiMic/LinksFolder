import { Component, Inject } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LinkService } from '../../services/link.service';
import { DirAccessDialog } from '../dir-access.dialog/dir-access.dialog';
import * as dayjs from 'dayjs';
import { List, Option } from '../../types';

@Component({
  selector: 'dir-settings-dialog',
  templateUrl: 'dir-settings.dialog.html',
  styleUrls: ['dir-settings.dialog.scss'],
})
export class DirSettingsDialog {
  public dir: List;

  public availableParents: Option[] = [];

  editForm = this.formBuilder.group({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)],
    }),
    parent: new FormControl(),
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
    this.dir = { ...dir };
    const allDirs = this.linkService.list$.getValue();
    this.availableParents = allDirs
      ? Object.values(allDirs).reduce((acc: Option[], d) => {
          if (d.owned && !d.isGuest && d.id !== data.dir) {
            acc.push({ value: d.id, label: `${d.name ?? d.id}` });
          }
          return acc;
        }, [])
      : [];
    this.editForm.controls['name'].reset(dir.name);
    this.editForm.controls['parent'].reset(dir.parent);
  }

  onEdit() {
    const newName = this.editForm.value.name;
    const newParent = this.editForm.value.parent;
    this.linkService
      .editDir(this.dir.id, newName, newParent || undefined)
      .subscribe(() => {
        this.editForm.reset({
          name: newName,
          parent: newParent,
        });
      });
  }

  onEditAccess(id: number) {
    const code = this.codes.find((c) => c.id === id);
    if (!code) return;
    const dialogRef = this.dialog.open(DirAccessDialog, {
      data: {
        code: code.code,
        username: code.username,
        expiresIn: dayjs(code.expiresIn).format('YYYY-MM-DD'),
        onSubmit: (values: {
          code?: string;
          username?: string;
          expiresIn: Date;
        }) => {
          this.linkService
            .editAccess(this.dir.id, id, {
              code: values.code || undefined,
              username: values.username || null,
              expiresIn: values.expiresIn,
            })
            .subscribe((result) => {
              dialogRef.close();
              if (result === false) return;
            });
        },
      },
    });
  }

  onDeleteAccess(id: number) {
    this.linkService.deleteAccess(this.dir.id, id).subscribe(() => {
      this.dir.codes = this.dir.codes.filter((c) => c.id !== id);
    });
  }

  onAddAccessRule() {
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
            });
        },
      },
    });
  }
}
