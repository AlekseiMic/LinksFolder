import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.model';
import { Session } from '../entities/session.model';
import { v4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session) private readonly sessionModel: typeof Session
  ) {}

  async create(user: User): Promise<Session> {
    const session = new Session();
    session.createdBy = user.id;
    session.token = v4();
    await session.save();
    return session;
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = await this.sessionModel.findOne({ where: { token } });
    return session;
  }

  async removeByToken(token: string): Promise<boolean> {
    const result = await this.sessionModel.destroy({ where: { token }});
    return result !== 0;
  }
}
