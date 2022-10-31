import { IRepository } from './i.repository';
import { Directory } from 'models';

export const DIRECTORY_REPOSITORY=Symbol('DIRECTORY_REPOSITORY');

export interface IDirectoryRepository extends IRepository<Directory> {}
