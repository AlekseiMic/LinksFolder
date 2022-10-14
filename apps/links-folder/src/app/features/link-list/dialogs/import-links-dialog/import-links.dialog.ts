import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkService } from '../../services/link.service';

@Component({
  selector: 'app-import-links-dialog',
  templateUrl: 'import-links.dialog.html',
})
export class ImportLinksDialog {
  @ViewChild('fileInput') fileInput: ElementRef;

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

  onUpload(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    let file = target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/json') {
      target.value = null as any;
      return;
    }
    this.linkService.importFile(this.data.dir, file);
  }
}
