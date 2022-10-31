import { Column, HasMany, Index, Model, Table } from 'sequelize-typescript';
import { Link } from './link.entity';
import { DirectoryAccess } from './directory-access.entity';
import { NSModel } from './ns.entity';

@Table
export class Directory extends Model<Directory> implements NSModel {
  @Column
  name: string;

  @Column
  createdBy: number;

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

  @HasMany(() => DirectoryAccess)
  access: DirectoryAccess[];
}
