import { InjectConnection } from '@nestjs/sequelize';
import { SqlRepository } from './sql.repository';
import { Link } from 'models';
import { Sequelize } from 'sequelize-typescript';
import { ILinkRepository } from './interfaces/i-link.repository';

export class SqlLinkRepository
  extends SqlRepository<Link>
  implements ILinkRepository
{
  constructor(@InjectConnection() connection: Sequelize) {
    super(connection, Link);
  }

  async sortLinksInDirectory(dir: number): Promise<[unknown[], unknown]> {
    return this.connection.query(
      'SET @i=0; UPDATE Links SET sort=@i:=@i+1 WHERE `directoryId`= ? order by sort ASC;',
      { replacements: [dir] }
    );
  }
}
