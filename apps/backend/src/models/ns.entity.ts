import { Model } from 'sequelize';

export interface NSModel extends Model {
  lft: number;
  rht: number;
  depth: number;
}
