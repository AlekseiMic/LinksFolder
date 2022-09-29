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
import { LinkService } from '../../services/link.service';
import { OptionalJwtAuthGuard } from 'auth/guards/optional-jwt-auth.guard';
import { GuestToken } from 'auth/decorators/guest-token.decorator';
import { ReqUser } from 'auth/decorators/user.decorator';
import { AuthUser } from 'user/user.model';
import { GuestService } from 'link/services/guest.service';
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
    @GuestToken() token: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @Param('code') code?: string,
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

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GuestToken() token: string | undefined,
    @ReqUser() user?: AuthUser
  ): Promise<number | number[]> {
    const ids = id.split(',').map(Number);
    return this.service.delete(ids, user, token);
  }
}
