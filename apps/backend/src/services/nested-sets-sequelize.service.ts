import { Injectable, NotFoundException } from '@nestjs/common';
import { NSModel } from 'models/ns.entity';
import { Op } from 'sequelize';
import { IRepository } from 'repositories/interfaces/i.repository';

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
    } as any);
    element.depth = last?.depth ?? 0;
    element.lft = (last?.rht ?? 0) + 1;
    element.rht = (last?.rht ?? 0) + 2;
    return repo.save(element);
  }

  async moveTo<M extends NSModel>(
    repo: IRepository<M>,
    item: M,
    target: M
  ): Promise<boolean> {
    const newLft = target.rht;
    const width = item.rht - item.lft + 1;
    let distance = newLft - item.lft;
    let tmppos = item.lft;
    if (distance < 0) {
      distance -= width;
      tmppos += width;
    }

    await repo.increment('depth', {
      by: target.depth - item.depth + 1,
      where: { lft: { [Op.gte]: item.lft }, rht: { [Op.lte]: item.rht } } as any,
    });

    await repo.increment('lft', {
      by: width,
      where: { lft: { [Op.gte]: newLft } } as any,
    });

    await repo.increment('rht', {
      by: width,
      where: { rht: { [Op.gte]: newLft } } as any,
    });

    await repo.increment(['lft', 'rht'], {
      by: distance,
      where: { lft: { [Op.gte]: tmppos }, rht: { [Op.lt]: tmppos + width } } as any,
    });

    await repo.decrement('lft', {
      by: width,
      where: { lft: { [Op.gt]: item.rht } } as any,
    });

    await repo.decrement('rht', {
      by: width,
      where: { rht: { [Op.gt]: item.rht } } as any,
    });

    return true;
  }

  async append<M extends NSModel>(
    repo: IRepository<M>,
    element: M,
    parent: string | number
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
      where: { rht: { [Op.gte]: parentNode.rht } } as any,
    });

    await repo.increment('lft', {
      by: 2,
      where: {
        lft: {
          [Op.gt]: parentNode.rht,
        },
      } as any,
    });
    return repo.save(element);
  }

  async prepend<M extends NSModel>(
    repo: IRepository<M>,
    element: M,
    parent: string | number
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
      where: { rht: { [Op.gte]: parentNode.lft + 2 } } as any,
    });

    await repo.increment('lft', {
      by: 2,
      where: {
        rht: 2,
        lft: {
          [Op.gt]: parentNode.lft,
        },
      } as any,
    });
    return repo.save(element);
  }

  async delete<M extends NSModel>(repo: IRepository<M>, condition: any) {
    const node = await repo.findOne(condition);
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
      } as any,
    });
    await repo.decrement('rht', {
      by: node.rht - node.lft + 1,
      where: {
        rht: { [Op.gte]: node.rht },
      } as any,
    });
    return true;
  }
}
