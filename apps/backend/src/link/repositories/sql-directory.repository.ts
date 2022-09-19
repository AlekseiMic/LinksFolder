import { InjectConnection } from '@nestjs/sequelize';
import { SqlRepository } from 'common/repositories/sql.repository';
import { Directory } from 'link/models/directory.model';
import { Sequelize } from 'sequelize-typescript';
import { IDirectoryRepository } from './interfaces/i.directory.repository';

export class SqlDirectoryRepository
  extends SqlRepository<Directory>
  implements IDirectoryRepository
{
  constructor(@InjectConnection() connection: Sequelize) {
    super(connection, Directory);
  }
}
