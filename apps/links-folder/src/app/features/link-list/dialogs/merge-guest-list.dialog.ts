import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LinkService } from '../services/link.service';

@Component({
  selector: 'merge-guest-list-dialog',
  templateUrl: 'merge-guest-list.dialog.html',
})
export class MergeGuestListDialog {
  constructor(
    public dialogRef: MatDialogRef<MergeGuestListDialog>,
    private linkService: LinkService
  ) {}

  async accept(): Promise<void> {
    this.linkService.mergeLists().subscribe((v) => {
      console.log('Accepted');
    });
  }

  async decline(): Promise<void> {
    this.linkService.removeList().subscribe((v) => {
      if (v) this.dialogRef.close();
    });
  }
}
