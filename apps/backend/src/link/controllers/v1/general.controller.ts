import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { GuestToken } from 'auth/decorators/guest-token.decorator';
import { ReqUser } from 'auth/decorators/user.decorator';
import { OptionalJwtAuthGuard } from 'auth/guards/optional-jwt-auth.guard';
import { GeneralService } from 'link/services/general.service';
import { AuthUser } from 'auth/entities/user.model';
import { Response } from 'express';

@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: '',
  version: '1',
})
export class GeneralController {
  constructor(private service: GeneralService) {}

  @Post('init')
  async init(
    @Res({ passthrough: true }) res: Response,
    @GuestToken() token?: string,
    @ReqUser() user?: AuthUser
  ) {
    const result = await this.service.init(token, user, res);
    return result;
  }
}
