import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { Item } from "../../models/Item";

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html'
})
export class AppItem implements OnInit {
  constructor() {}

  @Input() item: any;

  @Input() invert: any;

  @Input() onDragDrop: any;

  ngOnInit() {
   this.onDragDrop$.subscribe(this.onDragDrop);
  }

  public onDragDrop$ = new Subject<CdkDragDrop<Array<Item>>>();
}
