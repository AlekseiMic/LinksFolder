import { DOCUMENT, Location, LocationStrategy } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LinkService, List } from '../../services/link.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeAccessCodeDialog } from '../../dialogs/change-access-code.dialog';
import { AuthService } from 'apps/links-folder/src/app/shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MergeGuestListDialog } from '../../dialogs/merge-guest-list.dialog';

@Component({
  selector: 'app-link-list-index',
  templateUrl: './links-index.page.html',
  styleUrls: ['./links-index.page.scss'],
})
export class LinksIndexPage implements OnInit {
  private routeSub: Subscription;
  private authorizationSub: Subscription;
  private listSub: Subscription;
  private guestSub: Subscription;

  public routeCode?: string;
  public code?: string;
  public canEdit: boolean = false;
  public isOwner: boolean = false;
  public isAuthorized: boolean | undefined;
  public list: List['links'] = [];
  public dir: number | null = null;

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private listService: LinkService,
    private clipboard: Clipboard,
    readonly location: Location,
    private routingParam: ActivatedRoute,
    readonly locationStrategy: LocationStrategy,
    private snackBar: MatSnackBar,
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

    this.guestSub = this.listService.guestList$.subscribe((list) => {
      if (!list) {
        return;
      }
      this.code = list.codes[0].code;
      this.isOwner = list.owned;
      this.canEdit = list.editable;
      this.list = list.links ?? [];
      this.dir = list.id;
      console.log(list);
      console.log(this.list);
    });
  }

  fetchList() {
    this.listService.fetchList(this.routeCode);
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.authorizationSub.unsubscribe();
  }

  checkCanMergeGuestList() {
    this.dialog.open(MergeGuestListDialog, {});
  }

  copyLink() {
    const link = this.getLink();
    if (link) {
      this.clipboard.copy(link);
      this.snackBar.open('Link copied!', undefined, {
        panelClass: 'success',
        duration: 5000,
        verticalPosition: 'top',
      });
    }
  }

  extendLinkLifetime() {
    // this.listService.extendLifetime().subscribe((value) => {
    // this.snackBar.open(value ? 'Success!' : 'Error!', undefined, {
    //   panelClass: value ? 'success' : 'error',
    //   duration: 5000,
    //   verticalPosition: 'top',
    // });
    // });
  }

  getLink() {
    if (!this.code) return null;
    return `${document.location.origin}${this.location.prepareExternalUrl(
      this.code
    )}`;
  }

  edit() {
    this.dialog.open(ChangeAccessCodeDialog, {
      data: { defaultValues: { code: this.code } },
    });
  }
}
