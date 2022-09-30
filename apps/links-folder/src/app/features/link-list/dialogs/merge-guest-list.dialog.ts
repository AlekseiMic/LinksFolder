import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../services/link.service';

@Component({
  selector: 'merge-guest-list-dialog',
  templateUrl: 'merge-guest-list.dialog.html',
})
export class MergeGuestListDialog {
  constructor(
    public dialogRef: MatDialogRef<MergeGuestListDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dirId: number;
      baseDir: number;
    }
  ) {}

  async accept(): Promise<void> {
    if (!this.data.baseDir || !this.data.dirId) {
      this.dialogRef.close();
      return;
    }
    this.linkService
      .mergeLists(this.data.dirId, this.data.baseDir)
      .subscribe((v) => {
        if (v) this.dialogRef.close();
      });
  }

  async decline(): Promise<void> {
    this.linkService.removeList(this.data.dirId).subscribe((v) => {
      if (v) this.dialogRef.close();
    });
  }
}
