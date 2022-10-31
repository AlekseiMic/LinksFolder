import { InjectConnection } from '@nestjs/sequelize';
import { SqlRepository } from './sql.repository';
import { Directory } from 'models';
import { Sequelize } from 'sequelize-typescript';
import { IDirectoryRepository } from './interfaces/i-directory.repository';

export class SqlDirectoryRepository
  extends SqlRepository<Directory>
  implements IDirectoryRepository
{
  constructor(@InjectConnection() connection: Sequelize) {
    super(connection, Directory);
  }
}
