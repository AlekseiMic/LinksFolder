import { Component, OnInit } from '@angular/core';
import { Subscription, map, Observable, combineLatest } from 'rxjs';
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
  private mergeSub: Subscription;

  public isAuth$: Observable<boolean | undefined>;
  public root$: Observable<number | undefined>;
  public guest$: Observable<List | undefined>;

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

    this.sub = combineLatest([this.isAuth$, code$]).subscribe(
      ([isAuth, code]) => {
        if (isAuth === undefined) return;
        this.links.fetchList(code);
      }
    );

    this.mergeSub = combineLatest([this.isAuth$, this.guest$, this.links.root$])
      .pipe(map(([isAuth, guest, root]) => isAuth && root && guest?.owned))
      .subscribe(() => {
        // this.dialog.open(MergeGuestListDialog, {
        //   data: { dirId, baseDir },
        // });
      });
  }

  // if (this.listService.guestDir) {
  // const guestDir = listObj[this.listService.guestDir];
  // this.baseDir = this.listService.guestDir;
  // if (guestDir.isGuest && guestDir.owned && guestDir.links.length > 0) {
  //   this.openMergeDialog(guestDir.id);
  // } else if (guestDir.isGuest && guestDir.owned) {
  //   this.listService.removeDir(guestDir.id).subscribe(() => {});
  // }
  // }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.mergeSub.unsubscribe();
  }

  // openMergeDialog(dirId: number, baseDir: number) {
  // }
}
