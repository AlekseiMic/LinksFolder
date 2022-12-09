import { NgModule } from '@angular/core';
import { LinksCommonService } from './links-common.service';
import { MergeListDialog } from './dialogs/merge-dir.dialog/merge-list.dialog';
import { AccessDialog } from './dialogs/access.dialog/access.dialog';
import { EditAccessDialog } from './dialogs/edit-access.dialog/edit-access.dialog';
import { DirSettingsDialog } from './dialogs/dir-settings.dialog/dir-settings.dialog';
import { ImportLinksDialog } from './dialogs/import-links.dialog/import-links.dialog';
import { CreateDirectoryDialog } from './dialogs/create-directory.dialog/create-directory.dialog';
import { ChangeLinkDialog } from './dialogs/change-link.dialog/change-link.dialog';
import { NotifyModule } from 'app/modules/notify/notify.module';
import { SharedModule } from 'app/shared/shared.module';
import { AccessModule } from 'app/modules/access/access.module';
import { DirectoryModule } from '../directory/directory.module';
import { LinkFormModule } from '../link-form/link.form.module';
import { LinksMainModule } from '../links-main/links-main.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    MergeListDialog,
    AccessDialog,
    EditAccessDialog,
    DirSettingsDialog,
    ImportLinksDialog,
    CreateDirectoryDialog,
    ChangeLinkDialog,
  ],
  imports: [
    MatProgressSpinnerModule,
    AccessModule,
    DirectoryModule,
    LinkFormModule,
    NotifyModule,
    SharedModule,
    LinksMainModule,
    MatSnackBarModule
  ],
  providers: [LinksCommonService],
})
export class LinksCommonModule {}
