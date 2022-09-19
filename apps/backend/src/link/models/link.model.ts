import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'user/user.model';
import { Directory } from './directory.model';

@Table
export class Link extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User, 'userId')
  user: User;

  @Column
  url: string;

  @Column
  directory: number;

  @BelongsTo(() => User, 'directory')
  dir: Directory;

  @Column
  text: string;
}
