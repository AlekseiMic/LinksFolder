import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Link } from 'link/models/link.model';

@Injectable()
export class LinkService {
  constructor(@InjectModel(Link) private readonly linkModel: typeof Link) {}

  create(name: string): Promise<Link> {
    return this.save(new Link({ name }));
  }

  save(dir: Link) {
    return dir.save();
  }

  async rename(id: number, name: string) {
    const result = await this.linkModel.update({ name }, { where: { id } });
    return result[0] === 1;
  }

  async find(id?: number[]) {
    if (id) return this.linkModel.findAll({ where: { id } });
    return this.linkModel.findAll();
  }

  async delete(id: number | number[]) {
    const result = await this.linkModel.destroy({ where: { id } });
    return result;
  }
}
