import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { TreeFolder } from '../../models/TreeItem';
import { LinkListService } from '../../services/link-list.service';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './links-index.page.html',
  styleUrls: ['./links-index.page.scss']
})
export class LinksIndexPage implements OnInit {

  constructor(public listService: LinkListService) {}

  ngOnInit(): void {
    this.listService.openFolder();
  }

  drop(event: CdkDragDrop<TreeFolder>) {
    moveItemInArray(event.container.data.children, event.previousIndex, event.currentIndex);
  }

}
