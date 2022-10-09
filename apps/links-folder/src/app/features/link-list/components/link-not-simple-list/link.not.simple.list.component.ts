import {
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog';
import { CreateSubdirDialog } from '../../dialogs/create-subdir-dialog/create-subdir.dialog';
import { AllLists, LinkService, List } from '../../services/link.service';
import memoizee from 'memoizee';

@Component({
  selector: 'app-link-not-simple-list',
  templateUrl: './link.not.simple.list.component.html',
  styleUrls: ['./link.not.simple.list.component.scss'],
})
export class LinkNotSimpleList implements OnInit {
  @Input() lists: AllLists;

  @Input() directory: number | undefined;

  @ViewChild('linksCheckbox') linkCheckbox: ElementRef<HTMLInputElement>;

  expanded: Record<number, boolean> = {};

  openned: number[] = [];

  selectedLinks: Record<number, boolean> = {};

  constructor(private dialog: MatDialog, private linkService: LinkService) {}

  onDirChecked(event: any, dir: number) {
    if (event.currentTarget.checked) {
      this.openned = [...this.openned, dir];
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
    this.openned = [dir];
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

  get selectedLinksCount() {
    return Object.values(this.selectedLinks).filter((v) => v).length;
  }

  isLinkSelected(link: number) {
    return this.selectedLinks[link] || false;
  }

  toggleAllLinks(event: any) {
    const hasUnselectedLinks = this.hasUnselectedLinks();
    this.links.forEach(({ id }) => {
      this.selectedLinks[id] = hasUnselectedLinks;
    });
    event.currentTarget.checked = hasUnselectedLinks;
  }

  hasUnselectedLinks() {
    return (
      this.links.findIndex((l) => this.selectedLinks[l.id] !== true) !== -1
    );
  }

  toggleLink(link: number) {
    this.selectedLinks[link] = !(this.selectedLinks[link] ?? false);
    if (!this.selectedLinks[link]) {
      this.linkCheckbox.nativeElement.checked = false;
    } else if (!this.hasUnselectedLinks()) {
      this.linkCheckbox.nativeElement.checked = true;
    }
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

  hasSubfolders(dir: number | undefined) {
    if (!dir) return false;
    return (this.lists?.[dir]?.sublists?.length ?? 0) > 0;
  }

  getSubfolders(dir: number | undefined) {
    if (!dir) return [];
    return this.lists?.[dir]?.sublists ?? [];
  }

  getFolder(dir: number | undefined) {
    if (!dir) return undefined;
    return this.lists?.[dir];
  }

  isMultiDirs() {
    return this.openned.length > 1;
  }

  private getOpennedVariants = memoizee(
    (lists: typeof this.lists, openned: typeof this.openned) => {
      return openned.reduce((acc: { value: number; label: string }[], v) => {
        const dir = lists?.[v];
        if (!dir) return acc;
        acc.push({ value: v, label: `${dir?.name ?? v}` });
        return acc;
      }, []);
    }
  );

  get opennedVariants() {
    return this.getOpennedVariants(this.lists, this.openned);
  }

  private getTitle = memoizee(
    (lists: typeof this.lists, openned: typeof this.openned) => {
      return openned
        .map((v) => lists?.[v]?.name)
        .filter((v) => v)
        .join(', ');
    }
  );

  get title() {
    return this.getTitle(this.lists, this.openned);
  }

  private getLinks = memoizee(
    (lists: typeof this.lists, openned: typeof this.openned) => {
      const result: List['links'] = [];
      openned.forEach((v) => {
        if (!lists?.[v]) return;
        result.push(...lists[v].links);
      });
      return result;
    }
  );

  get links() {
    return this.getLinks(this.lists, this.openned);
  }

  ngOnInit(): void {}

  ngOnDestroy() {}
}
