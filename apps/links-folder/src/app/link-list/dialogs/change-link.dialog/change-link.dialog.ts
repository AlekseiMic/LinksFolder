import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../../services/link.service';
import { Link, SimpleLink } from '../../types';

@Component({
  selector: 'change-link-dialog',
  templateUrl: 'change-link.dialog.html',
})
export class ChangeLinkDialog {
  link: Link;

  constructor(
    public dialogRef: MatDialogRef<ChangeLinkDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA) public data: Link
  ) {}

  ngOnInit() {
    this.link = this.data;
  }

  async onSubmit(values: SimpleLink): Promise<void> {
    this.linkService
      .editLinks(this.data.directory, { ...this.link, ...values })
      .subscribe((result) => {
        if (result) this.dialogRef.close();
      });
  }
}
