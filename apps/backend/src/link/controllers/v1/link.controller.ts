import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Link } from '../../models/link.model';
import { LinkService } from '../../services/link.service';

@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'link',
  version: '1',
})
export class LinkController {
  constructor(private service: LinkService) {}

  @Post()
  async create(@Body() { name }: { name: string }): Promise<Link | null> {
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
