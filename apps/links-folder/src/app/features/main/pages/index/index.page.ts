import { Component, OnInit } from '@angular/core';
import {
  Subscription,
  map,
  Observable,
  combineLatest,
  distinctUntilChanged,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { List } from 'app/types';
import { AuthService } from 'app/modules/auth/services/auth.service';
import { LinksMainService } from '../../modules/links-main/links-main.service';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './index.page.html',
})
export class IndexPage implements OnInit {
  private sub: Subscription;

  public isAuth$: Observable<boolean | undefined>;
  public root$: Observable<number | null>;
  public guest$: Observable<List | null>;

  constructor(
    private auth: AuthService,
    private links: LinksMainService,
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
