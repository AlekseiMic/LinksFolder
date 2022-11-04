import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { EditLinkDto } from 'dto/EditLinkDto';
import { AuthUser, User, Directory, DirectoryAccess, Link } from 'models';
import { CodePresenter } from 'presenters/CodePresenter';
import {
  DirectoryObj,
  DirectoryPresenter,
} from 'presenters/DirectoryPresenter';
import { LinkPresenter } from 'presenters/LinkPresenter';
import {
  DIRECTORY_ACCESS_REPOSITORY,
  DIRECTORY_REPOSITORY,
  IDirectoryAccessRepository,
  IDirectoryRepository,
  ILinkRepository,
  LINK_REPOSITORY,
} from 'repositories';
import { Attributes, Op, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export type List = DirectoryObj;

@Injectable()
export class LinkService {
  @Inject(LINK_REPOSITORY) private readonly repo: ILinkRepository;

  @Inject(DIRECTORY_ACCESS_REPOSITORY)
  private readonly access: IDirectoryAccessRepository;

  @Inject(DIRECTORY_REPOSITORY)
  private readonly directory: IDirectoryRepository;

  constructor(@InjectConnection() private readonly connection: Sequelize) {}

  async edit(id: number, data: EditLinkDto, user?: AuthUser, token?: string) {
    const link = await this.getLinkById(id);
    await this.hasAccessToLink(link, user, token);
    link.setAttributes(data);
    return this.repo.save(link);
  }

  async hasAccessToLink(link: Link, user?: AuthUser, token?: string) {
    if (link.createdBy === user?.id) return true;
    const check = await this.hasAccess(link.directoryId, user, token);
    if (!check) throw new ForbiddenException();
    return true;
  }

  async getLinkById(id: number) {
    const link = await this.repo.findOne({ where: { id } });
    if (!link) throw new NotFoundException();
    return link;
  }

  async shouldInit() {
    throw new HttpException('Not intialized', 401);
  }

  async find(code?: string, user?: AuthUser, token?: string) {
    if (code) return { guest: await this.getLinksByCode(code, token) };
    if (!(code || user || token)) return this.shouldInit();

    const [userList, guest] = await Promise.all([
      this.getUserLinks(user),
      ...(token ? [this.getLinksByToken(token)] : []),
    ]);

    if (!(userList || guest)) return this.shouldInit();
    return { user: userList, guest };
  }

  async getListByAccess(
    where: WhereOptions<Attributes<DirectoryAccess>>,
    token?: string
  ) {
    const access = await this.access.findOne({
      include: [User, { model: Directory, include: [Link] }],
      where,
    });

    if (!access || !access.directory) return null;

    const list = DirectoryPresenter.from(access.directory);
    list.links = access.directory.links?.map(LinkPresenter.from) ?? [];
    list.codes = [CodePresenter.from(access, undefined, token)];
    list.editable = token === access.token;
    list.owned = token === access.token;
    return list;
  }

  getLinksByCode(code: string, token?: string) {
    const expiresIn = { [Op.gte]: Date.now() };
    return this.getListByAccess({ code, expiresIn }, token);
  }

  getLinksByToken(token: string) {
    return this.getListByAccess({ token }, token);
  }

  async getUserLinks(user?: AuthUser) {
    if (!user) return null;
    const { root, received } = await this.directory.getAvailable(user.id);
    if (!root) return null;

    const dirConditions = received.map((dir) => ({
      lft: { [Op.gte]: dir.lft },
      rht: { [Op.lte]: dir.rht },
    }));

    const dirs: Directory[] = await this.directory.findAll({
      include: [{ model: DirectoryAccess, include: [{ model: User }] }],
      where: { [Op.or]: dirConditions },
      order: [['lft', 'asc']],
    });

    const result: Record<number, List> = {};
    const prevOwn: Directory[] = [];
    const prevReceived: Directory[] = [];

    dirs?.forEach((dir) => {
      const list: List = DirectoryPresenter.from(dir, undefined, user.id);
      list.codes = dir.access.reduce((acc: List['codes'], dtu) => {
        const users = [dir.createdBy, dtu.userId, dtu.createdBy];
        const hasAccess = users.includes(user.id);
        if (hasAccess) acc.push(CodePresenter.from(dtu, user.id));
        return acc;
      }, []);

      let parentId = root.id;
      const prev = dir.createdBy === user.id ? prevOwn : prevReceived;

      if (dir.depth > 0 && prev.length > 0) {
        while (
          prev.length > 0 &&
          !(
            prev[prev.length - 1].rht > dir.rht &&
            prev[prev.length - 1].lft < dir.lft
          )
        ) {
          prev.pop();
        }

        parentId = prev[prev.length - 1].id;
      }

      const hasSubdir = dir.rht - dir.lft > 1;
      if (hasSubdir) prev.push(dir);

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
      result[link.directoryId].links.push(LinkPresenter.from(link));
    });

    return { rootDir: root.id, data: result };
  }

  async delete(id: number[], user?: AuthUser, token?: string) {
    const { ids, dirs } = await this.filterAvailableLinks(id, user, token);
    if (ids.length === 0) return 0;
    const result = await this.repo.removeAll({ where: { id: ids } });
    if (!result) return 0;
    await Promise.all(dirs.map((d) => this.repo.sortLinksInDirectory(d)));
    return ids;
  }

  async move(id: number[], dir: number, user: AuthUser | undefined) {
    const { ids, dirs } = await this.filterAvailableLinks(id, user);
    if (ids.length === 0) return 0;
    const result = await this.repo.updateAttributes(
      { directoryId: dir },
      { where: { id: ids } }
    );
    if (!result) return 0;
    await Promise.all(
      [dir, ...dirs].map((d) => this.repo.sortLinksInDirectory(d))
    );
    return ids;
  }

  private async filterAvailableLinks(
    id: number[],
    user?: AuthUser,
    token?: string
  ) {
    const links = await this.repo.findAll({ where: { id } });
    if (!links || links.length === 0) return { ids: [], dirs: [] };

    const valid: number[] = [];
    const toCheck: number[] = [];
    const dirs: Set<number> = new Set();

    links.forEach((link: Link) => {
      if (link.createdBy === user?.id) {
        dirs.add(link.directoryId);
        valid.push(link.id);
      } else toCheck.push(link.directoryId);
    });

    if (toCheck.length > 0) {
      const checkResults = await this.hasAccess(toCheck, user, token);
      links.forEach(({ id, directoryId }) => {
        if (checkResults[directoryId]) {
          valid.push(id);
          dirs.add(directoryId);
        }
      });
    }

    return { ids: valid, dirs: [...dirs] };
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
      userId: {
        [Op.or]: [{ [Op.eq]: user?.id }, { [Op.eq]: null }],
      },
    };
    const expireCond = { expiresIn: { [Op.gte]: Date.now() } };
    const hasToken = !user && token;
    const accessCond = {
      ...userCond,
      ...(hasToken ? { [Op.or]: [expireCond, { token }] } : expireCond),
    };

    const dir = await this.directory.findAll({
      include: [{ model: DirectoryAccess, where: accessCond }],
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
