import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { UserFolder } from './components/user-folder/user-folder.list.component';
import { UserLinkForm } from './components/user-link-form/user-link-form.component';
import { LinkFormModule } from './../link-form/link.form.module';
import { FolderTreeModule } from 'app/modules/folder-tree/folder-tree.module';
import { ListModule } from 'app/modules/list/list.module';
import { LinksMainModule } from '../links-main/links-main.module';
import { LinksCommonModule } from '../links-common/links-common.module';

@NgModule({
  declarations: [UserFolder, UserLinkForm],
  imports: [
    SharedModule,
    LinkFormModule,
    FolderTreeModule,
    ListModule,
    LinksMainModule,
    LinksCommonModule,
  ],
  exports: [UserFolder],
})
export class UserFolderModule {}
