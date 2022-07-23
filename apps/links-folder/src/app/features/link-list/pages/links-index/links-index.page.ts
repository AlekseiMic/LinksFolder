import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  DOCUMENT,
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { LinkService } from '../../services/link.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './links-index.page.html',
  styleUrls: ['./links-index.page.scss'],
  providers: [LinkService],
})
export class LinksIndexPage implements OnInit {
  private sub: Subscription;
  private canEditSub: Subscription;

  public code?: string;
  public canEdit: boolean;

  constructor(
    public listService: LinkService,
    private clipboard: Clipboard,
    readonly location: Location,
    readonly locationStrategy: LocationStrategy,
    @Inject(DOCUMENT) readonly document: Document
  ) {
    this.sub = listService.subscribeToCodeChange((code?: string) => {
      this.code = code;
    });
    this.canEditSub = listService.subscribeToCanEditChange((can: boolean) => {
      this.canEdit = can;
    });
  }

  public onDragDrop$ = new Subject<CdkDragDrop<Array<any>>>();

  ngOnInit(): void {
    // this.listService.openFolder();
    // this.onDragDrop$.subscribe(this.onDragDrop);
  }

  copyLink() {
    const link = this.getLink();
    if (!link) return;
    this.clipboard.copy(link);
  }

  getLink() {
    if (!this.code) return null;
    return `${document.location.origin}${this.location.prepareExternalUrl(
      this.code
    )}`;
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
