import { Controller, HttpException, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, CookieOptions } from 'express';
import { User } from '../user/user.model';

const refreshCookieOptions: CookieOptions = {
  secure: true,
  sameSite: 'none',
  maxAge: 100 * 24 * 3600000,
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async singup(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ user: User; token: string }> {
    const { username, password } = req.body;
    const { user, token, session } = await this.authService.signup(
      username,
      password
    );
    response.cookie('refreshToken', session.token, refreshCookieOptions);
    return { user, token };
  }

  @Post('signin')
  async signin(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ user: User; token: string }> {
    const { username, password } = req.body;
    const result = await this.authService.signin(username, password);
    const { user, token, session } = result;
    response.cookie('refreshToken', session.token, refreshCookieOptions);
    return { user, token };
  }

  @Post('refresh')
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ user: User; token: string }> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new HttpException('Unauthorized', 401);
    const result = await this.authService.refreshAccessToken(refreshToken);
    if (!result) throw new HttpException('Unauthorized', 401);
    const { user, token, session } = result;
    response.cookie('refreshToken', session.token, refreshCookieOptions);
    return { user, token };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<boolean> {
    await this.authService.logout(req.cookies['refreshToken']);
    response.clearCookie('refreshToken', refreshCookieOptions);
    return true;
  }
}
