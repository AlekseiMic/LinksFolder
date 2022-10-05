import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog';
import { CreateSubdirDialog } from '../../dialogs/create-subdir-dialog/create-subdir.dialog';
import { AllLists, LinkService, List } from '../../services/link.service';

@Component({
  selector: 'app-link-not-simple-list',
  templateUrl: './link.not.simple.list.component.html',
  styleUrls: ['./link.not.simple.list.component.scss'],
})
export class LinkNotSimpleList implements OnInit {
  @Input() lists: AllLists;

  @Input() directory: number | undefined;

  expanded: Record<number, boolean> = {};

  openned: number[] = [];

  constructor(private dialog: MatDialog, private linkService: LinkService) {}

  onDirChecked(event: any, dir: number) {
    if (event.currentTarget.checked) {
      this.openned.push(dir);
    } else {
      this.openned = this.openned.filter((d) => d !== dir);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const newValue = changes['directory'].currentValue;
    if (this.openned.length === 0 && newValue) {
      this.openned = [newValue];
      this.expanded = { [newValue]: true };
    }
  }

  expand(dir: number) {
    this.expanded[dir] = true;
  }

  collapse(dir: number) {
    this.expanded[dir] = false;
  }

  isExpanded(dir: number) {
    return this.expanded[dir] === true;
  }

  open(dir: number) {
    this.openned = [];
    this.openned.push(dir);
  }

  toggle(dir: number) {
    this.isOpen(dir) ? this.close(dir) : this.open(dir);
  }

  createSubdir(dir: number) {
    this.dialog.open(CreateSubdirDialog, {
      data: { dir },
    });
  }

  close(dir: number) {
    this.openned = [];
    this.openned.push(dir);
  }

  isOpen(dir: number) {
    return this.openned.includes(dir);
  }

  delete(dir: number, id: number) {
    if (!dir) return;
    this.linkService.deleteLinks(dir, [id]).subscribe(() => {});
  }

  edit(dir: number, id: number) {
    this.dialog.open(ChangeLinkDialog, {
      data: { id, dir },
    });
  }

  getSubfolders(dir: number | undefined) {
    if (!dir) return [];
    return this.lists?.[dir]?.sublists ?? [];
  }

  getFolder(dir: number | undefined) {
    if (!dir) return undefined;
    return this.lists?.[dir];
  }

  getLinks(dir: number | undefined) {
    if (!dir) return [];
    return this.lists?.[dir]?.links ?? [];
  }

  isMultiDirs() {
    return this.openned.length > 1;
  }

  get links() {
    const result: List['links'] = [];
    this.openned.forEach((v) => {
      if (!this.lists?.[v]) return;
      result.push(...this.lists[v].links);
    });
    return result;
  }

  ngOnInit(): void {}

  ngOnDestroy() {}
}
