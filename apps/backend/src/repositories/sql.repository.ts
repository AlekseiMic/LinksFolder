import type { IRepository } from './interfaces/i.repository';
import { Repository, Model, Sequelize } from 'sequelize-typescript';
import {
  Attributes,
  BulkCreateOptions,
  DestroyOptions,
  FindOptions,
  IncrementDecrementOptionsWithBy,
  NonNullFindOptions,
  QueryOptionsWithType,
  QueryTypes,
  UpdateOptions,
} from 'sequelize';
import { Col, Fn, Literal } from 'sequelize/types/utils';

export abstract class SqlRepository<T extends Model> implements IRepository<T> {
  protected db: Repository<T>;

  constructor(private readonly connection: Sequelize, sequelizeClass: any) {
    this.db = connection.getRepository(sequelizeClass);
    this.db.build();
  }

  async exists(
    conditions: NonNullFindOptions<Attributes<T>>
  ): Promise<boolean> {
    return !!(await this.db.findOne(conditions));
  }

  async query(query: string, options: QueryOptionsWithType<QueryTypes.UPDATE>) {
    const results = await this.connection.query(query, {
      ...options,
      logging: console.log,
      type: QueryTypes.SELECT,
    });
    return results;
  }

  async increment(
    fields: string,
    options: IncrementDecrementOptionsWithBy<Attributes<T>>
  ): Promise<boolean> {
    return !!(await this.db.increment(fields, options));
  }

  async decrement(
    fields: string,
    options: IncrementDecrementOptionsWithBy<Attributes<T>>
  ): Promise<boolean> {
    return !!(await this.db.decrement(fields, options));
  }

  async saveMultiple(
    t: T[],
    options: BulkCreateOptions<Attributes<T>> | undefined
  ) {
    return this.db.bulkCreate(
      t.map((e) => e.get()),
      options
    );
  }

  async updateAttributes(
    attributes: {
      [key in keyof Attributes<T>]?: Attributes<T>[key] | Fn | Col | Literal;
    },
    conditions: Omit<UpdateOptions<Attributes<T>>, 'returning'> & {
      returning: true | (keyof Attributes<T>)[];
    }
  ): Promise<number> {
    const result = await this.db.update(attributes, conditions);
    return result[0];
  }

  findByPk(pk: number | string): Promise<T | null> {
    return this.db.findByPk(pk);
  }

  findAll(conditions: FindOptions<Attributes<T>> | undefined): Promise<T[]> {
    return this.db.findAll(conditions);
  }

  findOne(conditions: NonNullFindOptions<Attributes<T>>): Promise<T> {
    return this.db.findOne(conditions);
  }

  save(t: T): Promise<T> {
    return t.save();
  }

  removeAll(
    conditions: DestroyOptions<Attributes<T>> | undefined
  ): Promise<number> {
    return this.db.destroy(conditions);
  }
}
