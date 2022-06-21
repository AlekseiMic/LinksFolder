import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Link } from './link.model';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Post()
  async create(): Promise<number> {
    return 0;
  }

  @Patch()
  async edit(): Promise<boolean> {
    return false;
  }

  @Get()
  async find(): Promise<Link> {
    return new Link();
  }

  @Delete()
  async delete(): Promise<boolean> {
    return false;
  }
}
