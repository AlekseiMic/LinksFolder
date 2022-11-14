import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../../services/link.service';
import { List } from '../../types';

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

  dirsToRemove: Record<number, boolean> = {};

  constructor(
    private dialogRef: MatDialogRef<ImportLinksDialog>,
    private linkService: LinkService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dir: number;
    }
  ) {}

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
    if (this.ids.length !== 0) {
      this.linkService.addImportedLists(this.data.dir, this.ids, this.lists);
    }
    this.dialogRef.close();
  }

  onUpload(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    let file = target.files?.[0];

    if (!file) return;
    if (file.type !== 'application/json') {
      target.value = null as any;
      return;
    }

    this.fileInProcess = true;

    this.linkService.importFile(this.data.dir, file).subscribe({
      next: (res) => {
        this.ids = res.ids;
        this.lists = res.lists;
      },
      complete: () => {
        this.fileInProcess = false;
        this.fileProcessed = true;
      },
    });
  }
}
