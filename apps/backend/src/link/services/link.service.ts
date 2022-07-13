import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Directory } from 'link/models/directory.model';
import { DirectoryToUser } from 'link/models/directory.to.user.model';
import { Link } from 'link/models/link.model';
import { User } from 'user/user.model';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link) private readonly linkModel: typeof Link,
    @InjectModel(DirectoryToUser)
    private readonly dirToUser: typeof DirectoryToUser
  ) {}

  async create(
    name: string,
    directory?: string,
    user?: User,
    token?: string
  ): Promise<{ link: Link; guestCode?: string; guestAuthToken?: string }> {
    let folder: null | number = null;
    let authToken = token;

    if (authToken) {
      const guestDir = await this.dirToUser.findOne({
        where: { authToken },
      });
      folder = guestDir?.directoryId ?? null;
    }

    if (!folder) {
      const newDirectory = new Directory({ name: 'GuestDir' });
      await newDirectory.save();
      folder = newDirectory.id;
    }

    const link = new Link({ directory: folder, url: name });
    await this.save(link);
    const code = '12nasdlasd';
    if (!user && !authToken) {
      authToken = 'asdasdasdjncc213213';

      const guestDirAccess = new DirectoryToUser({
        directory: folder,
        code,
        authToken,
        expiresIn: new Date(),
      });
      await guestDirAccess.save();
    }
    return { link, guestCode: code };
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
