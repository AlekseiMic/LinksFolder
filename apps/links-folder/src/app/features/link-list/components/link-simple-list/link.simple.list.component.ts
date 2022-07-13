import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LinkService } from '../../services/link.service';

@Component({
  selector: 'app-link-simple-list',
  templateUrl: './link.simple.list.component.html',
  styleUrls: ['./link.simple.list.component.html'],
})
export class LinkSimpleList implements OnInit {
  private sub: Subscription;
  links: string[];

  constructor(private linkService: LinkService) {
    this.links = this.linkService.getLinks();
    this.sub = this.linkService.subscribeToListChanges((list: string[]) => {
      this.links = list;
    });
  }

  ngOnInit(): void {}
}
