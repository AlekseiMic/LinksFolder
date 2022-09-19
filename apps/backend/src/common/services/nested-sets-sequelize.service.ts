import { Injectable, NotFoundException } from '@nestjs/common';
import { NSModel } from '../entities/ns.entity';
import { Op } from 'sequelize';
import { IRepository } from 'common/repositories/i.repository';

@Injectable()
export class NestedSetsSequelizeHelper {
  async getTree<M extends NSModel>(repo: IRepository<M>, condition?: any) {
    if (!condition) {
      return repo.findAll({ order: [['lft', 'ASC']] });
    }

    const node = await repo.findOne({ where: condition });

    if (!node) {
      throw new NotFoundException('Node not found');
    }

    return repo.findAll({
      order: [['lft', 'ASC']],
      where: {
        lft: { [Op.gte]: node.lft },
        rht: { [Op.lte]: node.rht },
      } as any,
    });
  }

  async makeRoot<M extends NSModel>(repo: IRepository<M>, element: M) {
    const last = await repo.findOne({
      where: { depth: 0 },
      order: [['lft', 'DESC']],
    });
    element.depth = last?.depth ?? 0;
    element.lft = (last?.rht ?? 0) + 1;
    element.rht = (last?.rht ?? 0) + 2;
    return repo.save(element);
  }

  async append<M extends NSModel>(
    repo: IRepository<M>,
    element: M,
    parent: any
  ) {
    const parentNode = await repo.findByPk(parent);
    if (!parentNode) {
      throw new NotFoundException('Node not found');
    }
    element.depth = parentNode.depth + 1;
    element.lft = parentNode.rht;
    element.rht = parentNode.rht + 1;
    await repo.increment('rht', {
      by: 2,
      where: { rht: { [Op.gte]: parentNode.rht } },
    });
    await repo.increment('lft', {
      by: 2,
      where: {
        lft: {
          [Op.gt]: parentNode.rht,
        },
      },
    });
    return repo.save(element);
  }

  async prepend<M extends NSModel>(
    repo: IRepository<M>,
    element: M,
    parent: any
  ) {
    const parentNode = await repo.findByPk(parent);
    if (!parentNode) {
      throw new NotFoundException('Parent node not found');
    }
    element.depth = parentNode.depth + 1;
    element.lft = parentNode.lft + 1;
    element.rht = parentNode.lft + 2;

    await repo.increment('rht', {
      by: 2,
      where: { rht: { [Op.gte]: parentNode.lft + 2 } },
    });

    await repo.increment('lft', {
      by: 2,
      where: {
        rht: 2,
        lft: {
          [Op.gt]: parentNode.lft,
        },
      },
    });
    return repo.save(element);
  }

  async delete<M extends NSModel>(repo: IRepository<M>, pk: any) {
    const node = await repo.findByPk(pk);
    if (!node) {
      throw new NotFoundException('Node not found');
    }
    await repo.removeAll({
      where: {
        lft: { [Op.gte]: node.lft },
        rht: { [Op.lte]: node.rht },
      } as any,
    });
    await repo.decrement('lft', {
      by: node.rht - node.lft + 1,
      where: {
        lft: { [Op.gte]: node.rht },
      },
    });
    await repo.decrement('rht', {
      by: node.rht - node.lft + 1,
      where: {
        rht: { [Op.gte]: node.rht },
      },
    });
    return true;
  }
}
