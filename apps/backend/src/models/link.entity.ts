import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Directory } from './directory.entity';
import {
  NonAttribute,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table
export class Link extends Model<
  InferAttributes<Link>,
  InferCreationAttributes<Link>
> {
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
  createdBy?: number;

  @BelongsTo(() => User, 'createdBy')
  user: NonAttribute<User>;

  @BelongsTo(() => User, 'directoryId')
  directory: NonAttribute<Directory>;
}
