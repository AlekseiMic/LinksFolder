import { Attributes, BulkCreateOptions, Model } from 'sequelize';

export interface IRepository<T extends Model> {
  findByPk(pk: number | string): Promise<T | null>;
  findAll(conditions?: any): Promise<T[]>;
  findOne(conditions: any): Promise<T>;
  saveMultiple(t: T[], options: BulkCreateOptions<Attributes<T>>): Promise<T[]>;
  save(t: T): Promise<T>;
  query(query: string, options: any): Promise<any>;
  updateAttributes(
    attributes: Record<string, any>,
    conditions?: any
  ): Promise<number>;
  exists(conditions: any): Promise<boolean>;
  removeAll(conditions: any): Promise<number>;
  increment(fields: string, options?: any): Promise<boolean>;
  decrement(fields: string, options?: any): Promise<boolean>;
}
