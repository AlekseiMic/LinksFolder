import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog';
import { LinkService } from '../../services/link.service';

@Component({
  selector: 'app-link-simple-list',
  templateUrl: './link.simple.list.component.html',
  styleUrls: ['./link.simple.list.component.scss'],
})
export class LinkSimpleList implements OnInit {
  @Input() canEdit?: boolean;

  @Input() links: { url: string; text?: string; id: number }[] = [];

  @Input() directory: number | null = null;

  constructor(private dialog: MatDialog, private linkService: LinkService) {}

  delete(id: number) {
    if (!this.directory) return;
    this.linkService.deleteLinks(this.directory, [id]).subscribe(() => {});
  }

  edit(id: number) {
    const dialogRef = this.dialog.open(ChangeLinkDialog, {
      data: { id, directory: this.directory },
    });
  }

  hasLinks() {
    return this.links.length > 0;
  }

  ngOnInit(): void {}

  ngOnDestroy() {}
}
