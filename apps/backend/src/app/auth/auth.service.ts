import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { SessionService } from './session.service';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private jwtService: JwtService
  ) {}

  async signup(username: string, password: string): Promise<boolean> {
    const user = await this.userService.create(username, password);
    // const session = await this.sessionService.create(user);
    // const token = this.jwtService.create({ id: user.id });
    return true;
  }

  async signin(login: string, password: string): Promise<boolean> {
    const user = await this.userService.findByUsername(login);
    if (!user) return false;
    return user.checkPassword(password);
  }

  async validateUser(login: string, password: string): Promise<User> {
    return new User();
  }
}
