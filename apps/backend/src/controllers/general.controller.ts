import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { GuestToken, ReqUser } from 'utils/decorators/';
import { OptionalJwtAuthGuard } from 'utils/guards/';
import { GeneralService } from 'services';
import { AuthUser } from 'models';
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
