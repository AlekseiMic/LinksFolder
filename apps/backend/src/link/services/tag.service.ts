import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Tag } from "link/models/tag.model";

@Injectable()
export class TagService {

  constructor(@InjectModel(Tag) private readonly linkModel: typeof Tag) {}

  create(name: string): Promise<Tag> {
    return this.save(new Tag({ name }));
  }

  save(dir: Tag) {
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
