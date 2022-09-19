import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Directory } from 'link/models/directory.model';
import { DirectoryToUser } from 'link/models/directory.to.user.model';
import { AuthUser, User } from 'user/user.model';
import * as dayjs from 'dayjs';
import { DestroyOptions, Op } from 'sequelize';
import { GuestService } from './guest.service';
import { Response } from 'express';
import { NestedSetsSequelizeHelper } from 'common/services/nested-sets-sequelize.service';
import { IDirectoryRepository } from 'link/repositories/interfaces/i.directory.repository';
import { nanoid } from 'nanoid';
import { LinkDto } from 'link/dto/LinkDto';
import { Link } from 'link/models/link.model';

@Injectable()
export class DirectoryService {
  async createLinks(
    dirId: number,
    links: LinkDto[],
    user?: AuthUser,
    token?: string
  ) {
    if (!(await this.hasAccess(dirId, user, token))) {
      throw new ForbiddenException();
    }

    const result = await Promise.all(
      links.map(({ url, text }) =>
        this.linkModel.create({ url, text, directory: dirId })
      )
    );

    return result;
  }

  async hasAccess(dirId: number, user?: AuthUser, token?: string) {
    const userCond = {
      userId: user
        ? {
            [Op.or]: [{ [Op.eq]: user.id }, { [Op.eq]: null }],
          }
        : {
            [Op.eq]: null,
          },
    };
    const expireCond = {
      ...(!user && token
        ? {
            [Op.or]: [
              { expiresIn: { [Op.gte]: Date.now() } },
              { authToken: token },
            ],
          }
        : {
            expiresIn: { [Op.gte]: Date.now() },
          }),
    };
    const dir = await this.repo.findOne({
      include: [
        {
          required: false,
          model: DirectoryToUser,
          where: {
            ...userCond,
            ...expireCond,
          },
        },
      ],
      where: { id: dirId },
    });

    if (!dir) throw new NotFoundException();
    let hasAccess = dir.author === user?.id;
    if (!hasAccess) {
      hasAccess = !!dir.directoryToUsers.find(
        (a) => a.userId === user?.id || a.authToken === token
      );
    }
    return hasAccess;
  }

  constructor(
    @Inject('IDirectoryRepository') private repo: IDirectoryRepository,
    @InjectModel(Link) private readonly linkModel: typeof Link,
    @InjectModel(DirectoryToUser)
    private readonly dirToUser: typeof DirectoryToUser,
    private guestService: GuestService,
    private readonly nsHelper: NestedSetsSequelizeHelper
  ) {}

  async createGuestDir() {
    const directory = await this.create('GuestDir', null);
    const access = await this.createGuestAccess(
      directory.id,
      dayjs().add(60, 'minutes').toDate()
    );
    return { directory, access };
  }

  async findDirByToken(token: string) {
    const dir = await this.dirToUser.findOne({
      where: { authToken: token },
    });
    return dir;
  }

  async findDirByCode(code: string) {
    const dir = await this.dirToUser.findOne({
      where: { code },
    });
    return dir;
  }

  async createGuestAccess(directoryId: number, expiresIn: Date) {
    const access = new DirectoryToUser({
      directoryId,
      code: nanoid(5),
      authToken: nanoid(16),
      expiresIn,
    });
    return access.save();
  }

  async create(
    name: string,
    parent: null | number,
    user?: AuthUser
  ): Promise<Directory> {
    const dir = new Directory({ name });
    if (user) dir.author = user.id;
    if (!parent) return this.nsHelper.makeRoot(this.repo, dir);
    if (!(await this.hasAccess(parent, user))) throw new NotFoundException();
    return this.nsHelper.append(this.repo, dir, parent);
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
    if (id) return this.repo.findAll({ where: { id } });
    return this.repo.findAll();
  }

  async delete(res: Response, id?: number | number[], authToken?: string) {
    this.guestService.removeCookie(res);
    const condition: DestroyOptions = { where: { id } };
    if (!id && !authToken) return 0;
    if (!id && authToken) {
      const directory = await this.dirToUser.findOne({ where: { authToken } });
      if (!directory) return 0;
      condition.where = { id: directory.directoryId };
      this.guestService.removeCookie(res);
      console.log('whut');
    }
    const result = await this.repo.removeAll(condition);
    return result;
  }
}
