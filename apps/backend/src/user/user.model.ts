import { AllowNull, Column, Model, Table } from 'sequelize-typescript';
import { hash, compare } from 'bcrypt';

export class AuthUser {
  id: number;
}

@Table
export class User extends Model {
  @AllowNull(false)
  @Column({ type: 'varchar(50)', unique: 'idx_username' })
  username: string;

  @AllowNull(false)
  @Column({ type: 'varchar(72)' })
  password_hash: string;

  async setPassword(password: string) {
    this.password_hash = await hash(password, 10);
  }

  async checkPassword(password: string): Promise<boolean> {
    return compare(password, this.password_hash);
  }
}
