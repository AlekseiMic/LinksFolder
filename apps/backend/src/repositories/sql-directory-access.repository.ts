import { InjectConnection } from '@nestjs/sequelize';
import { SqlRepository } from './sql.repository';
import { DirectoryAccess } from 'models';
import { Sequelize } from 'sequelize-typescript';
import { IDirectoryAccessRepository } from './interfaces/i-directory-access.repository';

export class SqlDirectoryAccessRepository
  extends SqlRepository<DirectoryAccess>
  implements IDirectoryAccessRepository
{
  constructor(@InjectConnection() connection: Sequelize) {
    super(connection, DirectoryAccess);
  }
}
