import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../services/link.service';

@Component({
  selector: 'change-access-code-dialog',
  templateUrl: 'change-access-code.dialog.html',
})
export class ChangeAccessCodeDialog {
  public code: string;

  constructor(
    public dialogRef: MatDialogRef<ChangeAccessCodeDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dirId: number;
      accessId: number;
    }
  ) {
    const dir = this.linkService.list$.getValue()?.[data.dirId];
    if (!dir) {
      this.dialogRef.close();
      return;
    }

    const access = dir.codes.find((el) => el.id === data.accessId);
    if (!access) {
      this.dialogRef.close();
      return;
    }
    this.code = access.code;
  }

  async onSubmit(values: { code: string }): Promise<void> {
    this.linkService
      .editAccess(this.data.dirId, this.data.accessId, values)
      .subscribe((result) => {
        if (result) this.dialogRef.close();
      });
  }
}
