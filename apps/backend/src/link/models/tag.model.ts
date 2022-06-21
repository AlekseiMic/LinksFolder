import { Column, Model, Table } from "sequelize-typescript";

@Table
export class Tag extends Model {
  @Column
  name: string
}
