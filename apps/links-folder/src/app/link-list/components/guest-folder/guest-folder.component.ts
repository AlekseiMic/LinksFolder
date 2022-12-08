import { Component } from '@angular/core';
import { Code, Link, List, SimpleLink } from '../../../types';
import { Observable } from 'rxjs';
import { NotifyService } from 'src/app/features/notify/notify.service';
import { LinksMainService } from '../../services/links-main.service';
import { LinksCommonService } from '../../services/links-common.service';

@Component({
  selector: 'app-guest-folder',
  templateUrl: './guest-folder.component.html',
  styleUrls: ['./guest-folder.component.scss'],
})
export class GuestFolder {
  public guest$: Observable<List | null>;

  constructor(
    private service: LinksMainService,
    private common: LinksCommonService,
    private notify: NotifyService
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

  onEditAccess(data: { dir: number; code: Code }) {
    this.common.editAccess(data);
  }

  onProlongAccess(data: { dir: number; code: Code }) {
    this.common.prolongAccess(data);
  }

  onCopyCodeUrl() {
    this.notify.success('Link copied!');
  }
}
