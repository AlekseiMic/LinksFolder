import { Directory } from 'models';
import { Code } from './CodePresenter';
import { LinkObj } from './LinkPresenter';

export type DirectoryObj = {
  id: number;
  parent?: number;
  editable: boolean;
  author?: number;
  isGuest?: boolean;
  owned: boolean;
  name?: string;
  sublists?: number[];
  codes: Code[];
  links: LinkObj[];
};

export class DirectoryPresenter {
  static from(
    directory: Directory,
    parent?: number,
    userId?: number,
    sublists?: number[],
    codes?: Code[],
    links?: LinkObj[]
  ) {
    return {
      id: directory.id,
      parent,
      editable: directory.createdBy === userId,
      author: directory.createdBy,
      isGuest: !userId,
      owned: directory.createdBy === userId,
      name: directory.name,
      sublists: sublists || [],
      codes: codes || [],
      links: links || [],
    };
  }
}
