import { IRepository } from './i.repository';
import { Link } from 'models';

export const LINK_REPOSITORY=Symbol('LINK_REPOSITORY');

export interface ILinkRepository extends IRepository<Link> {
  sortLinksInDirectory(dir: number): Promise<[unknown[], unknown]>
}
