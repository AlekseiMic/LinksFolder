import { Component, OnInit } from '@angular/core';
import {
  Subscription,
  map,
  Observable,
  combineLatest,
  distinctUntilChanged,
} from 'rxjs';
import { LinkService } from '../../services/link.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { List } from '../../types';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './links-index.page.html',
})
export class LinksIndexPage implements OnInit {
  private sub: Subscription;

  public isAuth$: Observable<boolean | undefined>;
  public root$: Observable<number | null>;
  public guest$: Observable<List | null>;

  constructor(
    private auth: AuthService,
    private links: LinkService,
    private routingParam: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.root$ = this.links.root$;
    this.guest$ = this.links.guestDir$;
    this.isAuth$ = this.auth.isAuth$;
    let code$ = this.routingParam.params.pipe(map((params) => params['id']));

    this.sub = combineLatest([
      this.isAuth$.pipe(distinctUntilChanged()),
      code$.pipe(distinctUntilChanged()),
    ]).subscribe(([isAuth, code]) => {
      if (isAuth === undefined) return;
      this.links.clear();
      this.links.fetchList(code);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
