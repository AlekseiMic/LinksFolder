import { Module } from '@nestjs/common';
import {
  DIRECTORY_REPOSITORY,
  LINK_REPOSITORY,
  USER_REPOSITORY,
  SESSION_REPOSITORY,
  DIRECTORY_ACCESS_REPOSITORY,
  SqlDirectoryRepository,
  SqlLinkRepository,
  SqlUserRepository,
  SqlSessionRepository,
  SqlDirectoryAccessRepository,
} from 'repositories';
import { EntitiesModule } from 'entities.module';
import { GeneralService } from 'services/general.service';
import { LinkService } from './services/link.service';
import { DirectoryService } from './services/directory.service';
import { NestedSetsSequelizeHelper } from 'services/nested-sets-sequelize.service';
import { GuestService } from './services/guest.service';
import { AuthController, GeneralController, LinkController } from 'controllers';
import { DirectoryController } from './controllers/directory.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { JwtService } from './services/jwt.service';
import { SessionService } from './services/session.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'utils/strategies/jwt.strategy';

@Module({
  imports: [EntitiesModule, PassportModule],
  controllers: [
    DirectoryController,
    LinkController,
    GeneralController,
    AuthController,
  ],
  providers: [
    AuthService,
    NestedSetsSequelizeHelper,
    LinkService,
    GuestService,
    DirectoryService,
    GeneralService,
    UserService,
    JwtService,
    JwtStrategy,
    SessionService,
    { provide: DIRECTORY_REPOSITORY, useClass: SqlDirectoryRepository },
    {
      provide: DIRECTORY_ACCESS_REPOSITORY,
      useClass: SqlDirectoryAccessRepository,
    },
    { provide: LINK_REPOSITORY, useClass: SqlLinkRepository },
    { provide: SESSION_REPOSITORY, useClass: SqlSessionRepository },
    { provide: USER_REPOSITORY, useClass: SqlUserRepository },
  ],
})
export class MainModule {}
