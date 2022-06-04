import { Controller, Post, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request as Req } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async singup(@Request() req: Req): Promise<boolean> {
    const { username, password } = req.body;
    const result = await this.authService.signup(username, password);
    return result;
  }

  @Post('signin')
  async signin(@Request() req: Req): Promise<boolean> {
    const { username, password } = req.body;
    const result = await this.authService.signin(username, password);
    return result;
  }

  @Post('logout')
  async logout(@Request() req: Req): Promise<boolean> {
    console.log(req);
    return true;
  }
}
