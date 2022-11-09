import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Link } from '../../types';

@Component({
  selector: 'app-link-list',
  templateUrl: 'link-list.component.html',
  styleUrls: ['link-list.component.scss'],
})
export class LinkList {
  @Input() links: Link[];

  @Input() selectable: boolean;

  @Output() onEdit = new EventEmitter<Link>();

  @Output() onDelete = new EventEmitter<Link[]>();

  @Output() onMove = new EventEmitter<Link[]>();

  private selected: Set<number> = new Set();

  public isAllSelected: boolean = false;

  isSelected(link: Link) {
    return this.selected.has(link.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selected.size === 0 || !changes['links']) return;
    const newSelected = (changes['links'].currentValue as Link[]).reduce(
      (acc: number[], link) => {
        if (this.selected.has(link.id)) acc.push(link.id);
        return acc;
      },
      []
    );
    if (newSelected.length !== this.selected.size) {
      this.selected = new Set(newSelected);
    }
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

  toggleAll() {
    if (this.isAllSelected) {
      this.selected.clear();
      this.isAllSelected = false;
      return;
    }
    this.selected = new Set([...this.links.map((link) => link.id)]);
    this.isAllSelected = true;
  }

  get selectedCount() {
    return this.selected.size;
  }

  onToggle(link: Link, select: boolean) {
    if (select) this.selected.add(link.id);
    if (!select) this.selected.delete(link.id);
    const linksCount = this.links.length;
    this.isAllSelected = this.selected.size === linksCount && linksCount > 0;
  }
}
