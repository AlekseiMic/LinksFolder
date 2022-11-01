import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LinkService, GuestService } from 'services';
import { OptionalJwtAuthGuard } from 'utils/guards/optional-jwt-auth.guard';
import { GuestToken, ReqUser } from 'utils/decorators/';
import { AuthUser } from 'models';
import { Response } from 'express';

@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: 'link',
  version: '1',
})
export class LinkController {
  constructor(
    private service: LinkService,
    private guestService: GuestService
  ) {}

  @Patch(':id')
  async edit(
    @Param('id') id: number,
    @Body() { url, text }: { text: string; url?: string },
    @GuestToken() token: string | undefined,
    @ReqUser() user?: AuthUser
  ) {
    const data: { text: string; url?: string } = { text };
    if (url) data.url = url;
    return this.service.edit(id, data, user, token);
  }

  @Get(':code?')
  async find(
    @Res({ passthrough: true }) res: Response,
    @Param('code') code?: string,
    @GuestToken() token?: string,
    @ReqUser() user?: AuthUser
  ) {
    try {
      const result = await this.service.find(code, user, token);
      return result;
    } catch (error) {
      this.guestService.removeCookie(res);
      throw error;
    }
  }

  @Patch(':id/directory/:dir')
  async moveLinks(
    @Param('id') id: string,
    @Param('dir') dir: string,
    @ReqUser() user?: AuthUser
  ) {
    const ids = id.split(',').map(Number);
    return this.service.move(ids, Number(dir), user);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GuestToken() token: string | undefined,
    @ReqUser() user?: AuthUser
  ) {
    const ids = id.split(',').map(Number);
    return this.service.delete(ids, user, token);
  }
}
