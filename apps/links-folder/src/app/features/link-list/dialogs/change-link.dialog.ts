import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Link, LinkService } from '../services/link.service';

@Component({
  selector: 'change-link-dialog',
  templateUrl: 'change-link.dialog.html',
})
export class ChangeLinkDialog {
  constructor(
    public dialogRef: MatDialogRef<ChangeLinkDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: Link
  ) {
    const link = this.linkService
      .getLinks()
      .find((el) => el.id == this.data.id);
    if (!link) return;
    this.data = { ...link };
  }

  async onSubmit(values: { url: string; text: string }): Promise<void> {
    this.linkService.edit(this.data.id, values).subscribe((result) => {
      if (result) this.dialogRef.close();
    });
  }
}
