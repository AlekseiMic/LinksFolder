import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "user/user.model";

@Table
export class Link extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number

  @BelongsTo(() => User)
  user: User

  @Column
  url: string

  @Column
  directory: number

  @Column
  text: string

}
