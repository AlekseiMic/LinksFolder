import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { LinkModule } from 'link/link.module';
import { DirectoryService } from 'link/services/directory.service';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { Session } from './session.model';
import { SessionService } from './session.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [SequelizeModule.forFeature([User, Session]), PassportModule, LinkModule],
  providers: [
    AuthService,
    UserService,
    SessionService,
    DirectoryService,
    JwtService,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
