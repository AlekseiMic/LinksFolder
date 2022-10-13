import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
  async deleteAccess(dir: number, access: number, user?: AuthUser) {
    if (!user) return false;
    const result = await this.dirToUser.destroy({
      where: { directoryId: dir, id: access, createdBy: user.id },
    });
    return result >= 1;
  }

  async createLinks(
    dirId: number,
    links: LinkDto[],
    user?: AuthUser,
    token?: string
  ) {
    if (!(await this.hasAccess(dirId, user, token))) {
      throw new ForbiddenException();
    }

    const maxOrderLink = await this.linkModel.findOne({
      where: { directory: dirId },
      order: [['sort', 'DESC']],
    });

    const maxOrder = maxOrderLink?.sort ?? 0;

    const result = await Promise.all(
      links.map(({ url, text }, idx) =>
        this.linkModel.create({
          url,
          text,
          userId: user?.id,
          directory: dirId,
          sort: maxOrder + idx + 1,
        })
      )
    );

    return result;
  }

  async addAccessRule(
    dir: number,
    values: {
      code: string | undefined;
      username: string | undefined;
      expiresIn: Date;
    },
    user?: AuthUser
  ) {
    if (!user) throw new ForbiddenException();
    const expiresIn = dayjs(values.expiresIn).toDate();
    let code = values.code;
    let userId: number | undefined;
    if (values.username) {
      code = undefined;
      userId = (
        await this.userModel.findOne({ where: { username: values.username } })
      )?.id;
      if (!userId) throw new NotFoundException();
    }
    if (userId && userId === user.id) return false;
    const access = new DirectoryToUser({
      createdBy: user.id,
      directoryId: dir,
      userId,
      code,
      expiresIn,
    });
    const result = await access.save();
    if (!result) throw new InternalServerErrorException();
    return {
      result: true,
      code: {
        id: access.id,
        code: access.code,
        username: values.username,
        owned: access.createdBy === user.id,
        updatedAt: access.updatedAt,
        expiresIn: access.expiresIn,
      },
    };
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
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(DirectoryToUser)
    private readonly dirToUser: typeof DirectoryToUser,
    private guestService: GuestService,
    private readonly nsHelper: NestedSetsSequelizeHelper
  ) {}

  async merge(
    res: Response,
    dir: number,
    id: number,
    token: string,
    user?: AuthUser
  ): Promise<boolean> {
    if (!user) throw new ForbiddenException();

    const [item, target] = await Promise.all([
      this.repo.findOne({
        where: { id: dir },
        include: [
          {
            model: DirectoryToUser,
            required: false,
            where: { authToken: token },
          },
        ],
      }),
      this.repo.findOne({ where: { id, author: user.id } }),
    ]);

    if (!item || !target) return false;
    if (item.author === null && item.directoryToUsers.length > 0) {
      item.author = user.id;
      await this.repo.save(item);
      await this.linkModel.update(
        { userId: user.id },
        { where: { directory: item.id } }
      );
      await this.dirToUser.update(
        { userId: user.id },
        { where: { directoryId: item.id } }
      );
    }
    if (item.author !== user.id) throw new NotFoundException();
    const result = await this.nsHelper.moveTo(this.repo, item, target);
    if (result) {
      this.guestService.removeCookie(res);
    }
    return result;
  }

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
    accessId: string | number,
    {
      username,
      code,
      extend,
      expiresIn,
    }: { code?: string; expiresIn?: Date; username?: string; extend?: number },
    user?: AuthUser,
    authToken?: string
  ) {
    const access = await this.dirToUser.findOne({ where: { id: accessId } });
    if (!access) throw new NotFoundException();
    if (authToken !== access.authToken && user?.id !== access.createdBy) {
      throw new ForbiddenException();
    }
    if (expiresIn) {
      access.expiresIn = dayjs(expiresIn).toDate();
    } else if (extend) {
      access.expiresIn = dayjs().add(extend, 'minutes').toDate();
    }
    if (code) access.code = code;
    if (username) {
      code = undefined;
      access.userId = (
        await this.userModel.findOne({ where: { username } })
      )?.id;
      if (!access.userId) throw new NotFoundException();
      if (access.userId === user?.id) return { result: false };
    } else if (username === null) {
      access.userId = undefined;
    }
    if (!access.userId && !access.code) {
      access.code = nanoid(5);
    }
    const result = await access.save();
    return {
      result: !!result,
      code: access.code,
      updatedAt: access.updatedAt,
      username,
      expiresIn: access.expiresIn,
    };
  }

  async find(id?: number[]) {
    if (id) return this.repo.findAll({ where: { id } });
    return this.repo.findAll();
  }

  async delete(res: Response, id: number, authToken?: string, user?: AuthUser) {
    if (!id || !user) return 0;
    const condition: DestroyOptions = { where: { id, author: user?.id || 0 } };
    if (user && authToken) {
      const directory = await this.dirToUser.findOne({
        where: { directoryId: id, authToken },
      });

      if (directory) {
        condition.where = { id: directory.directoryId };
        this.guestService.removeCookie(res);
      }
    }
    try {
      return await this.nsHelper.delete(this.repo, condition);
    } catch (err) {
      return false;
    }
  }
}
