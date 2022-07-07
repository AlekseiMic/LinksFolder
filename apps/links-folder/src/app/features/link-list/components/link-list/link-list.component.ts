import { Component, Input, OnInit } from "@angular/core";
import { Folder, TreeItem } from "../../models/Item";

@Component({
  selector: '[app-link-list]',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.scss']
})
export class LinkListComponent implements OnInit {

  @Input() items?: TreeItem;

  @Input() drop: any;

  @Input() delete?: (id: string | number, list: Folder) => void;

  @Input() edit?: ( id: string | number, list?: Folder) => void;

  @Input() openFolder: (folder?: TreeItem, side?: boolean) => void = () => {};

  @Input() isHome = true;

  @Input() goToParentFolder?: (folder: TreeItem) => void;

  @Input() isExpanded = false;

  @Input() expanded: string[] = [];

  expandFolder = (folder: TreeItem) => {
    this.expanded.push(folder.id);
  }

  collapseFolder = (folder: TreeItem) => {
    this.expanded = this.expanded.filter((el) => el !== folder.id);
  }

  onDeleteItem = (id: string | number) => {
    if (!this.delete || !this.items || !(this.items instanceof Folder)) return;
    this.delete(id, this.items);
  }

  onEditItem = (id: string | number) => {
    if (!this.edit || !(this.items instanceof Folder)) return;
    this.edit(id, this.items);
  }

  ngOnInit(): void {

  }
}
