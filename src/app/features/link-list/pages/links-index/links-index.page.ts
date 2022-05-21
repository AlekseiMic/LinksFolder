import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './links-index.page.html',
  styleUrls: ['./links-index.page.scss']
})
export class LinksIndexPage implements OnInit {
  items: any[] = [ { items:['1','2','3','4']} ];

  ngOnInit(): void {
  }

  create = (url: string): void  => {
    this.items[0].items.push(url);
  }

  delete = (list: any[], id: string | number) => {
    const arr: { items: any[]} | undefined = this.items.find((el) => {
      return el.items === list;
    });
    if (arr === undefined) return;
    arr.items.splice(parseInt(id+''), 1); // TODO::Find index by id and only then splice
  }

  edit = (list: any[], id: string | number) => {
    const arr: { items: any[]} | undefined = this.items.find((el) => {
      return el.items === list;
    });
    if (arr === undefined) return;
    const newUrl = prompt('Enter new URL');
    arr.items[parseInt(id+'')]=newUrl; // TODO::Find index by id and only then replace
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

}
