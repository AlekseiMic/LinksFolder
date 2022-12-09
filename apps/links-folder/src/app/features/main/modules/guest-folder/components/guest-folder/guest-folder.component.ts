import { Component } from '@angular/core';
import { AccessRule, Link, List, SimpleLink } from 'app/types';
import { Observable } from 'rxjs';
import { LinksMainService } from '../../../../modules/links-main/links-main.service';
import { LinksCommonService } from '../../../../modules/links-common/links-common.service';

@Component({
  selector: 'app-guest-folder',
  templateUrl: './guest-folder.component.html',
  styleUrls: ['./guest-folder.component.scss'],
})
export class GuestFolder {
  public guest$: Observable<List | null>;

  constructor(
    private service: LinksMainService,
    private common: LinksCommonService
  ) {}

  ngOnInit() {
    this.guest$ = this.service.guestDir$;
  }

  onCreateLinks(data: { dir: number; links: SimpleLink[] }) {
    this.common.createLinks(data);
  }

  onDeleteLinks(links: Link[]) {
    this.common.deleteLinks(links);
  }

  getDirsInfo(list: List) {
    return { [list.id]: list };
  }

  onEditLink(link: Link) {
    this.common.editLink(link);
  }

  onEditAccess(data: { dir: number; code: AccessRule }) {
    this.common.editAccess(data);
  }

  onProlongAccess(data: { dir: number; code: AccessRule }) {
    this.common.prolongAccess(data);
  }

  onCopyCodeUrl() {
    this.common.onCopyCodeUrl();
  }
}
