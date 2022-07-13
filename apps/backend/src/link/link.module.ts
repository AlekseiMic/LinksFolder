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

@Module({
  controllers: [LinkController, TagController, DirectoryController],
  providers: [LinkService, TagService, DirectoryService],
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
})
export class LinkModule {}
