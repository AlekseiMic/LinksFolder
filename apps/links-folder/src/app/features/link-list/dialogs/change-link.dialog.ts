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
    public data: { directory: number; id: number; link: Link }
  ) {
    const list = this.linkService.getListById(data.directory);
    if (!list) {
      this.dialogRef.close();
      return;
    }
    const link = list.links.find((el) => el.id == this.data.id);
    if (!link) {
      this.dialogRef.close();
      return;
    }
    this.data.link = { ...link };
  }

  async onSubmit(values: { url: string; text: string }): Promise<void> {
    this.linkService
      .editLinks(this.data.directory, { ...this.data.link, ...values })
      .subscribe((result) => {
        if (result) this.dialogRef.close();
      });
  }
}
