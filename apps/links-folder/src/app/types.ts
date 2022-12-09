export type SimpleLink = {
  url: string;
  text: string;
};

export type Link = SimpleLink & {
  directory: number;
  id: number;
};

export type List = {
  id: number;
  parent?: number;
  editable: boolean;
  author?: number;
  isGuest: boolean | undefined;
  owned: boolean;
  name?: string;
  codes: AccessRule[];
  sublists?: number[];
  links: Link[];
};

export type Variant = {
  value: number;
  label: string;
};

export type AllLists = null | Record<number | string, List>;

export type SimpleAccessRule = {
  code?: string | undefined;
  username?: string | undefined | null;
  expiresIn?: Date;
};

export type AccessRule = SimpleAccessRule & {
  id: number;
  owned: boolean;
  updatedAt: Date;
  expiresIn: Date;
  extend?: number;
};
