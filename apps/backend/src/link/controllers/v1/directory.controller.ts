import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Directory } from '../../models/directory.model';
import { DirectoryService } from '../../services/directory.service';
import { OptionalJwtAuthGuard } from 'auth/guards/optional-jwt-auth.guard';
import { GuestToken } from 'auth/decorators/guest-token.decorator';

@UseGuards(OptionalJwtAuthGuard)
@Controller({
  path: 'directory',
  version: '1',
})
export class DirectoryController {
  constructor(private service: DirectoryService) {}

  @Post()
  async create(@Body() { name }: { name: string }): Promise<Directory | null> {
    return this.service.create(name);
  }

  @Patch(':id')
  async edit(
    @Param('id') id: string | number,
    @Body()
    { name, code, extend }: { extend?: number; code?: string; name: string },
    @GuestToken() token: string | undefined
  ): Promise<{ result: boolean; code?: string }> {
    return this.service.edit(id, { name, code, extend }, undefined, token);
  }

  @Get(':id?')
  async find(@Param('id') id?: string): Promise<Directory[]> {
    const ids = id ? id.split(',').map(Number) : undefined;
    return this.service.find(ids);
  }

  @Delete(':id?')
  async delete(
    @GuestToken() token: string | undefined,
    @Param('id') id?: string
  ): Promise<number> {
    const ids = id?.split(',').map(Number);
    return this.service.delete(ids, token);
  }
}
