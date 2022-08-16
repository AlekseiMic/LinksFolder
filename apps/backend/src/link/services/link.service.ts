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
import * as dayjs from 'dayjs';

type LinkList = {
  list: Link[];
  canEdit: boolean;
  code?: string;
};

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link) private readonly linkModel: typeof Link,
    @InjectModel(DirectoryToUser)
    private readonly dirToUser: typeof DirectoryToUser
  ) {}

  async create(
    data: { url: string; text?: string } | { url: string; text?: string }[],
    directory?: string,
    user?: User,
    token?: string
  ): Promise<{ link: Link | Link[]; code?: string; authToken?: string }> {
    let folder: null | number = null;
    let authToken = token;
    let code = nanoid(5);

    if (token) {
      const guestDir = await this.dirToUser.findOne({
        where: { authToken: token },
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

    const saveLink = async (linkData: { url: string; text?: string }) => {
      const link = new Link({ directory: folder, ...linkData });
      return link.save();
    };

    let result: Link | Link[];

    if (Array.isArray(data)) {
      result = await Promise.all(data.map(saveLink));
    } else {
      result = await saveLink({ url: data.url, text: data.text });
    }

    if (!user && !authToken) {
      authToken = nanoid(16);

      const guestDirAccess = new DirectoryToUser({
        directoryId: folder,
        code,
        authToken,
        expiresIn: dayjs().add(25, 'minutes'),
      });
      await guestDirAccess.save();
    }

    return { link: result, code, authToken };
  }

  async edit(
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
    const queries: Promise<null | LinkList>[] = [this.getUserLinks(user)];
    if (code) queries.push(this.getLinksByCode(code, token));
    else if (token) queries.push(this.getLinksByToken(token));
    const [list, guestList] = await Promise.all(queries);
    return { list, guestList };
  }

  async getLinksByCode(code: string, token?: string) {
    const dir = await this.dirToUser.findOne({ where: { code } });
    if (!dir) return null;
    const isExpired = dir.expiresIn.getTime() < Date.now();
    if (isExpired && token !== dir.authToken) return null;
    const result = await this.linkModel.findAll({
      where: { directory: dir.directoryId },
    });
    return { list: result, canEdit: token === dir.authToken, code };
  }

  async getLinksByToken(token: string) {
    const dir = await this.dirToUser.findOne({ where: { authToken: token } });
    if (!dir) return null;
    const result = await this.linkModel.findAll({
      where: { directory: dir.directoryId },
    });
    return { canEdit: true, list: result, code: dir?.code };
  }

  async getUserLinks(user?: User) {
    if (!user) return null;
    const result = await this.linkModel.findAll({ where: { userId: user.id } });
    return { list: result, canEdit: true };
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
