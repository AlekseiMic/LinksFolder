import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../services/link.service';

@Component({
  selector: 'change-access-code-dialog',
  templateUrl: 'change-access-code.dialog.html',
})
export class ChangeAccessCodeDialog {
  constructor(
    public dialogRef: MatDialogRef<ChangeAccessCodeDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      defaultValues?: { code: string };
    }
  ) {}

  async onSubmit(values: { code: string }): Promise<void> {
    // this.linkService.editAccess(values).subscribe((result) => {
    //   if (result) this.dialogRef.close();
    // });
  }
}
