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
import { Tag } from '../../models/tag.model';
import { TagService } from '../../services/tag.service';

@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'tag',
  version: '1',
})
export class TagController {
  constructor(private service: TagService) {}

  @Post()
  async create(@Body() { name }: { name: string }): Promise<Tag | null> {
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
  async find(@Param('id') id?: string): Promise<Tag[]> {
    const ids = id ? id.split(',').map(Number) : undefined;
    return this.service.find(ids);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<number> {
    const ids = id.split(',').map(Number);
    return this.service.delete(ids);
  }
}
