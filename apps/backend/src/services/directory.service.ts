import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Link, Directory, DirectoryAccess, AuthUser, User } from 'models';
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
import { List } from './link.service';
import { NestedSetsSequelizeHelper } from './nested-sets-sequelize.service';
import { GuestService } from './guest.service';

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

  async edit(
    id: number,
    data: { name?: string; parent?: number },
    user?: AuthUser
  ): Promise<boolean> {
    if (!user) throw new ForbiddenException();
    if (!data.parent && !data.name) return true;
    const dir = await this.repo.findOne({ where: { createdBy: user.id, id } });
    if (!dir) throw new NotFoundException();
    if (data.name) {
      dir.name = data.name;
      await dir.save();
    }
    if (data.parent) {
      const parent = await this.repo.findOne({
        where: { id: data.parent, createdBy: user.id },
      });
      if (!parent) return false;
      return this.nsHelper.moveTo(this.repo, dir, parent);
    }
    return true;
  }

  async deleteAccess(dir: number, access: number, user?: AuthUser) {
    if (!user) throw new ForbiddenException();
    const result = await this.access.removeAll({
      where: { directoryId: dir, id: access, createdBy: user.id },
    });
    return { result: result >= 1 };
  }

  async importFiles(
    dirId: number,
    files: Express.Multer.File[],
    user?: AuthUser
  ) {
    if (!user) throw new ForbiddenException('Not authorized');

    const dir = await this.repo.findOne({
      where: { id: dirId, createdBy: user.id },
    });

    if (!dir) throw new ForbiddenException();
    const result: Record<number, List> = {};

    type Li = {
      id?: number;
      name: string;
      subdirs: Li[];
      links: {
        userId: number;
        text: string;
        url: string;
      }[];
    };

    const getLinksRecursive = (obj: any) => {
      const result: Li = {
        name: obj.title,
        subdirs: [],
        links: [],
      };

      if (obj.children) {
        obj.children.forEach((c: any) => {
          if (c.typeCode === 2) {
            const res = getLinksRecursive(c);
            if (res) result.subdirs.push(res);
          }
          if (c.typeCode === 1) {
            result.links.push({ userId: user.id, text: c.title, url: c.uri });
          }
        });
      }

      if (result.subdirs.length === 0 && result.links.length === 0) return null;
      return result;
    };

    const toImport: Li[] = [];
    files.forEach((file) => {
      const jsn = JSON.parse(file.buffer.toString());
      const res = getLinksRecursive(jsn);
      if (res) toImport.push(...res.subdirs);
    });

    const addDirs = async (dirs: Li[], parentDir: number) => {
      for (const d of dirs) {
        const newDir = new Directory({
          name: d.name,
          createdBy: user.id,
        } as any);
        const res = await this.nsHelper.append(this.repo, newDir, parentDir);
        if (result[parentDir]) result[parentDir].sublists?.push(res.id);
        result[res.id] = {
          ...d,
          parent: parentDir,
          codes: [],
          id: res.id,
          sublists: [],
          owned: true,
          editable: true,
          links: [],
        };
        d.id = res.id;
        if (d.subdirs) {
          await addDirs(d.subdirs, res.id);
        }
      }
    };

    await addDirs(toImport, dirId);

    const addLinks = (dirs: Li[]) => {
      const res: any = [];
      dirs.forEach((d: any) => {
        if (d.links) {
          d.links.forEach((l: any, i: number) => {
            if (!d.id) return;
            l.directoryId = d.id;
            l.sort = i + 1;
            res.push(l);
          });
        }
        if (d.subdirs) {
          res.push(...addLinks(d.subdirs));
        }
      });
      return res;
    };

    const links = await this.linkModel.saveMultiple(addLinks(toImport), {});

    links.forEach((l) => {
      if (result[l.directoryId]) {
        result[l.directoryId].links.push({
          id: l.id,
          url: l.url,
          text: l.text,
          userId: l.createdBy,
          directory: l.directoryId,
        });
      }
    });
    return { ids: toImport.map(({ id }) => id), lists: result };
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
      where: { directoryId: dirId },
      order: [['sort', 'DESC']],
    });

    const maxOrder = maxOrderLink?.sort ?? 0;

    const result = await Promise.all(
      links.map(({ url, text }, idx) =>
        this.linkModel.save(
          new Link({
            url,
            text: text || url,
            createdBy: user?.id,
            directoryId: dirId,
            sort: maxOrder + idx + 1,
          } as any)
        )
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
            [Op.or]: [{ expiresIn: { [Op.gte]: Date.now() } }, { token }],
          }
        : {
            expiresIn: { [Op.gte]: Date.now() },
          }),
    };
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
        (a) => a.userId === user?.id || a.token === token
      );
    }
    return hasAccess;
  }

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
            model: DirectoryAccess,
            required: false,
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
    if (!(await this.hasAccess(parent, user))) throw new NotFoundException();
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
    console.log(result);
    return result;
  }

  async delete(id: number, res?: Response, token?: string, user?: AuthUser) {
    if (!id || !user) return false;
    const condition: DestroyOptions = {
      where: { id, createdBy: user?.id || 0 },
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
      console.log(err);
      return false;
    }
  }
}
