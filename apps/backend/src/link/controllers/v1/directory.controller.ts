import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Directory } from '../../models/directory.model';
import { DirectoryService } from '../../services/directory.service';

@UseGuards(AuthGuard('jwt'))
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
    @Param('id') id: number,
    @Body() { name }: { name: string }
  ): Promise<boolean> {
    return this.service.rename(id, name);
  }

  @Get(':id?')
  async find(@Param('id') id?: string): Promise<Directory[]> {
    const ids = id ? id.split(',').map(Number) : undefined;
    return this.service.find(ids);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<number> {
    const ids = id.split(',').map(Number);
    return this.service.delete(ids);
  }
}
