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

  public routeCode?: string;
  public codes?: List['codes'];
  public canEdit: boolean = false;
  public isGuest: boolean = false;
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

    this.listSub = this.listService.list$.subscribe((listObj) => {
      if (!this.listService.rootDir) return;
      if (!listObj || Object.keys(listObj).length === 0) {
        this.codes = [];
        this.isOwner = false;
        this.canEdit = false;
        this.isGuest = false;
        this.list = [];
        this.dir = null;
        return;
      }
      const list = listObj[this.listService.rootDir];
      if (!list) {
        return;
      }
      this.codes = list.codes;
      this.isGuest = !!list.isGuest;
      this.isOwner = list.owned;
      this.canEdit = list.editable;
      this.list = list.links ?? [];
      this.dir = list.id;
      if (this.listService.guestDir) {
        const guestDir = listObj[this.listService.guestDir];
        if (guestDir.isGuest && guestDir.owned && guestDir.links.length > 0) {
          this.openMergeDialog(guestDir.id);
        } else if (guestDir.isGuest && guestDir.owned) {
          this.listService.removeList(guestDir.id).subscribe(() => {});
        }
      }
    });
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

  copyLink(code: string) {
    const link = this.getLink(code);
    if (link) {
      this.clipboard.copy(link);
      this.snackBar.open('Link copied!', undefined, {
        panelClass: 'success',
        duration: 5000,
        verticalPosition: 'top',
      });
    }
  }

  extendLinkLifetime(dirId: number, accessId: number) {
    this.listService.extendLifetime(dirId, accessId).subscribe((value) => {
      this.snackBar.open(value ? 'Success!' : 'Error!', undefined, {
        panelClass: value ? 'success' : 'error',
        duration: 5000,
        verticalPosition: 'top',
      });
    });
  }

  getLink(code: string) {
    if (!code) return null;
    return `${document.location.origin}${this.location.prepareExternalUrl(
      code
    )}`;
  }

  edit(dirId: number, accessId: number) {
    this.dialog.open(ChangeAccessCodeDialog, {
      data: { dirId, accessId },
    });
  }
}
