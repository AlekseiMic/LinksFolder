import { Injectable } from '@nestjs/common';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { SessionService } from './session.service';
import { JwtService } from './jwt.service';
import { Session } from './session.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private jwtService: JwtService
  ) {}

  async signup(username: string, password: string): Promise<{ user: User, session: Session, token: string }> {
    const user = await this.userService.create(username, password);
    const session = await this.sessionService.create(user);
    const token = this.jwtService.create({ id: user.id });
    return { user, session, token };
  }

  async signin(login: string, password: string): Promise<{ user: User, session: Session, token: string }> {
    const user = await this.userService.findByUsername(login);
    if (!user || !(await user.checkPassword(password)) ) throw new Error('User not found');
    const session = await this.sessionService.create(user);
    const token = this.jwtService.create({ id: user.id });
    return { user, session, token };
  }

  async refreshAccessToken(refreshToken: string) {
    const session = await this.sessionService.findByToken(refreshToken);
    if (!session) return null;
    const user = await this.userService.findById(session.userId);
    if (!user) return null;
    const token = this.jwtService.create({ id: user.id });
    return { user, session, token };
  }

  async logout(refreshToken: string) {
    const result = await this.sessionService.removeByToken(refreshToken);
    return result;
  }
}