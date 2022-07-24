import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Directory } from 'link/models/directory.model';
import { DirectoryToUser } from 'link/models/directory.to.user.model';
import { Link } from 'link/models/link.model';
import { User } from 'user/user.model';
import { nanoid } from 'nanoid';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link) private readonly linkModel: typeof Link,
    @InjectModel(DirectoryToUser)
    private readonly dirToUser: typeof DirectoryToUser
  ) {}

  async create(
    data: { url: string; text?: string },
    directory?: string,
    user?: User,
    token?: string
  ): Promise<{ link: Link; code?: string; authToken?: string }> {
    let folder: null | number = null;
    let authToken = token;
    let code = nanoid(5);

    if (authToken) {
      const guestDir = await this.dirToUser.findOne({
        where: { authToken },
      });
      folder = guestDir?.directoryId ?? null;
      code = guestDir?.code ?? code;
    }

    if (!folder) {
      const newDirectory = new Directory({ name: 'GuestDir' });
      await newDirectory.save();
      folder = newDirectory.id;
      authToken = undefined;
    }

    const link = new Link({ directory: folder, ...data });
    await link.save();

    if (!user && !authToken) {
      authToken = nanoid(16);

      const guestDirAccess = new DirectoryToUser({
        directoryId: folder,
        code,
        authToken,
        expiresIn: new Date(),
      });
      await guestDirAccess.save();
    }

    return { link, code, authToken };
  }

  async rename(
    id: number,
    data: { text: string; url?: string },
    user?: User,
    token?: string
  ) {
    if (token) {
      const guestDir = await this.dirToUser.findOne({
        where: { authToken: token },
      });
      if (!guestDir) throw new NotFoundException('Id not found');
      const result = await this.linkModel.update(data, {
        where: {
          id,
          directory: guestDir?.directoryId,
        },
      });
      return result[0] > 0;
    }
    const result = await this.linkModel.update(data, { where: { id } });
    return result[0] > 0;
  }

  async find(code?: string, dir?: number, user?: User, token?: string) {
    if (code) {
      const dir = await this.dirToUser.findOne({
        where: { code },
      });
      if (!dir || !dir.directoryId) return { list: [] };
      const result = await this.linkModel.findAll({
        where: { directory: dir.directoryId },
      });
      return { list: result, code };
    }

    if (token) {
      const dir = await this.dirToUser.findOne({ where: { authToken: token } });
      if (!dir || !dir.directoryId) return { list: [] };
      const result = await this.linkModel.findAll({
        where: { directory: dir.directoryId },
      });
      return { canEdit: true, list: result, code: dir?.code };
    }

    if (!user) return { list: [] };

    return {
      list: await this.linkModel.findAll({ where: { userId: user.id } }),
    };
  }

  async delete(
    id: number | number[],
    isDir = false,
    user?: User,
    token?: string
  ) {
    if (!user && !token) throw new ForbiddenException('No rights');
    if (token) {
      const dir = await this.dirToUser.findOne({ where: { authToken: token } });
      if (!dir) throw new NotFoundException('Id not found');
      const result = await this.linkModel.destroy({
        where: {
          id,
          directory: dir?.directoryId,
        },
      });
      return result;
    }

    const result = await this.linkModel.destroy({ where: { id } });
    return result;
  }
}
