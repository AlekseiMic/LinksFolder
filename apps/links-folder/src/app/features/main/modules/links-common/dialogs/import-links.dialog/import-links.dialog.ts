import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinksMainService } from '../../../links-main/links-main.service';
import { List } from 'app/types';

/** !TODO::REFACTOR!!! */
@Component({
  selector: 'app-import-links-dialog',
  templateUrl: 'import-links.dialog.html',
  styleUrls: ['import-links.dialog.scss'],
})
export class ImportLinksDialog {
  @ViewChild('fileInput') fileInput: ElementRef;

  fileProcessed = false;

  fileInProcess = false;

  ids: number[];

  lists: Record<string, List>;

  errors: [string, string][] = [];

  dirsToRemove: Record<number, boolean> = {};

  constructor(
    private dialogRef: MatDialogRef<ImportLinksDialog>,
    private linkService: LinksMainService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dir: number;
    }
  ) {
    dialogRef.beforeClosed().subscribe(() => {
      this.onClose();
    });
  }

  ngAfterViewInit() {
    this.fileInput.nativeElement.click();
  }

  hasDirsToRemove() {
    return Object.keys(this.dirsToRemove).length > 0;
  }

  onDirsRemove() {
    const dirsToRemove: number[] = [];
    const recursiveSelectDirsToRemove = (dir: number) => {
      if (this.dirsToRemove[dir]) dirsToRemove.push(dir);
      else this.lists[dir].sublists?.map(recursiveSelectDirsToRemove);
    };
    this.ids.map(recursiveSelectDirsToRemove);

    const recursiveRemoveDirs = (dirs: number[], ids: number[]) => {
      const result = dirs.reduce((acc: number[], d) => {
        if (!ids.includes(d)) {
          acc.push(d);
          if (this.lists[d].sublists?.length) {
            this.lists[d].sublists = recursiveRemoveDirs(
              this.lists[d].sublists!,
              ids
            );
          }
        }
        return acc;
      }, []);
      return result;
    };

    this.linkService.removeImportedDirs(dirsToRemove).subscribe((res) => {
      const removedDirs = Object.keys(res)
        .filter((k) => res[Number(k)])
        .map(Number);
      this.ids = recursiveRemoveDirs(this.ids, removedDirs);
      removedDirs.forEach((d) => delete this.lists[d]);
    });
  }

  onDirSelect(dir: List) {
    const newDirsToRemove = { ...this.dirsToRemove };
    const recursiveChange = (
      value: boolean,
      list: List,
      obj: typeof this.dirsToRemove
    ) => {
      if (value) obj[list.id] = value;
      else delete obj[list.id];
      list.sublists?.forEach((sd) => {
        recursiveChange(value, this.lists[sd], obj);
      });
    };

    const recursiveUnselectParent = (id: number) => {
      delete newDirsToRemove[id];
      const parentId = this.lists[id]?.parent;
      if (parentId) {
        recursiveUnselectParent(parentId);
      }
    };

    recursiveChange(!newDirsToRemove[dir.id], dir, newDirsToRemove);
    if (!newDirsToRemove[dir.id]) recursiveUnselectParent(dir.id);
    this.dirsToRemove = newDirsToRemove;
  }

  onClose() {
    if (this.ids?.length !== 0) {
      this.linkService.addImportedLists(this.data.dir, this.ids, this.lists);
    }
    this.dialogRef.close();
  }

  onUpload(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    let file = target.files?.[0];
    this.errors = [];

    if (!file) return;
    if (file.type !== 'application/json') {
      target.value = null as any;
      this.errors = [['0', 'WRONG_FILE_EXTENSION']];
      return;
    }

    this.fileInProcess = true;

    this.linkService.importFile(this.data.dir, file).subscribe({
      next: (res) => {
        this.ids = res.ids;
        this.lists = res.lists;
        this.errors = Object.entries(res.errors);
      },
      complete: () => {
        this.fileInProcess = false;
        this.fileProcessed = true;
      },
    });
  }

  formatError([idx, code]: [string, string]) {
    const index = parseInt(idx, 10);
    if (code === 'NO_PARSER') return `Parser not found for file: ${index + 1}`;
    if (code === 'WRONG_FILE_EXTENSION') {
      return `Only JSON file format supported`;
    }
    return 'Error while parsing file: ' + (index + 1);
  }
}
