import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit } from "@angular/core";
import { TreeFolder, TreeItem } from "../../models/TreeItem";

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.scss']
})
export class LinkListComponent implements OnInit {

  @Input() items?: TreeFolder;

  @Input() drop: (event:CdkDragDrop<TreeFolder, any, any>) => void = () =>{};

  @Input() delete?: (id: string | number, list: TreeFolder) => void;

  @Input() edit?: ( id: string | number, list?: TreeFolder) => void;

  @Input() openFolder: (folder?: TreeItem, side?: boolean) => void = () => {};

  @Input() isHome = true;

  @Input() goToParentFolder?: (folder: TreeFolder) => void;

  onDeleteItem = (id: string | number) => {
    if (!this.delete || !this.items) return;
    this.delete(id, this.items);
  }

  onEditItem = (id: string | number) => {
    if (!this.edit) return;
    this.edit(id, this.items);
  }

  ngOnInit(): void {

  }
}
