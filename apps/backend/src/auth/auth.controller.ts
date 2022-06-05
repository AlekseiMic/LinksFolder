import { Controller, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request as Req } from 'express';
import { User } from "../user/user.model";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async singup(@Request() req: Req): Promise<{ user: User, token: string }> {
    const { username, password } = req.body;
    const { user, token, session } = await this.authService.signup(username, password);
    return { user, token };
  }

  @Post('signin')
  async signin(@Request() req: Req): Promise<{ user: User, token: string}> {
    const { username, password } = req.body;
    const result = await this.authService.signin(username, password);
    const { user, token, session } = result;
    return { user, token };
  }

  @Post('logout')
  async logout(): Promise<boolean> {
    return true;
  }
}
