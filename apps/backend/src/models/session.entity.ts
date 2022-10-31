import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({tableName: 'Sessions'})
export class Session extends Model<Session> {
  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User)
  user: User;

  @Column({ unique: 'idx_refresh-token', type: 'varchar(100)' })
  token: string;

  @Column
  ip: string;

  @Column
  ua: string;
}
