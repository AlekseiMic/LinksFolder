import { Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Directory } from './directory.model';

@Table
export class DirectoryToUser extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  userId: number;

  @PrimaryKey
  @ForeignKey(() => Directory)
  @Column
  directoryId: number;
}
