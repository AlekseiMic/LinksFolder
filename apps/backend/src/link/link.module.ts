import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'auth/entities/user.model';
import { DirectoryAccess } from './models/directory-access.model';
import { DirectoryController } from './controllers/v1/directory.controller';
import { Directory } from './models/directory.model';
import { DirectoryService } from './services/directory.service';
import { LinkController } from './controllers/v1/link.controller';
import { Link } from './models/link.model';
import { LinkService } from './services/link.service';
import { GuestService } from './services/guest.service';
import { NestedSetsSequelizeHelper } from 'common/services/nested-sets-sequelize.service';
import { SqlDirectoryRepository } from './repositories/sql-directory.repository';
import { GeneralController } from './controllers/v1/general.controller';
import { GeneralService } from './services/general.service';

@Module({
  controllers: [GeneralController, LinkController, DirectoryController],
  providers: [
    NestedSetsSequelizeHelper,
    LinkService,
    DirectoryService,
    GuestService,
    GeneralService,
    { provide: 'IDirectoryRepository', useClass: SqlDirectoryRepository },
  ],
  imports: [
    SequelizeModule.forFeature([User, Link, Directory, DirectoryAccess]),
  ],
  exports: [
    SequelizeModule,
    NestedSetsSequelizeHelper,
    LinkService,
    DirectoryService,
    GuestService,
    GeneralService,
    { provide: 'IDirectoryRepository', useClass: SqlDirectoryRepository },
  ],
})
export class LinkModule {}
