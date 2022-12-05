import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Link, Directory, DirectoryAccess, AuthUser } from 'models';
import * as dayjs from 'dayjs';
import { DestroyOptions, Op } from 'sequelize';
import { Response } from 'express';
import { nanoid } from 'nanoid';
import { LinkDto } from 'dto';
import {
  DIRECTORY_ACCESS_REPOSITORY,
  DIRECTORY_REPOSITORY,
  IDirectoryAccessRepository,
  IDirectoryRepository,
  ILinkRepository,
  IUserRepository,
  LINK_REPOSITORY,
  USER_REPOSITORY,
} from 'repositories';
import { NestedSetsSequelizeHelper } from './nested-sets-sequelize.service';
import { GuestService } from './guest.service';
import { LinkPresenter } from 'presenters/LinkPresenter';
import { validate } from 'utils/validator';
import { getParser } from 'utils/parsers/Parser';
import {
  DirectoryObj,
  DirectoryPresenter,
} from 'presenters/DirectoryPresenter';
import { Li } from 'utils/parsers/AbstractParser';

@Injectable()
export class DirectoryService {
  @Inject(DIRECTORY_REPOSITORY) private repo: IDirectoryRepository;

  @Inject(LINK_REPOSITORY) private readonly linkModel: ILinkRepository;

  @Inject(USER_REPOSITORY) private readonly userModel: IUserRepository;

  @Inject(DIRECTORY_ACCESS_REPOSITORY)
  private readonly access: IDirectoryAccessRepository;

  constructor(
    private readonly nsHelper: NestedSetsSequelizeHelper,
    private readonly guestService: GuestService
  ) {}

  private async getDirectory(condition: Record<string, unknown>) {
    const dir = await this.repo.findOne({ where: condition });
    if (!dir) throw new NotFoundException();
    return dir;
  }

  private async exists(condition: Record<string, unknown>) {
    const dir = await this.repo.exists({
      where: condition,
    });
    if (!dir) throw new NotFoundException();
    return dir;
  }

  async edit(
    id: number,
    data: { name?: string; parent?: number },
    user: AuthUser
  ): Promise<boolean> {
    validate(data, 'editDirectory');

    const dir = await this.getDirectory({ createdBy: user.id, id });

    if (data.name) {
      dir.name = data.name;
      await dir.save();
    }

    if (!data.parent) return true;

    const parent = await this.getDirectory({
      id: data.parent,
      createdBy: user.id,
    });

    return this.nsHelper.moveTo(this.repo, dir, parent);
  }

  async deleteAccess(dir: number, access: number, user: AuthUser) {
    const where = { directoryId: dir, id: access, createdBy: user.id };
    const result = await this.access.removeAll({ where });
    return { result: result >= 1 };
  }

  private async addDirs(
    dirs: Li[],
    parent: number,
    parentList: DirectoryObj | null,
    user: AuthUser
  ) {
    let result: Record<number, DirectoryObj> = {};
    for (const d of dirs) {
      const newDir = new Directory();
      newDir.name = d.name;
      newDir.createdBy = user.id;

      const res = await this.nsHelper.append(this.repo, newDir, parent);

      if (parentList) parentList.sublists?.push(res.id);
      result[res.id] = DirectoryPresenter.from(res, parent, user.id);
      d.id = res.id;

      if (d.directories) {
        result = {
          ...result,
          ...(await this.addDirs(d.directories, res.id, result[res.id], user)),
        };
      }
    }
    return result;
  }

  private getLinksFromParsedDirs(dirs: Li[], user: AuthUser) {
    return dirs.reduce((acc: Link[], d) => {
      if (d.directories) {
        acc.push(...this.getLinksFromParsedDirs(d.directories, user));
      }
      const id = d.id;
      if (!d.links || id === null) return acc;

      d.links.forEach(({ url, text }, i) =>
        acc.push({
          url,
          text,
          sort: i + 1,
          directoryId: id,
          createdBy: user.id,
        } as Link)
      );

      return acc;
    }, []);
  }

  async importFiles(id: number, files: Express.Multer.File[], user: AuthUser) {
    const errors: Record<number, string> = {};
    await this.exists({ id, createdBy: user.id });

    const toImport = files.reduce((acc: Li[], file, idx) => {
      try {
        const json = JSON.parse(file.buffer.toString());
        const parser = getParser(json);
        if (parser) {
          const res = parser.parse(json);
          if (res) acc.push(...res);
        } else {
          errors[idx] = 'NO_PARSER';
        }
      } catch (err) {
        console.error('WRONG_FILE_TYPE');
      }
      return acc;
    }, []);

    const result = await this.addDirs(toImport, id, null, user);
    const links = await this.linkModel.saveMultiple(
      this.getLinksFromParsedDirs(toImport, user),
      {}
    );

    links.forEach((l) => {
      if (!result[l.directoryId]) return;
      result[l.directoryId].links.push(LinkPresenter.from(l));
    });

    return { errors, ids: toImport.map(({ id }) => id), lists: result };
  }

  async createLinks(
    dirId: number,
    links: LinkDto[],
    user?: AuthUser,
    token?: string
  ) {
    await this.hasAccess(dirId, user, token);
    // await this.exists({ id: dirId, createdBy: user.id});

    const maxOrderLink = await this.linkModel.findOne({
      where: { directoryId: dirId },
      order: [['sort', 'DESC']],
    });

    const maxOrder = maxOrderLink?.sort ?? 0;

    const result = await this.linkModel.saveMultiple(
      links.map(
        ({ url, text }, idx) =>
          ({
            url,
            text: text || url,
            createdBy: user?.id,
            directoryId: dirId,
            sort: maxOrder + idx + 1,
          } as Link)
      ),
      {}
    );

    return result.map(LinkPresenter.from);
  }

  async addAccessRule(
    dir: number,
    values: {
      code: string | undefined;
      username: string | undefined;
      expiresIn: Date;
    },
    user: AuthUser
  ) {
    await this.exists({ id: dir, createdBy: user.id });
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

    const access = new DirectoryAccess({
      createdBy: user.id,
      directoryId: dir,
      userId,
      code,
      expiresIn,
    } as any);

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
        ? { [Op.or]: [{ [Op.eq]: user.id }, { [Op.eq]: null }] }
        : { [Op.eq]: null },
    };
    // const expireCond = {
    //   ...(!user && token
    //     ? { [Op.or]: [{ expiresIn: { [Op.gte]: Date.now() } }, { token }] }
    //     : { expiresIn: { [Op.gte]: Date.now() } }),
    // };
    const expireCond = token ? { token } : {};
    const dir = await this.repo.findOne({
      include: [
        {
          required: false,
          model: DirectoryAccess,
          where: {
            ...userCond,
            ...expireCond,
          },
        },
      ],
      where: { id: dirId },
    });

    if (!dir) throw new NotFoundException();
    let hasAccess = dir.createdBy === user?.id;
    if (!hasAccess) {
      hasAccess = !!dir.access.find(
        (a) => /* a.userId === user?.id || */ a.token === token
      );
    }
    if (!hasAccess) throw new ForbiddenException();
    return hasAccess;
  }

  async merge(
    res: Response,
    dir: number,
    id: number,
    token: string,
    user: AuthUser
  ): Promise<boolean> {
    const [item, target] = await Promise.all([
      this.repo.findOne({
        where: { id: dir },
        include: [
          {
            model: DirectoryAccess,
            required: true,
            where: { token },
          },
        ],
      }),
      this.repo.findOne({ where: { id, createdBy: user.id } }),
    ]);

    if (!item || !target) return false;
    if (item.createdBy === null && item.access.length > 0) {
      item.createdBy = user.id;
      await this.repo.save(item);
      await this.linkModel.updateAttributes(
        { createdBy: user.id },
        { where: { directoryId: item.id } }
      );
      await this.access.updateAttributes(
        { userId: user.id },
        { where: { directoryId: item.id } }
      );
    }
    if (item.createdBy !== user.id) throw new NotFoundException();
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
    const dir = await this.access.findOne({
      where: { token: token },
    });
    return dir;
  }

  async findDirByCode(code: string) {
    const dir = await this.access.findOne({
      where: { code },
    });
    return dir;
  }

  async createGuestAccess(directoryId: number, expiresIn: Date) {
    const access = new DirectoryAccess({
      directoryId,
      code: nanoid(5),
      token: nanoid(16),
      expiresIn,
    } as any);
    return access.save();
  }

  async create(
    name: string,
    parent: null | number,
    user?: AuthUser
  ): Promise<Directory> {
    const dir = new Directory();
    dir.name = name;
    if (user) dir.createdBy = user.id;
    if (!parent) return this.nsHelper.makeRoot(this.repo, dir);
    await this.hasAccess(parent, user);
    return this.nsHelper.append(this.repo, dir, parent);
  }

  save(dir: Directory) {
    return dir.save();
  }

  async editAccess(
    id: string | number,
    accessId: string | number,
    {
      username,
      code,
      extend,
      expiresIn,
    }: { code?: string; expiresIn?: Date; username?: string; extend?: number },
    user?: AuthUser,
    token?: string
  ) {
    const access = await this.access.findOne({ where: { id: accessId } });
    if (!access) throw new NotFoundException();
    if (token !== access.token && user?.id !== access.createdBy) {
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

  async deleteMany(ids: number[], user?: AuthUser) {
    const result: Record<number, boolean> = {};
    for (const id of ids) {
      result[id] = await this.delete(id, undefined, undefined, user);
    }
    return result;
  }

  async delete(id: number, res?: Response, token?: string, user?: AuthUser) {
    if (!id || !user) return false;
    const condition: DestroyOptions = {
      where: { id, createdBy: user?.id || 0, depth: { [Op.gt]: 0 } },
    };
    if (res && user && token) {
      const directory = await this.access.findOne({
        where: { directoryId: id, token },
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
