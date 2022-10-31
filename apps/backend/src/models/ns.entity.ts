import { Model } from 'sequelize-typescript';

export interface NSModel extends Model<NSModel> {
  lft: number;
  rht: number;
  depth: number;
  [key: string]: any;
}
