import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import * as dayjs from 'dayjs';
import { LinksMainService } from '../../../links-main/links-main.service';
import { AccessRule, List, Variant } from 'app/types';
import { AccessDialog } from '../access.dialog/access.dialog';

@Component({
  selector: 'dir-settings-dialog',
  templateUrl: 'dir-settings.dialog.html',
  styleUrls: ['dir-settings.dialog.scss'],
})
export class DirSettingsDialog implements OnInit {
  public dir: List;

  public availableParents: Variant[] = [];

  editForm = this.formBuilder.group({
    name: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(4)],
    }),
    parent: new FormControl<number | null>(null),
  });

  get codes() {
    return this.dir?.codes ?? [];
  }

  constructor(
    public dialogRef: MatDialogRef<DirSettingsDialog>,
    private linkService: LinksMainService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { dir: number },
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const list = this.linkService.list$.getValue();
    const dir = list?.[this.data.dir];

    if (!dir) return this.dialogRef.close();

    this.dir = { ...dir };
    const allDirs = this.linkService.list$.getValue();
    this.availableParents = allDirs
      ? Object.values(allDirs).reduce((acc: Variant[], d) => {
          if (d.owned && !d.isGuest && d.id !== this.data.dir) {
            acc.push({ value: d.id, label: `${d.name ?? d.id}` });
          }
          return acc;
        }, [])
      : [];
    this.editForm.controls['name'].reset(dir.name);
    this.editForm.controls['parent'].reset(dir.parent);
  }

  onEdit() {
    const newName = this.editForm.controls.name.value;
    const newParent = this.editForm.value.parent;
    if (!newName) return;
    this.linkService
      .editDir(this.dir.id, newName, newParent || undefined)
      .subscribe(() => {
        this.editForm.reset({ name: newName, parent: newParent });
      });
  }

  onEditAccess(id: number) {
    const code = this.codes.find((c) => c.id === id);
    if (!code) return;
    const dialogRef = this.dialog.open(AccessDialog, {
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
            .editAccess(this.dir.id, {
              ...code,
              code: values.code || undefined,
              username: values.username || null,
              expiresIn: values.expiresIn,
            })
            .subscribe((result) => {
              dialogRef.close();
              if (result === false) return;
              const idx = this.codes.findIndex((c) => c.id === id);
              this.dir.codes = [
                ...this.dir.codes.slice(0, idx),
                {
                  ...this.dir.codes[idx],
                  ...values,
                },
                ...this.dir.codes.slice(idx + 1),
              ];
            });
        },
      },
    });
  }

  onDeleteAccess(code: AccessRule) {
    this.linkService.deleteAccess(this.dir.id, code).subscribe(() => {
      this.dir.codes = this.dir.codes.filter((c) => c.id !== code.id);
    });
  }

  onAddAccessRule() {
    const dialogRef = this.dialog.open(AccessDialog, {
      data: {
        onSubmit: (values: {
          code?: string;
          username?: string;
          expiresIn: Date;
        }) => {
          this.linkService
            .addAccessRule(this.dir.id, values)
            .subscribe((value) => {
              this.dir.codes = this.dir.codes.concat(value);
              dialogRef.close();
            });
        },
      },
    });
  }
}
