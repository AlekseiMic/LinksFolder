import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Link } from '../../models/link.model';
import { LinkService } from '../../services/link.service';
import { Response, Request } from 'express';
import { OptionalJwtAuthGuard } from 'auth/guards/optional-jwt-auth.guard';

type CreatePayload =
  | {
      links: { text?: string; url: string }[];
    }
  | {
      text?: string;
      url: string;
      links: undefined;
    };
const cookieSettings = {
  secure: false,
  httpOnly: true,
  maxAge: 1000 * 3600 * 60,
};
@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: 'link',
  version: '1',
})
export class LinkController {
  constructor(private service: LinkService) {}

  @Post()
  async create(
    @Body() data: CreatePayload,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ): Promise<{ result: Link | Link[]; code?: string }> {
    const { link, code, authToken } = await this.service.create(
      data?.links ?? data,
      undefined,
      undefined,
      req.cookies['tokenzy']
    );

    res.cookie('tokenzy', authToken, cookieSettings);
    return { result: link, code };
  }

  @Patch(':id')
  async edit(
    @Param('id') id: number,
    @Body() { url, text }: { text: string; url?: string },
    @Req() req: Request
  ): Promise<boolean> {
    const data: { text: string; link?: string } = { text };
    if (url) data.link = url;
    return this.service.edit(id, data, undefined, req.cookies['tokenzy']);
  }

  @Get(':code?')
  async find(
    @Req() req: Request,
    @Param('code') code?: string
  ): Promise<{
    list: null | { canEdit: boolean; list: Link[] };
    guestList: null | { code?: string; canEdit: boolean; list: Link[] };
  }> {
    return this.service.find(
      code,
      undefined,
      undefined,
      req.cookies['tokenzy']
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request): Promise<number> {
    const token = req.cookies['tokenzy'];
    const ids = id.split(',').map(Number);
    return this.service.delete(ids, false, undefined, token);
  }
}
