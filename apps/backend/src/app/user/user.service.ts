import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";


@Injectable()
export class UserService {
  constructor( @InjectModel(User) private readonly userModel: typeof User) {}

  async create(username: string, password: string): Promise<User> {
    const user = new User();
    user.username = username;
    await user.setPassword(password);
    try {
      await user.save();
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError')
        {
          throw new Error('NotUnique');
        }
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.userModel.findOne({ where: { username }});
    return result;
  }

  async save(user: User): Promise<User|false> {
    return false;
  }
}
