import { DOCUMENT, Location, LocationStrategy } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LinkService } from '../../services/link.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
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
  private codeSub: Subscription;
  private canEditSub: Subscription;
  private routeSub: Subscription;
  private authorizationSub: Subscription;
  private isOwnerSub: Subscription;

  public routeCode?: string;
  public isOwner: boolean;
  public code?: string;
  public canEdit: boolean;
  public isAuthorized: boolean | undefined;

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private listService: LinkService,
    private clipboard: Clipboard,
    readonly location: Location,
    private routingParam: ActivatedRoute,
    readonly locationStrategy: LocationStrategy,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) readonly document: Document
  ) {}

  ngOnInit(): void {
    this.routeSub = this.routingParam.params.subscribe((params) => {
      this.routeCode = params['id'];
      this.listService.clear();
      if (this.isAuthorized === undefined) return;
      this.listService.fetchList(params['id']);
    });

    this.codeSub = this.listService.subscribeToCodeChange((code?: string) => {
      if (this.code === code) return;
      const url = this.router.createUrlTree([code ?? '']).toString();
      this.location.go(url);
      this.code = code;
    });

    this.canEditSub = this.listService.subscribeToCanEditChange(
      (can: boolean) => {
        this.canEdit = can;
      }
    );

    this.isOwnerSub = this.listService.subscribeToIsOwnerChanges(
      (isOwner: boolean) => {
        this.isOwner = isOwner;
        this.checkCanMergeGuestList();
      }
    );

    this.authorizationSub = this.auth.isLoggedSubject.subscribe(
      (flag: boolean | undefined) => {
        if (flag === undefined) return;
        this.isAuthorized = flag;
        this.listService.fetchList(this.routeCode);
        this.checkCanMergeGuestList();
      }
    );
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.codeSub.unsubscribe();
    this.canEditSub.unsubscribe();
    this.isOwnerSub.unsubscribe();
    this.authorizationSub.unsubscribe();
  }

  checkCanMergeGuestList() {
    if (this.isOwner && this.isAuthorized) {
      console.log('Do you want to add guest list to your account?');

      this.dialog.open(MergeGuestListDialog, {});
    }
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
    this.listService.extendLifetime().subscribe((value) => {
      this.snackBar.open(value ? 'Success!' : 'Error!', undefined, {
        panelClass: value ? 'success' : 'error',
        duration: 5000,
        verticalPosition: 'top',
      });
    });
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
