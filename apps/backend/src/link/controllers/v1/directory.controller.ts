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
import { Directory } from '../../models/directory.model';
import { DirectoryService } from '../../services/directory.service';
import { OptionalJwtAuthGuard } from 'auth/guards/optional-jwt-auth.guard';
import { GuestToken } from 'auth/decorators/guest-token.decorator';
import { Response } from 'express';
import { LinkDto } from 'link/dto/LinkDto';
import { ReqUser } from 'auth/decorators/user.decorator';
import { AuthUser } from 'user/user.model';

@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: 'directory',
  version: '1',
})
export class DirectoryController {
  constructor(private service: DirectoryService) {}

  @Post('/:id/link')
  async createLink(
    @Param('id') dir: number,
    @Body() links: LinkDto[],
    @GuestToken() token: string | undefined,
    @ReqUser() user?: AuthUser
  ) {
    return this.service.createLinks(dir, links, user, token);
  }

  @Post()
  async create(
    @Body() { name, parent }: { name: string; parent: number },
    @ReqUser() user?: AuthUser
  ): Promise<Directory | null> {
    return this.service.create(name, parent, user);
  }

  @Patch('/:id/access/:accessId')
  async editAccess(
    @Param('id') id: string | number,
    @Param('accessId') accessId: string | number,
    @Body()
    { name, code, extend }: { extend?: number; code?: string; name: string },
    @GuestToken() token: string | undefined,
    @ReqUser() user?: AuthUser
  ): Promise<{ result: boolean; code?: string }> {
    return this.service.edit(id, accessId, { name, code, extend }, user, token);
  }

  @Patch('/:id/merge/:dir')
  async mergeDirs(
    @GuestToken() token: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Param('dir') dir: string,
    @ReqUser() user?: AuthUser
  ): Promise<boolean> {
    return this.service.merge(res,Number(dir), Number(id), token, user);
  }

  @Get(':id?')
  async find(@Param('id') id?: string): Promise<Directory[]> {
    const ids = id ? id.split(',').map(Number) : undefined;
    return this.service.find(ids);
  }

  @Delete(':id')
  async delete(
    @GuestToken() token: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @ReqUser() user?: AuthUser
  ): Promise<boolean | number> {
    return this.service.delete(res, Number(id), token, user);
  }
}
