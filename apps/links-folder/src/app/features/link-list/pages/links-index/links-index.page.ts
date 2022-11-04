import { DOCUMENT, Location, LocationStrategy } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AllLists, LinkService } from '../../services/link.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'apps/links-folder/src/app/shared/services/auth.service';
import { MergeGuestListDialog } from '../../dialogs/merge-guest-list.dialog';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './links-index.page.html',
})
export class LinksIndexPage implements OnInit {
  private routeSub: Subscription;
  private authorizationSub: Subscription;
  private listSub: Subscription;

  public routeCode?: string;
  public isAuthorized: boolean | undefined;
  public list: AllLists = {};
  public baseDir: number | undefined;

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private listService: LinkService,
    private routingParam: ActivatedRoute,
    readonly locationStrategy: LocationStrategy,
    readonly location: Location,
    @Inject(DOCUMENT) readonly document: Document
  ) {}

  ngOnInit(): void {
    this.routeSub = this.routingParam.params.subscribe((params) => {
      this.routeCode = params['id'];
      if (this.isAuthorized === undefined) return;
      this.fetchList();
    });

    this.authorizationSub = this.auth.isLoggedSubject.subscribe(
      (flag: boolean | undefined) => {
        if (this.isAuthorized === flag && flag === undefined) return;
        this.isAuthorized = flag;
        this.fetchList();
      }
    );

    this.listSub = this.listService.list$.subscribe((listObj) => {
      this.baseDir = this.listService.rootDir;
      this.list = listObj ?? {};

      if (this.listService.guestDir) {
        // const guestDir = listObj[this.listService.guestDir];
        // this.baseDir = this.listService.guestDir;
        // if (guestDir.isGuest && guestDir.owned && guestDir.links.length > 0) {
        //   this.openMergeDialog(guestDir.id);
        // } else if (guestDir.isGuest && guestDir.owned) {
        //   this.listService.removeDir(guestDir.id).subscribe(() => {});
        // }
      }
    });
  }

  get root() {
    if (!this.list || !this.baseDir || !this.list[this.baseDir]) return null;
    return this.list[this.baseDir];
  }

  hasLinks() {
    return (this.root?.links?.length ?? 0) > 0;
  }

  fetchList() {
    this.listService.fetchList(this.routeCode);
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.authorizationSub.unsubscribe();
    this.listSub.unsubscribe();
  }

  openMergeDialog(dirId: number) {
    this.dialog.open(MergeGuestListDialog, {
      data: { dirId, baseDir: this.listService.rootDir },
    });
  }
}
