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
import { AuthGuard } from '@nestjs/passport';
import { Link } from '../../models/link.model';
import { LinkService } from '../../services/link.service';
import { Response, Request } from 'express';

@Controller({
  path: 'link',
  version: '1',
})
export class LinkController {
  constructor(private service: LinkService) {}

  @Post()
  async create(
    @Body() { name }: { name: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ): Promise<{ result: boolean; guestCode?: string; guestAuthToken?: string }> {
    const token = req.cookies['token'];
    const { link, guestCode, guestAuthToken } = await this.service.create(
      name,
      undefined,
      undefined,
      token
    );

    res.cookie('token', guestAuthToken, {
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 3600 * 60,
    });
    return { result: !!link, guestCode };
  }

  @Patch(':id')
  async edit(
    @Param('id') id: number,
    @Body() { name }: { name: string }
  ): Promise<boolean> {
    return this.service.rename(id, name);
  }

  @Get(':id?')
  async find(@Param('id') id?: string): Promise<Link[]> {
    const ids = id ? id.split(',').map(Number) : undefined;
    return this.service.find(ids);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<number> {
    const ids = id.split(',').map(Number);
    return this.service.delete(ids);
  }
}
