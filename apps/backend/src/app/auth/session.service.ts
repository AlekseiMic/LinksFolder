import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "../user/user.model";
import { Session } from "./session.model";
import { v4 }  from 'uuid';

@Injectable()
export class SessionService {

  constructor(@InjectModel(Session) private readonly sessionModel: typeof Session) {}

  async create(user: User): Promise<Session> {
    const session = new Session();
    session.userId = user.id;
    session.token = v4();
    await session.save();
    return session;
  }

}