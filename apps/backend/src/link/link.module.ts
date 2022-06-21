import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { DirectoryToUser } from './direcrtory.to.user.model';
import { DirectoryController } from './directory.controller';
import { Directory } from './directory.model';
import { DirectoryService } from './directory.service';
import { LinkController } from './link.controller';
import { Link } from './link.model';
import { LinkService } from './link.service';
import { TagController } from './tag.controller';
import { Tag } from './tag.model';
import { TagService } from './tag.service';
import { TagToLink } from './tag.to.link.model';

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
