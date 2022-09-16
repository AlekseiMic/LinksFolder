import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LinkService } from '../../services/link.service';
import { Response } from 'express';
import { OptionalJwtAuthGuard } from 'auth/guards/optional-jwt-auth.guard';
import { GuestToken } from 'auth/decorators/guest-token.decorator';
import { GuestService } from 'link/services/guest.service';

type CreatePayload =
  | {
      links: { text?: string; url: string }[];
    }
  | {
      text?: string;
      url: string;
      links: undefined;
    };

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

  @Post()
  async create(
    @Body() data: CreatePayload,
    @Res({ passthrough: true }) res: Response,
    @GuestToken() token: string | undefined
  ) {
    const { link, code, authToken } = await this.service.create(
      data?.links ?? data,
      undefined,
      undefined,
      token
    );

    if (authToken) {
      this.guestService.setCookie(res.cookie, authToken);
    }

    return { result: link, code };
  }

  @Patch(':id')
  async edit(
    @Param('id') id: number,
    @Body() { url, text }: { text: string; url?: string },
    @GuestToken() token: string | undefined
  ) {
    const data: { text: string; link?: string } = { text };
    if (url) data.link = url;
    return this.service.edit(id, data, undefined, token);
  }

  @Get(':code?')
  async find(
    @GuestToken() token: string | undefined,
    @Param('code') code?: string
  ) {
    return this.service.find(code, undefined, undefined, token);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GuestToken() token: string | undefined
  ): Promise<number> {
    const ids = id.split(',').map(Number);
    return this.service.delete(ids, false, undefined, token);
  }
}
