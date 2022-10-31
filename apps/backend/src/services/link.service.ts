import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { AuthUser, User, Directory, DirectoryAccess, Link } from 'models';
import {
  DIRECTORY_ACCESS_REPOSITORY,
  DIRECTORY_REPOSITORY,
  IDirectoryAccessRepository,
  IDirectoryRepository,
  ILinkRepository,
  LINK_REPOSITORY,
} from 'repositories';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export type List = {
  id: number;
  parent?: number;
  editable: boolean;
  author?: number;
  isGuest?: boolean;
  owned: boolean;
  name?: string;
  codes: {
    id: number;
    code?: string;
    owned: boolean;
    username?: string;
    expiresIn: Date;
    updatedAt: Date;
  }[];
  sublists?: number[];
  links: {
    userId: null | number;
    directory: number;
    id: number;
    url: string;
    text?: string;
  }[];
};

@Injectable()
export class LinkService {
  @Inject(LINK_REPOSITORY) private readonly repo: ILinkRepository;
  @Inject(DIRECTORY_ACCESS_REPOSITORY)
  private readonly access: IDirectoryAccessRepository;
  @Inject(DIRECTORY_REPOSITORY)
  private readonly directory: IDirectoryRepository;

  constructor(@InjectConnection() private readonly connection: Sequelize) {}

  async edit(
    linkId: number,
    data: { text: string; url?: string },
    user?: AuthUser,
    token?: string
  ) {
    const link = await this.repo.findOne({ where: { id: linkId } });
    if (!link) throw new NotFoundException();

    if (
      link.createdBy !== user?.id &&
      !(await this.hasAccess(link.directoryId, user, token))
    ) {
      throw new ForbiddenException();
    }

    const result = await this.repo.updateAttributes(data, {
      where: { id: linkId },
    });

    return result > 0;
  }

  async find(code?: string, user?: AuthUser, token?: string) {
    if (!code && !user && !token) {
      throw new HttpException('Not authorized', 401);
    }

    if (code) {
      return { guest: this.getLinksByCode(code, token) };
    }

    const queries: Promise<null | List | Record<number, List>>[] = [
      this.getUserLinks(user),
    ];

    if (token) queries.push(this.getLinksByToken(token));

    const [userList, guest] = await Promise.all(queries);

    if (!userList && !guest && !user) {
      throw new HttpException('Not authorized', 401);
    }

    return { user: userList, guest };
  }

  async getLinksByCode(code: string, token?: string) {
    const access = await this.access.findOne({
      include: [{ model: User }],
      where: { code },
    });

    if (!access) return null;

    const isExpired = access.expiresIn.getTime() < Date.now();
    if (isExpired && token !== access.token) return null;

    const result = await this.repo.findAll({
      where: { directory: access.directoryId },
    });

    return {
      id: access.directoryId, // dir.id
      codes: [
        {
          id: access.id,
          code: access.code,
          owned: token && access.token === token,
          username: access.user?.username,
          expiresIn: access.expiresIn,
          updatedAt: access.updatedAt,
        },
      ],
      editable: token === access.token,
      isGuest: true,
      owned: token === access.token,
      name: 'GuestDir', //dir.name
      links: result,
    };
  }

  async getLinksByToken(token: string) {
    const access = await this.access.findOne({
      include: [{ model: User }],
      where: { token },
    });

    // const dir

    if (!access) return null;

    const result = await this.repo.findAll({
      where: { directoryId: access.directoryId },
    });

    return {
      id: access.directoryId, // dir.id
      codes: [
        {
          id: access.id,
          code: access.code,
          owned: token && access.token === token,
          username: access.user?.username,
          expiresIn: access.expiresIn,
          updatedAt: access.updatedAt,
        },
      ],
      editable: true,
      owned: true,
      isGuest: true,
      name: 'GuestDir', //dir.name
      links: result,
    };
  }

  async getUserLinks(user?: AuthUser) {
    if (!user) return null;
    const rootDir = await this.directory.findOne({
      where: { createdBy: user.id },
      order: [['lft', 'asc']],
    });
    if (!rootDir) return null;
    const dirConditions = [];

    dirConditions.push({
      lft: { [Op.gte]: rootDir.lft },
      rht: { [Op.lte]: rootDir.rht },
    });

    const received = await this.directory.findAll({
      include: [
        {
          model: DirectoryAccess,
          where: { userId: user.id, expiresIn: { [Op.gte]: Date.now() } },
          required: true,
          attributes: [],
        },
      ],
    });

    received.forEach((dir) => {
      dirConditions.push({
        lft: { [Op.gte]: dir.lft },
        rht: { [Op.lte]: dir.rht },
      });
    });

    const dirs =
      dirConditions.length > 0
        ? await this.directory.findAll({
            include: [{ model: DirectoryAccess, include: [{ model: User }] }],
            where: { [Op.or]: dirConditions },
            order: [['lft', 'asc']],
          })
        : [];
    const result: Record<number, List> = {};
    const prevOwn: Directory[] = [];
    const prevReceived: Directory[] = [];

    dirs?.forEach((dir) => {
      const list: List = {
        id: dir.id,
        editable: true,
        links: [],
        owned: true,
        name: dir.name,
        sublists: [],
        codes: dir.access.reduce((acc: List['codes'], dtu) => {
          if (
            dir.createdBy !== user.id &&
            dtu.userId !== user.id &&
            dtu.createdBy !== user.id
          )
            return acc;
          acc.push({
            id: dtu.id,
            code: dtu.code,
            owned: dtu.createdBy === user.id,
            username: dtu.user?.username,
            expiresIn: dtu.expiresIn,
            updatedAt: dtu.updatedAt,
          });
          return acc;
        }, []),
      };

      let parentId = rootDir.id;
      const prev = dir.createdBy === user.id ? prevOwn : prevReceived;

      if (dir.depth > 0 && prev.length > 0) {
        while (
          prev.length > 0 &&
          !(
            prev[prev.length - 1].rht > dir.rht &&
            prev[prev.length - 1].lft < dir.lft
          )
        )
          prev.pop();

        parentId = prev[prev.length - 1].id;
      }
      if (prev.length === 0 || dir.rht - dir.lft > 1) {
        prev.push(dir);
      }
      if (result[parentId]) {
        list.parent = parentId;
        result[parentId].sublists?.push(dir.id);
      }
      result[dir.id] = list;
    });

    const links = await this.repo.findAll({
      where: { directoryId: Object.keys(result) },
    });

    links.forEach((link) => {
      result[link.directoryId].links.push({
        id: link.id,
        text: link.text,
        url: link.url,
        directory: link.directoryId,
        userId: link.createdBy,
      });
    });

    return { rootDir: rootDir.id, data: result };
  }

  async delete(linkId: number | number[], user?: AuthUser, token?: string) {
    const link = await this.repo.findAll({ where: { id: linkId } });
    const toDelete: number[] = [];
    const toCheck: number[] = [];
    const dirs: number[] = [];

    const canDelete = (link: Link) => {
      if (link.createdBy === user?.id) toDelete.push(link.id);
      else toCheck.push(link.directoryId);
    };

    if (!link || link.length === 0) throw new NotFoundException();

    if (link.length > 1) {
      link.forEach(canDelete);
    } else canDelete(link[0]);

    if (toCheck.length > 0) {
      const checkResults = await this.hasAccess(toCheck, user, token);
      link.forEach(({ id, directoryId }) => {
        if (checkResults[directoryId]) {
          dirs.push(directoryId);
          toDelete.push(id);
        }
      });
    }

    if (toDelete.length === 0) return 0;
    const result = await this.repo.removeAll({ where: { id: toDelete } });
    if (result) {
      for (let i = 0; i < dirs.length; i++) {
        await this.connection.query(
          'SET @i=0; UPDATE Links SET sort=@i:=@i+1 WHERE `directoryId`=' +
            dirs[i] +
            ' order by sort ASC;'
        );
      }
    }
    return result ? toDelete : 0;
  }

  async move(ids: number[], dir: number, user: AuthUser | undefined) {
    const link = await this.repo.findAll({ where: { id: ids } });
    const toUpdate: number[] = [];
    const toCheck: number[] = [];
    const dirs: number[] = [dir];

    const canDelete = (link: Link) => {
      if (link.createdBy === user?.id) toUpdate.push(link.id);
      else toCheck.push(link.directoryId);
    };

    if (!link || link.length === 0) throw new NotFoundException();

    if (link.length > 1) {
      link.forEach(canDelete);
    } else canDelete(link[0]);

    if (toCheck.length > 0) {
      const checkResults = await this.hasAccess(toCheck, user);
      link.forEach(({ id, directoryId }) => {
        if (checkResults[directoryId]) {
          dirs.push(directoryId);
          toUpdate.push(id);
        }
      });
    }

    if (toUpdate.length === 0) return 0;
    const result = await this.repo.updateAttributes(
      { directoryId: dir },
      { where: { id: toUpdate } }
    );
    if (result) {
      for (let i = 0; i < dirs.length; i++) {
        await this.connection.query(
          'SET @i=0; UPDATE Links SET sort=@i:=@i+1 WHERE directoryId = ' +
            dirs[i] +
            ' order by sort asc;'
        );
      }
    }
    return result ? toUpdate : 0;
  }

  async hasAccess(
    dirId: number[],
    user?: AuthUser,
    token?: string
  ): Promise<Record<number, boolean>>;
  async hasAccess(
    dirId: number,
    user?: AuthUser,
    token?: string
  ): Promise<boolean>;
  async hasAccess(
    dirId: number | number[],
    user?: AuthUser,
    token?: string
  ): Promise<Record<number, boolean> | boolean> {
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
    const dir = await this.directory.findAll({
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

    if (!Array.isArray(dirId) && !dir) throw new NotFoundException();

    const checkHasAccess = (dir: Directory) => {
      let hasAccess = dir.createdBy === user?.id;
      if (!hasAccess) {
        hasAccess = !!dir.access.find(
          (a) => a.userId === user?.id || a.token === token
        );
      }
      return hasAccess;
    };

    return dir.reduce((acc: Record<number, boolean>, d) => {
      acc[d.id] = checkHasAccess(d);
      return acc;
    }, {});
  }
}
