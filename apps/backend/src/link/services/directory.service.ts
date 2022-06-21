import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Directory } from 'link/models/directory.model';

@Injectable()
export class DirectoryService {
  constructor(
    @InjectModel(Directory) private readonly dirModel: typeof Directory
  ) {}

  create(name: string): Promise<Directory> {
    return this.save(new Directory({ name }));
  }

  save(dir: Directory) {
    return dir.save();
  }

  async rename(id: number, name: string) {
    const result = await this.dirModel.update({ name }, { where: { id } });
    return result[0] === 1;
  }

  async find(id?: number[]) {
    if (id) return this.dirModel.findAll({ where: { id } });
    return this.dirModel.findAll();
  }

  async delete(id: number | number[]) {
    const result = await this.dirModel.destroy({ where: { id }});
    return result;
  }
}
