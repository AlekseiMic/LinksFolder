import {
  Attributes,
  BulkCreateOptions,
  Model,
  FindOptions,
  UpdateOptions,
  DestroyOptions,
  IncrementDecrementOptionsWithBy,
} from 'sequelize';
import { Col, Fn, Literal } from 'sequelize/types/utils';

export interface IRepository<T extends Model> {
  findByPk(pk: number | string): Promise<T | null>;
  findAll(conditions?: FindOptions<Attributes<T>>): Promise<T[]>;
  findOne(conditions?: FindOptions<Attributes<T>>): Promise<T | null>;
  saveMultiple(t: T[], options: BulkCreateOptions<Attributes<T>>): Promise<T[]>;
  save(t: T): Promise<T>;
  updateAttributes(
    attributes: {
      [key in keyof Attributes<T>]?: Attributes<T>[key] | Fn | Col | Literal;
    },
    conditions?: Omit<UpdateOptions<Attributes<T>>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<Attributes<T>>['returning'],
        undefined | false
      >;
    }
  ): Promise<number>;
  exists(conditions: FindOptions<Attributes<T>>): Promise<boolean>;
  removeAll(conditions: DestroyOptions<Attributes<T>>): Promise<number>;
  increment(
    fields: string | string[],
    options?: IncrementDecrementOptionsWithBy<Attributes<T>>
  ): Promise<boolean>;
  decrement(
    fields: string | string[],
    options?: IncrementDecrementOptionsWithBy<Attributes<T>>
  ): Promise<boolean>;
}
