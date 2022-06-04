import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../user/user.model";
import { UserService } from "../user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "./jwt.service";
import { Session } from "./session.model";
import { SessionService } from "./session.service";

@Module({
  imports: [SequelizeModule.forFeature([User, Session])],
  providers: [AuthService, UserService, SessionService, JwtService],
  controllers: [AuthController]
})
export class AuthModule {}
