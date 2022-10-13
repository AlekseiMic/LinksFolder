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
export class DirectoryToUser extends Model {
  @ForeignKey(() => User)
  @Column
  userId?: number;

  @BelongsTo(() => User, 'userId')
  user: User;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @ForeignKey(() => Directory)
  @Column
  directoryId: number;

  @BelongsTo(() => Directory, 'directoryId')
  directory: Directory;

  @Column
  expiresIn: Date;

  @Column
  code: string;

  @Column
  authToken: string;

  @Column
  subfolders: boolean;
}
