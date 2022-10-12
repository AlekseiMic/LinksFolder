import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService, List } from '../../services/link.service';

@Component({
  selector: 'dir-settings-dialog',
  templateUrl: 'dir-settings.dialog.html',
  styleUrls: ['dir-settings.dialog.scss'],
})
export class DirSettingsDialog {
  public dir: List;
  constructor(
    public dialogRef: MatDialogRef<DirSettingsDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dir: number;
    }
  ) {
    const list = this.linkService.list$.getValue();
    const dir = list?.[data.dir];
    if (!dir) {
      this.dialogRef.close();
      return;
    }
    this.dir = dir;
  }
}
