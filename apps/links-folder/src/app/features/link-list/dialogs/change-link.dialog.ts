import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../services/link.service';

@Component({
  selector: 'change-link-dialog',
  templateUrl: 'change-link.dialog.html',
})
export class ChangeLinkDialog {
  constructor(
    public dialogRef: MatDialogRef<ChangeLinkDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      defaultValues?: { link?: string; name?: string };
    }
  ) {
    const link = this.linkService
      .getLinks()
      .find((el) => el.id == this.data.id);
    if (!link) return;
    this.data.defaultValues = {
      link: link.url,
      name: link.text,
    };
  }

  async onSubmit(values: { link: string; name: string }): Promise<void> {
    const result = await this.linkService.edit(this.data.id, values);
    if (result) this.dialogRef.close();
  }
}
