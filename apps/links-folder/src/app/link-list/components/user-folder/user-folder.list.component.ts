import { Component, OnInit } from '@angular/core';
import { LinksMainService } from '../../services/links-main.service';
import { AllLists, Link, Variant, SimpleLink } from '../../../types';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  take,
  throttleTime,
} from 'rxjs';
import { LinksCommonService } from '../../services/links-common.service';

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

  constructor(
    private service: LinksMainService,
    private common: LinksCommonService
  ) {}

  private prepareData(openned: number[], lists: AllLists) {
    return openned.reduce(
      (acc: [Link[], string[], Variant[]], id) => {
        const dir = lists?.[id];
        if (dir) {
          const label = `${dir?.name ?? id}`;
          acc[0].push(...dir.links);
          acc[1].push(label);
          if (dir.editable) {
            acc[2].push({ value: id, label });
          }
        }
        return acc;
      },
      [[], [], []]
    );
  }

  ngOnInit() {
    this.service.root$
      .pipe(
        filter((v) => v !== null),
        take(1)
      )
      .subscribe((root) => this.openned$.next([root!]));

    this.common.checkMerge();
  }

  onCreateLinks(data: { dir: number; links: SimpleLink[] }) {
    this.common.createLinks(data);
  }

  delete(links: Link[]) {
    this.common.deleteLinks(links);
  }

  edit(link: Link) {
    this.common.editLink(link);
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

  move(links: Link[]) {
    const variants = Object.values(this.service.list$.getValue() || {}).map(
      (d) => ({ label: d.name || d.id, value: d.id })
    );
    this.common.moveLinks(variants, links);
  }

  onAction([dir, action]: [number, 'create' | 'update' | 'delete' | 'import']) {
    switch (action) {
      case 'create':
        return this.common.createDir(dir);
      case 'update':
        return this.common.editDir(dir);
      case 'delete':
        return this.deleteDir(dir);
      case 'import':
        return this.openImport(dir);
      default:
        break;
    }
  }

  deleteDir(id: number) {
    this.service.removeDir(id).subscribe(() => {
      const prev = this.openned$.value;
      if (prev.includes(id)) return;
      this.openned$.next(prev.filter((d) => d !== id));
    });
  }

  openImport(dir: number) {
    this.common.openImport(dir);
  }
}
