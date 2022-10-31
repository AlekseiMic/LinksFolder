import { Inject, Injectable } from '@nestjs/common';
import { User, Session } from 'models';
import { ISessionRepository, SESSION_REPOSITORY } from 'repositories';
import { v4 } from 'uuid';

@Injectable()
export class SessionService {
  @Inject(SESSION_REPOSITORY) private readonly repo: ISessionRepository;

  async create(user: User): Promise<Session> {
    const session = new Session();
    session.createdBy = user.id;
    session.token = v4();
    return this.repo.save(session);
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = await this.repo.findOne({ where: { token } });
    return session;
  }

  async removeByToken(token: string): Promise<boolean> {
    const result = await this.repo.removeAll({ where: { token } });
    return result !== 0;
  }
}
