import { DirectoryAccess } from 'models';

export type Code = {
  id: number;
  code?: string;
  owned: boolean;
  username?: string;
  expiresIn: Date;
  updatedAt: Date;
};
export class CodePresenter {
  static from(access: DirectoryAccess, userId?: number, token?: string): Code {
    return {
      id: access.id,
      code: access.code,
      owned: (token && token === access.token) || access.createdBy === userId,
      username: access.user?.username,
      expiresIn: access.expiresIn,
      updatedAt: access.updatedAt,
    };
  }
}
