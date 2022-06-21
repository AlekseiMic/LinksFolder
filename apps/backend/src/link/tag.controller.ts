import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Tag } from './tag.model';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private service: TagService) {}

  @Post()
  async create(): Promise<number> {
    return 0;
  }

  @Patch()
  async edit(): Promise<boolean> {
    return false;
  }

  @Get()
  async find(): Promise<Tag> {
    return new Tag();
  }

  @Delete()
  async delete(): Promise<boolean> {
    return false;
  }
}
