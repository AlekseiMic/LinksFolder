import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog/change-link.dialog';
import { LinkService } from '../../services/link.service';
import { ChangeAccessCodeDialog } from '../../dialogs/change-access-code.dialog';
import { Link, List, SimpleLink } from '../../types';

@Component({
  selector: 'app-link-simple-list',
  templateUrl: './link.simple.list.component.html',
  styleUrls: ['./link.simple.list.component.scss'],
})
export class LinkSimpleList {
  @Input() canEdit?: boolean = false;

  @Input() links: Link[] = [];

  @Input() codes: List['codes'];

  @Input() directory: number;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard,
    readonly location: Location,
    private linkService: LinkService
  ) {}

  onCreateLinks(links: SimpleLink[]) {
    this.linkService.addLinks(this.directory, links);
  }

  delete(id: number) {
    this.linkService.deleteLink(this.directory, id);
  }

  edit(id: number) {
    this.dialog.open(ChangeLinkDialog, {
      data: { id, directory: this.directory },
    });
  }

  get hasLinks() {
    return this.links.length > 0;
  }

  copyLink(code: string) {
    const link = this.getLink(code);
    if (link) {
      this.clipboard.copy(link);
      this.snackBar.open('Link copied!', undefined, {
        panelClass: 'success',
        duration: 5000,
        verticalPosition: 'top',
      });
    }
  }

  extendLinkLifetime(dirId: number, accessId: number) {
    this.linkService.extendLifetime(dirId, accessId).subscribe((value) => {
      this.snackBar.open(value ? 'Access granted for the next hour!' : 'Error!', undefined, {
        panelClass: value ? 'success' : 'error',
        duration: 5000,
        verticalPosition: 'top',
      });
    });
  }

  getLink(code: string) {
    if (!code) return null;
    return `${document.location.origin}${this.location.prepareExternalUrl(
      code
    )}`;
  }

  editAccess(dirId: number, accessId: number) {
    this.dialog.open(ChangeAccessCodeDialog, {
      data: { dirId, accessId },
    });
  }
}
