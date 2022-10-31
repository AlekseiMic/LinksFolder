import { IRepository } from './i.repository';
import { Session } from 'models';

export const SESSION_REPOSITORY=Symbol('SESSION_REPOSITORY');

export interface ISessionRepository extends IRepository<Session> {}
