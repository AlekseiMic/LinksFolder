import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinksIndexPage } from './pages/links-index/links-index.page';
import { LinkRoutingModule } from './link-list-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkFormComponent } from './components/link-form/link.form.component';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LinkService } from './services/link.service';
import { GuestFolder } from './components/guest-folder/guest-folder.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { EditLinkForm } from './components/edit-link-form/edit-link-form.component';
import { ChangeLinkDialog } from './dialogs/change-link.dialog/change-link.dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../shared/shared.module';
import { ChangeAccessCodeDialog } from './dialogs/change-access-code.dialog';
import { EditAccessCodeForm } from './components/edit-access-code-form/edit-access-code-form.component';
import { MergeGuestListDialog } from './dialogs/merge-guest-list.dialog';
import { UserFolder } from './components/user-folder/user-folder.list.component';
import { CreateSubdirForm } from './components/create-subdir-form/create-subdir-form.component';
import { CreateSubdirDialog } from './dialogs/create-subdir-dialog/create-subdir.dialog';
import { DirSettingsDialog } from './dialogs/dir-settings-dialog/dir-settings.dialog';
import { DirAccessForm } from './components/dir-access-form/dir-access-form.component';
import { DirAccessDialog } from './dialogs/dir-access.dialog/dir-access.dialog';
import { ImportLinksDialog } from './dialogs/import-links-dialog/import-links.dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SimpleLinkForm } from './components/simple-link-form/simple-link-form.component';
import { NotSimpleLinkForm } from './components/not-simple-link-form/not-simple-link-form.component';
import { AccessCodeCard } from './components/access-code-card/access-code-card.component';
import { Link } from './components/link/link.component';
import { FolderTree } from './components/folder-tree/folder-tree.component';
import { LinkList } from './components/link-list/link-list.component';

@NgModule({
  declarations: [
    CreateSubdirForm,
    EditLinkForm,
    EditAccessCodeForm,
    LinksIndexPage,
    LinkFormComponent,
    GuestFolder,
    UserFolder,
    ChangeLinkDialog,
    MergeGuestListDialog,
    ChangeAccessCodeDialog,
    CreateSubdirDialog,
    DirSettingsDialog,
    DirAccessForm,
    DirAccessDialog,
    ImportLinksDialog,
    SimpleLinkForm,
    NotSimpleLinkForm,
    AccessCodeCard,
    Link,
    FolderTree,
    LinkList,
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [LinkService],
})
export class LinkListModule {}
