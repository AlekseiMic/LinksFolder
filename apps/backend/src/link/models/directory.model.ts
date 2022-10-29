import { Column, HasMany, Index, Model, Table } from 'sequelize-typescript';
import { DirectoryAccess } from './directory-access.model';
import { Link } from './link.model';

@Table
export class Directory extends Model {
  @Column
  name: string;

  @Column
  author: number;

  @HasMany(() => DirectoryAccess)
  access: DirectoryAccess[];

  @HasMany(() => Link, 'directoryId')
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
