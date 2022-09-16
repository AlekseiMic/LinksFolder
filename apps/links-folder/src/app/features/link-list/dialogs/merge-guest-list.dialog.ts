import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Link, LinkService } from '../services/link.service';

@Component({
  selector: 'merge-guest-list-dialog',
  templateUrl: 'merge-guest-list.dialog.html',
})
export class MergeGuestListDialog {
  constructor(
    public dialogRef: MatDialogRef<MergeGuestListDialog>,
    private linkService: LinkService
  ) {
    console.log(this.linkService.getLinks());
  }

  async accept(): Promise<void> {
    this.linkService.mergeLists().subscribe((v) => {
      console.log('Accepted');
    });
  }

  async decline(): Promise<void> {
    this.linkService.removeList().subscribe((v) => {
      console.log('Declined');
    });
  }
}
