import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Directory } from './directory.entity';
import { User } from './user.entity';

@Table
export class DirectoryAccess extends Model {
  @ForeignKey(() => User)
  @Column
  userId?: number;

  @ForeignKey(() => Directory)
  @Column
  directoryId: number;

  @Column
  expiresIn: Date;

  @Column
  code: string;

  @Column
  token: string;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => Directory, 'directoryId')
  directory: Directory;

  @BelongsTo(() => User, 'userId')
  user: User;
}
