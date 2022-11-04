import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AllLists, LinkService } from '../../services/link.service';

@Component({
  selector: 'select-dir-dialog',
  templateUrl: 'select-dir.dialog.html',
})
export class SelectDirDialog {
  public folders: { name: string | number; id: number }[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectDirDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      onSelect: (dir: number) => void;
    }
  ) {
    const list = this.linkService.list$.getValue();
    const root = this.linkService.rootDir;
    if (!list || root === undefined || !list[root]) {
      this.dialogRef.close();
      return;
    }
    const rootDir = list[root];

    this.folders.push({ name: rootDir.name || 'Base', id: rootDir.id });
    this.addSubfolders(list, list[root].sublists ?? [], '-- ');
  }

  addSubfolders(list: AllLists, subfolders: number[], prefix = '') {
    subfolders?.forEach((d) => {
      this.folders.push({ name: prefix + list?.[d].name ?? d, id: d });
      this.addSubfolders(list, list?.[d]?.sublists ?? [], prefix + '-- ');
    });
  }
}
