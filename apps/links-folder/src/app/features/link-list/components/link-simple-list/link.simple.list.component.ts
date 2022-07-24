import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog';
import { LinkService } from '../../services/link.service';

@Component({
  selector: 'app-link-simple-list',
  templateUrl: './link.simple.list.component.html',
  styleUrls: ['./link.simple.list.component.scss'],
})
export class LinkSimpleList implements OnInit {
  private sub: Subscription;

  @Input() canEdit?: boolean;

  links: { url: string; text?: string; id: number }[];

  constructor(private dialog: MatDialog, private linkService: LinkService) {
    this.links = this.linkService.getLinks();
    this.sub = this.linkService.subscribeToListChanges((list: any) => {
      this.links = list;
    });
  }

  delete(id: number) {
    this.linkService.delete(id);
  }

  edit(id: number) {
    const dialogRef = this.dialog.open(ChangeLinkDialog, { data: { id } });
  }

  ngOnInit(): void {}
}
