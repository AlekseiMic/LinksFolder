import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.scss']
})
export class LinkListComponent implements OnInit {

  @Input() items: string[]=[];

  @Input() drop: (event:CdkDragDrop<string[], any, any>) => void = () =>{};

  @Input() delete?: (id: string | number, list?: any[]) => void;

  @Input() edit?: ( id: string | number, list?: any[]) => void;

  onDeleteItem = (id: string | number) => {
    if (!this.delete) return;
    this.delete(id, this.items);
  }

  onEditItem = (id: string | number) => {
    if (!this.edit) return;
    this.edit(id, this.items);
  }

  ngOnInit(): void {

  }
}
