import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AllLists } from '../../services/link.service';

type TogglePayload = { dir: number; clear: boolean };
type ActionPayload = [number, 'create' | 'update' | 'delete' | 'import'];
@Component({
  selector: 'app-folder-tree',
  templateUrl: 'folder-tree.component.html',
  styleUrls: ['folder-tree.component.scss'],
})
export class FolderTree {
  @Input() root: number | null;

  @Input() selected: number[] = [];

  @Input() lists: AllLists;

  @Output() onToggle = new EventEmitter<TogglePayload>();

  @Output() onAction = new EventEmitter<ActionPayload>();

  expanded: Record<number, boolean> = {};

  toggleTree = (dir: number) => (this.expanded[dir] = !this.expanded[dir]);

  isOpen = (dir: number) => !!this.expanded[dir];

  hasChilds = (dir: number) => this.getChilds(dir).length > 0;

  getChilds = (dir: number) => this.lists?.[dir]?.sublists ?? [];

  getName = (dir: number) => this.lists?.[dir]?.name ?? 'Unknown';
}
