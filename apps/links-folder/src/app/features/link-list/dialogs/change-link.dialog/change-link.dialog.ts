import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../../services/link.service';
import { Link, SimpleLink } from '../../types';

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
  ) {}

  ngOnInit() {
    const list = this.linkService.getListById(this.data.directory);
    if (!list) return this.dialogRef.close();
    const link = list.links.find((el) => el.id == this.data.id);
    if (!link) return this.dialogRef.close();
    this.data.link = { ...link };
  }

  async onSubmit(values: SimpleLink): Promise<void> {
    this.linkService
      .editLinks(this.data.directory, { ...this.data.link, ...values })
      .subscribe((result) => {
        if (result) this.dialogRef.close();
      });
  }
}
