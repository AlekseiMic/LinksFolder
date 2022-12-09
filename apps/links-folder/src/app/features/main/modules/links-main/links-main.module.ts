import { NgModule } from '@angular/core';
import { LinksMainService } from './links-main.service';
import { LinksApiModule } from '../links-api/links-api.module';

@NgModule({
  imports: [LinksApiModule],
  providers: [LinksMainService],
})
export class LinksMainModule {}
