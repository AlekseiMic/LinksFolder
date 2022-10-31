import { InjectConnection } from '@nestjs/sequelize';
import { SqlRepository } from './sql.repository';
import { Session } from 'models';
import { Sequelize } from 'sequelize-typescript';
import { ISessionRepository } from './interfaces/i-session.repository';

export class SqlSessionRepository
  extends SqlRepository<Session>
  implements ISessionRepository
{
  constructor(@InjectConnection() connection: Sequelize) {
    super(connection, Session);
  }
}
