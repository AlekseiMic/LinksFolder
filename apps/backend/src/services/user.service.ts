import { Inject, Injectable } from '@nestjs/common';
import { User } from 'models';
import { USER_REPOSITORY, IUserRepository } from 'repositories';

@Injectable()
export class UserService {
  @Inject(USER_REPOSITORY) private readonly repo: IUserRepository;

  async create(username: string, password: string): Promise<User> {
    const user = new User();
    user.username = username;
    await user.setPassword(password);
    await this.repo.save(user);
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }
}
