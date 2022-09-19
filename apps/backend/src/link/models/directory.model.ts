import { Column, HasMany, Index, Model, Table } from 'sequelize-typescript';
import { DirectoryToUser } from './directory.to.user.model';
import { Link } from './link.model';

@Table
export class Directory extends Model {
  @Column
  name: string;

  @Column
  author: number;

  @HasMany(() => DirectoryToUser)
  directoryToUsers: DirectoryToUser[];

  @HasMany(() => Link, 'directory')
  links: Link[];

  @Column
  @Index('idx_nested-set')
  lft: number;

  @Column
  @Index('idx_nested-set')
  rht: number;

  @Column
  @Index('idx_nested-set')
  depth: number;
}
