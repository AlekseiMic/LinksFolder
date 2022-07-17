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

@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: 'link',
  version: '1',
})
export class LinkController {
  constructor(private service: LinkService) {}

  @Post()
  async create(
    @Body() { text, url }: { text?: string, url: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ): Promise<{ result: Link; code?: string; }> {
    const token = req.cookies['token'];
    const data: { text?: string, url: string }  = { url };
    if (text) data.text = text;
    const { link, code, authToken } = await this.service.create(
      data,
      undefined,
      undefined,
      token
    );

    res.cookie('token', authToken, {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 3600 * 60,
    });
    return { result: link, code };
  }

  @Patch(':id')
  async edit(
    @Param('id') id: number,
    @Body() { url, name }: { name: string, url?: string },
    @Req() req: Request
  ): Promise<boolean> {
    const token = req.cookies['token'];
    const data: { name: string, link?: string } = { name };
    if (url) data.link = url;
    return this.service.rename(id, { url, name }, undefined, token);
  }

  @Get(':code?')
  async find(
    @Req() req: Request,
    @Param('code') code?: string,
  ): Promise<undefined | { list: Link[], code?: string}> {
    const token = req.cookies['token'];
    const result = this.service.find(code, undefined, undefined, token);
    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request): Promise<number> {
    const token = req.cookies['token'];
    const ids = id.split(',').map(Number);
    return this.service.delete(ids, false, undefined, token);
  }
}
