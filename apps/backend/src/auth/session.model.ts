import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from '../user/user.model';

@Table
export class Session extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number

  @BelongsTo(() => User)
  user: User

  @Column
  token: string

  @Column
  ip: string

  @Column
  ua: string
}
