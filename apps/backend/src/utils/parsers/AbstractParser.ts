import { Link } from 'models';

export type Li = {
  id: number | null;
  name: string;
  directories: Li[];
  links: Pick<Link, 'text' | 'url'>[];
};
export abstract class AbstractParser {
  static canParse(file: unknown): boolean {
    throw new Error('Method not implemented');
  }

  static parse(file: unknown): Li[] | null {
    throw new Error('Method not implemented');
  }
}

export type AbstractParserType = typeof AbstractParser;
