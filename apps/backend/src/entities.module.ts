import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User, Session, Link, Directory, DirectoryAccess } from 'models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Session,
      Link,
      Directory,
      DirectoryAccess,
    ]),
  ],
  exports: [SequelizeModule],
})
export class EntitiesModule {}
