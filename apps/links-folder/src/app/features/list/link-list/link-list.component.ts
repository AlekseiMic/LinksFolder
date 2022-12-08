import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Link, AllLists } from '../../../types';

@Component({
  selector: 'app-link-list',
  templateUrl: 'link-list.component.html',
  styleUrls: ['link-list.component.scss'],
})
export class LinkList {
  @Input() links: Link[];

  @Input() dirsInfo?: AllLists;

  @Input() selectable: boolean;

  @Input() showBar: boolean;

  @Output() onEdit = new EventEmitter<Link>();

  @Output() onDelete = new EventEmitter<Link[]>();

  @Output() onMove = new EventEmitter<Link[]>();

  private selected: Set<number> = new Set();

  allCheckboxControl = new FormControl();

  isSelected(link: Link) {
    return this.selected.has(link.id);
  }

  get isAllSelected() {
    return this.allCheckboxControl.value;
  }

  set isAllSelected(value: boolean) {
    this.allCheckboxControl.setValue(value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selected.size === 0 || !changes['links']) return;
    const newLinks = changes['links'].currentValue as Link[];
    const newSelected = newLinks.reduce((acc: number[], link) => {
      if (this.selected.has(link.id)) acc.push(link.id);
      return acc;
    }, []);
    if (newSelected.length !== this.selected.size) {
      this.selected = new Set(newSelected);
    }
    const linksCount = this.getEditableLinks().length;
    this.isAllSelected = this.selected.size === linksCount && linksCount > 0;
  }

  deleteSelected() {
    const links = this.links.filter((link) => this.selected.has(link.id));
    if (links.length === 0) return;
    this.onDelete.emit(links);
  }

  moveSelected() {
    const links = this.links.filter((link) => this.selected.has(link.id));
    if (links.length === 0) return;
    this.onMove.emit(links);
  }

  isEditable(dir: number) {
    return this.dirsInfo?.[dir]?.editable ?? false;
  }

  toggleAll() {
    if (!this.isAllSelected) {
      this.selected.clear();
      this.isAllSelected = false;
      return;
    }
    this.selected = new Set(this.getEditableLinks());
    this.isAllSelected = this.selected.size > 0;
  }

  getEditableLinks() {
    return this.links.reduce((acc: number[], link) => {
      if (this.isEditable(link.directory)) acc.push(link.id);
      return acc;
    }, []);
  }

  get selectedCount() {
    return this.selected.size;
  }

  onToggle(link: Link, select: boolean) {
    if (select) this.selected.add(link.id);
    if (!select) this.selected.delete(link.id);
    const linksCount = this.getEditableLinks().length;
    this.isAllSelected = this.selected.size === linksCount && linksCount > 0;
  }
}
