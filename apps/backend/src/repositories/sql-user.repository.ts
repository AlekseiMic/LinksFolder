import { InjectConnection } from '@nestjs/sequelize';
import { SqlRepository } from './sql.repository';
import { User } from 'models';
import { Sequelize } from 'sequelize-typescript';
import { IUserRepository } from './interfaces/i-user.repository';

export class SqlUserRepository
  extends SqlRepository<User>
  implements IUserRepository
{
  constructor(@InjectConnection() connection: Sequelize) {
    super(connection, User);
  }
}
