import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog/change-link.dialog';
import { CreateSubdirDialog } from '../../dialogs/create-subdir-dialog/create-subdir.dialog';
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
import { MergeGuestListDialog } from '../../dialogs/merge-guest-list.dialog';

@Component({
  selector: 'app-user-folder',
  templateUrl: './user-folder.component.html',
  styleUrls: ['./user-folder.component.scss'],
})
export class UserFolder implements OnInit {
  private openned$ = new BehaviorSubject<number[]>([]);

  vm$ = combineLatest([
    this.openned$,
    this.linkService.root$,
    this.linkService.list$,
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

  constructor(private dialog: MatDialog, private linkService: LinkService) {}

  ngOnInit() {
    this.linkService.root$
      .pipe(
        filter((v) => v !== null),
        take(1)
      )
      .subscribe((root) => this.openned$.next([root!]));

    combineLatest([
      this.linkService.guestDir$.pipe(
        filter((a) => a !== null),
        distinctUntilChanged((a, b) => {
          return a?.id === b?.id;
        })
      ),
      this.linkService.root$.pipe(
        filter((a) => a !== null),
        distinctUntilChanged()
      ),
    ])
      .pipe(
        switchMap(([guest, root]) => {
          if (!guest || !root || guest.links.length === 0) return of(false);
          const ref = this.dialog.open(MergeGuestListDialog);
          return merge(
            ref.componentInstance.onAccept.pipe(
              switchMap(() => this.linkService.mergeDirs(guest.id, root))
            ),
            ref.componentInstance.onDecline.pipe(
              switchMap(() => this.linkService.removeDir(guest.id))
            )
          ).pipe(tap(() => ref.close()));
        }),
        take(1)
      )
      .subscribe(() => {});
  }

  onCreateLinks(data: { dir: number; links: SimpleLink[] }) {
    this.linkService.addLinks(data.dir, data.links);
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

  delete(link: Link[]) {
    this.linkService.deleteLinks(link);
  }

  edit(link: Link) {
    this.dialog.open(ChangeLinkDialog, { data: link });
  }

  move(links: Link[]) {
    const variants = Object.values(this.linkService.list$.getValue() || {}).map(
      (d) => ({ label: d.name || d.id, value: d.id })
    );
    const ref = this.dialog.open(SelectDialog, { data: { variants } });

    ref.componentInstance.onChange
      .pipe(
        take(1),
        switchMap((dir) => this.linkService.moveLinks(links, Number(dir)))
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
    const ref = this.dialog.open(CreateSubdirDialog);
    ref.componentInstance.onChange
      .pipe(
        take(1),
        switchMap((name) => this.linkService.createDir(parent, name))
      )
      .subscribe(() => {
        ref.close();
      });
  }

  editDir(dir: number) {
    this.dialog.open(DirSettingsDialog, { data: { dir } });
  }

  deleteDir(id: number) {
    this.linkService.removeDir(id).subscribe(() => {
      const prev = this.openned$.value;
      if (prev.includes(id)) return;
      this.openned$.next(prev.filter((d) => d !== id));
    });
  }

  onImport(dir: number) {
    this.dialog.open(ImportLinksDialog, { data: { dir } });
  }
}
