import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeLinkDialog } from '../../dialogs/change-link.dialog';
import { AllLists, LinkService } from '../../services/link.service';

@Component({
  selector: 'app-link-not-simple-list',
  templateUrl: './link.not.simple.list.component.html',
  styleUrls: ['./link.not.simple.list.component.scss'],
})
export class LinkNotSimpleList implements OnInit {
  @Input() lists: AllLists;

  @Input() directory: number | undefined;

  constructor(private dialog: MatDialog, private linkService: LinkService) {}

  delete(directory: number, id: number) {
    if (!directory) return;
    this.linkService.deleteLinks(directory, [id]).subscribe(() => {});
  }

  edit(directory: number, id: number) {
    this.dialog.open(ChangeLinkDialog, {
      data: { id, directory },
    });
  }

  ngOnInit(): void {}

  ngOnDestroy() {}
}
