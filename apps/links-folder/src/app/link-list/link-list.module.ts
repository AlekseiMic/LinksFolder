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
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../shared/shared.module';
import { ChangeLinkDialog } from './dialogs/change-link.dialog/change-link.dialog';
import { EditAccessDialog } from './dialogs/edit-access.dialog/edit-access.dialog';
import { MergeListDialog } from './dialogs/merge-list.dialog/merge-list.dialog';
import { CreateDirectoryDialog } from './dialogs/create-directory.dialog/create-directory.dialog';
import { AccessDialog } from './dialogs/access.dialog/access.dialog';
import { ImportLinksDialog } from './dialogs/import-links-dialog/import-links.dialog';
import { DirSettingsDialog } from './dialogs/dir-settings-dialog/dir-settings.dialog';
import { EditAccessForm } from './components/edit-access-form/edit-access-form.component';
import { UserFolder } from './components/user-folder/user-folder.list.component';
import { CreateDirectoryForm } from './components/create-directory-form/create-directory-form.component';
import { AccessForm } from './components/access-form/access-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GuestLinkForm } from './components/guest-link-form/guest-link-form.component';
import { UserLinkForm } from './components/user-link-form/user-link-form.component';
import { AccessCode } from './components/access-code/access-code.component';
import { Link } from './components/link/link.component';
import { FolderTree } from './components/folder-tree/folder-tree.component';
import { LinkList } from './components/link-list/link-list.component';

@NgModule({
  declarations: [
    CreateDirectoryForm,
    EditLinkForm,
    EditAccessForm,
    LinksIndexPage,
    LinkFormComponent,
    GuestFolder,
    UserFolder,
    ChangeLinkDialog,
    MergeListDialog,
    EditAccessDialog,
    CreateDirectoryDialog,
    DirSettingsDialog,
    AccessForm,
    AccessDialog,
    ImportLinksDialog,
    GuestLinkForm,
    UserLinkForm,
    AccessCode,
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
