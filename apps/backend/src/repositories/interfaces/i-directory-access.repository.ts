import { IRepository } from './i.repository';
import { DirectoryAccess } from 'models';

export const DIRECTORY_ACCESS_REPOSITORY=Symbol('DIRECTORY_ACCESS_REPOSITORY');

export interface IDirectoryAccessRepository extends IRepository<DirectoryAccess> {}
