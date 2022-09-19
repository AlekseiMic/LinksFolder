import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { DirectoryToUser } from './models/directory.to.user.model';
import { DirectoryController } from './controllers/v1/directory.controller';
import { Directory } from './models/directory.model';
import { DirectoryService } from './services/directory.service';
import { LinkController } from './controllers/v1/link.controller';
import { Link } from './models/link.model';
import { LinkService } from './services/link.service';
import { TagController } from './controllers/v1/tag.controller';
import { Tag } from './models/tag.model';
import { TagService } from './services/tag.service';
import { TagToLink } from './models/tag.to.link.model';
import { GuestService } from './services/guest.service';
import { NestedSetsSequelizeHelper } from 'common/services/nested-sets-sequelize.service';
import { SqlDirectoryRepository } from './repositories/sql-directory.repository';
import { GeneralController } from './controllers/v1/general.controller';
import { GeneralService } from './services/general.service';

@Module({
  controllers: [
    GeneralController,
    LinkController,
    TagController,
    DirectoryController,
  ],
  providers: [
    NestedSetsSequelizeHelper,
    LinkService,
    TagService,
    DirectoryService,
    GuestService,
    GeneralService,
    { provide: 'IDirectoryRepository', useClass: SqlDirectoryRepository },
  ],
  imports: [
    SequelizeModule.forFeature([
      User,
      Link,
      Directory,
      DirectoryToUser,
      Tag,
      TagToLink,
    ]),
  ],
  exports: [
    SequelizeModule,
    NestedSetsSequelizeHelper,
    LinkService,
    TagService,
    DirectoryService,
    GuestService,
    GeneralService,
    { provide: 'IDirectoryRepository', useClass: SqlDirectoryRepository },
  ],
})
export class LinkModule {}
