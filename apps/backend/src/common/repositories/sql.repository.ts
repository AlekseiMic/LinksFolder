import type { IRepository } from './i.repository';
import { Repository, Model, Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

export abstract class SqlRepository<T extends Model> implements IRepository<T> {
  protected db: Repository<T>;

  constructor(private readonly connection: Sequelize, sequelizeClass: any) {
    this.db = connection.getRepository(sequelizeClass);
    this.db.build();
  }

  async exists(conditions: any): Promise<boolean> {
    return !!(await this.db.findOne(conditions));
  }

  async query(query: string, options: any): Promise<any> {
    const results = await this.connection.query(query, {
      ...options,
      logging: console.log,
      type: QueryTypes.SELECT,
    });
    return results;
  }

  async increment(fields: string, options?: any): Promise<boolean> {
    return !!(await this.db.increment(fields, options));
  }

  async decrement(fields: string, options?: any): Promise<boolean> {
    return !!(await this.db.decrement(fields, options));
  }

  async saveMultiple(t: T[], options: any) {
    return this.db.bulkCreate(
      t.map((e) => e.get()),
      options
    );
  }

  async updateAttributes(
    attributes: Record<string, any>,
    conditions?: any
  ): Promise<number> {
    const result = await this.db.update(attributes, conditions);
    return result[0];
  }

  findByPk(pk: number | string): Promise<T | null> {
    return this.db.findByPk(pk);
  }

  findAll(conditions?: { where: Record<string, any> }): Promise<T[]> {
    return this.db.findAll(conditions);
  }

  findOne(conditions: any): Promise<T> {
    return this.db.findOne(conditions);
  }

  save(t: T): Promise<T> {
    return t.save();
  }

  removeAll(conditions: any): Promise<number> {
    return this.db.destroy(conditions);
  }
}
