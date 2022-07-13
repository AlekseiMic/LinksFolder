import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { LinkListService } from '../../services/link-list.service';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './links-index.page.html',
  styleUrls: ['./links-index.page.scss']
})
export class LinksIndexPage implements OnInit {

  constructor(public listService: LinkListService) {}

  public onDragDrop$ = new Subject<CdkDragDrop<Array<any>>>();

  ngOnInit(): void {
    // this.listService.openFolder();
    // this.onDragDrop$.subscribe(this.onDragDrop);
  }

  // public drop = (event: any) => {
  //   this.onDragDrop$.next(event);
  // }
  //
  // public onDragDrop = (event: CdkDragDrop<any>) => {
  //   if (event.container === event.previousContainer) {
  //     moveItemInArray(event.container.data.children, event.previousIndex, event.currentIndex)
  //   }
  //   else {
  //     transferArrayItem(
  //       event.previousContainer.data.children,
  //       event.container.data.children,
  //       event.previousIndex,
  //       event.currentIndex);
  //   }
  // }
}
