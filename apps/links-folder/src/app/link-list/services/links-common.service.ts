import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from '../dialogs/change-link.dialog/change-link.dialog';
import { DirSettingsDialog } from '../dialogs/dir-settings-dialog/dir-settings.dialog';
import { ImportLinksDialog } from '../dialogs/import-links-dialog/import-links.dialog';
import { SelectDialog } from '../../shared/components/select-dialog/select.dialog';
import { MergeListDialog } from '../dialogs/merge-list.dialog/merge-list.dialog';
import { CreateDirectoryDialog } from '../dialogs/create-directory.dialog/create-directory.dialog';
import { NotifyService } from '../../features/notify/notify.service';
import { LinksMainService } from './links-main.service';
import { Code, Link, SimpleLink } from '../../types';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  merge,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { EditAccessDialog } from '../dialogs/edit-access.dialog/edit-access.dialog';

@Injectable()
export class LinksCommonService {
  constructor(
    private dialog: MatDialog,
    private service: LinksMainService,
    private notify: NotifyService
  ) {}

  checkMerge() {
    combineLatest([
      this.service.guestDir$.pipe(
        filter((a) => a !== null),
        distinctUntilChanged((a, b) => {
          return a?.id === b?.id;
        })
      ),
      this.service.root$.pipe(
        filter((a) => a !== null),
        distinctUntilChanged()
      ),
    ])
      .pipe(
        switchMap(([guest, root]) => {
          if (!guest || !root || guest.links.length === 0) return of(false);
          const ref = this.dialog.open(MergeListDialog);
          return merge(
            ref.componentInstance.onAccept.pipe(
              switchMap(() => this.service.mergeDirs(guest.id, root))
            ),
            ref.componentInstance.onDecline.pipe(
              switchMap(() => this.service.removeDir(guest.id))
            )
          ).pipe(tap(() => ref.close()));
        }),
        take(1)
      )
      .subscribe(() => {});
  }

  createLinks(data: { dir: number; links: SimpleLink[] }) {
    const multi = data.links.length > 1;
    this.service.addLinks(data.dir, data.links).subscribe({
      next: () => this.notify.success(`Link${multi ? 's' : ''} created`),
      error: () => this.notify.error(`Link${multi ? 's' : ''} not created`),
    });
  }

  deleteLinks(links: Link[]) {
    this.service.deleteLinks(links).subscribe({
      next: () => this.notify.success('${links.length} links were removed'),
      error: () => this.notify.error('Something went wrong!'),
    });
  }

  editLink(link: Link) {
    const dialog = this.dialog.open(ChangeLinkDialog, { data: link });
    dialog.componentInstance.onChange.pipe(take(1)).subscribe((changes) => {
      this.service.editLink(link.directory, { ...link, ...changes }).subscribe({
        next: () => this.notify.success('Link changed'),
        error: () => this.notify.error('Link not changed'),
        complete: () => dialog.close(),
      });
    });
  }

  moveLinks(
    variants: { label: string | number; value: number }[],
    links: Link[]
  ) {
    const dialog = this.dialog.open(SelectDialog, { data: { variants } });

    dialog.componentInstance.onChange
      .pipe(
        take(1),
        switchMap((dir) => this.service.moveLinks(links, Number(dir)))
      )
      .subscribe({
        next: () => {},
        error: () => {},
        complete: () => dialog.close(),
      });
  }

  createDir(parent: number) {
    const ref = this.dialog.open(CreateDirectoryDialog);
    ref.componentInstance.onChange
      .pipe(
        take(1),
        switchMap((name) => this.service.createDir(parent, name))
      )
      .subscribe({
        next: () => {},
        error: () => {},
        complete: () => ref.close(),
      });
  }

  editDir(dir: number) {
    this.dialog.open(DirSettingsDialog, { data: { dir } });
  }

  openImport(dir: number) {
    this.dialog.open(ImportLinksDialog, { data: { dir } });
  }

  prolongAccess({ dir, code }: { dir: number; code: Code }) {
    this.service.extendLifetime(dir, code.id).subscribe({
      next: () => this.notify.success('Access granted!'),
      error: () => this.notify.error('Cannot grant access!'),
    });
  }

  editAccess({ dir, code }: { dir: number; code: Code }) {
    const dialog = this.dialog.open(EditAccessDialog, { data: code });
    dialog.componentInstance.onChange.pipe(take(1)).subscribe((changes) => {
      this.service.editAccess(dir, code.id, changes).subscribe({
        next: () => this.notify.success('Access code changed'),
        error: () => this.notify.error('Access code not changed'),
        complete: () => dialog.close(),
      });
    });
  }
}
