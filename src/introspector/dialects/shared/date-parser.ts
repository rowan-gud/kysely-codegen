export const enum DateParserKind {
  STRING = 'string',
  TIMESTAMP = 'timestamp',
}

export type DateParser<DateKeys extends string = 'date'> =
  | DateParserKind
  | {
      [K in DateKeys]?: DateParserKind;
    };

export const DEFAULT_DATE_PARSER_KIND = DateParserKind.TIMESTAMP;
