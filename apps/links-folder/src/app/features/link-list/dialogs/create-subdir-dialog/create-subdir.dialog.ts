import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../../services/link.service';

@Component({
  selector: 'create-subdir-dialog',
  templateUrl: 'create-subdir.dialog.html',
})
export class CreateSubdirDialog {
  public code: string;

  constructor(
    public dialogRef: MatDialogRef<CreateSubdirDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dir: number;
    }
  ) {
    // TODO::CHECK IF CAN CREATE
    const dir = this.linkService.list$.getValue()?.[data.dir];
    if (!dir) {
      this.dialogRef.close();
      return;
    }
  }

  async onSubmit(values: { name: string }): Promise<void> {
    this.linkService
      .createDir(this.data.dir, values.name)
      .subscribe((value) => {
        this.dialogRef.close();
      });
  }
}
