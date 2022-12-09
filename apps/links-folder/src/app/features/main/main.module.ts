import { NgModule } from '@angular/core';
import { MainRoutingModule } from './main-routing.module';
import { IndexPage } from './pages/index/index.page';
import { SharedModule } from 'app/shared/shared.module';
import { GuestFolderModule } from './modules/guest-folder/guest-folder.module';
import { LinksMainModule } from './modules/links-main/links-main.module';
import { UserFolderModule } from './modules/user-folder/user-folder.module';

@NgModule({
  declarations: [IndexPage],
  imports: [
    MainRoutingModule,
    SharedModule,
    LinksMainModule,
    GuestFolderModule,
    UserFolderModule,
  ],
})
export class LinkListModule {}
