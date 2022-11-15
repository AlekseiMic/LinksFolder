import { AbstractParserType } from './AbstractParser';
import { FirefoxParser } from './firefox-json-parser';

const parsers: AbstractParserType[] = [FirefoxParser];

export const getParser = (file: unknown) => {
  return parsers.find((p) => p.canParse(file));
};
