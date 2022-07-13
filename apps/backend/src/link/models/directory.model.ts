import { Column, Model, Table } from "sequelize-typescript";

@Table
export class Directory extends Model {
  @Column
  name: string

  @Column
  author: number

  @Column
  parent: number
}
