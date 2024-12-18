import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import type { DateParser } from '../shared/date-parser';
import {
  DateParserKind,
  DEFAULT_DATE_PARSER_KIND,
} from '../shared/date-parser';
import {
  DEFAULT_TIMESTAMP_PARSER_KIND,
  TimestampParser,
} from '../shared/timestamp-parser';
import { DEFAULT_NUMERIC_PARSER, NumericParser } from './numeric-parser';
import { PostgresIntrospector } from './postgres-introspector';

type PostgresDialectOptions = {
  dateParser?: DateParser;
  defaultSchemas?: string[];
  domains?: boolean;
  numericParser?: NumericParser;
  partitions?: boolean;
  timestampParser?: TimestampParser<'timestamp' | 'timestamptz'>;
};

export class PostgresIntrospectorDialect extends IntrospectorDialect {
  protected readonly options: PostgresDialectOptions;
  override readonly introspector: PostgresIntrospector;

  constructor(options?: PostgresDialectOptions) {
    super();

    this.introspector = new PostgresIntrospector({
      defaultSchemas: options?.defaultSchemas,
      domains: options?.domains,
      partitions: options?.partitions,
    });
    this.options = {
      dateParser: options?.dateParser ?? DEFAULT_DATE_PARSER_KIND,
      defaultSchemas: options?.defaultSchemas,
      domains: options?.domains ?? true,
      numericParser: options?.numericParser ?? DEFAULT_NUMERIC_PARSER,
      timestampParser:
        options?.timestampParser ?? DEFAULT_TIMESTAMP_PARSER_KIND,
    };
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { default: pg } = await import('pg');

    if (typeof this.options.dateParser === 'string') {
      const [setDateParser, dateParser] = this.#parseDateParserKind(
        this.options.dateParser,
      );

      if (setDateParser) {
        pg.types.setTypeParser(1082, dateParser);
      }
    } else if (this.options.dateParser !== undefined) {
      const [setDateParser, dateParser] = this.#parseDateParserKind(
        this.options.dateParser.date,
      );

      if (setDateParser) {
        pg.types.setTypeParser(1082, dateParser);
      }
    }

    if (this.options.numericParser === NumericParser.NUMBER) {
      pg.types.setTypeParser(1700, Number);
    } else if (this.options.numericParser === NumericParser.NUMBER_OR_STRING) {
      pg.types.setTypeParser(1700, (value) => {
        const number = Number(value);
        return number > Number.MAX_SAFE_INTEGER ||
          number < Number.MIN_SAFE_INTEGER
          ? value
          : number;
      });
    }

    return new KyselyPostgresDialect({
      pool: new pg.Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }

  #parseDateParserKind(
    dateParserKind: DateParserKind | undefined,
  ): [set: boolean, parser: (value: string) => unknown] {
    if (dateParserKind === DateParserKind.STRING) {
      return [true, (date) => date];
    }

    return [false, () => {}];
  }
}
