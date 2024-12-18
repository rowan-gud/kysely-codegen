import { MysqlDialect as KyselyMysqlDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import type { DateParser } from '../shared/date-parser';
import {
  DateParserKind,
  DEFAULT_DATE_PARSER_KIND,
} from '../shared/date-parser';
import {
  DEFAULT_TIMESTAMP_PARSER_KIND,
  TimestampParserKind,
  type TimestampParser,
} from '../shared/timestamp-parser';
import { MysqlIntrospector } from './mysql-introspector';

type MysqlDialectOptions = {
  dateParser?: DateParser<'date' | 'datetime'>;
  timestampParser?: TimestampParser;
};

export class MysqlIntrospectorDialect extends IntrospectorDialect {
  protected readonly options: MysqlDialectOptions;
  override readonly introspector: MysqlIntrospector;

  constructor(options?: MysqlDialectOptions) {
    super();

    this.introspector = new MysqlIntrospector();

    this.options = {
      dateParser: options?.dateParser ?? DEFAULT_DATE_PARSER_KIND,
      timestampParser:
        options?.timestampParser ?? DEFAULT_TIMESTAMP_PARSER_KIND,
    };
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { createPool } = await import('mysql2');

    const dateStrings: ('DATE' | 'DATETIME' | 'TIMESTAMP')[] = [];

    if (typeof this.options.dateParser === 'string') {
      if (this.options.dateParser === DateParserKind.STRING) {
        dateStrings.push('DATE', 'DATETIME');
      }
    } else if (this.options.dateParser !== undefined) {
      if (this.options.dateParser.date === DateParserKind.STRING) {
        dateStrings.push('DATE');
      }

      if (this.options.dateParser.datetime === DateParserKind.STRING) {
        dateStrings.push('DATETIME');
      }
    }

    if (typeof this.options.timestampParser === 'string') {
      if (this.options.timestampParser === 'string') {
        dateStrings.push('TIMESTAMP');
      }
    } else if (
      this.options.timestampParser !== undefined &&
      this.options.timestampParser.timestamp === TimestampParserKind.STRING
    ) {
      dateStrings.push('TIMESTAMP');
    }

    return new KyselyMysqlDialect({
      pool: createPool({
        uri: options.connectionString,
        dateStrings,
      }),
    });
  }
}
