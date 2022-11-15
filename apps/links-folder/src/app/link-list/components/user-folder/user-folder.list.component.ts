import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog/change-link.dialog';
import { AllLists, LinkService } from '../../services/link.service';
import { DirSettingsDialog } from '../../dialogs/dir-settings-dialog/dir-settings.dialog';
import { ImportLinksDialog } from '../../dialogs/import-links-dialog/import-links.dialog';
import { Link, Variant, SimpleLink } from '../../types';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  switchMap,
  take,
  tap,
  throttleTime,
} from 'rxjs';
import { SelectDialog } from '../../../shared/components/select-dialog/select.dialog';
import { MergeListDialog } from '../../dialogs/merge-list.dialog/merge-list.dialog';
import { CreateDirectoryDialog } from '../../dialogs/create-directory.dialog/create-directory.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getSnackbarProps } from 'src/app/shared/helpers/getSnackbarProps';

@Component({
  selector: 'app-user-folder',
  templateUrl: './user-folder.component.html',
  styleUrls: ['./user-folder.component.scss'],
})
export class UserFolder implements OnInit {
  private openned$ = new BehaviorSubject<number[]>([]);

  vm$ = combineLatest([
    this.openned$,
    this.service.root$,
    this.service.list$,
  ]).pipe(
    throttleTime(200, undefined, { leading: true, trailing: true }),
    map(([openned, root, lists]) => {
      const [links, title, variants] = this.prepareData(openned, lists);
      return { openned, variants, title: title.join(', '), links, root, lists };
    })
  );

  private prepareData(openned: number[], lists: AllLists) {
    return openned.reduce(
      (acc: [Link[], string[], Variant[]], id) => {
        const dir = lists?.[id];
        if (dir) {
          const label = `${dir?.name ?? id}`;
          acc[0].push(...dir.links);
          acc[1].push(label);
          acc[2].push({ value: id, label });
        }
        return acc;
      },
      [[], [], []]
    );
  }

  constructor(
    private dialog: MatDialog,
    private service: LinkService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.service.root$
      .pipe(
        filter((v) => v !== null),
        take(1)
      )
      .subscribe((root) => this.openned$.next([root!]));

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

  onCreateLinks(data: { dir: number; links: SimpleLink[] }) {
    this.service.addLinks(data.dir, data.links);
  }

  onSelect({ dir, clear }: { dir: number; clear: boolean }) {
    const prev = this.openned$.value;
    let next = clear ? [] : prev;
    const isSelected = prev.includes(dir);

    if (clear && isSelected && prev.length === 1) return;

    if (!clear && isSelected) next = prev.filter((d) => d !== dir);
    else next.push(dir);

    this.openned$.next(next);
  }

  delete(links: Link[]) {
    this.service.deleteLinks(links).subscribe({
      next: (r) => this.notify(r > 0 ? `Removed ${r} links` : 'Error', r > 0),
      error: () => this.notify('Something went wrong!', false),
    });
  }

  edit(link: Link) {
    this.dialog.open(ChangeLinkDialog, { data: link });
  }

  move(links: Link[]) {
    const variants = Object.values(this.service.list$.getValue() || {}).map(
      (d) => ({ label: d.name || d.id, value: d.id })
    );
    const ref = this.dialog.open(SelectDialog, { data: { variants } });

    ref.componentInstance.onChange
      .pipe(
        take(1),
        switchMap((dir) => this.service.moveLinks(links, Number(dir)))
      )
      .subscribe(() => {
        ref.close();
      });
  }

  onAction([dir, action]: [number, 'create' | 'update' | 'delete' | 'import']) {
    switch (action) {
      case 'create':
        return this.createDir(dir);
      case 'update':
        return this.editDir(dir);
      case 'delete':
        return this.deleteDir(dir);
      case 'import':
        return this.onImport(dir);
      default:
        break;
    }
  }

  createDir(parent: number) {
    const ref = this.dialog.open(CreateDirectoryDialog);
    ref.componentInstance.onChange
      .pipe(
        take(1),
        switchMap((name) => this.service.createDir(parent, name))
      )
      .subscribe(() => {
        ref.close();
      });
  }

  editDir(dir: number) {
    this.dialog.open(DirSettingsDialog, { data: { dir } });
  }

  deleteDir(id: number) {
    this.service.removeDir(id).subscribe(() => {
      const prev = this.openned$.value;
      if (prev.includes(id)) return;
      this.openned$.next(prev.filter((d) => d !== id));
    });
  }

  onImport(dir: number) {
    this.dialog.open(ImportLinksDialog, { data: { dir } });
  }

  private notify(text: string, success: boolean) {
    this.snackBar.open(text, undefined, getSnackbarProps(success));
  }
}
