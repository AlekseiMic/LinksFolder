import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthUser, User, Session } from 'models';
import { JwtService } from './jwt.service';
import { SessionService } from './session.service';
import { UserService } from './user.service';
import { DirectoryService } from './directory.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private jwtService: JwtService,
    private dirService: DirectoryService
  ) {}

  async signup(
    username: string,
    password: string
  ): Promise<{ user: User; session: Session; token: string }> {
    try {
      const user = await this.userService.create(username, password);
      const session = await this.sessionService.create(user);
      const authUser: AuthUser = { name: user.username, id: user.id };
      const token = this.jwtService.create(authUser);
      await this.dirService.create('Base', null, authUser);
      return { user, session, token };
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException({ code: 'NOT_UNIQUE_LOGIN' });
      }
      throw error;
    }
  }

  async signin(
    login: string,
    password: string
  ): Promise<{ user: User; session: Session; token: string }> {
    const user = await this.userService.findByUsername(login);
    const isValidUser = user && (await user.checkPassword(password));
    if (!isValidUser) throw new ForbiddenException({ code: 'USER_NOT_FOUND' });
    const session = await this.sessionService.create(user);
    const token = this.jwtService.create({ name: user.username, id: user.id });
    return { user, session, token };
  }

  async refreshAccessToken(refreshToken: string) {
    const session = await this.sessionService.findByToken(refreshToken);
    if (!session) return null;
    const user = await this.userService.findById(session.createdBy);
    if (!user) return null;
    const token = this.jwtService.create({ name: user.username, id: user.id });
    return { user, session, token };
  }

  async logout(refreshToken: string) {
    const result = await this.sessionService.removeByToken(refreshToken);
    return result;
  }
}
