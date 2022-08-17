import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Directory } from 'link/models/directory.model';
import { DirectoryToUser } from 'link/models/directory.to.user.model';
import { User } from 'user/user.model';
import * as dayjs from 'dayjs';

@Injectable()
export class DirectoryService {
  constructor(
    @InjectModel(Directory) private readonly dirModel: typeof Directory,
    @InjectModel(DirectoryToUser)
    private readonly dirToUser: typeof DirectoryToUser
  ) {}

  create(name: string): Promise<Directory> {
    return this.save(new Directory({ name }));
  }

  save(dir: Directory) {
    return dir.save();
  }

  async edit(
    id: string | number,
    { name, code, extend }: { code?: string; name?: string; extend?: number },
    user?: User,
    authToken?: string
  ) {
    if (!authToken) return { result: false };
    const result = await this.dirToUser.update(
      {
        expiresIn: dayjs().add(extend ?? 25, 'minutes'),
        ...(code ? { code } : {}),
      },
      { where: { authToken } }
    );
    return { result: result[0] === 1, code };
  }

  async find(id?: number[]) {
    if (id) return this.dirModel.findAll({ where: { id } });
    return this.dirModel.findAll();
  }

  async delete(id: number | number[]) {
    const result = await this.dirModel.destroy({ where: { id } });
    return result;
  }
}
