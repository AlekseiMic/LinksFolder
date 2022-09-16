import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinksIndexPage } from './pages/links-index/links-index.page';
import { LinkRoutingModule } from './link-list-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkFormComponent } from './components/link-form/link.form.component';
import { LinkItemComponent } from './components/link-item/link-item.component';
import { LinkListComponent } from './components/link-list/link-list.component';
import { LinkListService } from './services/link-list.service';
import {
  DragNDropManagerDirective,
  DragNDropManagerRootDirective,
} from './directives/drag-n-drop-manager.directive';
import { DragNDropManagerService } from './services/drag-n-drop-manager.service';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LinkService } from './services/link.service';
import { LinkSimpleList } from './components/link-simple-list/link.simple.list.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { EditLinkFormComponent } from './components/edit-link-form/edit-link-form.component';
import { ChangeLinkDialog } from './dialogs/change-link.dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { ChangeAccessCodeDialog } from './dialogs/change-access-code.dialog';
import { EditAccessCodeFormComponent } from './components/edit-access-code-form/edit-access-code-form.component';
import { MergeGuestListDialog } from './dialogs/merge-guest-list.dialog';

@NgModule({
  declarations: [
    EditLinkFormComponent,
    EditAccessCodeFormComponent,
    LinksIndexPage,
    LinkFormComponent,
    LinkItemComponent,
    LinkListComponent,
    LinkSimpleList,
    DragNDropManagerDirective,
    DragNDropManagerRootDirective,
    ChangeLinkDialog,
    MergeGuestListDialog,
    ChangeAccessCodeDialog
  ],
  imports: [
    AngularSvgIconModule,
    CommonModule,
    LinkRoutingModule,
    DragDropModule,
    CdkAccordionModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDialogModule,
    SharedModule,
    MatSnackBarModule
  ],
  providers: [LinkListService, LinkService, DragNDropManagerService],
})
export class LinkListModule {}
