import { IRepository } from './i.repository';
import { User } from 'models';

export const USER_REPOSITORY=Symbol('USER_REPOSITORY');

export interface IUserRepository extends IRepository<User> {}
