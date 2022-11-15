import multer from 'multer';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Directory, AuthUser } from 'models';
import { DirectoryService } from 'services';
import { JwtAuthGuard, OptionalJwtAuthGuard } from 'utils/guards/';
import { Response } from 'express';
import { LinkDto } from 'dto';
import { ReqUser, GuestToken } from 'utils/decorators/';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JsonValidationPipe } from 'utils/pipes/json-validation.pipe';

@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: 'directory',
  version: '1',
})
export class DirectoryController {
  constructor(private service: DirectoryService) {}

  @Post('/:id/link')
  @UseInterceptors(FilesInterceptor('file[]'))
  async createLink(
    @Param('id') dir: string,
    @Body() links: LinkDto[],
    @GuestToken() token: string | undefined,
    @ReqUser() user?: AuthUser,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new JsonValidationPipe({})],
      })
    )
    files?: Express.Multer.File[]
  ) {
    if (files && files.length > 0) {
      if (!user) throw new ForbiddenException('Not authorized');
      return this.service.importFiles(Number(dir), files, user);
    }
    return this.service.createLinks(Number(dir), links, user, token);
  }

  @Post()
  async create(
    @Body() { name, parent }: { name: string; parent: number },
    @ReqUser() user?: AuthUser
  ): Promise<Directory | null> {
    return this.service.create(name, parent, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async editDir(
    @Body() { name, parent }: { name?: string; parent?: number },
    @Param('id') id: string,
    @ReqUser() user: AuthUser
  ): Promise<boolean> {
    return this.service.edit(Number(id), { name, parent }, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:dir/access/:id')
  async deleteAccess(
    @Param('dir') dir: string,
    @Param('id') id: string,
    @ReqUser() user: AuthUser
  ) {
    return this.service.deleteAccess(Number(dir), Number(id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/access')
  async addAccess(
    @Param('id') dir: string,
    @Body()
    {
      code,
      username,
      expiresIn,
    }: { code?: string; username?: string; expiresIn: Date },
    @ReqUser() user: AuthUser
  ) {
    return this.service.addAccessRule(
      Number(dir),
      { code, username, expiresIn },
      user
    );
  }

  @Patch('/:id/access/:accessId')
  async editAccess(
    @Param('id') id: string | number,
    @Param('accessId') accessId: string | number,
    @Body()
    {
      username,
      code,
      extend,
      expiresIn,
    }: { expiresIn?: Date; extend?: number; code?: string; username: string },
    @GuestToken() token: string | undefined,
    @ReqUser() user?: AuthUser
  ) {
    return this.service.editAccess(
      id,
      accessId,
      { username, code, extend, expiresIn },
      user,
      token
    );
  }

  @Patch('/:id/merge/:dir')
  async mergeDirs(
    @GuestToken() token: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Param('dir') dir: string,
    @ReqUser() user?: AuthUser
  ): Promise<boolean> {
    return this.service.merge(res, Number(dir), Number(id), token, user);
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
  ): Promise<Record<number, boolean>> {
    const ids = id.split(',').map(Number);
    if (ids.length === 1) {
      return { [id]: await this.service.delete(ids[0], res, token, user) };
    }
    return this.service.deleteMany(ids, user);
  }
}
