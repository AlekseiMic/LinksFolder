import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'auth/entities/user.model';
import { Directory } from './directory.model';

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
