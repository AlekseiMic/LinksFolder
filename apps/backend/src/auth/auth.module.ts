import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { LinkModule } from 'link/link.module';
import { DirectoryService } from 'link/services/directory.service';
import { User } from './entities/user.model';
import { UserService } from './services/user.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { Session } from './entities/session.model';
import { SessionService } from './services/session.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Session]),
    PassportModule,
    LinkModule,
  ],
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
