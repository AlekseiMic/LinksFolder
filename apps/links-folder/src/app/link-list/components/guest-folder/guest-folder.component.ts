import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LinkService } from '../../services/link.service';
import { Code, Link, List, SimpleLink } from '../../types';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChangeAccessCodeDialog } from '../../dialogs/change-access-code.dialog';
import { getSnackbarProps } from '../../../shared/helpers/getSnackbarProps';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog/change-link.dialog';

@Component({
  selector: 'app-guest-folder',
  templateUrl: './guest-folder.component.html',
  styleUrls: ['./guest-folder.component.scss'],
})
export class GuestFolder {
  public guest$: Observable<List | undefined>;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private service: LinkService
  ) {}

  ngOnInit() {
    this.guest$ = this.service.guestDir$;
  }

  onCreateLinks({ dir, links }: { dir: number; links: SimpleLink[] }) {
    this.service.addLinks(dir, links);
  }

  onDeleteLink(link: Link) {
    this.service.deleteLink(link.directory, link.id);
  }

  onEditLink(link: Link) {
    this.dialog.open(ChangeLinkDialog, {
      data: link,
    });
  }

  onEditAccess({ dir, code }: { dir: number; code: Code }) {
    const dialog = this.dialog.open(ChangeAccessCodeDialog, { data: code });
    const sub = dialog.componentInstance.onChange.subscribe((changes) => {
      this.service.editAccess(dir, code.id, changes).subscribe({
        next: () => dialog.close(),
        error: () => dialog.close(),
      });
    });
    dialog.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  onProlongAccess({ dir, code }: { dir: number; code: Code }) {
    this.service.extendLifetime(dir, code.id).subscribe({
      next: (value) => {
        const text = value ? 'Access granted for the next hour!' : 'Error!';
        this.snackBar.open(text, undefined, getSnackbarProps(value));
      },
      error: () => {},
    });
  }

  onCopyCodeUrl() {
    this.snackBar.open('Link copied!', undefined, getSnackbarProps(true));
  }
}
