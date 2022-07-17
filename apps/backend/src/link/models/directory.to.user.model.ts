import { BelongsToMany, Column, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { User } from 'user/user.model';
import { Directory } from './directory.model';
import { Link } from './link.model';

@Table
export class DirectoryToUser extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Directory)
  @Column
  directoryId: number;

  @Column
  expiresIn: Date;

  @Column
  code: string;

  @Column
  authToken: string;
}

