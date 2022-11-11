import { Link } from 'models/link.entity';

export type LinkObj = {
  userId: undefined | null | number;
  directory: number;
  id: number;
  url: string;
  text?: string;
};

export class LinkPresenter {
  static from(link: Link): LinkObj {
    return {
      userId: link.createdBy,
      directory: link.directoryId,
      id: link.id,
      url: link.url,
      text: link.text,
    };
  }
}
