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
  codes: {
    id: number;
    code: string;
    owned: boolean;
    username?: string;
    expiresIn: Date;
    updatedAt: Date;
  }[];
  sublists?: number[];
  links: Link[];
};

export type Option = {
  value: string | number;
  label: string;
};
