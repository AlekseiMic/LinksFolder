import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { Directory } from './directory.model';
import { DirectoryService } from './directory.service';

@Controller('directory')
export class DirectoryController {
  constructor(private service: DirectoryService) {}

  @Post()
  async create(): Promise<number> {
    return 0;
  }

  @Patch()
  async edit(): Promise<boolean> {
    return false;
  }

  @Get()
  async find(): Promise<Directory> {
    return new Directory();
  }

  @Delete()
  async delete(): Promise<boolean> {
    return false;
  }
}
