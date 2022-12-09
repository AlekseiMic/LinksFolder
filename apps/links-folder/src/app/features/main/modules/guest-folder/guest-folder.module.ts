import { NgModule } from '@angular/core';
import { GuestFolder } from './components/guest-folder/guest-folder.component';
import { GuestLinkForm } from './components/guest-link-form/guest-link-form.component';
import { LinkFormModule } from './../link-form/link.form.module';
import { FolderTreeModule } from 'app/modules/folder-tree/folder-tree.module';
import { ListModule } from 'app/modules/list/list.module';
import { AccessModule } from 'app/modules/access/access.module';
import { SharedModule } from 'app/shared/shared.module';
import { LinksMainModule } from '../links-main/links-main.module';
import { LinksCommonModule } from '../links-common/links-common.module';

@NgModule({
  declarations: [GuestFolder, GuestLinkForm],
  imports: [
    SharedModule,
    LinkFormModule,
    FolderTreeModule,
    ListModule,
    AccessModule,
    LinksMainModule,
    LinksCommonModule,
  ],
  exports: [GuestFolder],
})
export class GuestFolderModule {}
