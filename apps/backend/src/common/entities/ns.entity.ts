import { Model } from 'sequelize';

export interface NSModel extends Model<any, any> {
  lft: number;
  rht: number;
  depth: number;
}
