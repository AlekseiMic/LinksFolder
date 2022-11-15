import { AbstractParser, Li } from './AbstractParser';

type FirefoxBookmarkLike = {
  typeCode?: 1 | 2;
  title?: string;
  type?: string;
  uri?: string;
  children?: FirefoxBookmarkLike[];
};

function hasProp<P extends string, O extends object>(
  prop: P,
  obj: O
): obj is O & Record<P, unknown> {
  return prop in obj;
}

export class FirefoxParser extends AbstractParser {
  static override canParse(file: unknown): file is FirefoxBookmarkLike {
    return (
      typeof file === 'object' &&
      file !== null &&
      hasProp('type', file) &&
      FirefoxParser.isValidType(file)
    );
  }

  private static isValidType(file: any): file is FirefoxBookmarkLike {
    return file.type === 'text/x-moz-place-container';
  }

  static override parse(file: unknown) {
    if (!FirefoxParser.canParse(file)) throw new Error('WRONG_FILE_TYPE');
    const result = FirefoxParser.parseObj(file);
    // if (result && result.links.length === 0 && result.name === 'Unknown') {
    //   return result.directories;
    // }
    return result ? [result] : null;
  }

  private static parseObj(obj: FirefoxBookmarkLike) {
    const directories: Li['directories'] = [];
    const links: Li['links'] = [];

    if (!obj.children) return null;

    obj.children.forEach((c) => {
      if (c.typeCode === 2 && obj.children) {
        const res = FirefoxParser.parseObj(c);
        if (res) directories.push(res);
      }
      if (c.typeCode === 1 && c.uri) {
        links.push({ text: c.title ?? c.uri, url: c.uri });
      }
    });

    if (directories.length === 0 && links.length === 0) return null;

    return {
      id: null,
      name: obj['title'] || 'Unknown',
      directories,
      links,
    };
  }
}
