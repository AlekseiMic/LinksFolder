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
}
