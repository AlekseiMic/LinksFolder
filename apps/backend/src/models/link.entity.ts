import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Directory } from './directory.entity';

@Table
export class Link extends Model {
  @Column
  url: string;

  @Column
  directoryId: number;

  @Column
  text: string;

  @Column
  sort: number;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User, 'createdBy')
  user: User;

  @BelongsTo(() => User, 'directoryId')
  directory: Directory;
}
