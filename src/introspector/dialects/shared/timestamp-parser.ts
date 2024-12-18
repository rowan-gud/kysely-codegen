export const enum TimestampParserKind {
  STRING = 'string',
  TIMESTAMP = 'timestamp',
}

export type TimestampParser<TimestampKeys extends string = 'timestamp'> =
  | TimestampParserKind
  | {
      [K in TimestampKeys]?: TimestampParserKind;
    };

export const DEFAULT_TIMESTAMP_PARSER_KIND = TimestampParserKind.TIMESTAMP;
