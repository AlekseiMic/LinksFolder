import { Column, HasMany, Model, Table } from "sequelize-typescript";
import { DirectoryToUser } from "./directory.to.user.model";

@Table
export class Directory extends Model {
  @Column
  name: string

  @Column
  author: number

  @Column
  parent: number

  @HasMany(() => DirectoryToUser)
  directoryToUsers: DirectoryToUser[]
}
