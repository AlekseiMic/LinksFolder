import { DOCUMENT, Location, LocationStrategy } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LinkService } from '../../services/link.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangeAccessCodeDialog } from '../../dialogs/change-access-code.dialog';
import { AuthService } from 'apps/links-folder/src/app/shared/services/auth.service';

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

  public routeCode?: string;
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
    @Inject(DOCUMENT) readonly document: Document
  ) {}

  ngOnInit(): void {
    this.routeSub = this.routingParam.params.subscribe((params) => {
      this.routeCode = params['id'];
      if (this.isAuthorized === undefined) {
        this.listService.clear();
        return;
      }
      this.listService.fetchList(params['id']);
    });

    this.codeSub = this.listService.subscribeToCodeChange((code?: string) => {
      if (!this.routeCode && this.code !== code) {
        const url = this.router.createUrlTree([code ?? '']).toString();
        this.location.go(url);
      }
      this.code = code;
    });

    this.canEditSub = this.listService.subscribeToCanEditChange(
      (can: boolean) => {
        this.canEdit = can;
      }
    );

    this.authorizationSub = this.auth.isLoggedSubject.subscribe(
      (flag: boolean | undefined) => {
        console.log('here', flag);
        this.isAuthorized = flag;
        if (this.isAuthorized === undefined) {
          this.listService.clear();
          return;
        }
        this.listService.fetchList(this.routeCode);
      }
    );
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.codeSub.unsubscribe();
    this.canEditSub.unsubscribe();
    this.authorizationSub.unsubscribe();
  }

  copyLink() {
    const link = this.getLink();
    if (!link) return;
    this.clipboard.copy(link);
  }

  extendLinkLifetime() {
    this.listService.extendLifetime();
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
