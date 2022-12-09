import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from './dialogs/change-link.dialog/change-link.dialog';
import { DirSettingsDialog } from './dialogs/dir-settings.dialog/dir-settings.dialog';
import { ImportLinksDialog } from './dialogs/import-links.dialog/import-links.dialog';
import { SelectDialog } from 'app/shared/components/select-dialog/select.dialog';
import { MergeListDialog } from './dialogs/merge-dir.dialog/merge-list.dialog';
import { CreateDirectoryDialog } from './dialogs/create-directory.dialog/create-directory.dialog';
import { NotifyService } from 'app/modules/notify/notify.service';
import { LinksMainService } from '../links-main/links-main.service';
import { EditAccessDialog } from './dialogs/edit-access.dialog/edit-access.dialog';
import { AccessRule, Link, SimpleLink } from 'app/types';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';

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
              switchMap(() => this.service.mergeDirs(guest.id, root)),
              catchError(() => {
                this.notify.error(`Error merging folders`);
                return of(false);
              }),
              tap(() => {
                this.notify.success(`Folders merged`);
              })
            ),
            ref.componentInstance.onDecline.pipe(
              switchMap(() => this.service.removeDir(guest.id)),
              catchError(() => {
                this.notify.error(`Error removing folder`);
                return of(false);
              }),
              tap(() => {
                this.notify.warning(`Folder removed`);
              })
            )
          ).pipe(tap(() => ref.close()));
        }),
        take(1)
      )
      .subscribe({
        next: () => {},
        error: () => {},
      });
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
      next: () => this.notify.success(`${links.length} links were removed`),
      error: () => this.notify.error('Something went wrong!'),
    });
  }

  editLink(link: Link) {
    const dialog = this.dialog.open(ChangeLinkDialog, { data: link });
    dialog.componentInstance.onChange
      .pipe(
        take(1),
        switchMap((changes) =>
          this.service.editLink(link.directory, { ...link, ...changes })
        )
      )
      .subscribe({
        next: () => this.notify.success('Link changed'),
        error: () => this.notify.error('Link not changed'),
      })
      .add(() => dialog.close());
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
        next: () => {
          this.notify.success('Links moved');
        },
        error: () => {
          this.notify.error('Links not moved');
        },
      })
      .add(() => dialog.close());
  }

  createDir(parent: number) {
    const ref = this.dialog.open(CreateDirectoryDialog);
    ref.componentInstance.onChange
      .pipe(
        switchMap((name) => this.service.createDir(parent, name)),
        take(1)
      )
      .subscribe({
        next: () => {
          this.notify.success('Directory created');
        },
        error: () => {
          this.notify.error('Directory not created');
        },
      })
      .add(() => ref.close());
  }

  editDir(dir: number) {
    this.dialog.open(DirSettingsDialog, { data: { dir } });
  }

  deleteDir(id: number) {
    return this.service.removeDir(id).pipe(
      map((value) => {
        console.log('??');
        this.notify.success('Directory removed');
        return value;
      }),
      catchError((error) => {
        this.notify.error('Directory not removed');
        return of(false);
      })
    );
  }

  openImport(dir: number) {
    this.dialog.open(ImportLinksDialog, { data: { dir } });
  }

  prolongAccess({ dir, code }: { dir: number; code: AccessRule }) {
    this.service.extendLifetime(dir, code).subscribe({
      next: () => this.notify.success('Access granted!'),
      error: () => this.notify.error('Cannot grant access!'),
    });
  }

  editAccess({ dir, code }: { dir: number; code: AccessRule }) {
    const dialog = this.dialog.open(EditAccessDialog, { data: code });
    dialog.componentInstance.onChange
      .pipe(take(1))
      .subscribe((changes) => {
        this.service.editAccess(dir, { ...code, ...changes }).subscribe({
          next: () => this.notify.success('Access code changed'),
          error: () => this.notify.error('Access code not changed'),
        });
      })
      .add(() => dialog.close());
  }

  onCopyCodeUrl() {
    this.notify.success('Link copied!');
  }
}
