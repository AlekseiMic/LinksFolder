import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Directory } from 'link/models/directory.model';
import { DirectoryToUser } from 'link/models/directory.to.user.model';
import { Link } from 'link/models/link.model';
import { Op } from 'sequelize';
import { AuthUser, User } from 'user/user.model';

type List = {
  id: number;
  parent?: number;
  editable: boolean;
  author?: number;
  owned: boolean;
  name?: string;
  codes: { id: number; code: string; expires: Date }[];
  sublists?: number[];
  links: { userId: null | number; id: number; url: string; text?: string }[];
};

type AllLists = {
  user: Record<number, List> | null;
  guest: List | null;
};

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link) private readonly linkModel: typeof Link,
    @InjectModel(DirectoryToUser)
    private readonly dirToUser: typeof DirectoryToUser,
    @InjectModel(Directory)
    private readonly directory: typeof Directory
  ) {}

  async edit(
    linkId: number,
    data: { text: string; url?: string },
    user?: AuthUser,
    token?: string
  ) {
    const link = await this.linkModel.findOne({ where: { id: linkId } });
    if (!link) throw new NotFoundException();

    if (
      link.userId !== user?.id &&
      !(await this.hasAccess(link.directory, user, token))
    ) {
      throw new ForbiddenException();
    }

    const result = await this.linkModel.update(data, { where: { id: linkId } });
    return result[0] > 0;
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

    return { user: userList, guest };
  }

  async getLinksByCode(code: string, token?: string) {
    const access = await this.dirToUser.findOne({
      where: { code },
    });

    if (!access) return null;

    const isExpired = access.expiresIn.getTime() < Date.now();
    if (isExpired && token !== access.authToken) return null;

    const result = await this.linkModel.findAll({
      where: { directory: access.directoryId },
    });

    return {
      id: access.directoryId, // dir.id
      codes: [{ id: access.id, code: access.code, expires: access.expiresIn }],
      editable: token === access.authToken,
      owned: token === access.authToken,
      name: 'GuestDir', //dir.name
      links: result,
    };
  }

  async getLinksByToken(token: string) {
    const access = await this.dirToUser.findOne({
      where: { authToken: token },
    });

    // const dir

    if (!access) return null;

    const result = await this.linkModel.findAll({
      where: { directory: access.directoryId },
    });

    return {
      id: access.directoryId, // dir.id
      codes: [{ id: access.id, code: access.code, expires: access.expiresIn }],
      editable: true,
      owned: true,
      name: 'GuestDir', //dir.name
      links: result,
    };
  }

  async getUserLinks(user?: AuthUser) {
    if (!user) return null;
    const baseDir = await this.directory.findOne({
      where: { author: user.id },
      order: [['lft', 'asc']],
    });
    const dirConditions = [];
    if (baseDir) {
      dirConditions.push({
        lft: { [Op.gte]: baseDir.lft },
        rht: { [Op.lte]: baseDir.rht },
      });
    }

    const received = await this.directory.findAll({
      include: [
        {
          model: DirectoryToUser,
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
            include: [{ model: DirectoryToUser }],
            where: { [Op.or]: dirConditions },
            order: [['lft', 'asc']],
          })
        : [];
    const result: Record<number, List> = {};
    const prev: Directory[] = [];

    dirs?.forEach((dir) => {
      const list: List = {
        id: dir.id,
        editable: true,
        links: [],
        owned: true,
        name: dir.name,
        sublists: [],
        codes: dir.directoryToUsers.reduce((acc: List['codes'], dtu) => {
          if (dtu.userId !== user.id && dtu.createdBy !== user.id) return acc;
          acc.push({
            id: dtu.id,
            code: dtu.code,
            expires: dtu.expiresIn,
          });
          return acc;
        }, []),
      };

      if (dir.depth > 0 && prev.length > 0) {
        while (
          prev.length > 0 &&
          !(
            prev[prev.length - 1].rht > dir.rht &&
            prev[prev.length - 1].lft < dir.lft
          )
        )
          prev.pop();
        const parent = prev[prev.length - 1];
        if (parent) {
          list.parent = parent.id;
          result[parent.id].sublists?.push(dir.id);
        } else {
          console.log(dir);
        }
      }
      if (prev.length === 0 || dir.rht - dir.lft > 1) {
        prev.push(dir);
      }
      result[dir.id] = list;
    });

    const links = await this.linkModel.findAll({
      where: { directory: Object.keys(result) },
    });

    links.forEach((link) => {
      result[link.directory].links.push({
        id: link.id,
        text: link.text,
        url: link.url,
        userId: link.userId,
      });
    });

    return result;
  }

  async delete(linkId: number | number[], user?: AuthUser, token?: string) {
    const link = await this.linkModel.findAll({ where: { id: linkId } });
    const toDelete: number[] = [];
    const toCheck: number[] = [];
    const canDelete = (link: Link) => {
      if (link.userId === user?.id) toDelete.push(link.id);
      else toCheck.push(link.directory);
    };

    if (!link || link.length === 0) throw new NotFoundException();

    if (link.length > 1) {
      link.forEach(canDelete);
    } else canDelete(link[0]);

    if (toCheck.length > 0) {
      const checkResults = await this.hasAccess(toCheck, user, token);
      link.forEach(({ id, directory }) => {
        if (checkResults[directory]) toDelete.push(id);
      });
    }

    if (toDelete.length === 0) return 0;
    const result = await this.linkModel.destroy({ where: { id: toDelete } });
    return result ? toDelete : 0;
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
            [Op.or]: [
              { expiresIn: { [Op.gte]: Date.now() } },
              { authToken: token },
            ],
          }
        : {
            expiresIn: { [Op.gte]: Date.now() },
          }),
    };
    const dir = await this.directory.findAll({
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

    if (!Array.isArray(dirId) && !dir) throw new NotFoundException();

    const checkHasAccess = (dir: Directory) => {
      let hasAccess = dir.author === user?.id;
      if (!hasAccess) {
        hasAccess = !!dir.directoryToUsers.find(
          (a) => a.userId === user?.id || a.authToken === token
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
